# Listen-in classroom, extended: One volume, two different waits

Extended format of the u10 classroom script. Same facts, same cast, same
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

### One volume, two waits

**Teacher:** [warm] We will follow one analytics volume. First its claim stays
Pending before any Pod uses it. Later its Pod has a nodeName but stays in setup. Two waits, same volume, different owners.
Maya, are those the same storage
failure?

**Listener pause: 3 seconds**

**Maya:** Yes. Pending storage means the CSI driver cannot mount it.

**Teacher:** Can a mount happen before a node and volume exist?

**Listener pause: 2 seconds**

**Leon:** No.

**Teacher:** Then what broad boundary separates the two symptoms?

**Listener pause: 4 seconds**

**Leon:** The first can be binding or provisioning before node setup. The second
is attachment, staging, or publishing after scheduling.

**Teacher:** Checkpoint, Maya. One line: the two waits.

**Listener pause: 3 seconds**

**Maya:** Before scheduling is binding or provisioning; after is attach, stage,
or publish.

### Claim, class, volume

**Teacher:** Three objects, three jobs — get the scopes right before chasing
drivers. Three objects, three jobs — get the scopes right first. Which object is the application's namespaced request for storage?

**Listener pause: 2 seconds**

**Maya:** A PersistentVolumeClaim, or PVC.

**Teacher:** What does it request?

**Listener pause: 3 seconds**

**Leon:** Size, access mode, and a storage class.

**Teacher:** Which object represents cluster-scoped capacity?

**Listener pause: 2 seconds**

**Maya:** A PersistentVolume, or PV.

**Teacher:** Which object supplies the provisioning and binding recipe?

**Listener pause: 2 seconds**

**Leon:** A StorageClass.

**Teacher:** Leon, is the PV inside the claimant's namespace?

**Listener pause: 3 seconds**

**Leon:** Yes. The claim and its volume share namespace scope.

**Teacher:** Which of the three is namespaced?

**Listener pause: 3 seconds**

**Maya:** Only the PVC. PV and StorageClass are cluster-scoped.

**Teacher:** Where does reclaim policy belong?

**Listener pause: 3 seconds**

**Leon:** On the PV's capacity contract. Access mode and reclaim policy are not
incidental details.

**Teacher:** Before we move on — Leon, one line. PVC, PV, StorageClass.

**Listener pause: 3 seconds**

**Leon:** PVC requests; PV is capacity; StorageClass is the recipe — only the
PVC is namespaced.

### Pending by design

**Teacher:** The StorageClass uses WaitForFirstConsumer. No Pod references the
PVC yet. Some Pending is deliberate until topology is known. Maya, should the PVC already be Bound?

**Listener pause: 3 seconds**

**Maya:** Yes. A Pending claim always signals missing capacity or a broken
provisioner.

**Teacher:** What information is deliberately absent before a consumer is
scheduled?

**Listener pause: 4 seconds**

**Leon:** The topology where the Pod can actually run.

**Teacher:** Why can immediate provisioning be harmful for zonal storage?

**Listener pause: 4 seconds**

**Maya:** It can create the volume in a zone where no node can run the Pod.

**Teacher:** What sequence does WaitForFirstConsumer enable?

**Listener pause: 5 seconds**

**Leon:** The scheduler selects a feasible topology from the Pod constraints and
driver topology signals. Then the provisioner creates the volume there.

**Teacher:** Is that a mutual standoff between scheduler and provisioner?

**Listener pause: 3 seconds**

**Leon:** Yes. Each waits for the other to choose.

**Teacher:** Who selects first under this mode?

**Listener pause: 3 seconds**

**Maya:** [realizing] The scheduler selects topology first. The provisioner then
creates storage in it.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: why WaitForFirstConsumer
can leave a claim Pending by design.

**Listener pause: 3 seconds**

**Maya:** No consumer yet means no topology — the scheduler chooses first, then
provisioning runs.

### Four different Pending causes

**Teacher:** A consumer now exists, but the claim still does not progress. One stuck claim can have four different evidence paths. Can
the workload replica count tell us why?

**Listener pause: 3 seconds**

**Maya:** Yes. Too many replicas explain a stuck claim.

**Teacher:** Which four causes should the evidence distinguish?

**Listener pause: 6 seconds**

**Leon:** It may still be waiting deliberately. Capacity may be unavailable.
Quota may have rejected provisioning. Or no node may satisfy both compute and
storage topology.

**Teacher:** Do those causes share one fix?

**Listener pause: 2 seconds**

**Maya:** No. We need claim events, StorageClass behavior, capacity or quota
evidence, and scheduler topology evidence.

**Teacher:** Checkpoint, Leon. One line: four Pending causes need four evidence
paths.

**Listener pause: 3 seconds**

**Leon:** Deliberate wait, capacity, quota, or topology — each has different
evidence.

### Two CSI halves

**Teacher:** The claim binds and a PV appears. CSI has two halves that never
call each other. Leon, describe the control-plane half of CSI. CSI has two halves that never call each other.

**Listener pause: 4 seconds**

**Leon:** Sidecars watch Kubernetes objects and call CSI Controller RPCs.

**Teacher:** Which common sidecars provision and attach?

**Listener pause: 3 seconds**

**Maya:** external-provisioner and external-attacher.

**Teacher:** Which optional features add more sidecars?

**Listener pause: 3 seconds**

**Leon:** Resizing can add external-resizer. Snapshots can add
external-snapshotter.

**Teacher:** What runs on the node half?

**Listener pause: 3 seconds**

**Maya:** A privileged CSI node plugin that performs node RPCs so the kubelet can
mount the volume into a container.

**Teacher:** Do the controller sidecars call the node plugin directly?

**Listener pause: 3 seconds**

**Maya:** Yes. The two halves form one driver service.

**Teacher:** What connects them instead?

**Listener pause: 4 seconds**

**Leon:** API objects, chiefly the PV and VolumeAttachment. The halves do not
call each other.

**Teacher:** Which half must be privileged and present on every node?

**Listener pause: 2 seconds**

**Leon:** The node plugin, because mounting is node-local and privileged.

**Teacher:** Before we move on — Maya, one line. How do the CSI halves meet?

**Listener pause: 3 seconds**

**Maya:** Through API objects — PV and VolumeAttachment — never by calling each
other.

### From selected node to attachment

**Teacher:** First, a recall — Leon, remind us. Which common sidecar attaches?

**Listener pause: 2 seconds**

**Leon:** external-attacher.

**Teacher:** Hold that. The Pod receives nodeName. Who creates the
VolumeAttachment object?

**Listener pause: 3 seconds**

**Maya:** external-attacher.

**Teacher:** Which Kubernetes controller decides that an attached volume is
needed on that node?

**Listener pause: 3 seconds**

**Leon:** The attach-detach controller.

**Teacher:** So divide the work.

**Listener pause: 4 seconds**

**Leon:** The attach-detach controller creates VolumeAttachment. The
external-attacher watches it and calls ControllerPublishVolume on the CSI
controller service.

**Teacher:** What does a missing PV suggest compared with a successful attach
and failed mount?

**Listener pause: 4 seconds**

**Maya:** No PV points toward provisioning or controller-side work. A PV and
successful attach with no mount points toward the node side.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: who creates
VolumeAttachment, and who drives the CSI attach call.

**Listener pause: 3 seconds**

**Leon:** Attach-detach controller creates the object; external-attacher calls
ControllerPublishVolume.

### Stage and publish

**Teacher:** On the node, attachment is not yet a mount into the Pod. Attachment is not yet a mount into the Pod. What
optional call prepares one volume for use on that node?

**Listener pause: 3 seconds**

**Leon:** NodeStageVolume.

**Teacher:** How often does it run when the driver supports staging?

**Listener pause: 3 seconds**

**Leon:** Once per node, regardless of volume.

**Teacher:** What is the actual unit?

**Listener pause: 3 seconds**

**Maya:** Once per volume per node.

**Teacher:** Which call then exposes that volume at one Pod's target?

**Listener pause: 2 seconds**

**Leon:** NodePublishVolume.

**Teacher:** Does each driver require the stage call?

**Listener pause: 3 seconds**

**Maya:** Yes. Stage always precedes publish.

**Teacher:** What can a driver without staging capability do?

**Listener pause: 3 seconds**

**Leon:** Go directly to NodePublishVolume.

**Teacher:** What does a stage failure implicate compared with a publish failure?

**Listener pause: 4 seconds**

**Maya:** Stage means the device never became usable on the node. Publish means
the usable volume failed to reach one Pod target.

**Teacher:** Checkpoint, Maya. One line: stage versus publish.

**Listener pause: 3 seconds**

**Maya:** Stage prepares the volume on the node; publish exposes it at one Pod
target.

### The scheduled Pod that cannot mount

**Teacher:** First, a recall — Leon, remind us. What object connects controller
attach work to the node?

**Listener pause: 2 seconds**

**Leon:** VolumeAttachment.

**Teacher:** Hold that. Our Pod has nodeName and reports a mount failure. What
object gives the fastest control-side versus node-side split?

**Listener pause: 3 seconds**

**Leon:** VolumeAttachment.

**Teacher:** If attachment did not succeed, where do we look next?

**Listener pause: 4 seconds**

**Maya:** The relevant controller-side CSI sidecar logs and provider response.

**Teacher:** If attachment succeeded?

**Listener pause: 4 seconds**

**Leon:** Confirm the node plugin registered on that node. Read its logs and the
kubelet logs for NodeStageVolume or NodePublishVolume errors.

**Teacher:** What device-level causes remain after the call is located?

**Listener pause: 5 seconds**

**Maya:** Credentials, device state, filesystem problems, and multi-attach
constraints.

**Teacher:** When can the kubelet start a container that requires the mount?

**Listener pause: 3 seconds**

**Leon:** Only after the required volume is published into that Pod's target.

**Teacher:** Before we move on — Maya, one line. How VolumeAttachment splits a
mount failure.

**Listener pause: 3 seconds**

**Maya:** Failed attach points controller-side; successful attach points to the
node plugin and publish path.

### Listener reconstruction

**Teacher:** Your turn, without the students.

For the analytics volume, explain:

one — the distinct jobs and scopes of PVC, PV, and StorageClass;

two — why WaitForFirstConsumer can leave a claim Pending by design;

three — how scheduling topology leads to provisioning;

four — how the CSI controller and node halves meet without calling each other;
and

five — how VolumeAttachment, NodeStageVolume, and NodePublishVolume locate a
scheduled Pod's mount failure.

**Listener pause: 35 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed
answer.

A PVC is a namespaced request for size, access mode, and class. A PV is
cluster-scoped capacity with reclaim policy. A StorageClass is the cluster-wide
provisioning and binding recipe. WaitForFirstConsumer deliberately waits until a
Pod lets the scheduler select feasible topology. The provisioner then creates
storage there. A stuck claim can instead mean capacity, quota, or incompatible
topology, which require different evidence.

On the control-plane half, sidecars watch API objects and call CSI Controller
RPCs. On every node, a privileged plugin performs node calls. They meet through
PV and VolumeAttachment objects, not direct calls. The attach-detach controller
creates VolumeAttachment. external-attacher responds with
ControllerPublishVolume.

After attachment, an optional NodeStageVolume prepares one volume per node.
NodePublishVolume exposes it per Pod target. A driver without staging publishes
directly. Check VolumeAttachment first, then controller sidecars or node plugin
registration and node logs according to where the failure lies. Binding,
attachment, staging, and publishing are different owners and different evidence.

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

After one listen, ask the learner to trace one volume from claim and topology
through attachment, staging, and Pod publication in ninety seconds. Score causal
ordering and boundary discrimination, not verbatim recall or learner
preference.
