# Kubernetes Beyond YAML v2 deck specification

## Goal and authority

Build one interview-focused Anki deck that reinforces the canonical 12-module
course in `../index.html`. Answers should be speakable in 10–25 seconds. The
deck must not introduce a competing explanation or repeat stale transcript
claims.

Sources, in order: `../index.html`, `components.json`, current upstream links in
the course, then the 23 files in `../../kubernetes-youtube-transcripts/` as
supporting material. Auto-generated captions are never quotation authority.

## Card contract

Write `cards.json` as a flat array using the schema in
`skills/vocab-deck/references/card-types.md`.

- Allowed types: `plain_phrase_to_name`, `definition_to_name`,
  `name_to_definition`, `discrimination`, `cloze`, `name_to_api`, `api_to_name`.
- Stable ID: `<component>::<purpose>`; component and platform match the
  inventory.
- Concise HTML only. Recall fronts never contain the answer name or alias.
- Edition two remains verbal: `image: null`, `image_side: none`. The canonical
  HTML carries causal diagrams; do not invent label-leaking card art.
- Tags use the lowercase hyphenated platform plus exactly one cognitive mode
  and the applicable `discrimination`, `cloze`, or `code` markers.

## Coverage and pruning

- Exactly 120 cards: two per each of 60 components.
- Every component has one understanding card; the other is its strongest recall
  or discrimination card.
- Include cross-boundary discriminations: API server vs etcd; authentication vs
  authorization; event vs current state; Deployment vs StatefulSet; HPA vs VPA;
  preemption vs eviction; CRI vs OCI vs CNI; CNI vs Service proxy; netfilter vs
  eBPF conntrack; PV vs PVC vs StorageClass; served vs storage version; snapshot
  vs complete disaster recovery; Events vs logs vs metrics vs audit.
- Cut rote flags, transcript quotations, historical feature states, backend
  slogans, and duplicated definitions.

## Deck tree

Parent: `Kubernetes Beyond YAML — Interview Prep`

1. `01 Control Plane`
2. `02 API Path and Security`
3. `03 Reconciliation`
4. `04 Workloads and Disruption`
5. `05 CRDs and Operators`
6. `06 Scheduling`
7. `07 Node Runtime`
8. `08 Networking`
9. `09 DNS`
10. `10 Storage`
11. `11 HA and etcd`
12. `12 Scalability and APF`

## Packager and QA

Update `build_deck.py` for the twelve groups while preserving deterministic
model IDs, parent deck ID, card GUID derivation, validation, Basic/Cloze models,
dark-mode styling, optional media validation, and count summaries. Emit
`kubernetes-beyond-yaml.apkg`.

Card author report: `../reports/cards.md`, ending exactly
`CARDS STATUS: READY` or `CARDS STATUS: BLOCKED`.

Packager report: `../reports/packager.md`, ending exactly
`PACKAGER STATUS: READY` or `PACKAGER STATUS: BLOCKED`.
