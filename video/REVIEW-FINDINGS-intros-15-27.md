# Review findings: module openings and closings (u15–u27)

Scope: first beat (`locate`) and last beat (`close`) only.
Baseline: Kubernetes v1.36. Standalone rule from REVIEW-intros-all.md.

---

## Accuracy

[u15] open · imprecise
  problem: The hook says a "route object says Accepted". Gateway API Routes report parent `Accepted` conditions. Core Ingress has no Accepted condition — only `status.loadBalancer` and controller-specific annotations. The structure sentence promises both Ingress and Gateway API, so the hook teaches a condition Ingress does not have.
  fix:     Your route is stored, and nothing is being served. On Gateway API that often shows as Accepted with no working listener. On Ingress the object can exist with the same inert result. This is the Service segment of the request path, seen from outside the cluster. It covers what Ingress and the Gateway API actually describe, which is less than most people assume, and who owns each part of a route. By the end you can tell a configuration problem from a data-plane one.

[u15] close · imprecise
  problem: "status on the object usually tells you which" and "Read the status on the route object first" fit route attachment. Two beats in this module are NetworkPolicy, where API storage and even a present object prove nothing about enforcement. The close overgeneralises route status as the edge diagnostic for the whole unit.
  fix:     The edge, then. A failure here has a signature. A route object exists and nothing serves it, or something serves it and the backend was never ready. For routes, status usually separates those owners — Accepted and served are different claims. For NetworkPolicy, storage is not enforcement. Name the layer before you trust the object.

[u17] open · misleading
  problem: "Asking for a GPU is not asking for CPU under a different name" is false for the device-plugin path the module itself teaches next. Extended resources are exactly a count a node advertises, like a custom resource name. The useful distinction is scalar advertisement versus a ResourceClaim object, not "GPU versus CPU".
  fix:     Asking for a GPU can mean two different things. One is a number a node advertises. The other is an object the scheduler allocates. This is the scheduler segment of the request path, for workloads that need hardware. It covers classes and claims, the allocation handshake, and the three owners a device-backed Pod depends on. By the end you can find where such a Pod is stuck.

[u17] close · imprecise
  problem: "The Pod is Pending and no node is at fault" is too broad. Missing inventory, topology, or a device only some nodes can reach is still a node-side capacity story. The teaching point is "do not stop at CPU and memory on the nodes", not "nodes are innocent".
  fix:     Devices, then. A failure here has a signature. The Pod is Pending and ordinary node fit looks fine, or it is bound and the device was never prepared. Three objects hold those answers between them. A device-backed Pod has three owners. Read the status on each object before you blame the scheduler.

[u20] close · wrong
  problem: "Twenty units" freezes a course size into the narration. The set already has twenty-seven modules, so the number is false for sequential viewers and will keep rotting as modules are added. It also violates the standalone rule: a viewer of this video alone should not be told how many units exist.
  fix:     One method. If you can state the transition you expected, and name the component that owns it, you already have your next question. That is the whole difference between recalling Kubernetes commands and understanding the system underneath them.

[u22] close · misleading
  problem: "You cannot see what happened, because the thing that knew has already restarted" overclaims. The module teaches the opposite first move: previous container logs, `lastState`, events, and termination reasons often still exist after a restart. Evidence is perishable, not already gone the moment a container restarts.
  fix:     Evidence, then. A failure here has a signature. The container restarted and the useful proof is about to disappear. Read previous logs, lastState and events before you restart anything again. Gather the evidence before you destroy the thing holding it.

[u23] close · imprecise
  problem: "an update was silently overwritten by whoever owns the field" fights the field-ownership beat. Server-Side Apply conflicts surface the other manager; overwrite after force, or a controller reconciling back, is not generally silent on the write that lost.
  fix:     Delivery, then. A failure here has a signature. The tool says it worked and the cluster disagrees, or a field you set is owned by someone else and comes back wrong. Both are visible in the objects themselves. A successful release and a healthy workload are separate claims. Check both.

[u24] open · imprecise
  problem: "It leaves you nothing at all" is true for a direct create that admission rejects. It is false for the common controller path: a Deployment, ReplicaSet or Job object is stored, Pod creates return Forbidden, and FailedCreate events remain. Candidates who only look for "no objects" will miss the parent and the events.
  fix:     A quota failure does not leave you a Pending Pod. A direct create is refused and stores nothing. A controller may still exist with FailedCreate events and no child Pods. This covers the admission gate at namespace scope. It covers what LimitRange and ResourceQuota each do, why the rejection happens before scheduling starts, and how a live resize is applied. By the end you can read an absent Pod correctly, and prove a resize reached the container.

[u24] close · imprecise
  problem: "the node quietly did not do what you asked" undersells in-place resize evidence. Deferred and infeasible outcomes are reported on Pod status; the failure mode is accepted-desired versus applied, not a silent node.
  fix:     Namespace governance, then. A failure here has a signature. The object was never created at all, or it exists and the resize never reached the cgroup. Neither looks like a scheduling problem. A rejection leaves no Pod behind. When a Pod is absent rather than Pending, look at admission. When resources changed in the spec, prove they were applied.

[u25] close · wrong
  problem: "Both are read from the EndpointSlice rather than the Service" is false for the load-balancer address signature. The external address lives on Service status. EndpointSlices answer membership and readiness. The close then says "Read the EndpointSlice conditions, not the Service", which teaches candidates to skip the object that proves provisioning.
  fix:     Exposure, then. A failure here has a signature. Everything is present and nothing is eligible, or the address exists and the backends never became ready. Read Service status for the address. Read EndpointSlice conditions for eligibility. Selected is not eligible.

[u27] close · wrong
  problem: "Twenty-seven units" is the same course-size coupling the rewrite was meant to kill. Adding a twenty-eighth module forces an edit here. A standalone viewer does not need a census of the catalogue.
  fix:     Name the transition you expected, name the component that owns it, and read the evidence at that boundary. That is what separates knowing Kubernetes commands from understanding the system underneath them. Admission checks the spec you submitted. If you need a runtime boundary, choose one deliberately.

---

## Writing

[u15] open · style
  problem: Structure names Ingress, Gateway API and route ownership, then stops. Two full beats are NetworkPolicy (permission is not a path; accepted yet inert). A viewer is not told that half is coming, so the opening under-describes the module.
  fix:     Your route is stored, and nothing is being served. This is the Service segment of the request path, seen from outside the cluster. It covers what Ingress and the Gateway API actually describe, who owns each part of a route, and why a NetworkPolicy can exist without enforcing anything. By the end you can tell a configuration problem from a data-plane one.

[u20] open · style
  problem: The hook and promise are strong, but the structure never lands a portable diagnostic question the way the close does. "Which log survives a restart" is one detail among three, and the nearest-authority rule — the actual method — is unnamed in the open.
  fix:     kubectl cannot diagnose the API server that makes kubectl work. This is the method for using every segment of the request path. It covers starting at the nearest authority that still answers, descending when the API cannot, and preserving evidence before you restart. By the end you have a procedure that still works when your usual tools do not.

[u22] close · style
  problem: "Proof is the first casualty" is flourish. It does not name the action. Spoken technical close should end on the rule, not a metaphor.
  fix:     Evidence, then. A failure here has a signature. The container restarted and the useful proof is about to disappear. Read previous logs, lastState and events before you restart anything again. Gather the evidence before you destroy the thing holding it.

[u25] open · style
  problem: "one layer deeper" only makes sense if the viewer already watched the prior Service-segment module. Standalone viewers get a comparative phrase with no referent. Name the layer in absolute terms.
  fix:     A load balancer has an address. That proves almost nothing about whether anything answers. This is the Service segment of the request path, at the Service and EndpointSlice layer. It covers how Service types stack, what an EndpointSlice condition really encodes, and why traffic policy can strand a request on the wrong node. By the end you can read endpoint state to find backends that were selected but never became eligible.

[u27] open · style
  problem: Structure says "the three modes" without naming enforce, audit and warn, and "a real isolation boundary" without naming RuntimeClass or user namespaces. The beats are specific; the open stays abstract where two short names would earn the watch.
  fix:     Pod Security Admission passed. That is not a security claim. This covers the admission gate and the boundary underneath it. Admission evaluates the spec you submitted and nothing at runtime. It covers enforce, audit and warn, and how RuntimeClass and user namespaces differ as real isolation. By the end you can say what your current boundary does and does not contain.

---

## Leave alone

Clear hook, structure and promise with no accuracy issue worth a rewrite: u16 open/close, u18 open/close, u19 open/close, u21 open/close, u23 open, u26 open/close. u16 already separates Pod-visible topology refusal from node-local latency evidence. u19 correctly separates four gate mechanisms from PDB. u21 correctly splits authorization refusal from node identity failure.

---

ACCURACY: 11 findings
WRITING: 5 findings
