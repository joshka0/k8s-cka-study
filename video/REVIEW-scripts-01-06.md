# Review request: technical accuracy of modules 01-06 (already shipped)

You are reviewing narration scripts for a Kubernetes video series. The author
is a different model; you are the independent technical check. Be adversarial.

## What to read

- `modules/u01-control-plane/script.json`
- `modules/u02-api-path/script.json`
- `modules/u03-reconciliation/script.json`
- `modules/u04-workloads/script.json`
- `modules/u05-crds/script.json`
- `modules/u06-scheduling/script.json`

These six are ALREADY RENDERED AND PUBLISHED as videos. Errors here are the
most expensive kind, because correcting one costs a re-dub and a re-render.
Prioritise accordingly: report everything, but mark clearly which findings are
genuinely wrong versus merely imprecise, so I can decide what justifies a
re-cut.

Only the `narration` field of each beat is the spoken claim. `visual.spec` is
production direction for a renderer, not a factual claim, but flag it if a spec
would draw something factually wrong.

## What I need from you

For each script, judge two things.

**1. Technical accuracy against real Kubernetes.** Is every claim true of
current Kubernetes? Name the version if a claim is version-sensitive. I care
about:

- Anything stated as always-true that is actually conditional.
- Anything that was true of older Kubernetes and is now wrong or misleading.
- Ordering claims (what happens before what) that are actually concurrent, or
  vice versa.
- Ownership claims (which component does what) — these carry most of the
  series' value, so they must be exactly right.
- Terminology used loosely where the distinction matters.

**2. CKA preparation value.** The audience is preparing for the CKA and for
interviews. For each script tell me:

- Which claims map to real CKA exam objectives, and which are interview-only
  depth that the exam does not test.
- Anything a CKA candidate genuinely needs that the script omits, given the
  script's stated scope. Do not ask for scope expansion into other modules —
  each module covers exactly one course unit, u1 through u6 respectively.
- Anything the script teaches that would actively mislead someone in the exam
  environment (for example, advice that assumes a managed cluster).

## Output format

Return findings as a list. For each:

```
[SCRIPT] beat-id · SEVERITY (wrong | misleading | imprecise | omission)
  claim:   <quote the exact narration phrase>
  problem: <what is wrong, and under what conditions>
  fix:     <the corrected wording, in the same voice — short sentences, no
            signposting, active voice>
```

Then one summary line per script:

One verdict line per script, u01 through u06:
`uNN VERDICT: ACCURATE` or `uNN VERDICT: N CORRECTIONS NEEDED`

## Rules

- Do not edit any file. Report only. I apply the fixes.
- Do not rewrite for style. The voice is deliberate: short sentences, active
  voice, no signposting, no "here's the thing" openers. Match it in your
  suggested fixes.
- If you are unsure whether something is version-dependent, say so explicitly
  rather than guessing. An honest "this depends on X" is more useful than a
  confident wrong correction.
- Do not run the project, install anything, or start renders. The machine is
  busy rendering video and CPU is the bottleneck. Reading files is all you need.


Write your complete findings to `REVIEW-FINDINGS-01-06.md`. That file is the only thing you may write.
