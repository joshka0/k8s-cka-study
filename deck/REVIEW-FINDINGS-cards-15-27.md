# Card review findings: units u15–u27

Range: cards whose `lesson` starts with u15–u27 (64 cards).
Baseline: Kubernetes v1.36.
Criteria: `deck/REVIEW-cards.md` — technical accuracy, then STE100 / Zinsser style.
No files other than this findings file were modified.

---

## Accuracy

[u16l1::topology-protocol] back · misleading
  problem: The back treats node admission rejection as the ordinary alternative when hints cannot be enacted. That is true only under `restricted` and `single-numa-node`. Under `best-effort` the Pod still admits without preferred alignment. Under `none` there is no alignment step. Stating rejection as the general outcome is false for the default and best-effort policies.
  fix:     CPU Manager, Memory Manager and Device Manager each emit NUMA affinity hints. Topology Manager merges them under its policy.<br>Under <b>restricted</b> or <b>single-numa-node</b>, a missing coherent placement fails node admission. Under <b>best-effort</b> the Pod still admits without the preferred alignment. Under <b>none</b> there is no alignment step.

[u17l2::pending-dra] back · wrong
  problem: The front asks which <i>state</i> separates the likely owners. The back answers with an undifferentiated inspection checklist and never names the discriminator. The course teaching is that status on the Pod, ResourceClaim and ResourceSlice separates scheduler allocation, driver inventory and node-side preparation. A list of “inspect X, then Y” does not answer the question and trains guesswork the card claims to avoid.
  fix:     Status on the <b>Pod</b>, the <b>ResourceClaim</b> and the <b>ResourceSlice</b>.<br>Unallocated claims point at selectors, inventory and the scheduler. Allocated but unprepared claims point at the DRA driver and kubelet on the chosen node. That status cut separates the owners; the Pod alone does not.

[u18l1::aggregated-vs-crd] back · imprecise
  problem: CRUD, watch and structural schema come with generic CRD serving. Status and especially the scale subresource are enabled per CRD version; they are not automatic for every CRD. “With status and scale available” overstates what a bare CRD gives you and weakens the real reason to pay for aggregation.
  fix:     Rarely, and only deliberately. CRDs already provide CRUD, watch and schema on the generic server. Status and scale are available when you enable them on the CRD.<br><b>Aggregation</b> earns its operational cost only for behaviour the generic server cannot supply — custom storage, unusual subresources, or computed responses.

[u19l2::four-gates] back · imprecise
  problem: Scheduling gates, readiness gates and finalizers each hold one concrete transition. A Lease does not “delay competing ownership” in the same sense: it is expiring optimistic state that names the current holder. “Physical API deletion” is also vague for finalizers — they hold final removal after `deletionTimestamp` is set, not a separate physical path. The four-way “delay” parallel flattens different mechanisms into one verb.
  fix:     Scheduling gates hold a Pod out of active scheduling. Readiness gates hold Ready and endpoint participation. Finalizers hold final deletion after the deletionTimestamp is set. A Lease names the current leader under optimistic concurrency and expires for failover.<br>Four mechanisms, four different transitions — none substitutes for another.

[u19l2::scheduling-gated] back · misleading
  problem: “Not the scheduler — it is not involved” overstates the model. The scheduler <i>does</i> see gated Pods and deliberately skips them. The right teaching is that this is not a capacity or predicate failure to debug in the scheduler. Saying the scheduler is uninvolved will send candidates away from the component that owns the skip rule and confuses “SchedulingGated” with “scheduler broken.”
  fix:     Not a scheduling-capacity failure — the scheduler is deliberately skipping the Pod.<br>Read the named gates in the spec. Find which controller or admission rule added them. Identify the external prerequisite each gate waits on. Ask why that owner has not removed them.<br>Gates can be removed after creation but not newly added.

[u20l1::nearest-authority] back · imprecise
  problem: The back always opens the API-down path with “the load balancer.” Multi-control-plane clusters often have one; single-node kubeadm labs and many CKA tasks do not. Teaching load-balancer-first as unconditional invents a topology the environment may not have and can waste the first diagnostic minutes.
  fix:     <b>Below Kubernetes.</b> If an API load balancer exists, confirm what it thinks. Then static Pod manifests, the kubelet service, the runtime, certificates, sockets and host resources.<br>kubectl cannot diagnose the API server that makes kubectl work. Above that line, use object status, events and component health.

[u20l2::phase-implies] front · wrong
  problem: The front asks what each “Pod phase” points at. The back then lists ContainerCreating and CrashLoopBackOff as if they were phases. Pod phases are Pending, Running, Succeeded, Failed and Unknown. ContainerCreating and CrashLoopBackOff are container waiting reasons / kubectl STATUS values while phase is still Pending or Running. Official docs warn not to confuse STATUS with phase. The unit script was corrected to “do not call them four phases”; this card still teaches the wrong model for every `kubectl get pods` read.
  fix:     What do Pod phase and common container waiting reasons each point at?

[u20l2::phase-implies] back · wrong
  problem: Same error as the front: four mixed phase/reason labels presented as phases. That trains the wrong object model for describe, STATUS and exam answers.
  fix:     <b>Pending</b> — admission, quota, scheduling or claims.<br><b>ContainerCreating</b> (waiting reason on a Pending or Running Pod) — image, sandbox, network or mounts.<br><b>CrashLoopBackOff</b> (waiting reason) — a process or probe failing repeatedly under the restart policy.<br><b>Running but not Ready</b> — readiness, a dependency, or endpoint selection.<br>Phase names the Pod. Waiting reasons name the attempt. Events name what was tried. Do not call waiting reasons phases.

[u21l1::escalation-paths] back · misleading
  problem: “A subject that can create bindings can grant itself more” is false under default RBAC escalation prevention. Creating a RoleBinding or ClusterRoleBinding does not freely escalate: the subject must already hold the permissions being granted at that scope, or hold the <code>bind</code> verb on the referenced role. Creating or editing Roles that add permissions needs those permissions or the <code>escalate</code> verb. Teaching “create bindings” as an automatic self-grant path fails real audits and exam answers that expect bind/escalate.
  fix:     <ul><li><b>Bind rights</b> — the right to bind roles you do not already hold. Create on bindings is not enough without <code>bind</code> or the permissions themselves.</li><li><b>Impersonation</b> — borrows another identity outright.</li><li><b>Aggregation</b> — a ClusterRole absorbs rules from others as labels change.</li></ul>Audit the reachable permission graph, not one Role.

[u23l2::progress-deadline] back · imprecise
  problem: There is no Deployment condition type named “stalled.” When the deadline is exceeded, the Progressing condition becomes False with reason ProgressDeadlineExceeded. Calling it a “stalled condition” is course slang that will not match docs, kubectl explain, or interview answers that expect the real condition and reason. The remediation claim (no rollback, keeps retrying) is correct.
  fix:     It sets <b>Progressing=False</b> with reason <b>ProgressDeadlineExceeded</b>. That is all.<br>It does not roll back, does not stop retrying, and does not remediate. The deadline is status evidence, not a policy — treating it as automatic recovery is how a stalled rollout stays stalled overnight.

[u26l2::global-backoff-awkward] back · imprecise
  problem: Per-index accounting lets healthy indexes finish and records failed indexes. If any index is permanently failed, the Job still ends Failed once work stops (unless successPolicy says otherwise). “You get a result instead of an abort” can be read as overall success with partial work. The real win is named failures and preserved completed indexes, not a successful Job.
  fix:     A few permanently broken indexes can exhaust a global budget and stop work that would have succeeded.<br>Per-index accounting lets healthy indexes finish and <b>names</b> the failed ones. The Job still ends Failed if any index is permanently failed, but you keep completed work and a named failure set instead of one shared retry budget wiping unfinished indexes mid-run.

[u26l2::job-result-protocol] back · imprecise
  problem: <code>podFailurePolicy</code> requires the Pod template <code>restartPolicy: Never</code>. Omitting that coupling is the practical trap: candidates write invalid Jobs and misread exam tasks. The rest of the knob list is sound on a 1.36 baseline.
  fix:     <b>Indexed completion</b> — a stable index per unit of work.<br><b>backoffLimitPerIndex</b> — retries bounded per index.<br><b>podFailurePolicy</b> — classify outcomes, so a permanent exit code need not retry. Requires <code>restartPolicy: Never</code> on the template.<br><b>successPolicy</b> — declare success before every index finishes.<br><b>activeDeadlineSeconds</b> — cap total active time.

---

## Style

[u19l2::scheduling-gated] back · style
  problem: One sentence stacks four separate diagnostic actions (read gates, find owner, name prerequisite, ask why not removed). The reader has to unpack a checklist that should be four short imperatives. Same content as the accuracy fix; the packing is what hurts.
  fix:     Not a scheduling-capacity failure — the scheduler is deliberately skipping the Pod.<br>Read the named gates in the spec. Find which controller or admission rule added them. Identify the external prerequisite each gate waits on. Ask why that owner has not removed them.<br>Gates can be removed after creation but not newly added.

[u17l2::pending-dra] back · style
  problem: Even as a diagnostic aid, the back is one long comma-joined “inspect A, B, C, then D” line with no main claim. The reader cannot tell what to remember. Name the status cut first; keep any checklist short and secondary.
  fix:     Status on the <b>Pod</b>, the <b>ResourceClaim</b> and the <b>ResourceSlice</b>.<br>Unallocated claims point at selectors, inventory and the scheduler. Allocated but unprepared claims point at the DRA driver and kubelet on the chosen node. That status cut separates the owners; the Pod alone does not.

[u20l2::phase-implies] front · style
  problem: “What does each Pod phase point at?” forces a false parallel before the back is read. Even with a corrected back, the front keeps teaching the wrong category. Rename the question so phase and waiting reason are not one set.
  fix:     What do Pod phase and common container waiting reasons each point at?

---

## Notes (not findings)

- u15 cards (Gateway ownership, accepted-not-served, Service diagnosis) are accurate and clear.
- u16 exclusive-CPU, limit-vs-isolation, and feasible-not-local cards match the node-local vs aggregate teaching.
- u17 device-plugin vs DRA pair is slightly redundant but both are accurate; not flagged.
- u19 has no PDB card despite the unit teaching “PDB is not a gate” and the Eviction API boundary; coverage gap only, not a card error.
- u23 helm-success and SSA-conflict cards already encode the careful wait-flag and managedFields teaching.
- u24 quota/LimitRange/resize cards are accurate on admission vs Pending, deferred actuation, and QoS immutability under in-place resize.
- u25 locality and EndpointSlice eligibility cards are accurate.
- u27 PSA modes, Restricted-is-not-a-claim, RuntimeClass, and user-namespace cards are accurate.

ACCURACY: 12 findings
STYLE: 3 findings
