#!/usr/bin/env python3
"""Render representative lesson cards using the production templates and CSS.

A structural check cannot see a leaked answer or a broken layout. This renders
real front/back pairs into one HTML page so they can be looked at.

    deck/.venv/bin/python deck/render_lessons_preview.py
"""

from __future__ import annotations

import html
import importlib.util
import json
import re
from pathlib import Path

DECK_DIR = Path(__file__).resolve().parent
OUTPUT = DECK_DIR / "lesson-card-preview.html"

spec = importlib.util.spec_from_file_location("builder", DECK_DIR / "build_lessons_deck.py")
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)

# One card of every type, plus the densest layouts.
SAMPLE_IDS = [
    "u1l1::http-policy-boundary",        # definition_to_name
    "u7l1::name-pause-container",        # plain_phrase_to_name
    "u2l1::gate-order",                  # cloze, multiple deletions
    "u6l3::three-mechanisms",            # discrimination with a list
    "u12l2::ninety-second-answer",       # name_to_definition, long back
    "u10l2::claim-to-mount",             # cloze, four deletions
    "u9l1::api-ndots",                   # api_to_name
    "u10l1::api-wait-for-first-consumer",  # name_to_api
    "u8l2::clusterip-timeout",           # list-heavy back with no extra
]


def render_cloze(text: str, *, reveal: bool) -> str:
    """Mimic Anki's {{cloze:...}} rendering for the preview."""
    def repl(match):
        answer = match.group(2)
        hint = match.group(3)
        if reveal:
            return f"<cloze>{answer}</cloze>"
        return f"<cloze>[{hint or '...'}]</cloze>"
    return re.sub(r"\{\{c(\d+)::(.*?)(?:::(.*?))?\}\}", repl, text, flags=re.S)


def main() -> int:
    cards = {c["id"]: c for c in json.loads((DECK_DIR / "lesson-cards.json").read_text("utf-8"))}
    missing = [i for i in SAMPLE_IDS if i not in cards]
    if missing:
        print("ERROR: sample ids not found: " + ", ".join(missing))
        return 1

    blocks = []
    for card_id in SAMPLE_IDS:
        c = cards[card_id]
        kicker = builder.KICKERS.get(c["type"], "")
        extra = c.get("extra", "")
        if c["type"] == "cloze":
            front = f'<div class="kicker">{kicker}</div><div class="prompt">{render_cloze(c["front"], reveal=False)}</div>'
            back = (
                f'<div class="answer">{render_cloze(c["front"], reveal=True)}</div>'
                f'<hr class="divider"><div class="answer">{c["back"]}</div>'
                f'<div class="extra">{extra}</div>'
            )
        else:
            front = f'<div class="kicker">{kicker}</div><div class="prompt">{c["front"]}</div>'
            back = (
                f'<div class="question-recap"><div class="prompt">{c["front"]}</div></div>'
                f'<hr class="divider"><div class="answer">{c["back"]}</div>'
                f'<div class="extra">{extra}</div>'
            )
        blocks.append(
            f'<section><h2>{html.escape(card_id)} <small>{html.escape(c["type"])}</small></h2>'
            f'<div class="pair">'
            f'<div><h3>Front</h3><div class="card">{front}</div></div>'
            f'<div><h3>Back</h3><div class="card">{back}</div></div>'
            f"</div></section>"
        )

    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lesson deck — card preview</title>
<style>
body {{ margin:0; padding:28px; background:#e8ecf3; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }}
h1 {{ margin:0 0 6px; }}
p.lede {{ margin:0 0 28px; color:#4a5568; }}
section {{ margin-bottom:30px; }}
section h2 {{ font-size:.95rem; font-family:ui-monospace,Menlo,monospace; color:#334; margin:0 0 10px; }}
section h2 small {{ color:#7a8699; font-weight:500; }}
h3 {{ font-size:.7rem; letter-spacing:.12em; text-transform:uppercase; color:#7a8699; margin:0 0 6px; }}
.pair {{ display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start; }}
.card {{ border:1px solid #c9d2e0; border-radius:12px; }}
@media (max-width:900px) {{ .pair {{ grid-template-columns:1fr; }} }}
@media (prefers-color-scheme: dark) {{ body {{ background:#070b13; }} section h2 {{ color:#cbd5e6; }} }}
{builder.CSS}
</style></head><body>
<h1>Lesson deck — card preview</h1>
<p class="lede">Rendered from the production templates and CSS. Check that no front reveals its answer.</p>
{''.join(blocks)}
</body></html>"""

    OUTPUT.write_text(page, encoding="utf-8")
    print(f"Wrote {OUTPUT} ({len(SAMPLE_IDS)} cards)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
