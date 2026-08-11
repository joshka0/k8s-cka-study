# Review request: technical accuracy of modules 13-20 (advanced arc)

You are reviewing narration scripts for a Kubernetes video series. The author
is a different model; you are the independent technical check. Be adversarial.

## What to read

- `modules/u13-bootstrap/script.json` — kubeadm, static Pods, skew, upgrades.
- `modules/u14-config-qos/script.json` — config delivery, QoS, eviction vs OOM.
- `modules/u15-ingress-gateway/script.json` — Ingress, Gateway API, policy.
- `modules/u16-numa/script.json` — topology managers, node admission, latency.
- `modules/u17-devices-dra/script.json` — device plugins vs DRA, claims.
- `modules/u18-api-machinery/script.json` — aggregation, watch semantics, CEL.
- `modules/u19-coordination/script.json` — Leases, gates, finalizers.
- `modules/u20-troubleshooting/script.json` — the CKA troubleshooting method.

None of these eight are built yet, so corrections are cheap. Be thorough. These
are the advanced arc, units 13-20 of a 20-unit course; each covers exactly one
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
  modules 01-12 cover units u1-u12 and are already published.
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

One verdict line per script, u13 through u20:
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


Write your complete findings to `REVIEW-FINDINGS-13-20.md`. That file is the only thing you may write.
