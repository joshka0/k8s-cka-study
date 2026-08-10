# Card authoring report — v2

Authored exactly 120 interview-focused cards from the frozen v2 course: two cards for each of the 60 canonical components across all 12 modules.

## Composition

- 120 cards total: 68 understanding and 52 recall.
- Type counts: 45 `name_to_definition`, 39 `definition_to_name`, 23 `discrimination`, and 13 `plain_phrase_to_name`.
- Each of the 12 deck groups contains exactly 10 cards.
- Every component has exactly two cards and at least one understanding card.
- All 13 required cross-boundary discriminations are present: API server vs etcd; authentication vs authorization; events vs current state; Deployment vs StatefulSet; HPA vs VPA; preemption vs eviction; CRI vs OCI vs CNI; CNI vs Service proxy; netfilter vs eBPF connection tracking; PV vs PVC vs StorageClass; served vs storage version; snapshot vs complete disaster recovery; and Events vs logs vs metrics vs audit.
- Edition two remains fully verbal: all cards use `image: null` and `image_side: none`.

## Independent validation

- JSON parses successfully and every card has exactly the nine required schema fields.
- IDs are 120/120 unique, stable `<component>::<purpose>` values.
- Coverage is 60/60 components, exactly twice each, with exact component/platform mappings.
- All types, lowercase hyphenated group tags, cognitive tags, and applicable format markers validate with no duplicates or stray markers.
- Recall anti-leak passed against every canonical component name and alias after HTML stripping and normalized whole-term matching.
- No duplicate fronts or unsafe/unexpected HTML elements were found.
- The 68 understanding answers are 21–32 words, averaging 27.2 words, keeping them within the intended short spoken-answer range.
- Every card was checked against the frozen v2 component definition and the corresponding canonical lesson mental model, rubric, flow, or scenario. No rote flags, historical feature states, backend slogans, transcript quotations, or stale transcript claims were introduced.
- `python3 deck/build_deck.py` passed the full input contract and exited 2 only at the expected missing-`genanki` gate. It did not exit 1, and no package installation was attempted.

CARDS STATUS: READY
