# Brief: dissect the killer.sh walkthrough transcripts into diagnostic paths

These are auto-captioned walkthroughs of CKA exam-simulator questions. They
are study input. What we want out of them is not a summary — it is **the path
a competent operator would actually walk** to find and fix each problem.

The course these feed already teaches one method: read the symptom, name the
segment of the request path that owns it, descend to that segment's evidence.
Your dissection should make that path explicit for each question, including
the parts the presenter does by reflex without saying why.

## For each transcript, produce one block

```
### qNN — <one-line symptom, as an operator would first see it>

first instinct:   the ONE command you reach for before thinking. Usually
                  `kubectl get`/`describe` on something. Say what you expect
                  to see and what would surprise you.

path:             the ordered sequence of checks. For EACH step:
                    - the command
                    - what result sends you left vs right
                  This is the valuable part. A step that cannot change your
                  next move is not a step, it is noise — drop it.

fix:              what actually changes state, and why that and not the
                  alternatives.

trap:             the plausible wrong turn. What would a competent person try
                  that wastes five minutes here? If the presenter hesitated,
                  backtracked, or corrected themselves, that IS the trap —
                  record it.

objects:          the API objects and fields genuinely involved
docs:             authoritative kubernetes.io URLs backing the claims above
unit:             which of our 27 units owns this reasoning (list below), or
                  GAP if nothing covers it
test-worthy:      high | medium | low, plus one clause of justification
```

## On test-worthiness — judge, do not rate everything "high"

Not every question makes a good exercise. Be honest:

- **high** — the answer requires a diagnosis. Someone who has not understood
  the mechanism cannot guess it. There is a discriminating step in the path.
- **medium** — mostly recall or a known command, but with a wrinkle worth
  drilling.
- **low** — "run this documented command". Real exam work, but it teaches
  nothing that reading the docs once would not. Say so plainly.

A transcript of 300 words that shows one command is almost certainly **low**.
Do not inflate it. We would rather have eight excellent exercises than
twenty-five mediocre ones.

## Back the claims

Every mechanism you assert needs a `docs:` URL from kubernetes.io (or the
etcd/CNI/CSI project docs where the behaviour is theirs). Baseline is
Kubernetes v1.36.

**The captions are auto-generated and wrong in places.** They mishear
technical terms. Where the transcript says something that is not true of
Kubernetes, trust the docs and note the discrepancy — do not propagate a
mistranscription as fact. Flag it as `caption-error:` in the block.

## Our 27 units, for the `unit:` mapping

    u1  desired object          Who Owns What
    u2  admission / storage     Five Gates
    u3  watch / cache           Events Are Hints
    u4  controller queue        Four Different Promises
    u5  controller queue        An API You Cannot Take Back
    u6  scheduler + binding     Choose, Then Commit
    u7  kubelet                 Running Is Not Ready
    u8  CNI                     A Permission Is Not A Path
    u9  DNS                     Not The Name You Typed
    u10 CSI                     Two Halves, One Volume
    u11 admission / storage     A Backup You Have Restored
    u12 desired object          Which Signal Proves What
    u13 desired object          kubeadm Writes Files, Then Leaves
    u14 kubelet                 An Update Is Not A Reload
    u15 service                 Objects Describe, Controllers Forward
    u16 kubelet                 Feasible Is Not Local
    u17 scheduler + binding     From Scalar Counts To Claims
    u18 desired object          Not Every API Is Stored Here
    u19 controller queue        Four Gates, Four Transitions
    u20 desired object          Start At The Nearest Authority
    u21 admission / storage     Scope Is Part Of The Permission
    u22 kubelet                 The Metrics API Is Not Monitoring
    u23 desired object          Render First, Then Reconcile
    u24 admission / storage     Rejected, Not Pending
    u25 service                 Membership Is Not Eligibility
    u26 kubelet                 Ask Which Object Restarted
    u27 admission / storage     Admission Checks The Spec

A `GAP` is a real and useful finding — it means the exam tests something the
course does not teach. Do not force a mapping to the nearest unit.

## Style

Short sentences, active voice, one idea per sentence. No filler, no
restatement of the task, no "in this video the presenter explains". Write the
path as instructions to an operator, not as a description of a video.

Do not quote the transcripts at length. Summarise the mechanism in your own
words and cite the docs for the facts.

## Rules

- **Write ONE file only**, named in your prompt. Edit nothing else.
- **Do not run `kubectl`, `aws`, `kiac`, `container`, `docker`, or any cloud
  CLI.** This task is text analysis. There is no cluster involved.
- No git operations. No subagents.
- If a transcript is too garbled to dissect honestly, say so and move on. A
  short honest note beats an invented path.
