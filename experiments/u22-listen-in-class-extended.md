# Listen-in classroom, extended: metrics pipeline and perishable evidence

Extended format of the u22 classroom pilot. Same facts, same cast, same
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

**Teacher:** [warm, unhurried] The client command that prints current CPU and memory
usage just failed. Your monitoring dashboards look fine. Know which path you are on before you trust a green light. Maya, what do people
conclude?

**Listener pause: 3 seconds**

**Maya:** Monitoring is broken too — same metrics path.

**Teacher:** One investigation: the evidence a node produces. First the narrow
metrics pipeline that failed while dashboards stayed green. Then a crash loop
where the proof is about to disappear. Same rule both times: know which path
you are on before you trust a green light. Leon, are those two facts — top
failed, monitoring fine — related?

**Listener pause: 3 seconds**

**Leon:** [realizing] They can be unrelated. Different paths.

**Teacher:** Checkpoint, Maya. One line: why green dashboards do not clear a
failed resource-usage client.

**Listener pause: 3 seconds**

**Maya:** Different paths — one green light does not prove the other chain.

### One narrow pipeline

**Teacher:** [curious] What does that resource-usage client command actually read —
your whole observability stack, or one path?

**Listener pause: 3 seconds**

**Maya:** [confident] Whatever the cluster uses for monitoring.

**Teacher:** [gentle] Who exposes summarised CPU and memory
usage on the node?

**Listener pause: 3 seconds**

**Leon:** The kubelet.

**Teacher:** Who collects it and serves the aggregated metrics API?

**Listener pause: 3 seconds**

**Maya:** metrics-server.

**Teacher:** Who consumes that API?

**Listener pause: 4 seconds**

**Leon:** The resource-usage client command, and resource-metric autoscaling.

**Teacher:** Are custom and external HPA metrics on that same API?

**Listener pause: 3 seconds**

**Maya:** No. Separate APIs.

**Teacher:** Is this pipeline application metrics, durable history, logs, or
control-plane health?

**Listener pause: 2 seconds**

**Leon:** None of those. Recent resource signals only.

**Teacher:** Before we move on — Leon, one line. The narrow pipeline.

**Listener pause: 3 seconds**

**Leon:** Kubelet summary, metrics-server, aggregated metrics API — recent
resource signals only.

### When the resource-usage view fails

**Teacher:** That client command fails. Trace the chain; do not open an unrelated dashboard first. Maya, do you open dashboards first?

**Listener pause: 3 seconds**

**Maya:** [confident] Yes — they will show whether metrics are broken.

**Teacher:** [gentle] Is metrics-server running?

**Listener pause: 2 seconds**

**Leon:** That is the first check.

**Teacher:** Is its aggregated API registered and available?

**Listener pause: 2 seconds**

**Maya:** Second check.

**Teacher:** Is the kubelet's summary endpoint reachable from metrics-server?

**Listener pause: 2 seconds**

**Leon:** Third.

**Teacher:** Does a healthy Prometheus prove this chain?

**Listener pause: 3 seconds**

**Maya:** [realizing] No. Separate observability path entirely.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: diagnose the failed
resource-usage client without dashboards.

**Listener pause: 3 seconds**

**Maya:** metrics-server, API registration, kubelet reachability — not
Prometheus.

### Three kinds of metric

**Teacher:** Three kinds of metric get called monitoring. Knowing which kind you need tells you whether the answer still exists later. Leon, what are
resource metrics?

**Listener pause: 3 seconds**

**Leon:** CPU and memory for Pods and Nodes.

**Teacher:** What are component metrics?

**Listener pause: 3 seconds**

**Maya:** Kubernetes internals and health.

**Teacher:** What are application metrics?

**Listener pause: 2 seconds**

**Leon:** Whatever the workload emits.

**Teacher:** Do their collection and retention paths match?

**Listener pause: 3 seconds**

**Maya:** No. Knowing which kind you need tells you where to look — and whether
the answer still exists an hour later.

**Teacher:** Checkpoint, Leon. One line: three kinds of metric.

**Listener pause: 3 seconds**

**Leon:** Resource, component, application — different paths and retention.

### Preserve the perishable first

**Teacher:** Crash loop. Maya, what do you do first — restart clean,
or read?

**Listener pause: 3 seconds**

**Maya:** [confident] Restart clean so you get a fresh failure you can watch.

**Teacher:** [gentle] What do you read first on
the object?

**Listener pause: 4 seconds**

**Leon:** Status, conditions, and events.

**Teacher:** Then which logs, and which termination fields?

**Listener pause: 4 seconds**

**Maya:** Current and previous container logs, and the termination state —
lastState.

**Teacher:** When do you use exec, and when an ephemeral debug container?

**Listener pause: 4 seconds**

**Leon:** Exec if the image has tools. Ephemeral debug if it does not.

**Teacher:** When do node journals and crictl come in?

**Listener pause: 4 seconds**

**Maya:** Only when the kubelet or API path is unavailable.

**Teacher:** What does restarting early do to the context you needed?

**Listener pause: 2 seconds**

**Leon:** Erases it.

**Teacher:** Before we move on — Maya, one line. Perishability order in a crash
loop.

**Listener pause: 3 seconds**

**Maya:** Status, events, logs, and lastState before any restart.

### No shell in the image

**Teacher:** The image is distroless — no shell. Distroless is not a dead end for object evidence. Maya, is that a dead end?

**Listener pause: 3 seconds**

**Maya:** [confident] Without exec you cannot debug it.

**Teacher:** [gentle] What evidence does not need a shell?

**Listener pause: 5 seconds**

**Leon:** [deliberate] Describe it and read events. Current and previous logs.
Termination reason and exit code.

**Teacher:** Then what do you attach or run?

**Listener pause: 3 seconds**

**Maya:** An ephemeral debug container, or a debug copy with the tools you
need.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: distroless is not a dead
end.

**Listener pause: 3 seconds**

**Leon:** Object evidence first — then ephemeral debug with the tools you need.

### When crictl earns its place

**Teacher:** First, a recall — Maya, remind us. When do node journals and
crictl come in during a crash loop?

**Listener pause: 2 seconds**

**Maya:** Only when the kubelet or API path is unavailable.

**Teacher:** Hold that. Leon, what does crictl talk to?

**Listener pause: 3 seconds**

**Leon:** The container runtime, through the CRI socket.

**Teacher:** When is that the right tool?

**Listener pause: 4 seconds**

**Maya:** When the kubelet or the API path is unavailable and the client can
tell you nothing.

**Teacher:** Is it a replacement for the API client while the API is healthy?

**Listener pause: 3 seconds**

**Leon:** [realizing] No. Reaching for it then usually means looking in the
wrong place.

**Teacher:** Checkpoint, Maya. One line: when crictl earns its place.

**Listener pause: 3 seconds**

**Maya:** When kubelet or API evidence is unavailable — not while the API is
healthy.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — the narrow pipeline from kubelet through metrics-server to resource
consumers, and what it is not;

two — how you diagnose a failed resource-usage client command without trusting
unrelated dashboards;

three — three kinds of metric and why retention differs;

four — perishability order in a crash loop, including lastState and previous
logs; and

five — distroless debugging and when crictl earns its place.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

The resource-usage client reads one path: kubelet summary, metrics-server,
aggregated metrics API, then that client and resource-metric autoscaling.
Custom and external HPA metrics are separate. It is not application metrics,
history, logs, or control-plane health. When it fails, test metrics-server,
API registration, and kubelet reachability — not Prometheus. Resource,
component, and application metrics are different questions with different
retention.

In a crash loop, read status, conditions, events, current and previous logs,
and lastState before you restart. Exec if tools exist; ephemeral debug if not.
Node journals and crictl when the kubelet or the API path is unavailable. Distroless is not a
dead end: object evidence first, then ephemeral debug. crictl is runtime
evidence below a broken kubelet or API path, not a substitute while normal
API evidence is healthy.
Gather the evidence before you destroy the thing holding it.

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
