#!/usr/bin/env python3
"""Build the deterministic Kubernetes Beyond YAML Anki package.

This script deliberately does not install dependencies. Run it with the
project-local virtual environment after genanki has been approved and installed.
"""

from __future__ import annotations

import html
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any


DECK_DIR = Path(__file__).resolve().parent
CARDS_PATH = DECK_DIR / "cards.json"
COMPONENTS_PATH = DECK_DIR / "components.json"
OUTPUT_PATH = DECK_DIR / "kubernetes-beyond-yaml.apkg"
PARENT_DECK_NAME = "Kubernetes Beyond YAML — Interview Prep"

# Stable IDs are intentionally literal. Changing any of them would make Anki
# treat the corresponding model or deck as a different object on re-import.
BASIC_MODEL_ID = 2_057_080_501
CLOZE_MODEL_ID = 2_057_080_502
PARENT_DECK_ID = 2_057_081_000
DECK_IDS = {
    # IDs for surviving semantic groups stay stable across the v1 -> v2 rename;
    # new groups use previously unused IDs rather than repurposing retired decks.
    "01 Control Plane": 2_057_081_006,
    "02 API Path and Security": 2_057_081_008,
    "03 Reconciliation": 2_057_081_001,
    "04 Workloads and Disruption": 2_057_081_009,
    "05 CRDs and Operators": 2_057_081_010,
    "06 Scheduling": 2_057_081_011,
    "07 Node Runtime": 2_057_081_012,
    "08 Networking": 2_057_081_004,
    "09 DNS": 2_057_081_005,
    "10 Storage": 2_057_081_013,
    "11 HA and etcd": 2_057_081_014,
    "12 Scalability and APF": 2_057_081_015,
}
EXPECTED_COMPONENT_COUNT = 60
EXPECTED_CARD_COUNT = 120
EXPECTED_CARDS_PER_COMPONENT = 2

ALLOWED_TYPES = {
    "plain_phrase_to_name",
    "definition_to_name",
    "name_to_definition",
    "discrimination",
    "cloze",
    "name_to_api",
    "api_to_name",
}
IMAGE_SIDES = {"front", "back", "both", "none"}
REQUIRED_CARD_FIELDS = {
    "id",
    "component",
    "platform",
    "type",
    "front",
    "back",
    "image",
    "image_side",
    "tags",
}
NAME_ANSWER_TYPES = {
    "plain_phrase_to_name",
    "definition_to_name",
    "api_to_name",
}
UNDERSTANDING_TYPES = {"name_to_definition", "discrimination"}

CSS = r"""
.card {
  box-sizing: border-box;
  max-width: 48rem;
  margin: 0 auto;
  padding: 1.25rem;
  background: #f8fafc;
  color: #172033;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 20px;
  line-height: 1.5;
  text-align: left;
}
.prompt, .answer, .extra { overflow-wrap: anywhere; }
.answer { margin-top: 1rem; }
.extra { margin-top: 1rem; color: #526078; font-size: 0.88em; }
.divider { border: 0; border-top: 1px solid #cad2df; margin: 1rem 0; }
.media { display: none; margin-top: 1rem; text-align: center; }
.question[data-side="front"] .media,
.question[data-side="both"] .media,
.answer-side[data-side="back"] .media,
.answer-side[data-side="both"] .media { display: block; }
.media img { max-width: 100%; max-height: 28rem; object-fit: contain; }
code { background: #e8edf4; border-radius: 0.25rem; padding: 0.08em 0.3em; }
@media (prefers-color-scheme: dark) {
  .card { background: #111827; color: #e5e7eb; }
  .extra { color: #aab4c5; }
  .divider { border-top-color: #384459; }
  code { background: #253148; }
}
.nightMode .card { background: #111827; color: #e5e7eb; }
.nightMode .extra { color: #aab4c5; }
.nightMode .divider { border-top-color: #384459; }
.nightMode code { background: #253148; }
""".strip()

BASIC_QFMT = """<div class="question" data-side="{{ImageSide}}">
  <div class="prompt">{{Front}}</div>
  <div class="media">{{Image}}</div>
</div>"""

BASIC_AFMT = """<div class="question-recap">
  <div class="prompt">{{Front}}</div>
</div>
<hr class="divider">
<div class="answer-side" data-side="{{ImageSide}}">
  <div class="answer">{{Back}}</div>
  <div class="media">{{Image}}</div>
  <div class="extra">{{Extra}}</div>
</div>"""

CLOZE_QFMT = """<div class="question" data-side="{{ImageSide}}">
  <div class="prompt">{{cloze:Front}}</div>
  <div class="media">{{Image}}</div>
</div>"""

CLOZE_AFMT = """<div class="answer-side" data-side="{{ImageSide}}">
  <div class="answer">{{cloze:Front}}</div>
  <div class="media">{{Image}}</div>
  <div class="extra">{{Back}}</div>
</div>"""


class ContractError(Exception):
    """Raised when one or more input contract checks fail."""


def load_json(path: Path, label: str) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ContractError(f"{label} not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise ContractError(
            f"{label} is not valid JSON: line {exc.lineno}, column {exc.colno}: {exc.msg}"
        ) from exc


def normalize_visible_text(value: str, *, hide_cloze_answers: bool = False) -> str:
    if hide_cloze_answers:
        value = re.sub(r"\{\{c\d+::.*?(?:::[^{}]*?)?\}\}", " ", value, flags=re.I | re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value).casefold()
    return " ".join(re.findall(r"[\w]+", value, flags=re.UNICODE))


def contains_term(text: str, term: str) -> bool:
    normalized_term = normalize_visible_text(term)
    if not normalized_term:
        return False
    return re.search(rf"(?<!\w){re.escape(normalized_term)}(?!\w)", text) is not None


def group_tag(group: str) -> str:
    """Return the Anki-safe tag representation of a subdeck group."""
    return re.sub(r"[^a-z0-9]+", "-", group.casefold()).strip("-")


def validate_components(raw: Any) -> tuple[dict[str, dict[str, Any]], list[str]]:
    errors: list[str] = []
    components: dict[str, dict[str, Any]] = {}
    if not isinstance(raw, list):
        return {}, ["components.json must contain a JSON array"]
    if len(raw) != EXPECTED_COMPONENT_COUNT:
        errors.append(
            f"components.json must contain exactly {EXPECTED_COMPONENT_COUNT} components; "
            f"found {len(raw)}"
        )

    required = {"slug", "group", "name", "aliases", "keywords", "definition", "source"}
    for index, component in enumerate(raw):
        where = f"components.json[{index}]"
        if not isinstance(component, dict):
            errors.append(f"{where} must be an object")
            continue
        missing = sorted(required - component.keys())
        unknown = sorted(component.keys() - required)
        if missing:
            errors.append(f"{where} is missing fields: {', '.join(missing)}")
        if unknown:
            errors.append(f"{where} has unknown fields: {', '.join(unknown)}")
        slug = component.get("slug")
        if not isinstance(slug, str) or not slug.strip():
            errors.append(f"{where}.slug must be a non-empty string")
            continue
        if slug in components:
            errors.append(f"duplicate component slug: {slug}")
        else:
            components[slug] = component
        group = component.get("group")
        if group not in DECK_IDS:
            errors.append(f"{where}.group is unknown: {group!r}")
        for field in ("name", "definition", "source"):
            if not isinstance(component.get(field), str) or not component[field].strip():
                errors.append(f"{where}.{field} must be a non-empty string")
        for field in ("aliases", "keywords"):
            value = component.get(field)
            if not isinstance(value, list) or any(
                not isinstance(item, str) or not item.strip() for item in value
            ):
                errors.append(f"{where}.{field} must be an array of non-empty strings")

    group_counts = Counter(
        component.get("group") for component in raw if isinstance(component, dict)
    )
    for group in DECK_IDS:
        if group_counts[group] != 5:
            errors.append(
                f"component group {group!r} must contain exactly 5 components; "
                f"found {group_counts[group]}"
            )
    return components, errors


def validate_cards(
    raw: Any, components: dict[str, dict[str, Any]]
) -> tuple[list[dict[str, Any]], list[Path], list[str]]:
    errors: list[str] = []
    referenced_media: dict[str, Path] = {}
    valid_cards: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    component_card_counts: Counter[str] = Counter()
    component_understanding_counts: Counter[str] = Counter()
    if not isinstance(raw, list):
        return [], [], ["cards.json must contain a flat JSON array"]
    if len(raw) != EXPECTED_CARD_COUNT:
        errors.append(
            f"cards.json must contain exactly {EXPECTED_CARD_COUNT} cards; found {len(raw)}"
        )

    for index, card in enumerate(raw):
        where = f"cards.json[{index}]"
        if not isinstance(card, dict):
            errors.append(f"{where} must be an object")
            continue

        missing = sorted(REQUIRED_CARD_FIELDS - card.keys())
        unknown = sorted(card.keys() - REQUIRED_CARD_FIELDS)
        if missing:
            errors.append(f"{where} is missing fields: {', '.join(missing)}")
        if unknown:
            errors.append(f"{where} has unknown fields: {', '.join(unknown)}")

        for field in ("id", "component", "platform", "type", "front", "back", "image_side"):
            value = card.get(field)
            if not isinstance(value, str) or not value.strip():
                errors.append(f"{where}.{field} must be a non-empty string")

        card_id = card.get("id")
        component_slug = card.get("component")
        platform = card.get("platform")
        card_type = card.get("type")
        image_side = card.get("image_side")

        if isinstance(card_id, str):
            if card_id in seen_ids:
                errors.append(f"duplicate card id: {card_id}")
            seen_ids.add(card_id)
            if isinstance(component_slug, str) and not card_id.startswith(component_slug + "::"):
                errors.append(f"{where}.id must start with {component_slug!r} followed by '::'")
            if card_id.endswith("::"):
                errors.append(f"{where}.id must include a purpose after '::'")

        component = components.get(component_slug) if isinstance(component_slug, str) else None
        if component is None and isinstance(component_slug, str):
            errors.append(f"{where}.component is unknown: {component_slug!r}")
        elif component is not None and platform != component.get("group"):
            errors.append(
                f"{where}.platform {platform!r} does not match component group "
                f"{component.get('group')!r}"
            )
        if component is not None:
            component_card_counts[component_slug] += 1
            if card_type in UNDERSTANDING_TYPES:
                component_understanding_counts[component_slug] += 1

        if card_type not in ALLOWED_TYPES:
            errors.append(f"{where}.type is unknown: {card_type!r}")
        if platform not in DECK_IDS:
            errors.append(f"{where}.platform is unknown: {platform!r}")
        if image_side not in IMAGE_SIDES:
            errors.append(f"{where}.image_side is unknown: {image_side!r}")

        tags = card.get("tags")
        if not isinstance(tags, list) or not tags:
            errors.append(f"{where}.tags must be a non-empty array")
        elif any(not isinstance(tag, str) or not tag.strip() for tag in tags):
            errors.append(f"{where}.tags must contain only non-empty strings")
        else:
            if len(set(tags)) != len(tags):
                errors.append(f"{where}.tags contains duplicates")
            expected_mode = "understanding" if card_type in UNDERSTANDING_TYPES else "recall"
            modes = {"recall", "understanding"} & set(tags)
            if modes != {expected_mode}:
                errors.append(f"{where}.tags must include only cognitive mode {expected_mode!r}")
            if isinstance(platform, str) and platform in DECK_IDS:
                expected_group_tag = group_tag(platform)
                if expected_group_tag not in tags:
                    errors.append(
                        f"{where}.tags must include Anki-safe group tag {expected_group_tag!r}"
                    )
            marker = {
                "discrimination": "discrimination",
                "cloze": "cloze",
                "name_to_api": "code",
                "api_to_name": "code",
            }.get(card_type)
            if marker and marker not in tags:
                errors.append(f"{where}.tags must include {marker!r} for type {card_type!r}")

        image = card.get("image")
        if image is None:
            if image_side != "none":
                errors.append(f"{where}.image_side must be 'none' when image is null")
        elif not isinstance(image, str) or not image.strip():
            errors.append(f"{where}.image must be null or a non-empty relative path")
        else:
            relative = Path(image)
            if relative.is_absolute() or ".." in relative.parts:
                errors.append(f"{where}.image must be a safe path relative to the deck directory")
            else:
                resolved = (DECK_DIR / relative).resolve()
                try:
                    resolved.relative_to(DECK_DIR)
                except ValueError:
                    errors.append(f"{where}.image escapes the deck directory: {image!r}")
                else:
                    if not resolved.is_file():
                        errors.append(f"{where}.image is missing: {image!r}")
                    basename = resolved.name
                    collision = referenced_media.get(basename)
                    if collision is not None and collision != resolved:
                        errors.append(
                            f"media basename collision for {basename!r}: {collision} and {resolved}"
                        )
                    else:
                        referenced_media[basename] = resolved
            if image_side == "none":
                errors.append(f"{where}.image_side cannot be 'none' when image is present")

        front = card.get("front")
        if card_type == "cloze" and isinstance(front, str):
            if re.search(r"\{\{c\d+::.+?\}\}", front, flags=re.I | re.S) is None:
                errors.append(f"{where}.front must contain an Anki cloze deletion")

        if component is not None and isinstance(front, str):
            should_check = card_type in NAME_ANSWER_TYPES or card_type == "cloze"
            if should_check:
                visible = normalize_visible_text(front, hide_cloze_answers=card_type == "cloze")
                terms = [component.get("name", ""), *component.get("aliases", [])]
                leaks = sorted({term for term in terms if contains_term(visible, term)})
                if leaks:
                    errors.append(
                        f"{where}.front leaks the answer term(s): {', '.join(repr(x) for x in leaks)}"
                    )

        if not missing and not unknown:
            valid_cards.append(card)

    for component_slug in components:
        card_count = component_card_counts[component_slug]
        if card_count != EXPECTED_CARDS_PER_COMPONENT:
            errors.append(
                f"component {component_slug!r} must have exactly "
                f"{EXPECTED_CARDS_PER_COMPONENT} cards; found {card_count}"
            )
        if component_understanding_counts[component_slug] < 1:
            errors.append(f"component {component_slug!r} must have an understanding card")
    return valid_cards, sorted(referenced_media.values(), key=lambda path: path.name), errors


def make_models(genanki: Any) -> tuple[Any, Any]:
    fields = [{"name": name} for name in ("Front", "Back", "Image", "ImageSide", "Extra")]
    basic = genanki.Model(
        BASIC_MODEL_ID,
        "Kubernetes Beyond YAML Basic",
        fields=fields,
        templates=[{"name": "Card 1", "qfmt": BASIC_QFMT, "afmt": BASIC_AFMT}],
        css=CSS,
        sort_field_index=0,
    )
    cloze = genanki.Model(
        CLOZE_MODEL_ID,
        "Kubernetes Beyond YAML Cloze",
        fields=fields,
        templates=[{"name": "Cloze", "qfmt": CLOZE_QFMT, "afmt": CLOZE_AFMT}],
        css=CSS,
        model_type=genanki.Model.CLOZE,
        sort_field_index=0,
    )
    return basic, cloze


def image_html(card: dict[str, Any]) -> str:
    image = card["image"]
    if image is None:
        return ""
    return f'<img src="{html.escape(Path(image).name, quote=True)}">'


def build(cards: list[dict[str, Any]], media: list[Path], genanki: Any) -> None:
    basic_model, cloze_model = make_models(genanki)
    parent_deck = genanki.Deck(PARENT_DECK_ID, PARENT_DECK_NAME)
    decks = {
        group: genanki.Deck(deck_id, f"{PARENT_DECK_NAME}::{group}")
        for group, deck_id in DECK_IDS.items()
    }

    model_counts: Counter[str] = Counter()
    deck_counts: Counter[str] = Counter()
    for card in sorted(cards, key=lambda item: item["id"]):
        is_cloze = card["type"] == "cloze"
        model = cloze_model if is_cloze else basic_model
        model_name = "Cloze" if is_cloze else "Basic"
        note = genanki.Note(
            model=model,
            fields=[card["front"], card["back"], image_html(card), card["image_side"], ""],
            tags=card["tags"],
            guid=genanki.guid_for(card["id"]),
        )
        decks[card["platform"]].add_note(note)
        model_counts[model_name] += 1
        deck_counts[card["platform"]] += 1

    package = genanki.Package([parent_deck, *(decks[group] for group in DECK_IDS)])
    package.media_files = [str(path) for path in media]
    package.write_to_file(str(OUTPUT_PATH))

    print(f"Wrote {OUTPUT_PATH}")
    print(f"Total notes: {len(cards)}")
    print("Per model:")
    for model_name in ("Basic", "Cloze"):
        print(f"  {model_name}: {model_counts[model_name]}")
    print("Per deck:")
    for group in DECK_IDS:
        print(f"  {group}: {deck_counts[group]}")
    warnings: list[str] = []
    media_dir = DECK_DIR / "media"
    if media_dir.is_dir():
        referenced = {path.resolve() for path in media}
        unreferenced = sorted(
            path.name for path in media_dir.iterdir() if path.is_file() and path.resolve() not in referenced
        )
        if unreferenced:
            warnings.append("unreferenced media not packaged: " + ", ".join(unreferenced))
    print("Warnings:")
    if warnings:
        for warning in warnings:
            print(f"  - {warning}")
    else:
        print("  none")


def main() -> int:
    try:
        components_raw = load_json(COMPONENTS_PATH, "components.json")
        components, component_errors = validate_components(components_raw)
        cards_raw = load_json(CARDS_PATH, "cards.json")
        cards, media, card_errors = validate_cards(cards_raw, components)
    except ContractError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    errors = [*component_errors, *card_errors]
    if errors:
        print(f"Validation failed with {len(errors)} error(s):", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    try:
        import genanki
    except ImportError:
        print(
            "ERROR: genanki is not installed. Install it in deck/.venv after receiving "
            "approval, then run deck/.venv/bin/python deck/build_deck.py.",
            file=sys.stderr,
        )
        return 2

    build(cards, media, genanki)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
