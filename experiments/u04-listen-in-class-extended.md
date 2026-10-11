# Listen-in classroom, extended: Four promises for one payment platform

Extended format of the u04 classroom script. Same facts, same cast, same
scenario — with in-session reinforcement built in:

1. **Term reuse**: when an important term returns after minutes away, a student
 is asked to recall it before the new question uses it. The reminder is
 itself retrieval.
2. **New terms**: behaviour first, then the name, then a student echoes the
 name in their answer, so it lands twice within a minute.
3. **Micro-checkpoints**: each section ends with one student restating the
 section's rule in one line before the class moves on.
4. **Adaptive teacher turns**: story at section openings, fuller where context
 helps, terse in drills.

## Cast

- **Teacher** — asks short, cumulative questions and repairs reasoning without
 turning the exchange into a lecture.
 Voice: the course narrator (`c023b17b38144a60b3984153247d993f`).
- **Maya** — experienced engineer, quick and confident; often reaches the
 operational conclusion before accounting for every Kubernetes boundary.
 Voice: Kaya (`531f90254e3d4810a047a90b9309fdd0`) — warm, unhurried.
- **Leon** — deliberate and precise; more likely to confuse similar object
 names or lose the causal sequence.
 Voice: Wheatley (`ac6474da3a324e0c8edf6d796fe59f4d`) — quick, a little
 anxious; the self-corrections land naturally in it.
- **Listener pause** — a few seconds of silence before a student answers.
 The listener should answer in that gap.

The different student profiles matter. Their mistakes should remain natural,
not theatrical. Neither student is the permanently weak or permanently strong
one.

---

## Script

### Start from the promise

**Teacher:** [warm] We are designing one payment platform. It has a replaceable
API, an ordered ledger, a node-level security agent, and a settlement task.
Four different promises — and the wrong controller for any one of them will
look fine until production. The wrong controller for any promise looks fine until production. Maya, should all four use a Deployment?

**Listener pause: 3 seconds**

**Maya:** Yes. A Deployment is the general controller, and storage can make the
ledger stateful.

**Teacher:** What should choose a workload controller: what the application
stores, or what Kubernetes must keep true?

**Listener pause: 4 seconds**

**Leon:** The invariant Kubernetes must keep true.

**Teacher:** Good. We will choose four controllers from four promises.
Checkpoint, Maya. One line: what selects the controller?

**Listener pause: 3 seconds**

**Maya:** The invariant Kubernetes must keep true — not what the app stores.

### Replaceable API

**Teacher:** Start with the replaceable API Pods. We need controlled rollouts
and a chosen replica count. Replaceable Pods need controlled rollouts and a chosen replica count. Which controller fits?

**Listener pause: 3 seconds**

**Maya:** A Deployment.

**Teacher:** What does it manage beneath itself?

**Listener pause: 2 seconds**

**Leon:** ReplicaSets, which manage replaceable Pods.

**Teacher:** During a rolling update, how many ReplicaSets matter?

**Listener pause: 3 seconds**

**Leon:** The old one and the new one.

**Teacher:** Which two bounds control their combined movement?

**Listener pause: 4 seconds**

**Maya:** How far the rollout may rise above the desired count, called
maxSurge, and how many replicas may be unavailable, called maxUnavailable.

**Teacher:** What decides when a ready Pod counts as available?

**Listener pause: 3 seconds**

**Leon:** It must remain ready for minReadySeconds.

**Teacher:** Before we move on — Leon, one line. What does a Deployment manage,
and what bounds a rolling update?

**Listener pause: 3 seconds**

**Leon:** ReplicaSets of replaceable Pods; maxSurge and maxUnavailable bound
the movement.

### Readiness is the throttle

**Teacher:** Those bounds only help if availability is honest. The new API
version returns ready before it can process payments. The arithmetic only protects you if availability is honest. Maya, will the surge
and unavailable bounds protect the old version?

**Listener pause: 4 seconds**

**Maya:** Yes. Those bounds stop bad Pods from replacing good ones too quickly.

**Teacher:** What signal tells the Deployment controller that an old replica may
be scaled down?

**Listener pause: 3 seconds**

**Leon:** Availability, which depends on readiness and minReadySeconds.

**Teacher:** If readiness lies early, what does the controller believe?

**Listener pause: 4 seconds**

**Maya:** [realizing] That broken new Pods are available. The rollout can replace
working Pods at full speed within its bounds.

**Teacher:** If readiness is too strict instead?

**Listener pause: 3 seconds**

**Leon:** A healthy rollout stalls because new Pods never count as available.

**Teacher:** What does the progress deadline do when that stall lasts too long?

**Listener pause: 3 seconds**

**Leon:** It rolls the Deployment back.

**Teacher:** Does it act, or report?

**Listener pause: 3 seconds**

**Leon:** [realizing] It reports the stall — the Progressing condition goes
false. It does not roll back.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: what readiness does to a
rolling Deployment.

**Listener pause: 3 seconds**

**Maya:** Readiness throttles scale-down — a lie accelerates replacement; a
strict check stalls it.

### Ordered ledger

**Teacher:** Next promise: the ledger members require stable numbered
identities and ordered startup. Identity and order are primitives; replication is the application's job. Which controller provides those primitives?

**Listener pause: 3 seconds**

**Maya:** A StatefulSet.

**Teacher:** Does that make the ledger application safe for replicated state?

**Listener pause: 3 seconds**

**Maya:** Yes. StatefulSet means Kubernetes handles replication and failover.

**Teacher:** Which layer elects a database leader and keeps replicas consistent?

**Listener pause: 4 seconds**

**Leon:** The software inside the Pods, not the StatefulSet.

**Teacher:** What does the StatefulSet provide instead?

**Listener pause: 4 seconds**

**Maya:** Stable ordinal identity and lifecycle ordering. It can also create one
persistent claim per Pod through volumeClaimTemplates.

**Teacher:** Must every StatefulSet use those claims?

**Listener pause: 2 seconds**

**Leon:** No. They are optional.

**Teacher:** A ledger Pod is replaced. What identity stays, and what identity
changes?

**Listener pause: 5 seconds**

**Leon:** The ordinal name stays. The replacement Pod gets a new UID. If a
template claim was retained, the replacement can mount the same claim.

**Teacher:** The default ordered lifecycle policy waits for each ordinal before
starting the next. Kubernetes calls that OrderedReady. Parallel relaxes that
ordering. Maya, what does OrderedReady promise?

**Listener pause: 3 seconds**

**Maya:** Each ordinal becomes ready before the next starts — Parallel drops
that wait.

**Teacher:** Checkpoint, Leon. One line: what a StatefulSet does and does not
own.

**Listener pause: 3 seconds**

**Leon:** Ordinal identity and lifecycle order — not application replication
or failover.

### Node security agent

**Teacher:** The security agent must run on every eligible node, including
nodes added later. One-per-node follows Node objects, not physical reachability alone. Which promise do we need?

**Listener pause: 3 seconds**

**Leon:** A replica count equal to the number of nodes.

**Teacher:** What happens when eligibility changes?

**Listener pause: 4 seconds**

**Maya:** A DaemonSet follows eligible Node objects. It creates a Pod for each
eligible node and removes one when the Node becomes ineligible or is removed.

**Teacher:** The machine becomes unreachable but its Node object remains. Does
the DaemonSet immediately prove the Pod is gone?

**Listener pause: 4 seconds**

**Leon:** Yes. One-per-node means machine reachability is part of its guarantee.

**Teacher:** What does the DaemonSet target: physical machines or Node objects?

**Listener pause: 3 seconds**

**Leon:** [realizing] Eligible Node objects. An unreachable machine can remain
represented while node-lifecycle controllers react.

**Teacher:** Before we move on — Maya, one line. What does a DaemonSet follow?

**Listener pause: 3 seconds**

**Maya:** Eligible Node objects — not physical reachability by itself.

### Settlement completion

**Teacher:** The settlement task must achieve a fixed number of successful
partitions, with several allowed to run together. A success target still allows duplicate starts on the outside. Which controller follows a
success target?

**Listener pause: 3 seconds**

**Maya:** A Job.

**Teacher:** Which field names the required successes?

**Listener pause: 2 seconds**

**Leon:** completions.

**Teacher:** Which field limits how many Pods run at once?

**Listener pause: 2 seconds**

**Maya:** parallelism.

**Teacher:** A Pod starts a payment, crashes before recording success, and the
Job starts a replacement. Can the task assume exactly one start?

**Listener pause: 4 seconds**

**Maya:** Yes. The Job replaces failures, so only a successful attempt counts.

**Teacher:** Did the external payment side effect disappear with the failed Pod?

**Listener pause: 3 seconds**

**Leon:** No. The task must tolerate duplicate starts.

**Teacher:** What can stop retries before the success target is reached?

**Listener pause: 5 seconds**

**Leon:** A retry bound called backoffLimit, a time bound called
activeDeadlineSeconds, or a podFailurePolicy. The Job can become Failed before
all completions succeed.

**Teacher:** Checkpoint, Leon. One line: what a Job promises, and what the task
must tolerate.

**Listener pause: 3 seconds**

**Leon:** Completions toward a success target — and the task must tolerate
duplicate starts.

### Two autoscalers, one denominator

**Teacher:** First, a recall — Maya, remind us. Which controller owns the
replaceable API?

**Listener pause: 2 seconds**

**Maya:** A Deployment.

**Teacher:** Hold that. Return to the API Deployment. An HPA changes replica
count from CPU utilization. A VPA changes CPU requests. Maya, can they operate
independently?

**Listener pause: 4 seconds**

**Maya:** Yes. One scales replicas and the other sizes Pods, so they own
different fields.

**Teacher:** How is CPU utilization calculated?

**Listener pause: 3 seconds**

**Leon:** Actual usage divided by the resource request.

**Teacher:** If the VPA raises the request while usage stays constant, what
happens to reported utilization?

**Listener pause: 4 seconds**

**Leon:** It falls.

**Teacher:** What might the HPA do next?

**Listener pause: 3 seconds**

**Maya:** Scale down. Then load per remaining Pod can rise, and utilization can
rise again. They share the denominator and can form a feedback loop.

**Teacher:** Does every HPA and VPA combination have this conflict?

**Listener pause: 3 seconds**

**Maya:** Yes. Two autoscalers always fight.

**Teacher:** Which combinations avoid the shared variable?

**Listener pause: 5 seconds**

**Leon:** HPA on a raw, custom, or external metric, or a VPA that does not change
the request used by HPA.

**Teacher:** Give a clean ownership design for our API.

**Listener pause: 5 seconds**

**Maya:** Let HPA scale on queue depth or request rate, and let VPA own resource
requests. Or keep VPA recommendation-only while HPA uses utilization.

**Teacher:** Does a less disruptive VPA update mode remove the denominator
conflict?

**Listener pause: 3 seconds**

**Leon:** No. It can limit disruption, but the shared signal remains.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: why HPA and VPA can fight.

**Listener pause: 3 seconds**

**Maya:** They share the utilization denominator — VPA changes the request HPA
divides by.

### Planned drain is one kind of disruption

**Teacher:** First, a recall — Leon, remind us. What signal tells a Deployment
an old replica may scale down?

**Listener pause: 2 seconds**

**Leon:** Availability — readiness held for minReadySeconds.

**Teacher:** Hold that. We now drain a node for maintenance. A
PodDisruptionBudget keeps enough API Pods available. Leon, does it guarantee
availability through a power loss too?

**Listener pause: 3 seconds**

**Leon:** Yes. The budget protects the Pods from any disruption.

**Teacher:** Which request path does a PDB constrain?

**Listener pause: 3 seconds**

**Maya:** Voluntary disruption requested through the Eviction API. A drain uses
that path.

**Teacher:** Name three losses that can bypass it.

**Listener pause: 5 seconds**

**Leon:** Power loss, node-pressure eviction by the kubelet, and direct Pod
deletion.

**Teacher:** How does scheduler preemption differ from kubelet eviction?

**Listener pause: 5 seconds**

**Maya:** Preemption starts with a pending higher-priority Pod and removes
lower-priority Pods to make placement possible. Kubelet eviction starts with
local memory or disk pressure.

**Teacher:** Does the scheduler guarantee that preemption always preserves the
budget?

**Listener pause: 3 seconds**

**Maya:** Yes. PDB is a hard gate for every eviction.

**Teacher:** What weaker promise applies to preemption?

**Listener pause: 3 seconds**

**Leon:** The scheduler tries to respect PDBs as a best effort. API eviction for
planned maintenance is the path the budget directly constrains.

**Teacher:** Checkpoint, Maya. One line: what a PDB constrains, and what it
does not.

**Listener pause: 3 seconds**

**Maya:** Voluntary Eviction API requests such as drain — not power loss,
pressure eviction, or direct delete.

### Listener reconstruction

**Teacher:** Your turn, without the students.

For the payment platform, explain:

one — the invariant that selects each of Deployment, StatefulSet, DaemonSet,
and Job;

two — how readiness controls a rolling Deployment and what the progress
deadline does;

three — why HPA and VPA can fight through utilization;

four — how to remove that shared signal; and

five — which disruptions a PodDisruptionBudget does and does not constrain.

**Listener pause: 35 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed
answer.

A Deployment manages replaceable Pods through ReplicaSets and controlled
rollouts. A StatefulSet provides ordinal identity and lifecycle ordering, not
application replication or failover. A DaemonSet follows eligible Node objects.
A Job retries toward successful completions, and its task must tolerate
duplicate starts.

During a rolling Deployment, maxSurge and maxUnavailable set the bounds.
Readiness and minReadySeconds decide availability and therefore further
scale-down. A lying readiness signal accelerates replacement; a strict one
stalls it. progressDeadlineSeconds reports the stall and does not roll back.

HPA on utilization divides usage by requests. If VPA changes those requests,
it redefines HPA's signal and can create feedback. Give HPA an independent
metric or keep VPA from changing that denominator. A PodDisruptionBudget
constrains voluntary Eviction API requests such as drain. Power loss,
node-pressure eviction, and direct deletion can bypass it, while scheduler
preemption respects it only as a best effort. It is a maintenance rail, not an
availability guarantee.

If your answer had that causal shape, exact wording does not matter. If it did
not, replay only the dialogue where your reconstruction first diverged.

---

## Production notes

- Synthesised voices: normalise loudness across all three and keep one gain
 for the whole piece, so it feels like one room rather than edited clips.
- Keep student hesitations and self-corrections, but remove theatrical filler.
- The listener pause always precedes the student's attempt — including recall
 reminders and checkpoints, which are retrieval, not narration.
- Never make one student the designated wrong student. Rotate errors according
 to their reasoning profiles.
- Do not add background music. Silence is instructional space.
- No command lines, flags, or literal identity strings anywhere in dialogue.
 Speakable Kubernetes terms are vocabulary and stay.
- Extended-format additions: recall-before-reuse for important terms,
 behaviour-name-echo for new terms, a one-line student checkpoint closing
 each section, adaptive teacher turns (story at openings, terse in drills).

## Comparison test

After one listen, ask the learner to select all four controllers from their
invariants, then reconstruct the autoscaler and disruption boundaries in ninety
seconds. Score causal ordering and boundary discrimination, not verbatim recall
or learner preference.
