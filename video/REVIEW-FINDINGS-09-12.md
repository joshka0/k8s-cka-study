# Technical review: modules 09–12

Baseline: Kubernetes v1.36. The latest published CKA curriculum is v1.35.
[Kubernetes v1.36 release](https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/),
[CKA curriculum](https://github.com/cncf/curriculum).

---

## Findings

[u09] resolve-trace · wrong
  claim:   “Take payments.prod.svc.cluster.local. That name is already absolute, so search expansion does not apply at all.”
  problem: Under the default Pod resolv.conf (`options ndots:5`), a name is only tried as absolute first when it contains at least five dots. `payments.prod.svc.cluster.local` has four dots, so the libc resolver applies the search list first, then falls back to the absolute form. Only a trailing dot marks the name fully qualified and skips search entirely. This beat contradicts the ndots lesson it follows. The visual must not show “no expansion” for this name without a trailing dot. [resolv.conf ndots](https://man7.org/linux/man-pages/man5/resolv.conf.5.html), [DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
  fix:     “Take payments.prod.svc.cluster.local. It looks complete, but with ndots five it still has only four dots, so the search list runs first. Append a trailing dot and search expansion stops. One absolute query goes to the configured DNS endpoint, which may be the node-local cache. CoreDNS answers from watched Service and EndpointSlice state. The reply travels back over the node network path.”

[u09] ready-proves-little · imprecise
  claim:   “CoreDNS reports Ready. That has proven the process is up.”
  problem: Pod Ready means the configured readiness endpoint passed. With CoreDNS’s ready plugin, the kubernetes plugin reports ready only after its informers have synced to the API. Ready therefore means more than “process is up,” but still does not prove Service routing, continuous watch health after that sync, record correctness over time, upstream health, cache freshness, the node-local path, or client resolver behaviour. [CoreDNS kubernetes ready](https://coredns.io/plugins/kubernetes/)
  fix:     “CoreDNS reports Ready. That means its readiness check passed — for the kubernetes plugin, after an initial API sync. It has not proven Service routing to the DNS Service. It says nothing about whether the watch stays fresh, or the correctness of records later. Nothing about upstream health for forwarded names. Nothing about cache freshness or the node-local path. And nothing at all about the resolver behaviour of the client that is asking.”

[u09] ndots-cost · imprecise
  claim:   “Multiply that by every request an application makes and it becomes latency and load that nobody can attribute.”
  problem: Application and resolver caches, and CoreDNS or NodeLocal positive/negative caching, mean not every connection opens a full search cascade. The amplification is real for uncached lookups; stating “every request” overstates it.
  fix:     “Multiply that by uncached lookups and it becomes latency and load that nobody can attribute.”

[u09] close · omission
  claim:   “A failure here has a signature: the name is wrong, or the answer is stale, or the query never went where you assumed.”
  problem: Within this module’s DNS scope, a CKA candidate still needs the practical edit and debug surfaces: the CoreDNS ConfigMap in kube-system, CoreDNS Pod logs, and a debug Pod using dig or nslookup. The exam is performance-based. The script names signatures but not the checks. [CKA networking and troubleshooting objectives]
  fix:     “Check the Pod’s resolv.conf first. Then dig against the kube-dns Service and against a CoreDNS Pod IP. Read the coredns ConfigMap and the CoreDNS logs. Those four checks separate client policy, Service routing, configuration, and stale watches.”

[u10] claim-to-mount · wrong
  claim:   “End to end, the journey has a fixed order. The claim is created. The provisioner sees it and creates the volume with the storage provider. The attacher attaches that volume to the chosen node, and a VolumeAttachment records it.”
  problem: Ownership and order are wrong. The attach-detach controller creates the VolumeAttachment. The external-attacher watches that object and calls ControllerPublishVolume. Scheduling (or delayed binding under WaitForFirstConsumer) must select a node before attach. With WaitForFirstConsumer, CreateVolume does not run immediately after claim creation. NodeStageVolume is optional (STAGE_UNSTAGE_VOLUME capability). Presenting six fixed steps as universal is false for both Immediate and WaitForFirstConsumer paths. The visual must not show the attacher creating VolumeAttachment, or provision always before any scheduler involvement. [external-attacher](https://github.com/kubernetes-csi/external-attacher), [StorageClasses volumeBindingMode](https://kubernetes.io/docs/concepts/storage/storage-classes/#volume-binding-mode)
  fix:     “End to end, the path has ordered stages, not one fixed Immediate sequence. The claim is created. Under Immediate, the provisioner creates the volume and the PV binds. Under WaitForFirstConsumer, the scheduler picks topology first, then the provisioner creates the volume there. After a node is known, the attach-detach controller creates a VolumeAttachment. The external-attacher calls ControllerPublishVolume. The node plugin may run NodeStageVolume once per volume per node. It then runs NodePublishVolume into the Pod path. Only then does the kubelet start containers that need that mount.”

[u10] topology-handshake · misleading
  claim:   “The scheduler cannot place the Pod until it knows where the volume can exist. The provisioner will not create the volume until it knows where the Pod is going.”
  problem: WaitForFirstConsumer is not a mutual standoff. The scheduler places (or selects topology) first using Pod constraints and CSI topology or capacity signals. The provisioner then creates the volume for that topology. The first sentence treats an existing volume location as a prerequisite for dynamic provisioning, where the volume does not exist yet. The visual of each side waiting on the other is factually wrong. [Topology-aware volume provisioning](https://kubernetes.io/docs/concepts/storage/storage-classes/#volume-binding-mode)
  fix:     “With WaitForFirstConsumer, storage is not a later phase after a blind schedule. The scheduler selects a node using the Pod’s constraints and the driver’s topology signals. Only then does the provisioner create the volume in that topology. If no node can satisfy both compute and storage topology, the Pod stays unschedulable.”

[u10] two-halves · imprecise
  claim:   “On the control-plane side, four sidecars watch Kubernetes objects and call CSI Controller RPCs: provisioner, attacher, resizer and snapshotter.”
  problem: external-resizer and external-snapshotter ship only when those features are deployed. Many production drivers run provisioner and attacher without resizer or snapshotter. Naming four as the fixed controller half overstates the common case. [CSI sidecar containers](https://kubernetes-csi.github.io/docs/sidecar-containers.html)
  fix:     “On the control-plane side, sidecars watch Kubernetes objects and call CSI Controller RPCs. external-provisioner and external-attacher are the common pair. external-resizer and external-snapshotter join only when those features are installed.”

[u10] stage-vs-publish · imprecise
  claim:   “NodeStageVolume happens once per node, and it makes the device usable. NodePublishVolume happens per Pod target path, and it bind-mounts that staged device into the container.”
  problem: NodeStageVolume runs only if the driver advertises STAGE_UNSTAGE_VOLUME. Without that capability, the kubelet goes straight to NodePublishVolume. Stage is once per volume per node, not once per node for all volumes. [CSI NodeServiceCapability](https://github.com/container-storage-interface/spec/blob/master/spec.md)
  fix:     “When the driver supports stage, NodeStageVolume runs once per volume per node and makes the device usable on that node. NodePublishVolume then runs per Pod target path and bind-mounts into the container. If the driver has no stage capability, only publish runs. Knowing which call failed tells you whether you are debugging the device or the bind mount.”

[u10] three-objects · omission
  claim:   “A PVC is a namespaced request for storage… A PV is cluster-scoped capacity and its lifecycle. A StorageClass is the recipe: how to provision, and when to bind.”
  problem: Within claim/class/volume scope, CKA still tests access modes (RWO, ROX, RWX, RWOP) and reclaim policy (Retain vs Delete). The script never names either, so a candidate can leave the unit unable to answer standard exam storage questions. [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
  fix:     “A PVC requests size, access mode and class. A PV is cluster-scoped capacity with a reclaim policy. A StorageClass is the recipe: how to provision, and when to bind. Access mode and reclaim policy are part of that contract, not optional detail.”

[u11] two-models · imprecise
  claim:   “API servers are stateless and replaceable. Any one of them can serve any request, so you put a load balancer in front and add more.”
  problem: API servers hold no durable cluster state, but they are not empty processes. They must share compatible configuration: etcd endpoints, admission, authentication, and encryption-at-rest keys. “Stateless” without that caveat encourages the false idea that any binary with the right flags is interchangeable.
  fix:     “API servers hold no durable cluster state and are replaceable behind a load balancer. They must share the same etcd and compatible configuration. etcd members hold replicated state. They form a consensus group, and they are not interchangeable.”

[u11] supported-capture · omission
  claim:   “Use the snapshot command, and keep the export as a supplement rather than a plan.”
  problem: CKA performance tasks require the actual etcdctl snapshot save/restore path: endpoints, cert flags, snapshot verify, restore to a new data directory, and pointing the etcd static Pod at that directory. Conceptual “use the snapshot command” without the operator steps leaves the highest-value CKA skill in this unit untestable. [etcd disaster recovery](https://etcd.io/docs/v3.6/op-guide/recovery/)
  fix:     “Use etcdctl snapshot save with the etcd endpoint and certs. Verify with snapshot status. Restore into a new data directory with snapshot restore. Point the etcd static Pod at that directory and start it. Keep kubectl export as a supplement, not a plan.”

[u11] prove-recovery · imprecise
  claim:   “Restore to a new data directory, never over the live one.”
  problem: Correct as practice for a single-member or rehearsed restore. Multi-member restore requires restoring members into a new cluster or following the etcd restore procedure for each member so Raft identity stays consistent. The line is right for the CKA single-control-plane pattern; it is incomplete for HA etcd without saying so.
  fix:     “Restore to a new data directory, never over the live one. On a multi-member cluster, restore each member with a consistent procedure so Raft membership is rebuilt, not overwritten in place.”

[u12] concurrency-is-finite · imprecise
  claim:   “FlowSchemas classify incoming requests by user, verb and resource.”
  problem: Matching also uses API groups, namespaces, non-resource URLs, service accounts, and groups. User, verb and resource are the common case, not the full classifier. APF is stable since Kubernetes 1.29. [API Priority and Fairness](https://kubernetes.io/docs/concepts/cluster-administration/flow-control/)
  fix:     “FlowSchemas classify incoming requests by attributes such as user, verb, resource, API group and namespace.”

[u12] the-spine · imprecise
  claim:   “Every failure you have studied lands on exactly one segment, and finding which one is the whole job.”
  problem: Many real failures span segments (for example DNS plus Service data plane, or CSI attach plus kubelet mount). Teaching exclusive assignment as universal undercuts the diagnostic method when the first segment check is inconclusive.
  fix:     “Every failure you have studied has a home segment, and often only one. Start there. If the evidence disagrees, walk the neighbouring segment. Finding the right layer is the job.”

[u12] who-and-when · imprecise
  claim:   “When the question is who deleted this object and when, there is exactly one answer: the audit log.”
  problem: Audit is the Kubernetes-native answer only when auditing is enabled, the policy records the request, and the backend still holds the event. The beat later says the honest answer if audit is off is that the information is gone — good. “Exactly one answer” without that condition is too strong up front.
  fix:   “When the question is who deleted this object and when, reach for the audit log. It records API requests and their stages, including identity. Events would not have retained it, and may never have recorded it at all. If audit is not enabled or the event has aged out, the honest answer is that the information no longer exists.”

---

## CKA preparation notes

**u09 CKA:** Exam-aligned claims cover Service DNS names, Pod resolv.conf, ndots/search behaviour, and CoreDNS as cluster DNS. NodeLocal DNSCache, plugin.cfg compile order, and fallthrough vs forward are mainly interview depth. Add practical ConfigMap and dig checks so the unit matches exam performance work.

**u10 CKA:** Exam-aligned claims cover PVC, PV, StorageClass, WaitForFirstConsumer, and mount-failure triage. CSI sidecar architecture, stage vs publish RPCs, and topology handshake depth are mainly interview. Access modes and reclaim policy are exam-core and must not stay implicit.

**u11 CKA:** Exam-aligned claims cover quorum maths, API-server vs etcd HA, snapshot vs filesystem copy, and what a snapshot omits. etcdctl save/verify/restore and static Pod data-dir rewiring are the practical exam skill; teach the commands, not only the principles. Multi-member restore detail is interview/ops depth beyond typical single-node CKA tasks.

**u12 CKA:** API Priority and Fairness objects, seats, and shuffle sharding are not CKA exam material; they are interview and senior-ops depth (APF stable since 1.29). The evidence hierarchy (events, logs, metrics, audit, object state) maps to real troubleshooting on the exam. Do not teach APF as if the exam will require FlowSchema YAML.

**Exam-environment risk:** None of these four scripts assume a managed control plane for etcd or DNS. u11 correctly treats etcd as operator-accessible, which matches CKA kubeadm-style clusters. No managed-cluster trap found.

---

## Verdicts

u09 VERDICT: 4 CORRECTIONS NEEDED
u10 VERDICT: 5 CORRECTIONS NEEDED
u11 VERDICT: 3 CORRECTIONS NEEDED
u12 VERDICT: 3 CORRECTIONS NEEDED
