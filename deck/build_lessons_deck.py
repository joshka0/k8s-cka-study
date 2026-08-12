#!/usr/bin/env python3
"""Build the Kubernetes Beyond YAML *Lessons* Anki package.

Companion to build_deck.py. That script packages the 60-component vocabulary
deck; this one packages the cards derived from the interactive lesson path.
The two use disjoint deterministic ID blocks so both can be imported side by
side and updated independently.

This script deliberately does not install dependencies. Run it with the
project-local virtual environment:

    deck/.venv/bin/python deck/build_lessons_deck.py
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
CARDS_PATH = DECK_DIR / "lesson-cards.json"
def _content_paths() -> list[Path]:
    """Every course content file, discovered rather than listed.

    New units arrive as new assets/*content*.js files. Hard-coding the list
    meant a whole tranche of units silently had no cards and no validation.
    content.js is loaded first so base units keep their numbering.
    """
    assets = DECK_DIR.parent / "assets"
    found = sorted(assets.glob("*content*.js"))
    base = assets / "content.js"
    return ([base] if base.exists() else []) + [p for p in found if p != base]


CONTENT_PATHS = _content_paths()
OUTPUT_PATH = DECK_DIR / "kubernetes-beyond-yaml-lessons.apkg"
PARENT_DECK_NAME = "Kubernetes Beyond YAML — Lessons"

# Disjoint from build_deck.py's 2_057_08[01]_* block.
BASIC_MODEL_ID = 2_057_082_501
CLOZE_MODEL_ID = 2_057_082_502
PARENT_DECK_ID = 2_057_082_000
UNIT_DECK_ID_BASE = 2_057_082_000  # + unit number

ALLOWED_TYPES = {
    "plain_phrase_to_name",
    "definition_to_name",
    "name_to_definition",
    "discrimination",
    "cloze",
    "name_to_api",
    "api_to_name",
}
UNDERSTANDING_TYPES = {"name_to_definition", "discrimination"}
NAME_ANSWER_TYPES = {"plain_phrase_to_name", "definition_to_name", "api_to_name"}
TYPE_MARKERS = {
    "discrimination": "discrimination",
    "cloze": "cloze",
    "name_to_api": "code",
    "api_to_name": "code",
}
REQUIRED_FIELDS = {"id", "lesson", "unit", "type", "front", "back", "tags"}
OPTIONAL_FIELDS = {"answer", "extra"}

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
.answer ul, .answer ol { margin: 0.5rem 0 0; padding-left: 1.2rem; }
.answer li { margin: 0.25rem 0; }
.extra { margin-top: 1rem; color: #526078; font-size: 0.82em; }
.extra a { color: #2456bd; text-decoration: none; }
.extra a + a { margin-left: 0.9rem; }
.divider { border: 0; border-top: 1px solid #cad2df; margin: 1rem 0; }
.kicker {
  color: #5d677b; font-size: 0.62em; font-weight: 800;
  letter-spacing: 0.13em; text-transform: uppercase; margin-bottom: 0.5rem;
}
code { background: #e8edf4; border-radius: 0.25rem; padding: 0.08em 0.3em; }
cloze { font-weight: 700; color: #2456bd; }
@media (prefers-color-scheme: dark) {
  .card { background: #111827; color: #e5e7eb; }
  .extra { color: #aab4c5; }
  .extra a { color: #8ab4ff; }
  .divider { border-top-color: #384459; }
  .kicker { color: #97a3b8; }
  code { background: #253148; }
  cloze { color: #8ab4ff; }
}
.nightMode .card { background: #111827; color: #e5e7eb; }
.nightMode .extra { color: #aab4c5; }
.nightMode .extra a { color: #8ab4ff; }
.nightMode .divider { border-top-color: #384459; }
.nightMode .kicker { color: #97a3b8; }
.nightMode code { background: #253148; }
.nightMode cloze { color: #8ab4ff; }
""".strip()

BASIC_QFMT = """<div class="question">
  <div class="kicker">{{Kicker}}</div>
  <div class="prompt">{{Front}}</div>
</div>"""

BASIC_AFMT = """<div class="question-recap">
  <div class="prompt">{{Front}}</div>
</div>
<hr class="divider">
<div class="answer-side">
  <div class="answer">{{Back}}</div>
  <div class="extra">{{Extra}}</div>
</div>"""

CLOZE_QFMT = """<div class="question">
  <div class="kicker">{{Kicker}}</div>
  <div class="prompt">{{cloze:Front}}</div>
</div>"""

CLOZE_AFMT = """<div class="answer-side">
  <div class="answer">{{cloze:Front}}</div>
  <hr class="divider">
  <div class="answer">{{Back}}</div>
  <div class="extra">{{Extra}}</div>
</div>"""

KICKERS = {
    "plain_phrase_to_name": "Name it",
    "definition_to_name": "Name it",
    "api_to_name": "Name it",
    "name_to_api": "Give the exact token",
    "name_to_definition": "Explain it",
    "discrimination": "Discriminate",
    "cloze": "Complete it",
}


class ContractError(Exception):
    """Raised when an input cannot be read at all."""


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")


def load_units() -> tuple[dict[str, str], dict[str, str]]:
    """Derive the unit list and lesson->unit map from the course content.

    The course content files are the source of truth for unit numbering and
    titles, so the deck tree cannot drift from the course it reinforces.
    """
    try:
        source = "\n".join(path.read_text(encoding="utf-8") for path in CONTENT_PATHS)
    except FileNotFoundError as exc:
        raise ContractError(f"course content not found: {exc.filename}") from exc

    units: dict[str, str] = {}
    # Content files differ in whether `title` sits on its own line, so match
    # any whitespace rather than requiring a newline.
    pattern = re.compile(
        r"id:\s*'(u\d+)',\s*n:\s*(\d+),\s*ref:\s*'m\d+',\s*title:\s*'([^']+)'"
    )
    for unit_id, number, title in pattern.findall(source):
        units[unit_id] = f"{int(number):02d} {title}"
    # Units grow over time, so assert shape rather than a fixed count: the ids
    # must be contiguous from u1 with no gaps. Hard-coding 20 meant a new
    # content file failed the build instead of extending the deck.
    if not units:
        raise ContractError("parsed no units from the course content")
    numbers = sorted(int(uid[1:]) for uid in units)
    expected_ids = {f"u{n}" for n in range(1, numbers[-1] + 1)}
    if set(units) != expected_ids:
        missing = sorted(expected_ids - set(units))
        raise ContractError(
            f"units must be contiguous from u1; missing {', '.join(missing)}"
        )

    lessons: dict[str, str] = {}
    for lesson_id in re.findall(r"id:\s*'(u\d+l\d+)'", source):
        unit_id = lesson_id.split("l")[0]
        if unit_id not in units:
            raise ContractError(f"lesson {lesson_id} refers to unknown unit {unit_id}")
        lessons[lesson_id] = units[unit_id]
    if not lessons:
        raise ContractError("parsed no lessons from content.js")
    return units, lessons


def strip_markup(value: str, *, hide_cloze_answers: bool = False) -> str:
    if hide_cloze_answers:
        value = re.sub(r"\{\{c\d+::.*?(?:::[^{}]*?)?\}\}", " ", value, flags=re.I | re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value).casefold()
    return " ".join(re.findall(r"[\w]+", value, flags=re.UNICODE))


def contains_term(haystack: str, term: str) -> bool:
    needle = strip_markup(term)
    if not needle:
        return False
    return re.search(rf"(?<!\w){re.escape(needle)}(?!\w)", haystack) is not None


def validate(raw: Any, units: dict[str, str], lessons: dict[str, str]):
    errors: list[str] = []
    cards: list[dict[str, Any]] = []
    seen: set[str] = set()
    unit_names = set(units.values())

    if not isinstance(raw, list):
        return [], ["lesson-cards.json must contain a flat JSON array"]

    for index, card in enumerate(raw):
        where = f"lesson-cards.json[{index}]"
        if not isinstance(card, dict):
            errors.append(f"{where} must be an object")
            continue

        missing = sorted(REQUIRED_FIELDS - card.keys())
        unknown = sorted(card.keys() - REQUIRED_FIELDS - OPTIONAL_FIELDS)
        if missing:
            errors.append(f"{where} is missing fields: {', '.join(missing)}")
        if unknown:
            errors.append(f"{where} has unknown fields: {', '.join(unknown)}")
        if missing or unknown:
            continue

        card_id = card["id"]
        lesson = card["lesson"]
        unit = card["unit"]
        card_type = card["type"]
        front = card["front"]
        back = card["back"]
        tags = card["tags"]

        for field in ("id", "lesson", "unit", "type", "front", "back"):
            if not isinstance(card[field], str) or not card[field].strip():
                errors.append(f"{where}.{field} must be a non-empty string")
        if not isinstance(card_id, str) or not isinstance(lesson, str):
            continue

        if card_id in seen:
            errors.append(f"duplicate card id: {card_id}")
        seen.add(card_id)
        if not card_id.startswith(lesson + "::") or card_id.endswith("::"):
            errors.append(f"{where}.id must be '{lesson}::<purpose>'")

        if lesson not in lessons:
            errors.append(f"{where}.lesson is not a lesson in content.js: {lesson!r}")
        elif unit != lessons[lesson]:
            errors.append(
                f"{where}.unit {unit!r} does not match lesson {lesson}'s unit {lessons[lesson]!r}"
            )
        elif unit not in unit_names:
            errors.append(f"{where}.unit is unknown: {unit!r}")

        if card_type not in ALLOWED_TYPES:
            errors.append(f"{where}.type is unknown: {card_type!r}")
            continue

        if not isinstance(tags, list) or not tags or any(
            not isinstance(t, str) or not t.strip() for t in tags
        ):
            errors.append(f"{where}.tags must be a non-empty array of strings")
        else:
            if len(set(tags)) != len(tags):
                errors.append(f"{where}.tags contains duplicates")
            expected_mode = "understanding" if card_type in UNDERSTANDING_TYPES else "recall"
            if ({"recall", "understanding"} & set(tags)) != {expected_mode}:
                errors.append(f"{where}.tags must carry exactly the mode {expected_mode!r}")
            if unit in unit_names and slugify(unit) not in tags:
                errors.append(f"{where}.tags must include the unit tag {slugify(unit)!r}")
            marker = TYPE_MARKERS.get(card_type)
            if marker and marker not in tags:
                errors.append(f"{where}.tags must include {marker!r} for type {card_type!r}")

        if card_type == "cloze":
            if re.search(r"\{\{c\d+::.+?\}\}", front, flags=re.I | re.S) is None:
                errors.append(f"{where}.front must contain an Anki cloze deletion")
        elif "{{c" in front:
            errors.append(f"{where}.front has a cloze deletion but type is {card_type!r}")

        answer = card.get("answer")
        if card_type in NAME_ANSWER_TYPES:
            if not isinstance(answer, str) or not answer.strip():
                errors.append(f"{where}.answer is required for type {card_type!r}")
            else:
                visible = strip_markup(front)
                if contains_term(visible, answer):
                    errors.append(f"{where}.front leaks its answer {answer!r}")
                if not contains_term(strip_markup(back), answer):
                    errors.append(f"{where}.back never states the answer {answer!r}")
        elif answer is not None:
            errors.append(f"{where}.answer is only meaningful for a name-answer type")

        extra = card.get("extra")
        if extra is not None and (not isinstance(extra, str) or not extra.strip()):
            errors.append(f"{where}.extra must be a non-empty string when present")

        cards.append(card)
    return cards, errors


def make_models(genanki: Any) -> tuple[Any, Any]:
    fields = [{"name": n} for n in ("Front", "Back", "Extra", "Kicker")]
    basic = genanki.Model(
        BASIC_MODEL_ID,
        "Kubernetes Beyond YAML Lessons Basic",
        fields=fields,
        templates=[{"name": "Card 1", "qfmt": BASIC_QFMT, "afmt": BASIC_AFMT}],
        css=CSS,
        sort_field_index=0,
    )
    cloze = genanki.Model(
        CLOZE_MODEL_ID,
        "Kubernetes Beyond YAML Lessons Cloze",
        fields=fields,
        templates=[{"name": "Cloze", "qfmt": CLOZE_QFMT, "afmt": CLOZE_AFMT}],
        css=CSS,
        model_type=genanki.Model.CLOZE,
        sort_field_index=0,
    )
    return basic, cloze


def build(cards: list[dict[str, Any]], units: dict[str, str], genanki: Any) -> None:
    basic_model, cloze_model = make_models(genanki)
    parent = genanki.Deck(PARENT_DECK_ID, PARENT_DECK_NAME)
    ordered_units = [units[f"u{n}"] for n in range(1, len(units) + 1)]
    decks = {
        name: genanki.Deck(UNIT_DECK_ID_BASE + n, f"{PARENT_DECK_NAME}::{name}")
        for n, name in enumerate(ordered_units, start=1)
    }

    model_counts: Counter[str] = Counter()
    deck_counts: Counter[str] = Counter()
    type_counts: Counter[str] = Counter()

    for card in sorted(cards, key=lambda c: c["id"]):
        is_cloze = card["type"] == "cloze"
        note = genanki.Note(
            model=cloze_model if is_cloze else basic_model,
            fields=[
                card["front"],
                card["back"],
                card.get("extra", ""),
                KICKERS.get(card["type"], ""),
            ],
            tags=card["tags"],
            guid=genanki.guid_for(card["id"]),
        )
        decks[card["unit"]].add_note(note)
        model_counts["Cloze" if is_cloze else "Basic"] += 1
        deck_counts[card["unit"]] += 1
        type_counts[card["type"]] += 1

    package = genanki.Package([parent, *(decks[name] for name in ordered_units)])
    package.write_to_file(str(OUTPUT_PATH))

    print(f"Wrote {OUTPUT_PATH}")
    print(f"Total notes: {len(cards)}")
    print("Per model:")
    for name in ("Basic", "Cloze"):
        print(f"  {name}: {model_counts[name]}")
    print("Per type:")
    for name in sorted(type_counts):
        print(f"  {name}: {type_counts[name]}")
    print("Per deck:")
    for name in ordered_units:
        print(f"  {name}: {deck_counts[name]}")
    empty = [name for name in ordered_units if not deck_counts[name]]
    print("Warnings:")
    print("  none" if not empty else "\n".join(f"  - empty subdeck: {n}" for n in empty))


def main() -> int:
    try:
        units, lessons = load_units()
        raw = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    except ContractError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    except FileNotFoundError:
        print(f"ERROR: cards not found: {CARDS_PATH}", file=sys.stderr)
        return 1
    except json.JSONDecodeError as exc:
        print(
            f"ERROR: lesson-cards.json is not valid JSON: "
            f"line {exc.lineno}, column {exc.colno}: {exc.msg}",
            file=sys.stderr,
        )
        return 1

    cards, errors = validate(raw, units, lessons)
    if errors:
        print(f"Validation failed with {len(errors)} error(s):", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    uncovered = sorted(set(lessons) - {c["lesson"] for c in cards})
    if uncovered:
        print(
            "Validation failed: lessons with no cards: " + ", ".join(uncovered),
            file=sys.stderr,
        )
        return 1

    try:
        import genanki
    except ImportError:
        print(
            "ERROR: genanki is not installed. Install it in deck/.venv, then run "
            "deck/.venv/bin/python deck/build_lessons_deck.py.",
            file=sys.stderr,
        )
        return 2

    build(cards, units, genanki)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
