# The series

`Intent to Packet` is the pilot and the spine. The twelve module videos hang off
it, one per course unit, each going deeper on one segment.

## Contract

- **Series, not standalone.** Every module opens by locating itself on the spine
  ("between binding and CNI") and assumes the pilot has been watched. No module
  re-explains the three lanes, level-based reconciliation, or what a controller
  is.
- **Length tracks the unit's depth**, not a fixed target. A clean five-minute
  module beats a padded nine-minute one. Orientation units (01, 09) run ~5–6
  min; the dense ones (02, 06, 07, 08, 10) run ~9–11. Narration speed is 1.0
  (~180 wpm), so minutes × 180 gives the word budget.
- **Narration voice.** Say the thing. No signposting, no announcing what is
  about to be said. Banned openers, all of which appeared in the pilot's first
  draft and were cut:

  | Don't | Do |
  | --- | --- |
  | "And this is worth being precise about: X" | "X" |
  | "Here is the part people miss. X" | "X" |
  | "Here is the thing to hold onto: X" | "X" |
  | "Note the layering, because interviewers probe it: X" | "The layering matters: X" |
  | "Now the reason any of this is worth memorising." | *(cut — go straight in)* |
  | "…which is exactly why…" / "…which is precisely why…" | "…so…" |

  Check with `node scripts/lint-narration.mjs <script.json>` before synthesis.
- **Content authority** is `../assets/content.js` — the course lessons. A module
  video may only teach what its unit teaches. Anything else needs a lesson
  first, same rule as the deck.
- **Every module ends** by placing its unit back on the spine and naming the one
  failure that belongs to it.

## Layout

```
video/
  script.json              pilot — Intent to Packet
  src/                     shared Remotion project, one component per visual.type
  modules/
    u02-api-path/script.json
    u06-scheduling/script.json
    …
```

Modules share the pilot's Remotion project, palette, caption system and audio
timing. A module adds new `visual.type` components only where its content has no
existing analogue; the eighteen from the pilot are reused wherever they fit.

## Order

Course order, 01 → 12. The pilot covers each unit at one-stage depth, so a
module's job is the depth the pilot skipped, not a recap of it.

| # | Unit | The depth the pilot skipped |
| --- | --- | --- |
| 01 | Control-plane map | What each component owns; what an outage actually costs |
| 02 | API request path | Webhook design, failure policy, SSA and field ownership |
| 03 | Reconciliation & watches | Informer internals, hot loops, external idempotency |
| 04 | Workloads & disruption | The four controllers' promises, HPA/VPA conflict, PDB scope |
| 05 | CRDs & operators | Versioning, conversion, finalizers, what you sign up to |
| 06 | Scheduling | The framework's extension points, preemption vs eviction |
| 07 | Kubelet, CRI & Pods | The four boundaries, probe semantics, termination |
| 08 | Networking & CNI | Service identity, the two data planes, the CNI exec contract |
| 09 | DNS & CoreDNS | Resolver policy, ndots, the compiled plugin chain |
| 10 | Storage & CSI | Binding modes, the controller/node split, topology handshake |
| 11 | HA, etcd & recovery | Quorum maths, what a snapshot omits, rehearsed restore |
| 12 | Scale, APF & evidence | FlowSchemas, seats, which signal proves what |
