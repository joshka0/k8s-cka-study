#!/usr/bin/env node
/* Render one still near the end of every beat of the module videos.
 *
 *   node scripts/render-module-stills.mjs                    # every module
 *   node scripts/render-module-stills.mjs u03-reconciliation # just one
 *
 * Frames are derived from the same duration source the composition uses:
 * measured narration when it exists, estSeconds otherwise. Hard-coding them
 * does not survive dubbing — synthesising a module's audio roughly halves its
 * length, and frame numbers computed against estSeconds then point past the
 * end of the composition, where the renderer hangs rather than failing.
 *
 * Renders are sequential on purpose. Five concurrent bundlers exhausted Chrome
 * and wedged a module mid-run.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'out');

/** End-of-beat margin, in frames: far enough in to catch the settled state. */
const MARGIN = 20;

// Root.tsx is the registry of which modules have a composition; a module can
// have a script long before it has components.
const registered = [
  ...fs.readFileSync(path.join(ROOT, 'src/Root.tsx'), 'utf8')
    .matchAll(/id:\s*'(Module\d+)',\s*name:\s*'([^']+)'/g),
].map(([, id, name]) => ({ id, name }));

const wanted = process.argv.slice(2);
const targets = wanted.length
  ? registered.filter((m) => wanted.includes(m.name) || wanted.includes(m.id))
  : registered;

if (!targets.length) {
  console.error(`no registered module matched ${wanted.join(', ')}`);
  console.error(`known: ${registered.map((m) => m.name).join(', ')}`);
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

let rendered = 0;
let failed = 0;

for (const { id, name } of targets) {
  const dir = path.join(ROOT, 'modules', name);
  const script = JSON.parse(fs.readFileSync(path.join(dir, 'script.json'), 'utf8'));
  const durationsPath = path.join(dir, 'durations.json');
  const measured = fs.existsSync(durationsPath)
    ? JSON.parse(fs.readFileSync(durationsPath, 'utf8'))
    : {};
  const fps = script.meta.fps || 30;
  const source = Object.keys(measured).length ? 'audio' : 'estSeconds';

  console.log(`\n${id} (${name}) — timing from ${source}`);

  let acc = 0;
  for (const beat of script.beats) {
    const seconds = typeof measured[beat.id] === 'number' && measured[beat.id] > 0
      ? measured[beat.id]
      : beat.estSeconds;
    acc += Math.round(seconds * fps);
    const frame = Math.max(0, acc - MARGIN);
    const file = path.join(OUT, `${id}-${beat.id}.png`);
    process.stdout.write(`  ${String(frame).padStart(6)}  ${beat.id} … `);
    try {
      execFileSync(
        'npx',
        ['remotion', 'still', 'src/index.ts', id, file, `--frame=${frame}`],
        { cwd: ROOT, stdio: 'pipe' },
      );
      console.log('ok');
      rendered++;
    } catch (e) {
      console.log('FAILED');
      console.error(`         ${String(e.stderr || e.message).trim().split('\n').pop()}`);
      failed++;
    }
  }
}

console.log(`\n${rendered} still(s) rendered, ${failed} failed`);
process.exit(failed ? 1 : 0);
