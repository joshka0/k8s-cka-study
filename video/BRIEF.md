# Packet: build the Remotion renderer for "Intent to Packet"

You are building the video renderer. You are **not** writing or editing the
narration content — that is already authored and is owned by the supervisor.

## Objective

Produce a working Remotion project in this directory that renders an ~17.6
minute 1920×1080 / 30fps explainer from `script.json`, and renders correctly
**with or without** narration audio.

## Context to read first

- `script.json` — the content contract. 18 beats. Each has `id`, `n`, `title`,
  `lane`, `estSeconds`, `narration`, and `visual.type` + `visual.spec`.
  `meta` carries fps, dimensions, the palette and the three lane definitions.
- `../assets/learn.css` — the course's visual language. Reuse its palette,
  its rounded-panel look, its type treatment. The video must look like it
  belongs to the same product as the course.
- `../index.html`, `../reference.html` — the course this video is a trailer for.

## Scope — what to build

1. **A Remotion project** (`npx create-video@latest` or hand-rolled; Remotion
   4.x) with `remotion.config.ts`, an entry point, and a root composition.
2. **One `<Beat>` sequence per script beat**, in order, driven entirely by
   `script.json`. Adding or reordering a beat in that JSON must change the
   video with no component edits.
3. **A component per `visual.type`.** There are 18 distinct types; implement
   each one to its `visual.spec`. These are the actual deliverable — the spec
   text describes intent, and you should exercise judgement about how to
   realise it well. Favour clear diagrammatic motion over decoration.
4. **A caption track** rendering each beat's narration as timed on-screen text,
   toggleable via a composition prop (`showCaptions`). Default on while there
   is no audio.
5. **Audio-driven timing.** If `narration/<beat-id>.(mp3|wav)` exists, that
   file's real duration determines the beat's duration and the audio is mounted.
   If it does not exist, fall back to `estSeconds`. Do not hardcode frame
   counts anywhere. Provide `scripts/measure-narration.mjs` that writes
   `narration/durations.json` from whatever audio is present, and have the
   composition read that.
6. **A README** in this directory: how to preview, how to render, how timing
   works, and how to add a beat.

## Non-goals — do not do these

- **Do not write, rewrite, extend, shorten or "improve" any `narration` text,
  and do not add Kubernetes claims of your own anywhere in the video.** If a
  `visual.spec` seems to need a technical detail that is not in the script,
  render only what the script supports and note the gap in your report. Factual
  accuracy is the supervisor's responsibility and is already verified; silent
  additions would bypass that.
- Do not synthesise audio, call any TTS API, or look for API keys. Narration
  arrives as files later, from the supervisor.
- Do not run `git init`, commit, branch, push, or touch version control.
- Do not modify anything outside `video/` except reading the files listed above.
- Do not publish, upload, or open anything externally.
- Do not delegate this to further agents; do the work yourself.

## Expected evidence

Report, with commands and their real output:

1. `npx remotion compositions` listing the composition and its resolved duration.
2. A **still render** of at least beats 0, 3, 6, 10, 12 and 17 to PNG, and the
   file paths. Look at them; do not just assert they rendered.
3. A **short motion render** — one full beat to MP4 — with its path and duration.
4. Confirmation that the project renders with `narration/` absent (the fallback
   path), stating which duration source was used.
5. Anything in a `visual.spec` you could not realise, and what you did instead.

## Stop condition

Stop when all 18 beats render end to end from `script.json`, stills and the
sample motion render exist and have been visually checked, and the README is
written. If you hit something genuinely blocking, stop and report it rather
than working around it by inventing content.

## Handoff

Leave everything in `video/`. The supervisor will supply `narration/*.mp3`,
re-measure durations, and do the final full render. End your report with
exactly one line:

`VIDEO SCAFFOLD STATUS: READY` or `VIDEO SCAFFOLD STATUS: BLOCKED`
