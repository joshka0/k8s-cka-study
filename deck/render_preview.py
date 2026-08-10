#!/usr/bin/env python3
"""Render representative cards with the production Anki CSS for visual review."""

from __future__ import annotations

import json
from pathlib import Path

from build_deck import CSS


DECK_DIR = Path(__file__).resolve().parent
OUTPUT_PATH = DECK_DIR / "card-preview.html"
SAMPLE_TYPES = ("name_to_definition", "discrimination", "definition_to_name")


def render_card(card: dict[str, object]) -> str:
    front = str(card["front"])
    back = str(card["back"])
    card_id = str(card["id"])
    return f"""
    <section class="sample">
      <h2>{card_id}</h2>
      <div class="preview-label">Front</div>
      <div class="card"><div class="question" data-side="none"><div class="prompt">{front}</div><div class="media"></div></div></div>
      <div class="preview-label">Back</div>
      <div class="card"><div class="question-recap"><div class="prompt">{front}</div></div><hr class="divider"><div class="answer-side" data-side="none"><div class="answer">{back}</div><div class="media"></div><div class="extra"></div></div></div>
    </section>
    """


def main() -> None:
    cards = json.loads((DECK_DIR / "cards.json").read_text(encoding="utf-8"))
    samples = [next(card for card in cards if card["type"] == kind) for kind in SAMPLE_TYPES]
    sections = "\n".join(render_card(card) for card in samples)
    page = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kubernetes Anki card preview</title>
  <style>
  {CSS}
  body {{ margin: 0; padding: 2rem; background: #dbe4ef; }}
  main {{ max-width: 64rem; margin: 0 auto; }}
  h1 {{ font: 700 2rem/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; }}
  h2, .preview-label {{ font: 600 0.85rem/1.4 ui-monospace, SFMono-Regular, monospace; color: #42516a; }}
  .preview-label {{ margin: 1rem 0 0.35rem; text-transform: uppercase; letter-spacing: 0.08em; }}
  .sample {{ margin: 0 0 2.5rem; }}
  </style>
</head>
<body><main><h1>Production card preview</h1>{sections}</main></body>
</html>
"""
    OUTPUT_PATH.write_text(page, encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
