# Module topics — the source list for docs-derived material

Work through YOUR RANGE topic by topic. For each topic: find the
authoritative kubernetes.io page that governs it, and derive questions and
cards from that page. The topic decides the page. Do not browse the docs
and see what turns up.

Beats named `locate` and `close` are the spine bookends, not topics, and are
omitted here.

## u1 — Who Owns What  (desired object)
  - Five actors
  - One contract
  - What etcd holds
  - Controllers, plural
  - One decision
  - The node's agent
  - Four loops, one Deployment
  - What an outage costs
  - Serving is not healthy

## u2 — Five Gates  (admission / storage)
  - Who, then may they
  - Mutate, then validate
  - Your Service, on the hot path
  - Fail closed or fail open
  - Before you write one
  - RBAC allows it, it still fails
  - Two writers, one object
  - Who owns this field

## u3 — Events Are Hints  (watch / cache)
  - Observe, compare, act
  - Nobody polls
  - A key, not the object
  - Level, not edge
  - When the watch breaks
  - The loop that eats itself
  - Reconciling things outside the cluster
  - Why resync exists
  - What the queue gives you
  - Where you look when it stalls

## u4 — Four Different Promises  (controller queue)
  - Pick by invariant
  - What a StatefulSet does not do
  - Coverage versus completion
  - Two autoscalers, one number
  - Removing the shared signal
  - What a budget actually buys
  - Three ways a Pod dies
  - How a rollout actually moves
  - Readiness is the throttle
  - Completions and parallelism

## u5 — An API You Cannot Take Back  (controller queue)
  - Four words people blur
  - A CRD on its own does nothing
  - Intent and observation
  - What you signed up for
  - Served, and stored
  - The order that works
  - Deletion that waits
  - Before you strip it
  - The schema is the API
  - Validation at the API, not the controller
  - When not to write one

## u6 — Choose, Then Commit  (scheduler queue + binding)
  - Two cycles, not one
  - Eliminate, then rank
  - The output is a name
  - Holding the claim
  - Requests are the currency
  - Wrong in both directions
  - Why is it still Pending
  - A hint, not a reservation
  - Queue order without displacement

## u7 — Running Is Not Ready  (kubelet)
  - A loop, not an inbox
  - The order on the node
  - What the sandbox is for
  - Four contracts, not one runtime
  - The kubelet never calls runc
  - Phase is not health
  - Three probes, three jobs
  - Running, receiving nothing
  - Deletion is not a transaction
  - The API repeats what it was told

## u8 — A Permission Is Not A Path  (CNI)
  - Three owners, not one network
  - Labels select, readiness conditions
  - When the Service steps out
  - A permission is not a path
  - Implementations, not APIs
  - Past the O(1) slogan
  - The requirement does not go away
  - A program, not a service
  - The kubelet does not call it
  - Where the address comes from
  - It resolves, nothing answers

## u9 — Not The Name You Typed  (DNS)
  - The query that actually leaves
  - What expansion costs
  - One character
  - A cache on every node
  - One name, end to end
  - The endpoint is itself a Service
  - Corefile order is not execution order
  - Answers from a watch
  - Fallthrough is not forwarding
  - What Ready has not proven

## u10 — Two Halves, One Volume  (CSI)
  - Claim, class, volume
  - Pending on purpose
  - Four reasons, four checks
  - The split people merge
  - Only one half is privileged
  - Claim to container, in order
  - Stage once, publish per Pod
  - Storage is not a later phase
  - Scheduled, and stuck mounting

## u11 — A Backup You Have Restored  (admission / storage)
  - Two different availability models
  - Majority, exactly
  - The fourth member buys nothing
  - Hot standbys, not members
  - When the majority is gone
  - A backup is a hypothesis
  - What the snapshot does not hold
  - The deceptive minutes
  - The supported way
  - Proving it works

## u12 — Which Signal Proves What  (desired object)
  - Concurrency has to be allocated
  - Classify here, serve there
  - Blast radius, not fairness
  - Contained is not fixed
  - Why informers exist at all
  - No single source is truth
  - The object is the contract
  - Who deleted it
  - Which layer is slow
  - The spine is the method
  - The ninety-second answer

## u13 — kubeadm Writes Files, Then Leaves  (desired object)
  - It composes, it does not manage
  - Where the handoff happens
  - The container is gone after a reboot
  - Separate contracts, separate steps
  - Drain protects, it does not upgrade
  - The conservative order
  - Neither one reconciles
  - Safe, not merely successful

## u14 — An Update Is Not A Reload  (kubelet)
  - Delivery has semantics
  - What actually triggers a rollout
  - What a Secret gives you
  - Still using the old credential
  - QoS is derived, not set
  - Kubelet eviction, kernel OOM
  - Why the slogan is incomplete

## u15 — Objects Describe, Controllers Forward  (service)
  - The object is not the proxy
  - Valid, and serving nothing
  - Who owns which object
  - Every programmable boundary
  - Policy permits, it does not route
  - Diagnosing in order
  - Accepted, and doing nothing

## u16 — Feasible Is Not Local  (kubelet)
  - Aggregate capacity is not locality
  - Three managers, one protocol
  - Who gets exclusive CPUs
  - Scheduled, then refused
  - A limit is not isolation
  - Latency without high usage
  - What the strictest policy promises
  - A Guaranteed Pod that still jitters

## u17 — From Scalar Counts To Claims  (scheduler queue + binding)
  - A count, or a description
  - Policy, and intent
  - The order of the handshake
  - The architectural discriminator
  - A pending device Pod has three owners
  - Template, or a named claim
  - Which cause is it
  - What deletion actually does

## u18 — Not Every API Is Stored Here  (desired object)
  - Claiming a path
  - When it earns its cost
  - What a watch owes you
  - What registering costs you
  - Policy without a network call
  - Safer, not free
  - Ask, without becoming them

## u19 — Four Gates, Four Transitions  (controller queue)
  - Leadership is a conditional write
  - The same API, two jobs
  - Two candidates, one winner
  - What it cannot promise
  - Each gate blocks its own transition
  - And what a budget is not
  - Why gating reduces load
  - Pending, reason SchedulingGated

## u20 — Start At The Nearest Authority  (desired object)
  - Start where something still answers
  - Descending in order
  - What separates a NotReady node
  - Ninety seconds on a NotReady node
  - Phase names the state, events name the attempt
  - The log you actually need
  - It resolves, it still fails
  - The algorithm underneath

## u21 — Scope Is Part Of The Permission  (admission / storage)
  - Scope is half the grant
  - The union, not the worst case
  - What actually escalates
  - A node is an authenticated principal
  - Two constraints, not one
  - Joined, and still NotReady

## u22 — The Metrics API Is Not Monitoring  (kubelet)
  - One narrow pipeline
  - When top fails
  - Three kinds of metric
  - Preserve the perishable first
  - No shell in the image
  - When crictl earns its place

## u23 — Render First, Then Reconcile  (desired object)
  - Two state machines
  - What a green release proves
  - Review what the API will see
  - A rollout is arithmetic
  - The deadline reports, it does not act
  - A conflict names an owner
  - The minimum discriminating evidence

## u24 — Rejected, Not Pending  (admission / storage)
  - One object, or the whole namespace
  - Forbidden is not Pending
  - What quota can actually count
  - How a default breaks a quota
  - Accepted is not applied
  - QoS does not move
  - Proving it took effect

## u25 — Membership Is Not Eligibility  (service)
  - Each type adds a layer
  - Local is not a hint
  - An address is not reachability
  - Ready, serving, terminating
  - A requirement, or a preference
  - The shortest diagnosis

## u26 — Ask Which Object Restarted  (kubelet)
  - Three owners, three objects
  - UID and restart count
  - OOMKilled, and still the same Pod
  - Why a Job with a sidecar can finish
  - Independent knobs
  - Why a global limit is awkward

## u27 — Admission Checks The Spec  (admission / storage)
  - Three modes, one blocks
  - It evaluates the spec
  - Passing Restricted is not a claim
  - What actually reduces privilege
  - A selector, not an implementation
  - Remapping the identity
  - Choosing between them
