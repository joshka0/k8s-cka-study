# Listen-in classroom, extended: The controller that missed, duplicated, and spun

Extended format of the u03 classroom script. Same facts, same cast, same
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

### The object exists

**Teacher:** [warm] A team declares a cloud load balancer. The API object
exists, but no load balancer becomes ready. The trap is treating presence as
proof that every downstream loop heard the creation. Presence in the API is not proof the controller heard every transition. Maya, does the existing
object prove the controller received its creation event?

**Listener pause: 3 seconds**

**Maya:** Yes. If the object exists, its creation event must have reached the
controller.

**Teacher:** Can a watch connection lose history or restart?

**Listener pause: 2 seconds**

**Leon:** Yes.

**Teacher:** Then what question is safer than asking whether one event arrived?

**Listener pause: 4 seconds**

**Maya:** What should be true now, compared with what is true now?

**Teacher:** That is the controller's level-based question — compare desired
level with observed level, not chase every missed transition. We will use it
to explain both the missing load balancer and the later duplicate.
Checkpoint, Leon. One line: what question replaces "did the event arrive?"

**Listener pause: 3 seconds**

**Leon:** What should be true now versus what is true now.

### Observe, compare, act

**Teacher:** Put that level-based question into the loop's three moves. Level-based work only converges if each pass is safe to repeat. Leon,
what three moves does a reconciler repeat?

**Listener pause: 4 seconds**

**Leon:** Observe current state, compare it with declared intent, then take one
safe action to close the gap.

**Teacher:** Why one safe action instead of a long transaction?

**Listener pause: 4 seconds**

**Maya:** Because the process can fail after partial success. The next pass
must observe durable state and continue safely.

**Teacher:** Retrying that action must converge instead of duplicating
effects — that property is idempotence. Leon, why must the repeated action be
idempotent?

**Listener pause: 3 seconds**

**Leon:** Because the next pass may run the same action again after a partial
success.

**Teacher:** Where can a controller record progress that survives a restart?

**Listener pause: 4 seconds**

**Maya:** In durable API state such as status, conditions, finalizers, and an
external operation identity.

**Teacher:** Before we move on — Maya, one line. The three moves.

**Listener pause: 3 seconds**

**Maya:** Observe, compare, act once — and make that act idempotent.

### How work reaches the loop

**Teacher:** A thousand controllers cannot each hammer the API for every
object. The delivery path is capacity as much as correctness. Maya, how should they observe objects: each one polling the API
server?

**Listener pause: 3 seconds**

**Maya:** Yes. Polling gives every controller current truth on demand.

**Teacher:** What would a thousand independent polls do to the API server?

**Listener pause: 3 seconds**

**Leon:** Overload it.

**Teacher:** What client mechanism establishes initial state, watches changes,
and fills a shared cache?

**Listener pause: 3 seconds**

**Leon:** An informer, with a reflector maintaining the stream and cache.

**Teacher:** How can the reflector establish initial state before following
later changes?

**Listener pause: 4 seconds**

**Maya:** It can list current objects and then watch from a resourceVersion.
Current clients can also receive initial state through a watch stream.

**Teacher:** Do all controllers in the cluster automatically share one informer?

**Listener pause: 3 seconds**

**Leon:** Yes. SharedInformer means the cache is cluster-wide.

**Teacher:** What must actually be shared?

**Listener pause: 4 seconds**

**Leon:** [realizing] The same informer instance and collection. Separate
processes, selectors, or factories use separate streams.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: how work reaches a
controller without polling the API to death.

**Listener pause: 3 seconds**

**Maya:** An informer and reflector fill a shared cache — share the instance,
not the name.

### Queue the identity, read the level

**Teacher:** First, a recall — Leon, remind us. What three moves does the
reconciler repeat?

**Listener pause: 2 seconds**

**Leon:** Observe, compare, act once.

**Teacher:** Hold that. A burst changes our load-balancer object twenty times.
Should the handler queue twenty object payloads?

**Listener pause: 3 seconds**

**Maya:** Yes. Level-based processing still needs every version in order.

**Teacher:** What does the worker actually need to reconcile?

**Listener pause: 4 seconds**

**Leon:** The object's identity: its namespace and name.

**Teacher:** What does a common handler put on the workqueue?

**Listener pause: 3 seconds**

**Leon:** One namespace-and-name key.

**Teacher:** Where does the worker get the object state after it takes that key?

**Listener pause: 3 seconds**

**Maya:** From the local informer cache.

**Teacher:** Does that cache promise the newest global truth at every instant?

**Listener pause: 3 seconds**

**Maya:** Yes. Otherwise reconciliation would be unsafe.

**Teacher:** What weaker guarantee does it have?

**Listener pause: 4 seconds**

**Leon:** It is eventually consistent. Safe repeated reconciliation tolerates
temporary staleness.

**Teacher:** What happens to the twenty queued changes when they refer to the
same key?

**Listener pause: 3 seconds**

**Leon:** The queue deduplicates them, and the worker reads the latest cached
level it has when it runs.

**Teacher:** Checkpoint, Maya. One line: what goes on the queue, and what does
the worker read?

**Listener pause: 3 seconds**

**Maya:** A namespace-and-name key; then the latest level from the local cache.

### A broken watch is not every missed trigger

**Teacher:** Watches break. Recovery names matter, because two similar words
repair different failures. Our watch disconnects and tries to resume from
history the API server no longer retains. Two recovery words look similar and repair different failures. Is that automatically an incident?

**Listener pause: 3 seconds**

**Maya:** Yes. An expired watch position means the cache is permanently corrupt.

**Teacher:** What recovery can the reflector perform?

**Listener pause: 3 seconds**

**Leon:** Relist current objects, refill the cache, and resume watching from a
new resourceVersion.

**Teacher:** Does relisting repair an arbitrary key that a handler failed to
enqueue?

**Listener pause: 4 seconds**

**Leon:** It should. Relist and resync are the same recovery.

**Teacher:** Separate those names. What does relist repair?

**Listener pause: 3 seconds**

**Maya:** The cache after the watch cannot continue.

**Teacher:** What does a configured resync do?

**Listener pause: 4 seconds**

**Leon:** It replays objects already in the local cache through handlers. It
does not fetch a fresh list from the API.

**Teacher:** Can correctness depend on resync eventually saving a missed key?

**Listener pause: 4 seconds**

**Maya:** No. Resync is optional and can be disabled. Reliable delivery or
another explicit trigger must cause reconciliation.

**Teacher:** What other triggers can revisit the current level?

**Listener pause: 4 seconds**

**Leon:** A later event, a delayed requeue, a configured resync, or a restart.

**Teacher:** Before we move on — Leon, one line. Relist versus resync.

**Listener pause: 3 seconds**

**Leon:** Relist refills the cache from the API; resync only replays the local
cache and is optional.

### The duplicate after restart

**Teacher:** First, a recall — Maya, remind us. Where can a controller record
progress that survives a restart?

**Listener pause: 2 seconds**

**Maya:** In durable API state — status, conditions, finalizers, external
identity.

**Teacher:** Hold that. The controller finally runs. It asks the cloud
provider to create the load balancer. Creation succeeds, then the controller
crashes before it records the provider identity. Maya, what will a naive next
pass do?

**Listener pause: 4 seconds**

**Maya:** Create another one, because the API object still has no recorded
provider identity.

**Teacher:** What should it do before creating?

**Listener pause: 3 seconds**

**Leon:** Observe the provider for an existing resource.

**Teacher:** What protects the create call when the response is lost or the
process dies?

**Listener pause: 5 seconds**

**Maya:** A provider-side idempotency key derived from the object's UID and the
purpose of the operation.

**Teacher:** Why use the UID rather than only the object's reusable name?

**Listener pause: 4 seconds**

**Leon:** A deleted and recreated object gets a new UID. It must not inherit the
old object's external operation.

**Teacher:** When must the controller persist the provider identity?

**Listener pause: 3 seconds**

**Maya:** As soon as the provider returns it. In-memory success disappears on
restart.

**Teacher:** Checkpoint, Leon. One line: how do you avoid a duplicate after a
crash mid-create?

**Listener pause: 4 seconds**

**Leon:** Observe first, use a UID-based idempotency key, and persist the
provider identity immediately.

### The loop that writes itself awake

**Teacher:** We repair the duplicate, but API write volume keeps climbing. The
controller writes a fresh status timestamp on every pass. A cosmetic write can still wake the same writer forever. Leon, why does that
matter if the load balancer is unchanged?

**Listener pause: 4 seconds**

**Leon:** It should not matter. Status timestamps are cosmetic.

**Teacher:** Does the serialized API object change?

**Listener pause: 2 seconds**

**Maya:** Yes.

**Teacher:** What does that write produce?

**Listener pause: 3 seconds**

**Maya:** A watch event, which enqueues the same key.

**Teacher:** And the next reconcile does what?

**Listener pause: 3 seconds**

**Leon:** [realizing] Writes another timestamp, produces another event, and
wakes itself again. The controller has built an infinite loop through the API
server.

**Teacher:** What is the repair?

**Listener pause: 4 seconds**

**Maya:** Compare semantic state and write only when the desired stored result
actually differs. Stable list ordering matters for the same reason.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: how does an unconditional
write become a hot loop?

**Listener pause: 3 seconds**

**Maya:** Write changes the object, watch fires, queue wakes the same writer
forever.

### Read the queue before naming the cause

**Teacher:** First, a recall — Leon, remind us. What does the workqueue hold
for each object?

**Listener pause: 2 seconds**

**Leon:** A namespace-and-name key — deduplicated.

**Teacher:** Hold that. We now need evidence that distinguishes waiting work
from slow work. Maya, what does rising workqueue depth prove?

**Listener pause: 3 seconds**

**Maya:** That the reconcile function itself is slow.

**Teacher:** What does depth directly tell us?

**Listener pause: 3 seconds**

**Leon:** Work is arriving faster than it completes.

**Teacher:** Which signal confirms items are spending longer waiting for a
worker?

**Listener pause: 2 seconds**

**Maya:** Workqueue latency.

**Teacher:** Which signal says processing itself takes longer?

**Listener pause: 2 seconds**

**Leon:** Reconcile duration.

**Teacher:** Does high reconcile duration name the cause?

**Listener pause: 3 seconds**

**Leon:** No. We still compare arrival rate, worker concurrency, CPU, API and
dependency latency, and error retries.

**Teacher:** Checkpoint, Maya. One line: depth, latency, duration — what each
shows.

**Listener pause: 4 seconds**

**Maya:** Depth is backlog; latency is wait; duration is slow processing —
none alone names the root cause.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — how an informer, reflector, cache, key, and workqueue deliver work;

two — why level-based reconciliation survives missed transitions;

three — how relist differs from resync and from a reliable trigger;

four — how a crash after external creation can produce a duplicate; and

five — how an unconditional write becomes a hot loop and which signals reveal
the backlog.

**Listener pause: 35 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed
answer.

An informer uses a reflector to establish state and watch later changes into a
shared cache. A handler commonly reduces an event to a namespace-and-name key.
The workqueue deduplicates that key. A worker takes it and reads the latest
state available in the eventually consistent cache.

A level-based reconciler observes current state, compares it with intent, and
takes one idempotent action. It does not need every transition, but a lost
enqueue still needs another trigger. Relist repairs a cache when watch history
cannot continue. Resync only replays the local cache and is optional, so
correctness must not depend on it.

For an external resource, observe before create, use provider idempotency based
on the object's UID and operation purpose, and persist the provider identity as
soon as creation returns. Otherwise a restart can create an untracked duplicate.
An unconditional status write changes the object, produces a watch event,
enqueues the key, and wakes the same writer forever. Compare before writing.
Queue depth shows arrivals exceeding completions, queue latency shows waiting,
and reconcile duration shows slow processing without naming its cause.

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

After one listen, ask the learner to reconstruct the cache-to-queue path, the
external create recovery, and the hot-loop chain in ninety seconds. Score
causal ordering and boundary discrimination, not verbatim recall or learner
preference.
