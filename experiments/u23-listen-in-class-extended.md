# Listen-in classroom, extended: render, reconcile, and field ownership

Extended format of the u23 classroom pilot. Same facts, same cast, same
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

**Teacher:** [warm, unhurried] The release succeeded. The workload is unhealthy. Delivery success and runtime health are separate claims.
Maya, can both statements be true?

**Listener pause: 3 seconds**

**Maya:** [confident] No — success means the app came up.

**Teacher:** One investigation: delivery said yes, the cluster says no. We
separate the tool that produced the objects from the controllers that converge
them — then rollout arithmetic, then who owns each field. Leon, what two claims
must we check separately?

**Listener pause: 3 seconds**

**Leon:** That the release worked, and that the workload is healthy.

**Teacher:** Checkpoint, Maya. One line: the two claims that look like one.

**Listener pause: 3 seconds**

**Maya:** Delivery success and runtime health — check both separately.

### Two state machines

**Teacher:** [curious] What does Kustomize do to overlays?

**Listener pause: 2 seconds**

**Maya:** Composes them into objects.

**Teacher:** What does Helm do with a chart?

**Listener pause: 3 seconds**

**Leon:** Renders it, and tracks release metadata.

**Teacher:** After those objects enter the API, who owns continuous
reconciliation of the application?

**Listener pause: 4 seconds**

**Maya:** [uncertain] Helm, if you installed with wait.

**Teacher:** [gentle] What owns the result after acceptance?

**Listener pause: 4 seconds**

**Leon:** [realizing] Ordinary admission, storage, and reconciliation.

**Teacher:** How many state machines is that?

**Listener pause: 2 seconds**

**Maya:** Two. Release orchestration, and runtime convergence.

**Teacher:** Which one knows whether your application works?

**Listener pause: 2 seconds**

**Leon:** Only runtime convergence.

**Teacher:** Before we move on — Leon, one line. Two state machines.

**Listener pause: 3 seconds**

**Leon:** Release orchestration versus runtime convergence — only the second
knows health.

### What a green release proves

**Teacher:** Helm reports success. Pods are unhealthy. A one-shot wait is not continuous health. Maya, is that a
contradiction?

**Listener pause: 3 seconds**

**Maya:** Something must be wrong with one of the two reports.

**Teacher:** Without wait behaviour, what does success mean?

**Listener pause: 4 seconds**

**Leon:** The objects were rendered and accepted.

**Teacher:** Even with wait, is success continuous reconciliation?

**Listener pause: 3 seconds**

**Maya:** [realizing] No. It is a one-shot readiness check at install time.

**Teacher:** Who still owns what the workload is doing now?

**Listener pause: 2 seconds**

**Leon:** Object status and events.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: what a green Helm release
proves.

**Listener pause: 3 seconds**

**Maya:** Render and accept — or a one-shot wait check, not continuous health.

### Review what the API will see

**Teacher:** Order for reviewing a declarative change. Values alone are not the payload. What do you render and
read first?

**Listener pause: 3 seconds**

**Maya:** The objects — the payload the API will actually receive.

**Teacher:** Then what?

**Listener pause: 2 seconds**

**Leon:** Apply.

**Teacher:** Then how do you verify reconciliation?

**Listener pause: 3 seconds**

**Maya:** Separately — through status and events.

**Teacher:** Is reviewing a values file the same as reviewing the change?

**Listener pause: 3 seconds**

**Leon:** [realizing] No. The template between them can do anything.

**Teacher:** Checkpoint, Leon. One line: what you review before apply.

**Listener pause: 3 seconds**

**Leon:** The rendered objects — not only the values file.

### A rollout is arithmetic

**Teacher:** A Pod-template change creates a ReplicaSet. The rollout moves only as fast as the numbers allow. Leon, what is
maxSurge?

**Listener pause: 3 seconds**

**Leon:** How far above desired you may go.

**Teacher:** What is maxUnavailable?

**Listener pause: 2 seconds**

**Maya:** How far below.

**Teacher:** What decides what counts as available?

**Listener pause: 4 seconds**

**Leon:** Readiness — plus any minimum ready seconds.

**Teacher:** What does availability allow next?

**Listener pause: 3 seconds**

**Maya:** Further scale-down of the old set.

**Teacher:** How fast does the rollout move?

**Listener pause: 2 seconds**

**Leon:** As fast as those numbers allow — and no faster.

**Teacher:** Before we move on — Maya, one line. What makes a rollout move.

**Listener pause: 3 seconds**

**Maya:** maxSurge, maxUnavailable, and readiness unlocking old-set scale-down.

### The deadline reports, it does not act

**Teacher:** First, a recall — Leon, remind us. What decides availability during
a rollout?

**Listener pause: 2 seconds**

**Leon:** Readiness — plus any minimum ready seconds.

**Teacher:** Hold that. progressDeadlineSeconds elapses. Maya, what happens?

**Listener pause: 4 seconds**

**Maya:** [confident] Automatic rollback — that is what the deadline is for.

**Teacher:** [gentle] What does the Deployment actually report?

**Listener pause: 3 seconds**

**Leon:** The Progressing condition goes false, with reason
ProgressDeadlineExceeded.

**Teacher:** Does it roll back?

**Listener pause: 2 seconds**

**Maya:** No.

**Teacher:** Does it stop trying?

**Listener pause: 2 seconds**

**Leon:** No.

**Teacher:** Does it page anyone?

**Listener pause: 2 seconds**

**Maya:** No.

**Teacher:** So is progressDeadlineSeconds remediation, or status evidence?

**Listener pause: 2 seconds**

**Leon:** [realizing] Status evidence. Treating it as recovery leaves a stalled
rollout overnight.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: what the progress deadline
does not do.

**Listener pause: 3 seconds**

**Maya:** It does not roll back, stop, or page — only reports the stall.

### A conflict names an owner

**Teacher:** Server-Side Apply records ownership per field. You get a conflict. Read managedFields before you force.
Maya, is that a retry problem?

**Listener pause: 3 seconds**

**Maya:** [confident] Retry with force — conflicts are flaky.

**Teacher:** [gentle] What is the API telling you?

**Listener pause: 3 seconds**

**Leon:** Another manager owns that field — and who.

**Teacher:** What do you read before you decide?

**Listener pause: 3 seconds**

**Maya:** managedFields.

**Teacher:** When is forcing right, and when wrong?

**Listener pause: 5 seconds**

**Leon:** Right when ownership is genuinely moving. Wrong when a controller
will simply set the value back.

**Teacher:** Checkpoint, Leon. One line: what a field conflict names.

**Listener pause: 3 seconds**

**Leon:** Another manager — read managedFields before you force.

### The minimum discriminating evidence

**Teacher:** First, a recall — Maya, remind us. What two claims must stay
separate?

**Listener pause: 2 seconds**

**Maya:** Delivery success and runtime health.

**Teacher:** Hold that. Stalled rollout. Name the minimum evidence set, Maya.

**Listener pause: 7 seconds**

**Maya:** Deployment conditions and current revision. Desired, current, and
available on both ReplicaSets. Pod readiness and events. Surge and unavailable
arithmetic. managedFields or admission errors if updates were rejected.

**Teacher:** What unites green release and stalled rollout?

**Listener pause: 4 seconds**

**Leon:** [realizing]
Both live in the objects — check both.

**Teacher:** Before we move on — Leon, one line. What unites green release and
stalled rollout.

**Listener pause: 3 seconds**

**Leon:** Both claims live in objects — check delivery and convergence
separately.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — the two state machines of packaging versus cluster reconciliation;

two — what a successful Helm release proves with and without wait;

three — why you review rendered objects, not only values;

four — maxSurge, maxUnavailable, and what progressDeadlineSeconds does not
do; and

five — what a Server-Side Apply conflict means, and the minimum evidence for a
stalled rollout.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

Kustomize composes; Helm renders and tracks release metadata. Both produce
objects that enter admission, storage, and reconciliation. Neither is the
continuous application controller. Release orchestration and runtime
convergence are separate machines; only convergence knows if the app works.
Without wait, Helm success is render and accept. With wait, a one-shot
readiness check — not continuous health. Review rendered objects before apply;
values alone are not the payload. A rollout is maxSurge, maxUnavailable, and
readiness that unlocks scale-down. progressDeadlineSeconds sets Progressing to false, reason
ProgressDeadlineExceeded; it does not roll back, stop, or page. A field conflict names another manager —
read managedFields; force only when ownership should move. Stalled evidence:
conditions and revision, both ReplicaSets' counts, readiness and events,
arithmetic, managedFields or admission. Successful release and healthy workload
are separate claims.

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
