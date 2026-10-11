# Listen-in classroom pilot: who restarted what

This is the classroom-dialogue version of Module 26. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students are not scripted as answer dispensers: they hesitate,
compress too early, and make plausible mistakes which expose the mechanism.

Factual authority remains `assets/cka-deep-content.js`, unit `u26`, plus its
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

**Teacher:** [warm, unhurried] Something restarted. Maya, where do people look first?

**Listener pause: 3 seconds**

**Maya:** The Deployment — rollouts and replica counts.

**Teacher:** One investigation: that one word hides three owners. We separate
kubelet, workload controller, and Job, then use identity fields to tell them
apart — and finish with why a Job with a sidecar can complete. Leon, what
question answers most of the mystery?

**Listener pause: 3 seconds**

**Leon:** Which object restarted.

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

### UID and restart count

**Teacher:** Same Pod UID, higher restart count. Who acted, Maya?

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

### OOMKilled, same Pod

**Teacher:** A container is OOMKilled and comes back with the same Pod UID.
Leon, was a controller involved?

**Listener pause: 3 seconds**

**Leon:** [uncertain] The Deployment must have replaced it after the kill.

**Teacher:** [gentle] Did the Pod object change?

**Listener pause: 2 seconds**

**Maya:** No. Same UID — kubelet only.

**Teacher:** Will looking at the Deployment find an explanation?

**Listener pause: 3 seconds**

**Leon:** [realizing] Nothing at that level happened. Empty trail.

### Native sidecars

**Teacher:** What is a native sidecar — an ordinary container, or something
else?

**Listener pause: 4 seconds**

**Maya:** [confident] A regular sidecar container with a special label.

**Teacher:** [gentle] Init containers with restart policy Always. When do they
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

### Independent Job knobs

**Teacher:** A Job's result protocol is several independent settings. What does
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

### Why a global limit is awkward

**Teacher:** Large indexed Job. A handful of permanently broken shards. Maya,
what can a single global backoff limit do?

**Listener pause: 4 seconds**

**Maya:** Exhaust the whole budget and fail work that would have succeeded.

**Teacher:** What does per-index accounting keep?

**Listener pause: 4 seconds**

**Leon:** Healthy indexes finish, and exactly which indexes failed are named.

**Teacher:** If any index is permanently failed, how does the Job end?

**Listener pause: 3 seconds**

**Maya:** Still Failed — but you keep completed work and a named failure set.

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
for the expository Module 26. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
