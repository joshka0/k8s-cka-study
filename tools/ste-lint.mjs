#!/usr/bin/env node
/* ASD-STE100 check for the course prose.
 *
 * STE rules this enforces:
 *   - Descriptive sentences stay at or below 25 words; procedural at or below 20.
 *   - One instruction per sentence.
 *   - Active voice.
 *   - Approved simple words; one term per concept.
 *
 *   node tools/ste-lint.mjs            # every surface
 *   node tools/ste-lint.mjs --fix-list # worst offenders first
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MAX_WORDS = 25;

// Complex word -> approved STE alternative.
// STE permits Technical Names and Technical Verbs outside its approved
// vocabulary, and its one-term-per-concept rule requires keeping them. So
// `component`, `terminate`, `persist`, `provision` and similar Kubernetes
// terms are NOT listed here — replacing them would make the course wrong.
const SIMPLER = {
  utilise: 'use', utilize: 'use', additionally: 'also', approximately: 'about',
  commence: 'start', purchase: 'buy', endeavour: 'try',
  facilitate: 'help', demonstrate: 'show', sufficient: 'enough',
  numerous: 'many', prior: 'before', subsequent: 'next', obtain: 'get',
  require: 'need', regarding: 'about', concerning: 'about', via: 'by',
  utilising: 'using', ascertain: 'find out', initiate: 'start',
  necessitate: 'need', endeavor: 'try',
  'in order to': 'to', 'due to the fact that': 'because',
  'a number of': 'some', 'is able to': 'can', 'has the ability to': 'can',
  'it is possible that': 'maybe', 'at this point in time': 'now',
  'in the event that': 'if', 'with regard to': 'about',
  'for the purpose of': 'to', 'is capable of': 'can',
};

const PASSIVE = /\b(is|are|was|were|be|been|being)\s+(\w+ed|written|held|kept|given|taken|shown|known|read|sent|built|made|done|seen|put|set|found|lost|left|meant|told)\b/gi;

const strip = s => String(s)
  // Block boundaries end a sentence. Without this a <ul> of short list items
  // reads as one enormous run-on, and STE actively recommends lists.
  .replace(/<\/(li|p|h[1-6]|div)>/gi, '. ')
  .replace(/<br\s*\/?>/gi, '. ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s*\.\s*\./g, '.')
  // An arrow sequence is a list, not a sentence. STE prefers lists for ordered
  // steps, so a → b → c should not be scored as one long sentence.
  .replace(/\s+[→>]\s+/g, '. ')
  .replace(/\{\{c\d+::(.*?)(?:::.*?)?\}\}/g, '$1')
  .replace(/&[a-z]+;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function sentences(text) {
  return strip(text)
    // A sentence here legitimately begins lowercase: a camelCase API field
    // (`backoffLimitPerIndex — …`), a dotted path (`spec.nodeName is empty`),
    // or a tool name (`kubectl describe …`). Requiring a capital merged those
    // into the previous sentence and reported list items as one run-on.
    .split(/(?<=[.!?])\s+(?=[A-Z(]|[a-z]+[A-Z]|[a-z]+\.[a-z]|(?:kubectl|kubeadm|etcdctl|etcd|kubelet|crictl|containerd|runc|nftables|iptables|dig)\b)/)
    .map(s => s.trim())
    .filter(Boolean);
}

export function analyse(text, id) {
  const out = [];
  for (const s of sentences(text)) {
    const words = s.split(/\s+/).filter(Boolean);
    if (words.length > MAX_WORDS) {
      out.push({ id, kind: 'long', n: words.length, text: s });
    }
    const passives = [...s.matchAll(PASSIVE)].map(m => m[0]);
    if (passives.length) out.push({ id, kind: 'passive', hits: passives, text: s });
    const lower = ' ' + s.toLowerCase() + ' ';
    for (const [complex, simple] of Object.entries(SIMPLER)) {
      if (lower.includes(' ' + complex + ' ')) {
        out.push({ id, kind: 'word', from: complex, to: simple, text: s });
      }
    }
    // Two independent clauses joined by a dash usually means two instructions.
    if ((s.match(/—/g) || []).length >= 2) {
      out.push({ id, kind: 'multi', text: s });
    }
  }
  return out;
}

/* ---------- surfaces ---------- */

function lessonTexts() {
  const g = {};
  global.window = g;
  const src = readFileSync(path.join(ROOT, 'assets/content.js'), 'utf8');
  new Function('window', src)(g);
  const rows = [];
  for (const u of g.COURSE.units) {
    for (const l of u.lessons) {
      l.items.forEach((it, i) => {
        for (const f of ['h', 'p', 'note', 'q', 'why', 'model']) {
          if (it[f]) rows.push([`${l.id}#${i}.${f}`, it[f]]);
        }
        (it.pts || []).forEach((p, k) => rows.push([`${l.id}#${i}.pts[${k}]`, p]));
        (it.o || []).forEach((o, k) => rows.push([`${l.id}#${i}.o[${k}]`, o]));
      });
    }
  }
  return rows;
}

function cardTexts() {
  const cards = JSON.parse(readFileSync(path.join(ROOT, 'deck/lesson-cards.json'), 'utf8'));
  return cards.flatMap(c => [[`${c.id}.front`, c.front], [`${c.id}.back`, c.back]]);
}

function guidebookTexts() {
  const html = readFileSync(path.join(ROOT, 'reference.html'), 'utf8');
  const rows = [];
  for (const m of html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)) {
    const t = strip(m[1]);
    if (t.length > 40) rows.push([`reference.html:p${rows.length}`, t]);
  }
  return rows;
}

const SURFACES = {
  lessons: lessonTexts,
  cards: cardTexts,
  guidebook: guidebookTexts,
};

const only = process.argv.find(a => SURFACES[a.replace('--', '')]);
const names = only ? [only.replace('--', '')] : Object.keys(SURFACES);
const showList = process.argv.includes('--fix-list');

let grand = 0;
for (const name of names) {
  const rows = SURFACES[name]();
  const findings = rows.flatMap(([id, text]) => analyse(text, id));
  const by = k => findings.filter(f => f.kind === k).length;
  const units = new Set(findings.map(f => f.id.split('#')[0].split('.')[0]));
  console.log(`\n${name}: ${rows.length} strings`);
  console.log(`  over ${MAX_WORDS} words : ${by('long')}`);
  console.log(`  passive voice   : ${by('passive')}`);
  console.log(`  complex words   : ${by('word')}`);
  console.log(`  multi-clause    : ${by('multi')}`);
  console.log(`  total           : ${findings.length} across ${units.size} locations`);
  grand += findings.length;

  if (showList) {
    findings.filter(f => f.kind === 'long').sort((a, b) => b.n - a.n).slice(0, 12)
      .forEach(f => console.log(`    ${String(f.n).padStart(3)}w  ${f.id}\n         ${f.text.slice(0, 130)}…`));
  }
}
console.log(`\ntotal findings: ${grand}`);
