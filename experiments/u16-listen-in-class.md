# Listen-in classroom pilot: topology, admission, and CPU isolation

This is the classroom-dialogue version of Module 16. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students are not scripted as answer dispensers: they hesitate,
compress too early, and make plausible mistakes which expose the mechanism.

Factual authority remains `assets/cka-deep-content.js`, unit `u16`, plus its
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

**Teacher:** [warm, unhurried] The scheduler decided this node fits. The node refused
the Pod anyway. Maya, what do people call that?

**Listener pause: 3 seconds**

**Maya:** A scheduler bug — it should not send a Pod the node cannot run.

**Teacher:** One investigation: two correct answers to two different questions —
first why feasible is not local, then why a running Guaranteed Pod can still
jitter. Leon, what layer of the path are we on?

**Listener pause: 2 seconds**

**Leon:** The node — hardware locality, not aggregate capacity.

### Aggregate is not locality

**Teacher:** [curious] The scheduler finds enough CPU, memory, and devices on a
node in total. Does that prove they can sit coherently on the same NUMA node?

**Listener pause: 3 seconds**

**Leon:** [uncertain] If the totals fit, the placement should work.

**Teacher:** [gentle] Is the scheduler laying out silicon, or summing capacity?

**Listener pause: 3 seconds**

**Maya:** Summing capacity.

**Teacher:** Say the two questions out loud.

**Listener pause: 4 seconds**

**Maya:** Cluster feasibility — enough in aggregate. Hardware locality —
whether those pieces can be aligned on one side of the machine.

**Teacher:** [pleased] Same numbers. Different feasibility.

### Three managers, one merge

**Teacher:** On the chosen node there is a small protocol. Leon, which three
managers each know their own resource?

**Listener pause: 4 seconds**

**Leon:** [thinking aloud] CPU Manager... Memory Manager... and Device Manager?

**Teacher:** What does each emit about placement?

**Listener pause: 2 seconds**

**Maya:** Topology hints.

**Teacher:** Who merges those hints?

**Listener pause: 2 seconds**

**Maya:** Topology Manager, under a configured policy.

**Teacher:** Under restricted or single-numa-node, what happens when the hints
do not intersect into one coherent placement?

**Listener pause: 3 seconds**

**Maya:** Admission fails on that node.

**Teacher:** Under best-effort?

**Listener pause: 2 seconds**

**Leon:** The Pod still admits, without the preferred alignment.

**Teacher:** Under none?

**Listener pause: 2 seconds**

**Maya:** No alignment step at all.

### Who gets exclusive CPUs

**Teacher:** Under the static CPU Manager policy, exclusive CPUs are not for
everyone. Maya, a Pod is Guaranteed. Is that enough?

**Listener pause: 4 seconds**

**Maya:** [confident] Guaranteed should get dedicated CPUs.

**Teacher:** [gentle] Not by class alone. What else must the CPU request be?

**Listener pause: 3 seconds**

**Leon:** [realizing] A whole number. A fraction stays in the shared pool.

**Teacher:** Can both Pods be Guaranteed while only one gets a dedicated set?

**Listener pause: 2 seconds**

**Maya:** Yes — only the whole-CPU request earns it.

**Teacher:** Is that a priority, or an exact rule?

**Listener pause: 2 seconds**

**Leon:** An exact rule.

### Scheduled, then refused

**Teacher:** A Pod is bound to a node, then refused on topology grounds. Maya,
does the scheduler move that object?

**Listener pause: 3 seconds**

**Maya:** It should reschedule it somewhere better.

**Teacher:** [gentle] What state does the Pod end in after admission fails?

**Listener pause: 3 seconds**

**Leon:** Failed. It stays Failed.

**Teacher:** Who creates another try if you want one?

**Listener pause: 3 seconds**

**Leon:** A controller — a Deployment or similar — if you want a replacement.

**Teacher:** Why is this not a contradiction between scheduler and node?

**Listener pause: 5 seconds**

**Maya:** [working it out] Topology Manager is node-local. A strict policy can
refuse what looked feasible in aggregate. Two components, two questions, both
correct.

### A limit is not isolation

**Teacher:** Leon, does a CPU limit give you isolation?

**Listener pause: 3 seconds**

**Leon:** [uncertain] It caps usage, so... roughly yes?

**Teacher:** What does a CFS quota actually control — how much time, or where
you run?

**Listener pause: 3 seconds**

**Maya:** How much time you get.

**Teacher:** What controls where you run?

**Listener pause: 3 seconds**

**Leon:** A cpuset — which cores you are pinned to.

**Teacher:** Are those the same mechanism?

**Listener pause: 2 seconds**

**Maya:** No. Different axes.

**Teacher:** What else does predictable latency usually need beyond either?

**Listener pause: 5 seconds**

**Maya:** Reserved system CPUs. NUMA-local memory and devices. Interrupt
placement. Huge pages. A runtime and kernel that preserve the layout you
intended.

### Latency without high usage

**Teacher:** Average CPU utilisation looks low. Latency is poor. Leon, name
three sources averages hide.

**Listener pause: 6 seconds**

**Leon:** Throttling — time you were not allowed to run. Scheduling
delay — time you waited for a core. Poor locality — memory access that crosses
a NUMA boundary.

**Teacher:** Does each leave the same evidence on the node?

**Listener pause: 2 seconds**

**Maya:** No. Different evidence for each.

### What the strictest policy promises

**Teacher:** Maya, what does single-numa-node actually promise?

**Listener pause: 4 seconds**

**Maya:** [confident] That the Pod will be placed on a node where everything fits
on one NUMA side.

**Teacher:** [gentle] Is it a promise about smarter placement, or about
admission?

**Listener pause: 3 seconds**

**Leon:** Admission.

**Teacher:** What does the kubelet do when resources cannot be satisfied from
one NUMA node?

**Listener pause: 3 seconds**

**Leon:** Refuse the Pod on that node.

**Teacher:** Does that object return to Pending and try elsewhere?

**Listener pause: 3 seconds**

**Leon:** [realizing] No. It fails. Strictness produces rejections, not
feedback to the scheduler.

### A Guaranteed Pod that still jitters

**Teacher:** Final problem. The Pod is Guaranteed and still jittery. Where do
you look after the obvious class answer, Maya?

**Listener pause: 6 seconds**

**Maya:** CPU Manager policy and the cpuset it actually got. CFS throttling
metrics. Topology Manager scope and policy. Whether admission compromised.
Locality of memory and devices. Then reserved CPUs, interrupts, and system
daemons sharing the machine.

**Teacher:** What unites the refusal and the jitter?

**Listener pause: 4 seconds**

**Leon:** [realizing] Feasible for the cluster is not feasible for the node —
or for the latency you wanted. Know which evidence lives on the Pod object and
which lives on the node.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — why aggregate capacity is not NUMA locality;

two — how the three managers and Topology Manager turn hints into admit or
refuse under restricted, single-numa-node, best-effort, and none;

three — who earns exclusive CPUs under static policy;

four — why a scheduled Pod can stay Failed after node refusal; and

five — why a CPU limit is not isolation, and what single-numa-node actually
promises.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

The scheduler answers aggregate feasibility. It does not lay out silicon. On
the node, CPU, Memory, and Device Managers emit topology hints. Topology
Manager merges them under policy. Restricted and single-numa-node can fail
admission when no coherent placement exists. Best-effort admits without
preferred alignment. None skips the step. Under static CPU Manager, exclusive
CPUs require a Guaranteed Pod and a whole-number CPU request; a fraction stays
shared.

A node may refuse a bound Pod on topology grounds. That object stays Failed;
a controller must create a replacement. Both scheduler and node can be right.
A CFS quota caps time; a cpuset controls where you run. Predictable latency
needs more than either alone. Low average utilisation can hide throttling,
run-queue delay, and remote memory. Single-numa-node refuses what cannot fit
on one NUMA node; it does not reschedule the same object somewhere better.

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
for the expository Module 16. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
