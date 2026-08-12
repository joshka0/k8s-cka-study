# Review request: the Anki card deck

`deck/lesson-cards.json` holds 288 cards that reinforce a 27-unit Kubernetes
course. Review your assigned unit range for **technical accuracy** and for
**writing style**. Two separate passes over the same cards.

Your range is given in the prompt. Review only cards whose `lesson` starts with
a unit in that range.

## Part 1 — technical accuracy

Baseline Kubernetes v1.36. The same standard applied to the video scripts:

- Anything stated as always-true that is conditional.
- Anything true of older Kubernetes and now wrong.
- Ownership claims — which component does what. These carry most of the deck's
  value and must be exactly right.
- A card `back` that does not actually answer its `front`.
- A card whose `front` leaks its own answer.

Many of these cards were written from review findings on the scripts, so they
encode corrections. If a card contradicts current Kubernetes, say so — do not
assume the correction was right.

## Part 2 — writing style

The house style is **ASD-STE100 (Simplified Technical English)** plus Zinsser:

- Short sentences. Descriptive sentences at or below 25 words.
- One idea per sentence.
- Active voice.
- Simple words where a simple word exists.
- One term per concept, used consistently. Do not vary wording for elegance.
- Zinsser: strip every sentence to its cleanest components; cut every word doing
  no work; the reader must never have to reread; write warmly, as one person to
  another.

**Judgement required, in both directions.**

- Kubernetes Technical Names and Technical Verbs are exempt from the approved
  word list and must NOT be simplified. `terminate`, `provision`, `persist`,
  `admission`, `reconcile`, `evict` and similar stay exactly as they are.
  Replacing them would make the card wrong.
- Passive voice is correct where the grammatical subject genuinely is the thing
  acted upon — "the object is stored", "the Pod is evicted". Flag passive only
  where an active rewrite is clearer AND does not invent an actor the sentence
  does not have. Do not convert "the Pod is evicted" into "something evicts the
  Pod".
- A repo linter counts 28 over-length sentences and 78 passives in this deck. Do
  not treat those counts as a target. Some are correct. Tell me which ones
  genuinely hurt the reader.

Card text is HTML. Keep the markup. Judge the prose inside it.

## What I want back

```
[card-id] field · KIND (wrong | misleading | imprecise | style)
  problem: <what is wrong, or what the reader has to work at>
  fix:     <the corrected text, complete and ready to paste, markup included>
```

Accuracy findings first, style findings after. End with two lines:

`ACCURACY: N findings`
`STYLE: M findings`

## Rules

- **Do not edit any file** except the findings file named in the prompt.
- **Do not run renders, builds, the deck build, or npm install.** The machine is
  busy; reading the JSON is all you need. A previous reviewer ignored this and
  its render collided with another process, destroying a run.
- No git operations.
- If you are unsure whether something is version-dependent, say so with the
  condition. An honest "this depends on X" beats a confident wrong correction.
- Do not rewrite for elegance. If a card is accurate and clear, leave it alone
  and say nothing. I would rather have 20 real findings than 120 opinions.
