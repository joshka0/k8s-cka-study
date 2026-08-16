/* Kubernetes Beyond YAML — advanced CKA completion track.
   Loaded after content.js and before the lesson engine. The course assumes
   systems experience: each lesson focuses on authority, state transitions,
   failure boundaries, and discriminating evidence. */

window.COURSE.units.push(
{
  id: 'u13', n: 13, ref: 'm13',
  title: 'Cluster bootstrap & lifecycle', tag: 'CKA · 25%',
  blurb: 'kubeadm, static control-plane Pods, upgrades, HA, Helm and Kustomize without cargo culting commands.',
  lessons: [
    { id: 'u13l1', title: 'What kubeadm actually builds', items: [
      { t: 'teach', h: 'kubeadm composes a cluster; it is not the cluster manager',
        p: 'It writes PKI and kubeconfigs, creates static Pod manifests for control-plane components, and bootstraps discovery, tokens and essential configuration. The kubelet realizes those manifests; kubeadm does not remain as a daemon.',
        flow: ['Preflight + PKI', 'kubeconfigs', 'static Pod manifests', 'kubelet starts control plane', 'bootstrap tokens + addons'],
        src: ['Creating a cluster with kubeadm', 'https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/'] },
      { t: 'order', q: 'Order the durable handoff during <code>kubeadm init</code>.',
        o: ['Generate or validate PKI and kubeconfigs', 'Write control-plane static Pod manifests', 'Kubelet watches the manifest directory', 'Runtime starts the control-plane Pods', 'API bootstrap creates cluster configuration and join material'],
        why: 'The key boundary is kubeadm writing files and API objects, then exiting. Kubelet and the runtime own the long-running processes.' },
      { t: 'mcq', q: 'The API server container is absent after a reboot. Where is the highest-value first check?',
        o: ['Deployment status in kube-system', 'The static Pod manifest and kubelet/runtime evidence on that control-plane node', 'The Ingress controller', 'The scheduler queue'], a: 1,
        why: 'A kubeadm control plane is normally represented by static Pod manifests. If kubelet cannot read or realize the manifest, the API object may only be a stale mirror Pod.',
        src: ['Static Pods', 'https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/'] },
      { t: 'recall', q: 'Explain a kubeadm control-plane bootstrap without reciting commands.',
        pts: ['kubeadm creates durable configuration, PKI and manifests', 'kubelet realizes static Pods', 'API objects and bootstrap tokens join nodes', 'CNI is installed separately'],
        model: 'kubeadm validates the host, creates PKI and kubeconfigs, and writes static Pod manifests. The kubelet notices those files and asks the runtime to start the control plane. Once the API is available, bootstrap configuration and tokens allow nodes to join. A CNI implementation remains a separate installation and failure boundary.' }
    ]},
    { id: 'u13l2', title: 'Upgrade, HA and configuration packaging', items: [
      { t: 'teach', h: 'Upgrade one compatibility boundary at a time',
        p: 'Control-plane components, kubelets, kube-proxy, CRI, CNI and stored APIs have separate skew contracts. Drain protects workloads; it does not upgrade a node. In HA, repeat a controlled sequence per control-plane node and verify quorum and API health between steps. Certificates ride on that schedule: kubeadm leaf certificates default to one year and the CAs to ten, a control-plane <code>kubeadm upgrade</code> renews the leaves unless renewal is disabled, and <code>kubeadm certs check-expiration</code> reports what is left. The report also lists externally managed certificates and marks them; kubeadm will not renew those. The rotating kubelet client certificate (<code>kubelet.conf</code>) is the one the report omits.',
        src: ['Certificate management with kubeadm', 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/'] },
      { t: 'order', q: 'Order a conservative worker-node upgrade.',
        o: ['Cordon and drain', 'Upgrade kubeadm and run the node upgrade phase', 'Upgrade kubelet and kubectl packages', 'Restart kubelet and verify node health', 'Uncordon'],
        why: 'Evacuate first, change node configuration and binaries, verify the returning node, then restore scheduling.',
        src: ['Upgrading kubeadm clusters', 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/'] },
      { t: 'mcq', q: 'Helm and Kustomize solve which different problems?',
        o: ['Both are runtime controllers', 'Helm packages and renders parameterized releases; Kustomize composes declarative overlays over Kubernetes objects', 'Helm manages nodes; Kustomize manages Pods', 'Kustomize stores secrets; Helm encrypts them'], a: 1,
        why: 'Neither is a reconciler by itself. Their output still enters the normal API request and controller paths.',
        src: ['Kustomize', 'https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/'] },
      { t: 'recall', q: 'What makes a control-plane upgrade safe rather than merely successful?',
        pts: ['Version-skew check', 'etcd and API health before each step', 'One failure domain at a time', 'Workload drain where applicable', 'Rollback and recovery material verified'],
        model: 'Prove the supported skew, verify etcd quorum and API health, change one control-plane failure domain at a time, and re-check health before continuing. Preserve configuration, PKI and a tested etcd recovery path. A command returning zero is not proof that controllers, webhooks and workloads survived.' }
    ]}
  ]
},
{
  id: 'u14', n: 14, ref: 'm14',
  title: 'Configuration, QoS & eviction', tag: 'CKA · workloads',
  blurb: 'Config delivery, rollout triggers, cgroups, QoS, kubelet eviction and kernel OOM are distinct mechanisms.',
  lessons: [
    { id: 'u14l1', title: 'Configuration is data with delivery semantics', items: [
      { t: 'teach', h: 'An API update does not imply a process reload',
        p: 'ConfigMaps and Secrets can become environment values or projected files. Environment values are fixed at process start. Mounted projections update eventually, but applications must watch or reload them. A Deployment rolls only when its Pod template changes. Two exceptions decide whether a rotated value can ever arrive: a volume mounted with <code>subPath</code> receives no automated updates, so that file stays frozen until the Pod is replaced; and <code>immutable: true</code> on a ConfigMap or Secret blocks every change to its data and cannot be unset, so rotation means delete and recreate.',
        src: ['Secrets', 'https://kubernetes.io/docs/concepts/configuration/secret/'] },
      { t: 'multi', q: 'A ConfigMap changes. Which consequences are automatic?',
        o: ['Existing environment variables change', 'A projected volume is eventually refreshed', 'The Deployment always creates a new ReplicaSet', 'An application may still need an explicit reload'], a: [1,3],
        why: 'Projection and consumption are separate. No Pod-template change means no rollout, and a file update does not mean the application rereads it.',
        src: ['ConfigMaps', 'https://kubernetes.io/docs/concepts/configuration/configmap/'] },
      { t: 'mcq', q: 'What security property does a Kubernetes Secret provide by default?',
        o: ['Encryption simply because the field is base64', 'A typed API object with access controls and delivery mechanisms; at-rest encryption must be configured separately', 'Automatic rotation in every process', 'Protection from namespace administrators'], a: 1,
        why: 'Base64 is representation, not encryption. RBAC, encryption at rest, external secret lifecycle and application reload remain separate concerns.',
        src: ['Secrets', 'https://kubernetes.io/docs/concepts/configuration/secret/'] },
      { t: 'recall', q: 'A Secret changed but the application still uses the old credential. Trace the possibilities.',
        pts: ['Environment delivery requires Pod restart', 'Volume projection updates eventually', 'The process may cache the value', 'A rollout requires a Pod-template change'],
        model: 'First identify delivery. Environment values cannot change in a running process. A projected volume can refresh, but not instantaneously, and the process may never reread it. A Deployment only rolls when the Pod template changes, so many systems deliberately place a configuration checksum in that template.' }
    ]},
    { id: 'u14l2', title: 'QoS, node pressure and OOM', items: [
      { t: 'teach', h: 'QoS is classification; eviction and OOM are actions',
        p: 'Guaranteed, Burstable and BestEffort are derived from CPU and memory requests and limits. Kubelet node-pressure eviction ranks Pods using whether usage exceeds requests, Priority, and relative excess. If memory rises faster than kubelet reacts, the kernel OOM killer selects a container using usage and <code>oom_score_adj</code>.',
        clip: ['6vkMSmDwD8U', 831, 'How Kubernetes maps QoS classes into the cgroup hierarchy'] },
      { t: 'mcq', q: 'What must be true for the traditional container-level Guaranteed QoS class?',
        o: ['The Pod has a PriorityClass', 'Every container has positive CPU and memory requests equal to its limits', 'The Pod has no limits', 'Only the main container has equal requests and limits'], a: 1,
        why: 'One under-specified sidecar changes the whole Pod classification. QoS is derived; it is not a field you set.',
        src: ['Pod QoS classes', 'https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/'] },
      { t: 'mcq', q: 'Kubelet eviction versus kernel OOM kill: what is the discriminator?',
        o: ['Both are API-server decisions', 'Kubelet proactively fails a Pod from pressure signals; the kernel kills a process/container when memory is exhausted', 'Only OOM uses requests', 'Only eviction can restart a container'], a: 1,
        why: 'Eviction sets the Pod Failed and a controller may replace it. OOM kill is below Kubernetes; kubelet may restart that container according to restartPolicy.',
        clip: ['jVwXcuNEDYE', 696, 'Node-pressure eviction and the kubelet protecting node integrity'] },
      { t: 'recall', q: 'Why is “BestEffort is evicted first” an incomplete production answer?',
        pts: ['QoS is only a useful approximation', 'Actual ranking considers usage above requests', 'Priority then relative excess distinguish candidates', 'Disk and PID pressure differ from memory OOM'],
        model: 'QoS predicts common outcomes because BestEffort has zero requests, but kubelet does not sort by the QoS label alone. It first separates Pods using more than requested, then considers Priority, then usage relative to requests. Disk, inode and PID pressure have their own signals, while kernel OOM selection uses oom_score behavior.' }
    ]}
  ]
},
{
  id: 'u15', n: 15, ref: 'm15',
  title: 'Ingress, Gateway API & policy', tag: 'CKA · networking',
  blurb: 'North-south API objects configure controllers; they do not forward packets themselves.',
  lessons: [
    { id: 'u15l1', title: 'From listener to backend', items: [
      { t: 'teach', h: 'Route APIs describe intent; controllers build the data plane',
        p: 'Ingress is a compact HTTP routing API. Gateway API separates infrastructure ownership from route ownership through GatewayClass, Gateway and Route resources. In both cases a controller must observe the objects and configure a proxy or load balancer.',
        flow: ['Client + external address', 'Gateway / Ingress listener', 'Route match', 'Service', 'EndpointSlice', 'ready Pod'] },
      { t: 'teach', h: 'The path type is half of the match',
        p: 'Every Ingress path needs an explicit <code>pathType</code> or validation fails. <code>Exact</code> matches the whole path, case sensitive. <code>Prefix</code> matches element by element after splitting on <code>/</code>, so <code>/v1</code> covers <code>/v1</code> and <code>/v1/users</code> but not <code>/v1beta1</code> — it is not a string prefix. <code>ImplementationSpecific</code> hands the decision to the controller. Omitting <code>ingressClassName</code> lets admission apply the default IngressClass; with more than one class marked default, admission instead rejects the Ingress.',
        src: ['Ingress path types', 'https://kubernetes.io/docs/concepts/services-networking/ingress/#path-types'] },
      { t: 'mcq', q: 'A valid HTTPRoute exists but no listener serves it. What is unproven?',
        o: ['That etcd stored it', 'That a compatible controller accepted the parent reference and programmed a data plane', 'That CoreDNS exists', 'That the scheduler can bind Pods'], a: 1,
        why: 'Status parents and conditions reveal acceptance and resolution. API acceptance alone never proves a controller implemented the request.',
        src: ['Gateway API', 'https://kubernetes.io/docs/concepts/services-networking/gateway/'] },
      { t: 'mcq', q: 'What is the strongest Gateway API improvement over Ingress?',
        o: ['It removes Services', 'It provides role-oriented, extensible resources for infrastructure, listeners and routes', 'It is implemented directly by kube-apiserver', 'It only supports HTTP'], a: 1,
        why: 'GatewayClass/Gateway can be owned by platform teams while Routes are owned by application teams, with explicit attachment and status.',
        src: ['Ingress', 'https://kubernetes.io/docs/concepts/services-networking/ingress/'] },
      { t: 'recall', q: 'Trace an external HTTP request to a Pod and name every programmable boundary.',
        pts: ['External address and listener', 'Gateway/Ingress controller data plane', 'Route match', 'Service translation', 'EndpointSlice readiness', 'Pod listener and policy'],
        model: 'The client reaches an external address and listener programmed by the implementation. A route selects a backend Service. The node or proxy data plane chooses a ready EndpointSlice endpoint, routing reaches the Pod, NetworkPolicy permits the flow, and the process must listen on the target port.' }
    ]},
    { id: 'u15l2', title: 'NetworkPolicy and service diagnosis', items: [
      { t: 'teach', h: 'Policy permits a path; it never creates one',
        p: 'NetworkPolicy selects Pods and allowed peers/ports. Enforcement belongs to the network implementation. Diagnose routing, endpoint selection, policy and application listening as independent layers.' },
      { t: 'multi', q: 'A Service times out. Which checks discriminate the major layers?',
        o: ['Service selector and ports', 'EndpointSlice addresses and readiness', 'Direct Pod-IP reachability from the same source', 'NetworkPolicy enforcement and counters', 'Deployment creation timestamp'], a: [0,1,2,3],
        why: 'Those checks isolate API selection, backend readiness, Pod routing, and policy. The Service object itself does not prove any of them.' },
      { t: 'order', q: 'Order a high-signal Service diagnosis.',
        o: ['Resolve the name and inspect the Service', 'Inspect EndpointSlices', 'Test the backend Pod IP and target port', 'Inspect node/proxy data-plane state', 'Evaluate NetworkPolicy and the application listener'],
        why: 'Move from identity to selected backends to raw reachability, then translation and policy. This avoids changing five layers at once.',
        src: ['Debug Services', 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/'] },
      { t: 'recall', q: 'Why can a NetworkPolicy object be accepted yet have no effect?',
        pts: ['API storage is not enforcement', 'The CNI/network implementation must support NetworkPolicy', 'Selection may match no Pods', 'Both ingress and egress isolation matter'],
        model: 'The API server stores NetworkPolicy but does not enforce packets. The network implementation must implement the API, the policy must actually select the intended Pods, and the direction and peer selectors must match the flow. Prove enforcement in the data plane rather than inferring it from object existence.' }
    ]}
  ]
},
{
  id: 'u16', n: 16, ref: 'm16',
  title: 'NUMA-aware node resources', tag: 'Advanced nodes',
  blurb: 'CPU, memory and devices must be aligned locally after cluster-level scheduling succeeds.',
  lessons: [
    { id: 'u16l1', title: 'Hint providers and local admission', items: [
      { t: 'teach', h: 'Cluster feasibility is not hardware locality',
        p: 'The scheduler can find aggregate CPU, memory and device capacity without proving a coherent NUMA placement. On the selected node, CPU Manager, Memory Manager and Device Manager provide topology hints; Topology Manager merges them and may admit or reject the Pod. The policy decides how strict that merge is: <code>none</code> does not align, <code>best-effort</code> admits even when the merged hint is not preferred, <code>restricted</code> refuses that Pod at admission, and <code>single-numa-node</code> also demands one NUMA node. A refused Pod ends in Terminated with an admission failure and the scheduler does not retry it, so a controller has to create a replacement.',
        src: ['Topology Manager', 'https://kubernetes.io/docs/tasks/administer-cluster/topology-manager/'],
        clip: ['KU_EtejzXp0', 483, 'Topology Manager gathers hints during kubelet Pod admission'] },
      { t: 'mcq', q: 'Which workload is eligible for exclusive CPUs under the static CPU Manager policy?',
        o: ['Any Pod with a CPU limit', 'A Guaranteed container requesting a positive integer number of CPUs', 'A BestEffort Pod', 'Any high-priority Pod'], a: 1,
        why: 'Exclusive cpusets require exact integer CPU allocation. Fractional Guaranteed CPUs remain in the shared pool.',
        src: ['CPU Manager', 'https://kubernetes.io/docs/tasks/administer-cluster/cpu-management-policies/'] },
      { t: 'mcq', q: 'A Pod was scheduled but fails node admission with a topology error. Is that contradictory?',
        o: ['Yes, scheduler decisions are final', 'No; scheduler feasibility and kubelet NUMA alignment use different information and happen at different boundaries', 'Only storage can reject after binding', 'It proves the Node object is stale'], a: 1,
        why: 'Topology Manager is node-local. Strict policies can reject an allocation that looked feasible in aggregate.' },
      { t: 'recall', q: 'Explain CPU Manager, Memory Manager and Topology Manager as one protocol.',
        pts: ['Managers know their own resource', 'They emit NUMA hints', 'Topology Manager merges hints under a policy', 'Managers enact the chosen affinity or admission fails'],
        model: 'CPU, memory and device managers each know their own availability and emit NUMA affinity hints. Topology Manager merges those hints under none, best-effort, restricted or single-numa-node policy. The selected affinity is returned to the managers for allocation; strict policy can reject local admission.' }
    ]},
    { id: 'u16l2', title: 'Low-latency evidence', items: [
      { t: 'teach', h: 'A CPU limit is not CPU isolation',
        p: 'CFS quota caps time; a cpuset constrains placement. Predictable latency may also require reserved system CPUs, NUMA-local memory and devices, IRQ placement, huge pages and a runtime/kernel configuration that preserves the intended cgroup hierarchy.',
        clip: ['fbf9jv_vwVE', 861, 'Static CPU Manager policy and exclusive CPU assignment'] },
      { t: 'multi', q: 'Which mechanisms can create latency despite low average CPU usage?',
        o: ['CFS throttling', 'CPU migration and cache misses', 'Remote NUMA memory/device access', 'IRQ and system-daemon interference', 'A large Deployment generation number'], a: [0,1,2,3],
        why: 'Average utilization hides scheduling delay, throttling and locality. Each mechanism has different node-level evidence.' },
      { t: 'mcq', q: 'What does <code>single-numa-node</code> promise?',
        o: ['All Pods share one NUMA node', 'Admitted topology-aware resources for the scope can be aligned to one NUMA node, otherwise admission fails', 'The scheduler becomes NUMA-aware', 'CPU throttling is disabled globally'], a: 1,
        why: 'It is a kubelet admission policy, not cluster-level placement magic.',
        src: ['Topology Manager', 'https://kubernetes.io/docs/tasks/administer-cluster/topology-manager/'] },
      { t: 'recall', q: 'A latency-sensitive Pod is Guaranteed but jittery. What do you inspect?',
        pts: ['CPU Manager policy and cpuset', 'CFS throttling metrics', 'Topology Manager scope/policy and admission', 'NUMA locality', 'reserved CPUs, IRQs and system daemons'],
        model: 'Guaranteed QoS alone does not isolate CPUs. Verify static CPU Manager eligibility and the actual cpuset, throttling metrics, Topology Manager policy and chosen NUMA affinity, memory/device locality, and whether reserved CPUs, interrupts or system daemons still contend with the workload.' }
    ]}
  ]
},
{
  id: 'u17', n: 17, ref: 'm17',
  title: 'Devices & Dynamic Resource Allocation', tag: 'Advanced scheduling',
  blurb: 'Device plugins expose integer capacity; DRA models device identity, attributes, claims and lifecycle.',
  lessons: [
    { id: 'u17l1', title: 'From scalar devices to claims', items: [
      { t: 'teach', h: 'DRA makes devices first-class scheduling state',
        p: 'Device plugins advertise vendor extended resources as scalar node capacity. DRA drivers publish ResourceSlices; DeviceClasses categorize devices; ResourceClaims express requirements; the scheduler allocates a matching device and selects a reachable node. A Pod declares each claim under <code>spec.resourceClaims</code>, and each entry names exactly one of <code>resourceClaimName</code>, for a claim you created and keep alive, or <code>resourceClaimTemplateName</code>, for one generated from a template. Declaring the claim is only half: a container receives the device only when it also lists that entry under <code>resources.claims</code>.',
        src: ['Allocate devices with DRA', 'https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/'],
        clip: ['Op4DNDTij1U', 213, 'ResourceSlices and ResourceClaims replace string-and-count device requests'] },
      { t: 'mcq', q: 'What is the core difference between a DeviceClass and a ResourceClaim?',
        o: ['Both are allocated devices', 'A DeviceClass describes a category; a ResourceClaim requests and records an allocation from one', 'DeviceClass is namespaced; ResourceClaim is cluster-scoped', 'Claims only work for storage'], a: 1,
        why: 'Class is policy/categorization; claim is workload intent and allocation state.',
        src: ['Dynamic Resource Allocation', 'https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/'] },
      { t: 'order', q: 'Order the DRA scheduling handshake.',
        o: ['Driver publishes ResourceSlices', 'Admin defines a DeviceClass', 'Workload references a ResourceClaim or template', 'Scheduler allocates a matching device and node', 'Kubelet and driver prepare it for the container'],
        why: 'Availability is advertised before a claim can be allocated; preparation occurs only after node selection.' },
      { t: 'recall', q: 'Device plugin versus DRA — give the architectural discriminator.',
        pts: ['Device plugin advertises scalar extended resources through kubelet', 'DRA publishes structured devices through API objects', 'Claims support filtering, sharing and lifecycle', 'Both still require node-side preparation'],
        model: 'The device-plugin model exposes vendor resources as integer capacity on Node status and allocates them through kubelet. DRA publishes structured device inventory as ResourceSlices and lets workloads request through ResourceClaims, enabling attribute selection, sharing and richer lifecycle. Both need a vendor driver to prepare real hardware.' }
    ]},
    { id: 'u17l2', title: 'Claim lifecycle and diagnosis', items: [
      { t: 'teach', h: 'A pending device workload spans three owners',
        p: 'The scheduler allocates claims and selects a node, the DRA controller/driver publishes inventory and may coordinate readiness, and kubelet prepares the allocated device. Status on the Pod, ResourceClaim and ResourceSlice separates those phases.' },
      { t: 'mcq', q: 'When is a ResourceClaimTemplate preferable?',
        o: ['When several Pods must share one long-lived claim', 'When each Pod should receive a separately generated claim with the same requirements', 'When no driver exists', 'When requesting a PVC'], a: 1,
        why: 'A template is a factory tied to workload/Pod lifecycle; a directly named claim can be shared or outlive one Pod.',
        src: ['Allocate devices with DRA', 'https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/'] },
      { t: 'multi', q: 'A DRA-backed Pod is Pending. Which evidence distinguishes causes?',
        o: ['Claim allocation status and events', 'DeviceClass selectors and ResourceSlice inventory', 'Node reachability/topology', 'Driver and scheduler plugin logs', 'The Service clusterIP'], a: [0,1,2,3],
        why: 'The failure may be no matching device, no reachable node, allocation conflict or driver readiness. Service networking is downstream.' },
      { t: 'recall', q: 'Trace deletion of a Pod that owns a generated device claim.',
        pts: ['Container stops', 'Kubelet/driver unprepare device', 'Reservation is released', 'Generated claim lifecycle completes', 'Inventory becomes allocatable again'],
        model: 'Pod termination first removes the consumer. Kubelet asks the DRA driver to unprepare the allocated device, allocation/reservation state is released, and a generated claim can be garbage-collected with its owner. ResourceSlice inventory then makes the device available for a later allocation.' }
    ]}
  ]
},
{
  id: 'u18', n: 18, ref: 'm18',
  title: 'Advanced API machinery & policy', tag: 'Esoteric APIs',
  blurb: 'Aggregated servers, watch consistency, CEL admission, review APIs and impersonation.',
  lessons: [
    { id: 'u18l1', title: 'Aggregation and advanced reads', items: [
      { t: 'teach', h: 'Not every Kubernetes API is stored by kube-apiserver',
        p: 'An APIService claims a group/version path in the aggregation layer. kube-apiserver authenticates and proxies requests to an extension API server, which can implement custom storage and subresources. CRDs instead use generic kube-apiserver storage and behavior.',
        clip: ['ifwNDvRSQWU', 178, 'CRDs versus aggregated API servers'] },
      { t: 'mcq', q: 'When does an aggregated API beat a CRD?',
        o: ['Whenever YAML is inconvenient', 'When you need custom storage, non-CRUD subresources or arbitrary server behavior', 'When you need list/watch', 'When you need labels'], a: 1,
        why: 'CRDs already provide generic CRUD, watch, schema and status/scale. Aggregation earns its operational cost only for behavior the generic server cannot supply.',
        src: ['API aggregation', 'https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/'] },
      { t: 'multi', q: 'What do watch BOOKMARK and HTTP 410 Gone mean?',
        o: ['BOOKMARK marks progress through a resource version without representing an ordinary object change', '410 means requested history is no longer available and the client must relist', 'BOOKMARK guarantees a fixed delivery interval', '410 means authorization failed'], a: [0,1],
        why: 'Bookmarks improve progress tracking; they are optional. Expired history requires rebuilding current state rather than guessing missed events.',
        src: ['API concepts', 'https://kubernetes.io/docs/reference/using-api/api-concepts/'] },
      { t: 'recall', q: 'Explain the availability cost of registering an APIService.',
        pts: ['Discovery and matching requests depend on extension-server latency', 'TLS and request-header trust join the path', 'kube-apiserver proxies rather than stores', 'Failure can degrade discovery clients'],
        model: 'An APIService inserts an extension server behind kube-apiserver for a claimed path. Discovery and matching requests now depend on its Service, endpoints, TLS and response latency. kube-apiserver still fronts authentication and authorization, but the extension owns serving and often storage; a sick server can degrade discovery and clients broadly.' }
    ]},
    { id: 'u18l2', title: 'CEL admission and authorization review', items: [
      { t: 'teach', h: 'Use an in-process policy when you do not need a network call',
        p: 'ValidatingAdmissionPolicy holds CEL logic; a binding scopes it and chooses enforcement actions; an optional parameter resource supplies data. SubjectAccessReview asks the authorizer about a subject, TokenReview asks authenticators about a token, and impersonation changes request identity only after a separate permission check. That check is the <code>impersonate</code> verb on <code>users</code>, <code>groups</code> or <code>serviceaccounts</code> in the core API group. Impersonating a user or group is not namespace scoped, so it takes a ClusterRole and a ClusterRoleBinding, and <code>resourceNames</code> is the only thing that limits which names a subject may assume.',
        src: ['User impersonation', 'https://kubernetes.io/docs/reference/access-authn-authz/user-impersonation/'],
        clip: ['7NO8HXzjLAk', 498, 'Policy, binding and parameter resources'] },
      { t: 'mcq', q: 'Why can ValidatingAdmissionPolicy be safer operationally than a webhook?',
        o: ['It can mutate objects', 'It runs CEL in-process and removes a Service, DNS, TLS and network timeout dependency', 'It bypasses authorization', 'It cannot fail closed'], a: 1,
        why: 'It reduces the hot-path dependency surface. It remains validation only and still requires careful matching, cost and failure-policy design.',
        src: ['ValidatingAdmissionPolicy', 'https://kubernetes.io/docs/reference/access-authn-authz/validating-admission-policy/'] },
      { t: 'mcq', q: 'TokenReview versus SubjectAccessReview?',
        o: ['Both grant RBAC', 'TokenReview authenticates a bearer token; SubjectAccessReview asks whether a named subject may perform an action', 'TokenReview validates Pods; SAR validates tokens', 'SAR creates users'], a: 1,
        why: 'One resolves identity evidence, the other evaluates authorization attributes. Neither stores a normal user object.' },
      { t: 'recall', q: 'How do you debug “can user X do Y?” without giving yourself X credentials?',
        pts: ['Use SubjectAccessReview for an explicit identity', 'Use SelfSubjectAccessReview for the caller', 'Impersonation requires the impersonate verb', 'Audit retains original and impersonated identity context'],
        model: 'Create a SubjectAccessReview to ask the configured authorizers about explicit user, groups and resource or non-resource attributes. Use SelfSubjectAccessReview for the current caller. Impersonation can exercise the real request path, but it is itself cluster-scoped privilege and must be audited carefully.' }
    ]}
  ]
},
{
  id: 'u19', n: 19, ref: 'm19',
  title: 'Coordination & deferred commitment', tag: 'Esoteric APIs',
  blurb: 'Leases, leader election, scheduling gates, readiness gates and finalizers delay different kinds of commitment.',
  lessons: [
    { id: 'u19l1', title: 'Lease-backed leadership', items: [
      { t: 'teach', h: 'Leader election is optimistic concurrency over expiring state',
        p: 'Candidates observe and update one Lease. <code>holderIdentity</code>, <code>renewTime</code> and <code>leaseDurationSeconds</code> describe current ownership. Resource-version conflicts ensure only one competing update wins; expiration permits takeover after failure.',
        clip: ['WslJyYb81w8', 171, 'The Lease object used as the leader-election lock'] },
      { t: 'mcq', q: 'Why do Nodes have Lease objects in <code>kube-node-lease</code>?',
        o: ['To reserve CPU', 'To provide lightweight, frequently updated heartbeats without constantly rewriting the large Node object', 'To store kubelet logs', 'To lock Pod scheduling'], a: 1,
        why: 'Node liveness and component leader election reuse the Lease API for different coordination problems.',
        src: ['Leases', 'https://kubernetes.io/docs/concepts/architecture/leases/'] },
      { t: 'mcq', q: 'Two controller replicas believe the Lease expired and update it simultaneously. What prevents two winners?',
        o: ['DNS round robin', 'Optimistic concurrency on resourceVersion', 'A PodDisruptionBudget', 'The scheduler Permit phase'], a: 1,
        why: 'Only one conditional API update succeeds. The loser observes a conflict and returns to following.' },
      { t: 'recall', q: 'What can leader election guarantee—and what can it not?',
        pts: ['One current Lease holder under API consistency', 'Failover after renewal stops and duration expires', 'It cannot make external side effects exactly once', 'Fencing/idempotency may still be required'],
        model: 'Lease acquisition gives one current API-visible leader and failover after missed renewals. It cannot revoke work already issued by an old leader or make an external side effect exactly once across partitions and pauses. Controllers still need idempotency and, for dangerous systems, a fencing mechanism.' }
    ]},
    { id: 'u19l2', title: 'Four gates, four state transitions', items: [
      { t: 'teach', h: 'A gate only blocks its own transition',
        p: '<code>schedulingGates</code> keep a Pod out of active scheduling. Readiness gates keep a running Pod out of Ready and Service endpoints. Finalizers hold deletion after a deletion timestamp. A Lease holds logical leadership. They are not interchangeable.' },
      { t: 'multi', q: 'Match the gate to the transition it delays.',
        o: ['schedulingGates → entering scheduler placement', 'readinessGates → Ready condition and endpoint participation', 'finalizers → physical deletion from API storage', 'Lease → one actor holding leadership', 'PodDisruptionBudget → kernel OOM selection'], a: [0,1,2,3],
        why: 'The first four are precise. A PDB constrains voluntary Eviction API requests; it cannot govern the kernel.' },
      { t: 'mcq', q: 'Why can scheduling gates reduce cluster load?',
        o: ['They reserve a node immediately', 'They keep known-unready Pods from repeatedly cycling through scheduler and autoscaler queues', 'They disable admission', 'They increase Pod priority'], a: 1,
        why: 'A controller removes gates when external prerequisites exist. Gates may be removed after creation but cannot be newly added.',
        src: ['Pod scheduling readiness', 'https://kubernetes.io/docs/concepts/scheduling-eviction/pod-scheduling-readiness/'] },
      { t: 'recall', q: 'A Pod is Pending with reason SchedulingGated. What should you investigate?',
        pts: ['The named gates in spec', 'Which controller or admission rule added them', 'The external prerequisite that controller observes', 'Why it has not removed each gate'],
        model: 'Do not debug node capacity first. Read spec.schedulingGates, identify the controller or admission policy that initialized them, then inspect the prerequisite and that controller evidence. The scheduler is correctly refusing to consider the Pod until all gates are removed.' }
    ]}
  ]
},
{
  id: 'u20', n: 20, ref: 'm20',
  title: 'CKA troubleshooting spine', tag: 'CKA · 30%',
  blurb: 'A hypothesis-driven path through control plane, node, workload, storage, Service and DNS failures.',
  lessons: [
    { id: 'u20l1', title: 'Control plane and node', items: [
      { t: 'teach', h: 'Start at the nearest authority still answering',
        p: 'If the API responds, use object status, events and component endpoints. If it does not, move below Kubernetes: load balancer, static Pod manifests, kubelet service, runtime, certificates, sockets and host resources. <code>kubectl</code> cannot diagnose the API that makes kubectl possible.' },
      { t: 'teach', h: 'NotReady runs on a documented clock, not one round number',
        p: 'The node controller checks every node on <code>--node-monitor-period</code>, 5 seconds by default. When a node stops renewing its Lease and reporting status, the controller sets the Ready condition to Unknown and adds the matching <code>NoExecute</code> taint. Only then does the eviction clock start: by default the controller waits five minutes between marking a node Unknown and its first API-initiated eviction request, and it evicts at <code>--node-eviction-rate</code>, 0.1 nodes per second. Quote the chain and the flag names, not a single memorized number — every step is configurable.',
        flow: ['kubelet renews Lease', 'monitor period 5s', 'Ready Unknown + NoExecute taint', 'first eviction request ~5 min', 'rate-limited by --node-eviction-rate'],
        src: ['Nodes', 'https://kubernetes.io/docs/concepts/architecture/nodes/'] },
      { t: 'order', q: 'Order diagnosis when one control-plane node is unhealthy.',
        o: ['Prove load-balancer/API reachability from the client', 'Compare healthy and unhealthy API endpoints', 'Inspect kubelet service and static Pod manifests on the node', 'Inspect runtime containers and component logs', 'Verify certificates, etcd reachability and host pressure'],
        why: 'Begin outside, locate the failing boundary, then descend into the node. Avoid restarting everything before preserving evidence.' },
      { t: 'multi', q: 'A Node is NotReady. Which evidence separates likely layers?',
        o: ['Node conditions and Lease renewTime', 'kubelet service logs and configuration', 'CRI endpoint and runtime health', 'CNI state and node routes', 'The number of Helm releases'], a: [0,1,2,3],
        why: 'Lease shows heartbeat freshness; conditions name pressure/network symptoms; kubelet, CRI and CNI evidence then locate the owner.' },
      { t: 'recall', q: 'Give a 90-second NotReady diagnosis.',
        pts: ['Inspect conditions, taints and Lease', 'Check host reachability and clocks', 'Check kubelet and certificate/config errors', 'Check runtime/CRI and CNI', 'Preserve evidence before restart'],
        model: 'Read Node conditions, taints and its Lease to determine when and how contact failed. Check host reachability and time, then kubelet service state, configuration and client certificate. Verify the CRI socket and runtime, then CNI initialization and node routes. Restart only after locating and recording the failing boundary.' }
    ]},
    { id: 'u20l2', title: 'Workload, storage and network', items: [
      { t: 'teach', h: 'Status names the phase; events name attempted transitions',
        p: 'Pending points to admission, quota, scheduling or claims. ContainerCreating points to image, sandbox, CNI or mounts. CrashLoopBackOff points to a repeatedly failing process or probe. Running-not-Ready points to readiness, dependencies or endpoint selection.' },
      { t: 'mcq', q: 'A container restarts too quickly to inspect its current log. What is the precise next evidence?',
        o: ['The scheduler log', '<code>kubectl logs --previous</code> for the prior container instance, plus termination state', 'The Service YAML', 'etcd WAL files'], a: 1,
        why: 'Pod identity survives container restarts. The previous instance log and lastState distinguish process exit, signal, OOM and probe-driven restart.' },
      { t: 'order', q: 'Order diagnosis for “the Service name resolves but connections fail.”',
        o: ['Inspect Service ports and selector', 'Inspect EndpointSlices and readiness', 'Test the target port on a Pod IP', 'Inspect Service data-plane programming', 'Inspect NetworkPolicy and application listener'],
        why: 'DNS already proved only name resolution. Move through selection, raw backend reachability, translation, policy and process state.',
        src: ['Troubleshooting applications', 'https://kubernetes.io/docs/tasks/debug/debug-application/'] },
      { t: 'recall', q: 'Give the compact CKA troubleshooting algorithm.',
        pts: ['State the expected transition and current observation', 'Identify the owner of that transition', 'Read status/events/logs at that boundary', 'Compare with one adjacent healthy layer', 'Change one thing and verify'],
        model: 'Name the transition that should have happened and what you actually observe. Identify its owner—API server, controller, scheduler, kubelet, runtime, CNI, CSI, proxy or application. Read that owner’s status, events and logs, compare an adjacent healthy boundary, make one evidence-backed change, and verify the state transition completed.' }
    ]}
  ]
}
);
