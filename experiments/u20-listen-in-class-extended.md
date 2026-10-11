# Listen-in classroom, extended: start at the nearest authority

Extended format of the u20 classroom pilot. Same facts, same cast, same
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

**Teacher:** [warm, unhurried] The cluster looks broken. Your usual client cannot
talk to the API. Start where something still answers, not where your habits want to start. Maya, where do people reach first?

**Listener pause: 3 seconds**

**Maya:** More client commands — status, describe, get events — harder.

**Teacher:** One investigation: a procedure that still works when the usual
tools do not. We start where something still answers, descend when the API is
silent, then apply the same method to nodes, workloads, and Services. Leon,
why can the client not diagnose the API server that makes the client work?

**Listener pause: 4 seconds**

**Leon:** [thinking aloud] Because... the client needs that server to answer at
all?

**Teacher:** Exactly. Start at the nearest authority that is still answering.
Checkpoint, Maya. One line: where diagnosis begins when tools fail.

**Listener pause: 3 seconds**

**Maya:** At the nearest authority still answering — not harder client commands.

### Above the line, below the line

**Teacher:** [curious] The client is useless below the Kubernetes line. If the API responds, what three kinds of evidence do you
use first?

**Listener pause: 4 seconds**

**Maya:** Object status, events, and component health endpoints.

**Teacher:** If it does not respond, do you stay in the API?

**Listener pause: 2 seconds**

**Leon:** No. Move below Kubernetes.

**Teacher:** Name host-level places you go next.

**Listener pause: 6 seconds**

**Leon:** [deliberate] The load balancer, if there is one. Static Pod manifests.
The kubelet service. The runtime. Certificates. Sockets and host resources.

**Teacher:** Is the client useful below that line?

**Listener pause: 2 seconds**

**Maya:** No. It has nothing left to talk to down there.

**Teacher:** Before we move on — Leon, one line. Above the line versus below.

**Listener pause: 3 seconds**

**Leon:** API responds: status, events, health. API silent: host path — client
is useless there.

### Descending a control-plane node

**Teacher:** One unhealthy control-plane node. Outside in, and preserve evidence before any restart. Do you start inside the node or
outside in?

**Listener pause: 3 seconds**

**Maya:** [confident] Inside — kubelet and static Pods first.

**Teacher:** [gentle] Outside in. If an API load balancer exists, what do you
confirm first?

**Listener pause: 3 seconds**

**Leon:** What the load balancer thinks is healthy.

**Teacher:** Then what do you locate?

**Listener pause: 3 seconds**

**Maya:** Which boundary is actually failing.

**Teacher:** Then you descend into the node. What do you read before you restart
anything?

**Listener pause: 4 seconds**

**Leon:** Static Pod manifests, the kubelet, the runtime, certificates — and
you preserve evidence first.

**Teacher:** Why preserve before restart?

**Listener pause: 3 seconds**

**Maya:** A restart destroys the state that would have told you why.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: control-plane descent
order.

**Listener pause: 3 seconds**

**Maya:** Outside in — load balancer, failing boundary, then node evidence
before any restart.

### What separates a NotReady node

**Teacher:** A worker is NotReady. Heartbeat, symptoms, and owner are three different questions. Leon, what does the node's Lease show you?

**Listener pause: 4 seconds**

**Leon:** [uncertain] Whether the node object exists?

**Teacher:** Whether heartbeats are still arriving at all. What do the node's
conditions name?

**Listener pause: 3 seconds**

**Maya:** Pressure and network symptoms — what it reports.

**Teacher:** Where do you go for why?

**Listener pause: 4 seconds**

**Leon:** Kubelet, runtime, and network-plugin evidence.

**Teacher:** How many different questions is that?

**Listener pause: 2 seconds**

**Maya:** Three. Heartbeat, symptoms, owner.

**Teacher:** What does answering them in that order stop you doing?

**Listener pause: 2 seconds**

**Leon:** Restarting the wrong thing.

**Teacher:** Checkpoint, Leon. One line: three NotReady questions in order.

**Listener pause: 3 seconds**

**Leon:** Heartbeat on the Lease, conditions for symptoms, then component
evidence for why.

### Ninety seconds on NotReady

**Teacher:** First, a recall — Maya, remind us. What three questions separate a
NotReady node?

**Listener pause: 2 seconds**

**Maya:** Heartbeat, symptoms, and owner evidence.

**Teacher:** Hold that. Compact version. Maya, what do you inspect on the
object first?

**Listener pause: 4 seconds**

**Maya:** Conditions, taints, and the Lease.

**Teacher:** On the host — reachability, and one thing people skip that produces
certificate failures that look like something else. What is it?

**Listener pause: 3 seconds**

**Leon:** [realizing] The clock.

**Teacher:** Then what on the kubelet?

**Listener pause: 3 seconds**

**Maya:** Certificate and configuration errors.

**Teacher:** Then what two node components?

**Listener pause: 3 seconds**

**Leon:** The runtime and the network plugin.

**Teacher:** Last rule before any restart?

**Listener pause: 2 seconds**

**Maya:** Preserve evidence.

**Teacher:** Before we move on — Leon, one line. Compact NotReady host check.

**Listener pause: 3 seconds**

**Leon:** Reachability and clock, then kubelet certs, runtime, network plugin —
preserve first.

### Phase names the state, events name the attempt

**Teacher:** Waiting reasons are not extra phases. For workloads: what does phase name?

**Listener pause: 2 seconds**

**Leon:** The Pod's state.

**Teacher:** What do events name?

**Listener pause: 2 seconds**

**Maya:** What was attempted.

**Teacher:** Pending points at which kinds of owners?

**Listener pause: 4 seconds**

**Leon:** [working it out] Admission, quota, scheduling, or claims.

**Teacher:** A Pod is Running or Pending with waiting reason ContainerCreating.
Where do you look?

**Listener pause: 4 seconds**

**Maya:** Image, sandbox, network, or mounts.

**Teacher:** CrashLoopBackOff — is that a phase?

**Listener pause: 3 seconds**

**Leon:** [uncertain] Yes — a fifth phase.

**Teacher:** [gentle] It is a waiting reason for a container that keeps failing
under the restart policy. Running but not Ready points where?

**Listener pause: 4 seconds**

**Maya:** Readiness, a dependency, or endpoint selection.

**Teacher:** Four different places to look. Do you call them four phases?

**Listener pause: 2 seconds**

**Leon:** No.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: phase versus events.

**Listener pause: 3 seconds**

**Maya:** Phase names state; events name attempts — waiting reasons are not
extra phases.

### The log you actually need

**Teacher:** A container restarts too fast to inspect. Previous logs are perishable evidence. Maya, which logs do you
try while they still exist?

**Listener pause: 3 seconds**

**Maya:** The previous container's logs — same Pod identity.

**Teacher:** Are those logs always still there?

**Listener pause: 3 seconds**

**Leon:** Only until the runtime garbage-collects them.

**Teacher:** What field holds exit code, signal, and OOMKilled?

**Listener pause: 3 seconds**

**Maya:** lastState.

**Teacher:** What separates a probe-driven restart from a process exit?

**Listener pause: 4 seconds**

**Leon:** [realizing] Events for probe failures — lastState alone can look like
a signal either way.

**Teacher:** Checkpoint, Leon. One line: perishable crash-loop evidence.

**Listener pause: 3 seconds**

**Leon:** Previous logs and lastState while they last — plus events for probe
kills.

### It resolves, it still fails

**Teacher:** A Service name resolves but connections fail. DNS proved exactly one layer. Maya, has DNS proved
the Service works?

**Listener pause: 3 seconds**

**Maya:** [confident] Resolution works, so the Service path is fine — look at
the app.

**Teacher:** [gentle] What?

**Listener pause: 2 seconds**

**Leon:** Name resolution.

**Teacher:** After that, in order, what do you check?

**Listener pause: 6 seconds**

**Leon:** Selection, then raw backend reachability, then translation, then
policy, then whether the process is listening at all.

**Teacher:** Does any step prove the next?

**Listener pause: 2 seconds**

**Maya:** No. Each rules out one layer.

**Teacher:** Before we move on — Maya, one line. What DNS success does not
prove.

**Listener pause: 3 seconds**

**Maya:** That selection, translation, policy, or the listener work.

### The algorithm underneath

**Teacher:** First, a recall — Leon, remind us. Where do you start when the API
is silent?

**Listener pause: 2 seconds**

**Leon:** Below Kubernetes — load balancer, static Pods, kubelet, host.

**Teacher:** Hold that. Underneath all of it is one algorithm. Leon, what do you
state first?

**Listener pause: 4 seconds**

**Leon:** The transition I expected, and what I actually observe.

**Teacher:** Second?

**Listener pause: 3 seconds**

**Maya:** Which component owns that transition.

**Teacher:** Third?

**Listener pause: 3 seconds**

**Leon:** Read status, events, and logs at that boundary — and nowhere else.

**Teacher:** Fourth?

**Listener pause: 3 seconds**

**Maya:** Compare against one adjacent layer that is healthy.

**Teacher:** Fifth?

**Listener pause: 3 seconds**

**Leon:** Change one thing, and verify it.

**Teacher:** What is every segment of the request path good for?

**Listener pause: 3 seconds**

**Maya:** Answering step two quickly — who owns this transition.

**Teacher:** Checkpoint, Maya. One line: the five-step algorithm.

**Listener pause: 4 seconds**

**Maya:** Expected versus observed, owner, evidence at that boundary, healthy
neighbour, one change and verify.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — nearest authority when the API answers versus when it does not;

two — outside-in order on an unhealthy control-plane node, and why preserve
before restart;

three — Lease, conditions, and component evidence on a NotReady node;

four — phase versus events versus waiting reasons, and previous logs with
lastState; and

five — the five-step algorithm under every diagnosis.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

Start at the nearest authority still answering. If the API responds, use
status, events, and health endpoints. If not, move below Kubernetes: load
balancer, static Pods, kubelet, runtime, certificates, host. The client cannot
diagnose the API that powers it. Control plane: outside in, preserve evidence
before restart. NotReady: Lease for heartbeats, conditions for symptoms,
kubelet runtime and network plugin for why — clock included. Phase names
state; events name attempts. Pending, ContainerCreating, CrashLoopBackOff, and
not-Ready are different places to look, not four phases. Previous logs and
lastState separate exit, signal, OOMKilled, and probe restarts while evidence
lasts. DNS success is only resolution. Then selection, backend, translation,
policy, listener. Algorithm: expected versus observed, owner, evidence at that
boundary, healthy adjacent layer, one change and verify.

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
