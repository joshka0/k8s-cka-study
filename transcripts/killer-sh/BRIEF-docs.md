# Brief: build exam questions and cards from the Kubernetes documentation

Your source is the official Kubernetes documentation at **kubernetes.io**,
baseline **v1.36**, plus the upstream project docs where the behaviour belongs
to them (etcd, containerd, CNI, CSI, Gateway API).

Two deliverables, both scoped to the unit range in your prompt.

## Why this exists

The CKA gives candidates kubernetes.io during the exam. Finding the right page
fast is therefore a real, scored-in-practice skill, and it is one the course
does not yet train. So this work has two halves: content the docs contain that
our units under-teach, and the navigation skill itself.

## Deliverable 1 — exam questions

File: named in your prompt.

**Work topic by topic, not page by page.** `deck/MODULE-TOPICS.md` lists every
teaching topic in every unit. For each topic in your range, find the
kubernetes.io page that governs it and derive the material from that page. The
topic chooses the page; never browse the docs and write about whatever turns
up.

Aim for **6–8 questions** across your range. You will not get one per topic —
choose the topics where the documentation carries a mechanism, a limit, or a
failure mode that a candidate must know and that our course states only in
passing. Name the topic each question comes from.

Question shape:

```
## QNN — <title>  ·  <points> points  ·  ~<minutes> min  ·  unit <uNN>

context:      the cluster state a candidate is dropped into. Concrete.
task:         terse, exam voice. State the symptom and the goal. NEVER name
              the cause.
constraints:  each one must be checkable in `verify`. An ungraded constraint
              is decoration — delete it.
verify:       concrete checks with points, grading the END STATE only.
docs-path:    the page a candidate should reach, and the search term that
              gets them there. This is the navigation half.
expected path: the ordered moves, and for each, what result sends them left
              vs right.
trap:         the plausible wrong turn.
docs:         kubernetes.io URLs backing every mechanism asserted.
```

**Two rules that decide whether a question is any good:**

A grader must not pass a wrong end state. Before you write `verify`, think of
one legitimate alternative route and confirm it still scores, then think of
one *wrong* end state that superficially matches and confirm it does not. A
review of an earlier batch found eight graders that accepted wrong answers,
including one where the candidate could skip the entire task and score full
marks. That is the failure mode to design against.

The task must not leak its answer. "A Pod is Pending because of a taint" is
not a question.

## Deliverable 2 — cards

File: named in your prompt. A **JSON array** matching the existing schema
exactly. Read `deck/VALID-IDS.md` first: `lesson` and `unit` are validated
against the course content and must be used verbatim.

Add a `"topic"` field naming the module topic the card came from. The merge
step strips it before the deck build, which rejects unknown fields — it exists
so the mapping back to a module is reviewable.

```json
{
  "topic": "Cost of a high ndots",
  "id": "u9l2::ndots-search-order",
  "lesson": "u9l2",
  "unit": "09 DNS & CoreDNS",
  "type": "name_to_definition",
  "front": "…",
  "back": "…",
  "tags": ["09-dns-coredns", "understanding"],
  "extra": "<a href='https://kubernetes.io/docs/…'>📖 Page title</a>"
}
```

Types: `definition_to_name`, `name_to_definition`, `plain_phrase_to_name`,
`discrimination`, `cloze`, `name_to_api`, `api_to_name`.

Hard requirements the builder enforces and will reject you for:

- `id` must be `<lesson>::<short-kebab-purpose>` and unique across the deck.
- The name-answer types (`definition_to_name`, `plain_phrase_to_name`,
  `api_to_name`) need an `answer` field. The **front must not contain the
  answer**, and the **back must state it**.
- `cloze` cards need `{{c1::…}}` deletions in `front`, numbered contiguously
  from 1.
- `tags` non-empty, no duplicates.
- Card text is HTML. `<b>`, `<code>`, `<ul>`, `<br>` are all in use.

Write **10–14 cards** for your range, each tied to a named topic from
`deck/MODULE-TOPICS.md`. Spread them across the units in your range rather
than clustering on two or three topics. Put the `extra` link on every card —
that is the navigation half again: the card teaches the fact and shows the
page.

## Writing from documentation

**Write original formulations.** Summarise the mechanism in your own words and
cite the page. Do not paste stretches of documentation prose into a card or a
question. A card that reads like a doc excerpt teaches worse than one that
states the mechanism plainly, and we want the deck to sound like the course.

Cite the specific page, not the section index. If you cannot cite it, do not
assert it.

## Style

Short sentences. Active voice. One idea per sentence. Kubernetes Technical
Names stay exact — `allocatable`, `evict`, `admission`, `preempt`,
`reconcile` are not simplified. Descriptive sentences stay at or below 25
words; a linter checks the deck.

## Rules

- **Write only the two files named in your prompt.** Edit nothing else. Do not
  touch `deck/lesson-cards.json` — your cards are merged separately after
  validation.
- **Do not run `kubectl`, `aws`, `kiac`, `container`, `docker`, or any cloud
  CLI.** There is no cluster.
- No git. No subagents.
- You may fetch kubernetes.io pages to verify claims. Fetch only documentation.
