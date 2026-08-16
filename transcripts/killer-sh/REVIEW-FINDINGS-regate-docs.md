No unresolved or new findings.

The 60 original findings are gone from the current text.

Flagged deviations, ruled:

- u15-u27 Q01 redesign is accurate, gradeable, and leak-free. Cilium is a listed Ingress controller and uses IngressClass `cilium`. Prefix `/v1` matches `/v1` and `/v1/users` and does not match `/v1beta1`. Omitting `ingressClassName` when one default class exists yields a live field of `cilium`; setting it explicitly reaches the same live value. Live `/v1` and `/v1/users` 200s versus `/v1beta1` 404 discriminate Exact, Prefix `/`, and string-prefix mistakes. The task does not name `pathType: Prefix`.
- u1-u14 Q05 extra Nodes-versus-replicas sentence is sound. Combined with the live TCP check, `externalTrafficPolicy: Local` fails "on any Node".
- u1-u14 Q08 is accurate at v1.36. A Secret volume updates eventually; a `subPath` or `subPathExpr` mount does not. Env values from `secretKeyRef` do not change until the container restarts. An immutable Secret cannot be rotated. Restart-only keeps `subPath` and fails the second pair. Env conversion fails the file check. The context does not name `subPath`. The four docs URLs support the claims.
- u3l2::docs-watch-410-gone is accurate. A 410 Gone watch requires clearing the local cache, a fresh get or list, and a new watch from the returned `resourceVersion`. `BOOKMARK` events shrink how often the history window is missed. Schema, lesson, unit, topic, and extra URL are valid.

Spot-check of u15-u27 Q01, Q03, Q05, and the new Q08: DRA paths `spec.spec.devices.requests[].exactly.deviceClassName` (template) and `spec.devices.requests[].exactly.deviceClassName` (claim) match the current allocate-devices-dra examples. SSA `hire` must own `f:spec/f:replicas` and the `owner` annotation; `ops` keeps the other snapshotted paths. Expected-path pair names match the current verify blocks. No merge corruption.

VERDICT transcripts/killer-sh/EXAM-DOCS-u1-u14.md: ship
VERDICT transcripts/killer-sh/EXAM-DOCS-u15-u27.md: ship
VERDICT deck/cards-docs-u1-u14.json: ship
VERDICT deck/cards-docs-u15-u27.json: ship
