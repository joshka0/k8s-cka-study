# Listen-in classroom pilot: kubeadm writes, then leaves

This is the classroom-dialogue version of Module 13. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students are not scripted as answer dispensers: they hesitate,
compress too early, and make plausible mistakes which expose the mechanism.

Factual authority remains `assets/cka-deep-content.js`, unit `u13`, plus its
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

**Teacher:** [warm, unhurried] A control-plane container is missing after a reboot.
Maya, where do people look first?

**Listener pause: 3 seconds**

**Maya:** The API — describe the Pod, read events.

**Teacher:** One investigation: when no API is available to tell you anything.
We build what kubeadm actually leaves behind, then skew and safe upgrade
order. Leon, if the static Pod manifest is gone, what does the kubelet lack?

**Listener pause: 3 seconds**

**Leon:** Desired state to recreate the container from.

### It composes, it does not manage

**Teacher:** [curious] Is kubeadm the cluster manager that keeps running?

**Listener pause: 3 seconds**

**Leon:** [uncertain] Yes — that is how the control plane stays healthy.

**Teacher:** [gentle] It composes, then exits. What durable artefacts does it
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

### Where the handoff happens

**Teacher:** Order of the durable handoff. First actor?

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

### The container is gone after a reboot

**Teacher:** Control-plane container absent after reboot. Is the highest-value
first check the API?

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

### Separate contracts, separate steps

**Teacher:** Why do upgrades move one compatibility boundary at a time?

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

### Drain protects, it does not upgrade

**Teacher:** Maya, does draining a node upgrade it?

**Listener pause: 3 seconds**

**Maya:** [confident] Drain is the upgrade step for workers.

**Teacher:** [gentle] What does drain do?

**Listener pause: 2 seconds**

**Leon:** Evacuate workloads — protect them.

**Teacher:** What do you still have to change yourself?

**Listener pause: 3 seconds**

**Maya:** [realizing] The node's configuration and binaries.

### The conservative order for a worker

**Teacher:** Conservative order. First?

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

### Neither one reconciles

**Teacher:** Helm packages and templates a release. Kustomize overlays plain
manifests. Are either a continuous reconciler?

**Listener pause: 3 seconds**

**Maya:** [uncertain] Helm with wait is continuous health.

**Teacher:** [gentle] Both produce output. Where does that output go?

**Listener pause: 3 seconds**

**Leon:** Ordinary API path and ordinary controller loops.

**Teacher:** Does packaging change what happens after the write?

**Listener pause: 2 seconds**

**Maya:** No.

### Safe, not merely successful

**Teacher:** What check comes before you start a control-plane upgrade?

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
for the expository Module 13. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
