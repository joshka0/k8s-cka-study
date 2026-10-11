# Listen-in classroom: A cluster that cannot change

This is the classroom-dialogue version of Who Owns What. The learner listens
to a teacher work with two students and answers mentally before hearing their
attempts. The students make only the plausible ownership and outage mistakes
identified in the reviewed narration.

The reviewed control-plane narration is the factual authority. This is an
audio script, not a video script.

The dialogue follows one incident: checkout traffic still flows after the
control plane fails. It teaches component ownership and outage cost through
causal evidence. Commands, paths, object fields, and literal endpoint details
are reduced to their spoken shape.

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

### The green graph

**Teacher:** [warm] Checkout traffic is flowing, but the control plane is
unavailable. Maya, is the cluster healthy?

**Listener pause: 3 seconds**

**Maya:** If customers still reach checkout, I would call it degraded but
healthy.

**Teacher:** What does flowing traffic prove?

**Listener pause: 3 seconds**

**Leon:** That running processes and the forwarding rules already on the nodes
still work.

**Teacher:** What does it not prove?

**Listener pause: 4 seconds**

**Maya:** [realizing] It does not prove the cluster can accept change, repair a
failure, or report fresh state.

**Teacher:** Good. Our green graph describes the programmed data plane. We
must test whether the cluster can still change.

### Five owners, one contract

**Teacher:** A rollout request now fails. Which component receives the API
request and enforces its policy?

**Listener pause: 2 seconds**

**Leon:** The API server.

**Teacher:** Which component stores persistent API state?

**Listener pause: 2 seconds**

**Maya:** etcd.

**Teacher:** Which component family keeps declared and observed state moving
toward each other?

**Listener pause: 3 seconds**

**Leon:** Controllers.

**Teacher:** Which component chooses a node for an unassigned Pod?

**Listener pause: 2 seconds**

**Maya:** The scheduler.

**Teacher:** And which agent drives assigned Pods on that node?

**Listener pause: 2 seconds**

**Leon:** The kubelet.

**Teacher:** Maya, does a controller call the scheduler to advance the rollout?

**Listener pause: 3 seconds**

**Maya:** Yes. Then the scheduler tells the kubelet to start the Pod.

**Teacher:** [gentle] Follow the shared contract instead. Where does each
component read or write its part of the story?

**Listener pause: 4 seconds**

**Maya:** Through the Kubernetes API. The components do not call the next loop
to advance the Pod.

**Teacher:** Exactly. API objects connect the loops. Which component alone
talks to etcd?

**Listener pause: 2 seconds**

**Leon:** The API server.

### The store is not the cluster

**Teacher:** Leon, we have a recent etcd snapshot. Does it contain the images,
metrics, and application logs needed to rebuild checkout?

**Listener pause: 4 seconds**

**Leon:** A cluster snapshot should contain all three.

**Teacher:** What does etcd actually hold?

**Listener pause: 3 seconds**

**Maya:** API state: the cluster's declared intent and recorded observations.

**Teacher:** Where do the other three live?

**Listener pause: 5 seconds**

**Leon:** [thinking aloud] Images live in a registry and on nodes. Metrics come
from a metrics pipeline. Pod logs remain on nodes unless another system ships
them.

**Teacher:** So what does the snapshot recover?

**Listener pause: 3 seconds**

**Leon:** The API state, not the whole running cluster.

**Teacher:** When is a persistent API write committed in etcd?

**Listener pause: 4 seconds**

**Maya:** After enough etcd members agree on it.

**Teacher:** If slow storage delays that agreement, what slows next?

**Listener pause: 4 seconds**

**Leon:** API writes, and then the controllers waiting on those writes.

**Teacher:** Must a cached read pay that same commit cost?

**Listener pause: 3 seconds**

**Maya:** No. Cached reads and other request stages can have different costs.

### Who creates and who binds

**Teacher:** The failed rollout uses a Deployment. Maya, who starts its new
container?

**Listener pause: 4 seconds**

**Maya:** The scheduler creates the Pod and starts it on the chosen node.

**Teacher:** Split that answer into ownership steps. What object comes after
the Deployment?

**Listener pause: 3 seconds**

**Leon:** A Deployment controller creates a ReplicaSet.

**Teacher:** Then?

**Listener pause: 3 seconds**

**Maya:** A ReplicaSet controller creates Pods.

**Teacher:** What does the scheduler do to each unassigned Pod?

**Listener pause: 3 seconds**

**Leon:** It chooses a node and records a binding in the API.

**Teacher:** Does it contact that node?

**Listener pause: 2 seconds**

**Leon:** [uncertain] Um, it must send the assignment there.

**Teacher:** Which object carries the assignment?

**Listener pause: 3 seconds**

**Leon:** [realizing] The Pod in the API carries the chosen node. The scheduler
does not contact the node.

**Teacher:** What is the field that records that chosen node called?

**Listener pause: 2 seconds**

**Leon:** The nodeName field.

**Teacher:** And after binding, does the scheduler move that same Pod if the
node fails?

**Listener pause: 3 seconds**

**Maya:** No. It can retry before binding, but it does not reschedule a bound
Pod. Controllers must create replacement work.

**Teacher:** Who finally asks the runtime for the Pod sandbox and containers?

**Listener pause: 2 seconds**

**Maya:** The kubelet on the assigned node.

### Pull, report, and infer

**Teacher:** Leon, how does that kubelet learn about assigned Pods?

**Listener pause: 3 seconds**

**Leon:** The control plane pushes each assignment to it.

**Teacher:** [curious] What shared contract did we just establish?

**Listener pause: 3 seconds**

**Leon:** The API. The kubelet watches for Pods assigned to its node. Work is
not pushed by a separate call.

**Teacher:** What does the kubelet send back?

**Listener pause: 2 seconds**

**Maya:** Its observed status and a small, regularly renewed lease.

**Teacher:** The node disappears. Can the stored Node object prove the machine
is still alive?

**Listener pause: 3 seconds**

**Maya:** Yes, if its status still says ready.

**Teacher:** How fresh is that status after the only reporter disappears?

**Listener pause: 4 seconds**

**Maya:** [realizing] It is only the last report. Missed lease renewals let the
node controller infer that the node is unreachable.

### What freezes

**Teacher:** Return to checkout. The control plane stays down. A container on a
live node crashes. Can its kubelet restart it?

**Listener pause: 3 seconds**

**Leon:** No. Healing stops with the control plane.

**Teacher:** Separate node-local repair from cluster-level repair.

**Listener pause: 4 seconds**

**Leon:** The live kubelet can restart a failed container from Pod state it
already has. It cannot move the Pod to another node.

**Teacher:** A checkout Pod becomes unready. Do routing endpoints promptly
remove it?

**Listener pause: 4 seconds**

**Maya:** Yes. The endpoints update themselves when the Pod becomes unready.

**Teacher:** Which control-plane object must actually be updated to remove the
bad destination?

**Listener pause: 4 seconds**

**Maya:** [realizing] An EndpointSlice. Its update stops, so stale routing state
can keep sending traffic to the unready Pod.

**Teacher:** Name three more things that stop.

**Listener pause: 5 seconds**

**Leon:** New placement, controller-created replacements, and most writes such
as scaling, rollouts, and secret rotation.

**Teacher:** And what keeps working?

**Listener pause: 4 seconds**

**Maya:** Running processes and forwarding rules already programmed on nodes.

**Teacher:** That is why the cluster is frozen, not healthy.

### Evidence before blame

**Teacher:** One last diagnostic choice. We submit a change and see no Event.
May we conclude that no downstream component tried to act?

**Listener pause: 3 seconds**

**Leon:** Yes. An attempted action should always leave an Event.

**Teacher:** What evidence can exist instead?

**Listener pause: 5 seconds**

**Maya:** The API response, a read-back of the object, status conditions, or
only the responsible component's logs.

**Teacher:** What does a rejected write give us?

**Listener pause: 2 seconds**

**Leon:** An API error.

**Teacher:** What does a successful read-back prove?

**Listener pause: 3 seconds**

**Maya:** That the object exists. It does not prove a downstream owner acted.

**Teacher:** If no Event exists after that, do we stop?

**Listener pause: 2 seconds**

**Leon:** No. We inspect the next owner and its available evidence.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — the five owners and the API contract between them;

two — how a Deployment becomes running containers;

three — how a kubelet learns work and how the cluster detects its silence;

four — what etcd does and does not preserve; and

five — what stops and what survives when the control plane fails.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed
answer.

The API server exposes the contract, applies request policy, and alone talks
to etcd. etcd stores API state. Controllers reconcile responsibilities. The
scheduler chooses a node and records the binding in nodeName. The kubelet drives assigned
Pods on one node and reports observations. The components coordinate through
API objects, not direct calls to the next loop.

A Deployment controller creates a ReplicaSet. A ReplicaSet controller creates
Pods. The scheduler binds each unassigned Pod. The assigned node's kubelet sees
the Pod through its API watch and asks the runtime for a sandbox and
containers. The kubelet reports status and renews a lease. When those reports
stop, stored state becomes stale and controllers infer the loss from missed
renewals.

An etcd snapshot preserves declared API state. It does not include images,
metrics, or node-local logs. During a control-plane outage, new placement,
control-plane healing, EndpointSlice updates, leases, and most writes stop. Live
kubelets can still restart local containers, and already programmed processes
and forwarding can continue. Surviving traffic proves only that old data-plane
state still works. The cluster is frozen, not healthy.

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

After one listen, ask the learner to reconstruct the five owners, the object
handoffs, and the outage boundary in ninety seconds. Score causal ordering and
boundary discrimination, not verbatim recall or learner preference.
