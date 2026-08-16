#!/usr/bin/env node
/* Generate assets/exam-content.js — the exam-question bank the docs-navigation
 * drills use.
 *
 *   node tools/build-exam-asset.mjs
 *
 * The transcripts/killer-sh/EXAM-DOCS-*.md files are the source of truth.
 * This file is derived, never hand-edited. Add a new reworked EXAM-DRAFT file
 * to SOURCE_FILES below and rerun to fold it in.
 *
 * The parser hard-fails (no output written) on any malformed question: a
 * missing field, an unparsable header, zero verify items, or a question
 * count that disagrees with the source file's own index table. That table
 * is the author's declaration of intent — if the count drifts, the file was
 * edited without updating the header, and the run stops rather than ship a
 * silently short question bank.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/* Fixed list of source files, in the order their questions should appear.
 * Add reworked EXAM-DRAFT-*.md files here as they land. */
const SOURCE_FILES = [
  'transcripts/killer-sh/EXAM-DOCS-u1-u14.md',
  'transcripts/killer-sh/EXAM-DOCS-u15-u27.md',
  'transcripts/killer-sh/EXAM-DRAFT-00-12.md',
  'transcripts/killer-sh/EXAM-DRAFT-13-25.md',
];

const FIELD_NAMES = [
  'topic',
  'context',
  'task',
  'constraints',
  'verify',
  'expected path',
  'trap',
  'docs-path',
  'docs',
];

/* The walkthrough-derived EXAM-DRAFT files predate these two fields. */
const OPTIONAL_FIELDS = ['topic', 'docs-path'];

class BuildError extends Error {}

function fail(file, question, message) {
  throw new BuildError(`${file} ${question ? `${question}: ` : ''}${message}`);
}

/** Collapse hanging-indent word-wrap into one flowed paragraph. */
function flow(lines) {
  return lines
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split a flowed blob of sentences on ". " boundaries, keeping the period.
 * A period stays mid-sentence when the next character is lowercase (decimal
 * numbers, version strings, `0.1`-style values) — only a following capital
 * letter, backtick, or end of text closes a sentence. */
function splitSentences(text) {
  if (!text) return [];
  const out = [];
  const re = /.*?\.(?=\s+[A-Z`]|\s*$)/g;
  let m;
  let consumed = 0;
  while ((m = re.exec(text))) {
    out.push(m[0].trim());
    consumed = re.lastIndex;
  }
  const rest = text.slice(consumed).trim();
  if (rest) out.push(rest);
  return out.filter((s) => s.length > 0);
}

/** Parse the `verify:` field into { items, notes }. */
function parseVerify(field) {
  const items = [];
  let notesBuf = [];
  const notes = [];

  const flushNotes = () => {
    if (notesBuf.length) {
      notes.push(...splitSentences(flow(notesBuf)));
      notesBuf = [];
    }
  };

  let current = null; // { points, textLines }
  const flushItem = () => {
    if (current) {
      items.push({ points: current.points, text: flow(current.textLines) });
      current = null;
    }
  };

  for (const { indent, text } of field.rawLines) {
    if (text === '') continue;
    const isBaseline = indent <= field.baseline;
    // Two scored-item formats: `- (N) ...` (EXAM-DOCS) and `N pt(s): ...`
    // (EXAM-DRAFT).
    const bulletMatch =
      isBaseline &&
      (/^-\s*\((\d+)(?:\s+total)?\)\s*/.exec(text) || /^(\d+)\s*pts?:\s*/.exec(text));
    if (bulletMatch) {
      flushItem();
      flushNotes();
      current = {
        points: Number(bulletMatch[1]),
        textLines: [text.slice(bulletMatch[0].length)],
      };
    } else if (isBaseline) {
      // A plain sentence at the item baseline: not a continuation of the
      // current item — it is a gate/scope note running alongside verify.
      flushItem();
      notesBuf.push(text);
    } else if (current) {
      current.textLines.push(text);
    } else {
      notesBuf.push(text);
    }
  }
  flushItem();
  flushNotes();
  return { items, notes };
}

/** Parse the `constraints:` field into a string[], one entry per `- ` bullet,
 * folding its `Checkable:` (or any other) continuation lines back in. */
function parseBullets(field) {
  const out = [];
  let current = null;
  for (const { text } of field.rawLines) {
    if (text === '') continue;
    if (/^-\s+/.test(text)) {
      if (current) out.push(flow(current));
      current = [text.replace(/^-\s+/, '')];
    } else if (current) {
      current.push(text);
    } else {
      current = [text];
    }
  }
  if (current) out.push(flow(current));
  return out;
}

/** Parse the `expected path:` field into a string[], one entry per `- `
 * move, with its `Left:`/`Right:` outcome lines kept inside the entry. */
function parseExpectedPath(field) {
  const out = [];
  let intro = null;
  let subLines = [];

  const flushEntry = () => {
    if (intro === null) return;
    const entry = subLines.length ? `${flow(intro)}\n${subLines.join('\n')}` : flow(intro);
    out.push(entry);
    intro = null;
    subLines = [];
  };

  for (const { text } of field.rawLines) {
    if (text === '') continue;
    if (/^-\s+/.test(text)) {
      flushEntry();
      intro = [text.replace(/^-\s+/, '')];
    } else if (/^(Left|Right):/.test(text)) {
      subLines.push(text);
    } else if (subLines.length) {
      subLines[subLines.length - 1] += ` ${text}`;
    } else if (intro) {
      intro.push(text);
    } else {
      intro = [text];
    }
  }
  flushEntry();
  return out;
}

/** Parse the `docs:` field into a string[] of URLs, one per line. */
function parseDocs(field) {
  return field.rawLines.map((l) => l.text).filter((t) => t.length > 0);
}

/** Parse the `docs-path:` field: short labeled sub-lines, kept as written —
 * they are not word-wrapped prose, so each source line stays its own line. */
function parseDocsPath(field) {
  return field.rawLines
    .map((l) => l.text)
    .filter((t) => t.length > 0)
    .join('\n');
}

/** Split one question block's body lines into its labeled fields. */
function splitFields(bodyLines, file, qid) {
  const labelRe = new RegExp(`^(${FIELD_NAMES.map((f) => f.replace(/[-]/g, '\\-')).join('|')}):(.*)$`);
  const fields = new Map();
  let currentName = null;
  let currentLines = null; // [{ indent, text }]
  let baseline = 0;

  const flush = () => {
    if (currentName) fields.set(currentName, { baseline, rawLines: currentLines });
  };

  for (const rawLine of bodyLines) {
    if (rawLine.trim() === '' || rawLine.trim() === '---') continue; // separators carry no content
    const m = labelRe.exec(rawLine);
    if (m) {
      flush();
      currentName = m[1];
      const leadingSpaces = m[2].match(/^\s*/)[0].length;
      baseline = m[1].length + 1 + leadingSpaces; // label + ":" + padding
      currentLines = [{ indent: baseline, text: m[2].trim() }];
    } else {
      if (!currentName) fail(file, qid, `content before the first field label: ${JSON.stringify(rawLine)}`);
      const indent = rawLine.length - rawLine.trimStart().length;
      currentLines.push({ indent, text: rawLine.trim() });
    }
  }
  flush();

  for (const name of FIELD_NAMES) {
    if (OPTIONAL_FIELDS.includes(name)) continue;
    if (!fields.has(name)) fail(file, qid, `missing field \`${name}:\``);
  }
  return fields;
}

function parseQuestion(block, file, source) {
  const lines = block.split('\n');
  const header = lines[0];
  const headerMatch =
    /^## (Q\d+) — (.+?)\s*·\s*(\d+) points\s*·\s*~(\d+) min\s*·\s*unit (u\d+)(?:\s*·\s*(\S.*?))?\s*$/.exec(
      header,
    );
  if (!headerMatch) fail(file, null, `unparsable header: ${JSON.stringify(header)}`);
  const [, qnum, title, pointsStr, minutesStr, unit, tier] = headerMatch;

  const fields = splitFields(lines.slice(1), file, qnum);

  const constraints = parseBullets(fields.get('constraints'));
  const verify = parseVerify(fields.get('verify'));
  if (verify.items.length === 0) fail(file, qnum, 'verify has zero items');

  const expectedPath = parseExpectedPath(fields.get('expected path'));
  const docs = parseDocs(fields.get('docs'));
  if (docs.length === 0) fail(file, qnum, 'docs has zero URLs');

  const fileSlug = path.basename(file, '.md').toLowerCase();

  return {
    id: `${fileSlug}-${qnum.toLowerCase()}`,
    title,
    points: Number(pointsStr),
    minutes: Number(minutesStr),
    unit,
    tier: tier ?? null,
    topic: fields.has('topic') ? flow(fields.get('topic').rawLines.map((l) => l.text)) : null,
    context: flow(fields.get('context').rawLines.map((l) => l.text)),
    task: flow(fields.get('task').rawLines.map((l) => l.text)),
    constraints,
    verify,
    docsPath: fields.has('docs-path') ? parseDocsPath(fields.get('docs-path')) : null,
    expectedPath,
    trap: flow(fields.get('trap').rawLines.map((l) => l.text)),
    docs,
    source,
  };
}

/** The index table at the top of the file declares how many questions it
 * holds. Count its `| QNN |` rows so a drifted table (or a drifted file)
 * fails loudly instead of shipping a silently short question bank. */
function expectedCount(text) {
  const rows = text.match(/^\|\s*Q\d+\s*\|/gm);
  if (rows) return rows.length;
  // EXAM-DRAFT-13-25 declares its count in prose instead of a table.
  const prose = /(\d+) questions\s*·/.exec(text);
  return prose ? Number(prose[1]) : 0;
}

function parseFile(relPath) {
  const full = path.join(ROOT, relPath);
  const text = readFileSync(full, 'utf8');
  const want = expectedCount(text);
  if (want === 0) fail(relPath, null, 'no rows found in the index table');

  const headerRe = /^## Q\d+ /gm;
  const starts = [];
  let m;
  while ((m = headerRe.exec(text))) starts.push(m.index);
  if (starts.length === 0) fail(relPath, null, 'no `## QNN` question headers found');

  const blocks = starts.map((start, i) => {
    const end = i + 1 < starts.length ? starts[i + 1] : text.length;
    return text.slice(start, end);
  });

  if (blocks.length !== want) {
    fail(
      relPath,
      null,
      `index table declares ${want} question(s), but ${blocks.length} \`## QNN\` header(s) were found`,
    );
  }

  const source = path.basename(relPath);
  return blocks.map((block) => parseQuestion(block, relPath, source));
}

function main() {
  const questions = [];
  for (const relPath of SOURCE_FILES) {
    questions.push(...parseFile(relPath));
  }

  const ids = new Set();
  for (const q of questions) {
    if (ids.has(q.id)) fail(q.source, q.id, 'duplicate question id');
    ids.add(q.id);
  }

  const banner = `/* AUTO-GENERATED by tools/build-exam-asset.mjs — do not edit.
 * Exam-question bank parsed from transcripts/killer-sh/EXAM-DOCS-*.md.
 * Regenerate after editing a source file: node tools/build-exam-asset.mjs
 */\n`;

  writeFileSync(
    path.join(ROOT, 'assets/exam-content.js'),
    banner + 'window.EXAM_QUESTIONS = ' + JSON.stringify(questions, null, 2) + ';\n',
  );

  console.log(`  assets/exam-content.js written — ${questions.length} question(s)`);
  for (const q of questions) {
    const vpts = q.verify.items.reduce((a, i) => a + (i.points ?? 0), 0);
    const mark = vpts === q.points ? '' : `  (verify sum ${vpts} != header ${q.points})`;
    console.log(`    ${q.id.padEnd(24)} ${q.unit.padEnd(4)} ${String(q.points).padStart(2)}pt${mark}`);
  }
}

try {
  main();
} catch (err) {
  if (err instanceof BuildError) {
    console.error(`build-exam-asset: ${err.message}`);
    process.exit(1);
  }
  throw err;
}
