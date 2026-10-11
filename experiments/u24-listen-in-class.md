# Listen-in classroom pilot: quota, LimitRange, and live resize

This is the classroom-dialogue version of Module 24. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students are not scripted as answer dispensers: they hesitate,
compress too early, and make plausible mistakes which expose the mechanism.

Factual authority remains `assets/cka-deep-content.js`, unit `u24`, plus its
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

**Teacher:** [warm, unhurried] You expected a Pod. There is nothing to describe —
no Pending object, no scheduler event. Maya, where do people look?

**Listener pause: 3 seconds**

**Maya:** The scheduler — something could not be placed.

**Teacher:** One investigation: namespace admission. First why Forbidden is not
Pending, then how a live resize can be accepted without reaching the cgroup.
Same discipline: prove what the API did before you blame the node. Leon, what
segment are we on?

**Listener pause: 2 seconds**

**Leon:** Admission and storage — before scheduling starts.

### One object, or the whole namespace

**Teacher:** [curious] Two objects govern a namespace. What does a LimitRange
shape?

**Listener pause: 4 seconds**

**Leon:** [uncertain] The whole namespace budget?

**Teacher:** That is quota. What scale does LimitRange work at?

**Listener pause: 3 seconds**

**Maya:** A single object — defaults and constraints on one submission.

**Teacher:** What can it default and constrain for compute?

**Listener pause: 3 seconds**

**Maya:** Container and Pod compute.

**Teacher:** And for storage?

**Listener pause: 3 seconds**

**Leon:** PVC storage requests.

**Teacher:** What does a ResourceQuota budget?

**Listener pause: 3 seconds**

**Maya:** The namespace in aggregate — total consumption and object counts.

**Teacher:** Which one edits what you submitted, and which decides whether there
is room?

**Listener pause: 3 seconds**

**Leon:** LimitRange shapes. Quota budgets room.

### Forbidden is not Pending

**Teacher:** Where are both enforced — scheduling, or admission?

**Listener pause: 2 seconds**

**Maya:** Admission.

**Teacher:** A quota violation returns Forbidden. Is the object stored?

**Listener pause: 2 seconds**

**Leon:** No. Never stored.

**Teacher:** Is there a Pod to inspect, a scheduler event, or something Pending?

**Listener pause: 2 seconds**

**Maya:** None of those.

**Teacher:** Now suppose the Pod came from a Deployment instead of a direct
create. Is there still nothing to read?

**Listener pause: 4 seconds**

**Leon:** [working it out] The Deployment and its ReplicaSet were stored
earlier... so they remain. The ReplicaSet keeps failing to create Pods, and it
records FailedCreate events.

**Teacher:** So a direct create leaves nothing. A controller path leaves a
parent with FailedCreate events. Read the parent. When you see exceeded quota,
which boundary do you look at?

**Listener pause: 3 seconds**

**Leon:** [realizing] The API request that was rejected — not the scheduler.

**Teacher:** Are Pending and Forbidden the same boundary?

**Listener pause: 2 seconds**

**Maya:** No.

### What quota can actually count

**Teacher:** What does a quota account — declared API resources, or real usage?

**Listener pause: 3 seconds**

**Leon:** [uncertain] Real usage — that is the point of a budget.

**Teacher:** [gentle] Declared requests, limits, and object counts. Can
admission measure what containers are really using?

**Listener pause: 3 seconds**

**Maya:** No. Runtime utilisation is metrics and cgroup — admission has no
access.

**Teacher:** Can a namespace be at quota while its Pods sit idle?

**Listener pause: 2 seconds**

**Leon:** Yes. Both accurate.

### How a default breaks a quota

**Teacher:** You add a LimitRange. Previously valid Pods now fail. Maya, did the
Pod manifests change?

**Listener pause: 3 seconds**

**Maya:** Something must have changed in the Pods.

**Teacher:** What did the LimitRange inject?

**Listener pause: 3 seconds**

**Leon:** Default requests or limits.

**Teacher:** What does quota then evaluate — as submitted, or as admitted?

**Listener pause: 3 seconds**

**Maya:** [realizing] As admitted. The defaults count against the budget.

**Teacher:** What actually changed?

**Listener pause: 3 seconds**

**Leon:** What the namespace now says a Pod means — not the submitted shape
alone.

### Accepted is not applied

**Teacher:** In-place resize changes requests or limits without replacing the
Pod, where policy and node allow. Maya, does an accepted patch prove the cgroup
changed?

**Listener pause: 3 seconds**

**Maya:** [confident] Yes — the API accepted it.

**Teacher:** [gentle] Who stores desired values, and who applies them?

**Listener pause: 4 seconds**

**Leon:** The API stores desired. The kubelet applies them.

**Teacher:** What does Pod status report about allocation?

**Listener pause: 4 seconds**

**Maya:** What was actually allocated — including deferred or infeasible
outcomes.

**Teacher:** So is acceptance the same event as application?

**Listener pause: 2 seconds**

**Leon:** No.

### QoS does not move

**Teacher:** After an in-place resize, does the Pod's QoS class change?

**Listener pause: 3 seconds**

**Maya:** [confident] If you raise limits to match requests, it becomes
Guaranteed.

**Teacher:** [gentle] Does resize change QoS class?

**Listener pause: 3 seconds**

**Leon:** No. The class is fixed for the Pod's lifetime.

**Teacher:** Why?

**Listener pause: 3 seconds**

**Maya:** Scheduling and eviction semantics stay stable.

**Teacher:** If you need a different class, what do you need?

**Listener pause: 2 seconds**

**Leon:** A new Pod. Resize is not promotion to Guaranteed.

### Proving it took effect

**Teacher:** Three steps to prove a live resize worked. First?

**Listener pause: 3 seconds**

**Maya:** Compare the desired resources in the spec.

**Teacher:** Second?

**Listener pause: 3 seconds**

**Leon:** Read the allocated and applied resource status.

**Teacher:** Third?

**Listener pause: 3 seconds**

**Maya:** The Pod's resize condition — deferred or infeasible.

**Teacher:** If those three disagree, what have you found?

**Listener pause: 2 seconds**

**Leon:** Where it stopped.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — LimitRange versus ResourceQuota at different scales;

two — why Forbidden is not Pending, and what quota counts;

three — how injecting LimitRange defaults can break quota;

four — desired versus applied on in-place resize, and why QoS does not move;
and

five — three checks that prove a resize reached the container.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

LimitRange shapes one object — defaults and bounds on compute and PVC
requests. ResourceQuota budgets the namespace in aggregate. Both enforce at
admission. A quota violation is Forbidden. A direct create stores nothing; a
controller parent remains, with FailedCreate events and no child Pods. Quota counts declared resources and object counts, not
runtime utilisation. LimitRange defaults are evaluated as admitted, so adding
defaults can push a previously valid Pod over quota.

In-place resize stores desired values in the API; the kubelet applies them.
Status reports allocated and deferred or infeasible outcomes. Acceptance is
not application. QoS class does not change for the Pod's lifetime; a new class
needs a new Pod. Prove resize with desired in spec, allocated and applied
status, and the resize condition. When a Pod is absent rather than Pending,
look at admission.

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
for the expository Module 24. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
