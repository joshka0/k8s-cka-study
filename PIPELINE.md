# Adding a module

One module per course unit. This is the order that works, and the reasons each
step sits where it does. Steps marked **automatic** need no work — a generator
picks the module up once its inputs exist.

## 0. The unit comes first

`assets/content.js` (units 1–12) and `assets/advanced-content.js` (13+) are the
content authority. A module may only teach what its unit teaches. If the module
needs a fact the unit does not have, add it to the unit first — the same rule
the deck follows.

## 1. Script

Write `video/modules/<uNN-slug>/script.json`. Copy the shape of an existing one.

- `series.module` is the number, `series.unit` the unit id. Both are load-bearing:
  generators key off them.
- `series.spineSegment` must match a string in `SPINE_ORDER` in `src/module.ts`,
  or `spineLocator` silently lights segment 1.
- Every beat needs `visual.type` and a `visual.spec`. Prefix the spec `REUSE` when
  an existing component fits, `NEW` when one must be built. Reuse aggressively —
  there are 150+ components.
- Length tracks the unit's depth. Units 1–12 run 650–1050 words; the thinner
  advanced units run ~500. A short module beats a padded one.

Then:

```bash
node scripts/lint-narration.mjs modules/<dir>/script.json
```

It checks banned signposting and sentence length. If it flags a sentence that is
genuinely fine — one starting with a lowercase API field or tool name — fix the
linter's known-starters list, not the prose. That has happened three times.

## 2. Technical review — do not skip this

Have a **different model family** review the script before anything is built.
Codex and grok have both done this well; the author must not review its own work.

```bash
# write a brief modelled on video/REVIEW-scripts-13-20.md, then:
herdr pane split "$HERDR_PANE_ID" --direction down --cwd video --no-focus
herdr pane run <pane> 'codex'      # or grok
herdr pane run <pane> 'Read REVIEW-scripts-NN.md and carry it out. Write findings to REVIEW-FINDINGS-NN.md only.'
```

This is the highest-value step in the pipeline. Across the first twelve modules
it found **97 corrections, 24 of them outright wrong** — including a video that
sent viewers to the wrong next module, scheduler stages drawn on the wrong
cycle, and a false claim about what keeps a Pod Pending. Modules written after
the review step existed needed 16 corrections for eight modules, and one came
back clean.

Applying findings by string replacement is fast but **corrupts text when a fix
overlaps an earlier edit**. Always audit afterwards:

```bash
# any five-word phrase appearing twice in one beat is almost certainly a bad merge
python3 - <<'EOF'
import json, glob, re
for f in sorted(glob.glob('modules/u*/script.json')):
    for b in json.load(open(f))['beats']:
        for m in re.finditer(r'\b([A-Z][a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+)', b['narration']):
            if b['narration'].count(m.group(1)) > 1:
                print(f, b['id']); break
EOF
```

Re-lint after applying.

## 3. Dub — before building, not after

```bash
infisical run --projectId 4cf07c20-ea10-4ecc-ae9d-bc5307cb0241 --env dev --path /home -- \
  node scripts/dub.mjs --module <dir>
node scripts/measure-narration.mjs
```

The key lives in Infisical at path `/home`, **not** in `~/.env` — a stale key
there returns 402, which surfaces as 502 under load and looks exactly like a
provider outage. `dub.mjs` warns when it falls back to the file.

Dub first because timing comes from the audio. A module built against
`estSeconds` gets frame numbers that are wrong once real audio lands, and every
still has to be re-rendered. Use `--force` only when the narration changed;
without it the run resumes and skips what already exists.

## 4. Components — one agent, and nothing else rendering

Write a packet modelled on `video/DELTA-06-modules-13-20.md` and give it to
droid in a herdr pane:

```bash
herdr pane run <pane> 'droid exec -f DELTA-NN.md -m "custom:deepseekv4-latest-[OpenRouter]-67" -r high --auto high'
```

Carry forward the accumulated layout rules in the packet — they are all
already-paid-for defects. Also carry the `CORRECTION:` notes the review produced;
those mark things the visual must **not** show.

**Verify nothing else is rendering before you start, and never run two renders
at once:**

```bash
ps -eo command= | awk '/remotion (render|still)/ && !/awk/' | wc -l   # must be 0
```

Two writers on one output file killed two runs. The second offender was a
*reviewer* agent that had been told not to build anything — a prohibition in a
packet is not enforcement.

## 5. Stills and the visual pass

```bash
node scripts/render-module-stills.mjs <dir>
node scripts/check-frames.mjs out/ModuleNN-*.png
```

`check-frames` only proves nothing touches the frame edge. It cannot see a false
label, a contradiction, or dead space. **Look at the stills.** Two real bugs got
through every automated check and were caught only by eye:

- one component derived a row's captions from another row's index, shipping
  `bind · pick best`
- another rendered one fact three ways with two thresholds, so a Pod card said
  ready while the data plane declined the same endpoint

The stills script renders end-of-beat frames. If a beat's teaching moment is in
the middle, render a mid-beat frame explicitly — that is how the second bug was
found.

## 6. Render

```bash
npx remotion render src/index.ts ModuleNN out/ModuleNN.mp4
```

Confirm every earlier module's duration is unchanged afterwards. Verify the
output rather than trusting exit codes:

```bash
ffprobe -v error -show_entries format=duration -show_entries stream=codec_type \
  -of csv=p=0 out/ModuleNN.mp4    # expect a duration and both streams
```

Long renders should be resumable — skip an output already newer than its
`durations.json` — because background jobs do get killed.

## 7. Site and index — automatic

```bash
node tools/build-modules-asset.mjs   # assets/modules.js  → the learn path
node tools/build-modules-page.mjs    # modules.html       → the index
```

Both scan `video/modules/` and only include a unit whose video exists, so a
half-finished module never becomes a dead link. `build-modules-asset.mjs` matches
`ModuleNN.mp4` exactly — beat proofs and excerpts share the prefix and must not
become the lesson player's source.

The learn path then shows a video node per unit automatically, deep-linkable at
`index.html#m/<unit>`.

## 8. Deck

Add cards to `deck/lesson-cards.json`, then:

```bash
deck/.venv/bin/python deck/build_lessons_deck.py
```

The builder derives units and the lesson→unit map from the course content, so a
new unit needs no builder change. Card rules it enforces: exactly one mode tag
(`recall` or `understanding`, determined by type), the unit slug tag, a type
marker for `discrimination`/`cloze`/code types, and for name-answer types the
answer must not appear on the front and must appear on the back.

The corrections a review produces are the best card material in the deck — they
are precisely the misconceptions an exam probes.

## 9. Social posts

`~/Desktop/k8s-module-posts/` holds one file per module, plus a
`general-audience/` variant. Each carries a ≤280-character X post (verify the
count, do not estimate), a longer X version and a LinkedIn version.

**Posts inherit errors.** After any review, re-audit them — four posts repeated
claims the reviewers had overturned.

## Order summary

    unit content → script → lint → review → apply + audit → dub → measure
      → components (one agent, nothing else rendering) → stills → visual pass
      → render → verify → generators → deck → posts
