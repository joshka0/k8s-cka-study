/* Kubernetes Beyond YAML — deep CKA modules 21–27.
   These lessons are grounded in current upstream documentation. They extend
   the course without implying transcript coverage where captions were not
   available. */

window.COURSE.units.push(
{
  id: 'u21', n: 21, ref: 'm21', title: 'Identity, RBAC & node trust', tag: 'CKA · security',
  blurb: 'Authorization is additive and scope-sensitive; kubelet credentials establish a narrowly constrained node identity.',
  lessons: [
    { id: 'u21l1', title: 'Scope is part of the permission', items: [
      { t: 'teach', h: 'RBAC grants verbs over API resources; it has no deny rule',
        p: 'A Role is namespaced. A ClusterRole is cluster-scoped but can be bound inside one namespace. RoleBinding grants only in its namespace; ClusterRoleBinding grants cluster-wide. Effective permission is the union of every applicable grant.',
        flow: ['authenticated user / group / ServiceAccount', 'binding selects subject', 'role supplies rules', 'scope constrains the grant', 'authorizer returns allow or no opinion'],
        src: ['Kubernetes RBAC authorization', 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/'] },
      { t: 'mcq', q: 'A ClusterRole grants read access to Pods. It is referenced by a RoleBinding in namespace <code>payments</code>. What is granted?',
        o: ['Pod reads cluster-wide', 'Pod reads only in payments', 'No access because ClusterRoles require ClusterRoleBindings', 'Access to every namespaced resource'], a: 1,
        why: 'The referenced ClusterRole supplies reusable rules; the RoleBinding supplies the namespace boundary.' },
      { t: 'multi', q: 'Which are meaningful RBAC escalation paths to audit?',
        o: ['Permission to create RoleBindings to stronger roles', 'Permission to impersonate privileged subjects', 'Permission to edit aggregated ClusterRole labels or source roles', 'Permission to read Pod status only'], a: [0,1,2],
        why: 'Binding, impersonation and aggregation can turn indirect authority into effective privilege. Audit the reachable permission graph, not just one Role.' },
      { t: 'recall', q: 'Explain why “this ServiceAccount has no privileged Role” is not proof of least privilege.',
        pts: ['Permissions are additive', 'All RoleBindings and ClusterRoleBindings matter', 'Groups and impersonation matter', 'Binding or aggregation rights can escalate'],
        model: 'RBAC has no deny that cancels another grant. Resolve the ServiceAccount identity, every matching namespaced and cluster binding, aggregated role rules, and any authority to bind or impersonate stronger identities. Least privilege is a property of the effective graph.' }
    ]},
    { id: 'u21l2', title: 'A node is an authenticated principal', items: [
      { t: 'teach', h: 'Join, authenticate, authorize, then admit',
        p: 'A bootstrapping kubelet authenticates with a temporary token, submits a CSR, and receives a client certificate. Its identity convention is <code>system:node:&lt;nodeName&gt;</code> in <code>system:nodes</code>. The Node authorizer limits node API access; NodeRestriction admission further constrains Node and Pod mutations.',
        flow: ['bootstrap token', 'CSR approval', 'kubelet client certificate', 'Node authorizer', 'NodeRestriction admission', 'kubelet reports Node and Pod status'],
        src: ['Kubelet TLS bootstrapping', 'https://kubernetes.io/docs/reference/access-authn-authz/kubelet-tls-bootstrapping/'] },
      { t: 'order', q: 'Order the trust establishment for a joining kubelet.',
        o: ['Authenticate with bootstrap credentials', 'Create a certificate signing request', 'Approve and issue a client certificate', 'Reconnect as system:node:<nodeName>', 'Apply Node-authorizer and NodeRestriction constraints'],
        why: 'A Node object existing is not the beginning of trust; credentials and their constrained identity are.' },
      { t: 'mcq', q: 'A joined node remains NotReady and its kubelet logs certificate errors. What boundary should you inspect first?',
        o: ['Service load balancing', 'CSR approval, issued certificate identity and kubelet kubeconfig', 'Deployment rollout settings', 'CoreDNS cache'], a: 1,
        why: 'The kubelet must authenticate before it can update Node status and leases. A successful join command does not prove the certificate handoff completed.',
        src: ['Node authorization', 'https://kubernetes.io/docs/reference/access-authn-authz/node/'] },
      { t: 'recall', q: 'Why are Node authorization and NodeRestriction both useful?',
        pts: ['Authorization limits which API operations kubelets may request', 'Admission constrains mutations that pass authorization', 'Identity must match the node name', 'Together they reduce a compromised kubelet blast radius'],
        model: 'The Node authorizer decides whether a kubelet identity may perform an API action, based on its related Pods, Secrets and node. NodeRestriction then rejects forbidden Node or Pod mutations. They protect different gates and depend on correctly formed node identities.' }
    ]}
  ]
},
{
  id: 'u22', n: 22, ref: 'm22', title: 'Metrics, logs & interactive debugging', tag: 'CKA · troubleshooting',
  blurb: 'Choose evidence by layer: resource metrics, API state, container logs, runtime state, or host services.',
  lessons: [
    { id: 'u22l1', title: 'The Metrics API is not monitoring', items: [
      { t: 'teach', h: '<code>kubectl top</code> reads one narrow pipeline',
        p: 'The kubelet exposes summarized CPU and memory usage. metrics-server collects it and serves the aggregated <code>metrics.k8s.io</code> API; kubectl and HPA consume it. This pipeline is for recent resource signals, not application metrics, durable history, logs or control-plane health.',
        flow: ['container runtime / cAdvisor data', 'kubelet summary API', 'metrics-server', 'aggregated metrics.k8s.io', 'kubectl top / HPA'],
        src: ['Resource metrics pipeline', 'https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/'] },
      { t: 'multi', q: '<code>kubectl top</code> fails. Which checks isolate the pipeline?',
        o: ['APIService availability for metrics.k8s.io', 'metrics-server logs and readiness', 'metrics-server reachability and TLS to kubelets', 'Whether Prometheus retained last week’s series', 'Kubelet summary endpoint health'], a: [0,1,2,4],
        why: 'Prometheus is a separate observability path. Trace the actual consumer-to-provider chain.' },
      { t: 'mcq', q: 'Which question can resource metrics answer directly?',
        o: ['Why did the API server reject admission?', 'What CPU and memory usage is currently reported for a Pod or Node?', 'Which HTTP route is slow?', 'What happened before the last container restart?'], a: 1,
        why: 'Resource metrics are deliberately small and recent. Use events, application telemetry or previous logs for the other questions.' },
      { t: 'recall', q: 'Differentiate resource, component and application metrics.',
        pts: ['Resource: CPU/memory for Pods and Nodes', 'Component: Kubernetes internals and health', 'Application: workload-specific behavior', 'Collection and retention paths may differ'],
        model: 'Resource metrics feed top and autoscaling through metrics.k8s.io. Component metrics describe Kubernetes processes, commonly through /metrics. Application metrics describe business or workload behavior. Do not infer one pipeline is healthy because another is.' }
    ]},
    { id: 'u22l2', title: 'Preserve evidence before restart', items: [
      { t: 'teach', h: 'Move downward only when the upper layer stops answering',
        p: 'Start with status, conditions and events; compare current and previous container logs and termination state. Use exec when the image has tools, an ephemeral debug container when it does not, and node journals plus <code>crictl</code> when kubelet or the API path is unavailable.',
        flow: ['object status + events', 'current / previous logs', 'exec or ephemeral container', 'node journal', 'CRI state with crictl'],
        src: ['Debug running Pods', 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/'] },
      { t: 'order', q: 'Order a high-signal CrashLoopBackOff investigation.',
        o: ['Describe the Pod and inspect container state/events', 'Read current and --previous logs', 'Inspect command, config, probes and mounted inputs', 'Use an ephemeral copy/debug container if the image lacks tools', 'Inspect kubelet/runtime evidence when API-level evidence is insufficient'],
        why: 'Preserve the cheapest, most perishable evidence first. Restarting early can erase the prior failure context.' },
      { t: 'mcq', q: 'When is <code>crictl</code> especially valuable?',
        o: ['To edit an RBAC Role', 'To inspect runtime sandboxes, containers and logs on a node when Kubernetes API evidence is missing or stale', 'To query historical application metrics', 'To change a Deployment strategy'], a: 1,
        why: 'crictl talks to the CRI endpoint. It is node/runtime evidence, not a replacement for every kubectl operation.',
        src: ['Debugging nodes with crictl', 'https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/'] },
      { t: 'recall', q: 'A distroless container is failing but has no shell. Give the evidence-preserving path.',
        pts: ['Describe and events', 'Current and previous logs', 'Termination reason and exit code', 'Ephemeral debug container or debug copy', 'Node/runtime evidence if required'],
        model: 'Do not replace the image just to gain a shell. Capture state, events, termination details and previous logs. Add an ephemeral debug container or create a debug copy when namespace/filesystem access permits. Descend to kubelet journals and CRI state only if the API view cannot explain the transition.' }
    ]}
  ]
},
{
  id: 'u23', n: 23, ref: 'm23', title: 'Declarative delivery & field ownership', tag: 'CKA · operations',
  blurb: 'Rendered intent, API ownership and controller rollout state are separate layers with separate evidence.',
  lessons: [
    { id: 'u23l1', title: 'Render first, then reconcile', items: [
      { t: 'teach', h: 'Packaging tools produce objects; controllers produce convergence',
        p: 'Kustomize composes overlays and Helm renders a chart plus tracks release metadata. Inspect rendered objects before applying them. After API acceptance, normal admission, storage and reconciliation own the result; a successful render or Helm release record does not prove workload health.',
        flow: ['values / overlays', 'rendered Kubernetes objects', 'API validation + admission', 'stored desired state', 'controllers reconcile', 'workload status'],
        src: ['Kustomize', 'https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/'] },
      { t: 'order', q: 'Order a safe declarative change review.',
        o: ['Render the exact chart or overlay', 'Diff the resulting API objects', 'Use server-side validation or dry-run where appropriate', 'Apply through the intended field manager', 'Observe controller status and workload health'],
        why: 'Review the payload that the API will see, then separately verify reconciliation.' },
      { t: 'mcq', q: 'Helm reports a successful release, but Pods are unhealthy. What does Helm success fail to prove?',
        o: ['That templates rendered', 'That Kubernetes controllers converged and the application became Ready', 'That values were selected', 'That release metadata was stored'], a: 1,
        why: 'Release orchestration and runtime convergence are distinct state machines.' },
      { t: 'recall', q: 'Explain the boundary between Helm/Kustomize and Kubernetes controllers.',
        pts: ['Tools render API objects', 'API gates and stores desired state', 'Controllers own convergence', 'Status/events prove runtime result'],
        model: 'Helm and Kustomize shape declarative input. Once submitted, authentication, authorization, admission and storage apply normally. Deployments and other controllers reconcile the stored objects. Therefore inspect both the rendered diff and controller/runtime evidence.' }
    ]},
    { id: 'u23l2', title: 'Rollouts are arithmetic plus ownership', items: [
      { t: 'teach', h: 'A Deployment rollout has capacity constraints and field owners',
        p: 'A Pod-template change creates a ReplicaSet. <code>maxSurge</code> and <code>maxUnavailable</code> bound the transition; readiness controls availability. <code>progressDeadlineSeconds</code> reports stalled progress but does not automatically roll back. Server-Side Apply records per-field ownership in <code>managedFields</code> and conflicts protect another manager’s intent.',
        src: ['Deployments', 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/'] },
      { t: 'mcq', q: 'What happens when a Deployment exceeds <code>progressDeadlineSeconds</code>?',
        o: ['Kubernetes always rolls it back', 'The Deployment reports ProgressDeadlineExceeded; an operator or higher-level controller must act', 'All old Pods are force deleted', 'The API rejects future updates'], a: 1,
        why: 'The deadline is status evidence, not an automatic remediation policy.' },
      { t: 'mcq', q: 'Server-Side Apply returns a field conflict. What is the safest interpretation?',
        o: ['etcd lost quorum', 'Another field manager owns a field your apply would change', 'The object cannot be patched', 'The scheduler rejected the Pod'], a: 1,
        why: 'Inspect managedFields and resolve ownership deliberately; force-conflicts transfers ownership and is not a generic retry.',
        src: ['Server-Side Apply', 'https://kubernetes.io/docs/reference/using-api/server-side-apply/'] },
      { t: 'recall', q: 'A rollout is stalled. Name the minimum discriminating evidence.',
        pts: ['Deployment conditions and revision', 'Desired/current/available ReplicaSet counts', 'Pod readiness and events', 'surge/unavailable arithmetic', 'managedFields or admission conflicts if updates failed'],
        model: 'Identify the intended revision, compare Deployment and ReplicaSet counts against surge and unavailable bounds, then inspect why new Pods are not Ready or schedulable. If desired state never changed, inspect admission and field ownership rather than the rollout controller.' }
    ]}
  ]
},
{
  id: 'u24', n: 24, ref: 'm24', title: 'Namespace governance & live resizing', tag: 'CKA · resources',
  blurb: 'LimitRange and ResourceQuota reject or default requests at admission; resizing has separate desired and applied state.',
  lessons: [
    { id: 'u24l1', title: 'Admission budgets the namespace', items: [
      { t: 'teach', h: 'LimitRange shapes one object; ResourceQuota budgets the namespace',
        p: 'LimitRange can default and constrain per-container or per-Pod requests and limits. ResourceQuota caps aggregate consumption and object counts. Both are enforced during admission, so violations are rejected immediately rather than becoming scheduler Pending.',
        flow: ['submitted Pod', 'LimitRange defaults / validates', 'ResourceQuota accounts aggregate use', 'API admits or returns Forbidden', 'scheduler considers admitted Pod'],
        src: ['Limit Ranges', 'https://kubernetes.io/docs/concepts/policy/limit-range/'] },
      { t: 'mcq', q: 'A Pod creation returns <code>Forbidden: exceeded quota</code>. Which component should you debug first?',
        o: ['Scheduler filters', 'Namespace quota usage and the admitted resource request', 'kube-proxy', 'Container runtime'], a: 1,
        why: 'The object was rejected before persistence and scheduling. Pending and Forbidden are different boundaries.',
        src: ['Resource Quotas', 'https://kubernetes.io/docs/concepts/policy/resource-quotas/'] },
      { t: 'multi', q: 'What can ResourceQuota constrain?',
        o: ['Aggregate requested CPU and memory', 'Aggregate limits', 'Counts of selected API objects', 'The CPU actually consumed at each instant', 'Storage requests and class-scoped storage'], a: [0,1,2,4],
        why: 'Quota accounts declared API resources and object counts. Runtime utilization is a metrics/cgroup concern.' },
      { t: 'recall', q: 'Why can adding a LimitRange make previously valid Pods fail quota?',
        pts: ['LimitRange may inject default requests or limits', 'Quota evaluates the resulting admitted object', 'Defaults increase accounted resources', 'Failure occurs at admission'],
        model: 'A LimitRange can mutate omitted resources into defaults. ResourceQuota then accounts those effective requests and limits, so the same manifest can exceed budget after defaults are introduced. Inspect the namespace policies and the server-resolved object.' }
    ]},
    { id: 'u24l2', title: 'Resize has desired and applied state', items: [
      { t: 'teach', h: 'An accepted resize is not proof the cgroup changed',
        p: 'In-place resize changes container resource requests or limits without replacing the Pod when policy and node support allow it. The kubelet applies the change, and Pod status exposes the allocated/applied state and deferred or infeasible outcomes. The Pod QoS class is not recomputed by an in-place resize.',
        flow: ['patch desired resources', 'API validates resize policy', 'scheduler accounting updates', 'kubelet attempts cgroup change', 'status reports applied / deferred / infeasible'],
        src: ['Resize container resources', 'https://kubernetes.io/docs/tasks/configure-pod-container/resize-container-resources/'] },
      { t: 'mcq', q: 'A resize request is accepted, but status says it is deferred. What does that mean?',
        o: ['The API discarded the request', 'Desired state is stored, but the node cannot apply it yet and may retry', 'The Deployment must create a ReplicaSet', 'The Pod is automatically evicted'], a: 1,
        why: 'Desired and actuated resources are separate. Inspect Pod resize status and node capacity rather than assuming the patch completed.' },
      { t: 'mcq', q: 'Does in-place resize change an existing Pod’s QoS class?',
        o: ['Always', 'No; QoS class is not recomputed for the existing Pod during in-place resize', 'Only on CPU increases', 'Only when HPA initiated it'], a: 1,
        why: 'This preserves scheduling and eviction semantics for the Pod lifetime; replacement is required to obtain a different class.' },
      { t: 'recall', q: 'How do you prove a live resource resize actually took effect?',
        pts: ['Compare desired spec resources', 'Inspect allocated/applied resource status', 'Check Pod resize condition/status', 'Verify node capacity and kubelet evidence', 'Do not infer from patch success'],
        model: 'A successful patch proves desired state was accepted. Compare spec with the Pod’s allocated/applied resource status, inspect resize conditions for deferred or infeasible outcomes, and verify kubelet/cgroup evidence when necessary. Remember the Pod keeps its original QoS class.' }
    ]}
  ]
},
{
  id: 'u25', n: 25, ref: 'm25', title: 'Service exposure & endpoint locality', tag: 'CKA · networking',
  blurb: 'Service type, endpoint membership, readiness and locality preference solve different routing decisions.',
  lessons: [
    { id: 'u25l1', title: 'A Service type adds exposure layers', items: [
      { t: 'teach', h: 'ClusterIP is the base; other types add reachability',
        p: 'NodePort allocates a port on nodes on top of ClusterIP. LoadBalancer asks an implementation to provision or attach external reachability, normally still using Service semantics underneath. <code>externalTrafficPolicy: Local</code> preserves source address and avoids cross-node forwarding, but nodes without local ready endpoints cannot serve that traffic.',
        flow: ['external client', 'load balancer or node port', 'Service virtual IP / proxy', 'eligible EndpointSlice endpoint', 'Pod targetPort'],
        src: ['Services', 'https://kubernetes.io/docs/concepts/services-networking/service/'] },
      { t: 'mcq', q: 'What is the key tradeoff of <code>externalTrafficPolicy: Local</code>?',
        o: ['It disables EndpointSlices', 'It can preserve client source IP and localize forwarding, but traffic sent to a node without a local endpoint may be dropped', 'It forces dual stack', 'It bypasses readiness'], a: 1,
        why: 'Local changes endpoint eligibility at the receiving node; it is not merely a performance hint.' },
      { t: 'order', q: 'Trace a LoadBalancer Service request.',
        o: ['Reach the implementation-provisioned external address', 'Arrive at an eligible node or proxy dataplane', 'Match the Service and port', 'Select an eligible endpoint', 'Reach the Pod targetPort'],
        why: 'Each handoff has different ownership: cloud/controller integration, node data plane, Service configuration, EndpointSlice state and application listener.' },
      { t: 'recall', q: 'Why does a LoadBalancer ingress address not prove the application is reachable?',
        pts: ['Provisioning and backend health differ', 'Service ports may be wrong', 'EndpointSlices may be empty or unready', 'traffic policy may exclude endpoints', 'Pod listener or policy may fail'],
        model: 'The address proves only that external exposure was reported. Trace listener provisioning, Service ports, eligible EndpointSlices, traffic-policy locality, NetworkPolicy and the Pod listener. Status at one layer is not end-to-end evidence.' }
    ]},
    { id: 'u25l2', title: 'Membership, readiness and locality differ', items: [
      { t: 'teach', h: 'EndpointSlice conditions encode more than “present”',
        p: 'Selectors determine membership, controllers publish EndpointSlices, and endpoint conditions distinguish ready, serving and terminating state. Strict internal traffic policy can require node-local endpoints; topology-aware routing and traffic distribution express preferences that may fall back.',
        src: ['EndpointSlices', 'https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/'] },
      { t: 'multi', q: 'A Service has EndpointSlices but returns no traffic. Which facts still need proof?',
        o: ['Endpoints are ready or otherwise eligible', 'Address family matches the client/data plane', 'Traffic policy permits those endpoints from this node', 'targetPort is served by the process', 'The Service object has a creation timestamp'], a: [0,1,2,3],
        why: 'Membership alone does not imply eligibility or reachability.' },
      { t: 'mcq', q: 'Strict locality versus preferred locality: what is the distinction?',
        o: ['They are synonyms', 'Strict policy may return no endpoint when none is local; a preference can fall back to a non-local eligible endpoint', 'Preference changes DNS only', 'Strict policy ignores readiness'], a: 1,
        why: 'Treat requirements and hints differently during failure analysis.',
        src: ['Topology Aware Routing', 'https://kubernetes.io/docs/concepts/services-networking/topology-aware-routing/'] },
      { t: 'recall', q: 'Give the shortest EndpointSlice-centered Service diagnosis.',
        pts: ['Verify selector membership', 'Inspect ready/serving/terminating conditions', 'Check IP family and port', 'Apply traffic policy/locality eligibility', 'Test Pod listener'],
        model: 'Confirm the selector produced the intended endpoints, then inspect their conditions, address type and ports. Determine whether internal/external traffic policy or locality hints make them eligible from the source. Finally prove the process listens on targetPort.' }
    ]}
  ]
},
{
  id: 'u26', n: 26, ref: 'm26', title: 'Sidecars, Jobs & restart ownership', tag: 'CKA · workloads',
  blurb: 'Kubelet restart, controller replacement and Job result accounting are three different state machines.',
  lessons: [
    { id: 'u26l1', title: 'Three restart owners', items: [
      { t: 'teach', h: 'Ask which object is being restarted or replaced',
        p: 'The kubelet restarts containers inside one Pod according to restart policy. A workload controller creates replacement Pods when desired replicas are missing. The Job controller counts completions and failures. Native sidecars are init containers with container-level <code>restartPolicy: Always</code>; they start in init order, remain running, and do not prevent Job completion after main containers exit.',
        flow: ['kubelet: container restart', 'controller: Pod replacement', 'Job controller: success/failure accounting'],
        src: ['Sidecar containers', 'https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/'] },
      { t: 'mcq', q: 'A container is OOMKilled and starts again with the same Pod UID. Who performed the recovery?',
        o: ['Deployment controller', 'Kubelet according to container/Pod restart policy', 'Scheduler', 'Job controller'], a: 1,
        why: 'Same Pod UID means a container restart in the existing sandbox, not controller-created Pod replacement.' },
      { t: 'mcq', q: 'Why can a Job with a native sidecar finish?',
        o: ['Sidecars are excluded from the Pod', 'Once regular containers complete, a native sidecar does not block Job completion and is terminated by kubelet', 'Jobs ignore all restart policies', 'The scheduler deletes it'], a: 1,
        why: 'Native sidecar semantics were designed to avoid the classic never-exiting sidecar problem.' },
      { t: 'recall', q: 'Use UID and restart count to distinguish container restart from Pod replacement.',
        pts: ['Same Pod UID plus higher restartCount means kubelet restart', 'New UID means a new Pod object', 'ReplicaSet/StatefulSet/Job may create replacement', 'Events and ownerReferences identify the controller'],
        model: 'A kubelet restart preserves the Pod UID and increments container restart state. A controller replacement creates a new Pod UID, often after failure, eviction or rollout. Use ownerReferences, events and controller status to identify why replacement occurred.' }
    ]},
    { id: 'u26l2', title: 'Jobs encode a result protocol', items: [
      { t: 'teach', h: 'Completion, retry and failure policy are independent knobs',
        p: 'Indexed Jobs give each completion a stable index. <code>backoffLimitPerIndex</code> bounds retries per index, <code>podFailurePolicy</code> classifies Pod outcomes, <code>successPolicy</code> can declare success before every index completes, and <code>activeDeadlineSeconds</code> caps total active time.',
        src: ['Jobs', 'https://kubernetes.io/docs/concepts/workloads/controllers/job/'] },
      { t: 'multi', q: 'Which policies answer different Job questions?',
        o: ['podFailurePolicy classifies an observed Pod failure', 'backoffLimitPerIndex limits retry attempts per index', 'successPolicy defines when enough results constitute success', 'activeDeadlineSeconds caps elapsed active time', 'readinessProbe decides Job completion'], a: [0,1,2,3],
        why: 'Readiness controls traffic, not completion. The other fields define separate parts of the result protocol.' },
      { t: 'mcq', q: 'Why is a single global backoff limit awkward for a large indexed Job?',
        o: ['It disables indexes', 'Failures from one index can consume the shared retry budget; per-index limits isolate them', 'It prevents parallelism', 'It changes Service routing'], a: 1,
        why: 'Per-index accounting lets healthy work finish while naming permanently failed indexes.' },
      { t: 'recall', q: 'Design a Job policy for many independent shards where some exit codes are permanent.',
        pts: ['Indexed completion mode', 'podFailurePolicy maps permanent exit codes to FailIndex or equivalent action', 'per-index backoff bounds retries', 'success policy states acceptable completion', 'deadline caps total runtime'],
        model: 'Give shards stable indexes, classify known permanent exit codes without wasting retries, limit retry budget per index, define whether all or a subset must succeed, and cap total active time. Observe Job conditions and failedIndexes rather than only Pod phase.' }
    ]}
  ]
},
{
  id: 'u27', n: 27, ref: 'm27', title: 'Pod security & runtime isolation', tag: 'CKA · security',
  blurb: 'Admission policy, container configuration and runtime isolation are separate controls that compose defense in depth.',
  lessons: [
    { id: 'u27l1', title: 'Policy admission versus runtime enforcement', items: [
      { t: 'teach', h: 'Pod Security Admission evaluates a Pod spec; the runtime enforces it',
        p: 'Namespace labels select Pod Security Standard levels and modes: enforce rejects, audit records, and warn tells the client. A securityContext requests runtime settings such as UID/GID, capabilities, seccomp and filesystem behavior. Admission acceptance does not prove the runtime or kernel applied every requested mechanism.',
        flow: ['namespace PSA labels', 'Pod admission evaluation', 'stored securityContext', 'kubelet + CRI translate config', 'runtime + kernel enforce'],
        src: ['Pod Security Admission', 'https://kubernetes.io/docs/concepts/security/pod-security-admission/'] },
      { t: 'mcq', q: 'What does PSA <code>warn</code> do?',
        o: ['Reject the Pod', 'Allow it while returning a user-facing warning for violations', 'Rewrite the securityContext', 'Enforce seccomp in the kernel'], a: 1,
        why: 'Warn, audit and enforce are different admission actions; only enforce blocks creation.' },
      { t: 'multi', q: 'Which settings reduce container privilege at runtime?',
        o: ['runAsNonRoot or explicit nonzero UID', 'Dropping Linux capabilities', 'A restrictive seccomp profile', 'readOnlyRootFilesystem where compatible', 'A high Deployment revision'], a: [0,1,2,3],
        why: 'These shape the process/runtime boundary. A controller revision carries no isolation property.',
        src: ['Security context', 'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/'] },
      { t: 'recall', q: 'Why is “the Pod passed Restricted admission” not a complete security claim?',
        pts: ['PSS is a bounded baseline, not all policy', 'Admission checks the spec', 'RuntimeClass/runtime/kernel must enforce mechanisms', 'Network, identity, image and secret controls remain separate'],
        model: 'Restricted proves the submitted Pod spec met that versioned baseline at admission. It does not attest the image, workload identity, network path, secrets, node integrity or runtime implementation. Verify the resulting container configuration and layer complementary controls.' }
    ]},
    { id: 'u27l2', title: 'Choose an isolation boundary', items: [
      { t: 'teach', h: 'RuntimeClass selects a configured runtime contract',
        p: 'A RuntimeClass names a CRI runtime handler and can add scheduling constraints and Pod overhead. It may select a sandboxed runtime, but the cluster must configure that handler on eligible nodes. User namespaces remap container user IDs so container root is not host root; they complement rather than replace seccomp, capabilities and policy.',
        src: ['RuntimeClass', 'https://kubernetes.io/docs/concepts/containers/runtime-class/'] },
      { t: 'order', q: 'Order the RuntimeClass path.',
        o: ['Pod names runtimeClassName', 'Admission resolves RuntimeClass overhead/scheduling', 'Scheduler selects a compatible node', 'Kubelet asks CRI for the named runtime handler', 'Runtime creates the sandbox with its isolation mechanism'],
        why: 'The RuntimeClass object is a selector and contract; the implementation lives in node runtime configuration.' },
      { t: 'mcq', q: 'What security property does a Pod user namespace primarily add?',
        o: ['It encrypts Secrets', 'It maps container UIDs/GIDs into different host IDs, reducing the host privilege of container root', 'It authorizes API requests', 'It filters network traffic'], a: 1,
        why: 'User namespaces alter the kernel identity mapping at the container/host boundary.',
        src: ['User namespaces', 'https://kubernetes.io/docs/concepts/workloads/pods/user-namespaces/'] },
      { t: 'recall', q: 'When would you choose RuntimeClass, user namespaces, or both?',
        pts: ['RuntimeClass chooses a node-configured runtime/isolation implementation', 'User namespaces remap IDs within supported runtimes', 'Scheduling and overhead must be accounted', 'Compatibility must be tested', 'Neither replaces workload/API policy'],
        model: 'Use RuntimeClass when workloads need a distinct runtime handler or sandbox with explicit scheduling and overhead. Use user namespaces to reduce the host meaning of container UIDs. Combine them where the runtime supports it and the threat model benefits, while retaining PSA, seccomp, capability and identity controls.' }
    ]}
  ]
}
);
