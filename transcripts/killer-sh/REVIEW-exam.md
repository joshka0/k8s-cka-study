# Review request: practice exam questions

Two authors drafted questions for a timed CKA practice exam, each from a
different set of source material. Review both drafts:

    transcripts/killer-sh/EXAM-DRAFT-00-12.md
    transcripts/killer-sh/EXAM-DRAFT-13-25.md

Baseline Kubernetes **v1.36**. Nothing here has been reviewed by anyone.

## What each question is supposed to be

A candidate is dropped into a described cluster state, given a terse task,
and graded on the **end state** — never on the path taken. Each question also
carries an `expected path` that the candidate reads afterwards: the ordered
moves a competent operator makes, and what each result rules in or out.

## Part 1 — technical accuracy. This matters most.

- Anything stated as always-true that is conditional.
- Anything true of older Kubernetes and now wrong at v1.36.
- Ownership claims: which component does what. These carry most of the value
  and must be exactly right.
- A `verify` block that would pass a wrong solution, or fail a correct one.
  Work through at least one alternative legitimate route per question and
  check the grader still scores it.
- A `docs:` URL that does not support the claim it is attached to, or is
  dead, or is for a different Kubernetes version. Check them.
- An `expected path` step that could not actually distinguish what it claims
  to distinguish.

## Part 2 — is it a good question

- **Does the task leak its own answer?** "A Pod is Pending because of a taint"
  is not a question. The diagnosis must be the exercise.
- **Is it solvable from the stated context alone?** If the candidate needs a
  fact the question never gave them, it is broken.
- **Is there exactly one thing being tested?** A question testing four
  unrelated mechanisms is four questions.
- **Are the points proportionate to the diagnosis, not the typing?**
- **Is the time estimate honest** at roughly 7 minutes per question?
- **Is every constraint checkable in `verify`?** A constraint nobody grades is
  decoration and should be cut.
- **Do the two drafts overlap?** Two questions testing the same mechanism is a
  finding — say which one to keep and why.

## What I want back

```
[file · QNN] KIND (wrong | ungradeable | leaks | unsolvable | duplicate | style)
  problem: <what is wrong, and for accuracy findings, what makes it wrong at v1.36>
  fix:     <the corrected text or verify block, ready to paste>
```

Accuracy findings first, question-quality findings second. End with three
lines:

    ACCURACY: N findings
    QUALITY: M findings
    VERDICT: <ship | ship after fixes | rework>

## Rules

- **Do not edit any file** except the findings file named in your prompt.
- **Do not run `kubectl`, `aws`, `kiac`, `container`, `docker`, or any cloud
  CLI.** There is no cluster and none is needed.
- No git. No subagents.
- If a claim is version-dependent, say so with the condition. An honest "this
  depends on X" beats a confident wrong correction.
- I would rather have 15 real findings than 100 opinions. If a question is
  accurate and well-formed, say nothing about it.
