# Kubernetes Beyond YAML

An offline, senior-engineer-focused CKA and Kubernetes architecture course
derived from 33 available transcripts in `transcripts/`, mapped against the
official CKA v1.35 curriculum, and cross-checked against current upstream docs.

> **Accuracy status:** Kubernetes v1.36 adversarial reviews now cover Modules
> 1–12, and their corrections have been applied to the scripts, lesson path,
> reference guide, and Anki source. The published `video/REVIEW-FINDINGS-*.md`
> files preserve the audit trail and identify the superseded wording. All
> twelve reviewed compositions now have full-module MP4 exports.

## Open the course

Open `index.html` in a browser. It is an interactive lesson path: 27 units,
58 short lessons, 270 steps. Nothing is installed and nothing is uploaded —
progress lives in this browser's local storage.

Each lesson opens with a concept card, then drills it with exercises that must
be answered, not merely read:

| Type | What you do |
| --- | --- |
| Concept | Read the invariant, watch the clip that teaches it |
| Choose one | Pick the right component or discriminator |
| Select all | Separate real evidence from plausible noise |
| Put in order | Rebuild a pipeline — request path, scheduling cycle, CSI journey |
| Complete the sentence | Supply the precise term |
| Say it out loud | Answer an interview prompt, then self-grade against the model answer |

A wrong answer is re-queued to the end of the lesson, so a lesson only finishes
once everything has been answered correctly. Every graded item explains the
*discriminator* rather than restating the answer, and links upstream documents
and timestamped clips where the relevant source material is available.

Keyboard: `1`–`9` select, `Enter` checks and continues, `Esc` leaves the lesson.

## Video clips

Exercises link specific moments in the source talks — for example
"[Running does not mean ready](https://www.youtube.com/watch?v=PLCt3lSoXOw&t=423s)"
or "[Why VPA and HPA cannot both target requests](https://www.youtube.com/watch?v=fEZezc_zqJg&t=464s)".
Timestamps were derived by fetching the timed caption tracks and locating the
passage, not estimated. Transcript-backed clips are kept separate from four
advanced supplemental talks whose caption retrieval was request-blocked.

## Spaced review

Every graded item enters a Leitner schedule (same day → 1 → 3 → 7 → 21 days).
The **Review** chip in the header appears when items are due; with nothing due it
becomes **Practice** and serves your weakest items. Getting an item wrong resets
it to the shortest interval, and answering it correctly on the retry does not
undo that — you were shown it, you did not recall it.

## The guidebook

`reference.html` is the full prose course that the lessons are built from:
twenty-seven modules, eighty-one interview drills, nine original architecture
diagrams, a 39-item video path, and more than 90 primary-source references and print
styles. Every unit on the path links to its guidebook section, and every lesson
summary offers it. Use the lessons to practise and the guidebook to read.

## Studying from more than one device

Opened as a file, progress lives in that browser's `localStorage` — per-device
and per-origin, so a laptop and a phone would never agree. To share one state,
run the bundled server:

```
./start.sh
```

It serves the course on `127.0.0.1:8730` and publishes it to your tailnet over
HTTPS on port 8443, printing the exact URL:

```
https://<this-machine>.<tailnet>.ts.net:8443/
```

Open that on any device signed into the tailnet. Ctrl-C stops the server and
removes **only** the serve mount it created — an existing mount on `/` is left
alone. Override with `PORT=` and `TS_PORT=` if those ports are taken.

Tailnet-only, never public: this uses `tailscale serve`, not `tailscale funnel`.
The server binds loopback, so it is reachable through Tailscale and not from the
local network. Anyone on your tailnet can read and write the progress file —
which is fine when the tailnet is only your own devices.

### How persistence works

| Where | What happens |
| --- | --- |
| Opened via `file://` | `localStorage` only. The sync chip in the header shows ○ |
| Opened via the server | `localStorage` **plus** a shared `progress.json`, chip shows ☁ |
| Server unreachable mid-session | Falls back to `localStorage`, chip shows ⚠, resyncs on reconnect |

The server owns the merge, so two devices can study at once and converge:

- **XP** takes the maximum, so it never goes backwards
- **Completed lessons** union, keeping the better recorded accuracy
- **Streak** follows the most recent day
- **Scheduling** is per item, most recently answered wins — so getting something
  wrong on your phone is never overwritten by an older success on your laptop
- **Sound** is deliberately *not* synced; it is a per-device preference

`progress.json` sits next to `index.html`, is written atomically, and is never
served as a static file. Delete it to reset everything.

## Anki decks

Two decks ship here. They overlap by design and answer different questions.

| Deck | Notes | Trains |
| --- | --- | --- |
| `kubernetes-beyond-yaml.apkg` | 120 | Name and define the 60 components |
| `kubernetes-beyond-yaml-lessons.apkg` | 219 | Reproduce the invariants, discriminations, orderings and diagnostics the lessons drill |

The lessons deck mirrors all twenty units as twenty subdecks. Stable card GUIDs
mean re-importing this expanded package updates the original cards in place.

**Import:** Anki desktop (free) → *File → Import* → pick the `.apkg`. To study on
a phone, create a free AnkiWeb account, *Sync*, then use AnkiMobile on iOS (paid)
or ankiweb.net in a mobile browser (free) with the same account. Card GUIDs are
derived from stable ids, so re-importing an updated deck **updates in place**
rather than duplicating.

## Study loop

1. Work through a unit's lessons; answer out loud before selecting.
2. On a "say it out loud" prompt, answer fully before revealing the model — and
   grade yourself honestly, since only you can.
3. Read the unit's guidebook section once the lessons are done.
4. Come back for the review queue rather than repeating whole lessons.
5. Review the matching Anki subdeck after each unit.

## Layout

- `index.html` — the interactive lesson path
- `modules.html` — the twelve-module video/composition index
- `reference.html` — full prose guidebook, print-friendly
- `start.sh` — serve the course to your tailnet with shared progress
- `serve.js` — static server plus the `/api/progress` merge store
- `progress.json` — shared progress (created on first sync; delete to reset)
- `assets/content.js` — original 12 units of lesson content
- `assets/advanced-content.js` — eight-unit CKA completion and advanced-API track
- `assets/learn.js`, `assets/learn.css` — lesson engine and styling
- `assets/course.css`, `assets/course.js` — guidebook styling and answer reveal
- `deck/SPEC.md` — vocabulary-deck contract
- `deck/components.json` — 60-concept stable inventory
- `deck/cards.json` — vocabulary card source
- `deck/build_deck.py` — deterministic packager for the vocabulary deck
- `deck/render_preview.py`, `deck/card-preview.html` — its visual check
- `deck/kubernetes-beyond-yaml.apkg` — vocabulary deck package
- `deck/LESSONS-SPEC.md` — lessons-deck contract
- `deck/lesson-cards.json` — 219 lesson-derived notes
- `deck/build_lessons_deck.py` — packager for the lessons deck
- `deck/render_lessons_preview.py`, `deck/lesson-card-preview.html` — its visual check
- `deck/kubernetes-beyond-yaml-lessons.apkg` — lessons deck package
- `reports/` — authoring, verification, and the ordered `next-modules.md` research backlog
- `transcripts/` — 33 preserved English caption tracks and source manifest

The course content is canonical. The deck should reinforce it rather than
develop an independent explanation of the material.
