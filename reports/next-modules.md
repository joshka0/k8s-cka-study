# Next module research

This backlog compares the 20-module course with the Kubernetes v1.35 CKA
curriculum. It prioritizes gaps for an experienced engineer: authority,
state transitions, failure boundaries, and evidence rather than command
memorization.

## Recommended order

1. Identity, RBAC, and node trust
2. Metrics, logs, and interactive debugging
3. Declarative delivery, ownership, and rollout mechanics
4. Namespace resource governance and live resizing
5. Service exposure, EndpointSlice conditions, and locality
6. Native sidecars, Jobs, and restart semantics
7. Pod execution security and runtime isolation

The first five close CKA-core gaps. The final two are advanced interview
enrichment. Existing storage, scheduler-internals, API-machinery, controller,
DNS, HA, and DRA coverage is already comparatively strong.

Caption status: a normal English-caption request for the first new candidate
(`CnHTCTP8d48`) was blocked by YouTube at the IP level on 2026-08-10. No proxy
or bypass was attempted. These videos remain research candidates and do not
support transcript-derived claims in the current course.

## 21. Identity, RBAC, and node trust

**Track:** CKA core

Go beyond the authentication/authorization distinction: namespaced versus
cluster-scoped grants, role aggregation, ServiceAccount identity, certificate
groups, kubelet bootstrap and rotation, Node authorization, and
`NodeRestriction` admission.

Interview outcomes:

- Construct and debug least-privilege RBAC.
- Trace users, ServiceAccounts, and nodes into groups and authorization.
- Diagnose a joined-but-unauthorized node and stalled kubelet CSRs.
- Separate Node authorizer permissions from `NodeRestriction` field controls.

Primary references:

- [RBAC authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [Authentication](https://kubernetes.io/docs/reference/access-authn-authz/authentication/)
- [Certificates and CSRs](https://kubernetes.io/docs/reference/access-authn-authz/certificate-signing-requests/)
- [Kubelet TLS bootstrapping](https://kubernetes.io/docs/reference/access-authn-authz/kubelet-tls-bootstrapping/)
- [Node authorization](https://kubernetes.io/docs/reference/access-authn-authz/node/)

Video candidates:

- [Role based access control policies in Kubernetes](https://www.youtube.com/watch?v=CnHTCTP8d48)
- [Certifik8s: All You Need to Know About Certificates in Kubernetes](https://www.youtube.com/watch?v=gXz4cq3PKdg)

## 22. Metrics, logs, and interactive debugging

**Track:** CKA core; closes the highest-weight domain gap

Teach the concrete machinery behind `kubectl top`, the Metrics API,
metrics-server, kubelet collection, current and previous container logs,
ephemeral containers, node journals, and `crictl` when the API is unavailable.

Interview outcomes:

- Trace `kubectl top` through the aggregated Metrics API to kubelet data.
- Distinguish resource metrics, component metrics, and application telemetry.
- Preserve current and previous container evidence before restarting.
- Debug distroless containers and move below a failed API server.

Primary references:

- [Resource metrics pipeline](https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/)
- [Logging architecture](https://kubernetes.io/docs/concepts/cluster-administration/logging/)
- [Debug running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/)
- [Debug nodes with crictl](https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/)
- [Troubleshooting clusters](https://kubernetes.io/docs/tasks/debug/debug-cluster/)

Video candidates:

- [Deep Dive: Kubernetes Metric APIs using Prometheus](https://www.youtube.com/watch?v=cIoOAbzhR7k)
- [Seeing is Believing: Debugging with Ephemeral Containers](https://www.youtube.com/watch?v=obasTgzhVR0)
- [Debugging Kubernetes: What to Do When Something Goes Wrong](https://www.youtube.com/watch?v=7b0Qg1Mv55w)

## 23. Declarative delivery, ownership, and rollout mechanics

**Track:** CKA core

Deepen Helm and Kustomize from labels into rendered-output inspection, Helm
release state versus controller state, Deployment revision arithmetic,
progress deadlines, paused rollouts, rollback limits, and Server-Side Apply
field ownership.

Interview outcomes:

- Render and inspect packaging output before admission.
- Predict ReplicaSet transitions from surge, unavailable, readiness, and
  terminating replicas.
- Diagnose a stalled rollout from conditions, ReplicaSets, and Pods.
- Explain field-manager conflicts and safe Server-Side Apply behavior.

Primary references:

- [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kustomize](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/)
- [Declarative object management](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/)
- [Server-Side Apply](https://kubernetes.io/docs/reference/using-api/server-side-apply/)
- [Helm charts](https://helm.sh/docs/topics/charts/)

Video candidates:

- [Deep Dive: Helm](https://www.youtube.com/watch?v=8zLAD9Agr2g)
- [Kustomize: Deploy Your App with Template Free YAML](https://www.youtube.com/watch?v=ahMIBxufNR0)
- [Understanding the Kubernetes API: Request Lifecycle to Server-Side Apply](https://www.youtube.com/watch?v=VcHngMgOivo)

## 24. Namespace resource governance and live resizing

**Track:** CKA core with current API enrichment

Connect requests and limits to `LimitRange`, `ResourceQuota`, admission-time
defaults and rejections, object-count quotas, and in-place resize status.

Interview outcomes:

- Predict how limits, defaults, and quotas interact during admission.
- Separate quota `Forbidden` failures from scheduler `FailedScheduling`.
- Read desired versus actual resources during an in-place resize.
- Explain why changing resources does not recompute a Pod's creation-time QoS
  class.

Primary references:

- [Resource management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [LimitRanges](https://kubernetes.io/docs/concepts/policy/limit-range/)
- [ResourceQuotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/)
- [In-place container resource resize](https://kubernetes.io/docs/tasks/configure-pod-container/resize-container-resources/)
- [Pod-level resources](https://kubernetes.io/docs/tasks/configure-pod-container/assign-pod-level-resources/)

Current status: in-place Pod vertical scaling is stable in v1.35. Pod-level
CPU and memory resources are beta and enabled by default as of v1.34.

Video candidates:

- [Demystifying Kubernetes Resource Management](https://www.youtube.com/watch?v=T-LF_0uwFIg)
- [Pods' Requests and Limits in 12 Minutes](https://www.youtube.com/watch?v=lKH1K5R3kqg)

## 25. Service exposure, EndpointSlice conditions, and locality

**Track:** CKA core with advanced networking depth

Add precise Service-type layering, source-address consequences,
`internalTrafficPolicy`, `externalTrafficPolicy`, EndpointSlice `ready`,
`serving`, and `terminating` conditions, dual-stack representation, and
strict locality versus preferred traffic distribution.

Interview outcomes:

- Trace ClusterIP, NodePort, and LoadBalancer allocation and forwarding layers.
- Explain source preservation and failure under `externalTrafficPolicy: Local`.
- Diagnose rollout traffic from EndpointSlice termination conditions.
- Reason about locality preferences, overload, and dual-stack slices.

Primary references:

- [Services](https://kubernetes.io/docs/concepts/services-networking/service/)
- [EndpointSlices](https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/)
- [Virtual IPs and Service proxies](https://kubernetes.io/docs/reference/networking/virtual-ips/)
- [Topology Aware Routing](https://kubernetes.io/docs/concepts/services-networking/topology-aware-routing/)
- [IPv4/IPv6 dual-stack](https://kubernetes.io/docs/concepts/services-networking/dual-stack/)

Current status: EndpointSlice is stable and the legacy Endpoints API is
deprecated since v1.33. IPVS kube-proxy mode is deprecated in v1.35;
nftables mode is stable since v1.33. Topology Aware Routing remains beta.

Video candidates:

- [Improving Network Efficiency with Topology Aware Routing](https://www.youtube.com/watch?v=rU56yr7txPM)
- [Topology Aware Routing: Understanding the Tradeoffs](https://www.youtube.com/watch?v=taR63hFeuAQ)

## 26. Native sidecars, Jobs, and restart semantics

**Track:** advanced workload enrichment

Expand Job semantics into native sidecars, indexed completion, per-index
backoff, `podFailurePolicy`, success policy, active deadlines, and the separate
owners of container restart, Pod replacement, and Job failure.

Primary references:

- [Native sidecar containers](https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/)
- [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/)
- [Init containers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
- [Pod lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
- [Container lifecycle hooks](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/)

Current status: native sidecars are stable since v1.33; Job
`podFailurePolicy` is stable since v1.31; individual container restart rules
are beta in v1.35.

Video candidates:

- [Sidecar Containers in Kubernetes: Past, Present, and Future](https://www.youtube.com/watch?v=Fhfr5PyvnUo)
- [Sidecar Containers Are Built-in to Kubernetes](https://www.youtube.com/watch?v=_a8fxJDzCJU)
- [Kubernetes Jobs and the Sidecar Problem](https://www.youtube.com/watch?v=A_E2UdCsu4I)

## 27. Pod execution security and runtime isolation

**Track:** advanced security enrichment

Connect Pod Security Admission, `securityContext`, RuntimeClass, seccomp,
capabilities, IDs, filesystem ownership, and user namespaces to the OCI runtime
configuration that enforces them.

Primary references:

- [Pod Security Admission](https://kubernetes.io/docs/concepts/security/pod-security-admission/)
- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- [Security contexts](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)
- [RuntimeClass](https://kubernetes.io/docs/concepts/containers/runtime-class/)
- [User namespaces](https://kubernetes.io/docs/concepts/workloads/pods/user-namespaces/)

Current status: Pod Security Admission is stable since v1.25 and RuntimeClass
since v1.20. Pod user namespaces remain beta in v1.35 and require compatible
kernel, filesystem, CRI, and OCI runtime support.

Video candidates:

- [The Hitchhiker's Guide to Pod Security](https://www.youtube.com/watch?v=gcz5VsvOYmI)
- [Run As Root, Not Root: User Namespaces in Kubernetes](https://www.youtube.com/watch?v=uRp0YltujVE)
- [Isolate the Users! Supporting User Namespaces in Kubernetes](https://www.youtube.com/watch?v=Rx-ksmLUHEY)

## Supporting administration topics

The research also surfaced two useful cross-cutting references that should be
folded into Modules 21-23 rather than becoming standalone modules:

- [Encrypting confidential data at rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)
- [Kubernetes auditing](https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/)
