# Re-gate: docs-derived questions and cards, after rework

Four files failed an accuracy review; every finding's prescribed fix has
since been applied by a different agent. Verify the rework — do not
re-run the original review from scratch.

Files under review (current, reworked state):

    transcripts/killer-sh/EXAM-DOCS-u1-u14.md      8 questions
    transcripts/killer-sh/EXAM-DOCS-u15-u27.md     7 questions
    deck/cards-docs-u1-u14.json                    14 cards
    deck/cards-docs-u15-u27.json                   14 cards

The original findings: transcripts/killer-sh/REVIEW-FINDINGS-docs.md
The contract: transcripts/killer-sh/BRIEF-docs.md (question shape, card
schema, style). Valid lesson/unit strings: deck/VALID-IDS.md.

You may fetch kubernetes.io and upstream project docs to check claims.
Fetch documentation only. No kubectl or cloud CLIs. No git. No subagents.

## Check, in priority order

1. **Every finding resolved.** For each of the 60 findings, confirm the
   defect is gone from the current text.
2. **The applier's flagged deviations — rule on each:**
   - u15-u27 Q01: fully redesigned as a Prefix-path question with a
     running Cilium controller; the omission constraint was dropped in
     favor of grading only the live defaulted spec.ingressClassName.
     Confirm the redesign is accurate, gradeable, and leak-free.
   - u1-u14 Q05: context now states the cluster has more Nodes than
     store replicas, to make the externalTrafficPolicy requirement
     meaningful. Sound?
   - u1-u14 Q08: replaced entirely — new question "Still the old token"
     (Secret rotation frozen by a subPath mount). This is NEW, never
     reviewed by anyone: review it fully — accuracy at v1.36, grader
     discipline (alternative route scores; rollout-restart-only and
     env-var conversions fail), no answer leak, docs URLs support the
     claims.
   - cards: u3l2::docs-watch-410-gone is a NEW card (410 Gone / re-list /
     bookmark) — review it fully.
3. **No merge corruption, no new errors** across every edited question
   and card. Expected-path references to check numbers must match the
   current verify blocks.
4. **Grader discipline spot-check** on the heaviest rework: u15-u27 Q01,
   Q03 (DRA field paths at v1.36 — verify against the current API docs),
   Q05 (managedFields ownership checks), and the new Q08.

## What I want back

Write to `transcripts/killer-sh/REVIEW-FINDINGS-regate-docs.md` — that
file only. One entry per unresolved or new finding:

```
[file · QNN or card id] KIND (unresolved | corruption | new-error | judgment)
  problem: …
  fix:     …
```

End with a verdict per file: ship | rework.
