# Listen-in classroom, extended: Running is not Ready

Extended format of the u07 classroom pilot. Same facts, same cast, same
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

**Teacher:** [warm, unhurried] A Pod says Running, and it is serving nothing.
The phase is the most common false comfort on a node. Phase is the most common false comfort on a node. Maya, what do people
conclude from the phase?

**Listener pause: 3 seconds**

**Maya:** The app is up — Running means healthy enough to take traffic.

**Teacher:** One investigation: the node after a name is written. We build how
the kubelet actually works, then what Running is not, then which probe gates
what — and finish with status that can freeze while the node is dark. Leon,
what segment of the path are we on?

**Listener pause: 2 seconds**

**Leon:** The kubelet — on the node, not the control plane.

**Teacher:** Checkpoint, Maya. One line: what Running does not prove.

**Listener pause: 3 seconds**

**Maya:** That the app is healthy or taking traffic.

### A loop, not an inbox

**Teacher:** [curious] Who tells the kubelet to start a Pod — a command from the
scheduler, or something else?

**Listener pause: 3 seconds**

**Leon:** [uncertain] The scheduler dispatches it once nodeName is set.

**Teacher:** [gentle] What does it watch?

**Listener pause: 3 seconds**

**Maya:** The API — Pods assigned to its node.

**Teacher:** What shape is that loop?

**Listener pause: 3 seconds**

**Leon:** The same reconcile shape as any controller — on the node instead of
the control plane.

**Teacher:** Name things it coordinates toward the state those objects describe.

**Listener pause: 5 seconds**

**Maya:** Runtime, network, storage, secrets, probes, and the status it reports
back.

**Teacher:** Before we move on — Leon, one line. How does the kubelet get work?

**Listener pause: 3 seconds**

**Leon:** It watches the API for Pods on its node — nobody dispatches it.

### The order on the node

**Teacher:** Volumes can run alongside other setup; containers wait on both prerequisites. Once a Pod is bound, is node setup one fixed sequence?

**Listener pause: 3 seconds**

**Maya:** [confident] Sandbox, then network, then volumes, then inits, then
app — always that chain.

**Teacher:** [gentle] What two things
must both be ready before any container starts?

**Listener pause: 4 seconds**

**Leon:** The sandbox network, and the required volumes.

**Teacher:** What runs next, and how?

**Listener pause: 3 seconds**

**Maya:** Init containers — to completion, in order.

**Teacher:** Then?

**Listener pause: 2 seconds**

**Leon:** Application containers start.

**Teacher:** Why does the sandbox come first among the network pieces?

**Listener pause: 3 seconds**

**Maya:** It anchors the Pod's network namespace.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: prerequisites before app
containers.

**Listener pause: 3 seconds**

**Maya:** Sandbox network and required volumes ready; then inits in order;
then app containers.

### What the sandbox is for

**Teacher:** The sandbox is not decoration — it is the shared place the Pod
lives. The sandbox is the shared place the Pod lives. On a typical Linux runtime, what do containers in the Pod share through
that namespace?

**Listener pause: 3 seconds**

**Leon:** Network — so they can reach each other on localhost.

**Teacher:** When is networking configured relative to application containers?

**Listener pause: 3 seconds**

**Maya:** Before any application container exists.

**Teacher:** If that initial setup fails, do application containers start?

**Listener pause: 3 seconds**

**Leon:** No. The Pod sits in ContainerCreating.

**Teacher:** Can a running Pod still lose its network later?

**Listener pause: 2 seconds**

**Maya:** Yes — that is a separate later case.

**Teacher:** Checkpoint, Leon. One line: what the sandbox anchors, and when.

**Listener pause: 3 seconds**

**Leon:** The shared network namespace — configured before any app container
exists.

### Four contracts, not one runtime

**Teacher:** People collapse four acronyms into the word runtime. Four acronyms collapse into one word if you let them. Leon, what is
CRI?

**Listener pause: 4 seconds**

**Leon:** [thinking aloud] The runtime itself... containerd?

**Teacher:** The gRPC contract between the kubelet and a runtime like
containerd. That contract is CRI. Maya, what does CRI connect?

**Listener pause: 3 seconds**

**Maya:** The kubelet to the runtime — runtime service and image service.

**Teacher:** What does OCI specify?

**Listener pause: 3 seconds**

**Maya:** Lower-level image and runtime primitives underneath.

**Teacher:** What does CNI attach?

**Listener pause: 2 seconds**

**Leon:** Pod networking.

**Teacher:** What does CSI handle?

**Listener pause: 2 seconds**

**Maya:** Storage.

**Teacher:** Where do you usually see CRI and CSI call failures?

**Listener pause: 3 seconds**

**Leon:** Pod events and kubelet logs.

**Teacher:** Where is sandbox, CNI, and OCI detail more often?

**Listener pause: 3 seconds**

**Maya:** Runtime logs.

**Teacher:** Before we move on — Leon, one line. Four contracts, four jobs.

**Listener pause: 3 seconds**

**Leon:** CRI to runtime, OCI underneath, CNI networking, CSI storage.

### The kubelet never calls runc

**Teacher:** First, a recall — Maya, remind us. What is CRI?

**Listener pause: 2 seconds**

**Maya:** The gRPC contract between kubelet and the runtime.

**Teacher:** Hold that. For container and image operations, what does the
kubelet use?

**Listener pause: 3 seconds**

**Maya:** CRI only — runtime service and image service, both gRPC.

**Teacher:** Does it call runc?

**Listener pause: 2 seconds**

**Leon:** No.

**Teacher:** Who receives the CRI call and invokes an OCI runtime below that
boundary?

**Listener pause: 3 seconds**

**Maya:** containerd — then namespaces and cgroups form underneath.

**Teacher:** The kubelet does talk to other things — API server, CSI, device
plugins. Does it talk to the OCI layer?

**Listener pause: 2 seconds**

**Leon:** Never.

**Teacher:** Checkpoint, Maya. One line: how far down the kubelet reaches for
containers.

**Listener pause: 3 seconds**

**Maya:** Only to CRI — never to runc or the OCI layer.

### Phase is not health

**Teacher:** Running and Ready answer different questions. What does the phase Running mean?

**Listener pause: 4 seconds**

**Maya:** [confident] Bound, healthy, and taking traffic.

**Teacher:** [gentle] Does that prove the application is healthy?

**Listener pause: 2 seconds**

**Leon:** No.

**Teacher:** What is Ready — the same signal, or separate?

**Listener pause: 3 seconds**

**Maya:** Separate. Configured checks and readiness gates pass so matching
Services can use the Pod.

**Teacher:** Different mechanisms. Different questions?

**Listener pause: 2 seconds**

**Leon:** Yes.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: Running versus Ready.

**Listener pause: 3 seconds**

**Leon:** Running is phase; Ready is checks and gates for Service traffic.

### Three probes, three jobs

**Teacher:** Three probes, three different jobs — do not collapse them. Do not collapse three probes into one job. What
does a startup probe gate?

**Listener pause: 4 seconds**

**Maya:** Liveness and readiness for the same container while a slow app
initialises.

**Teacher:** While failures are still inside the probe's threshold, does the
container keep running?

**Listener pause: 2 seconds**

**Leon:** Yes.

**Teacher:** And when startup failures exhaust that threshold?

**Listener pause: 3 seconds**

**Maya:** The kubelet kills the container, and restart policy decides what
happens next.

**Teacher:** After its failure threshold, what does a failed liveness probe do?

**Listener pause: 3 seconds**

**Maya:** Stops the container — restart policy decides what happens next.

**Teacher:** What does a failed readiness probe do to the Pod?

**Listener pause: 3 seconds**

**Leon:** Marks it not ready.

**Teacher:** Does readiness remove the address from its EndpointSlice?

**Listener pause: 3 seconds**

**Maya:** [confident] Yes — that is how traffic stops.

**Teacher:** [gentle] The address can stay. Ready flips to false. What trap
turns a slow dependency into a restart loop?

**Listener pause: 4 seconds**

**Leon:** [realizing] Liveness pointed at that dependency.

**Teacher:** Checkpoint, Maya. One line: startup, liveness, readiness.

**Listener pause: 4 seconds**

**Maya:** Startup gates the other probes and kills after its threshold;
liveness stops the container; readiness marks not ready.

### Running, receiving nothing

**Teacher:** First, a recall — Leon, remind us. What does Ready mean for
traffic?

**Listener pause: 2 seconds**

**Leon:** Checks and gates pass so matching Services can use the Pod.

**Teacher:** Hold that. Pod is Running, receives nothing. Follow the chain.
First — does the Service selector match the Pod labels?

**Listener pause: 2 seconds**

**Maya:** Yes, check that.

**Teacher:** Next — does an EndpointSlice contain the Pod address with ready
true?

**Listener pause: 2 seconds**

**Leon:** Yes.

**Teacher:** Then — does the Service's target port reach the port the process is
actually listening on?

**Listener pause: 3 seconds**

**Maya:** That mismatch is a classic one.

**Teacher:** Where do you read the attempt history on the Pod?

**Listener pause: 3 seconds**

**Leon:** Events — and current logs, and previous logs if it restarted.

**Teacher:** Is phase part of that chain?

**Listener pause: 2 seconds**

**Maya:** No. Phase can stay Running the whole time.

**Teacher:** Before we move on — Leon, one line. The traffic chain for a
Running Pod that receives nothing.

**Listener pause: 3 seconds**

**Leon:** Selector, ready in EndpointSlice, target port, then events and logs.

### Deletion is not a transaction

**Teacher:** Deletion is two overlapping paths, not one atomic stop. Two paths overlap, so traffic can still arrive. What does
deletion set first?

**Listener pause: 3 seconds**

**Leon:** A deletion timestamp — and the grace period starts.

**Teacher:** What does the EndpointSlice controller mark while the kubelet
starts local shutdown?

**Listener pause: 3 seconds**

**Maya:** The endpoint terminating.

**Teacher:** What runs before the runtime sends the configured stop signal?

**Listener pause: 3 seconds**

**Leon:** A PreStop hook.

**Teacher:** Is that stop signal always TERM?

**Listener pause: 3 seconds**

**Maya:** [uncertain] Yes — Kubernetes always sends TERM.

**Teacher:** [gentle] Do those paths — endpoint
propagation and local shutdown — overlap?

**Listener pause: 2 seconds**

**Leon:** Yes. Traffic can still arrive at a shutting-down container.

**Teacher:** Can a bounded delay prove propagation finished?

**Listener pause: 3 seconds**

**Maya:** No. It only narrows the race. The app still has to drain.

**Teacher:** At grace expiry, what happens to what is left?

**Listener pause: 2 seconds**

**Leon:** Force kill.

**Teacher:** Checkpoint, Maya. One line: why deletion is not a transaction.

**Listener pause: 3 seconds**

**Maya:** Endpoint drain and local shutdown overlap — traffic can still arrive.

### The API repeats what it was told

**Teacher:** First, a recall — Leon, remind us. How does the kubelet get work?

**Listener pause: 2 seconds**

**Leon:** It watches the API for Pods on its node.

**Teacher:** Hold that. What does the kubelet update for node liveness?

**Listener pause: 3 seconds**

**Maya:** Node status and Lease renewTime.

**Teacher:** If those updates stop, can stored Pod phase simply remain Running?

**Listener pause: 2 seconds**

**Leon:** Yes.

**Teacher:** After the monitoring grace period, what does the node controller do
to Ready and taints?

**Listener pause: 4 seconds**

**Maya:** Ready becomes Unknown, and the unreachable taint is added.

**Teacher:** Is the API telling you what is true now?

**Listener pause: 3 seconds**

**Leon:** [realizing] No. It is repeating what the kubelet last said.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: what frozen Running status
means when heartbeats stop.

**Listener pause: 3 seconds**

**Leon:** The API is repeating the last report — not proving the node is alive.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — how the kubelet pulls work, and the concurrent prerequisites before
containers start;

two — CRI, OCI, CNI, CSI, and why the kubelet never calls runc;

three — Running versus Ready, and what each of the three probes gates;

four — the chain when a Running Pod receives nothing; and

five — overlapping termination paths, and stale status when heartbeats stop.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

The kubelet watches the API for Pods on its node and reconciles — no dispatch.
Sandbox network and required volumes must both be ready; then inits in order;
then app containers. The sandbox anchors the shared network namespace. CRI is
kubelet to runtime; OCI is below; CNI networking; CSI storage. The kubelet
uses CRI only for containers and images — never runc. Running is phase, not
health. Ready is checks and gates for Services. Startup gates the other probes
on that container; liveness stops the container; readiness marks not ready
without necessarily removing the slice address. Liveness on a slow dependency
is a restart loop. Traffic chain: selector, ready in EndpointSlice, target
port, events and logs. Deletion starts grace and terminating; PreStop then
configured stop signal; paths overlap; delay narrows the race only. If
heartbeats stop, phase can freeze until the node controller marks Unknown and
unreachable. Running is a phase, not a promise.

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
