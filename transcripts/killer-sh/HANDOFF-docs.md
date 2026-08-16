# Handoff: docs-derived questions and cards

Pick this up cold. Everything you need is named below.

## The job

For each **module topic** in your assigned unit range, find the kubernetes.io
page that governs that topic and derive study material from it. Two outputs:
exam questions, and Anki cards.

The topic chooses the page. Never browse the documentation and write about
whatever turns up — that produces material that does not attach to anything
the course teaches.

## Read these first, in order

1. `transcripts/killer-sh/BRIEF-docs.md` — the full contract: question shape,
   card schema, style, and the two rules that decide whether a question is any
   good. This is authoritative; the rest of this file is orientation.
2. `deck/MODULE-TOPICS.md` — every teaching topic in every unit. Your source
   list. Work through your range topic by topic.
3. `deck/VALID-IDS.md` — the exact `lesson` and `unit` strings the deck builder
   accepts. It validates against course content and rejects anything invented.

## What already exists

The course is 27 units, each with a video, two classroom audio cuts, and a
per-unit Anki deck. The card deck is 288 cards in `deck/lesson-cards.json`,
already reviewed for accuracy against Kubernetes v1.36 and for style. It is
live at kubernetes-study.katig.dev.

A separate strand of work built exam questions from video walkthroughs of an
exam simulator. That material is in this directory as `DISSECT-*.md` and
`EXAM-DRAFT-*.md`. **You are not continuing that strand.** It is useful only as
a picture of what a question looks like, and as a record of how they failed
review — see below.

## What the last review found, so you do not repeat it

An independent review of the walkthrough-derived questions returned **twelve
accuracy findings on nine questions** and a verdict of rework. Eight were the
same defect: a `verify` block that accepts a wrong end state.

The worst example: a candidate could create the Pod with `spec.nodeName` set
from the start, skip the entire task, and still score full marks, because the
grader could not prove the work had happened.

Three were plain factual errors at v1.36:

- An expected path that wrote `spec.nodeName` onto an existing Pending Pod.
  API validation permits only a narrow set of Pod-spec updates and `nodeName`
  is not among them.
- Identifying a mirror Pod by its name. A normal Pod can carry that name; the
  signal is the `kubernetes.io/config.mirror` annotation.
- Accepting a hand-created `Endpoints` object as a route for a Service that has
  a selector. The control plane does not mirror it at v1.36.

So: before you write a `verify` block, think of one legitimate alternative
route and confirm it still scores, then think of one wrong end state that
superficially matches and confirm it does not. And cite a page for every
mechanism you assert — if you cannot cite it, do not assert it.

## Scope and prohibitions

- Write **only the two files named in your prompt**. Nothing else.
- **Never touch `deck/lesson-cards.json`.** Your cards go to a separate file
  and are merged after validation. That deck is a verified artifact.
- **Do not run `kubectl`, `aws`, `kiac`, `container`, `docker`, or any cloud
  CLI.** There is no cluster in this task and none is needed. The machine has
  credentials for unrelated production systems; nothing here requires them.
- No git operations. No subagents.
- You may fetch kubernetes.io pages to verify claims. Fetch documentation only.

## Ranges

    u1 – u14    grok
    u15 – u27   droid

u15–u27 is the thinner half in existing exam coverage, so that range matters
more.

## Output

    transcripts/killer-sh/EXAM-DOCS-<range>.md      6–8 questions
    deck/cards-docs-<range>.json                    10–14 cards, JSON array

Each question and each card names the module topic it came from.

## Operational note

If you are driving droid through a herdr pane: a multi-line prompt lands in its
composer without submitting. Send an empty line afterwards to release it. It
looks identical to a busy agent otherwise, and has cost three false starts.
