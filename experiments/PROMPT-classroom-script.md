# Prompt: write a listen-in classroom script for one module

You are writing the audio-classroom version of one course module. The learner
listens — driving, walking, no screen — to a teacher working with two students,
and answers each question mentally before the student does. The exemplar is
`u21-listen-in-class.md` in this directory. Read it first, in full. Your output
must be a sibling file, `uNN-listen-in-class.md`, in exactly its format.

## Inputs, in order of authority

1. `../video/modules/<module>/script.json` — the module's reviewed narration.
   It is the factual authority. Several of its claims are deliberate
   corrections of earlier errors; do not "simplify" a claim back into the
   error it was written to fix.
2. The exemplar `u21-listen-in-class.md` — format, cast, tone, and the
   production notes at the bottom, which are rules, not suggestions.
3. This prompt.

Baseline is Kubernetes v1.36. Accuracy outranks every stylistic instruction in
this file.

## The process

### 1. Extract the misconception inventory

Read the module's beats and list the mistakes the module exists to correct —
the claims a competent engineer would confidently get wrong. These become the
students' mistakes. Every error a student makes must come from this inventory.
Invented, theatrical errors teach nothing and are the fastest way to fail
review.

### 2. Choose one scenario

Do not write disconnected Q&A over the topic list. Choose a single
through-line the whole dialogue builds along, and name it to yourself before
writing. Two shapes work:

- **Construction**: build the concept from first questions, the way u21 builds
  all of RBAC from "what can I do, to what, who has it, where."
- **Incident**: one concrete failure investigated to the root, gate by gate.

Every section must advance the scenario. If a beat of the module cannot be
reached from the scenario, leave it to the video — coverage is not the goal,
causal understanding is. Prefer one spine for the whole script; when the
module genuinely splits into two acts, declare the join in the teacher's first
turn ("one investigation: X, and later, Y") and land the close on what unites
them.

### 3. The audio-translatability pass

Before writing dialogue, list every concept in the module that a listener
cannot hold by ear, and decide: abstract it to its shape, or cut it. Never
speak it literally. This class includes:

- command lines, subcommands, and flags
- literal identity strings and anything colon-joined
- UIDs, hashes, hex, ports, IP addresses, file paths
- YAML field paths and manifest fragments
- anything the video shows on screen and the deck drills as exact characters

"Abstract to shape" means teach the parts and their order, not the characters:
u21 turns a ServiceAccount username into "a fixed marker, then the namespace,
then the name — the container comes before the thing it contains", and turns a
permission-check command into "ask the cluster's own authorizer, as the
identity in question, about one action, one resource, one place."

**Do not over-abstract.** The rule removes *character sequences an ear cannot
hold*, not Kubernetes words. A named verb, object kind, or field name — get,
bind, escalate, RoleBinding, subPath, progressDeadlineSeconds — is vocabulary
the listener must leave knowing. Speak it, introduced concept-first: describe
the behaviour, then name it ("a single-file mount — Kubernetes calls it
subPath — never refreshes"). An early draft abstracted subPath into "binds a
single file in a way that never refreshes" and the listener left without the
word; that is a review finding, not a style choice.

### 4. Write the dialogue

- **Teacher** asks short, cumulative questions and repairs reasoning without
  lecturing. The repair moves are small redirections — "which object supplied
  the reach?" — never a paragraph.
- **Every fact enters through a question.** If the teacher states more than
  two facts in a row, that content belongs behind a student attempt instead.
  An aside like "writes also wait for quorum; slow storage raises latency;
  cached reads differ" is a lecture wearing a costume — turn it into questions
  or cut it.
- **A student's wrong answer must be reconstructable.** The listener has to be
  able to say what the student believed and why it was plausible. "Existing
  forwarding keeps working, so yes" fails that test; "Yes — the endpoints
  update themselves" passes it.
- **Maya** is quick and confident; her mistakes are premature operational
  conclusions. **Leon** is deliberate; his mistakes are confused near-identical
  names and broken causal order. Rotate who errs; neither is the weak one.
- **Every student attempt is preceded by a listener pause.** The listener
  answers in the silence. Write the pause you mean pedagogically: 2–3 seconds
  for recall, 4–7 for construction, one long reconstruction pause near the
  end. The builder compresses anything over 3 seconds toward a shorter
  delivered gap, so do not shorten them yourself.
- End with the **listener reconstruction**: the teacher sets numbered recall
  tasks, one long pause, then a compressed spoken answer the listener checks
  themselves against, closing with "replay only the dialogue where your
  reconstruction first diverged."
- A module must stand alone: no references to other modules, the pilot, the
  series, module numbers, or how many modules exist. Spine segments are named,
  never numbered.

### 5. Expressive cues — restrained

The TTS (S2.1) accepts free-form square-bracket cues inline, applying until
the next cue or sentence end, plus spoken hesitation words.

- At most **one cue per line**, and most lines need none. The voices already
  carry character; cues are for moments, not wallpaper.
- Students may get thinking cues on genuine hesitation: `[thinking aloud]`,
  `[uncertain]`, `[realizing]`, with "Hmm..." or "um" written into the text.
  Only where the character is actually working something out — a hesitation on
  a correct confident answer reads as noise.
- The teacher stays inside `[warm]`, `[curious]`, `[gentle]`, `[pleased]`,
  `[emphasis]` on the load-bearing phrase, an occasional `[chuckle]`.
- Never: music directions, sound effects, shouting, custom stage directions
  longer than a few words, or cues on more than two consecutive lines.

### 6. Self-check before you finish

- Every student error appears in the misconception inventory from step 1.
- No line contains a character sequence the listener would need to see.
- Read each teacher turn aloud in your head: if it runs past two breaths,
  split it.
- The scenario is completable by ear alone: someone who heard only this audio
  could pass the module's ninety-second cold-reconstruction test on causal
  ordering.
- Format parses: cast ids in backticks in `## Cast`, dialogue between
  `## Script` and the closing `---`, turns as `**Name:** text`, pauses as
  `**Listener pause: N seconds**`, sections as `###` headings.

## Cast and voices (fixed for the course)

- **Teacher** — course narrator (`c023b17b38144a60b3984153247d993f`)
- **Maya** — Kaya (`531f90254e3d4810a047a90b9309fdd0`)
- **Leon** — Wheatley (`ac6474da3a324e0c8edf6d796fe59f4d`)

Copy the `## Cast` section from the exemplar verbatim, including the profile
descriptions; the builder reads the voice ids from it.

## Output

One file: `uNN-listen-in-class.md`, next to the exemplar. Nothing else. Do not
run the builder, the dub, or any render — the machine is usually busy and the
synthesis pass is reviewed and run separately.
