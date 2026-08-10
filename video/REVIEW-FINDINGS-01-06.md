# Technical review: modules 01 through 06

Baseline: Kubernetes v1.36. The latest published CKA curriculum is v1.35. [Kubernetes v1.36 release](https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/), [CKA curriculum](https://github.com/cncf/curriculum/blob/master/CKA_Curriculum_v1.35.pdf).

[u01] five-actors · misleading
  claim:   “Five things do the work. The API server exposes the supported API and applies policy to every request. etcd stores what the API server persists. The controllers decide what objects should exist. The scheduler chooses which node a pod runs on. The kubelet turns an assignment into running containers.”
  problem: These five roles explain the object-to-node path, but they do not own every cluster action or failure. The container runtime, network implementation, storage plugins, kube-proxy or its replacement, and the optional cloud-controller-manager have separate ownership. Admission policy also does not run on every request. Admission controls create, update, delete, and connect-style requests, not ordinary reads. The visual makes the five-role model look exhaustive. [Kubernetes components](https://kubernetes.io/docs/concepts/overview/components/), [admission control](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/)
  fix:     “Five core roles explain this part of the path. The API server exposes the API and enforces request policy. etcd stores API state. Controllers reconcile objects. The scheduler chooses a node. The kubelet drives assigned Pods on one node. Runtime, network, storage and Service data-plane failures have other owners.”

[u01] one-contract · wrong
  claim:   “Every interaction is a read or a write against one HTTP contract.”
  problem: API-object coordination goes through the API server, but not every Kubernetes interaction does. The kubelet calls CRI, CSI and device plugins. Runtime implementations call network plugins. The API server also connects to kubelets for logs, attach and port-forward, and it can proxy to nodes, Pods and Services. The all-through-the-middle visual is therefore wrong as a complete component map. [Control-plane to node communication](https://kubernetes.io/docs/concepts/architecture/control-plane-node-communication/)
  fix:     “Core components coordinate desired and observed state through the Kubernetes API. They do not call the next control loop to advance a Pod. Node-local runtime, network and storage work uses separate interfaces. The API server also connects to kubelets for logs, attach and port-forward.”

[u01] one-contract · wrong
  claim:   “That single boundary is also where seven things get enforced on every write: identity, authorisation, defaulting, schema validation, versioned conversion, audit, and supported watch semantics.”
  problem: This is not a valid list of seven write gates. Watch semantics apply to reads, not writes. Audit only records requests when auditing is enabled and configured. Defaulting, schema validation and conversion depend on the resource and request. Authentication and authorization also apply to reads. Admission is a major write-path stage, but the list omits it. [Controlling API access](https://kubernetes.io/docs/concepts/security/controlling-access/), [auditing](https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/), [API concepts](https://kubernetes.io/docs/reference/using-api/api-concepts/)
  fix:     “The API boundary authenticates and authorizes requests. Write paths can also default, convert, mutate, validate and admit an object before storage. Configured auditing records the request. List and watch semantics are part of the read contract.”

[u01] what-etcd-holds · misleading
  claim:   “The other thing to know about etcd here is that its latency is the control plane's latency. Every write waits on consensus across a majority of members. So slow disks under etcd do not show up as an etcd problem. They show up as everything being slow.”
  problem: An API write that persists state waits for an etcd commit, but control-plane work also includes cached reads, watches, admission calls and controller processing. Slow etcd disks do show up as etcd WAL fsync and backend commit latency. They can then raise API latency across the cluster. The claim hides the direct etcd evidence that an operator should inspect. [Operating etcd](https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/), [etcd metrics](https://etcd.io/docs/v3.6/metrics/)
  fix:     “Persistent API writes depend on an etcd quorum commit. Slow disks raise etcd WAL and commit latency. That delay then raises API write latency and slows controllers. Cached reads and other request stages have different costs.”

[u01] controllers-plural · wrong
  claim:   “Each owns one kind of object: Deployment, ReplicaSet, Job, node, endpoints. They run as independent loops in one process. When someone says the controller did something, ask which one. The failure you are chasing usually belongs to exactly one of them, and they fail independently.”
  problem: A controller does not necessarily own one kind. A controller often watches and writes several kinds. A Deployment controller observes Deployments and ReplicaSets. The node controller writes Node conditions and taints and drives Pod eviction through node lifecycle behavior. Loops in kube-controller-manager also share one process, clients, leader election and dependencies. A process failure or API outage can affect many at once. The independent-loop visual overstates failure isolation. [Controllers](https://kubernetes.io/docs/concepts/architecture/controller/), [kube-controller-manager](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/)
  fix:     “The controller manager contains many reconciliation loops. Each loop owns a responsibility, not always one kind. A loop can watch and write several resource kinds. Some failures stay local to one loop. Process, leader-election and API failures can stop many loops together.”

[u01] scheduler-job · imprecise
  claim:   “Its output is a single field, and the moment it is written the scheduler is finished with your pod forever.”
  problem: A successful Binding sets the Pod's node assignment, normally observed as `spec.nodeName`, and the default scheduler does not reschedule that bound Pod. Before binding, the scheduler can retry the Pod and can write `status.nominatedNodeName` during preemption. Calling all scheduler output one field erases that distinction. [Kubernetes scheduler](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/), [priority and preemption](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/)
  fix:     “For a successful placement, the scheduler binds the Pod to a node. The API records that node in spec.nodeName. Before binding, the scheduler can retry and can nominate a node during preemption. After binding, it does not reschedule that Pod.”

[u01] kubelet-owns · wrong
  claim:   “Connections generally run from the node inward to the API server, not the other way. That lets nodes sit behind NAT. It also means the control plane cannot simply reach out and ask.”
  problem: The default node-to-control-plane path is outbound, but the API server also connects to each kubelet HTTPS endpoint for Pod logs, attach and port-forward. The API server proxy can also connect to nodes, Pods and Services. Konnectivity can preserve an outbound node agent while carrying control-plane-to-node traffic. The visual must not present a strict one-way rule. [Control-plane to node communication](https://kubernetes.io/docs/concepts/architecture/control-plane-node-communication/)
  fix:     “The kubelet watches the API and reports status through outbound requests. The API server also reaches the kubelet for logs, attach and port-forward. Konnectivity can carry that traffic through node-initiated tunnels. Work assignment still comes from the Pod API, not a push call.”

[u01] the-chain · misleading
  claim:   “Four independent loops, each triggered by an API object the previous one wrote, and none of them aware of the others.”
  problem: There is no end-to-end imperative caller, but the loops are not unaware of each other. The Deployment controller deliberately manages ReplicaSets. ReplicaSets carry owner references and selectors that relate them to Deployments. The ReplicaSet controller deliberately manages Pods. The scheduler and kubelet understand Pods and their assignment fields. [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), [owners and dependents](https://kubernetes.io/docs/concepts/overview/working-with-objects/owners-dependents/)
  fix:     “No component calls the whole chain. The Deployment controller manages ReplicaSets. The ReplicaSet controller manages Pods. The scheduler binds unassigned Pods. The kubelet acts on Pods assigned to its node. API objects connect the loops.”

[u01] outage-cost · wrong
  claim:   “Self-healing stops — a crashed pod is not replaced, a failed node is not drained.”
  problem: Control-plane replacement and scheduling stop, but node-local self-healing can continue. A running kubelet still runs probes and restarts failed containers according to their restart policy, even when the API server is unavailable. It cannot create a replacement Pod object or move a Pod to another node. [Kubernetes self-healing](https://kubernetes.io/docs/concepts/architecture/self-healing/), [Pod lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
  fix:     “Control-plane healing stops. Controllers cannot create replacement Pods, and the scheduler cannot place them. A live kubelet can still restart failed containers on its node from the Pod state it already has. It cannot move the Pod to another node.”

[u01] close · misleading
  claim:   “If a failure lives here, the symptom is that nothing happened at all — no events, no pods, no attempt. Your write was rejected, or it never reached the API. Everything downstream at least leaves a trace.”
  problem: A rejected write returns an API error and can produce an audit record. A successful object write proves that this segment completed. Downstream failures do not always produce an Event. A stopped controller can leave only the unchanged object and component logs. “Everything downstream” is therefore false and gives poor incident advice. [Kubernetes events](https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/), [auditing](https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/)
  fix:     “Start with the API response. A rejected write returns an error. A successful read-back proves the object exists. Downstream failures may leave Events, status conditions or only component logs. Do not require an Event before you inspect the next owner.”

[u01] five-actors · omission
  claim:   “Almost every question you will be asked is really about which of the five owns a given failure.”
  problem: The module gives no practical control-plane health checks. The CKA is performance-based and tests cluster and node troubleshooting, control-plane components, kubeadm and cluster lifecycle. In a kubeadm cluster, control-plane components normally run as static Pods from `/etc/kubernetes/manifests`, while kubelet health is checked through the service manager and journal. [CKA objectives](https://training.linuxfoundation.org/certified-kubernetes-administrator-cka-program-changes/), [kubeadm implementation](https://kubernetes.io/docs/reference/setup-tools/kubeadm/implementation-details/)
  fix:     “In a kubeadm cluster, check the kube-system Pods and `/etc/kubernetes/manifests`. Read static-Pod container logs. Check kubelet with systemctl and journalctl. Check API readiness and etcd health before you blame a downstream controller.”

[u02] authn-vs-authz · imprecise
  claim:   “A certificate, a bearer token, a service account token — whatever the mechanism, its output is a username and a set of groups. That is all authentication does.”
  problem: Kubernetes `UserInfo` can also contain a UID and extra attributes. Authorizers and admission code can use those extra attributes. The two-field model is incomplete, and the visual reinforces it. [Authentication](https://kubernetes.io/docs/reference/access-authn-authz/authentication/)
  fix:     “Authentication produces user information. It includes a username and groups. It can also include a UID and extra attributes. Authentication establishes identity. It does not grant an action.”

[u02] authn-vs-authz · wrong
  claim:   “RBAC is the usual answer, and RBAC only grants. There is no deny rule to find. When a request is refused, look for a missing grant, not a rule that blocked it.”
  problem: RBAC has no negative rules, but Kubernetes can chain several authorizers. A Webhook authorizer can return an explicit deny. The stable authorization configuration API can also fail closed with `failurePolicy: Deny`. An earlier authorizer deny stops the chain. The advice is correct only after the operator confirms that RBAC is the relevant authorizer. [Authorization verdicts](https://kubernetes.io/docs/reference/access-authn-authz/authorization/), [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
  fix:     “RBAC only grants. If RBAC is the only relevant authorizer, a refusal means no rule granted the request. Other configured authorizers can deny explicitly. Check the authorizer chain before you search only for a missing RBAC grant.”

[u02] webhook-cost · imprecise
  claim:   “Registering a webhook puts four things into the API server's critical path: your Service, its DNS, its TLS trust and its response deadline.”
  problem: This is true for a webhook configured with a Kubernetes Service reference. A webhook can instead use a URL, which has a different network and name-resolution path. Rules cannot directly select one namespace. Namespace scoping needs `namespaceSelector`, `objectSelector`, or `matchConditions`, with known selector limitations. [Dynamic admission control](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/)
  fix:     “Every matching webhook adds a network call, TLS trust and a deadline to the API path. A Service reference also depends on that Service and cluster DNS. A URL uses its own network path. Limit resources with rules. Limit namespaces and objects with selectors or match conditions.”

[u02] webhook-design · misleading
  claim:   “Keep the verdict deterministic — the same object must always get the same answer, or you have built something nobody can debug.”
  problem: An admission decision can validly depend on the operation, old object, authenticated user, namespace labels, parameters and current policy state. The object alone does not define the input. Time-dependent or remote mutable state is risky, but different complete requests can correctly produce different answers for the same object body. [Admission request](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/)
  fix:     “Make the result deterministic for the same admission request and the same policy state. Include the operation, old object, user, namespace and parameters in that input. Avoid time and remote mutable state unless the policy requires them.”

[u02] still-rejected · misleading
  claim:   “When RBAC allows something and the API server still refuses it, six suspects remain.”
  problem: The list is not exhaustive and it mixes stages with specific rules. ResourceQuota is an admission controller. Immutability is resource validation. Conversion can happen before or after admission depending on the path. Conflicts, preconditions, namespace termination, request size and other validation can also reject a write. “Six remain” teaches a false closed set. [API request handling](https://kubernetes.io/docs/concepts/security/controlling-access/), [API concepts](https://kubernetes.io/docs/reference/using-api/api-concepts/)
  fix:     “Authorization clears one stage. Common later failures include admission, quota, schema or field validation, conversion, optimistic-concurrency conflicts and storage. The set is not closed. Read the Status reason, message and field causes first.”

[u02] concurrency · imprecise
  claim:   “resourceVersion keeps that safe. You read an object and send back the version you read. If anything changed in between, your update is rejected with a conflict.”
  problem: This describes a read-modify-write replacement with HTTP PUT. Patch types have different merge and precondition behavior. Server-side apply does not require the client to send `resourceVersion`; it detects field ownership conflicts instead. The visual should label this as an Update path, not the universal write path. [Resource versions](https://kubernetes.io/docs/reference/using-api/api-concepts/), [server-side apply](https://kubernetes.io/docs/reference/using-api/server-side-apply/)
  fix:     “For a read-modify-write Update, send the resourceVersion you read. If the object changed, the API rejects the stale Update. Read the current object, recompute and retry with backoff. Patch and server-side apply use different conflict rules.”

[u02] field-ownership · misleading
  claim:   “Forcing the apply resolves it by taking the field, and the previous owner will simply set it back on its next reconcile.”
  problem: Force transfers ownership and changes the value, but the prior manager does not always set it back. A later non-apply Update or Patch can overwrite the field and move ownership without an apply conflict. A prior server-side apply manager can instead receive a conflict unless it also forces ownership. The guaranteed oscillation in the visual is wrong. [Server-side apply conflicts](https://kubernetes.io/docs/reference/using-api/server-side-apply/)
  fix:     “Force changes the value and transfers field ownership. A controller that uses Update or Patch can overwrite it later. A controller that uses server-side apply can conflict unless it also forces. Either result means the ownership design is unresolved.”

[u02] authn-vs-authz · omission
  claim:   “Gate two takes that identity and asks whether it may perform this verb on this resource.”
  problem: The current CKA objective explicitly tests RBAC, but the script gives no object model or verification command. A candidate must distinguish Role from ClusterRole and RoleBinding from ClusterRoleBinding, including the fact that a RoleBinding can bind a ClusterRole only inside the binding namespace. [CKA objectives](https://training.linuxfoundation.org/certified-kubernetes-administrator-cka-program-changes/), [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
  fix:     “Use a Role for namespaced rules. Use a ClusterRole for cluster-scoped rules or reusable namespaced rules. A RoleBinding grants inside one namespace. A ClusterRoleBinding grants cluster-wide. Verify the result with kubectl auth can-i.”

[u03] the-loop · wrong
  claim:   “There is no state machine and no progress counter. Each pass recomputes the answer from scratch, which is why a controller can be killed mid-work and restarted with no recovery logic.”
  problem: Level-based reconciliation does not prohibit a state machine or durable progress. Controllers commonly persist conditions, observed generations, finalizers, operation IDs and phase data in API status or external systems. Multi-step external work needs recovery logic for partial success. Restart safety comes from durable observation and idempotent actions, not from the absence of state. The kill-and-restart visual is wrong as a universal guarantee. [Kubernetes API conventions](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md), [operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
  fix:     “A reconciler observes durable state and computes the next safe action. It can use status, conditions, finalizers and external operation IDs as a state machine. Each action must tolerate retry and partial success. After restart, the controller observes that durable state and continues.”

[u03] informer · misleading
  claim:   “The word shared matters: three controllers watching Deployments share a single watch stream.”
  problem: They share one stream only when they use the same `SharedInformer` or factory in the same process with compatible selectors. Controllers in separate processes, or factories with different clients, namespaces or selectors, have separate watches and caches. The visual presents sharing as automatic cluster-wide behavior. [client-go informers](https://pkg.go.dev/k8s.io/client-go/tools/cache), [shared informer factory](https://pkg.go.dev/k8s.io/client-go/informers)
  fix:     “One SharedInformer can feed many handlers from one cache and watch. Controllers share it only when they use the same informer instance and collection. Separate processes, selectors and factories use separate streams.”

[u03] informer · imprecise
  claim:   “A reflector lists once to get current state and a resource version, then opens a watch for changes.”
  problem: This is the classic list-then-watch model, but it is not universal in Kubernetes v1.36. The WatchList client feature can obtain initial state from a watch stream with initial events. A reflector also relists after some watch failures. “Lists once” is therefore too absolute for a current-version script. [API watch initial state](https://kubernetes.io/docs/reference/using-api/api-concepts/), [client-go reflector](https://pkg.go.dev/k8s.io/client-go/tools/cache)
  fix:     “A reflector establishes initial state and a resource version, then watches later changes. It can use a list followed by a watch. Current clients can also request initial state through a watch stream. Recovery can require another list.”

[u03] key-not-payload · wrong
  claim:   “When something changes, the handler does not hand the object to a worker. It enqueues a key: namespace and name. The worker pops the key and reads current state from the cache. And the worker always acts on what is true now, never on a stale snapshot that arrived in a message.”
  problem: Informer event handlers receive objects. Enqueuing a key is a recommended controller pattern, not informer behavior. The later cache read is eventually consistent and can lag the API server. It gives the newest state that this informer has observed, not guaranteed current truth. The cache also keys an object by group/resource, namespace and name; UID is separate and matters when names are reused. [client-go cache](https://pkg.go.dev/k8s.io/client-go/tools/cache)
  fix:     “The informer gives an object event to the handler. A common handler reduces it to a namespace/name key and enqueues that key. The worker reads the latest state in its local cache. That avoids acting on the event payload, but the cache is eventually consistent with the API server.”

[u03] level-based · misleading
  claim:   “Because the reconciler recomputes from current state, a dropped event costs latency and nothing else. The next reconcile produces the same answer it would have produced anyway.”
  problem: Level-based logic makes retries safe, but a lost enqueue still needs another trigger. That trigger can be a later object event, an explicit delayed requeue, a periodic resync, or controller restart and relist. Resync can be disabled. If no trigger occurs, drift can remain indefinitely. The visual incorrectly guarantees a resync tick. [client-go shared informer](https://pkg.go.dev/k8s.io/client-go/tools/cache)
  fix:     “Level-based reconciliation makes a later retry safe. A lost enqueue still needs another trigger. A later event, delayed requeue, configured resync or restart can provide it. Without another trigger, the object can stay out of sync.”

[u03] relist · misleading
  claim:   “It is also the mechanism that makes the previous claim true: correctness never depended on the stream staying up.”
  problem: Relisting recovers the informer's cache after a watch disconnect or expired resource version. It does not recover every dropped handler call or queue bug. It only generates useful work when the informer and handlers deliver the resulting notifications. This cannot support the broader claim that any lost message is harmless. [API watch behavior](https://kubernetes.io/docs/reference/using-api/api-concepts/), [client-go cache](https://pkg.go.dev/k8s.io/client-go/tools/cache)
  fix:     “Relisting repairs the cache after a watch can no longer continue. It does not repair an arbitrary lost enqueue. Correctness also needs reliable handler delivery or another explicit reconcile trigger.”

[u03] external · imprecise
  claim:   “Use a stable idempotency key derived from the object, so a retry addresses the same external resource.”
  problem: A key derived only from namespace and name can collide after deletion and recreation. Kubernetes can reuse a name, but the new object has a new UID. The key should include the object UID and the operation purpose. Persisting a provider ID after creation still has a crash gap, so provider-side idempotency is the primary protection. [Object names and UIDs](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/)
  fix:     “Build the provider idempotency key from the object UID and the operation purpose. A recreated object gets a new UID. Use provider-side idempotency so a crash after create cannot duplicate the resource. Persist the provider identity as soon as the API call returns.”

[u03] resync · wrong
  claim:   “Informers also resync on a timer, replaying everything in the cache through the handlers even when nothing changed. That looks wasteful. It is a safety net. It catches anything the controller failed to act on the first time. It also catches drift that happened outside the API entirely.”
  problem: Periodic resync is optional and commonly set to zero. Some informers do no resync even when a handler requests one. A resync replays the local cache and does not contact authoritative storage. It finds external drift only if the reconciler actively queries that external system. The script and visual present an optional mechanism as universal. [client-go SharedInformer](https://pkg.go.dev/k8s.io/client-go/tools/cache)
  fix:     “An informer can replay cached objects on a configured resync period. Resync can be disabled, and it does not relist from the API. It can trigger a reconciler to check external state. The reconciler must perform that check. Do not make correctness depend on periodic resync.”

[u03] queue-shape · wrong
  claim:   “The workqueue is doing more than holding keys. It deduplicates, so a burst becomes one item. It rate-limits, so a key that keeps failing backs off exponentially instead of spinning.”
  problem: The base client-go workqueue is stingy and deduplicates keys, but it does not automatically rate-limit failures. A controller must use a delaying or rate-limiting queue and must call `AddRateLimited` with a chosen rate limiter. Exponential per-item backoff is one common configured limiter. [client-go workqueue](https://pkg.go.dev/k8s.io/client-go/util/workqueue)
  fix:     “The base workqueue deduplicates keys and prevents concurrent processing of one key. A rate-limiting queue can also delay retries. The worker must call AddRateLimited on failure and Forget after success. The configured limiter decides whether backoff is exponential.”

[u03] observability · wrong
  claim:   “Depth climbing with normal latency means too few workers. Depth climbing with high duration means the handler is blocked on something external.”
  problem: These metrics do not prove those causes. Persistent queue growth normally raises queue wait latency unless arrivals are very recent or the metric is measured incorrectly. High reconcile duration can come from API latency, CPU, locks, retries, large objects or internal work, not only an external block. Worker count, arrival rate and service rate must be compared. [Kubernetes component metrics](https://kubernetes.io/docs/concepts/cluster-administration/system-metrics/)
  fix:     “Rising depth means arrivals exceed completions. Rising queue latency confirms that work is waiting. High reconcile duration points to slow processing, but not its cause. Compare arrival rate, worker concurrency, CPU, API latency, dependency latency and error retries before you decide.”

[u04] four-promises · wrong
  claim:   “A StatefulSet adds stable ordinal identity, ordered lifecycle, and a claim per Pod.”
  problem: Stable ordinal identity is inherent. Ordered lifecycle is the default `OrderedReady` policy, but `podManagementPolicy: Parallel` relaxes that order. A claim per Pod exists only when the StatefulSet defines `volumeClaimTemplates`; a StatefulSet can have none. The visual makes both optional properties unconditional. [StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
  fix:     “A StatefulSet gives each Pod a stable ordinal identity. OrderedReady is the default lifecycle policy. Parallel relaxes that order. volumeClaimTemplates can create one persistent claim per Pod, but a StatefulSet does not require them.”

[u04] statefulset-limit · misleading
  claim:   “It can only guarantee that the Pod which comes back is recognisably the same one, with the same name and the same volume.”
  problem: The replacement keeps the ordinal name, but it has a new UID. It reuses the same persistent claim only when the Pod uses a retained claim from a `volumeClaimTemplate` or another stable claim reference. `persistentVolumeClaimRetentionPolicy` can delete template claims on scale-down or StatefulSet deletion. The same-volume visual is conditional. [StatefulSet stable storage](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
  fix:     “A replacement keeps the same ordinal name but gets a new UID. If the StatefulSet uses a retained template claim, the replacement mounts that same claim. Claim retention can change on scale-down or deletion. Kubernetes does not provide application replication or failover.”

[u04] daemonset-job · imprecise
  claim:   “It tracks the set of eligible nodes, so it adds a Pod when a node joins and removes one when a node leaves.”
  problem: “Leaves” must mean that the Node object is deleted or becomes ineligible. If a machine fails or becomes unreachable, its Node object and DaemonSet Pod can remain in the API while node lifecycle handling proceeds. The DaemonSet controller does not immediately remove the Pod merely because the physical node stopped reporting. [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/), [Nodes](https://kubernetes.io/docs/concepts/architecture/nodes/)
  fix:     “A DaemonSet targets eligible Node objects. It creates a Pod for each eligible node. It deletes a Pod when that Node becomes ineligible or the Node object is removed. An unreachable machine can remain represented by a Node and Pod while node lifecycle controllers react.”

[u04] daemonset-job · wrong
  claim:   “A Job guarantees completion. It tracks a success count and retries until it reaches it.”
  problem: A Job can reach a terminal Failed condition instead of completion. `backoffLimit`, `activeDeadlineSeconds`, `podFailurePolicy`, failed indexes and `maxFailedIndexes` can stop retries. Even a one-completion Job can start the same program more than once, so its task must tolerate duplicates. [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/)
  fix:     “A Job targets successful completions. It creates replacement Pods after eligible failures. Retry limits, deadlines and failure policy can mark it Failed before the target is reached. The task must tolerate duplicate starts.”

[u04] hpa-vpa · misleading
  claim:   “Run both against CPU or memory and they fight, because utilisation is usage relative to requests.”
  problem: The feedback loop occurs when HPA uses a resource `Utilization` target for a resource whose request VPA actively changes. HPA can instead use `AverageValue`, custom, object or external metrics that are not divided by requests. VPA can run in recommendation-only mode or control a different resource. VPA is also an add-on CRD, not a built-in core API. [Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/), [Vertical Pod Autoscaling](https://kubernetes.io/docs/concepts/workloads/autoscaling/vertical-pod-autoscale/)
  fix:     “HPA and VPA can conflict when HPA targets CPU or memory utilization and VPA actively changes that resource request. Utilization divides usage by requests. The conflict does not apply to raw, custom or external metrics, or to a VPA that does not change the same request. VPA must be installed separately.”

[u04] hpa-vpa-fix · wrong
  claim:   “If you must keep both on CPU, bound VPA's update mode so it cannot evict Pods whenever it likes.”
  problem: Limiting VPA disruption does not remove the utilization feedback loop. Any mode that actively changes CPU requests can change HPA's utilization denominator. In Kubernetes v1.36, VPA update behavior is version- and implementation-sensitive, and the core documentation still identifies VPA as a separately installed add-on. Recommendation-only mode avoids automatic request changes; using an HPA raw or independent metric avoids the shared denominator. [VPA resource policy](https://kubernetes.io/docs/concepts/workloads/autoscaling/vertical-pod-autoscale/), [HPA metric targets](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
  fix:     “To remove the feedback loop, keep VPA in recommendation-only mode or move HPA to a raw or independent metric. If VPA changes CPU requests, test the HPA response as well as Pod disruption. Update mode can limit disruption. It does not remove the shared denominator.”

[u04] pdb · imprecise
  claim:   “It constrains voluntary disruption through the Eviction API.”
  problem: That is the enforceable PDB path, but the scheduler also considers PDBs during preemption. PDB compliance during scheduler preemption is best effort, not guaranteed. Without that qualification, the adjacent preemption lesson implies that budgets are irrelevant to preemption. [Pod disruptions](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/), [PDB and preemption](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/)
  fix:     “A PDB constrains voluntary disruption requested through the Eviction API. A drain uses that path. The scheduler also tries to respect PDBs during preemption, but only as a best effort. Power loss, node-pressure eviction and direct deletion can bypass the budget.”

[u04] rollout · imprecise
  claim:   “The Deployment controller scales the new ReplicaSet up and the old one down within those bounds. It waits for readiness at each step.”
  problem: Deployment progress uses available replicas, not a strict wait after each individual step. A Pod becomes available only after it is Ready for `minReadySeconds`. The controller can scale several replicas within `maxSurge` and `maxUnavailable`. `progressDeadlineSeconds` reports a stalled condition, but the controller keeps retrying and does not automatically roll back. [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
  fix:     “The Deployment controller scales both ReplicaSets within maxSurge and maxUnavailable. Ready Pods become available after minReadySeconds. Available-replica counts control further scale-down. A progress deadline reports a stalled condition. It does not roll the Deployment back.”

[u04] readiness-gates-rollout · wrong
  claim:   “Which makes readiness the throttle on every rollout you run. The controller only continues when new Pods report ready.”
  problem: This is not true for every Deployment strategy or setting. `Recreate` removes old Pods before creating new ones. A RollingUpdate can create up to `maxSurge` without waiting and can remove old Pods up to `maxUnavailable`. Availability, including `minReadySeconds`, gates additional old-replica scale-down. A probe that succeeds early can accelerate replacement only within those bounds. The “all replicas replace at once” visual is conditional. [Deployment strategy](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
  fix:     “For a RollingUpdate, availability controls how far old-replica scale-down can proceed. maxSurge and maxUnavailable set the bounds. Readiness and minReadySeconds determine availability. Recreate follows a different path. An early readiness signal can speed replacement within the configured bounds.”

[u04] job-semantics · imprecise
  claim:   “backoffLimit then decides how many failures it tolerates before giving up.”
  problem: `backoffLimit` is not always a simple count of failed Pods. With `restartPolicy: OnFailure`, container retries in Pending or Running Pods also count. Indexed Jobs can use `backoffLimitPerIndex`. `podFailurePolicy` can ignore, count or immediately fail on selected exits. `activeDeadlineSeconds` can end the Job first. [Job backoff](https://kubernetes.io/docs/concepts/workloads/controllers/job/)
  fix:     “backoffLimit bounds retries for the Job. Failed Pods count. With restartPolicy OnFailure, container retries can count too. Indexed Jobs can limit each index. podFailurePolicy and activeDeadlineSeconds can end or alter retries earlier.”

[u04] close · wrong
  claim:   “Module five: the scheduler, and why free CPU on a dashboard proves nothing.”
  problem: The published module five is CRDs and operators. Scheduling is module six. This is a factual navigation error in the course and can send viewers to the wrong next lesson.
  fix:     “Next module: custom resources and operators. The scheduler follows after that.”

[u04] rollout · omission
  claim:   “progressDeadlineSeconds is what eventually turns that stall into a reported condition.”
  problem: The module covers a current CKA objective, but it gives no performance-based rollout checks or rollback operation. The current CKA tests Deployments, rolling updates and rollbacks, and workload autoscaling. [CKA objectives](https://training.linuxfoundation.org/certified-kubernetes-administrator-cka-program-changes/)
  fix:     “Use kubectl rollout status and kubectl rollout history to inspect a Deployment. Read its conditions and both ReplicaSets. Use kubectl rollout undo to select a prior revision. Inspect an HPA with kubectl get hpa and confirm its metric target and current value.”

[u05] four-words · misleading
  claim:   “An operator is packaging: a controller plus domain lifecycle knowledge, RBAC, installation and upgrade.”
  problem: The operator pattern is not defined by packaging. An operator is a Kubernetes API client that acts as a controller for one or more custom resources and encodes domain-specific operational knowledge. RBAC and installation are deployment requirements. The operator may automate application upgrades, but packaging its own upgrade is not the definition. [Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
  fix:     “An operator is a domain-specific controller for custom resources. It encodes operational knowledge in a control loop. Its distribution normally includes CRDs, RBAC and installation resources. It can automate the managed application's lifecycle and upgrades.”

[u05] crd-alone · misleading
  claim:   “Nothing else happens. Ever.”
  problem: No domain-specific reconciliation happens without a controller, which is the intended point. The API still performs generic behavior. It authenticates and authorizes requests, validates and stores objects, runs admission, supports finalizers and owner references, and handles namespace deletion and garbage collection. The absolute wording is false. [Custom resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
  fix:     “Without a custom controller, no domain-specific system moves toward the CR's spec. The API still validates, stores, serves and deletes the object through normal Kubernetes machinery. A CRD creates an API. It does not create the domain behavior.”

[u05] spec-status · imprecise
  claim:   “Spec is intent, written by the user. Status is observation, written by your controller, including conditions and observedGeneration.”
  problem: This is an API design convention, not enforced ownership. Admission and other authorized clients can change spec. A CRD must enable the status subresource to separate status updates from ordinary object updates. Conditions and `observedGeneration` are recommended fields that a controller must implement; Kubernetes does not add them automatically. [CRD status subresource](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/), [API conventions](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md)
  fix:     “Use spec for desired state and status for observed state. Enable the status subresource. Let users and policy write spec. Let the controller write status. Define conditions and observedGeneration when clients need them. Kubernetes does not add those fields for you.”

[u05] versions · wrong
  claim:   “Remove an old version before migrating, and you strand objects nobody can read.”
  problem: The API server blocks removal of a CRD version while that version remains in `status.storedVersions`. An operator can create an unreadable state only by falsely clearing that status before migration or by breaking conversion. The visual incorrectly shows a normal CRD update removing the version and immediately stranding data. Existing objects can be served through any still-served version while valid conversion remains available. [CRD version removal](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning/)
  fix:     “Changing the storage marker does not rewrite old objects. Keep conversion working while old encodings remain. The API blocks removal of a version listed in status.storedVersions. Do not clear that entry until migration proves that no object uses the old encoding.”

[u05] migration · omission
  claim:   “The safe order has five steps and each gates the next. Serve both versions. Verify conversion round-trips both ways. Mark the new version for storage. Migrate the existing objects by rewriting them. Confirm what is stored and who is still using the old version. Only then retire it.”
  problem: The sequence omits a required state change. After all objects are rewritten, the old version must be removed from the CRD `status.storedVersions` field. Only then can it be removed from `spec.versions`. The visual's five gates do not show this required gate. [Upgrade stored CRD objects](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning/)
  fix:     “Serve both versions. Verify conversion. Mark the new storage version. Rewrite every stored object. Confirm storage and old-version clients. Remove the old entry from status.storedVersions. Set served false. Then remove the old version and its conversion support.”

[u05] finalizers · imprecise
  claim:   “The API marks the object for deletion and holds it until the owning controller clears the finalizer.”
  problem: The controller responsible for a finalizer does not have to own the object through an owner reference. Each finalizer key identifies a cleanup responsibility. Several controllers can add different finalizers, and deletion completes only after all are removed. “Owning controller” conflates finalizer responsibility with garbage-collection ownership. [Finalizers](https://kubernetes.io/docs/concepts/overview/working-with-objects/finalizers/), [owners and dependents](https://kubernetes.io/docs/concepts/overview/working-with-objects/owners-dependents/)
  fix:     “The API sets deletionTimestamp and keeps the object while any finalizer remains. The controller responsible for each finalizer performs its cleanup and removes its key. That controller need not own the object. Owner references drive garbage collection instead.”

[u05] schema · wrong
  claim:   “Declare a list as atomic and two controllers overwrite each other. Declare it as a merge key and they coexist.”
  problem: Under server-side apply, an atomic list is one owned field. A second manager that applies a different value receives a conflict unless it forces ownership. An Update, a non-apply Patch, the same manager, or a forced apply can replace the list. A map-style list uses `x-kubernetes-list-type: map` and `x-kubernetes-list-map-keys`; managers can then own separate entries. The visual's unconditional second-writer replacement is wrong. [Server-side apply merge topology](https://kubernetes.io/docs/reference/using-api/server-side-apply/), [CRD schema extensions](https://kubernetes.io/docs/reference/kubernetes-api/extend-resources/custom-resource-definition-v1/)
  fix:     “An atomic list is one field for server-side apply. A different apply manager conflicts before it replaces the list, unless it forces ownership. A map-style list with list-map keys gives entries separate ownership. Updates and non-apply patches follow different rules.”

[u05] four-words · omission
  claim:   “If you can say those four cleanly, you have answered most of what follows.”
  problem: The current CKA explicitly tests understanding CRDs and installing and configuring operators. A candidate needs practical discovery and inspection, not only definitions. The script gives no command to find the CRD, served versions, storage version, scope, controller Deployment or installed custom resources. [CKA objectives](https://training.linuxfoundation.org/certified-kubernetes-administrator-cka-program-changes/)
  fix:     “Use kubectl api-resources to find the custom kind. Inspect the CRD for scope, schema, served versions and the storage marker. Find the operator Deployment, ServiceAccount and RBAC. Read the custom resource status, conditions and controller logs.”

[u06] two-cycles · wrong
  claim:   “The scheduling cycle is serial: sort the queue, pre-filter, filter, score.”
  problem: QueueSort orders Pods in the scheduling queue. It is not a stage inside each Pod's scheduling cycle. Current Kubernetes v1.36 also has PreEnqueue and QueueingHint behavior around queue admission and retry. Within a scheduling attempt, the framework includes PreFilter, Filter, PostFilter when no node survives, PreScore and Score. The visual places QueueSort in the wrong cycle. [Scheduling Framework](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/)
  fix:     “QueueSort orders Pods before a scheduling attempt. The serial scheduling cycle handles one Pod at a time. It runs PreFilter and Filter, then PostFilter if no node survives. It runs PreScore and Score for feasible nodes.”

[u06] two-cycles · wrong
  claim:   “The binding cycle then runs reserve, permit, pre-bind and bind, and it may overlap with the next Pod's scheduling cycle.”
  problem: Kubernetes documents Reserve and Permit at the end of the scheduling cycle. Permit can delay entry into PreBind. The binding cycle can run concurrently and contains PreBind, Bind and PostBind work. The visual puts Reserve and Permit on the wrong track. [Scheduling Framework](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/)
  fix:     “The scheduling cycle selects a node, then runs Reserve and Permit. Permit can delay binding. The binding cycle runs PreBind, Bind and PostBind. Binding cycles can overlap later serial scheduling cycles.”

[u06] two-cycles · wrong
  claim:   “That split is what keeps the scheduler fast while it still does slow work, like waiting for a volume to attach.”
  problem: The scheduler's VolumeBinding plugin can assume or bind PersistentVolumes and PersistentVolumeClaims before Pod binding. Actual volume attachment and mount happen after the Pod is bound, through the attach/detach controller, CSI components and kubelet. The scheduler does not wait for ordinary volume attachment in its binding cycle. [Volume binding mode](https://kubernetes.io/docs/concepts/storage/storage-classes/#volume-binding-mode), [CSI volume lifecycle](https://kubernetes.io/docs/concepts/storage/volumes/)
  fix:     “The concurrent binding cycle keeps slow PreBind and Bind work from blocking the serial scheduling cycle. The VolumeBinding plugin can bind storage claims before Pod binding. Actual volume attachment and mount happen after Pod binding through storage controllers, CSI and the kubelet.”

[u06] request-errors · wrong
  claim:   “Requests set below real usage produce the opposite. The scheduler packs the node, the Pods grow into their real appetite, and the kubelet starts evicting under pressure.”
  problem: Under-requesting can cause contention, but eviction is not the universal outcome. CPU contention normally causes throttling or reduced CPU share, not node-pressure eviction. A container that exceeds a memory limit can be OOM-killed. The kubelet evicts Pods when configured node-pressure signals such as available memory, filesystem space or inodes cross thresholds. The visual's direct under-request-to-eviction path is too broad. [Resource requests and limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/), [node-pressure eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/)
  fix:     “Low requests let the scheduler overpack a node. CPU contention causes throttling or reduced share. A memory limit can cause an OOM kill. Node memory, disk or inode pressure can make the kubelet evict Pods. The later failure depends on the resource and limits.”

[u06] pending-ladder · wrong
  claim:   “Image size is not on that list — a large image is slow after scheduling, never a cause of Pending.”
  problem: The Pod phase `Pending` includes both time waiting for scheduling and time downloading images after binding. A large or failed image pull can therefore keep a Pod in Pending. It is not a cause of an unscheduled Pod with no `spec.nodeName` or of a `FailedScheduling` event. The narration and struck-through visual teach the wrong Pod-phase definition. [Pod phase](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
  fix:     “First decide whether the Pod is unscheduled. If spec.nodeName is empty, read FailedScheduling events. If a node name exists, Pending can mean image pull, volume setup, sandbox creation or other kubelet work. A large image can keep a bound Pod in Pending. It cannot explain an empty node name.”

[u06] pending-ladder · misleading
  claim:   “A Pending Pod has an order of investigation. Read the scheduler events on the Pod first — they usually name the predicate that failed, and that ends most searches. Then compare requests against node allocatable. Then affinity, taints, topology spread and host ports. Then the volume side: binding mode, storage topology, capacity. Then quota.”
  problem: The ladder applies only to an unscheduled Pod. Current scheduler events report plugin or feasibility reasons; “predicate” is legacy terminology. ResourceQuota normally rejects Pod creation at admission, so there is no existing Pending Pod to diagnose. Pod scheduling gates are also a stable current cause of a Pod not entering normal scheduling. [Scheduling Framework](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/), [Pod scheduling readiness](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-scheduling-readiness/), [ResourceQuota](https://kubernetes.io/docs/concepts/policy/resource-quotas/)
  fix:     “For an unscheduled Pod, read FailedScheduling events first. Check scheduling gates. Then check requests and Pod overhead against allocatable. Check required affinity, selectors, taints, topology spread, host ports and storage binding. Quota usually rejects creation, so inspect the create error instead of a Pending Pod.”

[u06] close · wrong
  claim:   “Nothing is wrong on any node, because nothing has been asked of any node yet.”
  problem: No node has been assigned the Pod, but node state is often exactly why scheduling failed. Nodes can be NotReady, cordoned, tainted, short of requested resources, outside required topology, or unable to satisfy volume constraints. The sentence tells candidates to ignore the primary evidence for `FailedScheduling`. [Assigning Pods to nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/), [Nodes](https://kubernetes.io/docs/concepts/architecture/nodes/)
  fix:     “No kubelet has been asked to run the Pod yet. Node state can still be the cause. Check readiness, schedulability, taints, labels, allocatable resources, topology and storage constraints. The scheduler compares all of them before it writes a node name.”

[u06] pending-ladder · omission
  claim:   “Read the scheduler events on the Pod first.”
  problem: The module maps directly to the CKA scheduling and troubleshooting objectives, but it gives no executable checks. A candidate must quickly separate admission failure, scheduling failure and node-side Pending work. [CKA objectives](https://training.linuxfoundation.org/certified-kubernetes-administrator-cka-program-changes/)
  fix:     “Run kubectl describe pod and read Events. Print spec.nodeName and spec.schedulingGates. Compare Pod requests with kubectl describe node. Inspect node taints and labels. Inspect the PVC, StorageClass and volume binding mode. If nodeName exists, inspect image, volume and sandbox events instead of the scheduler.”

u01 CKA: Exam-aligned claims cover control-plane components, etcd, scheduler and kubelet ownership, self-healing, cluster failure, and component troubleshooting. Direct-etcd contract risks, exact control-plane communication paths, watch semantics and detailed outage behavior are mainly interview depth.

u02 CKA: RBAC, API authorization and rejection diagnosis map to the cluster-architecture and troubleshooting objectives. Admission webhook blast radius, authorizer chaining, optimistic concurrency and managed-field ownership are mainly interview and platform-engineering depth.

u03 CKA: Controller health, component logs and stalled reconciliation support cluster troubleshooting. Informer, reflector, workqueue, resync, cache-consistency and provider-idempotency details are interview-only depth in the current CKA curriculum.

u04 CKA: Deployments, rollouts, rollbacks, HPA, workload self-healing, scheduling behavior and Pod disruption map to current objectives. VPA interactions, controller-specific Job retry accounting and detailed PDB preemption behavior are mainly interview depth.

u05 CKA: CRD understanding and operator installation and configuration are explicit current objectives. Conversion webhooks, storage-version migration, finalizer design, CEL and server-side apply list topology are mainly interview and operator-author depth.

u06 CKA: Pod admission and scheduling, node constraints, resource requests, taints, affinity, topology, storage constraints and Pending troubleshooting map directly to current objectives. Scheduler extension-point order, Reserve and Unreserve, nominated nodes and binding concurrency are mainly interview depth.

u01 VERDICT: 11 CORRECTIONS NEEDED
u02 VERDICT: 8 CORRECTIONS NEEDED
u03 VERDICT: 10 CORRECTIONS NEEDED
u04 VERDICT: 12 CORRECTIONS NEEDED
u05 VERDICT: 8 CORRECTIONS NEEDED
u06 VERDICT: 8 CORRECTIONS NEEDED
