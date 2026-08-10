# Packet: build the module 08–12 compositions

You built modules 01–07 of this Remotion project. This completes the series.

## Read first

- `SERIES.md` — the series contract.
- `modules/u08-networking/script.json` … `modules/u12-scale-evidence/script.json`
  — five scripts, same beat shape as the modules you have already built.
- `src/` — the project. Seventy-eight visual components already exist.
- `modules/u07-kubelet/` — your last module. Match it.

## Scope

1. **Five new compositions**, ids `Module08` … `Module12`, each reading only its
   own script.
2. **Register each in `src/Root.tsx`** exactly as `Module07` is registered,
   including the static import. That array is also what
   `render-module-stills.mjs` reads to discover renderable modules.
3. **Build every component whose `visual.spec` begins `NEW`.** Wire up every
   spec beginning `REUSE` rather than rewriting it. Roughly forty new
   components across the five, so work steadily and keep them consistent with
   the existing set.
4. Two specs ask you to *extend* a reused component. Do that additively,
   without changing how any earlier module renders it, and prove it with a
   re-rendered still from an earlier module.

## Corrections already applied — respect them

These scripts were technically reviewed and corrected. Several specs carry a
`CORRECTION:` sentence describing something the visual must **not** show. Those
are not stylistic preferences; each one marks a claim that was factually wrong
in an earlier cut. Read them carefully and follow them exactly. In particular:

- Do not draw readiness adding or removing an address from an EndpointSlice.
- Do not draw NetworkPolicy with a green "enforced" state.
- Do not draw IPAM delegation, or CSI volume staging, as mandatory.
- Do not draw the scheduler and provisioner waiting on each other.
- Do not draw a name with four dots skipping search expansion.

## Layout rules — settled, do not rediscover

- `VisualStage` in `src/Beat.tsx` sets an explicit height and centres its
  child's content. Root your component at `position: absolute; inset: 0` and
  let the shared rule centre it. Add no vertical offsets of your own.
- `box-sizing: border-box` is global. Do not pair `width: '100%'` with padding
  or a border and assume it fits.
- Never position with absolute `right:`. Put content in flow.
- No fixed-width slots for variable-length labels; wrap to rows or use auto
  width. Do not use `flex: 1` on a panel that can outgrow the stage.
- Labels for two different rows, columns or groups must come from **their own
  data**, never a shared positional helper. A component that derived one row's
  captions from the other row's index shipped `bind · pick best`, which is
  wrong.
- Tokens that travel must not leave the frame. A widened track pushed a moving
  token off-screen; clamp travel to the track and fade instead.
- The caption band is a rolling two-line subtitle at 26px. It is tuned.
- Fill the stage. Nested or secondary detail must be legible.
- Module beats have `stage: null`. Show the lane, not a stage chip.

## Non-goals

- **Do not write, rewrite, shorten or extend any `narration` text, and do not
  add Kubernetes claims of your own.** These scripts have been through
  technical review; silent additions bypass it.
- Do not touch modules 01–07's scripts, narration or timing.
- No TTS, no API keys, no audio synthesis. The narration already exists.
- **No renders other than the evidence below, and never more than one at a
  time.** A concurrent render collided with another process on the same output
  file and destroyed a run. Check nothing else is rendering before you start.
- No git: no init, commit, branch or push. (A previous run created a `.git`
  here despite this line. Do not.)
- Nothing outside `video/`.
- Do not delegate to further agents. Do the work yourself.

## Evidence

1. `npx remotion compositions src/index.ts` showing thirteen compositions, with
   modules 01–07 unchanged.
2. `node scripts/render-module-stills.mjs <each new module>`. **Never hard-code
   frame numbers.**
3. `node scripts/check-frames.mjs out/Module08-*.png` and the same for 09–12,
   output pasted. An unreadable file counts as a failure.
4. One short motion render, one beat, with path and duration.
5. A still re-rendered from an earlier module proving your extensions changed
   nothing there.
6. `npx tsc --noEmit`.
7. Anything in a `visual.spec` you could not realise, and what you did instead.

You cannot view images. Say so plainly and report what your checks show rather
than asserting a still looks right. The visual pass is mine — and note that a
caption bug in module 06 passed every automated check and was caught only by
eye, so "checks passed" is not the same as "correct".

## Stop condition

All five modules render end to end, `check-frames.mjs` passes, and modules
01–07 and the pilot still render unchanged.

End with exactly one line:

`MODULES 08-12 STATUS: READY` or `MODULES 08-12 STATUS: BLOCKED`
