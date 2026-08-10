# Course verification

## HTML course

- HTML structure: PASS — interactive content loads 20 units, 44 lessons and 214
  steps; the guidebook has 32 unique IDs, 20 modules, 60 interview drills, and
  no missing anchors or assets.
- JavaScript syntax: PASS via `node --check assets/course.js`.
- Local assets: PASS — HTML, CSS, and JavaScript returned HTTP 200 with the
  expected content types from a temporary loopback server.
- Course composition: 20 modules and 60 core interview drills.
- Viewing path: 39 direct video links — 33 captured transcript sources plus six
  captions-disabled or request-blocked supplements.
- Reference shelves: PASS — all 20 modules contain one labelled shelf; all 91
  unique reference targets returned HTTP 200 during the 2026-08-10 validation
  pass. References are limited to primary Kubernetes,
  etcd, CoreDNS, Cilium, CSI, client-go, enhancement proposals, and upstream
  project documentation.
- Reference layout: existing responsive two-column desktop and single-column
  narrow-screen shelf rules apply to all 20 modules.
- Diagram QA: PASS — scheduler, runtime, networking, DNS, CSI, quorum, and APF
  reconstructions use semantic HTML, responsive overflow/stacking, visible
  captions, and original wording rather than copied slide artwork. Representative
  desktop/dark-mode renders were visually inspected for wrapping and contrast.

## Deck source

- Components: 60 unique slugs, five in every course module.
- Vocabulary cards: 120 cards, 120 unique IDs, exactly two for every component
  and ten in each of the original twelve vocabulary subdecks.
- Lessons deck: 206 notes, 249 generated cards and 20 non-empty subdecks; all 44
  lessons are represented.
- Images: intentionally omitted in this verbal edition; every card uses `image: null`
  and `image_side: none`.
- Card composition: 68 understanding and 52 recall cards, including 23 explicit
  boundary discriminations.
- Card author verdict: `CARDS STATUS: READY`.
- Packager verdict: `PACKAGER STATUS: READY`.

## Package and visual checks

- `genanki` 0.13.1 is installed in the course-local `deck/.venv`.
- `deck/.venv/bin/python build_deck.py`: PASS — built 120 Basic notes with no
  warnings; every one of the twelve subdecks contains ten notes.
- Package inspection: PASS — the `.apkg` contains `collection.anki2` and an
  empty media manifest; the SQLite collection contains 120 notes and 120 cards.
- `deck/.venv/bin/python render_preview.py`: PASS — generated representative
  recall, explanation, and discrimination cards from the production CSS and
  actual card source.
- Visual inspection: PASS — front/back hierarchy, contrast, wrapping, spacing,
  and dark-mode rendering are legible in the generated 1400-pixel preview.
