#!/usr/bin/env node
/* Flag signposting in a script's narration — the narrator announcing what it is
 * about to say instead of saying it. Run before synthesis.
 *
 *   node scripts/lint-narration.mjs script.json
 *   node scripts/lint-narration.mjs modules/u06-scheduling/script.json
 */
import { readFileSync } from 'node:fs';

const PATTERNS = [
  [/\bAnd this is worth being precise about\b/gi, 'just say it'],
  [/\bHere is the (?:part|thing)\b/gi, 'just say it'],
  [/\bHere is what\b/gi, 'just say it'],
  [/\bAnd here is\b/gi, 'just say it'],
  [/\bNow the reason\b/gi, 'just say it'],
  [/\bwhat (?:most )?people miss\b/gi, 'just say it'],
  [/\bthis is where most explanations\b/gi, 'just say it'],
  [/\bNote (?:the|that)\b.{0,30}\bbecause\b/gi, 'state the fact, drop the framing'],
  [/\bit is worth (?:knowing|noting|saying|remembering)\b/gi, 'just say it'],
  [/\bthe thing to (?:hold|remember)\b/gi, 'just say it'],
  [/\bwhich is (?:exactly|precisely) why\b/gi, 'use "so"'],
  [/\b(?:that|this) is not an accident\b/gi, 'cut'],
  [/\bbe careful with\b/gi, 'cut the warning, state the correction'],
  [/\b(?:catches|trips up) people\b/gi, 'cut'],
  [/\bpeople expect\b/gi, 'cut'],
  [/\bas we (?:discussed|saw)\b/gi, 'cut'],
  [/\bin other words\b/gi, 'pick one wording'],
  [/\blet me be clear\b/gi, 'cut'],
  [/\bat the end of the day\b/gi, 'cut'],
  [/\bit(?:'| i)s important to (?:note|understand)\b/gi, 'just say it'],
];

// Narration is spoken, but the house style still applies: short sentences,
// active voice, one idea at a time. A 30-word spoken sentence loses the
// listener even more surely than a written one.
const MAX_SPOKEN_WORDS = 25;
function longSentences(text) {
  return text
    .replace(/<[^>]+>/g, ' ')
    // A sentence may legitimately begin with a camelCase API field —
    // `maxSurge sets how many…`, `spec.nodeName is empty`. Requiring an
    // uppercase start merged those into the previous sentence and reported
    // a false over-length finding.
    // Sentences here legitimately begin lowercase: a camelCase API field
    // (`maxSurge sets…`), a dotted path (`spec.nodeName is empty`), or a
    // tool name (`kubectl cannot diagnose…`). Requiring an uppercase start
    // merged them into the previous sentence and reported phantom run-ons.
    .split(/(?<=[.!?])\s+(?=[A-Z(]|[a-z]+[A-Z]|[a-z]+\.[a-z]|(?:kubectl|kubeadm|etcdctl|etcd|kube-proxy|kubelet|containerd|runc|nftables|iptables|dig|crictl|journalctl|systemctl|resourceVersion|podSelector)\b)/)
    .map(x => x.trim())
    .filter(x => x.split(/\s+/).filter(Boolean).length > MAX_SPOKEN_WORDS);
}

const file = process.argv[2] ?? 'script.json';
const data = JSON.parse(readFileSync(file, 'utf8'));
let hits = 0;
let longs = 0;
let words = 0;

for (const beat of data.beats) {
  const found = [];
  for (const [re, advice] of PATTERNS) {
    for (const m of beat.narration.matchAll(re)) found.push([m[0], advice]);
  }
  words += beat.narration.split(/\s+/).filter(Boolean).length;
  for (const long of longSentences(beat.narration)) {
    found.push([long.slice(0, 60) + '…', `${long.split(/\s+/).length} words — split it`]);
    longs++;
  }
  if (found.length) {
    hits += found.length;
    console.log(`  ${String(beat.n).padStart(2)} ${beat.id}`);
    for (const [text, advice] of found) console.log(`       "${text}" — ${advice}`);
  }
}

const est = words / 180; // canonical narration speed
console.log(`\n  ${data.beats.length} beats · ${words} words · ~${est.toFixed(1)} min at 180 wpm`);
// Length tracks the unit's actual depth — a clean short module beats a padded
// long one. Only flag lengths that suggest something is wrong.
if (est < 3.5) console.log('  ⚠ under 3.5 min — is the unit really this thin, or is a beat missing?');
if (est > 12) console.log('  ⚠ over 12 min — consider splitting into two modules');
const signposts = hits - longs;
if (hits) {
  console.log(`\n  ${signposts} signposting · ${longs} over ${MAX_SPOKEN_WORDS} words — tighten before synthesis`);
  process.exit(1);
}
console.log('  clean: no signposting, no long sentences');
