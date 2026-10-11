# Listen-in classroom, extended: fairness, evidence, and the spine

Extended format of the u12 classroom pilot. Same facts, same cast, same
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

**Teacher:** [warm, unhurried] The cluster is slow and every dashboard is green. Guessing at nodes or restarting the API is how people make the outage worse.

Maya, what do people do?

**Listener pause: 3 seconds**

**Maya:** Add nodes — or restart the API server.

**Teacher:** One investigation: protect the API when too many requests arrive,
then choose evidence that proves a layer. Priority and Fairness first, then
the evidence hierarchy, then the spine as method. Leon, what is the outcome we
want?

**Listener pause: 3 seconds**

**Leon:** Isolate a layer instead of guessing at one.

**Teacher:** Checkpoint, Maya. One line: what outcome replaces guessing.

**Listener pause: 3 seconds**

**Maya:** Isolate a layer with evidence — not add capacity on a hunch.

### Concurrency has to be allocated

**Teacher:** [curious] Can an API server handle unlimited concurrent requests?

**Listener pause: 2 seconds**

**Leon:** No. Capacity is finite.

**Teacher:** Should that capacity go to whoever shouts loudest?

**Listener pause: 2 seconds**

**Maya:** No — it has to be allocated deliberately.

**Teacher:** What do FlowSchemas classify requests by?

**Listener pause: 5 seconds**

**Leon:** Attributes such as user, verb, resource, API group, and namespace.

**Teacher:** Where do they sort those requests?

**Listener pause: 2 seconds**

**Maya:** Into priority levels.

**Teacher:** What do limited levels then use?

**Listener pause: 3 seconds**

**Leon:** Queues and concurrency seats — so one noisy client cannot take the
whole server.

**Teacher:** Before we move on — Leon, one line. Why allocate concurrency at
all?

**Listener pause: 3 seconds**

**Leon:** Capacity is finite — seats and queues keep one client from taking it
all.

### Classify here, serve there

**Teacher:** Two objects, two jobs. What does the FlowSchema decide?

**Listener pause: 3 seconds**

**Maya:** Which bucket a request belongs to.

**Teacher:** What does the PriorityLevelConfiguration decide?

**Listener pause: 4 seconds**

**Leon:** How that bucket is served — how many seats, and whether it queues or
is rejected.

**Teacher:** Why are they separate objects?

**Listener pause: 3 seconds**

**Maya:** Classification and execution policy are different decisions.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: FlowSchema versus
PriorityLevelConfiguration.

**Listener pause: 3 seconds**

**Maya:** FlowSchema classifies; PriorityLevelConfiguration sets seats and
queue-or-reject.

### Blast radius, not fairness

**Teacher:** Containing damage is not repairing the client. What does shuffle sharding bound?

**Listener pause: 4 seconds**

**Leon:** How many queues any one flow shares with others.

**Teacher:** Is it repairing a pathological client?

**Listener pause: 3 seconds**

**Maya:** [confident] Yes — that is fairness.

**Teacher:** [gentle] What does it only limit?

**Listener pause: 3 seconds**

**Leon:** [realizing] How many other flows that client can hurt.

**Teacher:** Containing damage and fixing a cause — same achievement?

**Listener pause: 2 seconds**

**Maya:** No.

**Teacher:** Checkpoint, Leon. One line: what shuffle sharding does and does
not do.

**Listener pause: 3 seconds**

**Leon:** Bounds shared queues — blast radius, not a repair of the bad client.

### Contained is not fixed

**Teacher:** First, a recall — Maya, remind us. What does Priority and Fairness
protect?

**Listener pause: 2 seconds**

**Maya:** The API server — seats and queues for concurrent requests.

**Teacher:** Hold that. A controller floods the API server. Priority and
fairness protects the server. Has the controller stopped looping?

**Listener pause: 3 seconds**

**Maya:** [uncertain] Once it is throttled, the loop is solved.

**Teacher:** [gentle] Does it repair the list behaviour generating the load?

**Listener pause: 2 seconds**

**Leon:** No.

**Teacher:** Say both halves of a complete answer.

**Listener pause: 4 seconds**

**Maya:** Contain the damage, then go and fix the loop.

**Teacher:** Before we move on — Leon, one line. Contained versus fixed.

**Listener pause: 3 seconds**

**Leon:** Throttling protects the server; the looping client still needs a fix.

### Why informers exist at all

**Teacher:** Shared watches are capacity as much as correctness. What does repeated listing, reconnecting, or huge objects do to
the API server and etcd?

**Listener pause: 3 seconds**

**Leon:** Amplifies load.

**Teacher:** What do informers share across controllers?

**Listener pause: 3 seconds**

**Maya:** List and watch caches — many pollers become one watch.

**Teacher:** Reconciliation frames that as correctness. What is the framing
here?

**Listener pause: 2 seconds**

**Leon:** Capacity.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: why informers exist here.

**Listener pause: 3 seconds**

**Maya:** Shared list-watch caches turn many pollers into one watch — capacity.

### No single source is truth

**Teacher:** Each evidence source is partial by design. Are events ground truth?

**Listener pause: 3 seconds**

**Maya:** [confident] They are the cluster's history of what happened.

**Teacher:** [gentle] What about logs?

**Listener pause: 3 seconds**

**Leon:** Component-local unless you ship them.

**Teacher:** Metrics?

**Listener pause: 3 seconds**

**Maya:** Already aggregated — the individual case is gone.

**Teacher:** Audit?

**Listener pause: 3 seconds**

**Leon:** API activity and identity.

**Teacher:** Traces?

**Listener pause: 2 seconds**

**Maya:** Connect one request path.

**Teacher:** Object state?

**Listener pause: 3 seconds**

**Leon:** Authoritative for what the API currently believes.

**Teacher:** Checkpoint, Leon. One line: which source is authoritative for
current intent?

**Listener pause: 3 seconds**

**Leon:** Object state — the others are partial or lossy.

### The object is the contract

**Teacher:** On disagreement, the system acts on the object. When events, logs, and metrics disagree with the object, what does
the system act on?

**Listener pause: 3 seconds**

**Maya:** The object.

**Teacher:** Why are the others incomplete about intent?

**Listener pause: 4 seconds**

**Leon:** Events expire and were lossy. Logs may be on another component.
Metrics averaged the case away.

**Teacher:** Before we move on — Maya, one line. On disagreement, who wins?

**Listener pause: 3 seconds**

**Maya:** The object — the system acts on what the API currently believes.

### Who deleted it

**Teacher:** Who-and-when lives in audit if it lives at all. Who deleted this object, and when — where do you reach?

**Listener pause: 3 seconds**

**Leon:** The audit log — requests, stages, identity.

**Teacher:** Will events still have it?

**Listener pause: 3 seconds**

**Maya:** Often not — expired, or never recorded.

**Teacher:** If audit was never enabled, or aged out?

**Listener pause: 3 seconds**

**Leon:** [realizing] The honest answer is the information no longer exists.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: who-and-when evidence.

**Listener pause: 3 seconds**

**Leon:** Audit holds identity if enabled — without it, the answer is gone.

### Which layer is slow

**Teacher:** For a slow control plane, name signals tied to boundaries. Layer-tied signals beat raw size metrics.

**Listener pause: 5 seconds**

**Maya:** Request latency at the API server. Storage latency underneath. Watch
and cache behaviour. Work queue depth in a controller.

**Teacher:** Does raw Pod count tell you where the time is going?

**Listener pause: 2 seconds**

**Leon:** No. Only that the cluster is big.

**Teacher:** Checkpoint, Maya. One line: layer-tied slow signals.

**Listener pause: 3 seconds**

**Maya:** API request latency, storage latency, watch and cache, work queues —
not Pod count.

### The spine is the method

**Teacher:** The spine is a walkable path, not a diagram to memorize. Is the spine a diagram to memorise?

**Listener pause: 2 seconds**

**Maya:** People treat it that way.

**Teacher:** What is it actually?

**Listener pause: 4 seconds**

**Leon:** A path any symptom can be walked along.

**Teacher:** Sketch the path — intent through reachability.

**Listener pause: 7 seconds**

**Maya:** Intent arrives and is admitted. Stored. Something watches, reconciles,
schedules. Kubelet acts. Runtime, network, storage. Endpoints, Service, DNS.

**Teacher:** Where does every failure have a home?

**Listener pause: 2 seconds**

**Leon:** Often one segment. Start there; if evidence disagrees, walk the
neighbour.

**Teacher:** Before we move on — Leon, one line. What is the spine for?

**Listener pause: 3 seconds**

**Leon:** A walkable path to locate which segment owns the failure.

### The ninety-second answer

**Teacher:** First, a recall — Maya, remind us. Where is admitted intent
persisted?

**Listener pause: 2 seconds**

**Maya:** etcd.

**Teacher:** Hold that. Who reconciles objects? Who binds Pods?

**Listener pause: 3 seconds**

**Leon:** Controllers reconcile. The scheduler binds.

**Teacher:** What do kubelets coordinate?

**Listener pause: 3 seconds**

**Maya:** Runtime, networking, and storage.

**Teacher:** What expose ready endpoints?

**Listener pause: 2 seconds**

**Leon:** Services and DNS.

**Teacher:** Every stage — synchronous or asynchronous, observable, retryable?

**Listener pause: 3 seconds**

**Maya:** Asynchronous, observable, and retryable.

**Teacher:** Protected by what four ideas?

**Listener pause: 4 seconds**

**Leon:** Ownership, quorum, flow control, and recovery.

**Teacher:** Checkpoint, Maya. One line: the architecture in four protectors.

**Listener pause: 3 seconds**

**Maya:** Ownership, quorum, flow control, and recovery — around an async,
observable, retryable path.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — FlowSchema versus PriorityLevelConfiguration, and what shuffle sharding
does not fix;

two — contained versus fixed when a controller floods;

three — the evidence hierarchy and when the object wins;

four — audit for who-and-when, and layer-tied slow signals; and

five — the spine as method and the ninety-second architecture answer.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

API concurrency is finite. FlowSchemas classify by attributes into priority
levels; PriorityLevelConfiguration sets seats and queue-or-reject. Shuffle
sharding bounds shared queues — blast radius, not a fix for a bad client.
Priority and fairness protects the server; you still fix the looping
controller. Informers share watches for capacity. Events are lossy; logs are
local; metrics aggregate; audit holds identity; traces one path; object state
is authoritative for current intent. On disagreement, the system acts on the
object. Who deleted it lives in audit if enabled. Slow control plane: request
latency, storage latency, watch and cache, work queues — not Pod count. Walk
the spine: admit, store, watch, reconcile, schedule, kubelet, runtime network
storage, endpoints Service DNS. Ninety seconds: intent through API into etcd;
controllers and scheduler; kubelets; Services and DNS; async observable
retryable; ownership, quorum, flow control, recovery.

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
