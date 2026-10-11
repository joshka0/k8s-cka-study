# Guided reconstruction pilot: RBAC and node trust

This is an alternative teaching script for Module 21. It is designed for
audio or text, with no video dependency. Its method is cumulative
reconstruction: give the learner the minimum facts, ask them to derive the
mechanism, pause, then resolve the answer and reuse it in a harder problem.

Factual authority remains `assets/cka-deep-content.js`, unit `u21`. The script
deliberately includes no new Kubernetes claims beyond that lesson and its
reviewed upstream sources.

## Delivery notation

- **Narrator** is spoken.
- **Prompt** is spoken, then the recording becomes silent.
- `[pause: Ns]` is real silence, not spoken text.
- **Resolution** is spoken after the pause.
- A learner should answer aloud. Exact Kubernetes vocabulary is introduced
  after the learner has first reconstructed the idea in plain language.

Suggested first run: about 13 minutes. Do not speed up the pauses. Their purpose
is retrieval, not dramatic timing.

---

## Script

### 1. The contract

**Narrator**

We are going to build Kubernetes authorization from a few small rules. I will
not ask you to remember a diagram. I will give you a fact, and you will use it
to predict what Kubernetes must do next.

Answer aloud, even when the answer seems obvious. If you cannot answer, make a
guess. The correction is more useful after a committed guess than after
silence.

Here is the first fact.

An RBAC permission needs two things: a rule, and a reach.

The rule says what action is allowed: for example, get Pods.

The reach says where that rule applies: one namespace, or the cluster.

Keep those two words: rule and reach.

### 2. Build scope from two objects

**Narrator**

A Role contains rules and belongs to one namespace.

A ClusterRole also contains rules, but is not owned by one namespace.

Neither one grants anything to a person by itself. A binding connects rules to
a subject.

**Prompt**

Suppose a ClusterRole contains the rule “get Pods.” I connect it to a user with
a RoleBinding in the `payments` namespace. Where can that user get Pods?

[pause: 7s]

**Resolution**

Only in `payments`.

The ClusterRole supplied the rule. The RoleBinding supplied the reach. A
ClusterRole is reusable across namespaces, but a RoleBinding does not turn into
a cluster-wide grant merely because it references one.

Say the mechanism aloud in one sentence: the role supplies the rule; the
binding supplies the reach.

[pause: 5s]

**Narrator**

Now change only the binding. The same ClusterRole is connected with a
ClusterRoleBinding.

**Prompt**

What changed: the rule, the reach, or both?

[pause: 6s]

**Resolution**

Only the reach. The rule is still “get Pods.” The ClusterRoleBinding makes that
rule effective across the cluster.

This is why scope is part of the permission. Naming the role is not enough.
You must name how it is bound.

### 3. Remove a tempting but invalid model

**Narrator**

Kubernetes RBAC is additive. Applicable grants are combined as a union. There
is no RBAC deny rule that subtracts permission granted somewhere else.

**Prompt**

A ServiceAccount has a Role that permits only `get` on ConfigMaps. Can you
conclude that it cannot delete Secrets?

[pause: 7s]

**Resolution**

No. You have inspected one source of permission, not the effective permission
set.

Another RoleBinding might reach the ServiceAccount directly. A
ClusterRoleBinding might reach it through a group. The permission you observed
is true, but your conclusion about everything else is unsupported.

**Prompt**

Then what must you inspect to determine effective permission?

[pause: 8s]

**Resolution**

Every applicable binding, the rules each binding reaches, and every identity or
group membership through which the subject is selected.

The compact model is this: least privilege is a property of the effective
graph, not of one Role.

### 4. Reconstruct a practical check

**Narrator**

Let us turn that model into an operational question.

The ServiceAccount is named `reader`. It is in the `payments` namespace. A
ServiceAccount's API identity has three pieces: the prefix
`system:serviceaccount`, then its namespace, then its name.

**Prompt**

Construct its full identity aloud.

[pause: 7s]

**Resolution**

`system:serviceaccount:payments:reader`.

Now you want to ask the configured authorizers whether that identity may get
Pods in `payments`.

You know the command begins with `kubectl auth can-i get pods`. You also need
the namespace and the identity to impersonate for this check.

**Prompt**

Construct the rest of the command. Do not worry about argument order; include
the two facts that matter.

[pause: 10s]

**Resolution**

One valid form is:

`kubectl auth can-i get pods --namespace payments --as system:serviceaccount:payments:reader`

The command is useful because it asks about effective authorization. It does
not merely print the Role you happened to find first.

### 5. Derive escalation instead of memorizing a warning

**Narrator**

Now suppose a user is allowed to create RoleBindings. A common shortcut says:
“Then the user can bind themselves to cluster-admin.”

Kubernetes has an escalation guard. To bind a role, the caller must already
hold the permissions contained in that role at the relevant scope, or have the
special `bind` permission for that role.

**Prompt**

So is permission to create RoleBindings, by itself, enough to grant yourself
arbitrary powers?

[pause: 7s]

**Resolution**

No. Creating the binding object is necessary, but Kubernetes also checks
whether the caller may confer those permissions.

**Prompt**

What extra fact would make the path dangerous?

[pause: 8s]

**Resolution**

The caller already holds every permission in the target role, or holds `bind`
on that role. Likewise, creating or editing a role beyond your current powers
requires the relevant permissions or the special `escalate` verb.

Do not reduce the audit to “can create bindings.” Reconstruct the whole path:
can create the binding, and can legally confer the target role.

Two other paths matter.

Impersonation borrows another identity for an API request.

ClusterRole aggregation can cause one ClusterRole to absorb rules from other
ClusterRoles selected by labels.

**Prompt**

Why can inspecting only the final ClusterRole YAML miss an aggregation risk?

[pause: 8s]

**Resolution**

Because the effective rules can be assembled from other labeled ClusterRoles.
Changing a matching source role or its labels can change the aggregate's
permissions.

Again, the graph is the object of study.

### 6. Transfer the same model to nodes

**Narrator**

We now move from a workload identity to a node identity.

A Node object is stored data. A kubelet is a client making API requests. The
object's existence does not authenticate the client.

A new kubelet begins with temporary bootstrap credentials. It uses them to
submit a certificate signing request. After approval and issuance, it receives
a client certificate. The conventional username is
`system:node:<node-name>`, and the identity belongs to the `system:nodes`
group.

**Prompt**

Reconstruct the trust sequence in four steps, beginning with the temporary
credential and ending with the node identity.

[pause: 12s]

**Resolution**

Bootstrap credential. Certificate signing request. Approval and certificate
issuance. Reconnect as `system:node:<node-name>` in `system:nodes`.

The important transition is not “a Node object was created.” It is “the
kubelet obtained an authenticated identity.”

### 7. Separate three request gates

**Narrator**

We now have three different questions.

Authentication asks: who is making this request?

Authorization asks: may this identity perform this API action?

Admission asks: is this particular proposed object or mutation acceptable?

For kubelets, the Node authorizer limits which API operations the authenticated
node may request. NodeRestriction admission then constrains certain Node and Pod
mutations that reach admission.

**Prompt**

A kubelet presents an expired client certificate. Which of the three questions
fails first: authentication, authorization, or admission?

[pause: 6s]

**Resolution**

Authentication. Kubernetes cannot establish the request's trusted identity, so
there is no authenticated principal to authorize.

**Prompt**

The certificate is valid, but the kubelet asks to read an unrelated Secret.
Which question is central now?

[pause: 6s]

**Resolution**

Authorization. Kubernetes knows which node is asking; the Node authorizer
decides whether that node relationship permits the operation.

**Prompt**

The kubelet is authorized to update its Node object, but the proposed mutation
changes a protected label it is not allowed to set. Which question is central?

[pause: 6s]

**Resolution**

Admission. The identity may request an update, but NodeRestriction can reject
the content of that update.

Say the three questions once, without the Kubernetes names.

[pause: 8s]

**Resolution**

Who are you? May you do this operation? Is this proposed change acceptable?

Those are authentication, authorization, and admission.

### 8. Diagnose from the missing transition

**Narrator**

A worker ran its join command successfully. It appears in the API, but remains
NotReady. The kubelet log contains certificate errors. The scheduler is
healthy.

**Prompt**

Where do you investigate first, and why is the scheduler a poor first target?

[pause: 12s]

**Resolution**

Investigate the kubelet's bootstrap and client identity: pending or denied
CSRs, the issued certificate, its subject and validity, and the kubelet
kubeconfig.

The scheduler places Pods only after the node can participate as a working API
client and report its state. A successful join command did not prove the
certificate handoff completed. Certificate errors point to the earlier trust
transition.

### 9. Cold reconstruction

**Narrator**

Now reconstruct the whole mechanism without help. I will give you the start and
the symptom.

A ServiceAccount cannot list Pods in one namespace. Separately, a new node is
NotReady with certificate errors.

Build the explanation from the beginning. Include:

how an RBAC rule receives scope;

why permissions must be unioned;

how you would ask about effective permission;

why creating bindings alone does not imply arbitrary escalation;

how a kubelet obtains its node identity;

and where authentication, authorization, and admission differ.

[pause: 30s]

**Resolution**

A role supplies rules and a binding connects those rules to subjects with a
scope. A RoleBinding grants within its namespace, even when it references a
ClusterRole; a ClusterRoleBinding grants cluster-wide. RBAC grants are
additive, so effective access is the union of all applicable bindings, roles,
groups, impersonation paths, and aggregated rules. `kubectl auth can-i`, with
the correct namespace and impersonated ServiceAccount identity, asks about that
effective authorization.

Creating bindings alone does not bypass escalation prevention. The caller must
already hold the target permissions or be allowed to `bind` the role; extending
role permissions similarly requires the permissions or `escalate`.

A kubelet starts with bootstrap credentials, submits a CSR, receives a client
certificate, and reconnects as `system:node:<node-name>` in `system:nodes`.
Authentication establishes that identity. The Node authorizer decides which
API actions it may request. NodeRestriction admission constrains the content of
allowed mutations. Therefore a missing RBAC grant is an authorization problem,
while kubelet certificate failure is first an authentication problem.

### 10. Interview compression

**Narrator**

Compress the lesson into three interview sentences.

[pause: 12s]

**Resolution**

First: scope is part of an RBAC permission—the role supplies rules, while the
binding determines subjects and reach.

Second: effective permission is the additive union of the whole reachable
grant graph, including binding, impersonation, and aggregation paths.

Third: a kubelet must first authenticate as a node; the Node authorizer then
limits its API actions, and NodeRestriction admission limits certain mutations.

If you can regenerate those sentences from the mechanisms rather than recite
them from memory, the experiment has worked.

---

## Evaluation rubric

After one listen, test the learner without replaying the script. The experiment
is successful if they can:

1. Derive the effect of ClusterRole plus RoleBinding without a scope matrix.
2. Reject the claim that one narrow Role proves least privilege.
3. Construct the ServiceAccount identity and an effective `auth can-i` check.
4. Explain the `bind` / `escalate` guard instead of repeating “binding creation
   equals privilege escalation.”
5. Reconstruct kubelet bootstrap identity in causal order.
6. Classify certificate failure, forbidden API action, and rejected mutation as
   authentication, authorization, and admission respectively.
7. Give the cold reconstruction in under ninety seconds with no factual
   correction required.

Compare those results with the existing expository Module 21 using the same
cold-reconstruction prompt. The useful metric is mechanism reconstruction, not
which version the learner says they preferred.
