# Review request: extended classroom scripts

All 26 extended scripts (`uNN-listen-in-class-extended.md`, u01–u27 except no
gap) were produced by a different model from the approved base scripts
(`uNN-listen-in-class.md`). The extension contract is
`PROMPT-classroom-extended.md`; the human-approved exemplar pair is u21.

**The review surface is the delta.** The base scripts are triple-reviewed and
approved; do not re-litigate them. For each file, diff base against extended
(mentally or however you like) and judge what the extension ADDED or CHANGED.

## Part 1 — accuracy (matters most)

Baseline Kubernetes v1.36. Factual authority for any claim is the module's
reviewed narration at `../video/modules/<name>/script.json`.

- A restated claim that drifted: checkpoints and recalls compress approved
  claims into one line — compression is where nuance dies. A checkpoint like
  "quota counts declared resources" is fine; "quota counts usage" would be a
  regression.
- A regression to the pre-correction form of a claim. The bases encode
  deliberate corrections (the scheduler deliberately skips gated Pods;
  Progressing=False rather than a "stalled condition"; IPVS deprecated in
  1.35; endpoint stays in the slice with ready false; startup probe kills at
  failureThreshold; a controller parent keeps FailedCreate events). If an
  added line resurrects the old form, that is the highest-value finding.
- A behaviour→name beat that names the wrong owner ("the framework calls it"
  where it is not the scheduling framework, and similar).
- New content beyond the base (the extension occasionally restored an omitted
  module beat, e.g. headless Services in u08): verify such additions against
  the module source with extra suspicion.

## Part 2 — pattern conformance

Against `PROMPT-classroom-extended.md`:

- A checkpoint answer longer than one spoken line, or a checkpoint that
  introduces a claim instead of compressing one.
- A recall of a term that is not load-bearing, or more than ~4 recalls.
- Near-verbatim duplicate answers between students.
- A padded drill (the prompt forbids expanding rapid-fire sequences).
- A cue on a fluent, confident, correct answer.

## What NOT to report

Calibration from your previous review round, so it is not repeated: header
prose (titles, "Module NN", unit ids, comparison-test wording) is build
metadata, never synthesized to audio — do not report it. A section opening
that states the incident before asking is the hook pattern, not a lecture —
do not report it. I would rather have 8 real findings than 40 opinions.

## Output

```
[uNN] section-heading · KIND (wrong | misleading | regression | pattern)
  problem: <what is wrong, concretely>
  fix:     <the corrected line(s), ready to paste, in script format>
```

Accuracy first, pattern after. End with:

`ACCURACY: N findings`
`PATTERN: M findings`

## Rules

- Write findings to `REVIEW-FINDINGS-classroom-extended.md`. Edit nothing
  else. No builder, renders, git, or subagents. An audio batch is running on
  this machine — reading files is all you need.
