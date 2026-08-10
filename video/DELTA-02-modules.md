# Packet: build the module compositions (01–05)

You built the pilot's Remotion project. This extends it to the first five
module videos of the series.

## Objective

Add one composition per module, driven by that module's `script.json`, reusing
the pilot's project, palette, caption system and audio-driven timing.

## Read first

- `SERIES.md` — the series contract.
- `modules/u01-control-plane/script.json` … `modules/u05-crds/script.json` —
  five scripts. Same beat shape as the pilot: `id`, `n`, `title`, `lane`,
  `estSeconds`, `narration`, `visual.type`, `visual.spec`. Each also has a
  `series` block naming its spine segment.
- `src/` — the existing project. Eighteen visual components already exist.
- `script.json` — the pilot, for reference.

## Scope

1. **Five new compositions**, ids `Module01` … `Module05`. Each reads only its
   own module script. Adding a beat to a module script must change only that
   module's video.
2. **Reuse aggressively.** Every `visual.spec` beginning `REUSE` names an
   existing component; wire it up rather than writing a new one. Specs
   beginning `NEW` need building. Roughly 30 new components across the five.
3. **`spineLocator` is the series' connective tissue** and appears in every
   module, twice. Build it once, parameterised by which segment to light. It
   should read as the same diagram as the pilot's `SpineRecap`.
4. **Audio and captions** work exactly as the pilot: `narration/<beat-id>.mp3`
   per module when present, `estSeconds` otherwise. Extend
   `measure-narration.mjs` to handle per-module narration directories
   (`modules/<name>/narration/`) without breaking the pilot's.
5. Update the README with how to preview and render a single module.

## Layout rules — these are defects from round one, already paid for

Do not rediscover these:

- **`box-sizing: border-box` is global now.** Do not add `width: '100%'`
  alongside padding or a border and assume it fits. It did not, and whole lane
  bars rendered off-frame.
- **Never position with absolute `right:`.** A callout positioned that way
  landed outside the frame while every URL still returned success. Put content
  in flow.
- **No fixed-width slots for variable-length labels.** A 14-segment strip at
  `width/14` clipped every long label and pushed the last one off-frame. Wrap
  to rows, or use auto width.
- **The caption band is a rolling two-line subtitle at 26px.** It is tuned. Do
  not grow it, do not render the whole beat's narration, do not add a word
  counter.
- **`VISUAL_TOP` / `VISUAL_BOTTOM` are tuned** to the caption band. Centre your
  diagram in the stage they define, and fill it — the first cut left a dead band
  through the middle of every frame because diagrams sat in the top third.
- **Nested or secondary detail must be legible.** The IPAM delegation was
  rendered at 14px grey against the right edge, and it was the point of the
  beat. If a spec says nested, build a real nested block.
- Module beats have `stage: null`. Show the lane, not a stage chip.

## Non-goals

- **Do not write, rewrite, shorten or extend any `narration` text, and do not
  add Kubernetes claims of your own.** If a spec seems to need a fact that is
  not in the narration, render only what the script supports and say so in your
  report. Accuracy is verified upstream; silent additions bypass that.
- No TTS, no API keys, no audio synthesis.
- No git: no init, commit, branch or push.
- Nothing outside `video/`.
- Do not delegate to further agents. Do the work yourself.

## Evidence

Report with real commands and real output:

1. `npx remotion compositions src/index.ts` showing all six compositions and
   their resolved durations.
2. Stills for at least three beats per module, to `out/`, and
   **`node scripts/check-frames.mjs out/<those stills>`** with its output
   pasted. That script fails on content touching the frame edge; a file it
   cannot read counts as a failure, so do not treat silence as a pass.
3. One short motion render, one beat, with path and duration.
4. Confirmation that each module falls back to `estSeconds` with no narration
   present, naming the duration source.
5. Anything in a `visual.spec` you could not realise, and what you did instead.

You cannot view images. Say so plainly, as you did last time, and report what
your checks show rather than asserting a still looks right. I will do the
visual pass.

## Stop condition

All five modules render end to end from their scripts, `check-frames.mjs`
passes on your stills, and the README is updated. If a fix would need narration
changes or invented content, stop and report instead.

End with exactly one line:

`MODULES 01-05 STATUS: READY` or `MODULES 01-05 STATUS: BLOCKED`
