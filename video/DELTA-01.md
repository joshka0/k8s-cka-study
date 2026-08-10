# Delta 01 — art direction pass

The scaffold from the first packet is accepted: data-driven, audio-authoritative
timing verified, no invented content, nothing touched outside `video/`. Good work
on flagging the cold-open spec inconsistency rather than inventing three extra
phrases — that was a defect in my spec and it is now fixed in `script.json`.

This delta is layout and legibility only. **The same non-goals from `BRIEF.md`
still apply in full** — do not write or alter narration, do not add Kubernetes
claims, no TTS, no git, nothing outside `video/`.

## Source of truth changed

`script.json` is updated. Two changes:

1. **Every beat now has a `stage` field** — an integer for the fourteen numbered
   stages, `null` for the four framing beats (cold-open, three-lanes,
   what-breaks, recap).
2. The cold-open `visual.spec` now says "three symptom phrases", matching the
   narration.

## Defects to fix

### D1 — Stage numbering is wrong (all beats)

The chip currently reads `STAGE 3 · CONTROL PLANE` on a beat whose title is
`Stage 2 — Five gates`, because it derives from `n` (the beat index). It must
use the new `stage` field. On framing beats (`stage: null`) show **no** stage
chip at all — just the lane, or nothing where lane is also null.

### D2 — The caption block dominates the frame (all beats)

Right now it is 6–8 lines of large type occupying the bottom third, and it
competes with the diagram instead of supporting it. Make it a subtitle, not a
teleprompter:

- Show a **rolling window of at most 2 lines** — roughly the current sentence —
  not the whole beat's narration.
- Reduce type size substantially. Target a caption band no taller than ~15% of
  frame height.
- Keep the spoken-word highlight; it works well. Drop the `48/122` word counter,
  it reads as debug output.

### D3 — Large dead band between diagram and captions (all beats)

Diagrams sit in the upper third and the middle of the frame is empty. With the
caption band shrunk, give the diagram a proper stage: centre it in the space
above the captions and scale it up. Aim for the diagram occupying roughly the
top 75% of the frame, optically centred within that.

### D4 — `spineRecap` is broken (beat 17)

Worst offender, see `out/beat17.png`:

- Segment labels overlap each other badly ("desired object" / "admission /
  storage" / "watch + cache" collide; "scheduler queue + binding" overlaps
  "kubelet").
- The final segment, `application`, is clipped off the right edge of the frame.
- The three lane loop icons float in the middle of the dead band, unrelated to
  the spine above them.

The spine has fourteen segments and will not fit on one row at legible size.
Wrap it to two or three rows, or stack it vertically — your call, but every
label must be fully readable and inside the frame. Anchor the lane icons to the
spine segments they actually own.

### D5 — `cniExec` nested IPAM exec is illegible (beat 10)

See `out/beat10.png`. The nested `ipam plugin → returns address…` is rendered as
tiny grey text clipped at the right edge. The delegation is the point of that
beat — the narration explicitly builds to "an IPAM plugin, invoked by a CNI
plugin, invoked by the runtime". Render it as a visibly nested exec block inside
the outer one, at readable size.

## Expected evidence

1. Stills for beats **0, 3, 10, 13, 16, 17** after the fixes, with paths.
2. For each, one line confirming: stage chip correct (or absent on framing
   beats), caption band within budget, no text overlapping or outside frame.
3. `npx remotion compositions` output.
4. Note anything you deliberately did differently and why.

You cannot view images. State that plainly in your report as you did last time —
I will do the visual check. Do not claim a still looks correct; report what you
changed and what your pixel checks show.

## Stop condition

All six stills re-rendered and the composition still resolves. If a fix would
require changing narration or inventing content, stop and report instead.

End with exactly one line:

`DELTA 01 STATUS: READY` or `DELTA 01 STATUS: BLOCKED`
