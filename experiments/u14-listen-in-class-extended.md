# Listen-in classroom, extended: config delivery and quality of service

Extended format of the u14 classroom pilot. Same facts, same cast, same
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

**Teacher:** [warm, unhurried] A Secret was updated. Nothing failed. The
application is still presenting the old credential. The trap is treating an
API write as a process update. Maya, where do people look first?

**Listener pause: 3 seconds**

**Maya:** The Deployment. They assume the change should have rolled out.

**Teacher:** Leon, before we chase rollouts, how many ways can a ConfigMap or
Secret reach a container?

**Listener pause: 3 seconds**

**Leon:** Two, I think. Environment values, and files on a volume.

**Teacher:** Yes. One investigation for this session: what actually reaches a
running process — and later, under pressure, what ends one. Same discipline
both times: name the mechanism before you pick the fix. Checkpoint, Maya. One
line: which delivery shape can change after process start?

**Listener pause: 3 seconds**

**Maya:** Projected files can update eventually; environment values cannot.

### Delivery is not consumption

**Teacher:** [curious] The Secret is mounted as environment values. You update the
Secret. Who delivered the file and who re-read it are separate owners. Maya, what happens inside the already-running process?

**Listener pause: 3 seconds**

**Maya:** [confident] It should pick up the new values.

**Teacher:** [gentle] When were those values fixed?

**Listener pause: 2 seconds**

**Maya:** [realizing] At process start. So they never change again for that process.

**Teacher:** Good. Now the same Secret is projected as files. The files update
eventually. Leon, does the application now use the new credential?

**Listener pause: 4 seconds**

**Leon:** [thinking aloud] Hmm... the file changed, so... yes?

**Teacher:** Who owns delivery of the file to the mount?

**Listener pause: 2 seconds**

**Leon:** Kubernetes.

**Teacher:** Who owns re-reading that file into the process?

**Listener pause: 2 seconds**

**Leon:** The application. It has to watch or reload.

**Teacher:** [pleased] Before we
move on — Leon, one line. Who delivers, who consumes?

**Listener pause: 3 seconds**

**Leon:** Kubernetes delivers the file; the application must re-read it.

### What actually rolls

**Teacher:** Maya keeps a Deployment that references this ConfigMap. She edits
the ConfigMap data. Controllers react to the template, not to config data alone. Does the Deployment roll?

**Listener pause: 4 seconds**

**Maya:** [confident] Yes — the Pods need the new config.

**Teacher:** [gentle] What does a Deployment actually watch for change?

**Listener pause: 3 seconds**

**Leon:** [uncertain] The... Pod template?

**Teacher:** Did editing the ConfigMap change the template?

**Listener pause: 2 seconds**

**Leon:** No.

**Teacher:** So does anything roll?

**Listener pause: 2 seconds**

**Maya:** [realizing] Nothing rolls.

**Teacher:** How do teams force the template to change when the config data
changes?

**Listener pause: 5 seconds**

**Maya:** They put a fingerprint of the config into the template — often as an
annotation — so a data change becomes a template change.

**Teacher:** Which object is the only thing the controller reacts to?

**Listener pause: 2 seconds**

**Leon:** The template. Not the data object.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: what makes a Deployment
roll.

**Listener pause: 3 seconds**

**Maya:** A Pod template change — not an edit to referenced config data alone.

### What a Secret actually is

**Teacher:** Leon, people treat the name Secret as if it meant encrypted. The name is not the protection. What
does base sixty-four give you?

**Listener pause: 3 seconds**

**Leon:** [uncertain] Encryption at rest?

**Teacher:** [gentle] Representation, not encryption. Maya, what protection is
already on every API request for that object?

**Listener pause: 3 seconds**

**Maya:** Authorization — who may read or write the Secret resource.

**Teacher:** Is encryption at rest automatic when you create a Secret?

**Listener pause: 3 seconds**

**Leon:** [realizing] No. It is optional. You configure it, or you do not.

**Teacher:** So does the name Secret protect anything by itself?

**Listener pause: 2 seconds**

**Maya:** No. Access control is already in the path. Encryption is a separate
switch.

**Teacher:** Checkpoint, Leon. One line: what a Secret is and is not as
protection.

**Listener pause: 3 seconds**

**Leon:** A resource under authorization — base sixty-four is representation,
encryption optional.

### Four candidates, one symptom

**Teacher:** First, a recall — Maya, remind us. When are environment values
fixed?

**Listener pause: 2 seconds**

**Maya:** At process start — they never change for that process.

**Teacher:** Hold that. Back to the stale credential. The Secret changed. The
app still presents the old one. Leon, if delivery was through environment
values, what is the fix?

**Listener pause: 3 seconds**

**Leon:** Restart the Pod so a new process starts with the new values.

**Teacher:** Maya, if it was a normal projected volume and you just updated,
what might be true?

**Listener pause: 3 seconds**

**Maya:** You may simply be early. The file updates eventually.

**Teacher:** One mount pattern binds a single file and never refreshes after
the container starts. What does Kubernetes call that field?

**Listener pause: 4 seconds**

**Leon:** [uncertain] Um... subPath?

**Teacher:** Yes. That subPath mount never refreshes. What about an object marked
immutable?

**Listener pause: 3 seconds**

**Maya:** The projected content never updates either.

**Teacher:** The process may also have read once and cached. And if nothing
rolled at all — what failed to change?

**Listener pause: 3 seconds**

**Leon:** The Pod template.

**Teacher:** [emphasis] One symptom. Several causes. Name the cause before you
pick last week's restart. Before we move on — Maya, one line. Four candidates
for a stale credential.

**Listener pause: 4 seconds**

**Maya:** Env needs restart; a file may be early, subPath, or immutable; the
app may cache; or the template never changed.

### QoS is an output

**Teacher:** Same discipline under pressure. Memory is tight on the node. Class is derived across every container in the Pod.
Before who dies: Leon, can you set quality of service on a Pod as a field?

**Listener pause: 3 seconds**

**Leon:** [uncertain] I think you choose Guaranteed or Burstable.

**Teacher:** You do not set it. From what is it derived, Maya?

**Listener pause: 4 seconds**

**Maya:** From CPU and memory requests and limits across the containers.

**Teacher:** Across which containers?

**Listener pause: 2 seconds**

**Maya:** [realizing] All of them in the Pod. One under-specified sidecar can
drop the whole Pod.

**Teacher:** Name the three classes.

**Listener pause: 3 seconds**

**Leon:** Guaranteed, Burstable, and BestEffort.

**Teacher:** If you believed a workload was Guaranteed and it is not, where do
you look?

**Listener pause: 3 seconds**

**Maya:** Every container, not only the one you care about.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: where QoS comes from.

**Listener pause: 3 seconds**

**Leon:** Derived from requests and limits on every container in the Pod.

### Eviction is not OOM

**Teacher:** Two mechanisms can end containers under memory pressure. Same pressure, different actor, different resulting state. Maya, who
acts in kubelet node-pressure eviction?

**Listener pause: 3 seconds**

**Maya:** The kubelet — Kubernetes itself.

**Teacher:** What state does that tend to leave on the Pod?

**Listener pause: 2 seconds**

**Maya:** Failed — so a controller can replace it.

**Teacher:** Leon, who acts in a kernel OOM kill?

**Listener pause: 3 seconds**

**Leon:** The kernel. Below Kubernetes entirely.

**Teacher:** After that kill, what may the kubelet do?

**Listener pause: 3 seconds**

**Leon:** [thinking aloud] Just restart the container, under the restart
policy.

**Teacher:** Same pressure. Different actor. Different resulting state. Do you
merge them into one story?

**Listener pause: 2 seconds**

**Maya:** No.

**Teacher:** Checkpoint, Maya. One line: eviction versus kernel OOM.

**Listener pause: 3 seconds**

**Maya:** Kubelet eviction can mark Failed; kernel OOM is below Kubernetes and
may just restart.

### The incomplete slogan

**Teacher:** Ranking is richer than BestEffort first. Maya, is "BestEffort is evicted first" a complete answer?

**Listener pause: 4 seconds**

**Maya:** [confident] For ranking, yes — that is the usual rule of thumb.

**Teacher:** [gentle] Useful approximation, not the ranking. Leon, what does
the actual ordering consider first?

**Listener pause: 5 seconds**

**Leon:** [working it out] Usage above requests... then Priority... then
relative excess.

**Teacher:** And do disk or process-id pressure follow that same memory story?

**Listener pause: 3 seconds**

**Maya:** No. They behave differently again.

**Teacher:** Before we move on — Leon, one line. What the ranking considers
before the slogan.

**Listener pause: 3 seconds**

**Leon:** Usage above requests, then Priority, then relative excess.

### Diagnosis

**Teacher:** First, a recall — Maya, remind us. Who owns re-reading a projected
file?

**Listener pause: 2 seconds**

**Maya:** The application — Kubernetes only delivers it.

**Teacher:** Hold that. Final problem. Config changed. App still wrong.
Separately, a container died on a pressured node. Where do you begin on the
credential, Leon?

**Listener pause: 6 seconds**

**Leon:** How the value was delivered — environment or file. Whether
the object is immutable. Whether the mount is subPath. Whether the app caches.
Whether the Pod template ever changed.

**Teacher:** And on the death, Maya?

**Listener pause: 5 seconds**

**Maya:** Separate eviction from kernel kill. Look at Pod status first. When
the labels are missing, use kubelet and kernel evidence while the node still
has it.

**Teacher:** What unites both halves — the stale credential and the death?

**Listener pause: 4 seconds**

**Leon:** [realizing] You name what actually happened to the process. Updating
config is not updating a running process. Seeing a death is not knowing which
actor killed it.

**Teacher:** Checkpoint, Maya. One line: the discipline that unites both halves.

**Listener pause: 3 seconds**

**Maya:** Name the mechanism that reached the process — delivery path or kill
actor.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — how environment delivery differs from projected files, and who owns
re-read;

two — why editing a referenced ConfigMap does not roll a Deployment, and what
teams do to the template;

three — subPath, immutable objects, and what a Secret is and is not as
protection;

four — why quality of service is derived from every container; and

five — how kubelet eviction and kernel OOM kill differ in actor and outcome.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

Environment values are fixed when the process starts. Projected files may
update eventually, but the application must re-read them. Kubernetes owns
delivery; the process owns consumption. A Deployment rolls only when its Pod
template changes. Editing referenced config data is not a template change,
so teams fingerprint the config into the template to force one. A normal
projected mount may still be early. A subPath mount never refreshes. An
immutable object never updates either. A Secret is a resource type under
authorization. Base sixty-four is representation, not encryption. Encryption
at rest is optional.

Quality of service is classified from requests and limits across all
containers in the Pod — Guaranteed, Burstable, or BestEffort — and one weak
sidecar can change the class. Kubelet eviction is a Kubernetes action that
can mark a Pod Failed for replacement. A kernel OOM kill is below Kubernetes;
restart policy may simply restart the container. Eviction ranking is not the
slogan "BestEffort first"; it considers usage above requests, Priority, and
relative excess.

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
