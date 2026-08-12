#!/usr/bin/env node
/* Generate modules.html — the video-module section of the site.
 *
 *   node tools/build-modules-page.mjs
 *
 * The module scripts are the source of truth. This page is derived from them,
 * never hand-edited, so it cannot drift from what the videos actually say. A
 * module appears here as soon as it has a script; the video link only appears
 * once a rendered file exists.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MODULES = path.join(ROOT, 'video/modules');
const VIDEO_OUT = path.join(ROOT, 'video/out');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Measured narration wins, exactly as the composition resolves it. */
function moduleSeconds(dir, script) {
  const p = path.join(dir, 'durations.json');
  const measured = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
  return script.beats.reduce((acc, b) => {
    const m = measured[b.id];
    return acc + (typeof m === 'number' && m > 0 ? m : b.estSeconds);
  }, 0);
}

const mmss = (secs) => {
  const t = Math.round(secs);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

// A clean checkout has no rendered video at all. Reading the directory
// unconditionally crashed instead of producing the script-only state the
// no-video branch below already handles. Read it once, tolerantly.
const VIDEO_FILES = existsSync(VIDEO_OUT) ? readdirSync(VIDEO_OUT) : [];

const entries = readdirSync(MODULES)
  .filter((d) => existsSync(path.join(MODULES, d, 'script.json')))
  .map((d) => {
    const dir = path.join(MODULES, d);
    const script = JSON.parse(readFileSync(path.join(dir, 'script.json'), 'utf8'));
    const n = script.series.module;
    const prefix = `Module${String(n).padStart(2, '0')}`;
    // Only an exact module export is a full lesson. Beat proofs and legacy
    // excerpts also start with ModuleNN-, so treating any prefix match as a
    // module video silently links a two-minute page entry to a short clip.
    const mp4 = VIDEO_FILES
    .find((f) => f === `${prefix}.mp4`);
    return {
      n,
      dir: d,
      script,
      seconds: moduleSeconds(dir, script),
      dubbed: existsSync(path.join(dir, 'narration')),
      video: mp4 ? `video/out/${mp4}` : null,
    };
  })
  .sort((a, b) => a.n - b.n);

const cards = entries.map((e) => {
  const s = e.script;
  const num = String(e.n).padStart(2, '0');
  const beats = s.beats
    .filter((b) => b.lane !== null)          // drop the locate/close spine beats
    .map((b) => `<li>${esc(b.title)}</li>`)
    .join('\n          ');
  // Link into the learn path's own module section rather than the bare file, so
  // watching counts toward progress. The raw file stays available beside it.
  const status = e.video
    ? `<a class="watch" href="index.html#m/${e.script.series.unit}">Watch · ${mmss(e.seconds)}</a>`
      + ` <a class="file" href="${e.video}" download>file</a>`
    : `<span class="pending">Not yet rendered${e.dubbed ? '' : ' · estimate ' + mmss(e.seconds)}</span>`;
  return `
      <article class="module" id="module-${num}">
        <header>
          <span class="num">${num}</span>
          <div>
            <h3>${esc(s.title)}</h3>
            <p class="sub">${esc(s.subtitle)}</p>
          </div>
          ${status}
        </header>
        <p class="spine">Spine segment: <code>${esc(s.series.spineSegment)}</code> · unit ${esc(s.series.unit)}</p>
        <ul class="beats">
          ${beats}
        </ul>
      </article>`;
}).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${entries.length} narrated video modules on Kubernetes architecture, one per course unit — each going deeper on one segment of the request path.">
  <title>Video Modules — Kubernetes Beyond YAML</title>
  <script>
    // Same path-agnostic guard as index.html: assets are referenced relatively,
    // so the page must sit at a path ending in "/" or a real .html.
    (function () {
      var p = location.pathname;
      if (p && !/\\/$/.test(p) && !/\\.html?$/i.test(p)) {
        location.replace(p + '/' + location.search + location.hash);
      }
    })();
  </script>
  <link rel="icon" href="assets/favicon.svg">
  <meta name="theme-color" content="#172554">
  <link rel="stylesheet" href="assets/learn.css">
  <style>
    .wrap { max-width: 980px; margin: 0 auto; padding: 28px 20px 80px; }
    .lede { color: var(--muted, #94a3b8); max-width: 62ch; line-height: 1.6; }
    .module { border: 1px solid #1e293b; border-radius: 14px; padding: 18px 20px;
              margin: 18px 0; background: #0f172a; }
    .module header { display: flex; gap: 16px; align-items: flex-start; }
    .module .num { font: 700 13px/1 ui-monospace, monospace; color: #38bdf8;
                   border: 1px solid #1e40af; border-radius: 8px; padding: 8px 10px; }
    .module h3 { margin: 0 0 4px; font-size: 19px; }
    .module .sub { margin: 0; color: #94a3b8; font-size: 14px; }
    .module .spine { margin: 12px 0 8px; font-size: 13px; color: #64748b; }
    .module .beats { margin: 0; padding-left: 20px; columns: 2; column-gap: 28px; }
    .module .beats li { font-size: 14px; margin: 3px 0; break-inside: avoid; }
    .watch { margin-left: auto; white-space: nowrap; background: #1d4ed8; color: #fff;
             text-decoration: none; padding: 8px 14px; border-radius: 8px; font-size: 14px; }
    .file { color: #64748b; text-decoration: none; font-size: 13px; margin-left: 10px; }
    .file:hover { color: #94a3b8; text-decoration: underline; }
    .pending { margin-left: auto; white-space: nowrap; color: #64748b; font-size: 13px; }
    @media (max-width: 720px) {
      .module .beats { columns: 1; }
      .module header { flex-wrap: wrap; }
      .watch, .pending { margin-left: 0; }
    }
  </style>
</head>
<body>
<header class="topbar">
  <a class="mark" href="index.html">Kubernetes Beyond YAML</a>
</header>
<main class="wrap">
  <h1>Video modules</h1>
  <p class="lede">
    ${entries.length} narrated modules, one per course unit. The pilot walks the whole
    request path end to end; each module then goes deeper on a single segment
    of it. They assume you have watched the pilot, and they teach only what
    their unit teaches.
  </p>
${cards.trimStart()}
</main>
</body>
</html>
`;

writeFileSync(path.join(ROOT, 'modules.html'), html);
const rendered = entries.filter((e) => e.video).length;
console.log(`  modules.html written — ${entries.length} modules, ${rendered} with video`);
for (const e of entries) {
  console.log(`    ${String(e.n).padStart(2, '0')}  ${mmss(e.seconds).padStart(5)}  ${e.video ? 'video' : 'script only'}  ${e.script.title}`);
}
