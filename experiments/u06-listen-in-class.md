# Listen-in classroom: Idle nodes, Pending Pod

This is the classroom-dialogue version of Choose, Then Commit. The learner
listens to a teacher work with two students and answers mentally before hearing
their attempts. The students make only the plausible scheduler mistakes
identified in the reviewed narration.

The reviewed scheduling narration is the factual authority. This is an audio
script, not a video script.

The dialogue investigates one high-priority inference Pod that stays Pending
while dashboards show idle nodes. Exact events, node identities, and manifest
fragments are reduced to their spoken shape. Scheduler stages and Kubernetes
field names remain spoken vocabulary.

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

### Pending with idle nodes

**Teacher:** [warm] An inference Pod stays Pending. Every node shows low measured
CPU. Maya, does that prove the scheduler should find a node?

**Listener pause: 3 seconds**

**Maya:** Yes. Idle CPU means capacity is available.

**Teacher:** Which numbers does the scheduler compare?

**Listener pause: 4 seconds**

**Leon:** Declared requests, including Pod overhead, against node allocatable
capacity.

**Teacher:** Does current CPU usage enter that arithmetic?

**Listener pause: 2 seconds**

**Leon:** No.

**Teacher:** How can the dashboard and scheduler both be correct?

**Listener pause: 4 seconds**

**Maya:** Pods can request far more than they use. The dashboard sees low usage;
the scheduler sees allocatable capacity already promised.

### First prove who owns Pending

**Teacher:** Before reading every constraint, what field tells us whether the
scheduler has assigned the Pod?

**Listener pause: 2 seconds**

**Leon:** nodeName.

**Teacher:** It is empty. What evidence should we read first?

**Listener pause: 3 seconds**

**Maya:** FailedScheduling events and any scheduling gates.

**Teacher:** If nodeName were already set, would this remain a scheduler problem?

**Listener pause: 3 seconds**

**Maya:** Yes. Pending always means scheduling has not completed.

**Teacher:** What ownership boundary did nodeName cross?

**Listener pause: 4 seconds**

**Leon:** [realizing] Assignment. Once nodeName is set, the kubelet owns image
pull, volume setup, sandbox creation, and container start.

**Teacher:** Can quota usually explain an already-created Pending Pod?

**Listener pause: 3 seconds**

**Leon:** Yes. Quota leaves the Pod Pending.

**Teacher:** When does quota usually refuse it?

**Listener pause: 3 seconds**

**Maya:** At creation. We inspect the create error, not hunt for that Pod later.

### Eliminate before ranking

**Teacher:** The event reports that no node satisfies all hard constraints.
Leon, does scoring now choose the least-bad node?

**Listener pause: 3 seconds**

**Leon:** Yes. Scores rank every node after penalties.

**Teacher:** What question does Filter answer?

**Listener pause: 3 seconds**

**Maya:** Can this Pod run on this node at all?

**Teacher:** What can remove a node there?

**Listener pause: 5 seconds**

**Maya:** Insufficient requests capacity, required affinity or selectors,
untolerated taints, topology constraints, host ports, or volume topology.

**Teacher:** What does Score receive?

**Listener pause: 3 seconds**

**Leon:** Only the nodes that survived filtering.

**Teacher:** Can adding preferred affinity rescue a Pod filtered from every node?

**Listener pause: 3 seconds**

**Leon:** No. A preference ranks feasible nodes. It cannot make an infeasible
node feasible.

### Choose, then bind

**Teacher:** Put the scheduling work in two broad cycles. What happens before an
attempt begins?

**Listener pause: 3 seconds**

**Maya:** QueueSort orders waiting Pods.

**Teacher:** Is QueueSort a stage inside either cycle?

**Listener pause: 2 seconds**

**Maya:** Yes, it begins the scheduling cycle.

**Teacher:** Where does it sit instead?

**Listener pause: 3 seconds**

**Leon:** Before both cycles. It selects which Pod gets an attempt.

**Teacher:** What is the serial cycle trying to produce?

**Listener pause: 4 seconds**

**Leon:** A feasible winner: pre-filter, filter, optional post-filter if none
survive, then pre-score and score, followed by reserve and permit.

**Teacher:** What happens in the binding cycle?

**Listener pause: 4 seconds**

**Maya:** PreBind, Bind, and PostBind commit the chosen node through the API.

**Teacher:** A PreBind plugin is slow. Does the scheduler queue stop?

**Listener pause: 3 seconds**

**Maya:** Yes. The scheduler handles one Pod end to end.

**Teacher:** Which cycles can overlap?

**Listener pause: 3 seconds**

**Leon:** A binding cycle can overlap later serial scheduling cycles. Slow bind
work delays one Pod, not the whole queue.

### The output is one assignment

**Teacher:** After all that work, what does Bind record?

**Listener pause: 3 seconds**

**Leon:** This Pod belongs on that node, represented by nodeName.

**Teacher:** Does the scheduler now pull the image and start the container?

**Listener pause: 3 seconds**

**Maya:** Yes. Binding commits the work to the node and starts it.

**Teacher:** Which component watches for that assignment?

**Listener pause: 2 seconds**

**Leon:** The kubelet on the chosen node.

**Teacher:** What did the scheduler touch on the node itself?

**Listener pause: 2 seconds**

**Maya:** [realizing] Nothing. It wrote the assignment to the API. Scheduler and
kubelet are separate loops that can fail independently.

### Hold a scarce device

**Teacher:** Our Pod also needs a scarce device. The scheduler chooses a node,
but binding is not complete. Why might Reserve hold that device first?

**Listener pause: 4 seconds**

**Maya:** So another Pod cannot receive the same device in the gap.

**Teacher:** Binding fails. Which action returns the held claim?

**Listener pause: 2 seconds**

**Leon:** Unreserve.

**Teacher:** Can Unreserve assume it runs once?

**Listener pause: 3 seconds**

**Leon:** Yes. A second return would corrupt capacity.

**Teacher:** What property makes a repeated call safe?

**Listener pause: 3 seconds**

**Maya:** Idempotence. Repeating Unreserve leaves the device free exactly once.

**Teacher:** What does a missing Unreserve create?

**Listener pause: 3 seconds**

**Leon:** A leaked reservation: capacity nobody can use, even though no running
Pod owns it.

### Wrong requests fail at different times

**Teacher:** We correct the leaked reservation. Should we solve the idle-node
contradiction by lowering every CPU request sharply?

**Listener pause: 3 seconds**

**Maya:** Yes. Low requests maximize placement without affecting runtime.

**Teacher:** What can overpacking cause for CPU?

**Listener pause: 3 seconds**

**Leon:** Contention, throttling, or reduced share.

**Teacher:** What can memory limits or node pressure cause?

**Listener pause: 4 seconds**

**Maya:** A container can be killed at its memory limit. Node memory, disk, or
inode pressure can make the kubelet evict Pods.

**Teacher:** Contrast the failure timing of requests set too high and too low.

**Listener pause: 5 seconds**

**Leon:** Too high wastes allocatable capacity and fails at schedule time. Too
low can overpack the node and fail later under real load.

### Preemption is not a reservation

**Teacher:** The Pod has high priority. PostFilter chooses lower-priority victims
on one node. The Pod receives nominatedNodeName. Maya, is that node now reserved
for it?

**Listener pause: 3 seconds**

**Maya:** Yes. Nomination guarantees the Pod will land there after victims exit.

**Teacher:** What must happen before their capacity is actually free?

**Listener pause: 3 seconds**

**Leon:** Victims terminate, including their grace periods.

**Teacher:** Can cluster state change during that gap?

**Listener pause: 2 seconds**

**Leon:** Yes.

**Teacher:** Then what is nominatedNodeName?

**Listener pause: 3 seconds**

**Maya:** [realizing] A hint, not a reservation. The Pod can land elsewhere or
wait again.

**Teacher:** Does priority do only preemption?

**Listener pause: 3 seconds**

**Leon:** Yes. High priority means permission to displace victims.

**Teacher:** What other job does it do?

**Listener pause: 3 seconds**

**Maya:** It orders the scheduling queue.

**Teacher:** Which setting keeps queue advantage but forbids displacement?

**Listener pause: 3 seconds**

**Leon:** Set preemptionPolicy to Never.

**Teacher:** Can preemption repair a hard constraint that victim removal does not
change?

**Listener pause: 3 seconds**

**Maya:** No. It helps only when removing lower-priority Pods makes some node
feasible and the Pod's policy permits it.

### Listener reconstruction

**Teacher:** Your turn, without the students.

For the Pending inference Pod, explain:

one — why low measured usage can coexist with insufficient requested capacity;

two — how nodeName separates scheduler from kubelet ownership;

three — why Filter precedes Score and preferences cannot rescue infeasibility;

four — how scheduling and binding cycles overlap, including Reserve and
Unreserve; and

five — why nominatedNodeName and high priority do not guarantee placement.

**Listener pause: 35 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed
answer.

The scheduler compares declared requests and Pod overhead with allocatable
capacity, not current usage. Empty nodeName means no node has been assigned, so
read scheduling gates and FailedScheduling reasons. A set nodeName hands startup
to that node's kubelet.

Filter eliminates nodes that cannot run the Pod. Score ranks only survivors, so
a preference cannot repair a hard failure. QueueSort chooses the next Pod. The
serial scheduling cycle filters, scores, selects, reserves, and permits. The
binding cycle commits through PreBind, Bind, and PostBind while later scheduling
can continue. Unreserve must safely return a held resource after failure.

Binding writes the chosen node; it does not start containers. Requests set too
high fail early by wasting allocatable capacity. Requests set too low can fail
later through contention, kills, or kubelet eviction. During preemption,
nominatedNodeName is only a hint while victims terminate. Priority orders the
queue and may authorize displacement; preemptionPolicy Never keeps only the
queue advantage. Preemption helps only when victim removal creates feasibility.

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

After one listen, ask the learner to diagnose the Pending Pod from nodeName
through feasibility, binding, and preemption in ninety seconds. Score causal
ordering and boundary discrimination, not verbatim recall or learner
preference.
