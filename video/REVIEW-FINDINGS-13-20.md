# Technical review: modules 13–20

Baseline: Kubernetes v1.36. The latest published CKA curriculum referenced in
prior reviews is v1.35.
[Kubernetes v1.36 release](https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/),
[node-pressure eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/),
[Topology Manager](https://kubernetes.io/docs/tasks/administer-cluster/topology-manager/),
[DRA](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/),
[Pod lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/).

---

## Findings

[u13] skew-boundaries · imprecise
  claim:   “Control-plane components, kubelets, kube-proxy, the container runtime, the network implementation and the stored API versions all have their own skew contracts.”
  problem: Control plane, kubelet, and kube-proxy participate in the published Kubernetes version-skew policy (for example kubelet up to three minor versions behind the control plane, with kubeadm’s own manageability rules on top). Container runtimes, CNI plugins, and etcd storage / API deprecation are compatibility and support constraints, not the same formal skew contract. Listing all six as equivalent “skew contracts” teaches the wrong category for three of them. Visual “six independently versioned boundaries” reinforces that.
  fix:     “Upgrades move one compatibility boundary at a time, because there is more than one. Control-plane components, kubelets and kube-proxy have version-skew rules. The container runtime, the network plugin and the APIs you still store have their own compatibility limits. Treating the cluster as a single version is what turns an upgrade into an outage.”

[u13] static-pod-first-check · omission
  claim:   “Read the manifest directory and the kubelet, and treat the API's view as a reflection rather than the truth.”
  problem: Within this unit’s static-Pod and reboot scope, CKA performance work needs the concrete path kubeadm uses: `/etc/kubernetes/manifests`, plus kubelet logs and `crictl`/`systemctl` on the node. “The manifest directory” never names it, so a candidate can leave the unit without the check the exam actually rewards.
  fix:     “Read `/etc/kubernetes/manifests` and the kubelet. If a manifest is missing or unreadable, the mirror Pod in the API is not the process. Treat the API view as a reflection rather than the truth.”

[u13] safe-not-successful · omission
  claim:   “A version-skew check before you start. etcd and API health verified between every step, not just at the end.”
  problem: The unit promises what makes an upgrade safe. CKA grades the kubeadm path: `kubeadm upgrade plan`, `kubeadm upgrade apply` on the first control plane, `kubeadm upgrade node` on others, then package and kubelet upgrades, with drain/uncordon on workers. The checklist never names those commands, so the highest-value exam skill in this unit stays abstract.
  fix:     “A version-skew check before you start — `kubeadm upgrade plan` is that check on a kubeadm cluster. etcd and API health between every step. One failure domain at a time. Drain where it applies. `kubeadm upgrade apply` then `kubeadm upgrade node`, then the kubelet packages. And rollback material you have actually verified.”

[u14] stale-credential · omission
  claim:   “Environment delivery needs the Pod restarted. Volume projection updates eventually, so you may simply be early. The process may have read the value once and cached it. Or nothing rolled at all, because the Pod template never changed.”
  problem: A volume mount using `subPath` does not receive ConfigMap or Secret updates. That is a fifth common cause of “file is there, value is old,” and it is a standard exam and interview trap. Immutable ConfigMaps and Secrets also never update mounted data. Four candidates is incomplete for the symptom the beat sets up.
  fix:     “Environment delivery needs the Pod restarted. A normal volume mount updates eventually, so you may simply be early. A subPath mount never updates, and neither does an immutable object. The process may have read the value once and cached it. Or nothing rolled at all, because the Pod template never changed.”

[u14] secret-is-not-encryption · misleading
  claim:   (visual) “RBAC on the resource, encryption at rest, external secret lifecycle. Each drawn as a switch, defaulting off”
  problem: Encryption at rest is off until you configure it. RBAC is not. API authorization is on by default; the risk is overly broad Roles and bindings, not that RBAC is disabled. Drawing RBAC as a switch defaulting off teaches the wrong default. Narration is fine; the visual is not.
  fix:     “Base64 is a representation, not encryption. A Secret is a distinct resource type you control with RBAC, and it can be encrypted at rest if you configure that. RBAC is already in the request path. Encryption at rest is optional. The name Secret protects nothing by itself.”
  visual:  Draw encryption at rest and external lifecycle as optional switches. Draw RBAC as already present, with broad grants as the failure mode, not as a switch left off.

[u14] close · misleading
  claim:   “something died and the object state does not say who killed it. Both are answerable from the node, and neither is visible from the API alone.”
  problem: Kubelet eviction sets Pod phase `Failed` with reason `Evicted`. Kernel OOM often leaves `lastState.terminated.reason: OOMKilled` on the container status. Those are API-visible. Node logs still matter for confirmation, but “object state does not say who killed it” and “neither is visible from the API alone” overstate the gap and train candidates to skip `kubectl describe` and container status.
  fix:     “Nothing changed when you expected it to, or something died and you have to separate eviction from OOM. Evicted and OOMKilled often appear in object status. When they do not, the node still holds the rest. Do not stop at the Deployment.”

[u15] policy-permits · imprecise
  claim:   “NetworkPolicy selects Pods and the peers and ports allowed to reach them.”
  problem: That wording is ingress-only. Egress rules select peers and ports the Pod may contact. NetworkPolicy covers both directions as separate rule sets. “Allowed to reach them” erases egress.
  fix:     “NetworkPolicy selects Pods and the peers and ports allowed for ingress and for egress. Enforcement belongs to the network implementation, not to the object. And permission is not a path.”

[u16] hint-protocol · misleading
  claim:   “Topology Manager merges those hints under a configured policy. If a coherent placement exists, the managers enact it. If it does not, the Pod fails admission on that node.”
  problem: Rejection is policy-dependent. `none` does no alignment. `best-effort` admits even when the preferred affinity is unavailable. Only `restricted` and `single-numa-node` fail admission when a preferred coherent placement cannot be satisfied. Stating failure as the general outcome is false under the default and best-effort policies.
  fix:     “Topology Manager merges those hints under a configured policy. Under restricted or single-numa-node, a missing coherent placement fails admission on that node. Under best-effort, the Pod still admits without the preferred alignment. Under none, there is no alignment step at all.”

[u16] admission-rejection · misleading
  claim:   “So a Pod can be scheduled and then rejected by the very node it was sent to, with a topology error.”
  problem: True as far as it goes, and incomplete in a way that misleads diagnosis. On rejection the Pod becomes Failed with a topology admission failure (commonly shown as TopologyAffinityError). The scheduler does not reschedule that Pod object. Without a controller recreating it, it stays failed on that node. Candidates waiting for Pending→reschedule will wait forever.
  fix:     “So a Pod can be scheduled and then rejected by the very node it was sent to. The Pod fails admission with a topology error and stays Failed. The scheduler will not move that object. A Deployment or other controller has to create a replacement if you want another try.”

[u16] single-numa-node · wrong
  claim:   (visual) “Show a rejected Pod going back to Pending rather than being placed somewhere better.”
  problem: Official Topology Manager behaviour: rejection yields a terminated / Failed Pod with admission failure. The scheduler does not put it back to Pending and does not try another node for that same Pod. The visual teaches the opposite lifecycle. Narration correctly says the policy does not find a better node, but never corrects the Failed vs Pending outcome.
  fix:     “And single-numa-node is a promise about admission, not about placement. It tells the kubelet to refuse any Pod whose resources cannot be satisfied from one NUMA node. The Pod fails on that node. It does not return to Pending, and it does not get placed somewhere better. Strictness here produces rejections, not smarter scheduling.”
  visual:  Show admission refusing the Pod into Failed / TopologyAffinityError, with the scheduler upstream unaware and not rebinding that Pod.

[u16] close · wrong
  claim:   “The Pod was placed and then refused, or it runs and misses its latency target while every average looks fine. Neither is visible from the control plane.”
  problem: Topology admission failure is visible from the API: Pod phase Failed, reason TopologyAffinityError, events on the object. Latency without high utilisation is the signature that needs node-level metrics. “Neither” is false for the first signature.
  fix:     “The Pod was placed and then refused — that refusal is on the Pod object. Or it runs and misses its latency target while every average looks fine — that one lives on the node. Know which evidence lives where.”

[u17] dra-handshake · imprecise
  claim:   “The scheduler then allocates a matching device and, in the same decision, picks a node that can reach it.”
  problem: Under structured DRA (stable path through v1.35+), the scheduler allocates into the ResourceClaim and binds the Pod to a node that can access the allocation. Framing it as one indivisible “same decision” is close enough for teaching, but binding conditions (beta) can delay bind after allocation while an external controller prepares the device. “Only after that node is chosen does preparation happen” remains the common case; with binding conditions, some preparation is a precondition for bind. Version-sensitive around binding conditions; say so rather than over-smooth.
  fix:     “Drivers publish availability first. The scheduler allocates a matching device into the claim and selects a node that can reach it. On that node the kubelet and driver prepare the device before the container uses it. Some drivers add binding conditions so preparation must finish before bind. Allocation still precedes use.”

[u18] when-aggregation · imprecise
  claim:   “CRDs already give you CRUD, watch, schema, status and scale for free.”
  problem: CRUD, watch and structural schema are the generic CRD path. Status and especially the scale subresource are enabled per version in the CRD, not automatic for every CRD. “Scale for free” overstates what a bare CRD gives you.
  fix:     “CRDs already give you CRUD, watch and schema on the generic server. Status and scale are available when you enable them on the CRD. Aggregation earns its cost only for behaviour the generic server cannot supply. Custom storage, unusual subresources, or responses computed rather than stored.”

[u20] phase-vs-events · wrong
  claim:   “Pending points at admission, quota, scheduling or claims. ContainerCreating points at image, sandbox, network or mounts. CrashLoopBackOff points at a process or probe that keeps failing. Running but not Ready points at readiness, a dependency, or endpoint selection. Four phases, four different places to look.”
  problem: Pod phases are Pending, Running, Succeeded, Failed, and Unknown. ContainerCreating and CrashLoopBackOff are not phases. They are container waiting reasons / kubectl STATUS display values while the Pod phase is often still Pending or Running. Official docs warn not to confuse kubectl STATUS with phase. Teaching four “phases” that mix phase and reason trains the wrong model for every `kubectl get pods` and describe read on the exam.
  fix:     “Phase names the Pod. Waiting reasons name the attempt. Pending points at admission, quota, scheduling or claims. A Running or Pending Pod with ContainerCreating points at image, sandbox, network or mounts. CrashLoopBackOff is a waiting reason for a container that keeps failing under the restart policy. Running but not Ready points at readiness, a dependency, or endpoint selection. Four different places to look — do not call them four phases.”

[u20] control-plane-order · imprecise
  claim:   “For one unhealthy control-plane node, work from outside in. Confirm what the load balancer thinks.”
  problem: Multi-control-plane clusters often have an API load balancer; single-node kubeadm labs and many CKA tasks do not. Starting every control-plane diagnosis at “the load balancer” assumes topology the exam cluster may not have.
  fix:     “For one unhealthy control-plane node, work from outside in. If an API load balancer exists, confirm what it thinks. Locate which boundary is actually failing. Then descend into the node: static Pod manifests, the kubelet, the runtime, certificates. Preserve evidence before restarting anything.”

[u20] previous-logs · imprecise
  claim:   “the previous instance's log is still retrievable, and lastState records how the last one ended. Between them you can separate a process exiting on its own, a signal, an out-of-memory kill, and a probe-driven restart. Four causes, one command apart.”
  problem: `kubectl logs --previous` works only while the runtime still has the previous container. Garbage collection of dead containers can remove it. Probe-driven restarts often look like a signal kill in lastState; events are what separate liveness failures cleanly. “Still retrievable” and “one command apart” over-promise.
  fix:     “When a container restarts too fast to inspect, use the same Pod identity. Try the previous container’s logs while they still exist. Read lastState for exit code, signal and OOMKilled. Read events for probe failures. Those separate a process exit, a signal, an out-of-memory kill, and a probe-driven restart.”

---

## CKA preparation notes

**u13 CKA:** Exam-aligned: kubeadm composes then exits, static Pod manifests on disk, mirror Pods as reflections, drain ≠ upgrade, worker evacuate → change → verify → uncordon, control-plane upgrade caution and skew awareness. Interview/ops depth: Helm vs Kustomize packaging (more CKAD/delivery than classic CKA). Gaps to close: name `/etc/kubernetes/manifests` and the kubeadm upgrade command sequence.

**u14 CKA:** Exam-aligned: ConfigMap/Secret env vs volume delivery, Deployment rolls only on Pod template change, Secret is not encryption, QoS derived from requests/limits, eviction vs OOM, ranking is not “BestEffort first” as a slogan. Interview depth: full eviction multi-signal behaviour. Gaps: subPath and immutable objects as non-updating mounts; do not teach that killer identity is invisible in the API.

**u15 CKA:** Exam-aligned: Service/EndpointSlice diagnosis order, NetworkPolicy permission vs path, CNI must implement policy. Ingress objects as intent plus controller is exam-useful. Gateway API ownership split and HTTPRoute status are increasingly interview and platform depth; treat as bonus relative to classic CKA, not as the only routing model the exam expects.

**u16 CKA:** Almost entirely interview / performance-engineering depth. Topology Manager, CPU Manager static policy, and NUMA admission are not typical CKA tasks. If kept for interviews, the Failed-not-Pending rejection lifecycle must be exact so it does not poison general scheduling mental models.

**u17 CKA:** DRA (stable in 1.35, resource.k8s.io/v1) is not a CKA core objective today. Device plugins as extended resources may appear in discussion questions; claim/template lifecycle and ResourceSlice status are interview/platform depth. Do not imply the exam requires DRA YAML.

**u18 CKA:** Aggregation, watch BOOKMARK/410, ValidatingAdmissionPolicy, and review APIs are interview and CKA-adjacent RBAC depth. SubjectAccessReview / impersonation can support authz questions; full aggregation ops is not classic CKA. Version note: ValidatingAdmissionPolicy is the in-process validation path; mutation is a separate API.

**u19 CKA:** PDB vs non-voluntary disruption is exam-core. Finalizers as deletion holds are exam-useful. Leader-election Leases, node heartbeat Leases, and scheduling gates are mostly interview depth with real troubleshooting value (NotReady + kube-node-lease; Pending SchedulingGated).

**u20 CKA:** Strongly exam-aligned method: nearest authority, control-plane descent, NotReady evidence (Lease, conditions, kubelet/runtime/CNI), phase vs events (once terminology is fixed), previous logs, Service timeout layering after DNS. Keep kubeadm-style host access; do not assume a managed control plane you cannot SSH to.

**Exam-environment risk:** u20’s load-balancer-first step can mislead on single-node kubeadm clusters. u16’s implied reschedule-after-topology-reject would waste exam time. u14’s “API will not say who killed it” would cause candidates to skip status fields the exam expects. No script assumes a cloud-managed etcd you cannot touch; that matches CKA.

---

## Verdicts

u13 VERDICT: 3 CORRECTIONS NEEDED
u14 VERDICT: 3 CORRECTIONS NEEDED
u15 VERDICT: 1 CORRECTION NEEDED
u16 VERDICT: 4 CORRECTIONS NEEDED
u17 VERDICT: 1 CORRECTION NEEDED
u18 VERDICT: 1 CORRECTION NEEDED
u19 VERDICT: ACCURATE
u20 VERDICT: 3 CORRECTIONS NEEDED
