# Listen-in classroom pilot: start at the nearest authority

This is the classroom-dialogue version of Module 20. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students are not scripted as answer dispensers: they hesitate,
compress too early, and make plausible mistakes which expose the mechanism.

Factual authority remains `assets/cka-deep-content.js`, unit `u20`, plus its
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

**Teacher:** [warm, unhurried] The cluster looks broken. Your usual client cannot
talk to the API. Maya, where do people reach first?

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

### Above the line, below the line

**Teacher:** [curious] If the API responds, what three kinds of evidence do you
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

### Descending a control-plane node

**Teacher:** One unhealthy control-plane node. Do you start inside the node or
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

### What separates a NotReady node

**Teacher:** A worker is NotReady. Leon, what does the node's Lease show you?

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

### Ninety seconds on NotReady

**Teacher:** Compact version. Maya, what do you inspect on the object first?

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

### Phase names the state, events name the attempt

**Teacher:** For workloads: what does phase name?

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

### The log you actually need

**Teacher:** A container restarts too fast to inspect. Maya, which logs do you
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

### It resolves, it still fails

**Teacher:** A Service name resolves but connections fail. Maya, has DNS proved
the Service works?

**Listener pause: 3 seconds**

**Maya:** [confident] Resolution works, so the Service path is fine — look at
the app.

**Teacher:** [gentle] DNS proved exactly one thing. What?

**Listener pause: 2 seconds**

**Leon:** Name resolution.

**Teacher:** After that, in order, what do you check?

**Listener pause: 6 seconds**

**Leon:** Selection, then raw backend reachability, then translation, then
policy, then whether the process is listening at all.

**Teacher:** Does any step prove the next?

**Listener pause: 2 seconds**

**Maya:** No. Each rules out one layer.

### The algorithm underneath

**Teacher:** Underneath all of it is one algorithm. Leon, what do you state
first?

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
for the expository Module 20. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
