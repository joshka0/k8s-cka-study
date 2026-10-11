# Review request: rewritten module openings and closings

Every module in this Kubernetes CKA-prep course had its opening (`locate`) and
closing (`close`) narration rewritten. Review your assigned module range.

Your range is given in the prompt. Read each module's `script.json` under
`modules/`, and review **only** the first beat and the last beat of each.

Narration is spoken by a text-to-speech voice and drawn on screen as captions.

## Why they were rewritten

The course grows — 12 modules, then 20, now 27, and it will grow again. The old
narration was coupled to the module set, so adding a module meant editing its
neighbours: references to a separate pilot video, module ordinals ("this module
is the first one"), spine ordinals ("segment five of the spine"), "the next
module is …" ending every close, and "the last module", already false in three
places.

**A module must stand on its own.** A viewer who finds one video must not be
sent to another to understand it, and adding a 28th module must not require
editing any existing script.

Naming the spine is fine: it is a fixed 14-segment model of the request path and
does not change when modules are added. Naming a segment is correct. Numbering
one is not.

## Part 1 — technical accuracy

Baseline Kubernetes v1.36. This matters most. The openings were newly written
and have not been reviewed by anyone.

- Anything stated as always-true that is conditional.
- Overclaims. A previous pass on one module found three: "it has passed every
  gate" (a Pod can be Pending with `schedulingGates` blocking it, having passed
  nothing); "declared requests decide everything" (they govern the resource-fit
  check, not taints, affinity, topology, storage or gates); and "the scheduler
  already recorded which constraint eliminated what" (FailedScheduling events
  summarise reasons and node counts, not a node-by-node map). Look for that
  class of error.
- A hook that describes a symptom Kubernetes would not actually produce.
- A promise the module does not keep. The beat ids between the opening and the
  close tell you what the module actually covers.

## Part 2 — writing

The opening must earn the view: a **hook** (a concrete symptom or
contradiction), the **structure** (what the module covers), and a **promise**
(what the viewer can do afterwards). The close must land a portable takeaway —
the diagnostic question or rule the viewer carries away.

Style:

- **ASD-STE100 where it makes sense.** Short sentences, one idea per sentence,
  active voice, simple words where a simple word exists, one term per concept.
- Descriptive sentences at or below **25 words**. A linter checks this and
  currently reports zero violations. Do not introduce any.
- **Avoid prose.** No literary flourish, no scene-setting, no metaphor for its
  own sake. Technically focused throughout.
- Kubernetes Technical Names and Technical Verbs are exempt from the word list
  and must NOT be simplified: `evict`, `preempt`, `bind`, `admission`,
  `reconcile`, `provision`, `allocatable` and similar stay exactly as written.
- Spoken text. No markdown, no backticks, no bullets.

**Judgement required.** A previous reviewer, asked to rewrite rather than
review, produced a structure sentence that was a bare list of seven topics. It
passed every mechanical rule and gave nobody a reason to watch. If an opening
reads like a table of contents, say so. If it is already clear and accurate,
leave it alone and say nothing.

## What I want back

```
[module] open|close · KIND (wrong | misleading | imprecise | style)
  problem: <what is wrong, or what the viewer has to work at>
  fix:     <the corrected sentence or passage, ready to paste, spoken text>
```

Accuracy findings first, writing findings after. End with two lines:

`ACCURACY: N findings`
`WRITING: M findings`

## Rules

- **Do not edit any file** except the findings file named in the prompt.
- **Do not run renders, builds, npm install, or the dub script.** The machine is
  busy; a previous agent's render collided with ours and destroyed a run.
- No git operations. No subagents.
- If a claim is version-dependent, say so with the condition. An honest "this
  depends on X" beats a confident wrong correction.
- I would rather have 15 real findings than 100 opinions.
