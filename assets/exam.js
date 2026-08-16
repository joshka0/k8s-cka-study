/* Kubernetes Beyond YAML — exam practice surface.

   Each question in window.EXAM_QUESTIONS is a staged-reveal, self-graded
   scenario, in exam voice:

     1 Attempt   context, task, constraints. Nothing else. You solve it in a
                 terminal, in your head, or on paper.
     2 Grade     the verify items appear as point-weighted checkboxes, with the
                 scoring notes beside them. You tick what your end state
                 actually achieved; the page adds the points up.
     3 Debrief   expected path, the trap, the docs-navigation drill, the docs.
     4 Retain    the attempt is stored, and the question enters the same
                 Leitner schedule the graded lesson items use.

   The same code renders both surfaces: the standalone exam.html index and the
   per-unit nodes inside the lesson path on index.html.                        */

(function () {
'use strict';

const QUESTIONS = window.EXAM_QUESTIONS || [];
const BY_ID = {};
QUESTIONS.forEach(q => { BY_ID[q.id] = q; });

/* ---------- progress store ----------

   index.html has the lesson engine loaded, and that engine holds the whole
   progress object in memory and rewrites the key on every save. Writing
   localStorage behind its back would be silently reverted by its next save, so
   when learn.js is present every mutation goes through the hook it exposes.
   On exam.html nothing else writes the key, so this file owns it directly.  */

const KEY = 'k8s-course:v3';
const BOXES = [0, 1, 3, 7, 21];   // days until due again — learn.js's schedule
const PASS = 0.8;                 // a scenario counts as recalled at 80%
const XP_FIRST = 20;              // once per question, like a module video

const today = () => Math.floor(Date.now() / 86400000);

function state() {
  if (window.CourseStore) return window.CourseStore.state();
  let s;
  try { s = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { s = null; }
  return (s && typeof s === 'object') ? s : {};
}

function update(fn) {
  if (window.CourseStore) { window.CourseStore.update(fn); return; }
  const s = state();
  if (!s.done) s.done = {};
  if (!s.srs) s.srs = {};
  fn(s);
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ }
}

// '@exam…' matches the '@video…' / '@audio…' namespace the path already uses
// for non-lesson completions, so the server's merge and the lesson counter
// both keep treating it as "not a lesson".
const doneKey = id => '@exam' + id;
// The lesson engine keys schedule entries lessonId + '#' + itemIndex. A
// scenario is one item, so it takes index 0 under the same '@exam' namespace —
// which also keeps it out of the lesson review queue, whose items must be
// renderable by the lesson engine.
const srsKey = id => '@exam' + id + '#0';

function attemptOf(id) {
  const rec = (state().done || {})[doneKey(id)];
  return (rec && typeof rec === 'object') ? rec : null;
}

function srsOf(id) {
  return (state().srs || {})[srsKey(id)] || null;
}

function status(id) {
  const attempt = attemptOf(id);
  const srs = srsOf(id);
  const days = srs ? srs.due - today() : null;
  return {
    attempt: attempt,
    srs: srs,
    attempted: !!attempt,
    passed: !!attempt && attempt.pct >= PASS * 100,
    dueNow: !!srs && srs.due <= today(),
    dueLabel: srs ? (days <= 0 ? 'due now' : days === 1 ? 'due tomorrow' : 'due in ' + days + ' days') : null
  };
}

/* One attempt: store the score, and schedule the question. A scenario below
   the pass mark resets the box, exactly as a wrong lesson answer does. */
function record(q, score) {
  const max = q.points;
  const pct = Math.round(score / max * 100);
  const ok = score / max >= PASS;
  const now = Date.now();
  update(s => {
    if (!s.done) s.done = {};
    if (!s.srs) s.srs = {};
    const prev = (s.done[doneKey(q.id)] && typeof s.done[doneKey(q.id)] === 'object')
      ? s.done[doneKey(q.id)] : null;
    s.done[doneKey(q.id)] = {
      best: Math.max(pct, prev ? (prev.best || 0) : 0),
      score: score, max: max, pct: pct, at: now, n: (prev ? (prev.n || 0) : 0) + 1
    };
    const box = ok ? Math.min(((s.srs[srsKey(q.id)] || {}).box || 0) + 1, BOXES.length - 1) : 0;
    s.srs[srsKey(q.id)] = { box: box, due: today() + BOXES[box], t: now };
    if (!prev) s.xp = (s.xp || 0) + XP_FIRST;
  });
}

/* ---------- dom + text ---------- */

function el(tag, attrs, children) {
  const n = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(k => {
    const v = attrs[k];
    if (v === null || v === undefined || v === false) return;
    if (k === 'html') n.innerHTML = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'on') Object.keys(v).forEach(ev => n.addEventListener(ev, v[ev]));
    else if (k === 'cls') n.className = v;
    else n.setAttribute(k, v === true ? '' : v);
  });
  (children || []).forEach(c => { if (c) n.appendChild(c); });
  return n;
}

const esc = s => String(s).replace(/[&<>"]/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* The question bank is generated from markdown-ish prose: `backticks` mark
   API objects and fields, and doc URLs appear bare. Escape first, so nothing
   in the bank can inject markup. */
function rich(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

const unitsById = {};
if (window.COURSE && window.COURSE.units) {
  window.COURSE.units.forEach(u => { unitsById[u.id] = u; });
}

function unitOf(q) { return unitsById[q.unit] || null; }

function unitLabel(unitId) {
  const u = unitsById[unitId];
  return u ? 'Unit ' + u.n + ' · ' + u.title : 'Unit ' + unitId.replace(/^u/, '');
}

function byUnit(unitId) { return QUESTIONS.filter(q => q.unit === unitId); }

/* Unit order follows the course when it is loaded, otherwise the bank's own
   order — exam.html loads the content files, so it normally follows the path. */
function unitOrder() {
  const seen = [];
  if (window.COURSE && window.COURSE.units) {
    window.COURSE.units.forEach(u => { if (byUnit(u.id).length) seen.push(u.id); });
  }
  QUESTIONS.forEach(q => { if (seen.indexOf(q.unit) < 0) seen.push(q.unit); });
  return seen;
}

/* ---------- prose blocks ---------- */

/* An expected-path step is one move, then the outcomes it can produce:
   "Left:" is the branch that means you are on the right page, "Right:" the
   branch that means you are not. They stay separate lines, and keep their
   own colour, because reading them as one paragraph loses the drill. */
function pathStep(text) {
  const lines = String(text).split('\n').filter(l => l.trim());
  const kids = [];
  lines.forEach((line, i) => {
    const m = /^(Left|Right):\s*/.exec(line);
    if (m) {
      kids.push(el('div', {
        cls: 'exam-branch ' + (m[1] === 'Left' ? 'left' : 'right'),
        html: '<b>' + m[1] + '</b> ' + rich(line.slice(m[0].length))
      }));
    } else {
      kids.push(el('div', { cls: i === 0 ? 'exam-move' : 'exam-move cont', html: rich(line) }));
    }
  });
  return el('li', { cls: 'exam-step' }, kids);
}

function proseBlock(text, cls) {
  return el('div', { cls: cls }, String(text).split('\n').filter(l => l.trim())
    .map(line => el('div', { cls: 'line', html: rich(line) })));
}

function sectionCard(kicker, kids, cls) {
  return el('section', { cls: 'exam-card' + (cls ? ' ' + cls : '') },
    [el('div', { cls: 'kicker', text: kicker })].concat(kids));
}

/* ---------- one question, four stages ---------- */

let active = null;   // { q, stage, ticked, host, opts, scored }

function chip(text, cls) { return el('span', { cls: 'exam-chip' + (cls ? ' ' + cls : ''), text: text }); }

function statusText(id) {
  const st = status(id);
  if (!st.attempted) return 'not attempted';
  return st.attempt.score + '/' + st.attempt.max + ' · ' + st.attempt.pct + '%'
    + (st.dueLabel ? ' · ' + st.dueLabel : '');
}

function draw(v) {
  const q = v.q;
  const st = status(q.id);
  const host = v.host;
  host.textContent = '';

  const head = el('div', { cls: 'exam-head' }, [
    v.opts.onBack ? el('button', {
      cls: 'btn ghost back', on: { click: () => leave(v) }
    }, [document.createTextNode('← ' + (v.opts.backLabel || 'Back'))]) : null,
    el('div', { cls: 'eyebrow', text: unitLabel(q.unit) + ' · exam scenario' }),
    el('h1', { text: q.title }),
    el('div', { cls: 'exam-chips' }, [
      chip(q.points + ' points'),
      chip('~' + q.minutes + ' min'),
      st.attempted ? chip('last ' + st.attempt.score + '/' + st.attempt.max + ' · ' + st.attempt.pct + '%',
        st.passed ? 'good' : 'warn') : null,
      st.dueLabel ? chip(st.dueLabel, st.dueNow ? 'warn' : '') : null
    ])
  ]);
  host.appendChild(head);

  /* stage 1 — attempt */
  host.appendChild(sectionCard('Scenario', [
    el('p', { cls: 'exam-context', html: rich(q.context) }),
    el('div', { cls: 'kicker', text: 'Task' }),
    el('p', { cls: 'exam-task', html: rich(q.task) }),
    q.constraints && q.constraints.length ? el('div', { cls: 'kicker', text: 'Constraints' }) : null,
    q.constraints && q.constraints.length
      ? el('ul', { cls: 'exam-constraints' }, q.constraints.map(c => el('li', { html: rich(c) }))) : null
  ]));

  if (v.stage === 'attempt') {
    host.appendChild(el('p', { cls: 'exam-hint', text: 'Work it end to end before you grade. '
      + 'Nothing below is shown until your end state is final.' }));
    host.appendChild(el('button', {
      cls: 'btn wide exam-primary', on: { click: () => { v.stage = 'grade'; draw(v); } }
    }, [document.createTextNode('Grade it')]));
    if (st.attempted) {
      host.appendChild(el('button', {
        cls: 'btn ghost wide exam-secondary',
        on: { click: () => { v.stage = 'debrief'; v.reviewOnly = true; v.scored = null; draw(v); } }
      }, [document.createTextNode('Read the debrief again')]));
    }
    finishDraw(v);
    return;
  }

  /* stage 2 — grade. Skipped when the debrief is being re-read rather than
     earned: an empty checklist beside an old score would read as this
     attempt's grading. */
  const items = q.verify.items;
  if (!v.reviewOnly) {
    const gradeKids = [];
    gradeKids.push(el('p', { cls: 'exam-lede', text: 'Tick only what your end state actually achieved. '
      + 'The scorer is checking objects in the cluster, not intent.' }));

    // The notes carry the gates ("gate the last four points on the CronJob
    // existing"). They are not enforced here — only you know what the cluster
    // looked like — so they sit above the checklist where they cannot be
    // skipped past.
    if (q.verify.notes && q.verify.notes.length) {
      gradeKids.push(el('div', { cls: 'exam-notes' }, [
        el('h4', { text: 'How this is scored' })
      ].concat(q.verify.notes.map(n => el('div', { cls: 'line', html: rich(n) })))));
    }

    const scoreLine = el('div', { cls: 'exam-score-live' });
    const boxes = [];
    const tally = () => items.reduce((sum, it, i) => sum + (v.ticked[i] ? it.points : 0), 0);
    const paintScore = () => {
      boxes.forEach((b, i) => {
        v.ticked[i] = b.checked;
        b.parentNode.classList.toggle('on', b.checked);
      });
      scoreLine.textContent = 'Score ' + tally() + ' / ' + q.points;
    };

    const list = el('div', { cls: 'verify-list' }, items.map((it, i) => {
      const input = el('input', { type: 'checkbox' });
      input.checked = !!v.ticked[i];
      input.addEventListener('change', paintScore);
      boxes.push(input);
      return el('label', { cls: 'verify' }, [
        input,
        el('span', { cls: 'key', text: String(i + 1) }),
        el('span', { cls: 'verify-text', html: rich(it.text) }),
        el('span', { cls: 'verify-pts', text: '+' + it.points })
      ]);
    }));
    gradeKids.push(list);
    gradeKids.push(scoreLine);
    host.appendChild(sectionCard('Self-grade', gradeKids, 'grading'));
    paintScore();
    v.toggle = n => { const b = boxes[n]; if (b) { b.checked = !b.checked; paintScore(); } };

    if (v.stage === 'grade') {
      host.appendChild(el('button', {
        cls: 'btn wide exam-primary',
        on: { click: () => { v.scored = tally(); record(q, v.scored); v.stage = 'debrief'; draw(v); } }
      }, [document.createTextNode('Score it')]));
      finishDraw(v);
      return;
    }
    list.classList.add('locked');
  }

  /* stage 3 — debrief */
  const shown = v.scored === null || v.scored === undefined
    ? (st.attempt ? st.attempt.score : 0) : v.scored;
  const pct = Math.round(shown / q.points * 100);
  const srs = srsOf(q.id);
  const nextIn = srs ? BOXES[srs.box] : null;

  host.appendChild(el('div', { cls: 'exam-result ' + (pct >= PASS * 100 ? 'pass' : 'short') }, [
    el('b', { text: shown + ' / ' + q.points }),
    el('span', { text: pct + '%  ·  ' + (pct >= PASS * 100
      ? 'that end state would score.'
      : 'short of the mark. The debrief below is the gap.') }),
    nextIn === null ? null : el('small', { text: nextIn === 0
      ? 'Scheduled again today.'
      : 'Scheduled again in ' + nextIn + ' day' + (nextIn === 1 ? '' : 's') + '.' })
  ]));

  host.appendChild(sectionCard('Expected path', [
    el('ol', { cls: 'exam-path' }, q.expectedPath.map(pathStep))
  ]));

  host.appendChild(sectionCard('The trap', [
    proseBlock(q.trap, 'exam-trap')
  ], 'trap'));

  host.appendChild(sectionCard('Docs navigation', [
    el('p', { cls: 'exam-lede', text: 'The exam is open-book against one site. '
      + 'This is the page and the search term that get you there.' }),
    proseBlock(q.docsPath, 'exam-docspath')
  ]));

  host.appendChild(sectionCard('Documentation', [
    el('ul', { cls: 'exam-docs' }, (q.docs || []).map(d =>
      el('li', {}, [el('a', { href: d, target: '_blank', rel: 'noopener', text: d })])))
  ]));

  const unit = unitOf(q);
  const nxt = nextQuestion(q.id);
  host.appendChild(el('div', { cls: 'exam-actions' }, [
    el('button', {
      cls: 'btn ghost',
      on: { click: () => { v.stage = 'attempt'; v.ticked = {}; v.scored = null; v.reviewOnly = false; draw(v); } }
    }, [document.createTextNode('Attempt again')]),
    unit ? el('a', { cls: 'btn ghost', href: 'reference.html#' + unit.ref },
      [document.createTextNode('Guidebook →')]) : null,
    nxt ? el('button', {
      cls: 'btn', on: { click: () => open(nxt.id, v.host, v.opts) }
    }, [document.createTextNode('Next scenario · ' + nxt.title)]) : null,
    v.opts.onBack ? el('button', { cls: 'btn ghost', on: { click: () => leave(v) } },
      [document.createTextNode(v.opts.backLabel || 'Back')]) : null
  ]));
  finishDraw(v);
}

function finishDraw(v) {
  if (v.opts.onStage) v.opts.onStage(v.stage);
  window.scrollTo(0, 0);
}

function nextQuestion(id) {
  const order = [];
  unitOrder().forEach(u => byUnit(u).forEach(q => order.push(q)));
  const at = order.findIndex(q => q.id === id);
  return (at >= 0 && at + 1 < order.length) ? order[at + 1] : null;
}

function leave(v) {
  active = null;
  if (v.opts.onBack) v.opts.onBack();
}

function open(id, host, opts) {
  const q = BY_ID[id];
  if (!q) return false;
  const v = { q: q, stage: 'attempt', ticked: {}, scored: null, host: host, opts: opts || {} };
  active = v;
  draw(v);
  return true;
}

/* ---------- keyboard: the site's conventions ----------
   number keys tick a verify item, Enter advances the stage, Esc leaves.
   The lesson engine's own handler ignores every key while no lesson session
   is running, so on index.html the two never both act.                      */

document.addEventListener('keydown', e => {
  if (!active) return;
  if (!active.host || !document.contains(active.host)) { active = null; return; }
  const t = e.target;
  if (t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.type !== 'checkbox'))) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  if (e.key === 'Escape') {
    if (active.opts.onBack) { e.preventDefault(); leave(active); }
    return;
  }
  if (e.key === 'Enter') {
    const btn = active.host.querySelector('.exam-primary');
    if (btn) { e.preventDefault(); btn.click(); }
    return;
  }
  if (/^[1-9]$/.test(e.key) && active.stage === 'grade' && active.toggle) {
    e.preventDefault();
    active.toggle(parseInt(e.key, 10) - 1);
  }
});

/* ---------- nodes for the lesson path ---------- */

/* `bare` drops the "Exam scenario ·" prefix: on exam.html every node is one,
   so the words only add noise. In the lesson path they say what the node is. */
function questionNode(q, onOpen, bare) {
  const st = status(q.id);
  const cls = 'node exam' + (st.passed ? ' done' : st.attempted ? ' partial' : '');
  return el('button', { cls: cls, on: { click: () => onOpen(q.id) } }, [
    el('span', { cls: 'dot', text: st.passed ? '✓' : '⚑' }),
    el('span', {}, [
      el('span', { text: (bare ? '' : 'Exam scenario · ') + q.title }),
      el('small', { text: q.points + ' points · ~' + q.minutes + ' min · ' + statusText(q.id) })
    ])
  ]);
}

/* Used by the lesson path: the exam scenarios for one unit, as path nodes.
   Returns null when a unit has none, so the caller appends nothing. */
function unitNodes(unitId, onOpen) {
  const qs = byUnit(unitId);
  if (!qs.length) return null;
  return el('div', { cls: 'lessons' }, qs.map(q => questionNode(q, onOpen)));
}

/* ---------- standalone page ---------- */

function overallTiles() {
  const total = QUESTIONS.length;
  const attempted = QUESTIONS.filter(q => status(q.id).attempted).length;
  const due = QUESTIONS.filter(q => status(q.id).dueNow).length;
  const earned = QUESTIONS.reduce((s, q) => {
    const a = attemptOf(q.id);
    return s + (a ? Math.round(a.best / 100 * q.points) : 0);
  }, 0);
  const points = QUESTIONS.reduce((s, q) => s + q.points, 0);
  const minutes = QUESTIONS.reduce((s, q) => s + q.minutes, 0);
  return el('div', { cls: 'tiles exam-tiles' }, [
    el('div', { cls: 'tile' }, [el('b', { text: attempted + '/' + total }), el('span', { text: 'scenarios attempted' })]),
    el('div', { cls: 'tile' }, [el('b', { text: earned + '/' + points }), el('span', { text: 'best points' })]),
    el('div', { cls: 'tile' }, [el('b', { text: due ? String(due) : '—' }), el('span', { text: due ? 'due for review' : 'nothing due' })]),
    el('div', { cls: 'tile' }, [el('b', { text: String(minutes) }), el('span', { text: 'exam minutes' })])
  ]);
}

function showList(host) {
  active = null;
  host.textContent = '';
  if (location.hash.indexOf('#q/') === 0) {
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
  }

  host.appendChild(el('h1', { text: 'Exam practice' }));
  host.appendChild(el('p', { cls: 'lede', text: QUESTIONS.length + ' scored scenarios in exam voice. '
    + 'Each one gives you a context, a task and its constraints — nothing else — until you say you are done. '
    + 'Then you grade your own end state against the scorer’s items, and read the path you should have taken.' }));
  host.appendChild(overallTiles());

  unitOrder().forEach(unitId => {
    const qs = byUnit(unitId);
    const u = unitsById[unitId];
    const doneN = qs.filter(q => status(q.id).attempted).length;
    host.appendChild(el('section', { cls: 'unit' }, [
      el('div', { cls: 'unit-head' }, [
        el('div', { cls: 'badge', text: u ? String(u.n) : '⚑' }),
        el('div', {}, [
          el('div', { cls: 'tag', text: u ? u.tag : 'Exam' }),
          el('h2', { text: u ? u.title : unitLabel(unitId) }),
          el('p', { text: qs.reduce((s, q) => s + q.points, 0) + ' points · ~'
            + qs.reduce((s, q) => s + q.minutes, 0) + ' minutes' })
        ]),
        el('div', { cls: 'unit-meta' }, [el('span', { cls: 'ring', text: doneN + '/' + qs.length })])
      ]),
      el('div', { cls: 'lessons' }, qs.map(q => questionNode(q, id => showQuestion(host, id), true))),
      u ? el('a', { cls: 'guide-link', href: 'reference.html#' + u.ref },
        [document.createTextNode('Guidebook: ' + u.title + ' →')]) : null
    ]));
  });
  window.scrollTo(0, 0);
}

function showQuestion(host, id) {
  if (!open(id, host, {
    onBack: () => showList(host),
    backLabel: 'All scenarios'
  })) { showList(host); return; }
  if (location.hash !== '#q/' + id) {
    try { history.replaceState(null, '', '#q/' + id); } catch (e) { location.hash = 'q/' + id; }
  }
}

window.EXAM = {
  questions: QUESTIONS,
  byUnit: byUnit,
  status: status,
  statusText: statusText,
  unitNodes: unitNodes,
  open: open,
  count: QUESTIONS.length
};

/* exam.html marks its own mount point; index.html has none, and drives this
   file through window.EXAM instead. */
const standalone = document.getElementById('examScreen');
if (standalone) {
  const deep = /^#q\/([\w-]+)$/.exec(location.hash || '');
  if (deep && BY_ID[deep[1]]) showQuestion(standalone, deep[1]);
  else showList(standalone);
  window.addEventListener('hashchange', () => {
    const m = /^#q\/([\w-]+)$/.exec(location.hash || '');
    if (m && BY_ID[m[1]]) showQuestion(standalone, m[1]);
    // A hash that names no question — a stale link, or the back button — lands
    // on the index rather than leaving whatever was open on screen.
    else if (active || location.hash) showList(standalone);
  });
}
})();
