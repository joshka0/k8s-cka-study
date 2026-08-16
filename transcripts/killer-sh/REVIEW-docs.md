# Review request: docs-derived exam questions and cards

Two authors derived study material from kubernetes.io, each for half the
course. Nothing here has been reviewed by anyone. Review all four files:

    transcripts/killer-sh/EXAM-DOCS-u1-u14.md    8 questions
    transcripts/killer-sh/EXAM-DOCS-u15-u27.md   7 questions
    deck/cards-docs-u1-u14.json                  cards, JSON array
    deck/cards-docs-u15-u27.json                 14 cards, JSON array

Baseline Kubernetes **v1.36**. The contract the authors worked to is
`transcripts/killer-sh/BRIEF-docs.md` — read it first. The valid `lesson`
and `unit` strings are in `deck/VALID-IDS.md`.

You may fetch kubernetes.io and upstream project docs (etcd, containerd,
CNI, CSI, Gateway API) to check claims. Fetch documentation only. Do not
run `kubectl`, `aws`, or any cloud CLI — there is no cluster. No git. No
subagents — do all analysis yourself, directly.

## Part 1 — technical accuracy. This matters most.

An earlier, different batch failed review with twelve accuracy findings,
eight of them graders that accepted a wrong end state. Hunt for exactly
that here:

- A `verify` block that would pass a wrong solution, or fail a correct
  legitimate alternative route. Work through at least one alternative
  route per question and one superficially-matching wrong end state.
- Anything stated as always-true that is conditional, or true of older
  Kubernetes and wrong at v1.36.
- Ownership claims: which component does what. Must be exactly right.
- A `docs:` URL that is dead, version-stale, or does not support the claim
  it is attached to. Check them.
- An `expected path` step that could not actually distinguish what it
  claims to distinguish.
- Card backs and fronts: any factual error, any answer leaked on the front
  of a name-answer card, any claim the linked page does not support.

## Part 2 — is it a good question

- Does the task leak its own answer? The diagnosis must be the exercise.
- Is it solvable from the stated context alone?
- Is there exactly one thing being tested?
- Is every constraint checkable in `verify`? Ungraded constraints are
  decoration and should be cut.
- Do the two question files overlap with each other, or with a mechanism
  the walkthrough drafts (`EXAM-DRAFT-*.md`) already cover? Overlap is a
  finding — say which to keep and why.
- Questions must test the page's mechanism, limit, or failure mode — a
  question whose substance is finding or citing the page is invalid.

## Part 3 — schema conformance (cards)

Check against the schema rules in BRIEF-docs.md: id shape and uniqueness,
verbatim lesson/unit strings from VALID-IDS.md, `answer` field on
name-answer types with no front leak, contiguous cloze numbering,
non-empty deduped tags, `topic` present, `extra` doc link present.

## What I want back

Write findings to `transcripts/killer-sh/REVIEW-FINDINGS-docs.md` — that
file only. Format, one entry per finding:

```
[file · QNN or card id] KIND (wrong | ungradeable | leaks | unsolvable | duplicate | schema | style)
  problem: what is wrong, with the evidence
  fix:     the exact replacement text or change
```

End with a verdict per file: ship | rework. A file with any `wrong` or
`ungradeable` finding is rework.
