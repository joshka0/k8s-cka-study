# Walkthrough fidelity findings

Re-gate of the ten findings applied to `assets/exam-walkthroughs.js`. Scope: the six affected walkthroughs only.

Checked each original finding and the surrounding options, teach text, later tables, and closings for new damage.

No remaining findings.

# Re-gate notes (not findings)

[exam-var-gaps-q01 step 4] resolved
  The right command is now `kubectl autoscale deployment mill -n busy --cpu=60% --min=2 --max=8 --name=mill-hpa`. The success line names `mill-hpa`. The v1 manifest stays partial. The closing still tells the learner to pass `--name` when the target name is not the HPA name.

[exam-var-gaps-q01 step 2] residual wording
  The “suppose you created the HPA first” note still writes the autoscale line without `--name`, then the tables in that step are `mill-hpa`. The note is a counterfactual, not the graded command. The step-4 option that creates the object is correct. Do not reopen the finding.

[exam-var-gaps-q06 step 1] resolved
  Every listing uses the Pod name `scratch`. The illegal ReplicaSet suffix is gone. `kubectl get nodes` prints `v1.36.0`.

[exam-var-gaps-q06 step 2] resolved
  The taint dump uses `timeAdded`, not `timeStamp`. Later node tables stay on `v1.36.0`.

[exam-var-gaps-q06] residual naming
  Teach text still says `scratch` is owned by Deployment `tmpjob`, which matches the question context. After the drain, `-l app=tmpjob` still prints `scratch` on `worker-0`. That is the question’s name for the replica, not a new walkthrough fault.

[exam-var-diffs-v01 step 1] resolved
  Every FailedScheduling line in this walkthrough is `3 Insufficient cpu` plus `3 No preemption victims found for incoming pod`. No leftover `Preemption is not helpful` remains in v01.

[exam-var-diffs-v01 step 2] resolved
  The printed clause is the victims-found reason. The teach now maps that reason to “no lower-priority victim”.

[exam-var-diffs-v02 step 1] resolved
  Both FailedScheduling lines carry `preemption: 0/3 nodes are available: 3 Preemption is not helpful for scheduling.` The first sentence still names the unbound claim.

[exam-var-diffs-v02 step 1] residual wording
  The right teach still says “a single sentence rather than a tally of per-Node reasons.” The contrast is the filter half versus a per-Node tally, not a claim that the event has no preemption clause. The closing quotes only the claim sentence. Do not reopen the finding.

[exam-var-diffs-v04 step 4] resolved
  The right teach, the TCP-80 teach, and the closing all teach `ports` from the API: a port on the selected Pods, not the Service port. The DNAT-order sentences are gone.

[exam-var-diffs-v07 step 5] resolved
  `kubectl get svc kube-dns -o custom-columns=...` prints `10.96.0.10`. `10.96.0.1` remains only as the `kubernetes` Service address in nslookup and in the ClusterIP reachability probes.

# Verdict

ship

# Question ids with findings

(none)

# Question ids re-checked with no findings

- exam-var-gaps-q01
- exam-var-gaps-q06
- exam-var-diffs-v01
- exam-var-diffs-v02
- exam-var-diffs-v04
- exam-var-diffs-v07
