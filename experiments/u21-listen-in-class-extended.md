# Listen-in classroom, extended: RBAC and node trust

Extended format of the u21 classroom pilot. Same facts, same cast, same
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

**Teacher:** [warm, unhurried] Today we are going to build Kubernetes
authorization without memorizing a four-box diagram. We will build it from
three small questions, and everything else — bindings, escalation, even how a
machine earns the cluster's trust — will fall out of those three. Maya, if I
give you a permission, what two questions do you need answered?

**Listener pause: 3 seconds**

**Maya:** What can I do, and to what?

**Teacher:** That gives us the rule: perhaps the ability to read Pods.
Kubernetes calls that verb get. Leon, a rule alone is floating in space. What
is still missing?

**Listener pause: 3 seconds**

**Leon:** Who has the rule?

**Teacher:** Yes, and one more thing.

**Leon:** Where it applies?

**Teacher:** Exactly. So three pieces. The rule — what you may do, to what.
The subject — who holds it. And the reach — where it applies, one namespace
or the whole cluster. Say them back to me, Maya, just the three words.

**Listener pause: 2 seconds**

**Maya:** Rule, subject, reach.

**Teacher:** We will reconstruct everything else from those three pieces.

### Rule versus reach

**Teacher:** [curious] A ClusterRole contains the rule: get Pods. Nothing
else has been created — no binding, nothing. Does it grant that permission to
anyone yet, Maya?

**Listener pause: 2 seconds**

**Maya:** No. It has rules but no subject until a binding connects it.

**Teacher:** Good. Leon, I connect that ClusterRole to Maya using a RoleBinding
in the payments namespace. Where may she get Pods?

**Listener pause: 4 seconds**

**Leon:** [thinking aloud] Hmm... cluster-wide? Because, um, it is a
ClusterRole.

**Teacher:** [gentle] That is the useful mistake, and half of everyone makes
it. Break it apart. Which object supplied the rule?

**Leon:** The ClusterRole.

**Teacher:** Which object supplied the reach?

**Leon:** The RoleBinding... [realizing] ah — so only in payments.

**Teacher:** [pleased] Right. The word Cluster in ClusterRole tells you the
role is not owned by one namespace and can hold cluster-scoped rules.
[emphasis] It does not override the reach of a RoleBinding. The binding you
used decides where the grant lives.

Maya, keep the same ClusterRole but replace the RoleBinding with a
ClusterRoleBinding. What changed?

**Listener pause: 3 seconds**

**Maya:** The reach. [slight smile] Same rule, get Pods, now cluster-wide.

**Teacher:** [chuckle] Before we move on — Leon, one line. Role versus
binding.

**Listener pause: 3 seconds**

**Leon:** The role supplies the rules; the binding supplies the subjects and
the reach.

**Teacher:** Carry that. It decides almost everything that follows.

### Additive permissions

**Teacher:** Now a different kind of question — not what a grant does, but
what a grant proves. Leon, you inspect a ServiceAccount and find a Role
allowing only reads on ConfigMaps. Can you conclude it cannot delete Secrets?

**Listener pause: 4 seconds**

**Leon:** I would say yes... because that Role does not grant delete.

**Maya:** [interrupting] But there could be another binding.

**Teacher:** Exactly. And this is worth slowing down for, because it is a
property of the whole system. Kubernetes RBAC only ever adds. Every applicable
grant, from every binding that reaches you, combines. Does it have a deny rule
that cancels a grant found elsewhere?

**Listener pause: 2 seconds**

**Leon:** [realizing] No. So the Role is evidence of one permission, not
evidence of the complete permission set.

**Teacher:** Good correction. Maya, so what is the thing we must audit: the
Role, or something larger?

**Listener pause: 3 seconds**

**Maya:** Everything that reaches the subject — every binding, group
membership, and the rules behind those bindings.

**Teacher:** There is a name for that shape: the effective permission graph.
Not one file — the graph. Leon, use the word in a sentence: what is least
privilege a property of?

**Listener pause: 3 seconds**

**Leon:** Least privilege is a property of the graph, not of any one Role.

**Teacher:** Checkpoint, Maya. One line: why can a single Role never prove
you are safe?

**Listener pause: 3 seconds**

**Maya:** Because permissions only add — you have to audit the whole graph.

### The identity, and the honest question

**Teacher:** Let us make it operational. A ServiceAccount named reader lives
in the payments namespace. When it talks to the API, Kubernetes builds it a
username from three parts. A fixed marker that says: this is a ServiceAccount.
Then two more parts. Leon, which two, and in which order?

**Listener pause: 4 seconds**

**Leon:** [uncertain] Um — the name, then the namespace?

**Teacher:** Think about which one contains the other.

**Leon:** [realizing] The namespace contains the account. So: marker, then
payments, then reader.

**Teacher:** Good. The container comes before the thing it contains. That
ordering shows up all over Kubernetes, so keep the principle, not the string.

Now Maya — we want to know whether that identity may read Pods in payments.
We could sit down and read every Role and every binding ourselves. Given what
we just said about the graph, what is wrong with that plan?

**Listener pause: 4 seconds**

**Maya:** We would be rebuilding the graph by hand — and we would miss a
binding.

**Teacher:** So what is the stronger move?

**Listener pause: 4 seconds**

**Maya:** [confident] Ask the cluster itself. The API can answer the
question — may this identity do this action, on this resource, in this
namespace — directly.

**Teacher:** Why is that stronger evidence than the Role we first found?

**Maya:** Because the answer comes from the configured authorization path. It
combines every binding and every group. The Role we found is one input; the
answer is the effective output.

**Teacher:** There is a component whose whole job is answering that question —
Kubernetes calls it the authorizer. When you audit, ask the authorizer, ask as
the identity in question, and ask about one action, one resource, one place at
a time. Leon, checkpoint. One line: what do you ask, and who do you ask?

**Listener pause: 3 seconds**

**Leon:** Ask the authorizer the effective question, as the identity — never
reconstruct the graph by hand.

### The escalation trap

**Teacher:** Now the question every security interview reaches eventually.
First, a recall — Maya, remind us. What does a binding supply?

**Listener pause: 2 seconds**

**Maya:** The subjects and the reach.

**Teacher:** Hold that. A user may create RoleBindings. Can they bind
themselves to cluster-admin?

**Listener pause: 4 seconds**

**Maya:** [confident] Yes — that is why creating bindings is effectively
admin.

**Teacher:** [gentle] Plausible, and it would be true if binding were only a
write operation. But think about what the guard would have to check,
otherwise the guard would be useless. Leon?

**Listener pause: 5 seconds**

**Leon:** [working it out] It must check... whether the caller is allowed to
grant the permissions inside the target role.

**Teacher:** Exactly. The caller must already hold those permissions at the
relevant reach — or hold a special permission whose whole meaning is: may
bind this role anyway. Kubernetes names that verb bind. And editing a role
beyond your own permissions is guarded the same way, by its own special verb,
escalate. Two doors in the guard. Maya, echo them back — what are the two
verbs, and which door does each open?

**Listener pause: 4 seconds**

**Maya:** Bind — attaching a role you do not hold yourself. Escalate —
editing a role beyond your own permissions.

**Teacher:** So is the ability to create bindings harmless?

**Maya:** No. It is still powerful, but it is not sufficient by itself for
arbitrary escalation. You need a complete path: create the binding, and be
allowed to confer what the role contains.

**Teacher:** Now two shorter paths, quickly. What does impersonation do,
Leon?

**Listener pause: 3 seconds**

**Leon:** It lets a request run as another identity, if the caller has
permission to impersonate it.

**Teacher:** And ClusterRole aggregation, Maya?

**Listener pause: 3 seconds**

**Maya:** An aggregate ClusterRole absorbs rules from other ClusterRoles
selected by labels. So its effective rules can change when those source roles
or labels change.

**Teacher:** Which returns us to what object of study?

**Both:** The graph.

**Teacher:** Checkpoint, Leon. One line: what stops binding-creation from
being instant admin?

**Listener pause: 3 seconds**

**Leon:** The escalation guard — you must already hold what you grant, or
hold bind or escalate.

### A node is a client, not merely an object

**Teacher:** Now we transfer the same reasoning to machines. Everything so
far was about people and ServiceAccounts. But the kubelet on every node also
talks to the API — constantly. So it needs an identity too, and that identity
has to come from somewhere. Start here: a Node object exists in the API. Does
that fact authenticate the kubelet process on the machine?

**Listener pause: 3 seconds**

**Leon:** [uncertain] I think so — the object represents the machine.

**Maya:** [interrupting] The API still needs credentials on each request,
though.

**Teacher:** Right. Stored representation and client identity are different
things — an object in the store is not a credential in a request. The kubelet
begins life with a temporary bootstrap credential, deliberately weak. Maya,
what must it do to obtain a durable client identity?

**Listener pause: 5 seconds**

**Maya:** Submit a certificate signing request, have it approved and issued,
then reconnect using the client certificate.

**Teacher:** Leon, that durable identity is derived from something. From
what?

**Listener pause: 2 seconds**

**Leon:** [uncertain] Hmm — the Node object's unique id?

**Teacher:** From the node's name. Every node identity is built on the node's
own name, and every node also joins one shared nodes group, so policy can
address all nodes at once.

Now reconstruct the sequence without my nouns.

**Listener pause: 7 seconds**

**Leon:** Temporary bootstrap credential; submit a signing request; approval
and certificate issuance; reconnect as the named node identity.

**Teacher:** Good. Checkpoint, Maya. One line: what is the trust transition?

**Listener pause: 3 seconds**

**Maya:** Earning an authenticated identity — not merely appearing as a Node
object.

### Three gates

**Teacher:** We need three questions now, and they are the spine of every
request the API ever receives — from you, from a controller, from a node.

First: who are you?

Second: may you perform this operation?

Third: is this proposed change acceptable?

Maya, give them their Kubernetes names.

**Listener pause: 4 seconds**

**Maya:** Authentication, authorization, and validation.

**Teacher:** The third is admission. Validation can be part of admission, but
admission is the boundary we need — the gate that inspects the content of a
change after you are identified and permitted.

And for nodes there are two special guards. The Node authorizer limits which
API actions an authenticated kubelet may request — it is our second question,
specialised for nodes. NodeRestriction is admission logic — the third
question — constraining certain Node and Pod mutations.

Leon, a kubelet's client certificate has expired. Which question fails first?

**Listener pause: 3 seconds**

**Leon:** Authorization, because the node cannot update status.

**Teacher:** Earlier. Kubernetes cannot even establish who it is.

**Leon:** [realizing] Authentication.

**Teacher:** Maya, valid certificate, but the node asks for a Secret that has
nothing to do with its own Pods.

**Listener pause: 3 seconds**

**Maya:** Authorization. We know the identity; the Node authorizer rejects
the operation.

**Teacher:** Leon, it is authorized to update its own Node object, but the
update it sends attempts a protected change.

**Listener pause: 3 seconds**

**Leon:** Admission. NodeRestriction can reject the content even though the
operation was authorized.

**Teacher:** Good. Say the plain-language questions again — all three.

**Leon:** Who are you? May you do this operation? Is this proposed change
acceptable?

### Diagnosis

**Teacher:** Final problem, and now everything we built gets used at once. A
worker's join command reported success. The Node object appears, but the node
stays NotReady. The kubelet's own log shows certificate errors. Before
anyone answers — Leon, a recall. Where does a kubelet's durable identity come
from?

**Listener pause: 3 seconds**

**Leon:** A signing request approved and issued, then a certificate built on
the node's name.

**Teacher:** Hold that. Maya, where do you begin?

**Listener pause: 6 seconds**

**Maya:** [confident] Scheduler events, because the node is not becoming
usable.

**Leon:** [interrupting] But the scheduler does not establish kubelet
identity. I would start with the certificate requests and the kubelet's
certificate.

**Teacher:** Exactly — the log already told us which of the three gates is
failing, and it is the first one. Give me the evidence in order, Leon.

**Listener pause: 6 seconds**

**Leon:** Pending or denied signing requests. Whether a client certificate
was actually issued. Whether the certificate names the right node and is
still valid. Then the kubelet's own configuration, and only then reachability
and authorization, once authentication succeeds.

**Teacher:** Why did the successful join command not settle this?

**Maya:** It proved the command completed its part. It did not prove
approval, issuance, installation, and subsequent authenticated requests all
worked.

**Teacher:** Checkpoint, Maya. One line: when a node is present but not
trusted, which gate do you test first?

**Listener pause: 3 seconds**

**Maya:** Authentication — identity before permission, permission before
content.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — how a rule gets its subject and its reach;

two — why one Role cannot prove least privilege;

three — the guarded path from binding creation to actual escalation, and the
two verbs on its doors;

four — how a kubelet earns its node identity; and

five — how authentication, authorization and admission divide one request.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this
compressed answer.

A role supplies rules, while a binding supplies subjects and reach. A
RoleBinding grants only in its own namespace, even when it references a
ClusterRole. A ClusterRoleBinding grants cluster-wide. RBAC permissions are
additive, so effective access is the union of the reachable binding and
identity graph — audit the graph, not one file, and ask the authorizer the
effective question rather than rebuilding the graph by hand.

Creating bindings alone does not permit arbitrary escalation. The caller must
already hold the target permissions, or hold the special bind permission on
that role. Extending a role beyond your own permissions is guarded the same
way, by the special escalate permission. Two verbs, two doors.

A kubelet starts from a temporary bootstrap credential, submits a certificate
signing request, and after approval reconnects with a durable identity built
on the node's own name, in a group shared by all nodes. Authentication
establishes that identity. The Node authorizer limits its API actions.
NodeRestriction admission constrains certain changes it may make. Who are
you; may you do this; is this change acceptable.

If your answer had that causal shape, exact wording does not matter. If it
did not, replay only the dialogue where your reconstruction first diverged.

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
