# Listen-in classroom, extended: kubeadm writes, then leaves

Extended format of the u13 classroom pilot. Same facts, same cast, same
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

**Teacher:** [warm, unhurried] A control-plane container is missing after a
reboot. The API may be the wrong first stop when the API is part of what is
gone. The API may be the wrong first stop when the API is part of what is gone. Maya, where do people look first?

**Listener pause: 3 seconds**

**Maya:** The API — describe the Pod, read events.

**Teacher:** One investigation: when no API is available to tell you anything.
We build what kubeadm actually leaves behind, then skew and safe upgrade
order. Leon, if the static Pod manifest is gone, what does the kubelet lack?

**Listener pause: 3 seconds**

**Leon:** Desired state to recreate the container from.

**Teacher:** Checkpoint, Maya. One line: what the missing manifest means.

**Listener pause: 3 seconds**

**Maya:** The kubelet has no durable desired state for that control-plane
container.

### It composes, it does not manage

**Teacher:** [curious] Is kubeadm the cluster manager that keeps running? kubeadm writes artefacts, then leaves.

**Listener pause: 3 seconds**

**Leon:** [uncertain] Yes — that is how the control plane stays healthy.

**Teacher:** [gentle] What durable artefacts does it
write?

**Listener pause: 5 seconds**

**Maya:** PKI and kubeconfigs, static Pod manifests for control-plane
components, discovery, tokens, and essential configuration.

**Teacher:** Who realises those manifests?

**Listener pause: 2 seconds**

**Leon:** The kubelet.

**Teacher:** Is there a kubeadm daemon afterwards?

**Listener pause: 2 seconds**

**Maya:** No.

**Teacher:** Before we move on — Leon, one line. What kubeadm does and does not
do after it exits.

**Listener pause: 3 seconds**

**Leon:** It wrote durable artefacts — there is no kubeadm daemon managing the
plane.

### Where the handoff happens

**Teacher:** Order of the durable handoff. The durable handoff has an order, including separate CNI. First actor?

**Listener pause: 3 seconds**

**Leon:** kubeadm — configuration, PKI, manifests.

**Teacher:** Second?

**Listener pause: 2 seconds**

**Maya:** The kubelet realises the static Pods.

**Teacher:** Then what lets other nodes join?

**Listener pause: 3 seconds**

**Leon:** API objects and bootstrap tokens.

**Teacher:** When is CNI installed relative to that run?

**Listener pause: 3 seconds**

**Maya:** Separately, afterwards.

**Teacher:** Can a fresh cluster have a running control plane and no Pod
networking?

**Listener pause: 2 seconds**

**Leon:** Yes.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: handoff order after
kubeadm.

**Listener pause: 3 seconds**

**Maya:** kubelet realises static Pods; tokens admit nodes; CNI is separate
afterwards.

### The container is gone after a reboot

**Teacher:** First, a recall — Leon, remind us. Who realises static Pod
manifests?

**Listener pause: 2 seconds**

**Leon:** The kubelet.

**Teacher:** Hold that. Control-plane container absent after reboot. Is the
highest-value first check the API?

**Listener pause: 3 seconds**

**Maya:** [confident] Yes — the mirror Pod is the process.

**Teacher:** [gentle] How is a kubeadm control plane represented on disk?

**Listener pause: 3 seconds**

**Leon:** Static Pod manifests.

**Teacher:** If the kubelet cannot read or realise one, what may the API object
be?

**Listener pause: 4 seconds**

**Maya:** [realizing] A stale mirror Pod — not the running process.

**Teacher:** What two places do you read?

**Listener pause: 3 seconds**

**Leon:** The manifests directory and the kubelet.

**Teacher:** Treat the API view as what?

**Listener pause: 2 seconds**

**Maya:** A reflection, not the truth.

**Teacher:** Checkpoint, Leon. One line: first evidence after reboot when a
control-plane container is gone.

**Listener pause: 3 seconds**

**Leon:** Manifests on disk and the kubelet — not a possibly stale mirror Pod.

### Separate contracts, separate steps

**Teacher:** One version for all boundaries is an outage risk. Why do upgrades move one compatibility boundary at a time?

**Listener pause: 4 seconds**

**Leon:** Because there is more than one boundary.

**Teacher:** Name boundaries with their own skew or compatibility limits.

**Listener pause: 6 seconds**

**Maya:** Control-plane components, kubelets, kube-proxy. Container runtime,
network plugin, and APIs you still store.

**Teacher:** What does treating the cluster as a single version turn an upgrade
into?

**Listener pause: 2 seconds**

**Leon:** An outage.

**Teacher:** Before we move on — Maya, one line. Why one boundary at a time?

**Listener pause: 3 seconds**

**Maya:** Each boundary has its own skew — treating one version for all is an
outage risk.

### Drain protects, it does not upgrade

**Teacher:** Evacuation is not the binary upgrade. Maya, does draining a node upgrade it?

**Listener pause: 3 seconds**

**Maya:** [confident] Drain is the upgrade step for workers.

**Teacher:** [gentle] What does drain do?

**Listener pause: 2 seconds**

**Leon:** Evacuate workloads — protect them.

**Teacher:** What do you still have to change yourself?

**Listener pause: 3 seconds**

**Maya:** [realizing] The node's configuration and binaries.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: what drain is and is not.

**Listener pause: 3 seconds**

**Leon:** Evacuation and protection — not the binary upgrade.

### The conservative order for a worker

**Teacher:** Conservative order. Never hand traffic to a node nobody has checked. First?

**Listener pause: 2 seconds**

**Leon:** Evacuate.

**Teacher:** Second?

**Listener pause: 2 seconds**

**Maya:** Change configuration and binaries.

**Teacher:** Third?

**Listener pause: 2 seconds**

**Leon:** Verify the node that comes back.

**Teacher:** Fourth?

**Listener pause: 2 seconds**

**Maya:** Restore scheduling.

**Teacher:** What does restoring scheduling before verify hand traffic to?

**Listener pause: 3 seconds**

**Leon:** A node nobody has checked.

**Teacher:** Checkpoint, Maya. One line: worker upgrade order.

**Listener pause: 3 seconds**

**Maya:** Evacuate, change, verify, then uncordon — never traffic before check.

### Neither one reconciles

**Teacher:** Helm packages and templates a release. Kustomize overlays plain
manifests. Packaging ends at the write; controllers own what follows. Are either a continuous reconciler?

**Listener pause: 3 seconds**

**Maya:** [uncertain] Helm with wait is continuous health.

**Teacher:** [gentle] Where does that output go?

**Listener pause: 3 seconds**

**Leon:** Ordinary API path and ordinary controller loops.

**Teacher:** Does packaging change what happens after the write?

**Listener pause: 2 seconds**

**Maya:** No.

**Teacher:** Before we move on — Leon, one line. What packaging tools do after
the write.

**Listener pause: 3 seconds**

**Leon:** Nothing continuous — ordinary controllers own the objects from there.

### Safe, not merely successful

**Teacher:** First, a recall — Maya, remind us. What does drain not do?

**Listener pause: 2 seconds**

**Maya:** It does not upgrade binaries or configuration.

**Teacher:** Hold that. What check comes before you start a control-plane
upgrade?

**Listener pause: 3 seconds**

**Leon:** A version-skew check — upgrade plan on a kubeadm cluster.

**Teacher:** When do you check etcd and API health — only at the end?

**Listener pause: 3 seconds**

**Maya:** Between every step.

**Teacher:** How many failure domains at a time?

**Listener pause: 2 seconds**

**Leon:** One — so a bad step cannot take quorum.

**Teacher:** Drain where it applies. Then what sequence of kubeadm and package
steps?

**Listener pause: 4 seconds**

**Maya:** Upgrade apply, upgrade node, and the kubelet packages.

**Teacher:** What about rollback material?

**Listener pause: 3 seconds**

**Leon:** Verified, not assumed.

**Teacher:** Checkpoint, Maya. One line: what makes an upgrade safe, not merely
successful.

**Listener pause: 4 seconds**

**Maya:** Skew check, health between steps, one failure domain, verified
rollback.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — what kubeadm writes and who realises it after kubeadm exits;

two — handoff order including separate CNI;

three — static manifests versus stale mirror Pods after reboot;

four — skew boundaries, drain versus upgrade, and worker order; and

five — what makes a control-plane upgrade safe rather than merely successful.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

kubeadm composes: PKI, kubeconfigs, static Pod manifests, tokens and config —
then exits. The kubelet realises manifests. Tokens and API objects admit nodes;
CNI is separate afterwards. After reboot, read manifests and kubelet first; a
mirror Pod can be a stale reflection. Skew is many boundaries: control plane,
kubelet, kube-proxy, runtime, network, stored APIs. Drain evacuates; it does
not upgrade — change binaries yourself. Worker order: evacuate, change, verify,
uncordon. Helm and Kustomize package; neither reconciles. Safe upgrade: skew
check, health between steps, one failure domain, drain where needed, apply and
node and kubelet packages, verified rollback. When the API cannot tell you,
the files on disk still can.

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
