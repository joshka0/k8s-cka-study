[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q01] ungradeable
  problem: The grader accepts a suspended CronJob and accepts any command text that contains the tokens 'sleep' and '600'. For example, 'echo sleep 600' gets full credit but never sleeps. The 'only CronJob' constraint is also not checked.
  fix:     Add 'spec.suspend is false or unset' and 'the namespace contains exactly one CronJob, batch/ledger-roll' to verify. Replace the token check with a semantic command check that accepts 'command: ["sleep", "600"]', 'command: ["sleep"]' plus 'args: ["600"]', or 'command: ["sh", "-c"]' plus an argument whose executed command is 'sleep 600'.

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q02] wrong
  problem: Neither 'maxSurge: 0' nor Recreate guarantees that no more than three Pod objects run or terminate at once. The v1.36 Deployment docs state that terminating Pods can make the total exceed 'replicas + maxSurge'. They also state that Recreate does not give an at-most guarantee after manual Pod deletion.
  fix:     Replace 'A later replacement of this Deployment must never run more than 3 web Pods at once' with 'During a later template rollout, the Deployment controller must not create more than 3 non-terminating web Pods.' Replace every claim that Recreate never exceeds the replica count with 'Recreate waits for old-revision Pods to be removed during an upgrade, but it does not give an at-most guarantee after manual Pod deletion.'

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q04] ungradeable
  problem: The grader proves that some init container exited zero and that the app can read the file. It does not prove that the busybox helper wrote the file. A no-op busybox init container plus an app command that writes '/work/ready' gets full credit.
  fix:     Name the helper 'prepare'. Require exactly one init container. Require its command to be '["sh", "-c", "printf ready > /work/ready"]'. Require the app mount of the shared emptyDir to be read-only. Keep the existing terminated-zero status and live 'cat /work/ready' checks.

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q05] unsolvable
  problem: The context does not state that 31443 is free cluster-wide or that it is in the configured service-node-port range. A collision or a custom range makes the required object impossible without a forbidden cluster change.
  fix:     Add to context: 'TCP nodePort 31443 is unused. The API server service-node-port range includes 31443.'

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q05] ungradeable
  problem: A Service with 'externalTrafficPolicy: Local' can get full credit even when a request to a Node with no local store endpoint fails. That violates 'on any Node'. Static selector and endpoint checks also do not prove that 31443 reaches container port 80.
  fix:     Require 'externalTrafficPolicy' to be unset or 'Cluster'. Add a live TCP request to '<each-node-address>:31443' and require a response from a store Pod. Keep the nodePort, targetPort, ready-endpoint, and snapshot checks.

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q07] ungradeable
  problem: The grader accepts a newly created Available Retain PV with no claimRef. That state gives no evidence that a claim was ever bound and removed, so a candidate can skip half of the task.
  fix:     Name the claim 'vault-data'. Remove 'Available' from the accepted final phases. Require the PV to be Released and require its retained claimRef to name 'vault/vault-data', while PVC 'vault-data' no longer exists.

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q08] duplicate
  problem: Q08 tests the same Guaranteed resource shape that EXAM-DOCS-u15-u27.md Q02 must construct before it can test static CPU Manager exclusivity.
  fix:     Keep u15-u27 Q02 because integer Guaranteed resources are necessary evidence for its deeper CPU Manager mechanism. Replace Q08 with a docs-derived u14 question from a different topic, such as 'Still using the old credential'.

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q01] style
  problem: The brief requires the question to name its source topic. Q01 names only a mechanism.
  fix:     Add 'topic: Completions and parallelism'.

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q02] style
  problem: The brief requires the question to name its source topic. Q02 names only a mechanism.
  fix:     Add 'topic: How a rollout actually moves'.

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q03] style
  problem: The brief requires the question to name its source topic. Q03 names only a mechanism.
  fix:     Add 'topic: The schema is the API'.

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q04] style
  problem: The brief requires the question to name its source topic. Q04 names only a mechanism.
  fix:     Add 'topic: The order on the node'.

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q05] style
  problem: The brief requires the question to name its source topic. Q05 names only a mechanism.
  fix:     Add 'topic: When the Service steps out'.

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q06] style
  problem: The brief requires the question to name its source topic. Q06 names only a mechanism.
  fix:     Add 'topic: The query that actually leaves'.

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q07] style
  problem: The brief requires the question to name its source topic. Q07 names only a mechanism.
  fix:     Add 'topic: Claim, class, volume'.

[transcripts/killer-sh/EXAM-DOCS-u1-u14.md · Q08] style
  problem: The brief requires the question to name its source topic. Q08 names only a mechanism.
  fix:     Add 'topic: QoS is derived, not set' if Q08 is retained.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q01] unsolvable
  problem: The task requires requests to reach the Service, but the context and expected path state that no Ingress controller runs. The Ingress object alone cannot route traffic.
  fix:     Make this one Prefix-path question. Replace the context sentence with 'The Cilium Ingress controller runs and services the default cilium IngressClass.' Keep the routing goal, and add live requests that prove '/v1/users' succeeds while '/v1beta1' does not.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q01] ungradeable
  problem: A new Ingress that omits 'ingressClassName' is assigned the sole default IngressClass by admission. The live field therefore becomes 'cilium'. Requiring the live field to remain unset rejects the correct defaulted object.
  fix:     Replace the constraint and verify text with: 'Do not set spec.ingressClassName in the submitted manifest. The live object must have spec.ingressClassName: cilium after defaulting.' If the grader cannot observe the submitted manifest, remove the omission constraint and grade only the live value.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q01] leaks
  problem: The title, context, and verify text state that no controller exists and that the object cannot route. This gives away the advertised 'Ingress needs a controller' mechanism. The same question also tests Prefix path matching.
  fix:     Apply the Prefix-only redesign above. If a controller-diagnosis question is still wanted, make it a separate question whose context gives an accepted Ingress with no Address and failed requests, without naming the missing controller.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q02] ungradeable
  problem: The task allows any exclusive integer request up to 2 CPUs, but the grader requires exactly 2. It also gives full credit to a Pending Pod, although exclusivity is assigned only when kubelet admits the container. The pod-level alternative is wrong unless the v1.36 alpha PodLevelResourceManagers feature is enabled and configured; equal pod-level resources alone do not make this container exclusive.
  fix:     Replace 'It may not use more than 2 CPUs' with 'It must use exactly 2 exclusive CPUs.' Add to context: 'worker-0 has two free exclusively allocatable CPUs.' Require Pod 'tight' to be Running on worker-0. Remove the pod-level alternative and require the sole container to have CPU request and limit 2 and equal nonzero memory request and limit.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q03] wrong
  problem: The v1.36 DRA API has no 'spec.resourceClassName' on ResourceClaim or ResourceClaimTemplate. A template uses 'spec.spec.devices.requests[].exactly.deviceClassName'; a claim uses 'spec.devices.requests[].exactly.deviceClassName'. The Pod must also reference the claim in the container's 'resources.claims'. The current grader passes a Pod that never gives the allocated device to its container.
  fix:     Require apiVersion 'resource.k8s.io/v1'. For Route A, require 'spec.spec.devices.requests[0].exactly.deviceClassName: sgx-node'. For Route B, require 'spec.devices.requests[0].exactly.deviceClassName: sgx-node'. In both routes require one device, Pod 'spec.resourceClaims[0]' to name the claim source, and the busybox container 'resources.claims[0].name' to match that Pod claim name. Require Pod 'tf' to be Running. Add https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/ to docs and docs-path.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q04] ungradeable
  problem: The grader finds one exact alice/bob rule but does not reject another users rule in the same new ClusterRole that grants carol or '*'. It also does not grade the task's claim that the original breakfix identity stays recorded; API auditing is not stated as enabled.
  fix:     Require the union of every effective 'impersonate' grant on 'users' bound to breakfix to be exactly alice and bob. Add negative authorization checks for carol, groups, and serviceaccounts. Remove 'while keeping its own identity recorded' and the audit-log expected step, or state an enabled audit policy and grade the authenticated and impersonated identities.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q05] unsolvable
  problem: The context says only that ops has one Apply entry. It does not state which fields ops owns. If ops owns 'spec.replicas', changing 2 to 3 conflicts and cannot follow the expected instruction that forbids force. Rebasing to the live value cannot both avoid the conflict and change that value.
  fix:     State that ops owns 'spec.replicas' and the template fields. Require a minimal server-side apply by hire with '--force-conflicts' to transfer 'spec.replicas'. Replace 'Do not lose any ops-owned fields' with 'Preserve the values and ops ownership of every other field that ops owned.'

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q05] ungradeable
  problem: The grader checks only that hire has some Apply entry. A candidate can change replicas with 'kubectl scale', then server-side apply only the annotation as hire, and get full credit without applying the replica change as hire.
  fix:     Inspect 'managedFields.fieldsV1'. Require hire's Apply entry to own 'f:spec/f:replicas' and 'f:metadata/f:annotations/f:owner'. Require ops to retain every snapshotted owned path except 'f:spec/f:replicas'.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q06] ungradeable
  problem: The grader does not check a Service port, targetPort, a non-headless ClusterIP, ready endpoints, or a request. It explicitly awards the policy pair to a Service with no endpoints. Such a Service does not answer callers and can get full credit.
  fix:     State that each geo Pod returns its Pod and Node name on port 8080. Require 'clusterIP' not equal to 'None', Service port 80, targetPort 8080, and one ready geo endpoint per worker. Run one in-cluster request from a Pod on each worker and require that the response names the geo Pod on the caller's node.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q07] leaks
  problem: The context states both the enforced baseline policy and the exact violating field, 'privileged: true'. The diagnosis is the exercise, but the question gives it away.
  fix:     Remove the privileged-field sentence. State only that Deployment app is unavailable and its ReplicaSet reports FailedCreate. Let the candidate inspect the ReplicaSet event and Pod template.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q07] wrong
  problem: Enforce mode applies to resulting Pod objects, so the ReplicaSet's Pod create request is rejected. No failed Pod exists to describe. The expected first command against Pods cannot show the claimed admission event.
  fix:     Replace that step with 'kubectl describe rs -n guarded -l app=app' and expect a FailedCreate event that names the Pod Security baseline violation. Keep Deployment events as another valid route.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q07] ungradeable
  problem: The task requires the original replicas and container command, but verify snapshots neither. A candidate can change the command and set another replica count while leaving exactly one ready replica.
  fix:     Snapshot 'app.spec.replicas' and every container command and args. Require exact equality to those snapshots, require 'spec.replicas == 1', and require one ready and one available replica.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q01] style
  problem: The brief requires the question to name its source topic. Q01 names only mechanisms.
  fix:     Add 'topic: Valid, and serving nothing' if Q01 remains a controller question.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q02] style
  problem: The brief requires the question to name its source topic. Q02 names only a mechanism.
  fix:     Add 'topic: Who gets exclusive CPUs'.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q03] style
  problem: The brief requires the question to name its source topic. Q03 names only a mechanism.
  fix:     Add 'topic: Template, or a named claim'.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q04] style
  problem: The brief requires the question to name its source topic. Q04 names only a mechanism.
  fix:     Add 'topic: Ask, without becoming them'.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q05] style
  problem: The brief requires the question to name its source topic. Q05 names only a mechanism.
  fix:     Add 'topic: A conflict names an owner'.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q06] style
  problem: The brief requires the question to name its source topic. Q06 names only a mechanism.
  fix:     Add 'topic: Local is not a hint'.

[transcripts/killer-sh/EXAM-DOCS-u15-u27.md · Q07] style
  problem: The brief requires the question to name its source topic. Q07 names only a mechanism.
  fix:     Add 'topic: Three modes, one blocks'.

[deck/cards-docs-u1-u14.json · u2l3::docs-resource-version] schema
  problem: The required 'topic' field is missing.
  fix:     Add '"topic": "Two writers, one object",'.

[deck/cards-docs-u1-u14.json · u3l2::docs-cascade-orphan] schema
  problem: The required 'topic' field is missing, and no named u3 topic clearly sources this garbage-collection fact.
  fix:     Replace this card with a card derived from a named u3 topic, then add that exact topic in a 'topic' field.

[deck/cards-docs-u1-u14.json · u4l1::docs-cronjob-forbid] schema
  problem: The required 'topic' field is missing.
  fix:     Add '"topic": "Completions and parallelism",'.

[deck/cards-docs-u1-u14.json · u4l1::docs-max-surge-zero] schema
  problem: The required 'topic' field is missing.
  fix:     Add '"topic": "How a rollout actually moves",'.

[deck/cards-docs-u1-u14.json · u5l1::docs-crd-schema] schema
  problem: The required 'topic' field is missing.
  fix:     Add '"topic": "The schema is the API",'.

[deck/cards-docs-u1-u14.json · u6l3::docs-preemption-never] schema
  problem: The required 'topic' field is missing.
  fix:     Add '"topic": "Queue order without displacement",'.

[deck/cards-docs-u1-u14.json · u7l1::docs-init-order] schema
  problem: The required 'topic' field is missing.
  fix:     Add '"topic": "The order on the node",'.

[deck/cards-docs-u1-u14.json · u8l1::docs-session-affinity] schema
  problem: The required 'topic' field is missing.
  fix:     Add '"topic": "When the Service steps out",'.

[deck/cards-docs-u1-u14.json · u9l1::docs-dnspolicy-none] schema
  problem: The required 'topic' field is missing.
  fix:     Add '"topic": "The query that actually leaves",'.

[deck/cards-docs-u1-u14.json · u9l1::docs-clusterfirst-is-default] schema
  problem: The required 'topic' field is missing.
  fix:     Add '"topic": "The query that actually leaves",'.

[deck/cards-docs-u1-u14.json · u10l1::docs-reclaim-retain] schema
  problem: The required 'topic' field is missing.
  fix:     Add '"topic": "Claim, class, volume",'.

[deck/cards-docs-u1-u14.json · u13l2::docs-kubeadm-cert-ttl] schema
  problem: The required 'topic' field is missing.
  fix:     Add '"topic": "Safe, not merely successful",'.

[deck/cards-docs-u1-u14.json · u14l1::docs-immutable-configmap] schema
  problem: The required 'topic' field is missing.
  fix:     Add '"topic": "Delivery has semantics",'.

[deck/cards-docs-u1-u14.json · u14l2::docs-qos-guaranteed] schema
  problem: The required 'topic' field is missing.
  fix:     Add '"topic": "QoS is derived, not set",'.

[deck/cards-docs-u1-u14.json · u2l3::docs-resource-version] style
  problem: 'Compare it' omits the v1.36 comparison conditions. Order comparison is valid only for numeric resource versions from the same API group and resource type; extension API values that are not decimal support equality only.
  fix:     Replace the back with: 'A server version string used for concurrency and consistency. Pass it back unmodified. Compare order only for decimal values from the same API group and resource type. A stale value on update returns a conflict.'

[deck/cards-docs-u1-u14.json · u4l1::docs-max-surge-zero] wrong
  problem: 'Recreate also never exceeds the replica count' is false. The v1.36 Deployment docs say Recreate gives that ordering only for upgrades and does not provide an at-most guarantee after manual Pod deletion.
  fix:     Replace the final sentence with: 'During a template upgrade, Recreate waits for old-revision Pods to be removed before it creates new-revision Pods. It does not give an at-most guarantee after manual Pod deletion.'

[deck/cards-docs-u1-u14.json · u8l1::docs-session-affinity] wrong
  problem: ClientIP behavior does not require Kubernetes to hash the address; the implementation differs by proxy mode. 'None spreads each connection' also promises distribution that the API does not guarantee.
  fix:     Replace the back with: '<b>ClientIP</b>. Connections from one client IP are sent to the same backend Pod for the configured affinity timeout. The default <code>None</code> provides no client affinity.'

[deck/cards-docs-u1-u14.json · u13l2::docs-kubeadm-cert-ttl] style
  problem: 'kubeadm upgrade renews them' is conditional. Automatic control-plane renewal can be disabled, and kubeadm does not renew externally managed certificates.
  fix:     Replace the front with: 'kubeadm-managed leaf certificates default to {{c1::1 year}}. A control-plane kubeadm upgrade renews them unless certificate renewal is disabled. CA certificates default to {{c2::10 years}}.' Add to the back: 'Externally managed certificates need external renewal; the rotating kubelet client certificate is not in kubeadm certs check-expiration.'

[deck/cards-docs-u1-u14.json · u14l1::docs-immutable-configmap] style
  problem: 'kube-apiserver can drop its watch' assigns a client-side watch to the server and is unclear about what closes.
  fix:     Replace that sentence with: 'Watches for an immutable ConfigMap can close, which reduces load on kube-apiserver.'

[deck/cards-docs-u15-u27.json · u16l2::docs-topology-refused] unsolvable
  problem: Both 'restricted' and 'single-numa-node' reject Pods when their respective NUMA alignment requirement fails. The front asks only which policy rejects failed alignment, so both answers are correct.
  fix:     Replace the front with: 'Which Topology Manager policy rejects a Pod when the merged hint is not preferred, but can accept a preferred alignment that spans multiple NUMA nodes?' Keep the answer 'restricted', and state that 'single-numa-node' additionally requires one NUMA node.

[deck/cards-docs-u15-u27.json · u18l2::docs-impersonation-as] wrong
  problem: 'The audit log records both identities' is not always true because Kubernetes API auditing is optional and audit policy controls what is recorded. The linked impersonation page does not support this unconditional claim.
  fix:     Remove the audit-log sentence. If the audit detail is kept, replace it with: 'When API auditing is enabled and its policy records request metadata, the audit event can record the authenticated and impersonated identities,' and add the Kubernetes Auditing page to extra.

[deck/cards-docs-u15-u27.json · u20l2::docs-node-ready-unknown] wrong
  problem: The v1.36 kube-controller-manager default for '--node-monitor-grace-period' is 50s, not 40s. The linked Nodes page does not support the stated flag default.
  fix:     Replace 'default 40s' with 'default 50s'. Add https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/ to extra because it is the authority for the flag default.

[deck/cards-docs-u15-u27.json · u21l1::docs-node-identity] style
  problem: The front states one kubelet identity as universal. The linked page makes it a requirement for kubelets authorized by the Node authorizer. NodeRestriction also limits specific Node and bound-Pod writes, not every object vaguely 'tied to' a node.
  fix:     Replace the front with: 'To use the Node authorizer, a kubelet identifies as {{c1::system:node:&lt;nodeName&gt;}} in group {{c2::system:nodes}}.' Replace the first back sentence with: 'When enabled, NodeRestriction limits a node identity to writes for its own Node and Pods bound to it, plus its documented label restrictions.'

[deck/cards-docs-u15-u27.json · u24l1::docs-limitrange-default-quota] style
  problem: A LimitRange alone does not make CPU consume a namespace quota. That effect needs a ResourceQuota that counts the injected request or limit.
  fix:     Replace the front with: 'A ResourceQuota counts CPU requests, and a LimitRange sets default CPU requests and limits. Why do Pods that declare no CPU now consume that quota?'

[deck/cards-docs-u15-u27.json · u25l2::docs-endpointslice-conditions] wrong
  problem: The ready formula omits the 'publishNotReadyAddresses: true' exception. The proxy sentence also omits that fallback traffic is limited to endpoints that are both serving and terminating when all available endpoints are terminating.
  fix:     Replace the front with: 'For a normal Service without <code>publishNotReadyAddresses</code>, an EndpointSlice endpoint is ready only when it is {{c1::serving}} and not {{c2::terminating}}.' Replace the back with: 'With <code>publishNotReadyAddresses: true</code>, ready is always true. Proxies normally ignore terminating endpoints, but may use endpoints that are both serving and terminating when every available endpoint is terminating.'

[deck/cards-docs-u15-u27.json · u26l1::docs-job-sidecar-finish] wrong
  problem: 'The Job finishes once every main container exits' treats a failed main container exit as successful completion. A nonzero exit can fail the Pod and cause Job retry or failure.
  fix:     Replace the back with: 'A restartable init sidecar does not block Job completion. After every main container completes successfully, the Job can complete and the kubelet stops sidecars in reverse order.'

VERDICT transcripts/killer-sh/EXAM-DOCS-u1-u14.md: rework
VERDICT transcripts/killer-sh/EXAM-DOCS-u15-u27.md: rework
VERDICT deck/cards-docs-u1-u14.json: rework
VERDICT deck/cards-docs-u15-u27.json: rework
