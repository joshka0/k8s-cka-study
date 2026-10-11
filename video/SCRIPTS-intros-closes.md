# Module openings and closings

All 27 rewritten to stand alone. No reference to a pilot video, to "the
series", to a module number, to a course size, or to any other module. Spine
segments are named, never numbered: the spine is a fixed 14-segment model of
the request path and does not move when modules are added.

Each opening gives a hook, the structure, and a promise. Each closing lands a
portable takeaway instead of pointing at the next module.

Reviewed by codex (u01-u14) and grok (u15-u27): 19 accuracy and 9 writing
findings, applied. Verified: 0 coupling references, 0 sentences over 25 words.

---

## 01 · Who Owns What
*u01-control-plane — desired object segment · longest sentence 20w*

**OPEN**

Your control plane is down, and traffic is still flowing. Both are true at
once, and neither tells you what to fix. This is the front of the request
path, where a write is accepted, stored and noticed. It covers the five
components that do the work, the one contract they speak through, and the
store underneath them. By the end you can name which component owns a failure,
and say exactly what an outage stops.

**CLOSE**

The desired object segment, then. Start with the API response. A rejected
write returns an error. A successful read-back proves the object exists.
Downstream failures may leave Events, status conditions or only component
logs. Do not require an Event before you inspect the next owner. Whatever is
broken, ask which of these five owns it. That question is the map.

---

## 02 · Five Gates
*u02-api-path — admission / storage segment · longest sentence 23w*

**OPEN**

One webhook, installed by one team, can stall every deployment in a cluster.
Nothing looks broken. This is the admission and storage segment of the request
path. It covers the gates a write passes before it is stored. Who you are,
what you may do, what may change the object, and what may reject it. By the
end you can trace a rejected request to the gate that rejected it, and say
what a conflict is telling you.

**CLOSE**

The admission and storage segment, then. A failure here has a signature: your
write is refused, or accepted and then quietly altered. Both outcomes appear
in the API response. An accepted workload object can still lead to Pods after
a controller acts. If you got an object back and nothing happened afterwards,
this segment did its job. The failure is downstream, in whatever was supposed
to notice the object. When a write is refused, name the gate that refused it.
Each gate has a different owner and a different fix.

---

## 03 · Events Are Hints
*u03-reconciliation — watch / cache segment · longest sentence 22w*

**OPEN**

A controller missed your change, and nothing in the logs says so. This is the
watch and cache segment of the request path. It covers how controllers notice
work, and the shared cache they usually read instead of the API server. It
covers why level-based reconciliation recovers when current state is observed
again. It also covers how one badly written controller degrades a whole
cluster. By the end you can explain why reconciliation is safe to repeat, and
recognise a loop that is eating the API server.

**CLOSE**

The watch and cache segment, then. A failure here has a distinctive shape.
Your object exists and is correct, but nothing downstream ever happens. Or
something happens endlessly. Check whether the controller is running, whether
its queue is draining, and whether it is writing on every pass. When a
controller looks stuck, ask what it watched and what it enqueued. The answer
is rarely in the object it failed to write.

---

## 04 · Four Different Promises
*u04-workloads — controller queue segment · longest sentence 21w*

**OPEN**

You reached for a Deployment, because that is what you always reach for. The
other workload controllers make different promises, and one of them is
probably the one you needed. This covers what each controller actually
guarantees. It covers what happens when two autoscalers fight over the same
Pods, and what a PodDisruptionBudget does not protect you from. By the end you
can pick a controller from the invariant your workload needs.

**CLOSE**

Controllers create the objects. What they cannot do is choose a node. Pick the
controller from the invariant, not from habit. Name what must stay true, and
the choice makes itself.

---

## 05 · An API You Cannot Take Back
*u05-crds — controller queue segment · longest sentence 17w*

**OPEN**

A CustomResourceDefinition is the easiest way to publish an API that other
people will depend on. That is exactly the problem. This covers what a CRD
gives you on its own, and what a controller has to add. It covers how
versioning, storage migration and finalizers behave once somebody relies on
you. By the end you can ship a custom API you are still able to change later.

**CLOSE**

Your objects now travel the same spine as everything else. They pass the same
gates, sit in the same store. Any reconciliation behaviour depends on a
controller that watches their kind. Before you publish a kind, decide how you
will change it later. That decision costs far less now than after adoption.

---

## 06 · Choose, Then Commit
*u06-scheduling — scheduler queue + binding segment · longest sentence 21w*

**OPEN**

A Pod stays Pending while every node shows free CPU. The scheduler compares
declared requests against allocatable capacity, and current usage never enters
that check. Resources are only one constraint. This is the scheduler queue and
binding segment of the request path. It covers how a node is filtered and
scored, the single value binding writes, and what preemption can and cannot
fix. By the end you can read a Pending Pod's events and name the constraint
that stopped it.

**CLOSE**

When a Pod stays Pending, first ask whether it has a node name. If it has
none, no kubelet has been asked to run the Pod yet. Read its scheduling events
before you inspect the nodes. Then test each reported reason against
readiness, schedulability, taints, labels, allocatable resources, topology,
storage, and scheduling gates. Preemption helps only if evicting lower-
priority Pods would make a node feasible, and the Pod's own policy allows it.
A node name marks the handoff. After it is written, the node's kubelet owns
what happens next.

---

## 07 · Running Is Not Ready
*u07-kubelet — kubelet segment · longest sentence 23w*

**OPEN**

A Pod says Running, and it is serving nothing. This is the kubelet segment of
the request path: what happens on the node once a node name is written. It
covers the order a Pod is built in, the four contracts the kubelet speaks
across, and what its three probes each gate. By the end you can tell a
container that is alive from one that is ready, and know which log holds the
answer.

**CLOSE**

The kubelet segment, then. A failure here often means the Pod is bound and
node-side setup did not finish. Binding does not prove the kubelet admitted
it. The API stores conditions, events and the last reported status, and the
node's own logs show the current failure. Running is a phase, not a promise.
Ask what the probes gate, and which boundary reported the failure.

---

## 08 · A Permission Is Not A Path
*u08-networking — CNI segment · longest sentence 17w*

**OPEN**

DNS resolves, the ClusterIP times out, and nothing in the workload is wrong.
This is the CNI segment of the request path. It covers how a Pod gets a
network, and how a Service address becomes a real backend. It covers why a
NetworkPolicy grants permission rather than a route. By the end you can split
a connectivity failure into the layer that owns it.

**CLOSE**

The CNI segment, then. Ask which path failed. Did the sandbox get an address.
Can peers reach that address. Does the Service address reach a ready endpoint.
Each answer points at a different owner, and separating them is the whole
value. Separate reachability, permission and translation. Each has a different
owner and a different log.

---

## 09 · Not The Name You Typed
*u09-dns — DNS segment · longest sentence 23w*

**OPEN**

You queried one name. The resolver sent five, and four of them failed first.
This is the DNS segment of the request path. It covers the resolver policy
inside the Pod, the plugin chain inside CoreDNS, and the caches between them.
By the end you can explain why a name resolves slowly, resolves wrongly, or
resolves to something stale, and check each layer separately.

**CLOSE**

The DNS segment, then. Check the Pod's resolv.conf first. Then dig against the
kube-dns Service, and against a CoreDNS Pod address. Read the coredns
ConfigMap and the CoreDNS logs. Those four checks separate client policy,
Service routing, configuration, and a stale watch. When a name misbehaves,
test the layers separately: resolver policy, Service routing, CoreDNS itself,
then the caches.

---

## 10 · Two Halves, One Volume
*u10-storage — CSI segment · longest sentence 18w*

**OPEN**

A Pod is scheduled and stuck, and the events point at four different
components. This is the CSI segment of the request path. It covers the three
objects that describe storage, and the two halves of a driver that deliver it.
It covers the handshake that decides where a Pod can run. By the end you can
say which half of the driver failed, and where its evidence lives.

**CLOSE**

The CSI segment, then. A storage failure can block scheduling before a Pod has
a node, or block setup after binding. First check whether the claim is bound
and whether the Pod has a node name. Then decide whether the failed step is an
object update, an RPC, or a mount. Read the events and the log that owns that
step.

---

## 11 · A Backup You Have Restored
*u11-etcd-ha — admission / storage segment · longest sentence 21w*

**OPEN**

You have a backup. You have never restored it. Until you do, you have a file,
not a recovery plan. This goes underneath the storage segment of the request
path, into etcd itself. It covers quorum arithmetic, and why adding one member
to make an odd cluster even adds no fault tolerance. It covers what a snapshot
does not contain. By the end you can size a cluster for the failures you
intend to survive, and prove a restore actually works.

**CLOSE**

Underneath the storage segment, then. Without quorum, etcd cannot commit new
writes. It does not make acknowledged writes silently disappear. Check member
health, endpoint status and quorum before you trust a green front end. A
backup you have not restored is only a hypothesis. Restore one deliberately,
before you need it.

---

## 12 · Which Signal Proves What
*u12-scale-evidence — desired object segment · longest sentence 25w*

**OPEN**

The cluster is slow and every dashboard is green. This covers what protects
the API server when too many requests arrive at once, and which piece of
evidence proves which layer is at fault. It covers Priority and Fairness, the
load your own controllers create, and the difference between status, events
and audit. By the end you can isolate a layer instead of guessing at one.

**CLOSE**

One spine, whatever you are looking at. If you can name the segment a symptom
belongs to, you already have the next question. That is the difference between
knowing Kubernetes commands and understanding the system underneath them, and
it is what an interviewer is actually listening for.

---

## 13 · kubeadm Writes Files, Then Leaves
*u13-bootstrap — desired object segment · longest sentence 21w*

**OPEN**

A control-plane container is missing after a reboot. If its static Pod
manifest is gone, the kubelet has no desired state to recreate it from. This
covers what kubeadm actually builds before it hands over and leaves. It covers
the static Pod files on disk, the separately versioned boundaries between
components, and what a safe upgrade needs. By the end you can recover a
control plane that no API is available to tell you about.

**CLOSE**

That is the layer underneath every other segment of the request path. A
failure here has a signature. The cluster does not answer at all, a node never
joins, or an upgrade leaves two components disagreeing about a version. None
of it appears in an application log. When the API cannot tell you anything,
the files on disk still can. Know where kubeadm put them.

---

## 14 · An Update Is Not A Reload
*u14-config-qos — kubelet segment · longest sentence 23w*

**OPEN**

You updated the Secret, and the application is still using the old credential.
Nothing failed. This covers how configuration actually reaches a running
process. It covers why a Deployment does not roll when a referenced ConfigMap
changes, and how quality of service is derived rather than declared. By the
end you can predict whether a config change reaches your container, and tell
an eviction from a kernel kill.

**CLOSE**

The kubelet again, then. A failure here has a signature. Nothing changed when
you expected it to, or something died and you have to separate eviction from
OOM. Evicted and OOMKilled often appear in object status. When they do not,
inspect kubelet and kernel logs while that node evidence is still available.
Do not stop at the Deployment. A change to configuration is not a change to a
running process. Ask what actually reaches the container.

---

## 15 · Objects Describe, Controllers Forward
*u15-ingress-gateway — service segment · longest sentence 18w*

**OPEN**

Your route is stored, and nothing is being served. On Gateway API that often
shows as Accepted with no working listener. On Ingress the object can exist
with the same inert result. This is the Service segment of the request path,
seen from outside the cluster. It covers what Ingress and the Gateway API
actually describe, and who owns each part of a route. It also covers why a
NetworkPolicy can exist without enforcing anything. By the end you can tell a
configuration problem from a data-plane one.

**CLOSE**

The edge, then. A failure here has a signature. A route object exists and
nothing serves it, or something serves it and the backend was never ready. For
routes, status usually separates those owners. Accepted and served are
different claims. For NetworkPolicy, storage is not enforcement. Name the
layer before you trust the object.

---

## 16 · Feasible Is Not Local
*u16-numa — kubelet segment · longest sentence 21w*

**OPEN**

The scheduler decided this node fits. The node refused the Pod anyway. This is
the kubelet segment of the request path, down at the hardware. It covers the
topology hints the node managers exchange, what exclusive CPUs require, and
why a CPU limit is not isolation. By the end you can explain where latency and
jitter actually come from, and which policy would have prevented that refusal.

**CLOSE**

The node, at the hardware. A failure here has a signature. The Pod was placed
and then refused — that refusal is on the Pod object. Or it runs and misses
its latency target while every average looks fine — that one lives on the
node. Know which evidence lives where. Feasible for the cluster is not
feasible for the node. When a node refuses, ask what it was trying to align.

---

## 17 · From Scalar Counts To Claims
*u17-devices-dra — scheduler queue + binding segment · longest sentence 20w*

**OPEN**

Asking for a GPU can mean two different things. One is a number a node
advertises. The other is an object the scheduler allocates. This is the
scheduler segment of the request path, for workloads that need hardware. It
covers classes and claims, the allocation handshake, and the three owners a
device-backed Pod depends on. By the end you can find where such a Pod is
stuck.

**CLOSE**

Devices, then. A failure here has a signature. The Pod is Pending and ordinary
node fit looks fine, or it is bound and the device was never prepared. Three
objects hold those answers between them. A device-backed Pod has three owners.
Read the status on each object before you blame the scheduler.

---

## 18 · Not Every API Is Stored Here
*u18-api-machinery — desired object segment · longest sentence 24w*

**OPEN**

Some of the APIs you query are not stored by the API server you are talking
to. This covers the machinery layered onto the front of the request path. It
covers the aggregation layer, and when it is worth its cost. It covers what a
watch owes you before its history expires, and how to evaluate policy without
a network call. By the end you can tell a CRD problem from an aggregated-API
problem, and read a 410 correctly.

**CLOSE**

The API layer, then. A failure here has a signature. A whole API group stops
answering while the rest of the cluster is fine, or a watch client quietly
rebuilds because its history expired. Neither looks like an application
problem. Not every API behaves like a CRD. Ask what serves it before you try
to debug it.

---

## 19 · Four Gates, Four Transitions
*u19-coordination — controller queue segment · longest sentence 23w*

**OPEN**

Kubernetes has four mechanisms for holding a transition back. They look
interchangeable, and they are not. This covers leader election as optimistic
concurrency, and what scheduling gates, readiness gates, finalizers and Leases
each actually block. By the end you can look at a stuck object and name the
gate holding it, instead of deleting things until it moves.

**CLOSE**

Deliberate delay, then. A failure here has a signature. Something is waiting
and the thing that should release it is gone, or never existed. That is the
same shape as an orphaned finalizer, in a different place. When something has
not happened yet, ask what is holding it. Four mechanisms, four different
answers.

---

## 20 · Start At The Nearest Authority
*u20-troubleshooting — desired object segment · longest sentence 23w*

**OPEN**

kubectl cannot diagnose the API server that makes kubectl work. This is the
method for using every segment of the request path. It covers where to start
when something is broken, how to descend when the API cannot answer, and which
log survives a restart. By the end you have a procedure that still works when
your usual tools do not.

**CLOSE**

One method. If you can state the transition you expected, and name the
component that owns it, you already have your next question. That is the whole
difference between recalling Kubernetes commands and understanding the system
underneath them.

---

## 21 · Scope Is Part Of The Permission
*u21-identity-rbac — admission / storage segment · longest sentence 21w*

**OPEN**

No Role in the namespace looks privileged. That is not proof of least
privilege. This covers the authorization gate and the identity behind it. It
covers why scope is part of a permission, and why rules only ever add. It
covers the paths by which a subject reaches more than you granted. It also
covers how a node earns an identity the API trusts. By the end you can audit a
permission graph rather than a single Role.

**CLOSE**

Identity, then. A failure here has a signature. A request is refused and no
rule ever granted it, or a node cannot authenticate and speak for itself at
all. One is authorization. The other is identity. Neither is answered in the
workload. Audit the graph, not the Role. Scope, aggregation and impersonation
all reach further than one rule suggests.

---

## 22 · The Metrics API Is Not Monitoring
*u22-metrics-debug — kubelet segment · longest sentence 23w*

**OPEN**

kubectl top failed, and your monitoring is fine. Those two facts are
unrelated. This covers the evidence a node produces. It covers what the
metrics pipeline actually carries, which is narrower than most people assume.
It covers how to investigate a crash loop without destroying the proof. By the
end you can gather evidence from a container that has already restarted, and
from an image with no shell in it.

**CLOSE**

Evidence, then. A failure here has a signature. The container restarted and
the useful proof is about to disappear. Read previous logs, lastState and
events before you restart anything again. Gather the evidence before you
destroy the thing holding it.

---

## 23 · Render First, Then Reconcile
*u23-declarative-delivery — desired object segment · longest sentence 23w*

**OPEN**

The release succeeded and the workload is unhealthy. Both statements are
accurate. This covers the boundary between the tools that produce objects and
the controllers that converge them. It covers what a successful Helm release
proves, how rollout arithmetic works, and who owns each field. By the end you
can tell a delivery failure from a convergence failure.

**CLOSE**

Delivery, then. A failure here has a signature. The tool says it worked and
the cluster disagrees, or a field you set is owned by someone else and comes
back wrong. Both are visible in the objects themselves. A successful release
and a healthy workload are separate claims. Check both.

---

## 24 · Rejected, Not Pending
*u24-namespace-governance — admission / storage segment · longest sentence 22w*

**OPEN**

A quota failure does not leave you a Pending Pod. A direct create is refused
and stores nothing. A controller may still exist with FailedCreate events and
no child Pods. This covers the admission gate at namespace scope. It covers
what LimitRange and ResourceQuota each do, why the rejection happens before
scheduling starts, and how a live resize is applied. By the end you can read
an absent Pod correctly, and prove a resize reached the container.

**CLOSE**

Namespace governance, then. A failure here has a signature. The object was
never created at all, or it exists and the resize never reached the cgroup.
Neither looks like a scheduling problem. A rejection leaves no Pod behind.
When a Pod is absent rather than Pending, look at admission. When resources
changed in the spec, prove they were applied.

---

## 25 · Membership Is Not Eligibility
*u25-service-exposure — service segment · longest sentence 24w*

**OPEN**

A load balancer has an address. That proves almost nothing about whether
anything answers. This is the Service segment of the request path, one layer
deeper. It covers how Service types stack, what an EndpointSlice condition
really encodes, and why traffic policy can strand a request on the wrong node.
By the end you can read endpoint state to find backends that were selected but
never became eligible.

**CLOSE**

Exposure, then. A failure here has a signature. Everything is present and
nothing is eligible, or the address exists and the backends never became
ready. Read Service status for the address. Read EndpointSlice conditions for
eligibility. Selected is not eligible.

---

## 26 · Ask Which Object Restarted
*u26-restart-ownership — kubelet segment · longest sentence 23w*

**OPEN**

Something restarted. That one word hides three different owners and three
different answers. This covers who restarts what. It covers the kubelet acting
on a restart policy, the controller replacing a whole Pod, and the Job
deciding the work is finished. It also covers native sidecars and per-index
backoff. By the end you can ask which object restarted and get a useful
answer.

**CLOSE**

Restarts, then. A failure here has a signature. Something keeps coming back
and you are looking at the wrong object, or a Job never finishes because
something in it never exits. Both are answered by the Pod's identity. Ask
which object restarted. The kubelet, the controller and the Job each mean
something different by it.

---

## 27 · Admission Checks The Spec
*u27-pod-security — admission / storage segment · longest sentence 18w*

**OPEN**

Pod Security Admission passed. That is not a security claim. This covers the
admission gate and the boundary underneath it. Admission evaluates the spec
you submitted and nothing at runtime. It covers the three modes, and how to
choose a real isolation boundary. By the end you can say what your current
boundary does and does not contain.

**CLOSE**

Name the transition you expected, name the component that owns it, and read
the evidence at that boundary. That is what separates knowing Kubernetes
commands from understanding the system underneath them. Admission checks the
spec you submitted. If you need a runtime boundary, choose one deliberately.

---

