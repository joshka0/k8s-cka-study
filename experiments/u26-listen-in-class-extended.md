# Listen-in classroom, extended: who restarted what

Extended format of the u26 classroom pilot. Same facts, same cast, same
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

**Teacher:** [warm, unhurried] Something restarted. That one word hides three owners. Maya, where do people look first?

**Listener pause: 3 seconds**

**Maya:** The Deployment — rollouts and replica counts.

**Teacher:** One investigation: that one word hides three owners. We separate
kubelet, workload controller, and Job, then use identity fields to tell them
apart — and finish with why a Job with a sidecar can complete. Leon, what
question answers most of the mystery?

**Listener pause: 3 seconds**

**Leon:** Which object restarted.

**Teacher:** Checkpoint, Maya. One line: the first question when something
restarted.

**Listener pause: 3 seconds**

**Maya:** Which object restarted — container, Pod, or Job accounting.

### Three owners, three objects

**Teacher:** [curious] What does the kubelet restart?

**Listener pause: 3 seconds**

**Maya:** A container inside an existing Pod, according to the restart policy.

**Teacher:** What does a workload controller create when desired replicas are
missing?

**Listener pause: 3 seconds**

**Leon:** A replacement Pod.

**Teacher:** What does the Job controller count and decide?

**Listener pause: 4 seconds**

**Maya:** Completions and failures — whether more Pods are needed at all.

**Teacher:** Do those three act on the same object?

**Listener pause: 2 seconds**

**Leon:** No. Container, Pod under a ReplicaSet, Pod under Job accounting.

**Teacher:** Before we move on — Leon, one line. Three owners, three objects.

**Listener pause: 3 seconds**

**Leon:** Kubelet restarts a container; controller replaces a Pod; Job counts
completions and failures.

### UID and restart count

**Teacher:** Same Pod UID, higher restart count. Two fields separate kubelet from controller without guesswork. Who acted, Maya?

**Listener pause: 3 seconds**

**Maya:** The kubelet — container restart in the existing sandbox.

**Teacher:** A new UID. What does that mean?

**Listener pause: 3 seconds**

**Leon:** A new Pod object entirely — created by a controller.

**Teacher:** What names which controller did it?

**Listener pause: 3 seconds**

**Maya:** ownerReferences and events.

**Teacher:** How many fields separate the two cases?

**Listener pause: 2 seconds**

**Leon:** Two — UID and restart count. No guesswork.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: how UID and restart count
split the story.

**Listener pause: 3 seconds**

**Maya:** Same UID, higher count is kubelet; new UID is a new Pod from a
controller.

### OOMKilled, same Pod

**Teacher:** First, a recall — Leon, remind us. Same UID, higher restart count
— who acted?

**Listener pause: 2 seconds**

**Leon:** The kubelet — container restart in the existing Pod.

**Teacher:** Hold that. A container is OOMKilled and comes back with the same
Pod UID. Leon, was a controller involved?

**Listener pause: 3 seconds**

**Leon:** [uncertain] The Deployment must have replaced it after the kill.

**Teacher:** [gentle] Did the Pod object change?

**Listener pause: 2 seconds**

**Maya:** No. Same UID — kubelet only.

**Teacher:** Will looking at the Deployment find an explanation?

**Listener pause: 3 seconds**

**Leon:** [realizing] Nothing at that level happened. Empty trail.

**Teacher:** Checkpoint, Leon. One line: OOMKilled with the same UID.

**Listener pause: 3 seconds**

**Leon:** Kubelet only — the Deployment never replaced the Pod.

### Native sidecars

**Teacher:** Sidecars that stop with main work let Jobs complete. What is a native sidecar — an ordinary container, or something
else?

**Listener pause: 4 seconds**

**Maya:** [confident] A regular sidecar container with a special label.

**Teacher:** [gentle] When do they
start?

**Listener pause: 3 seconds**

**Leon:** Before the main containers, and they keep running alongside.

**Teacher:** When does the kubelet stop them?

**Listener pause: 3 seconds**

**Maya:** Once the main containers finish.

**Teacher:** Why does that let a Job with a sidecar complete?

**Listener pause: 4 seconds**

**Leon:** [realizing] The sidecar no longer runs forever after the main work
exits. The classic never-exiting proxy problem goes away.

**Teacher:** Before we move on — Maya, one line. What a native sidecar is, and
why a Job can finish.

**Listener pause: 3 seconds**

**Maya:** Init with restart Always — stops when main finishes, so the Job can
complete.

### Independent Job knobs

**Teacher:** A Job's result protocol is several independent settings. Changing one dial leaves the others untouched. What does
indexed completion give each unit of work?

**Listener pause: 3 seconds**

**Maya:** A stable index.

**Teacher:** What does backoffLimitPerIndex bound?

**Listener pause: 3 seconds**

**Leon:** Retries for each index separately.

**Teacher:** What does podFailurePolicy classify?

**Listener pause: 3 seconds**

**Maya:** Pod outcomes — so a permanent exit code need not be retried.

**Teacher:** What restart policy does that require on the template?

**Listener pause: 3 seconds**

**Leon:** Never.

**Teacher:** What can successPolicy declare?

**Listener pause: 3 seconds**

**Maya:** Success before every index finishes.

**Teacher:** What does activeDeadlineSeconds cap?

**Listener pause: 2 seconds**

**Leon:** Total active time, regardless.

**Teacher:** Are these one retry setting, or independent dials?

**Listener pause: 2 seconds**

**Maya:** Independent. Changing one leaves the others untouched.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: Job knobs.

**Listener pause: 3 seconds**

**Leon:** Independent dials — index, per-index backoff, failure policy,
success, and deadline.

### Why a global limit is awkward

**Teacher:** First, a recall — Maya, remind us. What does backoffLimitPerIndex
bound?

**Listener pause: 2 seconds**

**Maya:** Retries for each index separately.

**Teacher:** Hold that. Large indexed Job. A handful of permanently broken
shards. Maya, what can a single global backoff limit do?

**Listener pause: 4 seconds**

**Maya:** Exhaust the whole budget and fail work that would have succeeded.

**Teacher:** What does per-index accounting keep?

**Listener pause: 4 seconds**

**Leon:** Healthy indexes finish, and exactly which indexes failed are named.

**Teacher:** If any index is permanently failed, how does the Job end?

**Listener pause: 3 seconds**

**Maya:** Still Failed — but you keep completed work and a named failure set.

**Teacher:** Checkpoint, Leon. One line: why per-index backoff beats a global
limit.

**Listener pause: 3 seconds**

**Leon:** Healthy indexes finish; broken ones are named — global wipe is
avoided.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — the three restart owners and the object each acts on;

two — how Pod UID and restart count separate kubelet from controller;

three — why OOMKilled with the same UID is not a Deployment story;

four — what native sidecars are and why Jobs can finish with them; and

five — independent Job knobs and why per-index backoff beats a global limit
for large indexed work.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

The kubelet restarts a container in an existing Pod under restart policy. A
workload controller replaces a missing Pod. The Job controller counts
completions and failures. Same UID with higher restart count is the kubelet;
new UID is a new Pod — ownerReferences and events name the controller.
OOMKilled with the same UID never touched the Deployment. Native sidecars are
init containers with restart policy Always; they stop when main containers
finish so Jobs can complete. Job knobs are independent: indexed completion,
backoffLimitPerIndex, podFailurePolicy with restart Never, successPolicy,
activeDeadlineSeconds. Global backoff lets broken shards wipe unfinished work;
per-index keeps completed work and names failures. Ask which object restarted.

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
