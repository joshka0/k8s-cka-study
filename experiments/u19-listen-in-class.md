# Listen-in classroom pilot: leases and deliberate gates

This is the classroom-dialogue version of Module 19. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students are not scripted as answer dispensers: they hesitate,
compress too early, and make plausible mistakes which expose the mechanism.

Factual authority remains `assets/cka-deep-content.js`, unit `u19`, plus its
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

**Teacher:** [warm, unhurried] Something is stuck. People start deleting objects
until it moves. Maya, what is wrong with that approach?

**Listener pause: 3 seconds**

**Maya:** You never learn which gate was holding it — and you may break the
thing that was protecting you.

**Teacher:** One investigation: name the gate before you touch anything. Four
mechanisms hold four different transitions. We will build leader election
first, then place each gate on the lifecycle it actually blocks. Leon, what
segment are we on?

**Listener pause: 2 seconds**

**Leon:** Controllers — deliberate delay and coordination.

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

**Teacher:** [pleased] Optimistic concurrency over expiring state.

### The same API, two jobs

**Teacher:** Leon, does every Lease mean component leadership?

**Listener pause: 3 seconds**

**Leon:** [thinking aloud] That is what Leases are for, yes.

**Teacher:** [gentle] The same object type does two jobs. What does node
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

### Two candidates, one winner

**Teacher:** Two replicas both decide the Lease has expired and update it at
the same moment. Maya, what happens?

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

### What a Lease cannot promise

**Teacher:** Under API consistency, is there one current holder?

**Listener pause: 2 seconds**

**Leon:** Yes.

**Teacher:** Does failover wait until renewal stops and the duration expires?

**Listener pause: 2 seconds**

**Maya:** Yes.

**Teacher:** Can a Lease guarantee exactly-once external side effects?

**Listener pause: 4 seconds**

**Maya:** [confident] Once leadership moves, the old leader stops everything.

**Teacher:** [gentle] A former leader can still be mid-operation against
something outside the cluster. What do you need if that matters?

**Listener pause: 4 seconds**

**Leon:** [working it out] Fencing, or idempotency. The Lease alone will not
provide either.

### Four gates, four transitions

**Teacher:** Now the gates. Each blocks exactly one transition. Leon, what do
scheduling gates keep a Pod out of?

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

### And what a budget is not

**Teacher:** Maya, is a PodDisruptionBudget one of those four gates?

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

### Why gating reduces load

**Teacher:** A gated Pod cannot succeed yet. Leon, does the scheduler keep
retrying it?

**Listener pause: 3 seconds**

**Leon:** [uncertain] It would keep trying until something fits.

**Teacher:** [gentle] A gated Pod is not repeatedly retried. What does that
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

### Pending, reason SchedulingGated

**Teacher:** A Pod is Pending with reason SchedulingGated. Maya, is that a
scheduling failure?

**Listener pause: 3 seconds**

**Maya:** [confident] Yes — Pending means the scheduler could not place it.

**Teacher:** [gentle] Read the named gates in the spec. Who added them?

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
why each gate remains. Name the gate before you delete anything.

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
for the expository Module 19. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
