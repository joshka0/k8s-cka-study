# Packet: build the module 07 composition

You built modules 01–06 of this Remotion project. This adds module 07, the
kubelet. Same project, same palette, same caption system, same audio-driven
timing.

## Read first

- `SERIES.md` — the series contract.
- `modules/u07-kubelet/script.json` — the script. Twelve beats, same shape as
  the other modules.
- `src/` — the project. Seventy visual components already exist.
- `modules/u06-scheduling/` — your last module. Match it.

## Scope

1. **One new composition**, id `Module07`, reading only
   `modules/u07-kubelet/script.json`.
2. **Register it in `src/Root.tsx`** exactly as `Module06` is registered,
   including the static import. That array is also what
   `render-module-stills.mjs` reads to discover renderable modules.
3. **Eight new components**: `kubeletLoop`, `nodeSequence`, `fourBoundaries`,
   `criVsOci`, `phaseVsHealth`, `trafficChain`, `terminationRace`,
   `staleStatus`.
4. **Four reuses**: `spineLocator` (beats 0 and 11), and the pilot's `sandbox`
   and `probes`. Both pilot components have *extend* specs — extend them
   additively, without changing how the pilot or any earlier module renders
   them, and prove that with a re-rendered still.

## Layout rules — settled, do not rediscover

- `VisualStage` in `src/Beat.tsx` sets an explicit height and centres its
  child's content. Root your component at `position: absolute; inset: 0` like
  its siblings and let the shared rule centre it. Do not add vertical offsets
  to compensate for a bug that no longer exists.
- `box-sizing: border-box` is global. Do not pair `width: '100%'` with padding
  or a border and assume it fits.
- Never position with absolute `right:`. Put content in flow.
- No fixed-width slots for variable-length labels. Wrap to rows or use auto
  width. Do not use `flex: 1` on a panel that can outgrow the stage — the
  pilot's `SchedulerCycle` does exactly that and stretches past the visible
  area. Do not copy that pattern, and do not fix it here either; it is out of
  scope for this packet.
- The caption band is a rolling two-line subtitle at 26px. It is tuned.
- Fill the stage. A diagram in the middle 40% with large empty margins is a
  defect.
- Nested or secondary detail must be legible. Do not render the point of a beat
  at 14px grey.
- Module beats have `stage: null`. Show the lane, not a stage chip.

## One specific defect from module 06, do not repeat it

`TwoCycles` rendered its per-stage captions from the **column index**, and
applied the same function to both rows. The binding row therefore inherited the
scheduling row's captions and displayed `bind · pick best`, which is wrong —
binding does not pick anything. I fixed it by giving each row its own caption
array.

The general rule: when two rows, columns or groups hold **different** data,
their labels must come from their own data, never from a shared positional
helper. Module 07 has several beats with parallel structures — the four
boundaries, the two termination timelines, the four chain links. Each side owns
its own labels.

## Non-goals

- **Do not write, rewrite, shorten or extend any `narration` text, and do not
  add Kubernetes claims of your own.** If a spec seems to need a fact the
  narration does not carry, render only what the script supports and say so.
- Do not touch modules 01–06's scripts or narration, and do not re-time them.
- No TTS, no API keys, no audio synthesis. Module 07 has no narration audio and
  must fall back to `estSeconds`. (The TTS provider is returning 502s; that is
  expected and is not yours to work around.)
- No git: no init, commit, branch or push.
- Nothing outside `video/`.
- Do not delegate to further agents. Do the work yourself.

## Evidence

Report with real commands and real output:

1. `npx remotion compositions src/index.ts` showing eight compositions,
   `Module07` among them, and confirming the other seven durations are
   unchanged.
2. `node scripts/render-module-stills.mjs u07-kubelet`. **Do not hard-code
   frame numbers.**
3. `node scripts/check-frames.mjs out/Module07-*.png` with output pasted. A
   file it cannot read counts as a failure.
4. One short motion render, one beat, with path and duration.
5. A still re-rendered from the pilot proving your `sandbox` and `probes`
   extensions did not change it.
6. `npx tsc --noEmit`.
7. Anything in a `visual.spec` you could not realise, and what you did instead.

You cannot view images. Say so plainly and report what your checks show rather
than asserting a still looks right. The visual pass is mine — and note that the
module 06 caption bug passed every automated check and was only caught by eye,
so "checks passed" is not the same as "correct".

## Stop condition

`Module07` renders end to end, `check-frames.mjs` passes, and modules 01–06 and
the pilot still render unchanged. If a fix would need narration changes or
invented content, stop and report instead.

End with exactly one line:

`MODULE 07 STATUS: READY` or `MODULE 07 STATUS: BLOCKED`
