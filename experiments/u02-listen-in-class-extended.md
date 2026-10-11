# Listen-in classroom, extended: The rollout that cannot pass the gates

Extended format of the u02 classroom script. Same facts, same cast, same
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

### The first refusal

**Teacher:** [warm] The payments team submits a rollout. The API recognizes the
client, but refuses the write. Two refusals can look the same from outside and
still need different fixes — so we separate the gates carefully. Separating those gates is the whole investigation. Maya, did
authentication succeed?

**Listener pause: 3 seconds**

**Maya:** No. A refused request means the credentials failed.

**Teacher:** What does authentication establish?

**Listener pause: 3 seconds**

**Leon:** An identity: a user, groups, and possibly more identity attributes.

**Teacher:** Does that identity carry permission by itself?

**Listener pause: 2 seconds**

**Leon:** No. Authentication grants nothing.

**Teacher:** Which gate asks whether that identity may perform this action on
this resource?

**Listener pause: 2 seconds**

**Maya:** Authorization.

**Teacher:** Good. Bad credentials fail at which gate?

**Listener pause: 2 seconds**

**Leon:** Identity — authentication.

**Teacher:** Valid credentials without permission fail at which gate?

**Listener pause: 2 seconds**

**Maya:** Authorization.

**Teacher:** Same refusal word from a client's point of view. Why separate the
signatures?

**Listener pause: 3 seconds**

**Leon:** Different owners, different fixes.

**Teacher:** Checkpoint, Maya. One line: authentication versus authorization.

**Listener pause: 3 seconds**

**Maya:** Authentication names who you are; authorization decides whether that
identity may act.

### Authorization clears one gate

**Teacher:** Permission is only one stage on the write path. The cluster's
authorizer confirms that the client may update the workload. Permission is only the second gate, not the end of the path. Leon, must the
write now succeed?

**Listener pause: 3 seconds**

**Leon:** Yes. Permission was the final decision.

**Teacher:** [curious] What can still inspect it?

**Listener pause: 5 seconds**

**Maya:** Admission, schema and field checks, quota, conversion, concurrency,
and storage can still refuse it.

**Teacher:** Exactly. Authorization clears one stage. What should we read
before guessing which later stage failed?

**Listener pause: 3 seconds**

**Leon:** The response reason, message, and any field-specific causes.

**Teacher:** Why?

**Listener pause: 3 seconds**

**Leon:** Quota, immutability, schema, admission, and storage failures have
different messages. The response can name the broken gate faster than a theory.

**Teacher:** Before we move on — Leon, one line. What does a successful
authorization still leave open?

**Listener pause: 3 seconds**

**Leon:** Later gates can still refuse — read the response before guessing
which one.

### Change, then judge

**Teacher:** The response says an admission webhook timed out. Before we chase
that webhook, put admission in order — change first, then judgment. Admission still has to change the object, then judge the final shape. Leon,
which comes first: validation or mutation?

**Listener pause: 3 seconds**

**Leon:** Validation first, so a bad object cannot be changed.

**Teacher:** Suppose mutation ran after validation. What object would reach
storage?

**Listener pause: 4 seconds**

**Maya:** A changed object that nobody validated.

**Teacher:** So the order is?

**Listener pause: 2 seconds**

**Leon:** [realizing] Mutate first, then validate the final object.

**Teacher:** What may a mutating admission step do?

**Listener pause: 3 seconds**

**Maya:** Add a default, a label, or an injected helper container.

**Teacher:** What may validating admission do?

**Listener pause: 2 seconds**

**Leon:** Accept or reject. It must not change the object.

**Teacher:** Maya, can a mutator assume it runs only once?

**Listener pause: 3 seconds**

**Maya:** Yes. Each request passes each mutator once.

**Teacher:** Can changes from other mutators cause this mutator to run again?

**Listener pause: 3 seconds**

**Leon:** Yes. A mutation cannot assume it gets only one pass.

**Teacher:** Repeating the same change against an already-changed object must
leave it stable — that property is called idempotence. Maya, why must a
mutator be idempotent?

**Listener pause: 4 seconds**

**Maya:** Because it can run again — a second pass must not inject another
helper container.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: mutation versus
validation.

**Listener pause: 3 seconds**

**Leon:** Mutate first, then validate the final object; mutators must stay
idempotent.

### One service on every matching write

**Teacher:** Our webhook is deployed by the observability team, yet payments
is blocked. Scope is the design. Scope decides whether one team's outage becomes every team's outage. Why can its failure block a payments
rollout?

**Listener pause: 4 seconds**

**Leon:** It should affect only observability objects.

**Teacher:** What determines which requests detour to it?

**Listener pause: 4 seconds**

**Maya:** Its matching rules and conditions: resource types, namespaces, and
objects.

**Teacher:** The rule matches every Pod creation. What is the blast radius?

**Listener pause: 3 seconds**

**Leon:** Every Pod creation in the cluster now waits on that webhook.

**Teacher:** Name the new dependencies on that hot path.

**Listener pause: 5 seconds**

**Maya:** A network call, certificate trust, a deadline, and the webhook's own
availability. A service reference also depends on service routing and cluster
name resolution.

**Teacher:** Good. A rule limited to one custom resource in one namespace
contains the risk. A broad rule exports one team's outage to unrelated writes.
Checkpoint, Maya. One line: what sets a webhook's blast radius?

**Listener pause: 3 seconds**

**Maya:** Matching rules — broad matches put every matching write on that
service's availability.

### Reject or bypass

**Teacher:** The webhook is unreachable, and now admission itself must choose. The domain has to choose which risk it can live with.
Maya, should admission always reject on timeout?

**Listener pause: 4 seconds**

**Maya:** Yes. Failing closed is always safer.

**Teacher:** What does it protect, and what does it cost?

**Listener pause: 5 seconds**

**Leon:** It prevents policy bypass, but the webhook outage stops every matching
write.

**Teacher:** What is the alternative?

**Listener pause: 3 seconds**

**Maya:** Admit the request when the webhook fails. Writes continue, but the
policy silently stops applying.

**Teacher:** That reject-or-bypass choice is recorded on the webhook
configuration. Kubernetes calls the field failurePolicy. Leon, which
failurePolicy fits a security invariant?

**Listener pause: 3 seconds**

**Leon:** Usually reject, because bypass would violate the invariant.

**Teacher:** Which fits a convenience label?

**Listener pause: 3 seconds**

**Maya:** Usually continue, because losing the label is less harmful than
stopping workloads.

**Teacher:** [emphasis] The domain chooses the failure behavior. Habit does not.
Before we move on — Leon, one line. What does failurePolicy decide?

**Listener pause: 3 seconds**

**Leon:** Whether a dead webhook rejects matching writes or silently bypasses
policy.

### Repair the hot path

**Teacher:** First, a recall — Maya, remind us. What sets which requests this
webhook sees?

**Listener pause: 2 seconds**

**Maya:** Its matching rules and conditions.

**Teacher:** Hold that. We need the webhook without turning it into a
cluster-wide single point of failure. Leon, what is the first design move?

**Listener pause: 4 seconds**

**Leon:** Give it a longer deadline so it eventually answers.

**Teacher:** What happens to every matching API request during that wait?

**Listener pause: 3 seconds**

**Leon:** [realizing] Its latency grows too. First narrow the matching scope as
far as correctness allows.

**Teacher:** Then what availability work belongs on this path?

**Listener pause: 5 seconds**

**Maya:** Enough replicas for updates, a deliberate deadline, and managed
certificate renewal.

**Teacher:** What makes the result reproducible?

**Listener pause: 4 seconds**

**Leon:** A deterministic decision from the admission input and policy state.
Avoid time or changing remote state unless the policy truly needs them.

**Teacher:** Which request facts can form that deterministic input?

**Listener pause: 5 seconds**

**Maya:** The operation, old and new object, requesting identity, namespace,
and policy parameters.

**Teacher:** Checkpoint, Maya. One line: first repair on a hot-path webhook.

**Listener pause: 3 seconds**

**Maya:** Narrow matching first — then replicas, deadline, and certificates.

### Two writers

**Teacher:** The webhook recovers. The rollout is admitted, but its controller
reports a conflict — two writers, one object. Admission is recovered; now concurrent writers show up. Maya, should it resend the same
update until one wins?

**Listener pause: 4 seconds**

**Maya:** Yes. Conflicts are transient, so blind retry is normal.

**Teacher:** What does the conflict tell us about the object we read?

**Listener pause: 3 seconds**

**Leon:** Another writer changed it after our read. Our copy is stale.

**Teacher:** Every read-modify-write update carries a version marker so the
API can detect that staleness. Kubernetes calls it resourceVersion. Maya, what
does a conflict say about resourceVersion?

**Listener pause: 3 seconds**

**Maya:** It changed after our read — our copy is no longer current.

**Teacher:** What could replaying the stale body destroy?

**Listener pause: 3 seconds**

**Leon:** The other writer's change.

**Teacher:** Give the safe sequence.

**Listener pause: 5 seconds**

**Maya:** Read the current object, recompute our intended change against it,
then retry with backoff and the current version.

**Teacher:** Can we assume every update method uses the same conflict rules?

**Listener pause: 3 seconds**

**Leon:** No. Update, Patch, and server-side apply have different rules. The
retry must respect the method in use.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: safe response to a stale
update conflict.

**Listener pause: 4 seconds**

**Leon:** Re-read, recompute, retry with the current version — never replay the
stale body.

### Ownership is the design

**Teacher:** First, a recall — Maya, remind us. What does a conflict tell us
about our copy?

**Listener pause: 2 seconds**

**Maya:** Another writer changed it after our read — our copy is stale.

**Teacher:** Hold that. The conflict is on the desired replica count. An
autoscaler already manages it. Leon, does forcing our value solve the
conflict?

**Listener pause: 4 seconds**

**Leon:** Yes. Force makes our desired value authoritative.

**Teacher:** What else does force transfer?

**Listener pause: 3 seconds**

**Maya:** Field ownership.

**Teacher:** Server-side apply records which manager owns which field. That
record lives in managedFields. Leon, where does the API store field ownership?

**Listener pause: 2 seconds**

**Leon:** In managedFields.

**Teacher:** What might the autoscaler do on its next loop?

**Listener pause: 4 seconds**

**Leon:** [realizing] Write the field again or conflict over it. We have built a
fight between managers.

**Teacher:** So when is force correct?

**Listener pause: 5 seconds**

**Maya:** When ownership is genuinely moving and we know who held the field and
why. It is not a generic conflict repair.

**Teacher:** Exactly. A conflict is evidence about concurrent ownership. It is
not permission to erase another writer's intent. Checkpoint, Maya. One line:
when is force correct?

**Listener pause: 3 seconds**

**Maya:** Only for a deliberate ownership move — not as a generic conflict
fix.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — what authentication establishes and what authorization decides;

two — why mutation precedes validation, and why mutators must be idempotent;

three — how webhook scope and timeout behavior create blast radius;

four — how to respond to a stale update conflict; and

five — why forcing a field can expose an ownership-design failure.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed
answer.

Authentication establishes identity and grants nothing. Authorization decides
whether that identity may perform the requested action on the resource. A
successful authorization clears only that gate. Admission, schema, quota,
conversion, concurrency, and storage can still refuse the write, so read the
response before guessing.

Mutating admission may change the object and must be idempotent because it can
run again. Validating admission then accepts or rejects the final object. Every
matching webhook adds availability, trust, and latency dependencies to the API
path. Narrow matching limits blast radius. Rejecting on webhook failure protects
an invariant but can stop writes. Continuing preserves availability but bypasses
policy. Kubernetes records that choice in failurePolicy. The domain decides
which risk is acceptable.

A conflict says the resourceVersion changed after the read. Fetch the current
object, recompute the intended change, and retry with backoff under the update
method's rules. Server-side apply records field ownership in managedFields and
can identify another owner. Force transfers ownership; it is correct only for
a deliberate ownership move. Otherwise the writers still fight.

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

After one listen, ask the learner to reconstruct the request gates, webhook
failure decision, and safe conflict response in ninety seconds. Score causal
ordering and boundary discrimination, not verbatim recall or learner
preference.
