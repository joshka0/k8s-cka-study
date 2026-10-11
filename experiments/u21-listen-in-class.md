# Listen-in classroom pilot: RBAC and node trust

This is the classroom-dialogue version of Module 21. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students are not scripted as answer dispensers: they hesitate,
compress too early, and make plausible mistakes which expose the mechanism.

Factual authority remains `assets/cka-deep-content.js`, unit `u21`, plus its
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

**Teacher:** [warm, unhurried] Today we are going to build Kubernetes authorization without
memorizing a four-box RBAC diagram. Maya, if I give you a permission, what two
questions do you need answered?

**Listener pause: 3 seconds**

**Maya:** What can I do, and to what?

**Teacher:** That gives us the rule: perhaps the ability to read Pods.
Kubernetes calls that verb get. Leon, what is still missing?

**Listener pause: 3 seconds**

**Leon:** Who has the rule?

**Teacher:** Yes, and one more thing.

**Leon:** Where it applies?

**Teacher:** Exactly. Let us call those the rule, the subject, and the reach.
The reach may be one namespace or the cluster. We will reconstruct everything
else from those three pieces.

### Rule versus reach

**Teacher:** [curious] A ClusterRole contains the rule: get Pods. Does it grant that
permission to anyone yet, Maya?

**Listener pause: 2 seconds**

**Maya:** No. It has rules but no subject until a binding connects it.

**Teacher:** Good. Leon, I connect that ClusterRole to Maya using a RoleBinding
in the payments namespace. Where may she get Pods?

**Listener pause: 4 seconds**

**Leon:** [thinking aloud] Hmm... cluster-wide? Because, um, it is a ClusterRole.

**Teacher:** [gentle] That is the useful mistake. Which object supplied the rule?

**Leon:** The ClusterRole.

**Teacher:** Which object supplied the reach?

**Leon:** The RoleBinding... [realizing] ah — so only in payments.

**Teacher:** [pleased] Right. The word Cluster in ClusterRole tells you the role is
not owned by one namespace and can hold cluster-scoped rules. [emphasis] It does
not override the reach of a RoleBinding.

Maya, keep the same ClusterRole but replace the RoleBinding with a
ClusterRoleBinding. What changed?

**Listener pause: 3 seconds**

**Maya:** The reach. [slight smile] Same rule, get Pods, now cluster-wide.

**Teacher:** [chuckle] So give me the compact rule.

**Maya:** [measured, like a conclusion] The role supplies the rules; the binding
supplies the subjects and reach.

### Additive permissions

**Teacher:** Leon, you inspect a ServiceAccount and find a Role allowing only
reads on ConfigMaps. Can you conclude it cannot delete Secrets?

**Listener pause: 4 seconds**

**Leon:** [deliberate] I would say yes... because that Role does not grant delete.

**Maya:** [interrupting] But there could be another binding.

**Teacher:** Exactly. Kubernetes RBAC combines applicable grants. Does it have
a deny rule which cancels a grant found elsewhere?

**Listener pause: 2 seconds**

**Leon:** [realizing] No. So the Role is evidence of one permission, not evidence
of the complete permission set.

**Teacher:** Good correction. Maya, what is the thing we must audit: the Role,
or something larger?

**Maya:** The effective graph: every binding that reaches the subject, group
membership, and the rules behind those bindings.

**Teacher:** Yes. Least privilege is a property of that graph, not one YAML
file.

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

**Teacher:** Good. The container comes before the thing it contains. Now Maya:
we want to know whether that identity may read Pods in payments. We could sit
down and read every Role and every binding ourselves. What is the stronger
move?

**Listener pause: 5 seconds**

**Maya:** [confident] Ask the cluster itself. The API can answer the question — may this
identity do this action, on this resource, in this namespace — directly.

**Teacher:** Why is that stronger evidence than the Role we first found?

**Maya:** Because the answer comes from the configured authorization path. It
combines every binding and every group. The Role we found is one input; the
answer is the effective output.

**Teacher:** Correct. It does not explain every grant that produced the
answer, but it tests the question we actually care about. When you audit, ask
the authorizer, ask as the identity in question, and ask about one action, one
resource, one place at a time.

### The escalation trap

**Teacher:** Maya, a user may create RoleBindings. Can they bind themselves to
cluster-admin?

**Listener pause: 4 seconds**

**Maya:** [confident] Yes — that is why creating bindings is effectively admin.

**Teacher:** [gentle] Plausible, but not under the normal RBAC escalation guard. Leon,
what second check would Kubernetes need to make, otherwise the guard would be
useless?

**Listener pause: 5 seconds**

**Leon:** [working it out] It must check... whether the caller is allowed to grant
the permissions inside the target role.

**Teacher:** Exactly. The caller must already hold those permissions at the
relevant reach, or hold a special permission whose whole meaning is: may bind
this role anyway. So, Maya, is the ability to create bindings harmless?

**Maya:** No. It is still powerful, but it is not sufficient by itself for
arbitrary escalation. You need a complete path: create the binding, and be
allowed to confer what the role contains.

**Teacher:** Good. Editing a role beyond your own permissions is guarded the
same way, by its own special permission. Kubernetes names the two verbs bind
and escalate — remember them as the two doors in the guard.

Now two shorter paths. What does impersonation do, Leon?

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

### A node is a client, not merely an object

**Teacher:** Now we transfer the same reasoning to nodes. A Node object exists
in the API. Does that fact authenticate the kubelet process on the machine?

**Listener pause: 3 seconds**

**Leon:** [uncertain] I think so — the object represents the machine.

**Maya:** [interrupting] The API still needs credentials on each request, though.

**Teacher:** Right. Stored representation and client identity are different.
The kubelet begins with a temporary bootstrap credential. Maya, what must it do
to obtain a durable client identity?

**Listener pause: 5 seconds**

**Maya:** Submit a certificate signing request, have it approved and issued,
then reconnect using the client certificate.

**Teacher:** Leon, that durable identity is derived from something. From what?

**Listener pause: 2 seconds**

**Leon:** [uncertain] Hmm — the Node object's unique id?

**Teacher:** From the node's name. Every node identity is built on the node's
own name, and every node also joins one shared nodes group, so policy can
address all nodes at once.

Now reconstruct the sequence without my nouns.

**Listener pause: 7 seconds**

**Leon:** Temporary bootstrap credential; submit a signing request; approval
and certificate issuance; reconnect as the named node identity.

**Teacher:** Good. The trust transition is obtaining the authenticated
identity, not merely seeing a Node object.

### Three gates

**Teacher:** We need three questions now.

First: who are you?

Second: may you perform this operation?

Third: is this proposed change acceptable?

Maya, give them their Kubernetes names.

**Listener pause: 4 seconds**

**Maya:** Authentication, authorization, and validation.

**Teacher:** The third is admission. Validation can be part of admission, but
admission is the boundary we need.

The Node authorizer limits which API actions an authenticated kubelet may
request. NodeRestriction is admission logic constraining certain Node and Pod
mutations.

Leon, a kubelet's client certificate has expired. Which question fails first?

**Listener pause: 3 seconds**

**Leon:** Authorization, because the node cannot update status.

**Teacher:** Earlier. Kubernetes cannot establish who it is.

**Leon:** [realizing] Authentication.

**Teacher:** Maya, valid certificate, but the node asks for a Secret that has
nothing to do with its own Pods.

**Listener pause: 3 seconds**

**Maya:** Authorization. We know the identity; the Node authorizer rejects the
operation.

**Teacher:** Leon, it is authorized to update its own Node object, but the
update it sends attempts a protected change.

**Listener pause: 3 seconds**

**Leon:** Admission. NodeRestriction can reject the content even though the
operation was authorized.

**Teacher:** Good. Say the plain-language questions again.

**Leon:** Who are you? May you do this operation? Is this proposed change
acceptable?

### Diagnosis

**Teacher:** Final problem. A worker's join command reported success. The Node
object appears, but the node stays NotReady. The kubelet's own log shows
certificate errors. Maya, where do you begin?

**Listener pause: 6 seconds**

**Maya:** [confident] Scheduler events, because the node is not becoming usable.

**Leon:** [interrupting] But the scheduler does not establish kubelet identity. I
would start with the certificate requests and the kubelet's certificate.

**Teacher:** Exactly. Give me the evidence in order, Leon.

**Listener pause: 6 seconds**

**Leon:** Pending or denied signing requests. Whether a client certificate was
actually issued. Whether the certificate names the right node and is still
valid. Then the kubelet's own configuration, and only then reachability and
authorization, once authentication succeeds.

**Teacher:** Why did the successful join command not settle this?

**Maya:** It proved the command completed its part. It did not prove approval,
issuance, installation, and subsequent authenticated requests all worked.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — how a rule gets its subject and its reach;

two — why one Role cannot prove least privilege;

three — the guarded path from binding creation to actual escalation;

four — how a kubelet earns its node identity; and

five — how authentication, authorization and admission divide one request.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

A role supplies rules, while a binding supplies subjects and reach. A
RoleBinding grants only in its own namespace, even when it references a
ClusterRole. A ClusterRoleBinding grants cluster-wide. RBAC permissions are
additive, so effective access is the union of the reachable binding and
identity graph — audit the graph, not one file.

Creating bindings alone does not permit arbitrary escalation. The caller must
already hold the target permissions, or hold the special bind permission on
that role. Extending a role beyond your own permissions is guarded the same
way, by the special escalate permission.

A kubelet starts from a temporary bootstrap credential, submits a certificate
signing request, and after approval reconnects with a durable identity built
on the node's own name, in a group shared by all nodes. Authentication
establishes that identity. The Node authorizer limits its API actions.
NodeRestriction admission constrains certain changes it may make.

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
for the expository Module 21. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
