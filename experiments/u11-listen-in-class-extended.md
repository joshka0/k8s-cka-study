# Listen-in classroom, extended: Green API servers, failed writes

Extended format of the u11 classroom script. Same facts, same cast, same
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

### Green in front

**Teacher:** [warm] Three API servers accept connections, but every new write
fails. Green front ends are not proof the control plane can change. Maya, does
three healthy API replicas prove the control plane can write?

**Listener pause: 3 seconds**

**Maya:** Yes. A majority of API servers is healthy.

**Teacher:** Do API servers form the storage consensus group?

**Listener pause: 2 seconds**

**Leon:** No. etcd members do.

**Teacher:** What availability model fits API servers?

**Listener pause: 4 seconds**

**Leon:** They hold no durable cluster state. Compatible replicas can sit behind
a load balancer and be replaced, while sharing the same etcd.

**Teacher:** What model fits etcd?

**Listener pause: 3 seconds**

**Maya:** Its members hold replicated state and commit through consensus. They
are not interchangeable front ends.

**Teacher:** Checkpoint, Leon. One line: API servers versus etcd members.

**Listener pause: 3 seconds**

**Leon:** API servers are replaceable front ends; etcd members hold consensus
state.

### Do the quorum arithmetic

**Teacher:** The etcd cluster has five
voting members. Quorum is arithmetic, not intuition. How many must commit a write?

**Listener pause: 3 seconds**

**Leon:** Two, because any two replicas preserve a copy.

**Teacher:** What does majority mean for a group of N?

**Listener pause: 4 seconds**

**Maya:** Half rounded down, plus one.

**Teacher:** Apply it to five.

**Listener pause: 2 seconds**

**Leon:** Three members.

**Teacher:** How many member failures can five survive and still commit?

**Listener pause: 3 seconds**

**Leon:** Two.

**Teacher:** How many can a three-member cluster survive?

**Listener pause: 2 seconds**

**Maya:** One.

**Teacher:** We add a fourth member to the three-member cluster. Did tolerance
increase?

**Listener pause: 3 seconds**

**Maya:** Yes. Four replicas must tolerate two failures.

**Teacher:** What majority does four require?

**Listener pause: 2 seconds**

**Leon:** Three.

**Teacher:** After two failures, how many remain?

**Listener pause: 2 seconds**

**Leon:** Two. [realizing] Not enough. Three and four both tolerate only one
failure.

**Teacher:** What did the fourth member add?

**Listener pause: 3 seconds**

**Maya:** Replication and coordination cost, but no fault tolerance. Five is the
next size that changes tolerance.

**Teacher:** Before we move on — Maya, one line. Tolerance for three, four, and
five.

**Listener pause: 3 seconds**

**Maya:** Three and four tolerate one failure; five tolerates two.

### A Lease is not consensus

**Teacher:** The cluster also runs several scheduler replicas. Leadership is not the same availability model as etcd. Do they all agree
on each placement through quorum?

**Listener pause: 3 seconds**

**Leon:** Yes. Multiple schedulers are another consensus group.

**Teacher:** How many act as the active writer at once?

**Listener pause: 2 seconds**

**Maya:** One.

**Teacher:** What selects that active replica?

**Listener pause: 2 seconds**

**Maya:** Leader election through a Lease.

**Teacher:** What do the others do?

**Listener pause: 2 seconds**

**Leon:** Wait as hot standbys and compete for the Lease when leadership ends.

**Teacher:** So name the three models in this control plane.

**Listener pause: 4 seconds**

**Leon:** Replaceable API front ends, consensus among etcd members, and one
leader elected among replicated scheduler or controller-manager processes.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: three availability models.

**Listener pause: 3 seconds**

**Leon:** Stateless API fronts, etcd quorum, and Lease-elected leaders for
controllers.

### Quorum loss beneath healthy servers

**Teacher:** First, a recall — Maya, remind us. How many of five etcd members
must commit a write?

**Listener pause: 2 seconds**

**Maya:** Three — majority of five.

**Teacher:** Hold that. Three of five etcd members are now unavailable. Can the
healthy API servers acknowledge a durable write?

**Listener pause: 3 seconds**

**Maya:** Yes. They can queue it until etcd returns.

**Teacher:** How many etcd members remain?

**Listener pause: 2 seconds**

**Leon:** Two, below the majority of three.

**Teacher:** What must the API servers do with the write?

**Listener pause: 3 seconds**

**Leon:** Fail it. They can accept the connection but cannot commit new state.

**Teacher:** Does quorum loss make an already acknowledged write silently
disappear?

**Listener pause: 3 seconds**

**Maya:** No. The loss stops new commits. It does not revoke the durability of a
write that already reached quorum.

**Teacher:** What evidence outranks the green load-balanced front?

**Listener pause: 4 seconds**

**Maya:** etcd member health, endpoint status, and the actual quorum count.

**Teacher:** Checkpoint, Leon. One line: what healthy API servers cannot do
without etcd quorum.

**Listener pause: 3 seconds**

**Leon:** Accept connections, yes — commit durable writes, no.

### The backup claim

**Teacher:** The team says recovery is safe because yesterday's snapshot status
was valid. A parseable file is not a proven recovery plan. Leon, what has that proved?

**Listener pause: 3 seconds**

**Leon:** That the cluster can be restored from it.

**Teacher:** What narrower claim does snapshot verification support?

**Listener pause: 3 seconds**

**Maya:** The snapshot file parses and its metadata can be read.

**Teacher:** What test proves recovery rather than file validity?

**Listener pause: 4 seconds**

**Leon:** Restore it into an isolated rehearsal environment and bring API access,
critical objects, and controllers back.

**Teacher:** Until that happens, what do we have?

**Listener pause: 2 seconds**

**Maya:** A backup hypothesis, not a proven recovery plan.

**Teacher:** Before we move on — Maya, one line. Snapshot status versus recovery
proof.

**Listener pause: 3 seconds**

**Maya:** Status proves the file parses; only a restore rehearsal proves
recovery.

### What the snapshot omits

**Teacher:** API state is only one recovery surface. Does the etcd snapshot contain everything needed to rebuild the
control plane and applications?

**Listener pause: 3 seconds**

**Maya:** Yes. etcd is the cluster database.

**Teacher:** What category does it actually capture?

**Listener pause: 3 seconds**

**Leon:** Kubernetes API state.

**Teacher:** Are control-plane certificates inside it?

**Listener pause: 2 seconds**

**Leon:** No.

**Teacher:** Are static Pod manifests and load-balancer configuration inside it?

**Listener pause: 3 seconds**

**Maya:** No.

**Teacher:** Is application data inside persistent volumes there?

**Listener pause: 2 seconds**

**Maya:** No.

**Teacher:** What must the recovery plan cover beyond API state?

**Listener pause: 5 seconds**

**Leon:** Control-plane identity and configuration, access routing, and separate
recovery of application volume data.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: what an etcd snapshot omits.

**Listener pause: 3 seconds**

**Leon:** Certificates, static control-plane config, load-balancer setup, and
volume data.

### Capture consistently

**Teacher:** Maya proposes copying the live etcd storage directory while the
cluster runs. A live directory copy is not a consistent snapshot. Is that equivalent to a snapshot?

**Listener pause: 3 seconds**

**Maya:** Yes. A filesystem copy preserves all bytes.

**Teacher:** What can happen while that copy proceeds?

**Listener pause: 3 seconds**

**Leon:** Writes can change related files at different moments, leaving an
inconsistent copy.

**Teacher:** What is the supported capture shape?

**Listener pause: 4 seconds**

**Maya:** Ask etcd's snapshot operation to save a consistent snapshot through
an authenticated endpoint, then verify it with snapshot status.

**Teacher:** Can an export of visible Kubernetes objects replace that snapshot?

**Listener pause: 3 seconds**

**Leon:** No. It is a useful supplement, but it can omit objects and metadata
needed to reconstruct state faithfully.

**Teacher:** Checkpoint, Maya. One line: how to capture a consistent snapshot.

**Listener pause: 3 seconds**

**Maya:** Use etcd's snapshot operation and verify — never a live directory
copy.

### Restore without overwriting the live world

**Teacher:** First, a recall — Leon, remind us. What does snapshot status prove?

**Listener pause: 2 seconds**

**Leon:** That the file parses and its metadata can be read.

**Teacher:** Hold that. We rehearse the restore. Should we restore over the live
member's existing data directory to save space?

**Listener pause: 3 seconds**

**Maya:** Yes. Overwriting ensures the member keeps its identity.

**Teacher:** What safer target should receive restored state?

**Listener pause: 3 seconds**

**Leon:** A new data directory in an isolated or rehearsed environment.

**Teacher:** On a multi-member cluster, are we copying old member directories or
rebuilding membership?

**Listener pause: 4 seconds**

**Maya:** Rebuilding Raft membership with one consistent restore procedure for
each intended member.

**Teacher:** After etcd starts, what proves the recovery serves its purpose?

**Listener pause: 6 seconds**

**Leon:** Rebuild API access. Validate critical objects and controllers. Test
application-data recovery separately. Measure the elapsed recovery and recovered
data against the documented recovery-time and recovery-point objectives.

**Teacher:** Why can workloads keep serving while all this control-plane state is
gone?

**Listener pause: 4 seconds**

**Maya:** Already running containers and programmed data-plane state can outlive
the control plane. Surviving traffic delays the visible failure; it does not
restore change or healing.

**Teacher:** Before we move on — Leon, one line. Safe restore shape.

**Listener pause: 3 seconds**

**Leon:** New directory, isolated environment, rebuild membership, then prove
API and application recovery.

### Listener reconstruction

**Teacher:** Your turn, without the students.

For the failed writes and recovery, explain:

one — how API-server replication differs from etcd consensus and Lease-based
leadership;

two — the quorum and failure tolerance of three, four, and five members;

three — why healthy API servers cannot overcome lost etcd quorum;

four — what snapshot verification proves and what an etcd snapshot omits; and

five — the safe capture, isolated restore, and recovery-proof sequence.

**Listener pause: 35 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed
answer.

API servers are replaceable stateless front ends sharing compatible
configuration and one etcd cluster. etcd members hold replicated state and need
a majority to commit. Scheduler and controller-manager replicas use a Lease so
one acts while others wait. Three members need two and tolerate one failure.
Four need three and still tolerate one. Five need three and tolerate two.

Without etcd quorum, healthy API servers can accept connections but cannot
commit writes. Check etcd health and quorum, not the green front. Snapshot status
proves a file parses. A restore rehearsal proves more. The snapshot contains API
state, not certificates, static control-plane manifests, load-balancer setup, or
persistent-volume data.

Use etcd's supported snapshot operation, not a live filesystem copy. Verify the
file, restore into new storage in an isolated environment, rebuild membership
consistently, restore API access, validate critical controllers and objects,
test application data, and measure the result against recovery objectives. A
backup never restored remains a hypothesis.

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

After one listen, ask the learner to explain the quorum failure and prove a
complete recovery plan in ninety seconds. Score causal ordering and boundary
discrimination, not verbatim recall or learner preference.
