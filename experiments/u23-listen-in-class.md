# Listen-in classroom pilot: render, reconcile, and field ownership

This is the classroom-dialogue version of Module 23. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students are not scripted as answer dispensers: they hesitate,
compress too early, and make plausible mistakes which expose the mechanism.

Factual authority remains `assets/cka-deep-content.js`, unit `u23`, plus its
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

**Teacher:** [warm, unhurried] The release succeeded. The workload is unhealthy.
Maya, can both statements be true?

**Listener pause: 3 seconds**

**Maya:** [confident] No — success means the app came up.

**Teacher:** One investigation: delivery said yes, the cluster says no. We
separate the tool that produced the objects from the controllers that converge
them — then rollout arithmetic, then who owns each field. Leon, what two claims
must we check separately?

**Listener pause: 3 seconds**

**Leon:** That the release worked, and that the workload is healthy.

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

**Teacher:** [gentle] Neither packaging tool becomes the continuous controller.
What owns the result after acceptance?

**Listener pause: 4 seconds**

**Leon:** [realizing] Ordinary admission, storage, and reconciliation.

**Teacher:** How many state machines is that?

**Listener pause: 2 seconds**

**Maya:** Two. Release orchestration, and runtime convergence.

**Teacher:** Which one knows whether your application works?

**Listener pause: 2 seconds**

**Leon:** Only runtime convergence.

### What a green release proves

**Teacher:** Helm reports success. Pods are unhealthy. Maya, is that a
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

### Review what the API will see

**Teacher:** Order for reviewing a declarative change. What do you render and
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

### A rollout is arithmetic

**Teacher:** A Pod-template change creates a ReplicaSet. Leon, what is
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

### The deadline reports, it does not act

**Teacher:** progressDeadlineSeconds elapses. Maya, what happens?

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

### A conflict names an owner

**Teacher:** Server-Side Apply records ownership per field. You get a conflict.
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

### The minimum discriminating evidence

**Teacher:** Stalled rollout. Name the minimum evidence set, Maya.

**Listener pause: 7 seconds**

**Maya:** Deployment conditions and current revision. Desired, current, and
available on both ReplicaSets. Pod readiness and events. Surge and unavailable
arithmetic. managedFields or admission errors if updates were rejected.

**Teacher:** What unites green release and stalled rollout?

**Listener pause: 4 seconds**

**Leon:** [realizing] Delivery success and runtime health are separate claims.
Both live in the objects — check both.

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
for the expository Module 23. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
