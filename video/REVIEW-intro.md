# Task: rewrite one module's opening and closing narration

This is narration for a Kubernetes CKA-prep video. It is spoken aloud by a
text-to-speech voice and also drawn on screen as captions. Write for the ear.

Target: **module u06-scheduling — "Choose, Then Commit"**, the scheduler queue
and binding segment. Its beats, in order:

`locate` (the opening), two-cycles, filter-then-score, what-it-writes,
reserve-unreserve, requests-not-usage, request-errors, pending-ladder,
nominated-node, preemption-policy, `close` (the closing).

You are rewriting **only** the `locate` and `close` narration.

## The problem being fixed

The course is an evolving set of modules — it grew from 12 to 20 to 27, and it
will grow again. The narration had hard dependencies on the module set, so
adding a module meant editing its neighbours:

- references to a separate pilot video
- module ordinals: "this module is the first one", "same segment as module four"
- spine ordinals: "segment five of the spine"
- "the next module is …" at the end of every close, making a linked list
- "the last module …", already false in three places

**A module must stand on its own.** A viewer who finds this one video must not
be sent to another video to understand it, and adding a 28th module must not
require editing this script.

The spine itself is fine to name. It is a fixed 14-segment model of the request
path — control plane, node, pod — and it does not change when modules are
added. Name the segment ("the scheduler queue and binding segment"). Do not
number it.

## What the opening must do

Give the viewer a reason to watch: a hook, a promise, and the structure.

- **Hook** — a concrete symptom, contradiction or misconception. Specific, not
  a topic announcement.
- **Structure** — what the module covers, so the viewer knows the shape.
- **Promise** — what the viewer can do afterwards.

## What the closing must do

Land the module on a portable takeaway: the diagnostic question or rule the
viewer carries away. No pointer to any other module.

## Style

- **ASD-STE100 (Simplified Technical English) where it makes sense.** Short
  sentences, one idea per sentence, active voice, simple words where a simple
  word exists, one term per concept.
- Descriptive sentences at or below **25 words**. This is checked by a linter.
- **Avoid prose.** No literary flourish, no scene-setting, no metaphor for its
  own sake. Technically focused throughout.
- Kubernetes Technical Names and Technical Verbs are exempt from the word list
  and must not be simplified: `evict`, `preempt`, `bind`, `admission`,
  `reconcile`, `allocatable`, and similar stay exactly as they are.
- Spoken text. No markdown, no backticks, no bullet characters — a backtick is
  drawn on screen as a literal character and read aloud as nothing.
- Baseline Kubernetes v1.36. Technical accuracy outranks style. If a phrasing
  is neat but wrong, it is wrong.

## The three versions

### A — original (coupled, being replaced)

OPEN:
> Segment five of the spine: the scheduler queue and binding. The pilot showed a Pod picking up a node name in a second or two. This module is the machinery behind that name, why a Pod sits Pending in a cluster that looks empty, and what preemption actually costs.

CLOSE:
> Segment five, then. A failure here has a signature: the Pod exists, it has passed every gate, and it has no node name. No kubelet has been asked to run the Pod yet. Node state can still be the cause. Check readiness, schedulability, taints, labels, allocatable resources, topology and storage constraints. The scheduler compares all of them before it writes a node name. Once that name is written the failure moves — to the kubelet, the runtime, and the boundaries they own. That is module seven.

### B — current rewrite (mine, the one to beat)

OPEN:
> A Pod is Pending in a cluster that looks half empty. The scheduler is not broken and the nodes are not full. This is the scheduler queue and binding segment of the request path. It covers how a node is chosen, why declared requests decide everything and live usage decides nothing, and what preemption costs. By the end you can read a Pending Pod's events and name the constraint that stopped it.

CLOSE:
> The scheduler queue and binding segment, then. A failure here has a signature: the Pod exists, it has passed every gate, and it has no node name. No kubelet has been asked to run the Pod yet. Node state can still be the cause. Check readiness, schedulability, taints, labels, allocatable resources, topology and storage constraints. The scheduler compares all of them before it writes a node name. Once that name is written the failure moves — to the kubelet, the runtime, and the boundaries they own. Read the events before you read the nodes. The scheduler already recorded which constraint eliminated what.

### C — yours

Write your own OPEN and CLOSE. Do not edit B into shape; write the version you
would ship, then say plainly where B is weak and where B is better than yours.

## Output

Write to `REVIEW-FINDINGS-intro.md` in this directory, in this shape:

```
## OPEN
<your narration, plain spoken text, one paragraph>

## CLOSE
<your narration, plain spoken text, one paragraph>

## Why mine is better
<specific, concrete — name the sentence>

## Where B beats mine
<be honest; if B is better in places, say which>

## Accuracy notes
<anything in A or B that is technically wrong or imprecise at v1.36>
```

## Rules

- **Do not edit any file** except `REVIEW-FINDINGS-intro.md`.
- **Do not run renders, builds, npm install, or the dub script.** The machine is
  busy and a previous agent's render collided with ours and destroyed a run.
- No git operations.
- Do not spawn subagents.
- Check your own sentences against the 25-word limit before you write them out.
