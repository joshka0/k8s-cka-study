# Prompt: extend one classroom script with in-session reinforcement

You are converting an approved classroom script into its **extended** form.
The exemplar pair is `u21-listen-in-class.md` (base) and
`u21-listen-in-class-extended.md` (extended). Read both, in full, and study
exactly what changed between them before touching anything.

This is an EXTENSION, not a rewrite. The base script's facts, scenario,
section order, student mistakes, repairs, and closing reconstruction are all
approved and stay. You are adding reinforcement around them.

## The four patterns to add

1. **Recall before reuse.** When an important term returns after minutes away,
   the teacher asks a student to recall it before the question that uses it.
   The reminder is itself retrieval, with its own listener pause:

       Teacher: First, a recall — Maya, remind us. What does a binding supply?
       [pause] Maya: The subjects and the reach.
       Teacher: Hold that. A user may create RoleBindings. Can they bind
       themselves to cluster-admin?

   Use it for the module's 2–4 load-bearing terms only — the ones the later
   sections depend on. Every reuse reminded is nagging; none is the old
   format.

2. **Behaviour → name → echo for new terms.** When a term first appears, the
   teacher describes the behaviour, then names it; the student's answer echoes
   the name so it lands twice within a minute:

       Teacher: In that gap, something must hold the device so no other Pod
       takes it. The framework calls that step Reserve. Maya, why must Reserve
       happen before binding completes?
       Maya: Because Reserve is the hold — without it, another Pod could be
       given the same device in the gap.

   Apply to every genuinely new term the base script introduces. If the base
   already does this for a term, leave it. Two cautions: when a student's
   answer already spoke the term, the teacher names it in passing ("that
   renewal is the Lease") rather than introducing it as news; and an echo must
   not repeat an earlier answer nearly verbatim — if two students would say
   the same sentence, rephrase the second around a different angle.

3. **Micro-checkpoint per section.** Each `###` section ends with the teacher
   asking one student for a one-line restatement of that section's rule,
   with a listener pause, before moving on:

       Teacher: Checkpoint, Maya. One line: role versus binding.
       [pause] Maya: The role supplies the rules; the binding supplies the
       subjects and reach.

   One line means one line. Alternate which student answers. Vary the
   teacher's phrasing — "Checkpoint", "Before we move on", "Carry this one
   forward" — so it does not become a jingle.

4. **Adaptive teacher turns.** Expand where context earns its seconds; leave
   drills terse.
   - Section openings may become 2–4 sentences that place the section in the
     investigation ("Now we transfer the same reasoning to machines.
     Everything so far was about people...").
   - A new concept may get one sentence of why-it-matters before its question.
   - Rapid-fire drills ("What does Score receive?") stay exactly as they are.
     Do not pad them.

## What must not change

- Every fact. If your extension restates a claim, restate it exactly; do not
  "improve" technical content. The base scripts are triple-reviewed.
- Student mistakes and their repairs. Do not add new mistakes.
- The closing listener reconstruction (you may add a short clause absorbing a
  newly named term, as the exemplar does with "two verbs, two doors").
- All base-format rules: no CLI strings or literal identities; speakable
  Kubernetes terms are vocabulary; at most one bracket cue per line and most
  lines need none; every student attempt (including recalls and checkpoints)
  is preceded by a listener pause; standalone module — no references to other
  modules, the pilot, the series, or course size.

## Calibration

The extended exemplar grew the base by roughly a third (80 → 100 turns,
12.6 → 16.8 minutes). Land in that neighbourhood. If your extension doubles
the script, you are narrating; if it grows ten percent, you are not
reinforcing.

## Output

One file: `uNN-listen-in-class-extended.md`, next to the base. Copy the
exemplar's header structure (the four-pattern summary at the top, the Cast
section verbatim, the extended production note). Do not edit the base file.
Do not run the builder, any render, or git. No subagents.
