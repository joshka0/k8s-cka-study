# Listen-in classroom: The rollout that cannot pass the gates

This is the classroom-dialogue version of Five Gates. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students make only the plausible request-path mistakes identified
in the reviewed narration.

The reviewed API-path narration is the factual authority. This is an audio
script, not a video script.

The dialogue follows one incident: a rollout request times out in admission,
then meets a field conflict after admission recovers. Exact commands, status
numbers, field paths, selectors, and policy values are reduced to concepts that
can be reconstructed by ear. Kubernetes field names remain spoken vocabulary.

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

### The first refusal

**Teacher:** [warm] The payments team submits a rollout. The API recognizes the
client, but refuses the write. Maya, did authentication succeed?

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

### Authorization clears one gate

**Teacher:** The cluster's authorizer confirms that the client may update the
workload. Leon, must the write now succeed?

**Listener pause: 3 seconds**

**Leon:** Yes. Permission was the final decision.

**Teacher:** [curious] Permission to ask is not acceptance of the proposed
object. What can still inspect it?

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

### Change, then judge

**Teacher:** The response says an admission webhook timed out. Before we inspect
that webhook, put admission in order. Leon, which comes first: validation or
mutation?

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

**Teacher:** What property prevents a second helper container?

**Listener pause: 4 seconds**

**Maya:** Idempotence. Repeating the same mutation against the same result must
leave it stable.

### One service on every matching write

**Teacher:** Our webhook is deployed by the observability team. Why can its
failure block a payments rollout?

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

### Reject or bypass

**Teacher:** The webhook is unreachable. Maya, should admission always reject
on timeout?

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

**Teacher:** What is the field that records this reject-or-bypass choice?

**Listener pause: 2 seconds**

**Leon:** The failurePolicy field.

**Teacher:** Which behavior fits a security invariant?

**Listener pause: 3 seconds**

**Leon:** Usually reject, because bypass would violate the invariant.

**Teacher:** Which fits a convenience label?

**Listener pause: 3 seconds**

**Maya:** Usually continue, because losing the label is less harmful than
stopping workloads.

**Teacher:** [emphasis] The domain chooses the failure behavior. Habit does not.

### Repair the hot path

**Teacher:** We need the webhook without turning it into a cluster-wide single
point of failure. Leon, what is the first design move?

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

### Two writers

**Teacher:** The webhook recovers. The rollout is admitted, but its controller
reports a conflict. Maya, should it resend the same update until one wins?

**Listener pause: 4 seconds**

**Maya:** Yes. Conflicts are transient, so blind retry is normal.

**Teacher:** What does the conflict tell us about the object we read?

**Listener pause: 3 seconds**

**Leon:** Another writer changed it after our read. Our copy is stale.

**Teacher:** What is the version marker carried by a read-modify-write update
called?

**Listener pause: 2 seconds**

**Maya:** resourceVersion.

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

### Ownership is the design

**Teacher:** The conflict is on the desired replica count. An autoscaler already
manages it. Leon, does forcing our value solve the conflict?

**Listener pause: 4 seconds**

**Leon:** Yes. Force makes our desired value authoritative.

**Teacher:** What else does force transfer?

**Listener pause: 3 seconds**

**Maya:** Field ownership.

**Teacher:** Where does server-side apply record ownership by field?

**Listener pause: 2 seconds**

**Maya:** In managedFields.

**Teacher:** What might the autoscaler do on its next loop?

**Listener pause: 4 seconds**

**Leon:** [realizing] Write the field again or conflict over it. We have built a
fight between managers.

**Teacher:** So when is force correct?

**Listener pause: 5 seconds**

**Maya:** When ownership is genuinely moving and we know who held the field and
why. It is not a generic conflict repair.

**Teacher:** Exactly. A conflict is evidence about concurrent ownership. It is
not permission to erase another writer's intent.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — what authentication establishes and what authorization decides;

two — why mutation precedes validation;

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

After one listen, ask the learner to reconstruct the request gates, webhook
failure decision, and safe conflict response in ninety seconds. Score causal
ordering and boundary discrimination, not verbatim recall or learner
preference.
