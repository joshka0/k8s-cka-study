#!/usr/bin/env node
/* Static solvability check for a combination of lab scenarios.
 *
 *   node labs/tools/validate-combo.mjs u06-pending-taint u24-quota-reject …
 *   node labs/tools/validate-combo.mjs --all-pairs      # full compatibility matrix
 *
 * Two faults in one cluster can mask each other: break DNS and every
 * Service-routing fault becomes invisible behind it; break the only
 * schedulable worker and nothing can run at all. Each scenario therefore
 * declares its blast radius in meta.json, and a combination ships only if
 * this validator passes AND the dynamic harness proves it on a real cluster.
 * This file is the cheap first gate: it rejects with a named pair and a named
 * surface, so an invalid combination is a diagnosis, not a mystery.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LABS = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SCENARIOS = path.join(LABS, 'scenarios');

/* The complete surface vocabulary. A meta.json using a surface not listed
 * here is an error: an open vocabulary would let two scenarios name the same
 * thing differently and slip past the conflict check.
 *
 * `node/<role>` and `quota/<ns>`-style entries are validated by prefix.
 */
const SURFACES = new Set([
  'api-server',        // the control plane answers kubectl
  'etcd',              // the store underneath it
  'scheduler',         // placement decisions happen
  'dns',               // cluster DNS resolves
  'cni',               // pod networking programs
  'dataplane',         // service VIP translation works
  'storage-class',     // dynamic provisioning works
  'rbac-cluster',      // cluster-scoped authorization state
  'node/any-schedulable', // at least one worker accepts pods
]);
const PREFIXES = ['node/', 'quota/', 'ns/', 'psa/'];

function validSurface(s) {
  return SURFACES.has(s) || PREFIXES.some((p) => s.startsWith(p) && s.length > p.length);
}

function loadMeta(id) {
  const p = path.join(SCENARIOS, id, 'meta.json');
  if (!existsSync(p)) throw new Error(`no scenario ${id} (missing ${path.relative(LABS, p)})`);
  const m = JSON.parse(readFileSync(p, 'utf8'));
  for (const field of ['id', 'segments', 'owns', 'breaks', 'requiresHealthy']) {
    if (!(field in m)) throw new Error(`${id}: meta.json missing "${field}"`);
  }
  for (const s of [...m.breaks, ...m.requiresHealthy, ...m.owns]) {
    if (!validSurface(s)) throw new Error(`${id}: unknown surface "${s}" — extend the vocabulary deliberately or fix the name`);
  }
  m.chainAfter = m.chainAfter ?? null; // ordered causal chains declare their predecessor
  return m;
}

function conflicts(a, b) {
  const problems = [];
  const overlapOwns = a.owns.filter((s) => b.owns.includes(s));
  if (overlapOwns.length) problems.push(`both own ${overlapOwns.join(', ')}`);

  // A's damage hides B's symptom (and vice versa) unless B is chained after A.
  for (const [x, y] of [[a, b], [b, a]]) {
    if (y.chainAfter === x.id) continue;      // declared chain: masking is the design
    const masked = x.breaks.filter((s) => y.requiresHealthy.includes(s));
    if (masked.length) problems.push(`${x.id} breaks ${masked.join(', ')} which ${y.id} needs healthy`);
  }
  return problems;
}

function checkCombo(metas) {
  const problems = [];

  for (let i = 0; i < metas.length; i++)
    for (let j = i + 1; j < metas.length; j++)
      for (const p of conflicts(metas[i], metas[j]))
        problems.push(`  ✕ ${metas[i].id} + ${metas[j].id}: ${p}`);

  // Cluster-wide invariants: someone must be able to run pods, and kubectl
  // must work, across the union of all faults at once.
  const broken = new Set(metas.flatMap((m) => m.breaks));
  if (broken.has('api-server') && metas.length > 1)
    problems.push('  ✕ a combination that breaks the api-server blinds every other grader — run it solo');
  if (broken.has('node/any-schedulable'))
    problems.push('  ✕ no schedulable node survives — nothing in the combo can be fixed');

  // Chains must reference members of the combo.
  const ids = new Set(metas.map((m) => m.id));
  for (const m of metas)
    if (m.chainAfter && !ids.has(m.chainAfter))
      problems.push(`  ✕ ${m.id} chains after ${m.chainAfter}, which is not in this combination`);

  return problems;
}

const args = process.argv.slice(2);
if (args[0] === '--all-pairs') {
  const all = readdirSync(SCENARIOS).filter((d) => existsSync(path.join(SCENARIOS, d, 'meta.json')));
  let bad = 0;
  for (let i = 0; i < all.length; i++)
    for (let j = i + 1; j < all.length; j++) {
      const ps = conflicts(loadMeta(all[i]), loadMeta(all[j]));
      if (ps.length) { bad++; console.log(`✕ ${all[i]} + ${all[j]}\n${ps.map((p) => '    ' + p).join('\n')}`); }
    }
  console.log(`\n${all.length} scenario(s), ${bad} conflicting pair(s)`);
  process.exit(0);
}

if (!args.length) {
  console.error('usage: validate-combo.mjs <scenario-id>… | --all-pairs');
  process.exit(2);
}

const metas = args.map(loadMeta);
const problems = checkCombo(metas);
if (problems.length) {
  console.log(`INVALID combination (${args.join(' + ')}):`);
  problems.forEach((p) => console.log(p));
  process.exit(1);
}
console.log(`ok: ${args.join(' + ')} is statically solvable`);
console.log('(static only — ship it through the dynamic harness before publishing)');
