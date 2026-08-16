# Re-verification — EXAM-VAR-gaps.md and EXAM-VAR-diffs.md

All eleven findings from the first pass are applied. The three author-flagged rulings are applied. Index tables match the headers. Topics and units are valid. Hanging-indent field blocks still parse like EXAM-DOCS-u15-u27.md.

---

## Finding-by-finding

[EXAM-VAR-gaps.md Q01] leaks — resolved
  Title is now 'Hold mill at sixty percent CPU'. The missing request stays in the context. The title no longer names the mechanism.

[EXAM-VAR-gaps.md Q01] style — resolved
  Index row, heading, and topic are u4 / 'Two autoscalers, one number'.

[EXAM-VAR-gaps.md Q01] currentMetrics ruling — followed
  Pair 3 still decides on `status.currentMetrics[].current.averageUtilization` set and not null. `ScalingActive: True` is extra evidence only.

[EXAM-VAR-gaps.md Q03] ungradeable — resolved
  Pair 1 now requires `helm get values till -n retail --revision 1` (no `-a`) to be empty. `helm upgrade --install` twice with overrides fails that check. `helm install` then `helm upgrade --set` still scores.

[EXAM-VAR-gaps.md Q06] ungradeable — resolved
  Pair 4 now asks for at least 3 ready `press` replicas, all off `worker-1`. Scaling back to 3 after the drain is documented as scoring.

[EXAM-VAR-gaps.md Q06] wrong — resolved
  A drain without `--ignore-daemonsets`, and a drain that never makes room, both leave the node unschedulable. Pair 1 scores. Pair 2 does not. The expected path notes that the first failed drain already cordoned the node.

[EXAM-VAR-gaps.md Q06] style — resolved
  The ungraded 'do not delete Pods by hand' sentence is gone. See structural ruling (1).

[EXAM-VAR-gaps.md Q08] ungradeable — resolved
  Pair 1 accepts any `forward` in the `corp.internal` block whose destination is `10.96.90.53`. Pair 2 requires the lookup to be answered and forbids reading the client SERVER line. Pair 3 still requires a name that only the node resolver can answer.

[EXAM-VAR-gaps.md Q08] topic ruling — followed
  Topic remains 'Fallthrough is not forwarding'.

[EXAM-VAR-gaps.md Q07] style — resolved
  The `master` GitHub URL is gone. The Storage Classes and Persistent Volumes pages remain.

[EXAM-VAR-diffs.md V02] unsolvable — resolved
  The Pod uid freeze is gone. Identity is name, image, and mount. See structural ruling (2).

[EXAM-VAR-diffs.md V04] wrong — resolved
  The packet-rewrite-order claim is gone. The fail of TCP 80 is taught from the API: `to` selects Pods, and `ports` is a port on those Pods.

[EXAM-VAR-diffs.md V07] wrong — resolved
  Context and task say no in-cluster name resolves. The expected path says `kube-dns` has no ready endpoint, so nothing answers on `10.96.0.10`. Client hang versus refuse is named as proxy-mode noise, not the cause.

No new finding of kind wrong, ungradeable, leaks, unsolvable, or duplicate.

---

## Structural rulings

**(1) gaps Q06 — delete the ungraded sentence, document raw-delete as scoring-by-end-state. Accept.**

The first-pass fix offered two options. Deleting the sentence is one of them. The brief grades end state only. After the edit, cordon plus `kubectl delete pod` on `press` and `scratch` matches the graded end state, the same way `--disable-eviction` after a scale-up does. The file now says so in verify and asks for that note in feedback. There is no leftover ungraded constraint.

The cost is pedagogical, not a grader defect: a candidate can cordon and delete without ever reading the PDB, and still score. The Eviction-UID option would have blocked that skip. The brief does not require that tighter check. Do not reopen the finding.

**(2) diffs V02 — drop the uid freeze, keep the Pending Pod, teach the Terminating hang. Accept.**

This is the right option of the two the first pass named. The diffs file is a same-symptom bank. Dropping the consumer Pod at the start would have changed the symptom to a Pending claim. The new path is: diagnose the missing class, learn that `storageClassName` cannot be patched, learn that a Pending Pod holds the claim, delete `ledger`, replace `ledger-data`, recreate `ledger` with the same name, image, and mount. The protection hang is a Right branch and a trap, not a wall. Stripping the finalizer is named as a wrong habit; end-state grading cannot fail it, and that is the same honesty as Q06.

A toleration still leaves the Pod Pending. Creating a StorageClass that matches the typo still fails the class snapshot. A second claim still fails the single-claim check. The original-bank answer still does not solve V02.

---

## Verdicts

EXAM-VAR-gaps.md — ship

EXAM-VAR-diffs.md — ship
