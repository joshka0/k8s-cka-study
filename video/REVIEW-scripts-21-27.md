# Review request: technical accuracy of modules 21-27 (CKA-deep arc)

You are reviewing narration scripts for a Kubernetes video series. The author
is a different model; you are the independent technical check. Be adversarial.

## What to read

- `modules/u21-identity-rbac/script.json` — RBAC scope, escalation, node identity.
- `modules/u22-metrics-debug/script.json` — metrics pipeline, evidence order.
- `modules/u23-declarative-delivery/script.json` — render vs reconcile, SSA ownership.
- `modules/u24-namespace-governance/script.json` — LimitRange, quota, in-place resize.
- `modules/u25-service-exposure/script.json` — Service types, EndpointSlice conditions.
- `modules/u26-restart-ownership/script.json` — restart owners, sidecars, Job policy.
- `modules/u27-pod-security/script.json` — PSA, RuntimeClass, user namespaces.

None of these seven are built yet, so corrections are cheap. Be thorough. They
are the CKA-deep arc, units 21-27 of a 27-unit course; each covers exactly one
unit and must not expand into another's scope.

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
  modules 01-20 cover units u1-u20 and are already published.
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

One verdict line per script, u21 through u27:
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


Write your complete findings to `REVIEW-FINDINGS-21-27.md`. That file is the only thing you may write.
