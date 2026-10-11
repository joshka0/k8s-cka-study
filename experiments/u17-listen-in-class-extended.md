# Listen-in classroom, extended: device claims and allocation

Extended format of the u17 classroom pilot. Same facts, same cast, same
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

### Opening

**Teacher:** [warm, unhurried] Asking for a GPU can mean two different things. One is
a number a node advertises. The other is an object the scheduler allocates. A count and a claim are two different GPU requests.
Maya, which one do people assume by default?

**Listener pause: 3 seconds**

**Maya:** A count — the node has eight, I ask for two.

**Teacher:** One investigation: a device-backed Pod that will not run. We build
from the count to a claim, then find which owner is holding it. Leon, what
segment of the path are we on?

**Listener pause: 2 seconds**

**Leon:** Scheduling — for workloads that need hardware.

**Teacher:** Checkpoint, Maya. One line: the two meanings of "I need a GPU."

**Listener pause: 3 seconds**

**Maya:** A scalar count on the node, or a claim the scheduler allocates.

### A count, or a description

**Teacher:** [curious] Device plugins advertise vendor extended resources as scalar
node capacity. A number becomes a description you can filter on. What does the Pod request look like?

**Listener pause: 3 seconds**

**Leon:** A number. How many of that opaque resource.

**Teacher:** DRA describes devices instead. What do drivers publish as
inventory?

**Listener pause: 3 seconds**

**Maya:** ResourceSlices — structured inventory with attributes.

**Teacher:** What object categorises kinds of device and holds policy for
selecting them?

**Listener pause: 3 seconds**

**Leon:** A DeviceClass.

**Teacher:** What object expresses what a workload needs?

**Listener pause: 2 seconds**

**Maya:** A ResourceClaim.

**Teacher:** [pleased] Before
we move on — Leon, one line. Scalar plugin versus DRA inventory.

**Listener pause: 3 seconds**

**Leon:** Plugin is a count; DRA publishes structured ResourceSlices you can
filter.

### Class versus claim

**Teacher:** Two objects get confused immediately. Category on one side; request plus answer on the other. Leon, is a DeviceClass the
request the Pod makes?

**Listener pause: 3 seconds**

**Leon:** [uncertain] I think so — the class of device it wants.

**Teacher:** [gentle] What does the class hold?

**Listener pause: 4 seconds**

**Maya:** Categorisation and policy — what a kind of device is, and how it may
be selected.

**Teacher:** And once a claim is allocated, what gets written back into it?

**Listener pause: 3 seconds**

**Leon:** [realizing] The answer — what it was actually given.

**Teacher:** Category on one side. Request plus answer on the other. Carry this
one forward, Maya. One line: DeviceClass versus ResourceClaim.

**Listener pause: 3 seconds**

**Maya:** Class is category and policy; claim is the request plus the allocation
answer.

### The order of the handshake

**Teacher:** The handshake has an order. Allocation precedes preparation — always. Maya, what must exist before anything
can be allocated?

**Listener pause: 3 seconds**

**Maya:** Published availability — inventory from the drivers.

**Teacher:** Then the scheduler does two things. Which first — allocate into
the claim, or prepare on the node?

**Listener pause: 4 seconds**

**Leon:** [working it out] Allocate into the claim... and select a node that can
reach it. Preparation comes later.

**Teacher:** Who prepares on that node?

**Listener pause: 3 seconds**

**Maya:** The kubelet and the driver, before the container uses it.

**Teacher:** Can preparation happen before allocation?

**Listener pause: 2 seconds**

**Leon:** No. Allocation precedes preparation.

**Teacher:** Some drivers add binding conditions so preparation must finish
before bind. Does that reverse the order of allocation?

**Listener pause: 2 seconds**

**Maya:** No. Allocation still comes first.

**Teacher:** Checkpoint, Leon. One line: handshake order.

**Listener pause: 3 seconds**

**Leon:** Publish inventory, allocate into the claim and pick a node, then
prepare on the node.

### Plugin versus DRA

**Teacher:** Leon, give me the clean discriminator between device plugin and
DRA. Both models still need node-side preparation.

**Listener pause: 6 seconds**

**Leon:** A device plugin advertises scalar extended resources
through the kubelet. DRA publishes structured devices through API objects —
which is what makes filtering, sharing, and lifecycle possible.

**Teacher:** What do both still need before a container can use anything?

**Listener pause: 3 seconds**

**Maya:** Node-side preparation.

**Teacher:** Before we move on — Maya, one line. What both models still require.

**Listener pause: 3 seconds**

**Maya:** Node-side preparation before the container can use the device.

### Three owners

**Teacher:** First, a recall — Leon, remind us. What does the scheduler write
into the claim?

**Listener pause: 2 seconds**

**Leon:** The allocation — what the claim was actually given.

**Teacher:** Hold that. A device-backed Pod is Pending. Maya, how many owners
share the outcome?

**Listener pause: 3 seconds**

**Maya:** [confident] Mainly the scheduler — that is what Pending means.

**Teacher:** [gentle] Name them, Leon.

**Listener pause: 5 seconds**

**Leon:** The scheduler — allocates the claim and selects the node. The DRA
driver — publishes inventory and may coordinate readiness. The kubelet —
prepares the allocated device on the node.

**Teacher:** Which three objects' status separate those phases?

**Listener pause: 4 seconds**

**Maya:** The Pod, the ResourceClaim, and the ResourceSlice.

**Teacher:** Why read all three before you blame the scheduler?

**Listener pause: 3 seconds**

**Leon:** Because only status separates the phases. Guessing is slower.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: three owners, three status
objects.

**Listener pause: 3 seconds**

**Maya:** Scheduler, driver, kubelet — read Pod, claim, and slice status.

### Template, or a named claim

**Teacher:** Choose by lifetime and sharing, not by which pattern is newer. Leon, is a ResourceClaimTemplate a shared claim several Pods use?

**Listener pause: 4 seconds**

**Leon:** [thinking aloud] Hmm... that is what the name sounds like.

**Teacher:** [gentle] What lifecycle is a template tied to?

**Listener pause: 4 seconds**

**Maya:** The workload's. Each Pod gets its own generated claim, created and
cleaned up with it.

**Teacher:** What about a directly named claim?

**Listener pause: 3 seconds**

**Maya:** A separate object that can be shared between Pods or outlive any of
them.

**Teacher:** How do you choose between them?

**Listener pause: 3 seconds**

**Leon:** By lifetime and sharing — not by which pattern is newer.

**Teacher:** Checkpoint, Leon. One line: template versus named claim.

**Listener pause: 3 seconds**

**Leon:** Template is per-Pod lifecycle; named claim can be shared and outlive
Pods.

### Which cause is it

**Teacher:** The Pod does not schedule. From the Pod alone, four causes look
identical. Maya, name them. From the Pod alone, four causes look identical.

**Listener pause: 7 seconds**

**Maya:** No matching device anywhere. A matching device on no reachable node.
An allocation conflict — something else holds it. Or the driver is simply not
ready yet.

**Teacher:** Leon, why is checking Service networking a wasted first step here?

**Listener pause: 3 seconds**

**Leon:** [realizing] Service networking is downstream of all four. It proves
nothing about allocation.

**Teacher:** Before we move on — Maya, one line. Why networking is the wrong
first check.

**Listener pause: 3 seconds**

**Maya:** It is downstream of match, reachability, conflict, and driver
readiness.

### Teardown runs backwards

**Teacher:** First, a recall — Leon, remind us. What must precede node
preparation?

**Listener pause: 2 seconds**

**Leon:** Allocation into the claim.

**Teacher:** Hold that. A Pod is deleted. Capacity still looks missing for a
while. Why, Maya?

**Listener pause: 5 seconds**

**Maya:** Deletion runs the handshake backwards. Container stops, then
unprepare on the node, then release the reservation. Only then does inventory
become allocatable again.

**Teacher:** Is the lag between Pod gone and capacity returned instantaneous?

**Listener pause: 2 seconds**

**Leon:** No. The window is real.

**Teacher:** Checkpoint, Leon. One line: why capacity lags after Pod deletion.

**Listener pause: 3 seconds**

**Leon:** Unprepare and release run after the container stops — the window is
real.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — how scalar extended resources differ from DRA's structured inventory;

two — DeviceClass versus ResourceClaim;

three — the allocation handshake in order;

four — the three owners of a device-backed Pending Pod, and which objects hold
their status; and

five — ResourceClaimTemplate versus named claim, and why capacity lags after
deletion.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

Device plugins advertise scalar counts through the kubelet. DRA publishes
structured devices as ResourceSlices, categorises them with DeviceClasses, and
expresses need as ResourceClaims. A class is policy and category; a claim is
intent plus the allocation written back. Drivers publish availability first.
The scheduler allocates into the claim and selects a reachable node. Only then
do kubelet and driver prepare the device. Allocation precedes preparation.
Both models still need that node-side step.

A Pending device Pod has three owners: scheduler, DRA driver, and kubelet —
separated by status on Pod, claim, and slice. A ResourceClaimTemplate generates
a claim per Pod with matching lifecycle. A named claim can be shared and can
outlive Pods. Pending causes include no match, no reachable node, conflict,
and driver not ready; networking is downstream. Teardown unprepares and
releases before capacity returns.

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

After one listen, use the same ninety-second cold-reconstruction prompt used
for the expository module. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
