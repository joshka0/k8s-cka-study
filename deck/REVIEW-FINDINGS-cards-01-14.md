[u1l1::http-policy-boundary] back · KIND (wrong)
  problem: Components do communicate outside the API server boundary. The API server itself calls webhooks and aggregated APIs, and node components use CRI, CNI, and CSI.
  fix:     <b>kube-apiserver</b>. Kubernetes components use it to coordinate persisted API state. They also use defined interfaces such as admission webhooks, aggregated APIs, CRI, CNI, and CSI.

[u1l1::never-read-etcd] back · KIND (wrong)
  problem: Normal API reads do not run admission, defaulting, or write validation. The card wrongly lists those as read-path protections that direct etcd access skips.
  fix:     The API server applies authentication, authorization, audit policy, version conversion, and supported read and watch semantics. Direct etcd access bypasses those controls and binds the controller to a private storage format. Admission, defaulting, and object validation apply to writes, not ordinary reads.

[u1l1::who-picks-the-node] back · KIND (imprecise)
  problem: The absolute claim excludes static Pods, which the kubelet discovers from its local configuration without a scheduler binding.
  fix:     For an API-created Pod without <code>spec.nodeName</code>, the scheduler records placement as a binding. The kubelet executes Pods assigned to its node. Static Pods are a separate kubelet-managed path.

[u1l2::name-data-plane] back · KIND (misleading)
  problem: The data plane does not always outlive a control-plane outage. Existing workloads and forwarding state can fail for independent reasons.
  fix:     The <b>data plane</b>. It can keep existing processes and programmed forwarding paths working during a control-plane outage. That is why "traffic still flows" is not a sufficient health signal.

[u1l2::traffic-still-flows] front · KIND (wrong)
  problem: Not all change stops. A kubelet can still restart local containers and run probes while the API is unavailable.
  fix:     During a control-plane outage, existing workloads may keep serving. What stops is {{c1::API-mediated change}}: writes, new placement, controller repair, EndpointSlice updates, and Lease renewals. Kubelets can still restart local containers.

[u1l2::what-degrades] back · KIND (misleading)
  problem: "Self-healing" is too broad. Controller-driven replacement stops, but a kubelet can still restart a failed local container.
  fix:     <b>Degrades:</b> new placement, controller-driven replacement, EndpointSlice updates, Lease renewals, and most day-two actions.<br><b>Keeps working:</b> live containers, kubelet-managed local restarts, and packets on viable forwarding paths.

[u2l1::full-request-trace] back · KIND (wrong)
  problem: The order is wrong. Authentication precedes APF, quota is validating admission, and final API validation occurs after mutating and validating admission.
  fix:     <ul><li>Authentication establishes the user and groups</li><li>APF may queue or reject the authenticated request</li><li>Authorization allows or rejects the verb and resource</li><li>The API server decodes, defaults, and converts the object</li><li>Mutating admission may change or reject it</li><li>Validating admission, including quota when enabled, may reject it</li><li>The API strategy validates the final object</li><li>Storage enforces concurrency, persists the object, and then publishes watch events</li></ul>Audit records the configured stages around the request.

[u2l1::gate-order] front · KIND (imprecise)
  problem: The sequence omits APF, defaulting and conversion, and final API validation. Validating admission is not the last validation before persistence.
  fix:     Gate order for a write: authenticate → APF → authorize → default and convert → {{c1::mutating admission}} → {{c2::validating admission}} → final API validation → persist and notify watchers.

[u2l2::blast-radius] back · KIND (imprecise)
  problem: An admission webhook can use a Service reference or a URL. It does not always wait on a Kubernetes Service.
  fix:     Broad match rules create the blast radius: every matching API request waits for the webhook endpoint, TLS handshake, and deadline. Scope rules and object selectors reduce that radius. Failure policy only decides what a call failure means.

[u2l3::concurrency-is-contract] back · KIND (wrong)
  problem: Blindly replaying the same request does not defeat either guard. A stale resourceVersion remains stale, and an Apply ownership conflict remains until intent or ownership changes.
  fix:     Both exist because several actors can write one object. A blind retry does not resolve either guard. Fetch and recompute after a resourceVersion conflict. Resolve field intent or deliberately force ownership after an Apply conflict.

[u2l3::conflict-response] back · KIND (misleading)
  problem: Replaying the same stale body with its stale resourceVersion cannot destroy the other change; the API server rejects it again. The danger starts when a client removes the precondition or rebuilds a full stale update.
  fix:     A conflict means the live object changed after you read it. Fetch the latest object, recompute the desired delta, and retry with bounded backoff. Kubernetes rejects the same stale resourceVersion again. Do not remove the precondition or overwrite unrelated fields.

[u2l3::ssa-conflict-meaning] back · KIND (wrong)
  problem: Ownership alone does not cause an Apply conflict. The submitted value must also differ from the live value owned by another manager. The API request does fail unless the client resolves or forces it.
  fix:     Another field manager owns the field path, and the value you apply differs from the live value. The API server rejects the Apply request. Change your intent, coordinate ownership, or use <code>force</code> deliberately to take ownership and set the value.

[u3l1::name-informer-cache] back · KIND (misleading)
  problem: There is no cluster-wide watch stream shared by every controller. Sharing occurs only among handlers that use the same SharedInformer instance, normally inside one process and factory.
  fix:     The <b>shared informer cache</b>, kept current by a reflector's list and watch. Handlers that use the same SharedInformer instance share its stream and cache. Controllers in other processes normally have their own informers and watches.

[u3l2::external-idempotency] back · KIND (wrong)
  problem: The last sentence contradicts the first bullet. A provider-enforced stable idempotency key prevents a duplicate even when the controller loses the status write.
  fix:     <ul><li>Use a stable, provider-enforced idempotency key derived from the object</li><li>Observe whether the external resource already exists</li><li>Persist the provider identity on the object for later lookup</li></ul>Every phase must be resumable by a fresh process. A lost status write must lead to rediscovery of the same resource, not creation of another one.

[u3l1::puppet-vs-controller] back · KIND (misleading)
  problem: The comparison uses false absolutes. Controllers can reconcile external state, Puppet need not poll, and a Puppet catalog is not inherently the only writer. resourceVersion, managed fields, and finalizers solve Kubernetes API concerns rather than a simple "many controllers" distinction.
  fix:     <b>Holds:</b> both use declared state, idempotent actions, and repeated convergence.<br><b>Breaks:</b> a Puppet agent normally applies a catalog to one host. A Kubernetes controller watches API state and may write API objects or external state. Shared API objects use <code>resourceVersion</code> and managed fields for concurrency and ownership. Finalizers coordinate API deletion.<br>💡 Closest node-level analogy: Puppet agent → kubelet. The kubelet follows Pod specs and delegates work through runtime plugins.

[u4l1::daemonset-vs-job] back · KIND (misleading)
  problem: A DaemonSet targets one Pod per eligible node in steady state, but maxSurge can create an extra Pod during an update. A Job can fail before it reaches its completion count.
  fix:     <b>DaemonSet = coverage:</b> it targets one running Pod per eligible node in steady state. Its update policy can briefly add another Pod, and failures can prevent full coverage.<br><b>Job = completion:</b> it seeks the configured successful completions. It can stop as Failed because of backoff, a deadline, or a Pod failure policy.<br>One tracks a node set. The other tracks completion.

[u4l1::deployment-vs-statefulset] back · KIND (wrong)
  problem: A StatefulSet does not require stable network identity, stable storage, and ordered lifecycle together. Storage is optional, and Parallel pod management can relax deployment and scaling order.
  fix:     Use a StatefulSet when correctness needs one or more of these properties: stable ordinal and network identity, stable per-Pod storage, or ordered deployment and scaling. Storage is optional. <code>podManagementPolicy: Parallel</code> can relax deployment and scaling order. Name the workload invariant instead of saying only that it is a database.

[u5l2::old-object-after-flip] back · KIND (misleading)
  problem: The object is still stored as v1 only if no update or storage migration rewrote it. Its creation date alone does not determine its current stored version.
  fix:     Changing the storage version does not rewrite existing objects. If this object has not since been updated or migrated, it remains stored as v1 and converts on read. Keep conversion working until storage migration has rewritten all old objects.

[u6l1::extension-points] front · KIND (imprecise)
  problem: The card labels an incomplete list as the scheduling framework order. It omits PreEnqueue, PostFilter, PreScore, PreBind, and PostBind.
  fix:     Queue extension points include PreEnqueue and QueueSort. Scheduling cycle: PreFilter → {{c1::Filter}} → PostFilter when needed → PreScore → {{c2::Score}} → Reserve → Permit. Binding cycle: PreBind → Bind → PostBind.

[u6l2::pending-diagnosis] back · KIND (wrong)
  problem: Current scheduler events name failed plugins or constraints, not legacy predicates. Namespace quota rejects Pod creation during admission, so it cannot explain an existing Pending Pod.
  fix:     Start with the Pod's scheduling <b>events</b>. They usually name the failed plugin or constraint and the affected nodes. Then compare requests with allocatable capacity. Check affinity, taints, topology spread, host ports, PVC binding mode, and storage topology. Use evidence to distinguish the causes.

[u6l2::requests-are-currency] front · KIND (imprecise)
  problem: The statement is true for the default resource-fit calculation, not every possible scheduler plugin. A custom plugin can use live telemetry.
  fix:     The default scheduler's resource-fit filter compares declared {{c1::requests}} with allocatable capacity. Live {{c2::utilisation}} does not enter that filter's fit calculation. Custom scheduler plugins can use other signals.

[u7l1::name-pause-container] back · KIND (wrong)
  problem: The pause container is not unconditionally PID 1 for the whole Pod. By default, each container has its own PID namespace. The pause container is PID 1 of a shared Pod PID namespace only when shareProcessNamespace is enabled.
  fix:     The <b>pause container</b>. It anchors the Pod sandbox's shared namespaces, including the network namespace. With <code>shareProcessNamespace: true</code>, it is PID 1 in the shared Pod PID namespace. Otherwise, each container has its own PID namespace.

[u7l1::node-order] front · KIND (wrong)
  problem: Kubernetes does not define this total setup order. Volume work can overlap other setup, so the sequence also contradicts the adjacent node-setup card.
  fix:     After a Pod is bound, the kubelet observes it. Kubernetes does not define one total order for setup. The runtime creates the {{c1::Pod sandbox}}, and required {{c2::CNI}} setup configures its network. Required volumes and the sandbox network must be ready before application containers start.

[u7l2::four-boundaries] back · KIND (misleading)
  problem: The OCI bullet combines two specifications and implies that runc implements the image specification. runc is governed by the OCI Runtime Specification; the OCI Image Specification defines image format.
  fix:     <ul><li><b>CRI</b> — gRPC contract between kubelet and a runtime such as containerd</li><li><b>OCI Runtime Specification</b> — low-level container execution used by runc</li><li><b>OCI Image Specification</b> — container image format</li><li><b>CNI</b> — network attachment for the Pod sandbox</li><li><b>CSI</b> — storage provisioning and node access</li></ul>These contracts have different owners and failure evidence.

[u7l2::runc-layer] back · KIND (imprecise)
  problem: The question asks which specification governs runc's process layer, but the answer also names the unrelated OCI Image Specification.
  fix:     The <b>OCI Runtime Specification</b>. It defines the low-level runtime configuration and lifecycle that runc implements. It sits below CRI and is not an interface that kubelet calls directly.

[u7l2::who-attaches-network] front · KIND (wrong)
  problem: kube-proxy is not the only implementation of Service forwarding. A cluster can replace it with another Service data plane, such as an eBPF implementation.
  fix:     Configuring the network attachment for the Pod sandbox is the job of {{c1::CNI}}. Implementing Service VIP forwarding is the job of {{c2::the Service data plane}}, such as kube-proxy or an eBPF replacement.

[u7l3::startup-probe-scope] back · KIND (wrong)
  problem: The container does not necessarily keep running throughout. After startup failures reach failureThreshold, kubelet kills the container and applies its restart policy. Probe success also takes effect immediately, not only at a failure threshold.
  fix:     A startup probe gates the <b>liveness and readiness probes of the same container</b> until it succeeds. Other containers are unaffected. Success ends the gate immediately. If failures reach <code>failureThreshold</code>, kubelet kills the container and applies its restart policy.

[u8l1::name-endpointslice] front · KIND (wrong)
  problem: EndpointSlices do not list only ready addresses. They can contain ready, not-ready, serving, and terminating endpoints.
  fix:     "The object that lists Service backend addresses and their ready, serving, and terminating conditions."

[u8l2::clusterip-timeout] back · KIND (wrong)
  problem: A successful direct Pod IP test narrows the fault but does not prove the workload is innocent because the source path, policy, and port can differ. For TCP, a closed port normally returns connection refused rather than looking like a timeout.
  fix:     <ul><li>Check Service ports, targetPort, and EndpointSlice conditions</li><li>Test an eligible Pod IP from the same source and path when possible; success narrows the fault to the Service path or configuration</li><li>Inspect kube-proxy rules or BPF maps and connection tracking</li><li>Inspect routing, MTU, and NetworkPolicy</li><li>Verify that the application listens on the target port</li></ul>For TCP, a timeout normally means a drop or no response. A closed port normally returns connection refused.

[u9l1::resolve-end-to-end] back · KIND (wrong)
  problem: The name has four dots and no trailing dot. With the default ndots:5, the resolver tries search-suffixed forms before the absolute form.
  fix:     With the default <code>ndots:5</code>, this four-dot name is tried with search suffixes before its absolute form. Add a trailing dot, <code>payments.prod.svc.cluster.local.</code>, to make it absolute immediately. The resolver sends queries to its configured DNS endpoint, possibly a NodeLocal cache. CoreDNS synthesises the Service answer from watched API state.

[u9l2::kubernetes-plugin-source] back · KIND (wrong)
  problem: DNS staleness is not exactly the watch lag. CoreDNS cache, NodeLocal DNSCache, and client caches can extend it.
  fix:     The plugin watches Service and EndpointSlice objects from the API server and synthesises records from that state. Watch propagation can make the source state stale. CoreDNS, NodeLocal, and client caches can add more delay, so answer staleness is not equal to watch lag alone.

[u9l1::ndots-cost] back · KIND (misleading)
  problem: A search-suffix query does not always return NXDOMAIN. It can return NODATA, SERVFAIL, a timeout, or even a positive wildcard answer.
  fix:     A name with too few dots is tried with search suffixes before its absolute form. Each suffix can add a DNS query and wait. The result can be NXDOMAIN, NODATA, SERVFAIL, a timeout, or a positive answer. Those extra queries add latency and DNS load.

[u10l1::api-wait-for-first-consumer] front · KIND (imprecise)
  problem: The Pod is not already scheduled when provisioning starts. The mode waits for a consumer, then lets scheduling and binding select compatible topology together.
  fix:     Which binding mode delays binding or provisioning until a Pod uses the claim, so scheduling can select compatible storage topology?

[u10l1::pvc-pending-evidence] back · KIND (wrong)
  problem: Namespace quota rejects PVC creation or update during admission. It does not leave the rejected PVC as an existing Pending object.
  fix:     <ul><li>StorageClass and binding mode → intentional waiting for a consumer</li><li>PVC events and provisioner logs → provisioning failure or unavailable capacity</li><li>Requested access mode and existing PVs → no compatible volume</li><li>Candidate-node topology → no reachable volume topology</li></ul>A Deployment's replica count does not explain why one claim cannot bind.

[u10l1::storage-flow] front · KIND (wrong)
  problem: VolumeAttachment and NodeStageVolume are conditional on CSI driver capabilities. This sequence presents them as universal.
  fix:     Storage intent flows: PVC → StorageClass + provisioner → {{c1::PV binding}} → optional {{c2::VolumeAttachment}} for an attachable driver → optional CSI stage → CSI publish.

[u10l1::storage-flow] back · KIND (wrong)
  problem: Not every hop is an API object. CSI stage and publish are RPCs whose evidence appears in events and component logs.
  fix:     PVC, PV, StorageClass, and an applicable VolumeAttachment are API objects. CSI provisioning, attach, stage, and publish are RPCs. Inspect API objects, events, sidecar logs, node-plugin logs, and kubelet logs at the relevant boundary.

[u10l2::claim-to-mount] front · KIND (wrong)
  problem: ControllerPublishVolume and NodeStageVolume are optional CSI capabilities. A valid driver path can omit either operation.
  fix:     For a dynamically provisioned CSI volume: PVC → external-provisioner calls {{c1::CreateVolume}} → PV binds. If the driver advertises PUBLISH_UNPUBLISH_VOLUME, external-attacher calls {{c2::ControllerPublishVolume}}. If it advertises STAGE_UNSTAGE_VOLUME, the node plugin calls {{c3::NodeStageVolume}}. {{c4::NodePublishVolume}} exposes the volume to the Pod path.

[u10l2::name-volumeattachment] back · KIND (misleading)
  problem: VolumeAttachment is relevant only when the driver requires controller-side attach. Its absence can be correct for a non-attachable driver.
  fix:     A <b>VolumeAttachment</b>. It records attach intent for a volume and node when the driver supports controller attach. Check it for an attachable driver. For a non-attachable driver, no VolumeAttachment is expected.

[u10l2::which-half-privileged] front · KIND (misleading)
  problem: The question makes universal claims about privilege and every node. The node service needs deployment only on nodes that can use the driver, and its exact privileges depend on the driver and platform.
  fix:     Where does a CSI node service run, and which host access does it normally need to publish volumes?

[u10l2::which-half-privileged] back · KIND (misleading)
  problem: The controller service need not run where control-plane components run. It is normally a workload that needs Kubernetes API and storage-provider access.
  fix:     The <b>node service</b> runs on each node that can use the driver. It normally needs privileged host access for mount or device operations. The <b>controller service</b> runs on suitable cluster nodes and calls the storage-provider API. It does not require control-plane colocation.

[u10l1::access-modes-reclaim] back · KIND (wrong)
  problem: Access mode does not control what happens to data after claim deletion. Access mode governs allowed mounts; reclaim policy governs released storage.
  fix:     <b>Access mode</b> on the PVC — RWO, ROX, RWX, or RWOP — controls how the volume can be mounted.<br><b>Reclaim policy</b> on the PV — Retain or Delete — controls what Kubernetes does with the released storage after PVC deletion. They govern different lifecycle stages.

[u11l2::name-wal] front · KIND (wrong)
  problem: An etcd WAL contains entries written before they commit, as well as durable Raft hard state. It is not a record of committed entries only.
  fix:     "The durably synchronised record of Raft entries and hard state, including entries that are not yet committed, which snapshots later compact."

[u11l2::etcdctl-restore-path] back · KIND (wrong)
  problem: etcd 3.6 removed snapshot status and restore from etcdctl. Operators must use etcdutl for those offline operations. The static-Pod step also applies to stacked or self-managed etcd, not every etcd deployment.
  fix:     Use <code>etcdctl snapshot save</code> with one endpoint and its credentials. Check the file with <code>etcdutl snapshot status</code>. Restore each member with <code>etcdutl snapshot restore</code> into a <b>new data directory</b>, using consistent membership arguments to form a new logical cluster.<br>For kubeadm stacked etcd, update the static Pod data path or mount as needed. Externally managed etcd has its own startup procedure. Never restore over the live directory.

[u11l2::supported-capture] back · KIND (wrong)
  problem: etcdctl is the preferred live snapshot path, but it is not the only data that etcd can restore. etcd can restore a copied member/snap/db file, with stated limits, and a cold data-directory copy can preserve stopped-member state.
  fix:     A verified <code>etcdctl snapshot save</code> is the supported point-in-time capture from a live member. etcd can also restore a copied <code>member/snap/db</code> file, but that file can miss newer WAL entries and lacks the integrity hash. Do not copy a live data directory. A <code>kubectl get -o yaml</code> export is only a supplement because it omits cluster state and metadata.

[u12l1::informer-economics] back · KIND (misleading)
  problem: Informers do not make all controllers share one watch stream. Sharing occurs within a SharedInformer instance, normally in one process.
  fix:     A SharedInformer lets handlers in the same process share one list, watch, and cache for a resource. Controllers in separate processes normally use separate streams. Repeated relists, reconnect loops, and very large objects still multiply API-server and etcd load.

[u12l1::name-seat] back · KIND (wrong)
  problem: A limited priority level does not always have a fixed seat count in v1.36. It has a nominal concurrency limit and can lend or borrow concurrency. One request can also occupy more than one seat.
  fix:     A <b>seat</b>. A request can occupy one or more seats. A limited priority level has a nominal concurrency limit. Its instantaneous limit can change through configured borrowing and lending.

[u12l2::diagnostic-spine] back · KIND (wrong)
  problem: The claim that every failure lands on exactly one segment contradicts the adjacent lesson and real distributed failures, which often cross boundaries.
  fix:     Memorise it so you always have a next question. Each unit covers one segment. Start with the segment closest to the symptom, but expect one failure to affect several adjacent segments.

[u12l2::events-vs-audit] back · KIND (misleading)
  problem: "Who changed it?" is answered by audit only when auditing is enabled, the policy records that request, and the record is retained.
  fix:     <b>Events</b> explain selected transitions that a component chose to report. They are lossy and expire.<br><b>Audit</b> can record API requests, stages, and identities when it is enabled and its policy includes the request.<br>Use events for reported behavior. Use retained audit records to identify an API caller. Without such a record, the identity may be unavailable.

[u12l2::who-deleted-it] back · KIND (misleading)
  problem: The answer is conditional on audit configuration and retention. Kubernetes does not guarantee that a usable deletion record exists.
  fix:     The <b>audit log</b>, if auditing was enabled and its policy and backend retained the deletion request. Events are not a reliable deletion history. Without an audit record, Kubernetes may not retain the caller identity.

[u13l2::drain-is-not-upgrade] back · KIND (misleading)
  problem: Drain does not unconditionally evacuate or protect every workload. It cordons and requests evictions, normally respects PDBs, skips DaemonSet and mirror Pods, and can stop on local data unless flags change that behavior.
  fix:     <b>No.</b> Drain cordons the node and attempts orderly eviction under its flags and policy. It normally respects PodDisruptionBudgets. DaemonSet and mirror Pods remain, and local data can require an explicit choice. You must still change the node configuration and binaries.<br>Conservative worker order: drain → change → <b>verify the returning node</b> → restore scheduling.

[u14l1::config-delivery] back · KIND (misleading)
  problem: A ConfigMap or Secret mounted with subPath does not receive projected updates. The card presents eventual file refresh as universal.
  fix:     Environment values are fixed at process start. Normal projected files refresh eventually, but <code>subPath</code> mounts do not receive those updates. The process can also cache a file or never reread it. A Deployment rolls only when its Pod template changes.

[u14l1::configmap-consequences] back · KIND (wrong)
  problem: The absolute first sentence omits subPath and configured reload controllers. Kubernetes does not update every projection, and external automation can cause other actions.
  fix:     <b>Kubernetes refreshes normal ConfigMap volume projections eventually. A <code>subPath</code> mount does not refresh.</b><br>Environment values stay fixed for the process. Kubernetes does not restart the container or roll a Deployment only because the referenced ConfigMap changed. An application or controller can reload or roll workloads if configured to do so.

[u1l1::consistent-store] back · KIND (style)
  problem: One long sentence carries four storage contrasts. The reader must unpack the list before the answer becomes clear.
  fix:     <b>etcd</b>. It stores API state. Images live in registries and on nodes. Metrics come from a metrics pipeline. Logs stay on nodes unless another system ships them.

[u3l1::puppet-like-controllers] back · KIND (style)
  problem: The answer starts with a fragment, then combines the external-state distinction, location, and runbook analogy in dense sentences.
  fix:     Controllers that reconcile <b>external state</b>. Examples include external-dns, cloud controllers, and database operators. They make remote systems match declared state. Like Puppet, they encode work that a human would otherwise do.

[u9l2::coredns-layer-checks] front · KIND (style)
  problem: The front is a sentence fragment and does not ask the learner a clear question.
  fix:     Which four checks separate a cluster DNS failure by layer?

[u9l2::coredns-ready] back · KIND (style)
  problem: Six consecutive "That ..." fragments make the negative evidence list hard to scan.
  fix:     <b>Ready proves:</b> the process runs and its plugins started.<br><b>It does not prove:</b><ul><li>the DNS Service routes to CoreDNS</li><li>the API watch is current</li><li>the synthesised records are correct</li><li>upstream resolvers are healthy</li><li>a node-local cache is current</li><li>the client resolver expands names as expected</li></ul>

[u13l2::skew-boundaries] front · KIND (style)
  problem: The front is a noun fragment. The learner must infer the question.
  fix:     Which separately versioned boundaries must you check during a Kubernetes upgrade?

ACCURACY: 52 findings
STYLE: 5 findings
