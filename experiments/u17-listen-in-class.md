# Listen-in classroom pilot: device claims and allocation

This is the classroom-dialogue version of Module 17. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students are not scripted as answer dispensers: they hesitate,
compress too early, and make plausible mistakes which expose the mechanism.

Factual authority remains `assets/cka-deep-content.js`, unit `u17`, plus its
reviewed upstream sources. This is an audio script, not a video script.

The dialogue stays at the level of concepts. No command lines, no flag
strings, no literal identity strings. Where the expository module teaches an
exact string, this script teaches the *shape* of the string — what the parts
are and which contains which — and leaves the exact characters to the module
and the deck. A listener in a car cannot read, so nothing here should need
reading.

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
- **Listener pause** — two or three seconds of silence before a student answers.
  The listener should answer in that gap.

The different student profiles matter. Their mistakes should remain natural,
not theatrical. Neither student is the permanently weak or permanently strong
one.

---

## Script

### Opening

**Teacher:** [warm, unhurried] Asking for a GPU can mean two different things. One is
a number a node advertises. The other is an object the scheduler allocates.
Maya, which one do people assume by default?

**Listener pause: 3 seconds**

**Maya:** A count — the node has eight, I ask for two.

**Teacher:** One investigation: a device-backed Pod that will not run. We build
from the count to a claim, then find which owner is holding it. Leon, what
segment of the path are we on?

**Listener pause: 2 seconds**

**Leon:** Scheduling — for workloads that need hardware.

### A count, or a description

**Teacher:** [curious] Device plugins advertise vendor extended resources as scalar
node capacity. What does the Pod request look like?

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

**Teacher:** [pleased] A number becomes a description you can filter on.

### Class versus claim

**Teacher:** Two objects get confused immediately. Leon, is a DeviceClass the
request the Pod makes?

**Listener pause: 3 seconds**

**Leon:** [uncertain] I think so — the class of device it wants.

**Teacher:** [gentle] That is the claim's job. What does the class hold?

**Listener pause: 4 seconds**

**Maya:** Categorisation and policy — what a kind of device is, and how it may
be selected.

**Teacher:** And once a claim is allocated, what gets written back into it?

**Listener pause: 3 seconds**

**Leon:** [realizing] The answer — what it was actually given.

**Teacher:** Category on one side. Request plus answer on the other.

### The order of the handshake

**Teacher:** The handshake has an order. Maya, what must exist before anything
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

### Plugin versus DRA

**Teacher:** Leon, give me the clean discriminator between device plugin and
DRA.

**Listener pause: 6 seconds**

**Leon:** A device plugin advertises scalar extended resources
through the kubelet. DRA publishes structured devices through API objects —
which is what makes filtering, sharing, and lifecycle possible.

**Teacher:** What do both still need before a container can use anything?

**Listener pause: 3 seconds**

**Maya:** Node-side preparation.

### Three owners

**Teacher:** A device-backed Pod is Pending. Maya, how many owners share the
outcome?

**Listener pause: 3 seconds**

**Maya:** [confident] Mainly the scheduler — that is what Pending means.

**Teacher:** [gentle] Three. Name them, Leon.

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

### Template, or a named claim

**Teacher:** Leon, is a ResourceClaimTemplate a shared claim several Pods use?

**Listener pause: 4 seconds**

**Leon:** [thinking aloud] Hmm... that is what the name sounds like.

**Teacher:** [gentle] Opposite. What lifecycle is a template tied to?

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

### Which cause is it

**Teacher:** The Pod does not schedule. From the Pod alone, four causes look
identical. Maya, name them.

**Listener pause: 7 seconds**

**Maya:** No matching device anywhere. A matching device on no reachable node.
An allocation conflict — something else holds it. Or the driver is simply not
ready yet.

**Teacher:** Leon, why is checking Service networking a wasted first step here?

**Listener pause: 3 seconds**

**Leon:** [realizing] Service networking is downstream of all four. It proves
nothing about allocation.

### Teardown runs backwards

**Teacher:** A Pod is deleted. Capacity still looks missing for a while. Why,
Maya?

**Listener pause: 5 seconds**

**Maya:** Deletion runs the handshake backwards. Container stops, then
unprepare on the node, then release the reservation. Only then does inventory
become allocatable again.

**Teacher:** Is the lag between Pod gone and capacity returned instantaneous?

**Listener pause: 2 seconds**

**Leon:** No. The window is real.

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
- The listener pause always precedes the student's attempt. This preserves
  retrieval while still providing vicarious learning.
- Never make one student the designated wrong student. Rotate errors according
  to their reasoning profiles.
- Do not add background music. Silence is instructional space.
- Preserve small teacher prompts such as "which object supplied the reach?";
  these reveal how to repair reasoning without giving away the whole answer.
- No command lines, flags, or literal identity strings anywhere in dialogue.
  The exact characters live in the module and the deck; this format teaches
  the shape and the order of the parts.

## Comparison test

After one listen, use the same ninety-second cold-reconstruction prompt used
for the expository Module 17. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
