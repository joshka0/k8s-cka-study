# Lessons deck — build and verification

Second Anki deck, derived from the interactive lesson path in `../assets/content.js`.
The existing 120-card vocabulary deck is untouched.

## Composition

- **206 notes → 249 Anki cards** (40 cloze notes expand to 83 cards).
- All **44 lessons** contribute at least one card.
- Cognitive balance: **94 recall / 112 understanding**.

| Type | Count |
| --- | --- |
| `name_to_definition` | 82 |
| `cloze` | 40 |
| `plain_phrase_to_name` | 34 |
| `discrimination` | 30 |
| `definition_to_name` | 11 |
| `name_to_api` | 6 |
| `api_to_name` | 3 |

Per subdeck (generated cards): control plane 19, API path 27, reconciliation 20,
workloads 14, CRDs 17, scheduling 23, node runtime 22, networking 15, DNS 15,
storage 19, HA/etcd 13, scale/APF 20.

**48 cards carry a timestamped video link** and most carry an upstream reference,
both inherited from the lesson item they were derived from.

## Verification

| Check | Result |
| --- | --- |
| Contract validation (ids, lesson routing, unit match, tags, modes, markers) | PASS — 0 errors over 206 notes |
| Every lesson covered | PASS — 44/44 |
| Anti-leak, required types | PASS — builder rejects any front containing its own `answer` |
| Anti-leak, heuristic sweep over all produce-the-term cards | PASS — no bolded/`<code>` answer term appears on its own front |
| Answer actually stated on the back | PASS — builder rejects a back that never states its `answer` |
| Cloze numbering contiguous from c1, braces balanced | PASS |
| HTML tag balance across front/back/extra | PASS |
| Clip video ids resolve to fetched caption tracks | PASS — 48 links, 0 unknown ids |
| `.apkg` opens; notes and cards present | PASS — 206 notes, 249 cards |
| Every note generates ≥1 card | PASS |
| Note GUIDs unique and derived from stable ids | PASS |
| Model id collision with the v2 deck | none |
| Deck id collision with the v2 deck | none (only Anki's built-in `Default`, id 1) |
| Media manifest | empty by design — verbal edition, no images |
| Real card render, light and dark | PASS — no front reveals its answer; cloze blanks, lists and links render correctly |

Two card backs initially spelled acronyms out without ever stating the acronym
itself (`CRI`, `OCI`); the builder's "back must state the answer" check caught
both and they were corrected.

## Deliberate choices

- **Two decks, overlapping.** The vocabulary deck teaches the 60 components;
  this one teaches the invariants, discriminations, orderings and diagnostics
  the lessons drill. Some ideas appear in both. Where that happens this deck
  takes the lesson's angle — the discriminator or failure mode — rather than
  restating a definition.
- **No images.** The HTML course carries the causal diagrams; inventing card art
  risks baking answer labels into the picture.
- **Cloze for sequences.** Orderings (gate order, informer path, CSI journey,
  the diagnostic spine) became multi-deletion cloze cards rather than prose,
  because the order *is* the thing being learned.
- **Self-graded prompts kept as understanding cards.** The 27 interview prompts
  became `name_to_definition` cards whose backs carry the model answer's key
  points — you still grade yourself, as in the lessons.

## Amendments

- **2026-08-06** — added a Puppet-comparison set to unit 3 (3 cards) after the
  question came up: which component is the true Puppet-agent analogue, how far
  the config-management analogy holds, and which controllers genuinely behave
  like one. The matching lesson item was **appended** to `u3l1` rather than
  inserted, because SRS keys are `lessonId#index` and an insert would silently
  re-point every existing schedule after it.

- **2026-08-06** — added a CNI lesson (`u8l3`, 8 items) and 7 cards, grounded in
  two CNI maintainer talks fetched for the purpose. None of the original 23
  videos covers CNI, which is why the subject was previously boundary-only. The
  talks predate CNI 1.1, so the operation list is taken from the current
  specification and the drift is taught explicitly rather than hidden.

## Reproduce

```
deck/.venv/bin/python deck/build_lessons_deck.py         # writes the .apkg
deck/.venv/bin/python deck/render_lessons_preview.py     # writes the visual check
```

The builder derives unit numbering, titles and the lesson list from both course
content files, so the twenty-subdeck tree cannot drift from the course.

CARDS STATUS: READY
PACKAGER STATUS: READY
