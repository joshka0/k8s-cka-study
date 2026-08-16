# Re-gate: reworked walkthrough exam questions

Two question files failed an accuracy review and have since had every
finding's prescribed fix applied by a different agent. Your job is to
verify the rework, not to re-run the original review.

Files under review (the current, reworked state):

    transcripts/killer-sh/EXAM-DRAFT-00-12.md
    transcripts/killer-sh/EXAM-DRAFT-13-25.md

The original findings, whose fixes were applied:

    transcripts/killer-sh/REVIEW-FINDINGS-exam-00-12.md
    transcripts/killer-sh/REVIEW-FINDINGS-exam-13-25.md

Baseline Kubernetes **v1.36**. The question-shape contract is
`transcripts/killer-sh/BRIEF-exam.md`.

You may fetch kubernetes.io and upstream project docs to check claims.
Fetch documentation only. No kubectl or cloud CLIs — there is no cluster.
No git. No subagents.

## Check, in priority order

1. **Every finding is actually resolved.** For each finding in the two
   findings files, confirm the current text no longer has the defect. A
   fix applied verbatim that leaves the defect alive is a finding.
2. **No merge corruption.** String-replacement rework has previously left
   duplicated fragments and orphaned sentences. Read every edited
   question top to bottom; any five-word phrase repeated within one field
   is suspect.
3. **No new errors introduced.** The fixes were prescriptive but the
   applier made structural choices, flagged in these known judgment
   calls — rule on each:
   - 00-12 Q09 was structurally rewritten around the "duplicate" finding
     (scheduler-recovery focus); two accuracy fixes were treated as moot
     because their target text was removed. Confirm the rewritten Q09 is
     accurate and gradeable at v1.36.
   - 00-12 Q05 still contains the old unscored line "StorageClass objects
     match the snapshot." alongside the new scoring precondition —
     redundant; say whether to delete it.
   - 13-25 Q02 keeps a crictl.md docs URL although the reframed task no
     longer has the candidate run crictl. Keep or cut?
   - 13-25 Q08 merged three overlapping fixes into one verify block.
     Confirm the merged block still grades the end state correctly.
   - 13-25 Q09 took the finding's fallback option (single question plus a
     grader-owned immutable audit trace) instead of splitting into two
     questions. Confirm the fallback as implemented is sound.
4. **Grader discipline still holds.** Spot-check the heaviest questions:
   one legitimate alternative route still scores, one superficially
   matching wrong end state still fails.

## What I want back

Write to `transcripts/killer-sh/REVIEW-FINDINGS-regate.md` — that file
only. One entry per unresolved or new finding, same format as before:

```
[file · QNN] KIND (unresolved | corruption | new-error | judgment)
  problem: …
  fix:     …
```

End with a verdict per file: ship | rework.
