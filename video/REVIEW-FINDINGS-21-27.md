# Technical review: modules 21–27

Baseline: Kubernetes v1.36. Prior arc reviews used CKA curriculum v1.35 as
the exam reference.
[RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/),
[Deployments progress deadline](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/),
[Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/),
[EndpointSlices](https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/),
[In-place resize](https://kubernetes.io/docs/tasks/configure-pod-container/resize-container-resources/),
[Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/).

---

## Findings

[u21] escalation-paths · misleading
  claim:   “The right to create bindings, because that lets a subject grant itself more.”
  problem: Creating RoleBindings or ClusterRoleBindings does not freely escalate. The RBAC API blocks binding a Role or ClusterRole unless the subject already holds every permission in that role at the binding’s scope, or holds the `bind` verb on that role. Creating or editing Roles themselves needs the contained permissions or the `escalate` verb. Teaching “create bindings” as an automatic self-grant path is false under default API enforcement and will fail real audits and exam answers that expect `bind` / `escalate`.
  fix:     “Three things turn indirect authority into real privilege, and they are worth auditing by name. The right to bind roles you do not already hold — create on bindings is not enough without `bind` or the permissions themselves. Impersonation, because it borrows another identity outright. And aggregation, because a ClusterRole can absorb rules from others as labels change. Audit the reachable permission graph, not the Role you were shown.”

[u21] close · wrong
  claim:   “A request is refused and no rule ever granted it, or a node cannot speak for itself at all. Both are answered in the authorization layer, not in the workload.”
  problem: A missing RBAC grant is authorization. A kubelet certificate or bootstrap failure is authentication: the request never becomes an authorized principal. The cert-errors beat correctly frames that as identity; the close re-labels it authorization. That collapses the authn/authz boundary the series has been teaching.
  fix:     “A request is refused and no rule ever granted it, or a node cannot authenticate and speak for itself at all. One is authorization. The other is identity. Neither is answered in the workload.”

[u22] one-narrow-pipeline · imprecise
  claim:   “kubectl top reads exactly one path. The kubelet exposes summarised CPU and memory usage. metrics-server collects it and serves the aggregated metrics API. kubectl and the horizontal autoscaler consume that.”
  problem: Resource-metric HPA does consume metrics-server / `metrics.k8s.io`. HPA also has custom and external metric paths (`custom.metrics.k8s.io`, `external.metrics.k8s.io`) that do not go through this pipeline. Saying the autoscaler consumes “that” as if it were the only HPA path overstates the chain. kubectl top is correctly limited to this path.
  fix:     “kubectl top reads exactly one path. The kubelet exposes summarised CPU and memory usage. metrics-server collects it and serves the aggregated metrics API. kubectl top and resource-metric autoscaling consume that. Custom and external HPA metrics are separate APIs. It is built for recent resource signals. It is not application metrics, not durable history, not logs, and not control-plane health.”

[u23] helm-success · misleading
  claim:   “The release succeeded means the objects were rendered and accepted. It does not mean a Deployment converged, a probe passed, or an image existed. Those are reported by object status and events, which the release record never consults.”
  problem: Default `helm install` / `upgrade` without readiness waiting matches that claim. With `--wait` (and `--atomic`), Helm polls object readiness before marking the release successful, so a green release can require probes and available replicas within the timeout. “Never consults” is false for those flags. The useful teaching — green release is not continuous reconciliation or full app health — still holds, but the absolute wording overreaches.
  fix:     “So when Helm reports a successful release and the Pods are unhealthy, nothing is contradictory by default. Without wait flags, success means the objects were rendered and accepted. Even with wait, success is a one-shot readiness check at install time, not continuous reconciliation. Object status and events still own what the workload is doing now.”

[u23] render-then-reconcile · imprecise
  claim:   “Both produce API objects, and there the tool's job ends.”
  problem: Helm’s job does not always end at apply. Hooks, `--wait`, `--atomic` rollback, and tests extend the tool past a single write. Kustomize client-side apply is closer to pure render. The two-state-machine teaching is right; “there the tool’s job ends” is too absolute for Helm.
  fix:     “Kustomize composes overlays. Helm renders a chart and tracks release metadata. Both produce API objects that enter ordinary admission, storage and reconciliation. Helm may wait or run hooks at install time. Neither tool becomes the continuous controller for your application.”

[u24] limitrange-vs-quota · imprecise
  claim:   “A LimitRange shapes a single object: it can default and constrain the requests and limits of each container or Pod.”
  problem: LimitRange also applies to PersistentVolumeClaim storage requests (`type: PersistentVolumeClaim`). Saying only container or Pod under-states the API and can leave a CKA candidate surprised by PVC defaults and max claim size in the same namespace policy object.
  fix:     “A LimitRange shapes a single object: it can default and constrain container and Pod compute, and it can constrain PVC storage requests. A ResourceQuota budgets the namespace in aggregate, capping total consumption and object counts. One shapes what you submitted. The other decides whether there is room for it.”

[u25] conditions-encode-more · imprecise
  claim:   “Membership comes from the selector.”
  problem: For Services with a selector, yes. Services without a selector use manually managed Endpoints or EndpointSlices; membership is not derived from a selector at all. Stating selector membership as universal is false for that common external-name / multi-cluster / bring-your-own-endpoints pattern. The rest of the ready / serving / terminating teaching is sound.
  fix:   “Membership comes from the Service selector when there is one, or from manually managed Endpoints and EndpointSlices when there is not. The conditions then distinguish ready, serving and terminating. An endpoint can be present and not ready. It can be terminating and still serving, which is exactly what lets a graceful shutdown drain. Reading membership alone tells you an address exists, not that anything will use it.”

[u26] per-index-backoff · imprecise
  claim:   “Per-index accounting lets healthy indexes finish while naming exactly which ones are permanently failed. You get a result instead of an abort.”
  problem: Healthy indexes do finish and `completedIndexes` / `failedIndexes` name outcomes. If any index is permanently failed, the Job controller still marks the overall Job Failed after indexes finish (unless you only care about partial index status). “A result instead of an abort” can be read as the Job succeeding with partial work. Docs: with `backoffLimitPerIndex`, any failed index yields a failed Job once work stops; `maxFailedIndexes` can abort early. Partial progress is recorded; overall success is not automatic.
  fix:     “Per-index accounting lets healthy indexes finish and records exactly which indexes failed. The Job still ends Failed if any index is permanently failed, but you keep completed work and a named failure set instead of one global retry budget wiping unfinished indexes mid-run.”

[u26] job-knobs · omission
  claim:   “podFailurePolicy classifies Pod outcomes, so a permanent exit code need not be retried at all.”
  problem: Within this beat’s Job protocol scope, using `podFailurePolicy` requires the Pod template `restartPolicy: Never`. Without that constraint, candidates will write invalid Jobs and misread exam tasks. The feature is stable since 1.31; `backoffLimitPerIndex` is stable since 1.33 — fine on a 1.36 baseline, but the restartPolicy coupling is the practical trap.
  fix:     “podFailurePolicy classifies Pod outcomes, so a permanent exit code need not be retried at all. It requires restartPolicy Never on the template. successPolicy can declare success before every index finishes. And activeDeadlineSeconds caps total active time regardless.”

[u27] spec-not-runtime · misleading
  claim:   “And what it evaluates is the Pod spec. A securityContext requests runtime settings — user and group IDs, capabilities, seccomp, filesystem behaviour — and admission checks that those requests satisfy the standard.”
  problem: PSA evaluates the whole Pod for the chosen standard, not only `securityContext`. Baseline and Restricted also forbid or constrain `hostNetwork` / `hostPID` / `hostIPC`, `hostPath`, privileged containers, host ports, and certain volume types. Anchoring the beat on securityContext alone teaches too narrow a checklist and will miss common Forbidden reasons on the exam.
  fix:     “And what it evaluates is the Pod spec. securityContext fields, host namespaces, volume types, privileged mode, and related settings are checked against the standard before the object is stored. Whether the runtime and kernel actually enforce those settings on the node is a separate question.”

[u27] choose-a-boundary · imprecise
  claim:   “They are complementary rather than alternatives, and both cost you something: scheduling constraints and Pod overhead have to be accounted for either way.”
  problem: RuntimeClass may carry `scheduling` node selectors and `overhead` that the scheduler accounts for. User namespaces (`hostUsers: false`) do not use that same RuntimeClass overhead mechanism; their costs are different — runtime/kernel support, volume and host-namespace restrictions, and node configuration. Saying both require “scheduling constraints and Pod overhead” either way is the wrong cost model for user namespaces.
  fix:     “RuntimeClass selects a node-configured runtime and isolation implementation, and may add scheduling constraints and Pod overhead. User namespaces remap identities within a supported runtime when the Pod opts in. They are complementary rather than alternatives. Account for each feature’s own costs: handler placement and overhead for RuntimeClass, node support and volume limits for user namespaces.”

[u27] psa-modes · omission
  claim:   “Pod Security Admission is selected by namespace labels, which pick a standard level and a mode.”
  problem: Modes are taught (enforce / audit / warn). The three standard levels — privileged, baseline, restricted — are never named. CKA and interview questions routinely ask which label values exist and what restricted adds over baseline. Within this unit’s PSA scope, leaving levels unnamed is a real exam gap.
  fix:     “Pod Security Admission is selected by namespace labels, which pick a standard level and a mode. The levels are privileged, baseline and restricted. Enforce rejects the Pod. Audit records it in the audit log. Warn returns a message to the client and creates it anyway. Only enforce blocks anything.”

---

## CKA preparation notes

**u21 CKA:** Exam-aligned: Role vs ClusterRole, RoleBinding vs ClusterRoleBinding, additive permissions, `kubectl auth can-i`, ServiceAccount as subject, no deny rules. Node bootstrap identity, Node authorizer, and NodeRestriction are interview / advanced admin depth useful for NotReady certificate cases. Fix the bind/escalate story; teach authn vs authz on cert failure. Omission risk: concrete Role/RoleBinding YAML and can-i checks are the exam skill.

**u22 CKA:** Exam-aligned: kubectl top depends on metrics-server, logs / previous logs / describe for crash loops, ephemeral debug, crictl when the API path is dead. Interview depth: three metric kinds and Prometheus as a separate path. Do not send candidates to Prometheus first when top fails on the exam cluster.

**u23 CKA:** Exam-aligned: render then apply, Deployment rolling update surge/unavailable arithmetic, progressDeadlineSeconds reports but does not roll back, SSA field ownership conflicts. Helm release semantics are more CKAD/delivery interview depth; exam still cares that apply success ≠ healthy Pods. Keep the progress-deadline correction — it is a common myth.

**u24 CKA:** Exam-aligned: LimitRange vs ResourceQuota, quota Forbidden vs Pending, defaults counting against quota. In-place resize (GA 1.35) is newer exam surface; desired vs allocated and immutable QoS are correct and worth knowing. Name PVC LimitRange type when teaching LimitRange. Practical `kubectl describe quota` / dry-run apply failures map directly to tasks.

**u25 CKA:** Exam-aligned: ClusterIP / NodePort / LoadBalancer layering, externalTrafficPolicy Local, Service selector → endpoints diagnosis. EndpointSlice ready/serving/terminating and trafficDistribution preferences are stronger interview depth; still valuable for “address exists, nothing serves.” Mention selector-less Services so diagnosis does not assume a selector.

**u26 CKA:** Exam-aligned: container restart vs Pod replacement (UID vs restartCount), Job restartPolicy Never/OnFailure, basic backoffLimit. Native sidecars, podFailurePolicy, backoffLimitPerIndex (stable 1.33), and successPolicy are interview / batch depth on a modern cluster — useful, not classic CKA YAML drills. Keep the OOM same-UID lesson; it stops false Deployment debugging.

**u27 CKA:** Exam-aligned: PSA namespace labels, enforce vs warn vs audit, Restricted vs Baseline as concepts once levels are named. RuntimeClass and user namespaces (GA path on recent versions; user namespaces called out as GA in 1.36 coverage) are interview isolation depth. Teach that PSA is admission on the full Pod spec, not a runtime attestation.

**Exam-environment risk:** u22 correctly treats crictl as node-level when kubectl cannot answer — matches kubeadm CKA. u23 must not imply Helm is required on the exam. u24 in-place resize assumes a cluster new enough to expose the feature; hedge already present (“where policy and node support allow it”) is good — keep it. u21 must not teach that create-on-bindings alone is root. No managed-control-plane trap found; modules assume you can read API objects and node evidence.

---

## Verdicts

u21 VERDICT: 2 CORRECTIONS NEEDED
u22 VERDICT: 1 CORRECTION NEEDED
u23 VERDICT: 2 CORRECTIONS NEEDED
u24 VERDICT: 1 CORRECTION NEEDED
u25 VERDICT: 1 CORRECTION NEEDED
u26 VERDICT: 2 CORRECTIONS NEEDED
u27 VERDICT: 3 CORRECTIONS NEEDED
