# Cross-review findings: listen-in classroom scripts u01–u13

Reviewer re-derived claims from each module’s
`../video/modules/<name>/script.json` against
`PROMPT-classroom-script.md` and `u21-listen-in-class.md`.
Baseline Kubernetes v1.36.

Scripts reviewed: `u01-listen-in-class.md` … `u13-listen-in-class.md`.
No other files were edited.

---

## Accuracy

[u08] The Service data plane · misleading
  problem: The dialogue lists kube-proxy modes as "iptables, IPVS, or nftables"
  as equal peers, then moves on to eBPF. The reviewed module’s deliberate
  correction is that IPVS mode was deprecated in Kubernetes 1.35, still runs
  with a startup warning in 1.36, and nftables is the recommended Linux
  replacement. Leaving IPVS unflagged re-opens the old “pick IPVS for O(1)”
  story the module exists to close.
  fix:
  **Teacher:** Which Linux implementations can kube-proxy use?

  **Listener pause: 3 seconds**

  **Leon:** iptables, IPVS, or nftables.

  **Teacher:** Is IPVS still the recommended default path?

  **Listener pause: 3 seconds**

  **Maya:** [confident] Yes — that is why people still choose it for lookup cost.

  **Teacher:** [gentle] IPVS mode was deprecated in Kubernetes one point
  thirty-five. It can still run in one point thirty-six and warns at startup.
  What is the recommended Linux replacement?

  **Listener pause: 3 seconds**

  **Leon:** [realizing] nftables.

  **Teacher:** Lookup cost alone is not a recommendation. What else do you
  compare across data planes?

  **Listener pause: 5 seconds**

  **Maya:** Update cost under churn, locality, kernel support, and Service
  semantics.

---

## Craft

[u02] The first refusal · craft
  problem: After the students separate authentication from authorization, the
  teacher dumps three facts with no student attempt — lecture in costume.
  problem (exact lines):
  **Teacher:** Good. Bad credentials fail at identity. Valid credentials without
  permission fail later at authorization. Different signatures, different
  owners.
  fix:
  **Teacher:** Good. Bad credentials fail at which gate?

  **Listener pause: 2 seconds**

  **Leon:** Identity — authentication.

  **Teacher:** Valid credentials without permission fail at which gate?

  **Listener pause: 2 seconds**

  **Maya:** Authorization.

  **Teacher:** Same refusal word from a client’s point of view. Why separate the
  signatures?

  **Listener pause: 3 seconds**

  **Leon:** Different owners, different fixes.

[u08] How the Pod got an address · craft
  problem: Over-abstraction of speakable vocabulary. The module names the
  environment marker `CNI_COMMAND`. The script says only “the requested
  operation in its environment,” so the listener never leaves with the term.
  fix:
  **Teacher:** What shape does its execution contract have?

  **Listener pause: 5 seconds**

  **Maya:** The caller starts it, puts the requested operation in the
  environment — Kubernetes CNI calls that marker CNI_COMMAND — sends JSON
  configuration on standard input, reads a JSON result from standard output,
  and the plugin exits.

[u09] Configuration is not compiled order · craft
  problem: Over-abstraction of speakable vocabulary. The module names
  `plugin.cfg` as where execution order is compiled. The script says only
  “compiled into the CoreDNS binary” / “compiled plugin registry,” so the
  listener never leaves with the file name the deck and module use.
  fix:
  **Teacher:** Where does execution order come from?

  **Listener pause: 3 seconds**

  **Leon:** [realizing] A fixed order compiled into CoreDNS — the file the build
  uses is plugin.cfg.

  **Teacher:** What would genuinely change that order?

  **Listener pause: 3 seconds**

  **Maya:** Rebuilding CoreDNS with a different plugin.cfg. Moving Corefile
  lines alone does not.

  And in the compressed answer, replace “compiled order controls their
  sequence” with: “plugin.cfg compiles execution order; reordering the Corefile
  does not.”

---

## Notes (not findings)

- u01–u06 are generally strong on misconception inventory, reconstructable
  student errors, and a single scenario spine.
- u07, u10, u11 handle module CORRECTION beats well (concurrent sandbox and
  volumes; WaitForFirstConsumer is not a mutual standoff; attach-detach creates
  VolumeAttachment; quorum loss does not revoke committed writes).
- Deliberate omissions of secondary beats (for example u03 rate-limiter method
  names, u04 Recreate, u05 list-type schema) were not scored as defects where
  the scenario still carries the causal core.

---

ACCURACY: 1 findings
CRAFT: 3 findings
