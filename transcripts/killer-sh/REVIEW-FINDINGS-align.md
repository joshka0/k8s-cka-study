# Content-align re-gate

Re-read the eight previously flagged teach items after the apply pass. `node --check` passed on all three content files. No new damage to surrounding items or JavaScript structure.

## Previous eight

[assets/advanced-content.js · Upgrade one compatibility boundary at a time] resolved
  The report now lists externally managed certificates and marks them; kubeadm will not renew those. Only the rotating kubelet client certificate (`kubelet.conf`) is omitted. Matches the cited kubeadm-certs page.

[assets/advanced-content.js · DRA makes devices first-class scheduling state] resolved
  The template clause is now “generated from a template”. The uncited “per Pod and deleted with it” lifecycle is gone. Exclusive-field and `resources.claims` sentences remain against allocate-devices-dra.

[assets/advanced-content.js · NotReady runs on a documented clock, not one round number] resolved
  `--node-monitor-grace-period`, 50 seconds, and `tolerationSeconds` are gone. The item now teaches the Nodes-page chain: `--node-monitor-period` 5s, Ready Unknown plus NoExecute taint, five minutes to the first eviction request, `--node-eviction-rate` 0.1.

[assets/cka-deep-content.js · Ownership is recorded per manager, per field] resolved
  Edit, scale, and client-side apply now record Update. A value change transfers the field to that Update manager. A later Apply conflicts unless the field is dropped or `--force-conflicts` is passed. Matches the cited Server-Side Apply page.

[assets/cka-deep-content.js · Two fields spell Local, in opposite directions] resolved
  The item now teaches `internalTrafficPolicy: Local`, node-local endpoints, and the zero-endpoint case against the cited internal-traffic-policy page. The uncited Cluster default and `sessionAffinity` contrast are gone. `externalTrafficPolicy` is named only as the counterpart; its mechanics stay on the previous Service item.

[assets/content.js · A rolling update is arithmetic you choose] resolved
  A percentage `maxUnavailable` rounds down; a percentage `maxSurge` rounds up. Both default to 25%, and both cannot be 0. The Recreate sentence is unchanged.

[assets/content.js · The kubelet is a sync loop, not a command receiver] resolved
  The sidecar sentence is gone. The flow is again `Init containers in order`. Regular init-gate sentences still match the cited Init Containers page.

[assets/content.js · Stickiness is a Service field, not a proxy accident] resolved
  `src` is now https://kubernetes.io/docs/reference/networking/virtual-ips/#session-affinity. `ClientIP`, default `None`, `timeoutSeconds`, and the three-hour default are on that section.

## Findings

(none)

## Verdicts

- assets/content.js: ship
- assets/advanced-content.js: ship
- assets/cka-deep-content.js: ship
