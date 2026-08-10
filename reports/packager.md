# Packager report

Updated `deck/build_deck.py` for the canonical Kubernetes Beyond YAML v2 deck:
60 components, exactly 120 cards, and twelve subdecks.

- Preserves the fixed Basic/Cloze model IDs and parent deck ID. Surviving semantic
  subdecks retain their v1 IDs; all eight new groups receive fixed, previously
  unused IDs so retired deck identities are never repurposed.
- Derives every note GUID from the stable card ID with `genanki.guid_for`.
- Validates the complete component and card schemas, enums, component/group
  routing, the exact twelve-group/five-components-per-group inventory, exactly
  two cards per component, at least one understanding card per component, unique
  IDs, v2 tag invariants, cloze syntax, detectable answer leaks, image-side
  consistency, safe media paths, missing files, and flattened-media basename
  collisions before importing `genanki`.
- Defines a Basic model and a Cloze model with shared dark-mode-friendly styling.
  Basic cards expose `Front`, `Back`, `Image`, `ImageSide`, and `Extra`; CSS shows
  optional media only on the requested side.
- Packages referenced media by basename and emits total, per-model, per-deck,
  and warning summaries.

Static and in-memory fixtures passed:

- Python AST parsing and the exact 60-component, twelve-group inventory.
- A valid 120-card fixture with exactly two cards and at least one understanding
  card for every component.
- Rejection fixtures for 119-card input, per-component undercoverage, a recall
  answer leak, and a missing optional-media file.
- Uniqueness and signed-32-bit range of all fifteen fixed model/deck IDs,
  deterministic `genanki.guid_for(card["id"])` use, and image-side CSS selectors.
- No source-tree `__pycache__` artifact and no generated `.apkg`.

This update did not install or invoke `genanki`, create a virtual environment, or
produce an `.apkg`.

PACKAGER STATUS: READY
