# Listen-in classroom: Green API servers, failed writes

This is the classroom-dialogue version of A Backup You Have Restored. The
learner listens to a teacher work with two students and answers mentally before
hearing their attempts. The students make only the plausible availability and
recovery mistakes identified in the reviewed narration.

The reviewed etcd and high-availability narration is the factual authority.
This is an audio script, not a video script.

The dialogue follows one incident: healthy API front ends cannot commit writes
after etcd loses quorum, and the team must recover from an untested snapshot.
Commands, paths, and literal endpoint details are reduced to their operational
shape. Kubernetes and etcd terms remain spoken vocabulary.

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

### Green in front

**Teacher:** [warm] Three API servers accept connections, but every new write
fails. Maya, does three healthy API replicas prove the control plane can write?

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

### Do the quorum arithmetic

**Teacher:** The etcd cluster has five voting members. How many must commit a
write?

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

### A Lease is not consensus

**Teacher:** The cluster also runs several scheduler replicas. Do they all agree
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

### Quorum loss beneath healthy servers

**Teacher:** Three of five etcd members are now unavailable. Can the healthy API
servers acknowledge a durable write?

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

### The backup claim

**Teacher:** The team says recovery is safe because yesterday's snapshot status
was valid. Leon, what has that proved?

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

### What the snapshot omits

**Teacher:** Does the etcd snapshot contain everything needed to rebuild the
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

### Capture consistently

**Teacher:** Maya proposes copying the live etcd storage directory while the
cluster runs. Is that equivalent to a snapshot?

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

### Restore without overwriting the live world

**Teacher:** We rehearse the restore. Should we restore over the live member's
existing data directory to save space?

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

After one listen, ask the learner to explain the quorum failure and prove a
complete recovery plan in ninety seconds. Score causal ordering and boundary
discrimination, not verbatim recall or learner preference.
