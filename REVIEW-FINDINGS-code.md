[assets/learn.js] flush()/adopt() at 91-125 and video ended handler at 405-412 · CRITICAL (bug)
  problem: A stale sync response can erase a video completion. If a PUT is in flight when `ended` adds `@video<unit>` and 20 XP, `save()` only marks the sync as pending. The older response then calls `adopt()` and replaces `S.xp` and `S.done` with state that does not contain that completion. The pending PUT sends the replaced state, so the tick and XP are lost.
  fix:     Increment a local mutation revision on every save. Capture it with each request. Do not adopt a response when the local revision changed after that request began. Send the pending state first, then adopt the response to that newer request. Use an explicit merge for monotonic `done` data if the server contract requires it.

[assets/learn.js] video ended handler at 405-412 · HIGH (bug)
  problem: The `S.done` check gives exactly-once behavior only inside one current JavaScript state. Two tabs or devices can both start with no `@video<unit>`, both add 20 XP, and both save. The client sends an absolute XP total and no idempotency key. I did not review the server merge code, so the final result depends on that merge: it can retain both awards, collapse a valid concurrent award, or choose one stale total. The client cannot guarantee exactly-once completion across devices.
  fix:     Send an idempotent `complete-video` operation keyed by the unit and learner. Let the authority add XP only on the first transition from incomplete to complete. Return the canonical state after that operation.

[video/scripts/dub.mjs] synth() error handling at 96-100 and catch at 155-158 · HIGH (bug)
  problem: I found no direct log or file write of the API key. However, the no-log guarantee is not complete because the script copies up to 300 characters of an untrusted upstream response into an exception and prints it. Fish Audio does not normally echo the Authorization header. If Fish Audio, a proxy, or a debug error page ever echoes it, this path prints the key.
  fix:     Do not print the raw response body. Print the status and a small allowlist of parsed, documented error fields. Apply a final redaction for the resolved key before any exception text reaches stderr.

[video/src/Beat.tsx] VisualStage at 14-31 · HIGH (bug)
  problem: `AbsoluteFill` supplies `width: 100%`. This component overrides the height but not the width. The combination of `left: 76`, `right: 76`, and `width: 100%` is over-constrained, so the right inset is ignored in left-to-right layout. The stage starts 76 pixels to the right, remains a full frame wide, and ends 76 pixels outside the frame. Visuals are off-centre and their right edge can be clipped.
  fix:     Read both frame dimensions. Set `width` to `frameWidth - VISUAL_LEFT - VISUAL_RIGHT` and keep the explicit height, or use a plain absolutely positioned element with explicit width and height.

[video/src/visuals/FourBoundaries.tsx] failX at 95-98 and party B at 164-181 · HIGH (bug)
  problem: `failX` equals `bStart + BRIDGE_W + GAP`, which is also the left edge of party B. The failure card is rendered later and covers party B. Every row hides the second party instead of showing a boundary between two named parties.
  fix:     Set `failX` after party B: `bStart + BRIDGE_W + GAP + B_W + GAP`. Derive `logX` and the settle-ring width from the same sequence of widths.

[video/src/visuals/TwoCycles.tsx] TRACK_W/stageLeft()/StageRow at 16-35 and 175-208 · HIGH (bug)
  problem: The coordinate model counts six stage boxes and five gaps. The rendered row also inserts five arrow elements, and Flexbox applies a gap on both sides of each arrow. The rendered stage centres therefore do not match `stageCenter()`. The row is wider than `TRACK_W`, tokens drift farther from each stage on every column, and the top row can leave the frame.
  fix:     Use one shared grid definition for boxes, arrows, and gaps. Derive token centres and the track width from those grid columns. Do not maintain a second geometry formula that omits rendered elements.

[video/src/visuals/TwoCycles.tsx] Pod A timelines at 71-107 and 125-163 · HIGH (bug)
  problem: The volume-attach note claims that Pod A stalls at pre-bind, but the note is placed at `stageLeft(2)`, which is post-bind, while the token continues moving toward a non-existent fourth bottom stage. Also, `aTopX` remains non-null after the transfer, so Pod A stays on the scheduling row while the same Pod moves on the binding row.
  fix:     Hold the bottom token at `stageCenter(0)` for the pre-bind wait and give the hold an explicit interval with no movement. Hide the top token after the transfer. Stop the bottom path at the last real stage before it exits the track.

[deck/build_lessons_deck.py] load_units() at 166-199 · HIGH (bug)
  problem: Legal course input can silently produce the wrong unit map. A new tail content file that uses double-quoted JavaScript strings is invisible to both regexes, so the contiguity check stops at the old highest parsed unit and the build succeeds without the new units or lessons. A repeated unit id also overwrites the earlier dict entry, and `{id: 'u2', n: 3}` passes because the code never checks that `n` matches the numeric part of the id or is unique.
  fix:     Load a data artifact instead of parsing JavaScript with regex. Validate every source entry before building the dict. Reject duplicate unit ids, duplicate unit numbers, and any id/number mismatch. Check contiguity against the full validated entry list.

[video/scripts/dub.mjs] module and suffix path construction at 108-116 and 134-152 · HIGH (bug)
  problem: `--module` and `--suffix` are raw path components. A bare `--module` silently selects the pilot instead of failing. `..` segments can leave `video/modules`, and a suffix with path separators can make the MP3 path leave the narration directory. With `--force`, a bad invocation can overwrite an unintended MP3 file.
  fix:     Require a value for each value-bearing option. Accept only a direct child module name from the module registry. Reject separators and `..` in module names and suffixes. Resolve each path and verify that it remains inside its declared root before reading or writing.

[assets/learn.js] module route state at 281-285, 386-437, 455-491, and 865-866 · MEDIUM (bug)
  problem: The URL, `viewingModule`, and the rendered view can disagree. Starting a lesson from a module clears `viewingModule` but leaves `#m/<unit>` in the URL. Starting Review from a module clears neither. A reload then opens the old module, and the stale flag suppresses the path refresh after a later sync. Module navigation also uses `replaceState` and has no `popstate` or `hashchange` handler, so browser Back leaves the course instead of returning to the path and fragment history changes do not render their route.
  fix:     Put all view transitions through one router that updates the rendered view, `session`, `viewingModule`, and the URL together. Push history for user navigation, reserve replacement for boot normalization, and render the current route on `popstate` or `hashchange`.

[tools/build-modules-asset.mjs; tools/build-modules-page.mjs] video output scans at 38 and 47 · MEDIUM (bug)
  problem: Both generators call `readdirSync(video/out)` without first checking that the directory exists. A clean checkout, or a project with scripts but no rendered video yet, crashes instead of producing an empty video asset and script-only module cards. The intended no-video branches only work after some other process creates the directory.
  fix:     Read the output directory only when it exists. Otherwise use an empty file set. Read it once before the module loop.

[deck/build_lessons_deck.py] validate() type flow at 250-314 · MEDIUM (bug)
  problem: The validator records a bad type and then continues to use the bad value. For example, a list in `front` reaches `strip_markup()` and raises `TypeError`; a list in `unit` reaches set membership and raises an unhashable-type error. Malformed input gets a traceback instead of the collected validation report.
  fix:     Validate and narrow all field types before semantic checks. Skip semantic checks for a card after a required field has the wrong type. Keep collecting errors for later cards.

[video/scripts/render-module-stills.mjs] wanted/targets at 35-44 · MEDIUM (bug)
  problem: The script fails only when none of the requested selectors match. If one selector is valid and another is misspelled or no longer registered, it renders the valid subset and exits successfully. A caller can believe that every requested module was checked when one was silently omitted.
  fix:     Resolve each requested selector independently. Report every unmatched selector and exit before rendering unless all requested selectors resolve exactly once.

[video/src/visuals/Endpoints.tsx] PilotEndpoints empty case at 100-117 · MEDIUM (bug)
  problem: The pilot still says `no ready backends` means `EndpointSlice empty (0 rows)`. The same file correctly states that label matching controls membership and that an unready address stays in the slice with `ready:false`. A Service with matching but unready Pods therefore makes this visual false.
  fix:     Keep the matching rows in the EndpointSlice and mark them `ready:false`. Show zero eligible traffic endpoints as a separate data-plane state.

[video/src/visuals/Endpoints.tsx] pod-c readiness label at 183-234 · MEDIUM (bug)
  problem: The green `readiness flips` label appears when `flip > 0.3`, but the Pod card and EndpointSlice row remain `ready:false` until `flip > 0.5`. The screen contradicts itself during that interval despite the comment that all three views use one threshold.
  fix:     Derive one `podCReady` boolean once and use it for the card, row, annotation, and traffic state.

[assets/learn.css; index.html] topbar at learn.css 59-80 and index.html 28-41 · MEDIUM (bug)
  problem: The added Videos link makes the fixed-width topbar controls wider than common phone viewports. The bar does not wrap, scroll, or hide secondary labels. Even with the review button hidden, the mark, Videos, streak, XP, sync, sound, gaps, and padding exceed about 390 pixels. When Review is visible, the overflow is larger.
  fix:     Add a mobile topbar layout. Collapse secondary text and nonessential labels at defined breakpoints, or use two rows while keeping every control reachable.

[assets/learn.js; index.html; tools/build-modules-page.mjs] hard-coded module count at learn.js 300-301, index.html 37, and build-modules-page.mjs 95 and 141-145 · MEDIUM (bug)
  problem: The generated module asset currently has 27 complete entries, but the path copy, Videos tooltip, generated meta description, and page lede all say there are twelve modules. Routine module additions leave user-visible claims stale.
  fix:     Use neutral copy in the hand-written HTML. In generated output, interpolate `entries.length`. In the lesson path, derive the available count from `MODULE_VIDEOS` and keep the separate review claim explicit if only some scripts had that review.

[video/src/visuals/TheAlgorithm.tsx] twenty-unit closing copy at 8-13 and 93-109 · MEDIUM (bug)
  problem: This component calls itself the close of the whole course and says `these twenty units` three times, but the course and module asset now contain 27 units. Unless module 20 is explicitly presented as the close of an older sub-series, the final frame is factually stale.
  fix:     Either label it as the close of the first twenty-unit arc, or update the narration and every on-screen count to the current course boundary.

[deck/build_lessons_deck.py] empty-unit handling at 192-200 and 371-387 · MEDIUM (bug)
  problem: A parsed unit with no parsed lessons is accepted. The build writes the package, prints an empty-subdeck warning, and exits successfully. A new incomplete unit or a unit whose lesson syntax the regex misses therefore produces a successful but incomplete deck.
  fix:     Before importing genanki or writing the package, require at least one parsed lesson and at least one validated card for every unit. Treat an empty unit as a contract error, not a post-write warning.

[tools/build-modules-asset.mjs; tools/build-modules-page.mjs] entry identity and schema at asset 28-49 and page 37-58 · MEDIUM (fragile)
  problem: Neither generator validates required fields or uniqueness. A duplicate `series.unit` silently replaces the earlier asset entry. A duplicate `series.module` gives the page duplicate DOM ids and makes two scripts claim the same exact MP4. The next module addition can corrupt generated navigation without an error.
  fix:     Run one preflight validation before writing output. Require finite positive integer module numbers, valid unique unit ids, unique module numbers, non-empty titles and subtitles, and a valid beat list.

[tools/build-modules-asset.mjs; tools/build-modules-page.mjs] duration and dubbing inference at asset 19-25 and page 23-29, 53-55, and 69-72 · MEDIUM (fragile)
  problem: A rendered video with no complete `durations.json` is presented with the sum of estimates as if it were its measured length. The page also treats the existence of a narration directory as proof of dubbing. `dub.mjs` creates that directory before key resolution, so a failed no-key run can leave an empty directory that changes the generated status.
  fix:     Track timing provenance. Require a positive measured duration for every beat before labeling a rendered video's length as measured. Check the expected narration files or duration keys instead of checking only the directory.

[deck/build_lessons_deck.py] _content_paths() at 27-40 · MEDIUM (fragile)
  problem: `assets/*content*.js` is not a course manifest. It also selects backup, experiment, and generated files whose names happen to contain `content`. Duplicate matches then interact with silent dict overwrite, and lexicographic file order need not match browser load order.
  fix:     Read the content script list from one explicit course manifest, or from the ordered script tags that define the browser course. Reject duplicate paths and identities.

[video/scripts/render-module-stills.mjs] Root.tsx source regex at 28-33 · MEDIUM (fragile)
  problem: Composition discovery depends on single quotes, property order, and exact adjacency in TypeScript source text. Reordering `name` and `id`, inserting another property, switching quotes, or moving registrations behind a helper silently omits only the reformatted modules when other matches remain.
  fix:     Export registration metadata from a data-only module that both `Root.tsx` and this script import. Do not parse executable TypeScript with a formatting-sensitive regex.

[video/scripts/lint-narration.mjs] longSentences() at 37-50 · LOW (fragile)
  problem: The splitter is an expanding token allowlist, not a sentence parser. It misses a sentence that starts with a quote, a digit, or an unlisted lower-case technical token, which merges sentences and creates false long-sentence reports. It also splits at abbreviations such as `e.g. A`, so one overlong sentence can become two short fragments and pass.
  fix:     Use a sentence tokenizer with abbreviation and leading-punctuation handling. Add independent cases for quoted starts, numeric starts, dotted fields, command names, abbreviations, and camelCase fields.

[video/src/Beat.tsx] injected direct-child rule at 33-42 · LOW (fragile)
  problem: The stage changes every direct child's display contract with a CSS selector. It can turn a class-based grid or SVG root into a flex column, while an inline `display`, `flexDirection`, or `justifyContent` overrides the rule and prevents the promised centring. Each new visual can therefore break in a different direction.
  fix:     Give visuals an explicit stage-root contract or place them inside a dedicated centring wrapper with known dimensions. Do not rewrite arbitrary child layout properties from the parent.

CODE REVIEW: 19 BUGS, 6 FRAGILE
