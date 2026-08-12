#!/usr/bin/env node
/* The gate every scenario and every combination must pass before it ships.
 *
 *   node labs/tools/harness.mjs u06-pending-taint            # one scenario
 *   node labs/tools/harness.mjs u06-pending-taint u24-quota-reject   # a combo
 *   node labs/tools/harness.mjs --all
 *
 * A scenario is a claim; this is the evidence. It proves, against a real
 * cluster:
 *
 *   1. SYMPTOM     the broken state grades 0 — otherwise a candidate who does
 *                  nothing collects points. The very first scenario written
 *                  here scored 3 of 6 untouched, because its "do not change
 *                  the replica count" criteria were satisfied at setup.
 *   2. SOLVABLE    the canonical solution reaches full credit — otherwise the
 *                  task is unsolvable and the fault is ours, not the
 *                  candidate's.
 *   3. INDEPENDENT (combinations only) solving A leaves B still failing, so
 *                  no fault masks another's symptom and no grader passes for
 *                  work the candidate did not do.
 *   4. ORDER       (combinations only) the reverse solve order also reaches
 *                  full credit, catching undeclared sequencing.
 *
 * Declared chains (meta.chainAfter) invert check 3 deliberately: the later
 * link is *expected* to be unobservable until its predecessor is solved.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const LABS = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SCENARIOS = path.join(LABS, 'scenarios');

const CTX = { systems: 'kiac-cka-systems', netpol: 'kiac-cka-netpol' };
const ctxOverride = process.env.LAB_CONTEXT || null;

function meta(id) {
  return JSON.parse(readFileSync(path.join(SCENARIOS, id, 'meta.json'), 'utf8'));
}

async function sh(id, script, ctx) {
  const file = path.join(SCENARIOS, id, script);
  if (!existsSync(file)) throw new Error(`${id}: missing ${script}`);
  const { stdout } = await exec('bash', [file], {
    env: { ...process.env, KUBECTL_CONTEXT: ctx },
    maxBuffer: 1 << 24,
  });
  return stdout.trim();
}

async function useContext(ctx) {
  await exec('kubectl', ['config', 'use-context', ctx]);
}

async function grade(id, ctx) {
  const out = await sh(id, 'grade.sh', ctx);
  const n = parseInt(out.split('\n').pop().trim(), 10);
  if (Number.isNaN(n)) throw new Error(`${id}: grade.sh printed non-integer: ${out.slice(0, 80)}`);
  return n;
}

/* Settling time. A grader that reads immediately after an action sees the
 * state before the controllers acted, which produces flaky scores that look
 * like grader bugs. Scenarios that need longer declare `settleSeconds`. */
const settle = (m) => new Promise((r) => setTimeout(r, (m.settleSeconds ?? 8) * 1000));

async function run(ids) {
  const metas = ids.map(meta);
  const tier = metas[0].cluster;
  if (metas.some((m) => m.cluster !== tier))
    throw new Error(`mixed cluster tiers in one combination: ${metas.map((m) => `${m.id}=${m.cluster}`).join(', ')}`);
  const ctx = ctxOverride || CTX[tier];
  await useContext(ctx);

  const max = Object.fromEntries(metas.map((m) => [m.id, m.points]));
  const fails = [];
  const say = (ok, text) => { console.log(`  ${ok ? '✓' : '✗'} ${text}`); if (!ok) fails.push(text); };

  console.log(`\n▸ ${ids.join(' + ')}  [${tier} · ${ctx}]`);

  // ---- 1. SYMPTOM ------------------------------------------------------
  for (const m of metas) await sh(m.id, 'setup.sh', ctx);
  await settle(metas[0]);
  for (const m of metas) {
    const s = await grade(m.id, ctx);
    const chained = m.chainAfter !== null;
    say(s === 0, `symptom present: ${m.id} grades ${s}/${max[m.id]} broken${chained ? ' (chained)' : ''}`);
  }

  // ---- 2/3. SOLVE IN ORDER, CHECKING INDEPENDENCE -----------------------
  const order = [...metas].sort((a, b) => (a.chainAfter ? 1 : 0) - (b.chainAfter ? 1 : 0));
  for (const m of order) {
    await sh(m.id, 'solution.sh', ctx);
    await settle(m);
    const s = await grade(m.id, ctx);
    say(s === max[m.id], `solvable: ${m.id} grades ${s}/${max[m.id]} after its canonical solution`);

    for (const other of metas) {
      if (other.id === m.id) continue;
      const solvedAlready = order.indexOf(other) < order.indexOf(m);
      const os = await grade(other.id, ctx);
      if (solvedAlready) {
        say(os === max[other.id], `no regression: ${other.id} still ${os}/${max[other.id]} after solving ${m.id}`);
      } else if (other.chainAfter === m.id) {
        // The chain's whole point: this link only becomes observable now.
        say(true, `chain link ${other.id} unblocked by ${m.id} (grades ${os})`);
      } else {
        say(os === 0, `independent: ${other.id} still ${os}/${max[other.id]} — solving ${m.id} did not solve it`);
      }
    }
  }

  // ---- 4. ORDER ROBUSTNESS ---------------------------------------------
  if (metas.length > 1 && !metas.some((m) => m.chainAfter)) {
    for (const m of metas) await sh(m.id, 'setup.sh', ctx);
    await settle(metas[0]);
    for (const m of [...order].reverse()) { await sh(m.id, 'solution.sh', ctx); await settle(m); }
    let total = 0, want = 0;
    for (const m of metas) { total += await grade(m.id, ctx); want += max[m.id]; }
    say(total === want, `order robust: reverse solve order scores ${total}/${want}`);
  }

  return fails;
}

const args = process.argv.slice(2);
const targets = args[0] === '--all'
  ? readdirSync(SCENARIOS).filter((d) => existsSync(path.join(SCENARIOS, d, 'meta.json'))).map((d) => [d])
  : [args];

if (!targets.length || !targets[0].length) {
  console.error('usage: harness.mjs <scenario-id>… | --all');
  process.exit(2);
}

let failed = 0;
for (const t of targets) {
  try {
    const fails = await run(t);
    if (fails.length) failed++;
  } catch (e) {
    console.log(`  ✗ ${t.join(' + ')}: ${e.message}`);
    failed++;
  }
}
console.log(`\n${targets.length - failed}/${targets.length} passed`);
process.exit(failed ? 1 : 0);
