# Brief: author exam questions from your dissection

You dissected a range of walkthrough transcripts into diagnostic paths. Now
turn the worthwhile ones into exam questions for a timed practice exam.

Write **original questions**. Do not copy the wording of the source questions.
You are testing the same competencies with your own scenarios, names, and
namespaces — a candidate who memorised the source should still have to think.

## Selection

From your range, take **every `high`** item and the **strongest `medium`**
ones, up to **8 questions total**. Then add exactly **one `low`** item.

The low one is deliberate. The real exam includes "write this command" tasks,
they are free marks under time pressure, and an exam made only of hard
diagnostics trains the wrong pacing. Pick the most representative one and mark
it clearly.

If your range does not yield 8 worthwhile questions, write fewer. Padding is
worse than a short exam.

## Shape of one question

```
## QNN — <title>  ·  <points> points  ·  ~<minutes> min  ·  unit <uNN>

context:      the cluster/namespace setup a candidate is dropped into.
              Concrete. Names, namespaces, what exists.

task:         what they must achieve. Terse, exam voice. State the symptom
              and the goal. NEVER name the cause — the diagnosis is the
              exercise.

constraints:  what they may not do. Every constraint must exist to force the
              intended diagnosis rather than a shortcut, and every one must
              be checkable in `verify`. A constraint nobody grades is
              decoration — delete it.

verify:       how a grader confirms the end state, as concrete checks with
              points. Grade the END STATE, never the path. If a candidate
              gets there by a route you did not imagine, they score full
              marks. Never require a specific command.

expected path: the ordered moves a competent operator makes, and for each,
              what result sends them left vs right. This is the teaching
              artefact — it is what the candidate reads afterwards.

trap:         the plausible wrong turn that costs five minutes.

docs:         kubernetes.io URLs backing every mechanism asserted above.
```

## Rules that decide whether this is any good

**The task must not leak its own answer.** "A Pod is Pending because of a
taint — add a toleration" is not a question. "A Pod is Pending and the nodes
report free capacity" is.

**Points reflect diagnosis, not typing.** A question whose answer is one
documented command is worth 2–4. A question requiring a real diagnosis is
worth 6–10.

**Time estimates must be honest.** The real exam gives roughly 7 minutes per
question. If yours needs 15, either it is worth the points or it is two
questions.

**Everything asserted needs a docs URL.** Baseline Kubernetes v1.36. If you
cannot cite it, do not assert it.

## Style

Short sentences. Active voice. Exam voice, not tutorial voice. No preamble,
no "in this question we will explore". Technical names stay exact —
`allocatable`, `evict`, `admission`, `preempt` are not simplified.

## Rules

- **Write ONE file only**, named in your prompt. Edit nothing else.
- **Do not run `kubectl`, `aws`, `kiac`, `container`, `docker`, or any cloud
  CLI.** There is no cluster. This is authoring.
- No git. No subagents.
