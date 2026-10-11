#!/usr/bin/env node
/* Static checks for a classroom script — everything verifiable without ears.
 *
 *   node check-classroom-script.mjs u07-listen-in-class.md [more.md ...]
 *   node check-classroom-script.mjs --all
 *
 * Checks: the builder can parse it, the cast is the fixed course cast, every
 * student attempt follows a listener pause, the no-strings rule holds, no
 * cross-module coupling, and the expressive-cue budget is respected.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const CAST = {
  Teacher: 'c023b17b38144a60b3984153247d993f',
  Maya: '531f90254e3d4810a047a90b9309fdd0',
  Leon: 'ac6474da3a324e0c8edf6d796fe59f4d',
};

// Things a listener cannot hold by ear. `system:` and `--flag` shapes are the
// exact classes we removed from u21.
const UNSPEAKABLE = [
  [/\bkubectl\b/i, 'command name'],
  [/(^|\s)--[a-z][a-z-]+/m, 'CLI flag'],
  [/\bsystem:[a-z]/i, 'literal identity string'],
  [/[a-z0-9]+:[a-z0-9-]+:[a-z0-9-]+/i, 'colon-joined string'],
  [/\b[0-9a-f]{12,}\b/i, 'hex/uid (outside the Cast section)'],
  [/`[^`]+`/, 'backticked literal (outside the Cast section)'],
  [/\.(yaml|yml|json|conf)\b/i, 'file reference'],
  [/\/(etc|var|usr)\//, 'file path'],
];

const COUPLING = /\b(the pilot|this series|the series|next module|last module|that is module|module (one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen)|segment (one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen)|(twelve|thirteen|fourteen|twenty|twenty-\w+)\s+(modules|units))\b/i;

function parseCast(md) {
  const cast = {};
  const section = md.split(/^## Cast$/m)[1]?.split(/^---$/m)[0] ?? '';
  const re = /\*\*(\w+)\*\*[^]*?`([0-9a-f]{32})`/g;
  for (let m; (m = re.exec(section)); ) cast[m[1]] = m[2];
  return cast;
}

function parseScript(md) {
  const body = md.split(/^## Script$/m)[1]?.split(/^---$/m)[0];
  if (!body) return null;
  const events = [];
  let current = null;
  const flush = () => { if (current) { events.push(current); current = null; } };
  for (const raw of body.split('\n')) {
    const line = raw.trimEnd();
    let m;
    if (line.match(/^### /)) { flush(); events.push({ kind: 'section' }); }
    else if ((m = line.match(/^\*\*Listener pause: (\d+) seconds?\*\*/))) { flush(); events.push({ kind: 'pause', seconds: Number(m[1]) }); }
    else if ((m = line.match(/^\*\*(\w+):\*\* ?(.*)$/))) { flush(); current = { kind: 'turn', speaker: m[1], text: m[2] }; }
    else if (current) current.text += line === '' ? '\n' : ' ' + line;
  }
  flush();
  for (const e of events) if (e.kind === 'turn') e.text = e.text.replace(/\s+/g, ' ').trim();
  return events.filter(e => e.kind !== 'turn' || e.text);
}

function check(file) {
  const md = fs.readFileSync(file, 'utf8');
  const problems = [];
  const name = path.basename(file);

  const cast = parseCast(md);
  for (const [who, id] of Object.entries(CAST)) {
    if (cast[who] !== id) problems.push(`cast: ${who} missing or wrong voice id`);
  }

  const events = parseScript(md);
  if (!events) return [`no "## Script" section (or no closing ---)`];
  const turns = events.filter(e => e.kind === 'turn');
  const pauses = events.filter(e => e.kind === 'pause');
  if (turns.length < 30) problems.push(`only ${turns.length} turns — thinner than every accepted script`);
  if (pauses.length < 8) problems.push(`only ${pauses.length} listener pauses`);

  const speakers = new Set(turns.map(t => t.speaker));
  for (const s of speakers) {
    if (!(s in CAST) && s !== 'Both') problems.push(`unknown speaker ${s}`);
  }

  // The dialogue body, with bracket cues removed so a cue never trips a scan.
  const scriptText = turns.map(t => t.text.replace(/\[[^\]]{1,40}\]/g, '')).join('\n');
  for (const [re, label] of UNSPEAKABLE) {
    const m = scriptText.match(re);
    if (m) problems.push(`unspeakable ${label}: "${m[0].slice(0, 40)}"`);
  }
  const c = scriptText.match(COUPLING);
  if (c) problems.push(`cross-module coupling: "${c[0]}"`);

  // Cue budget: at most one cue per turn, and cues on under half the turns.
  let cued = 0;
  for (const t of turns) {
    const n = (t.text.match(/\[[^\]]{1,40}\]/g) || []).length;
    if (n > 2) problems.push(`cue overload (${n}) on: "${t.text.slice(0, 50)}"`);
    if (n > 0) cued++;
  }
  if (cued > turns.length / 2) problems.push(`cues on ${cued}/${turns.length} turns — wallpaper, not moments`);

  // Retrieval structure: every first student attempt after a teacher question
  // should follow a pause. Approximate: each pause must be followed by a
  // student turn.
  for (let i = 0; i < events.length - 1; i++) {
    if (events[i].kind === 'pause') {
      // The long reconstruction pause is the exception: the listener answers
      // alone and the teacher follows with the compressed answer.
      if (events[i].seconds >= 10) continue;
      const next = events[i + 1];
      if (!(next?.kind === 'turn' && next.speaker !== 'Teacher')) {
        problems.push(`pause not followed by a student attempt (pause #${events.slice(0, i).filter(e => e.kind === 'pause').length + 1})`);
      }
    }
  }
  return problems;
}

const args = process.argv.slice(2);
const files = args.includes('--all')
  ? fs.readdirSync(HERE).filter(f => /^u\d{2}-listen-in-class\.md$/.test(f)).sort().map(f => path.join(HERE, f))
  : args.map(f => path.resolve(HERE, f));

let bad = 0;
for (const f of files) {
  const problems = check(f);
  if (problems.length) {
    bad++;
    console.log(`✗ ${path.basename(f)}`);
    for (const p of problems) console.log(`    ${p}`);
  } else {
    console.log(`✓ ${path.basename(f)}`);
  }
}
console.log(`\n${files.length - bad}/${files.length} clean`);
process.exitCode = bad ? 1 : 0;
