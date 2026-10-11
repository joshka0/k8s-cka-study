# Listen-in classroom, extended: leases and deliberate gates

Extended format of the u19 classroom pilot. Same facts, same cast, same
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

**Teacher:** [warm, unhurried] Something is stuck. People start deleting objects
until it moves. Name the gate before you delete anything. Maya, what is wrong with that approach?

**Listener pause: 3 seconds**

**Maya:** You never learn which gate was holding it — and you may break the
thing that was protecting you.

**Teacher:** One investigation: name the gate before you touch anything. Four
mechanisms hold four different transitions. We will build leader election
first, then place each gate on the lifecycle it actually blocks. Leon, what
segment are we on?

**Listener pause: 2 seconds**

**Leon:** Controllers — deliberate delay and coordination.

**Teacher:** Checkpoint, Maya. One line: first rule when something is stuck.

**Listener pause: 3 seconds**

**Maya:** Name the gate before you touch anything.

### Leadership is a conditional write

**Teacher:** [curious] How does leader election actually work — a special lock
protocol, or ordinary API writes?

**Listener pause: 4 seconds**

**Leon:** [uncertain] A lock protocol between the replicas.

**Teacher:** Candidates all observe one Lease. What three things does that
Lease record?

**Listener pause: 5 seconds**

**Maya:** Who holds it, when they last renewed, and how long the claim is good
for.

**Teacher:** Competing updates are conditional on resource version. How many
win?

**Listener pause: 2 seconds**

**Leon:** Exactly one.

**Teacher:** When renewal stops, what permits somebody else to take over?

**Listener pause: 3 seconds**

**Maya:** Expiry — the duration runs out.

**Teacher:** [pleased] Before we
move on — Leon, one line. What a Lease records for leadership.

**Listener pause: 3 seconds**

**Leon:** Holder, last renewal, and duration — one winner on resourceVersion.

### The same API, two jobs

**Teacher:** Same Lease type, different readers and consequences. Leon, does every Lease mean component leadership?

**Listener pause: 3 seconds**

**Leon:** [thinking aloud] That is what Leases are for, yes.

**Teacher:** [gentle] What does node
liveness use Leases for?

**Listener pause: 4 seconds**

**Maya:** A cheap heartbeat the node controller reads — in their own
namespace.

**Teacher:** And component leader election?

**Listener pause: 2 seconds**

**Leon:** [realizing] To decide who is active. Same type, different job.

**Teacher:** Why does confusing those two make node diagnosis harder?

**Listener pause: 3 seconds**

**Maya:** You chase the wrong reader and the wrong consequence.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: two jobs of the Lease API.

**Listener pause: 3 seconds**

**Maya:** Node heartbeats and component leadership — same type, different job.

### Two candidates, one winner

**Teacher:** Two replicas both decide the Lease has expired and update it at
the same moment. The API's consistency is the only coordination protocol required. Maya, what happens?

**Listener pause: 4 seconds**

**Maya:** [confident] They might both become leader briefly — split brain.

**Teacher:** [gentle] How many conditional updates succeed?

**Listener pause: 2 seconds**

**Leon:** Exactly one.

**Teacher:** What does the loser receive, and what does it do?

**Listener pause: 4 seconds**

**Leon:** A conflict. It sees the Lease is held by somebody else, and goes
back to following.

**Teacher:** Is any coordination protocol required beyond the API's own
consistency?

**Listener pause: 2 seconds**

**Maya:** No.

**Teacher:** Checkpoint, Leon. One line: two candidates race — who wins?

**Listener pause: 3 seconds**

**Leon:** Exactly one conditional update wins; the loser conflicts and follows.

### What a Lease cannot promise

**Teacher:** Leadership is not exactly-once external side effects. Under API consistency, is there one current holder?

**Listener pause: 2 seconds**

**Leon:** Yes.

**Teacher:** Does failover wait until renewal stops and the duration expires?

**Listener pause: 2 seconds**

**Maya:** Yes.

**Teacher:** Can a Lease guarantee exactly-once external side effects?

**Listener pause: 4 seconds**

**Maya:** [confident] Once leadership moves, the old leader stops everything.

**Teacher:** [gentle] What do you need if that matters?

**Listener pause: 4 seconds**

**Leon:** [working it out] Fencing, or idempotency. The Lease alone will not
provide either.

**Teacher:** Before we move on — Maya, one line. What leadership cannot promise
for external side effects.

**Listener pause: 3 seconds**

**Maya:** Exactly-once external effects — you still need fencing or
idempotency.

### Four gates, four transitions

**Teacher:** Now the gates. Each blocks exactly one transition.
Leon, what do scheduling gates keep a Pod out of?

**Listener pause: 3 seconds**

**Leon:** Active scheduling — it is never considered.

**Teacher:** What do readiness gates keep a running Pod out of?

**Listener pause: 3 seconds**

**Maya:** Ready. The endpoint can stay in its EndpointSlice with ready false,
so Service data planes normally avoid it.

**Teacher:** When do finalizers hold?

**Listener pause: 3 seconds**

**Leon:** After a deletion timestamp is set — they hold deletion.

**Teacher:** And a Lease?

**Listener pause: 3 seconds**

**Maya:** Logical leadership — not a Pod transition.

**Teacher:** Can any of them substitute for another?

**Listener pause: 2 seconds**

**Leon:** No. Four mechanisms, four transitions.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: four gates, four
transitions.

**Listener pause: 4 seconds**

**Maya:** Scheduling gates block scheduling; readiness blocks Ready; finalizers
hold deletion; Lease holds leadership.

### And what a budget is not

**Teacher:** A request-path constraint is a different category from a transition gate. Maya, is a PodDisruptionBudget one of those four gates?

**Listener pause: 3 seconds**

**Maya:** [confident] It holds disruption — so yes, a kind of gate.

**Teacher:** [gentle] What request path does it constrain?

**Listener pause: 3 seconds**

**Leon:** Voluntary requests through the Eviction API.

**Teacher:** Can it govern the kernel, a power cut, or a direct delete?

**Listener pause: 2 seconds**

**Maya:** No.

**Teacher:** Does it restrict a transition, or a request path?

**Listener pause: 2 seconds**

**Leon:** A request path. Different category entirely.

**Teacher:** Checkpoint, Leon. One line: why a PDB is not one of the four gates.

**Listener pause: 3 seconds**

**Leon:** It constrains a voluntary eviction request path — not a Pod
transition.

### Why gating reduces load

**Teacher:** A gated Pod cannot succeed yet. Work that cannot succeed yet should not burn scheduling attempts. Leon, does the scheduler keep
retrying it?

**Listener pause: 3 seconds**

**Leon:** [uncertain] It would keep trying until something fits.

**Teacher:** [gentle] What does that
save?

**Listener pause: 3 seconds**

**Maya:** Scheduling attempts on work that cannot succeed yet.

**Teacher:** Who removes the gates once the external prerequisite exists?

**Listener pause: 2 seconds**

**Leon:** A controller.

**Teacher:** After creation, can you add new scheduling gates?

**Listener pause: 3 seconds**

**Maya:** [realizing] No — gates can be removed, but new ones cannot be added
later.

**Teacher:** Before we move on — Maya, one line. What gating saves.

**Listener pause: 3 seconds**

**Maya:** Failed scheduling attempts on work that cannot succeed yet.

### Pending, reason SchedulingGated

**Teacher:** First, a recall — Leon, remind us. What do scheduling gates keep a
Pod out of?

**Listener pause: 2 seconds**

**Leon:** Active scheduling — it is never considered.

**Teacher:** Hold that. A Pod is Pending with reason SchedulingGated. Maya, is
that a scheduling failure?

**Listener pause: 3 seconds**

**Maya:** [confident] Yes — Pending means the scheduler could not place it.

**Teacher:** [gentle] Who added them?

**Listener pause: 4 seconds**

**Leon:** A controller or an admission rule.

**Teacher:** What is that controller waiting on?

**Listener pause: 3 seconds**

**Maya:** An external prerequisite.

**Teacher:** Then what do you ask about each gate?

**Listener pause: 3 seconds**

**Leon:** Why it has not been removed yet.

**Teacher:** Is the scheduler broken in any of those answers?

**Listener pause: 2 seconds**

**Maya:** No. It sees the gates and skips the Pod on purpose. Nothing here is a
capacity failure.

**Teacher:** Checkpoint, Leon. One line: how you diagnose SchedulingGated.

**Listener pause: 3 seconds**

**Leon:** Read the named gates, find who added them, and ask why each remains.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — how leader election works as optimistic concurrency on a Lease;

two — the two jobs of the Lease API, and what leadership cannot promise for
external side effects;

three — the four gates and the one transition each blocks;

four — why a PodDisruptionBudget is not a gate; and

five — how you diagnose Pending with reason SchedulingGated.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

Leader election is optimistic concurrency over an expiring Lease: holder,
renewal time, and duration. Conditional updates on resource version leave one
winner; expiry permits takeover. The same Lease type does node heartbeats and
component leadership — different jobs. Two candidates racing yield one success
and one conflict; the loser follows. A Lease does not guarantee exactly-once
external side effects; fencing or idempotency is separate.

Scheduling gates block active scheduling. Readiness gates block Pod Ready —
the endpoint can remain in its EndpointSlice with ready false, avoided rather
than removed. Finalizers hold deletion after the deletion timestamp. A
Lease holds logical leadership. None substitutes for another. A
PodDisruptionBudget constrains voluntary Eviction API requests only — not
kernel, power, or direct delete. A SchedulingGated Pod is not a scheduler
failure: read the named gates, find who added them, name the prerequisite, ask
why each gate remains.

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
