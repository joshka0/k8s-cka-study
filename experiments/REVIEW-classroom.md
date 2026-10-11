# Review request: listen-in classroom scripts

You are reviewing classroom-dialogue audio scripts written by a different
model. Your range is given in the prompt. For each script, the factual
authority is the module's reviewed narration at
`../video/modules/<module>/script.json` — re-derive from it; do not trust the
script's framing. The writing contract is `PROMPT-classroom-script.md` and the
exemplar `u21-listen-in-class.md`.

Baseline Kubernetes v1.36. Accuracy outranks everything.

## Part 1 — technical accuracy

- Any claim that contradicts the module's reviewed narration or current
  Kubernetes. The narration encodes deliberate corrections of past errors;
  a script that "simplifies" a claim back into the old error is wrong.
- A student's wrong answer that is not actually wrong, or a teacher repair
  that overcorrects into a new error.
- An invented misconception: a student mistake that does not correspond to
  anything the module warns about. Name it — these are the most damaging
  because the repair teaches a lesson the module never claimed.
- A promise or compressed answer that misstates what the dialogue established.

## Part 2 — craft, against the contract

- A teacher turn stating more than two facts in a row (lecture in costume).
- A student wrong answer that is not reconstructable — the listener cannot say
  what the student believed.
- Over-abstraction: a Kubernetes field or object name replaced by a
  description when the word itself is speakable vocabulary (the subPath rule).
- Unspeakable content that survived: flags, colon-joined strings, hex, paths.
- Scenario drift: sections that are disconnected topic Q&A rather than one
  spine (or a declared two-act join).
- Cue problems: more than one bracket cue on a line, cues on confident correct
  answers, or cue wallpaper.
- Cross-module coupling of any kind, including course-size counts.

## What I want back

```
[uNN] section-heading · KIND (wrong | misleading | invented-misconception | craft)
  problem: <what is wrong, concretely>
  fix:     <the corrected line(s), ready to paste, in script format>
```

Accuracy findings first, craft after. End with:

`ACCURACY: N findings`
`CRAFT: M findings`

## Rules

- **Do not edit any file** except your findings file named in the prompt.
- Do not run the builder, any render, npm install, or git. No subagents.
- If a claim is version-dependent, say so with the condition.
- Do not rewrite for taste. If a script is accurate and follows the contract,
  leave it alone. I would rather have 10 real findings than 60 opinions.
