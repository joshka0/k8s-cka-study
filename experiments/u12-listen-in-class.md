# Listen-in classroom pilot: fairness, evidence, and the spine

This is the classroom-dialogue version of Module 12. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students are not scripted as answer dispensers: they hesitate,
compress too early, and make plausible mistakes which expose the mechanism.

Factual authority remains `assets/content.js`, unit `u12`, plus its reviewed
upstream sources. This is an audio script, not a video script.

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

**Teacher:** [warm, unhurried] The cluster is slow and every dashboard is green. Maya,
what do people do?

**Listener pause: 3 seconds**

**Maya:** Add nodes — or restart the API server.

**Teacher:** One investigation: protect the API when too many requests arrive,
then choose evidence that proves a layer. Priority and Fairness first, then
the evidence hierarchy, then the spine as method. Leon, what is the outcome we
want?

**Listener pause: 3 seconds**

**Leon:** Isolate a layer instead of guessing at one.

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

### Blast radius, not fairness

**Teacher:** What does shuffle sharding bound?

**Listener pause: 4 seconds**

**Leon:** How many queues any one flow shares with others.

**Teacher:** Is it repairing a pathological client?

**Listener pause: 3 seconds**

**Maya:** [confident] Yes — that is fairness.

**Teacher:** [gentle] Blast-radius control. What does it only limit?

**Listener pause: 3 seconds**

**Leon:** [realizing] How many other flows that client can hurt.

**Teacher:** Containing damage and fixing a cause — same achievement?

**Listener pause: 2 seconds**

**Maya:** No.

### Contained is not fixed

**Teacher:** A controller floods the API server. Priority and fairness protects
the server. Has the controller stopped looping?

**Listener pause: 3 seconds**

**Maya:** [uncertain] Once it is throttled, the loop is solved.

**Teacher:** [gentle] Does it repair the list behaviour generating the load?

**Listener pause: 2 seconds**

**Leon:** No.

**Teacher:** Say both halves of a complete answer.

**Listener pause: 4 seconds**

**Maya:** Contain the damage, then go and fix the loop.

### Why informers exist at all

**Teacher:** What does repeated listing, reconnecting, or huge objects do to
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

### No single source is truth

**Teacher:** Are events ground truth?

**Listener pause: 3 seconds**

**Maya:** [confident] They are the cluster's history of what happened.

**Teacher:** [gentle] Lossy hints. What about logs?

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

### The object is the contract

**Teacher:** When events, logs, and metrics disagree with the object, what does
the system act on?

**Listener pause: 3 seconds**

**Maya:** The object.

**Teacher:** Why are the others incomplete about intent?

**Listener pause: 4 seconds**

**Leon:** Events expire and were lossy. Logs may be on another component.
Metrics averaged the case away.

### Who deleted it

**Teacher:** Who deleted this object, and when — where do you reach?

**Listener pause: 3 seconds**

**Leon:** The audit log — requests, stages, identity.

**Teacher:** Will events still have it?

**Listener pause: 3 seconds**

**Maya:** Often not — expired, or never recorded.

**Teacher:** If audit was never enabled, or aged out?

**Listener pause: 3 seconds**

**Leon:** [realizing] The honest answer is the information no longer exists.

### Which layer is slow

**Teacher:** For a slow control plane, name signals tied to boundaries.

**Listener pause: 5 seconds**

**Maya:** Request latency at the API server. Storage latency underneath. Watch
and cache behaviour. Work queue depth in a controller.

**Teacher:** Does raw Pod count tell you where the time is going?

**Listener pause: 2 seconds**

**Leon:** No. Only that the cluster is big.

### The spine is the method

**Teacher:** Is the spine a diagram to memorise?

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

### The ninety-second answer

**Teacher:** Clients declare intent through a policy-enforcing API. Where is it
persisted?

**Listener pause: 2 seconds**

**Maya:** etcd.

**Teacher:** Who reconciles objects? Who binds Pods?

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
for the expository Module 12. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
