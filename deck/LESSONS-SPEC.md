# Lessons deck specification

## Goal and authority

Build a second Anki deck that reinforces the **interactive lesson path** in
`../index.html`, driven by `../assets/content.js` and
`../assets/advanced-content.js`. It ships alongside the
existing 120-card vocabulary deck (`SPEC.md`, `cards.json`,
`kubernetes-beyond-yaml.apkg`), which is unchanged.

The two decks answer different questions:

| Deck | Trains |
| --- | --- |
| `Kubernetes Beyond YAML — Interview Prep` | Name and define 60 components |
| `Kubernetes Beyond YAML — Lessons` | Reproduce the invariants, discriminations, orderings and diagnostics drilled by the lessons |

Overlap is accepted — the user chose two decks knowingly. Where a lesson idea is
already covered verbatim by the v2 vocabulary deck, prefer the lesson's angle
(discriminator, failure mode, ordering) rather than restating the definition.

The two course content files are the only content authority. Do not introduce
claims absent from them, and do not re-derive material from raw transcripts.

## Card contract

Write `lesson-cards.json` as a flat array. Schema:

```json
{
  "id": "u1l1::who-starts-a-container",
  "lesson": "u1l1",
  "unit": "01 The control-plane map",
  "type": "name_to_definition",
  "answer": "kube-apiserver",
  "front": "…HTML…",
  "back": "…HTML…",
  "extra": "…HTML links…",
  "tags": ["01-the-control-plane-map", "understanding"]
}
```

- `id` — stable, globally unique, `<lesson>::<purpose>`. Drives the Anki GUID, so
  re-import updates in place.
- `lesson` — a lesson id that exists in `content.js`.
- `unit` — the subdeck, derived as `<zero-padded unit n> <unit title>`.
- `answer` — the term being recalled. **Required** for `plain_phrase_to_name`,
  `definition_to_name` and `api_to_name`; the builder fails if it appears on the
  front.
- `extra` — optional. Carries the upstream reference and the timestamped clip
  from the source lesson item, rendered under the answer.
- Allowed types: `plain_phrase_to_name`, `definition_to_name`,
  `name_to_definition`, `discrimination`, `cloze`, `name_to_api`, `api_to_name`.

This is a verbal edition: no images, no media. The HTML course carries the
diagrams.

## Derivation from lessons

Every lesson contributes at least one card. The original track retains its
item-level coverage; the advanced track begins with one high-value architecture
or discrimination card per lesson so the HTML remains the canonical teaching
surface rather than duplicating every exercise into Anki.

| Lesson item | Cards |
| --- | --- |
| `teach` (27) | A `cloze` on the invariant, plus a `name_to_definition` on why it holds |
| `mcq` (55) | One card: `discrimination` when the item separates confusables, otherwise `definition_to_name` or `name_to_definition`. The stem is rewritten as a prompt — never carry the option list |
| `multi` (11) | A `name_to_definition` that asks for the discriminating set, plus a card on what is *not* in the set where the item teaches an exclusion |
| `order` (8) | A `cloze` over the ordered steps, plus a `name_to_definition` on why that order holds |
| `cloze` (11) | One `cloze`, reusing the blank |
| `recall` (27) | A `name_to_definition` carrying the model answer's key points, plus a sharper single-point card where the prompt has a crisp discriminator |

Back copy is answerable in 10–25 seconds. Rewrite; never paste a whole `why`
paragraph when a clause carries it.

## Tagging

Every card's tags contain the slugified unit, exactly one cognitive mode
(`understanding` for `name_to_definition` and `discrimination`, otherwise
`recall`), and the applicable marker: `discrimination`, `cloze`, or `code` for
`name_to_api` / `api_to_name`.

## Deck tree

Parent `Kubernetes Beyond YAML — Lessons`, with twenty subdecks named for the
twenty units, in order, derived from the two content files.

## Packager

`build_lessons_deck.py` emits `kubernetes-beyond-yaml-lessons.apkg`. It uses its
own deterministic ID block so it can never collide with the v2 deck, derives the
unit list from `content.js` rather than duplicating it, validates the whole
contract before writing, and fails loudly with every error listed.
