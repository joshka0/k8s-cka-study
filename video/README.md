# Intent to Packet — video renderer

A [Remotion](https://www.remotion.dev) 4.x project that renders the ~17.6 minute
"Intent to Packet" explainer (1920×1080, 30 fps) entirely from `script.json` in
this directory. The visuals are diagrammatic and derived from each beat's
`visual.spec`, matching the course's dark palette and rounded-panel look.

## Layout

```
script.json                 content contract — 18 beats (authoritative)
src/
  index.ts                  Remotion entry point (registerRoot)
  Root.tsx                  the <Composition>; maps beats to Sequences
  Beat.tsx                  per-beat wrapper (stage, captions, audio mount)
  Caption.tsx               word-by-word narration caption track
  script.ts                 timing logic (audio-authoritative, estSeconds fallback)
  theme.ts / ui.tsx         palette, lane colours, panel primitives
  visuals/<Type>.tsx        one component per visual.type (18 total)
  visuals/index.ts          visual.type → component registry
  generated/narration.ts    AUTO-GENERATED audio wiring + durations
narration/
  durations.json            AUTO-GENERATED measured seconds per beat
scripts/measure-narration.mjs  measures audio and regenerates the above
```

## Preview

```bash
npm install
npm run dev          # opens Remotion Studio at http://localhost:3000
```

## Render

```bash
# full video (estimates until narration audio is present)
npm run render src/index.ts IntentToPacket out/intent-to-packet.mp4

# a single full beat (example: beat 3, "gates")
npm run render src/index.ts IntentToPacket out/gates.mp4 \
  --frames=870-2509

# a still at one frame
npm run still src/index.ts IntentToPacket --frame=400 out/still.png
```

List the composition and its resolved duration:

```bash
npx remotion compositions src/index.ts
```

Captions default **on**. When narration audio is present, disable them (they would
duplicate the spoken words):

```bash
npm run render src/index.ts IntentToPacket out/video.mp4 --props='{"showCaptions":false}'
```

## The module videos

Modules 01–07 have compositions (`Module01` … `Module07`) driven by
`modules/<name>/script.json`; scripts for Modules 08–12 are prepared for the
remaining renderer work. Adding a beat to one module changes only that module.
`src/Root.tsx` is the registry: a module needs an entry there before it has a
composition, so a script can exist long before it renders.

```bash
# preview or render one module
npm run render src/index.ts Module03 out/module03.mp4

# synthesise a module's narration (voice comes from the script's meta)
node scripts/dub.mjs --module u03-reconciliation

# re-measure after dubbing, then confirm the new duration
node scripts/measure-narration.mjs
npx remotion compositions src/index.ts

# one still near the end of every beat, for the visual pass
node scripts/render-module-stills.mjs u03-reconciliation
node scripts/check-frames.mjs out/Module03-*.png
```

**Dub before you render.** A module with no audio falls back to `estSeconds`,
which is a planning estimate pitched near 96 wpm; the voice runs closer to 185.
An undubbed module therefore renders about twice as long as the finished one,
lingering on every beat. Dubbing module 02 took it from 9:02 to 4:37.

Because dubbing changes every frame offset, nothing downstream may hard-code
frame numbers — `render-module-stills.mjs` derives them from the same duration
source the composition uses. Frame numbers computed against `estSeconds` point
past the end of a dubbed composition, where the renderer hangs instead of
failing.

## How timing works

Narration audio is the timing authority; no frame counts are hardcoded anywhere.

- `scripts/measure-narration.mjs` scans `narration/` for `<beat-id>.(mp3|wav|m4a)`,
  measures each with `ffprobe`, and writes:
  - `narration/durations.json` — real seconds per beat;
  - `src/generated/narration.ts` — static imports of the audio + the durations.
- `src/script.ts` picks, per beat: **the measured duration if present, otherwise
  `estSeconds`**. Frames = seconds × `meta.fps` (30).
- `Beat.tsx` mounts `<Audio>` only for beats with a measured file; the
  composition's total duration is the sum of all beat durations.

**Fallback path (no narration):** when a beat has no measured narration,
its duration comes from `estSeconds`. Timing is resolved per beat, so dubbed
modules and undubbed prepared scripts can coexist in the same project.

**When narration arrives:** drop `narration/<beat-id>.mp3` into this folder, run
`npm run measure`, then render. No other changes needed.

## How to add a beat

1. Append an object to `beats` in `script.json` (give it a unique `id` and a
   `visual.type`).
2. If the `visual.type` already exists, nothing else is needed — reordering or
   renaming beats changes the render automatically.
3. If it is a **new** visual type, add a component in `src/visuals/<Type>.tsx`
   (`(props: { beat: Beat }) => JSX`) and register it in `src/visuals/index.ts`.

## Notes on fidelity

Each visual is realised from its `visual.spec`. Where the narration gives more
specific or narrower content than the spec's paraphrase (e.g. the cold open lists
concrete symptom phrases, or the failure map names four symptoms), the on-screen
text follows the script's wording and adds no Kubernetes claims of its own.
