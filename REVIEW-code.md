# Review request: code written without independent review

The narration scripts in this project were all reviewed by a different model.
The **code** was not. You are that review. Be adversarial and concrete.

Everything below was written or modified in one long session, often under time
pressure, sometimes by patching text with Python string replacement. Assume
haste. Several defects have already been found by eye after the fact, which is
evidence there are more.

## What to read

**Site (runs in the user's browser, no build step, no tests):**

- `assets/learn.js` — the lesson engine. I added: a `MODULE_VIDEOS` constant, a
  video node in each unit, a `showModule()` player view, `#m/<unit>` deep
  links, and a `viewingModule` flag consulted by the background progress sync.
- `assets/learn.css` — styles for the above (appended at the end).
- `index.html` — a `<script>` tag and a nav link.
- `assets/modules.js` — generated, do not review its content, but do check that
  its **shape** matches what `learn.js` expects.

**Generators (Node, run by hand):**

- `tools/build-modules-asset.mjs` — emits `assets/modules.js`.
- `tools/build-modules-page.mjs` — emits `modules.html`.
- `video/scripts/render-module-stills.mjs` — renders one still per beat.
- `video/scripts/dub.mjs` — text-to-speech; I added `--module`.
- `video/scripts/lint-narration.mjs` — I changed the sentence splitter.

**Deck build (Python):**

- `deck/build_lessons_deck.py` — I changed content-file discovery, the unit
  regex, and the unit-count assertion.

**Remotion components (TypeScript, rendered to video):**

- `video/src/Beat.tsx` — `VisualStage` now sets an explicit height and centres
  its child's content via an injected style rule.
- `video/src/visuals/TwoCycles.tsx`, `Endpoints.tsx`, `FourBoundaries.tsx`,
  `TheAlgorithm.tsx`, `ChooseBoundary.tsx` — targeted fixes.

## What I want

**1. Defects.** Anything that is wrong, will break on a plausible input, or
breaks an existing behaviour. I care most about:

- `learn.js` state handling. `viewingModule` is set in `showModule` and cleared
  in `showPath` and `startLesson`. Is there any path that leaves it stale, and
  what breaks if it does?
- The XP award on video end: is it exactly-once, and what happens on replay,
  on a second device, or if the sync adopts remote state mid-video?
- Deep links: `#m/<unit>` is parsed at boot and written with `replaceState`.
  Back/forward behaviour, unknown unit ids, and interaction with the
  trailing-slash guard in `index.html`.
- The generators: path handling, what happens when a module has a script but no
  video, no `durations.json`, or a title that produces a weird filename.
- `build_lessons_deck.py`: the relaxed unit regex and the contiguity assertion.
  What input silently produces the wrong unit map rather than an error?

**2. Anything that is merely fragile** — a pattern that will break the next time
someone adds a unit, a module, or a content file. Adding units is routine here;
seven arrived mid-session.

**3. Secret handling.** `dub.mjs` reads an API key. Confirm no path can log,
print or persist it, including in error messages.

## Output format

```
[FILE] symbol-or-line · SEVERITY (bug | fragile | style)
  problem: <what is wrong, and the input or sequence that triggers it>
  fix:     <the concrete change>
```

Order by severity, worst first. End with one line:

`CODE REVIEW: N BUGS, M FRAGILE`

## Rules

- **Do not edit any file.** Report only. Write your findings to
  `REVIEW-FINDINGS-code.md` and change nothing else.
- **Do not run renders, builds, `npm install`, or the deck build.** The machine
  has been rendering video for hours and CPU is the bottleneck. Reading is
  enough. A previous reviewer ignored this and its render collided with mine on
  the same output file, destroying a run.
- No git operations of any kind.
- If a thing looks wrong but you are not certain, say so explicitly with the
  condition you are unsure about. An honest "this depends on X" is worth more
  than a confident wrong finding.
- Style opinions are welcome but rank them last; correctness and fragility
  first. The house style is deliberate: comments explain *why*, especially
  where they record a defect already paid for.
