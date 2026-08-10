# Packet: build the module 06 composition

You built modules 01–05 of this Remotion project. This adds module 06,
scheduling. Same project, same palette, same caption system, same audio-driven
timing.

## Read first

- `SERIES.md` — the series contract.
- `modules/u06-scheduling/script.json` — the script. Eleven beats, same shape as
  the other modules: `id`, `n`, `title`, `lane`, `estSeconds`, `narration`,
  `visual.type`, `visual.spec`, plus a `series` block naming its spine segment.
- `src/` — the project. Sixty-three visual components already exist.
- `modules/u02-api-path/` — the module that has shipped. Match its quality.

## Scope

1. **One new composition**, id `Module06`, reading only
   `modules/u06-scheduling/script.json`.
2. **Register it in `src/Root.tsx`.** That file's `MODULES` array is the
   registry — a module has no composition until it has an entry there, and the
   stills script reads that same array to discover what it can render. Follow
   the existing pattern exactly, including the static `import u06 from …`.
3. **Seven new components.** Every `visual.spec` beginning `NEW` needs building:
   `twoCycles`, `reserveUnreserve`, `requestsVsUsage`, `requestErrors`,
   `pendingLadder`, `nominatedNode`, `preemptionPolicy`.
4. **Four reuses**, already built, wire them up rather than rewriting:
   `spineLocator` (beats 0 and 10), `schedulerCycle` and `binding` (both from
   the pilot). Two specs ask you to *extend* a reused component — do that
   additively, without changing how modules 01–05 render it. Verify that claim
   by re-rendering a still from an affected earlier module.

## Layout rules — these are settled, do not rediscover them

- **The stage geometry changed since your last run.** `VisualStage` in
  `src/Beat.tsx` now sets an explicit `height` and centres its child's content.
  Previously it passed `bottom`, which `AbsoluteFill` silently overrode, so the
  stage ran off the frame and every diagram stacked into the top third. Build
  for the current stage: root your component at `position: absolute; inset: 0`
  like its siblings and let the shared rule centre it. Do not add your own
  vertical offsets to compensate — that bug is fixed.
- **`box-sizing: border-box` is global.** Do not put `width: '100%'` alongside
  padding or a border and assume it fits.
- **Never position with absolute `right:`.** Content placed that way landed
  outside the frame while every check still passed. Put content in flow.
- **No fixed-width slots for variable-length labels.** A strip at `width/n`
  clips long labels and pushes the last one off-frame. Wrap to rows, or use
  auto width.
- **The caption band is a rolling two-line subtitle at 26px.** It is tuned. Do
  not grow it, do not render the whole beat's narration.
- **Fill the stage.** A diagram occupying the middle 40% of the frame with
  large empty margins is a defect, not a neutral choice.
- **Nested or secondary detail must be legible.** If a spec says nested, build a
  real nested block. Do not render the point of the beat at 14px grey.
- Module beats have `stage: null`. Show the lane, not a stage chip.

## Non-goals

- **Do not write, rewrite, shorten or extend any `narration` text, and do not
  add Kubernetes claims of your own.** If a spec seems to need a fact the
  narration does not carry, render only what the script supports and say so.
  Accuracy is verified upstream; silent additions bypass that.
- Do not touch modules 01–05's scripts or narration, and do not re-time them.
- No TTS, no API keys, no audio synthesis. Module 06 has no narration audio yet
  and must fall back to `estSeconds`.
- No git: no init, commit, branch or push.
- Nothing outside `video/`.
- Do not delegate to further agents. Do the work yourself.

## Evidence

Report with real commands and real output:

1. `npx remotion compositions src/index.ts` showing seven compositions,
   `Module06` among them, with its resolved duration.
2. `node scripts/render-module-stills.mjs u06-scheduling` — it derives frames
   from the same duration source the composition uses. **Do not hard-code frame
   numbers**; the previous shell script did, and its numbers pointed past the
   end of a composition once audio existed, where the renderer hangs rather
   than failing.
3. `node scripts/check-frames.mjs out/Module06-*.png` with its output pasted.
   It fails on content touching the frame edge, and a file it cannot read
   counts as a failure — do not treat silence as a pass.
4. One short motion render, one beat, with path and duration.
5. One still re-rendered from module 02 or the pilot, proving your extensions
   to `schedulerCycle` / `binding` did not change them.
6. Anything in a `visual.spec` you could not realise, and what you did instead.

You cannot view images. Say so plainly and report what your checks show rather
than asserting a still looks right. The visual pass is mine.

## Stop condition

`Module06` renders end to end from its script, `check-frames.mjs` passes, and
the earlier modules still render unchanged. If a fix would need narration
changes or invented content, stop and report instead.

End with exactly one line:

`MODULE 06 STATUS: READY` or `MODULE 06 STATUS: BLOCKED`
