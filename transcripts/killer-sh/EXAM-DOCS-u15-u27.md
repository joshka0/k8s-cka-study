# Exam questions from the Kubernetes docs — units u15–u27

Mechanisms the docs treat as important and the course handles thinly.
Baseline Kubernetes v1.36. Search terms are the navigation half.

| Q   | unit | mechanism                                   | pts |
|-----|------|---------------------------------------------|-----|
| Q01 | u15  | Ingress Prefix path matching                |  6  |
| Q02 | u16  | CPU manager static eligibility              |  6  |
| Q03 | u17  | DRA claim by template, or by name           |  8  |
| Q04 | u18  | User impersonation RBAC                     |  6  |
| Q05 | u23  | Server-side apply field ownership           |  6  |
| Q06 | u25  | Service internal traffic policy Local       |  6  |
| Q07 | u27  | Pod Security Admission enforce              |  6  |

---

## Q01 — Everything under v1, and no more  ·  6 points  ·  ~7 min  ·  unit u15

topic:        The object is not the proxy

context:      Context `shoal`. Namespace `edge` contains Service `api`
              (ClusterIP, port 80) whose endpoints are Pods labeled
              `app=api`. Each `api` Pod answers every HTTP path with
              200 and its own name. The Cilium Ingress controller
              runs and services the default `cilium` IngressClass.
              `cilium` is the only IngressClass, and it is marked
              default. No Ingress exists in `edge`.

task:         Create Ingress `api-ing` in `edge`. Requests carrying
              Host header `api.example.com` must reach Service `api`
              on port 80 for `/v1` and for paths under it, such as
              `/v1/users`. A request for `/v1beta1` must not reach
              `api` through this Ingress. Let the cluster's default
              IngressClass apply rather than naming one yourself.
              Non-HTTP(S) exposure is not required.

constraints:  - Do not create or delete Services in `edge`.
                Checkable: Service list matches the snapshot.
              - Do not create other Ingresses in `edge`.
                Checkable: `api-ing` is the only Ingress in `edge`.
              - Do not change IngressClass `cilium`.
                Checkable: `cilium` matches the snapshot.

verify:       Snapshot the Service list in `edge` and IngressClass
              `cilium` before scoring.
              - (2) Ingress `edge/api-ing` exists and is the only
                Ingress in `edge`. Its live `spec.ingressClassName`
                is `cilium`. Its rule host is exactly
                `api.example.com`. A rule path names backend Service
                `api` on port 80.
              - (2) Send a live request to the Ingress address with
                Host `api.example.com` and path `/v1/users`. It
                returns 200 from an `api` Pod. The same request for
                `/v1` also returns 200.
              - (2) A live request with Host `api.example.com` for
                `/v1beta1` does not reach `api`; it returns 404. The
                Service list and IngressClass match the snapshot.
              Gate both request pairs on `api-ing` reporting an
              address in `status.loadBalancer`.
              Two routes score. Omitting `spec.ingressClassName`
              lets admission assign the sole default class, so the
              live field reads `cilium`. Setting
              `ingressClassName: cilium` explicitly reaches the same
              live value and also scores.
              `pathType: Exact` on `/v1` fails the second pair:
              `/v1/users` returns 404.
              `pathType: Prefix` on `/` fails the third pair: it
              serves `/v1beta1` as well.
              Host `*.example.com` fails the first pair. The rule
              host must be the exact name.
              `pathType: ImplementationSpecific` scores only if the
              live requests behave as required. `Prefix` is the
              portable answer.

expected path: - `kubectl get ingress,ingressclass,svc -n edge`
                  Left: `cilium` is the only class and is default,
                  `api` is ClusterIP on 80, no Ingress yet. Continue.
                  Right: more than one class is marked default. Then
                  admission rejects an Ingress with no
                  `ingressClassName`, and you must name one.
               - Search `ingress pathType`.
                  Left: Ingress page, Path types. `Prefix` matches
                  element by element, split on `/`. `/v1` covers
                  `/v1` and `/v1/users`. It does not cover
                  `/v1beta1`, because the last element is only a
                  string prefix of `v1beta1`.
                  Right: Service page. A Service cannot match a host
                  or a path. You still need the Ingress object.
               - Write the Ingress with host `api.example.com`, path
                 `/v1`, `pathType: Prefix`, backend
                 `service.name: api`, `service.port.number: 80`, and
                 no `ingressClassName`. Apply.
                  Left: `kubectl get ingress api-ing -n edge` shows
                  CLASS `cilium` and, after a moment, an ADDRESS.
                  Right: API rejects a missing `pathType`. Every
                  path needs one. Add it.
                  Right: CLASS is `<none>`. No default class applied.
                  Set `ingressClassName: cilium`.
               - Send the three requests through the address with the
                 Host header set.
                  Left: `/v1` and `/v1/users` return 200;
                  `/v1beta1` returns 404. Done.
                  Right: `/v1beta1` returns 200. Your path is `/`, or
                  a second rule catches it. Narrow the path to `/v1`.
                  Right: everything returns 404. The controller has
                  not admitted the Ingress yet, or the Host header is
                  missing from your request.

trap:         Use `pathType: Exact` and lose `/v1/users`. Second:
              use `pathType: Prefix` with path `/`, which also serves
              `/v1beta1`. Third: assume `Prefix` is a string prefix.
              It is not — `/v1` does not match `/v1beta1`. Fourth:
              set a wildcard host, which changes what the rule
              matches.

docs-path:    Search `ingress path prefix`.
              Page: Ingress
              https://kubernetes.io/docs/concepts/services-networking/ingress/
              Sections: Path types, Default IngressClass.
              Controller list: Ingress Controllers
              https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/

docs:         https://kubernetes.io/docs/concepts/services-networking/ingress/
              https://kubernetes.io/docs/concepts/services-networking/ingress/#path-types
              https://kubernetes.io/docs/concepts/services-networking/ingress/#default-ingress-class
              https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/

---

## Q02 — Whole cores, exclusive  ·  6 points  ·  ~7 min  ·  unit u16

topic:        Who gets exclusive CPUs

context:      Context `shoal`. Namespace `reserved` exists and is
              empty of your objects. The only worker, `worker-0`,
              runs kubelet with `cpuManagerPolicy: static` and a
              nonzero CPU reservation. `worker-0` has two free
              exclusively allocatable CPUs.

task:         Create Pod `tight` in `reserved`. Image
              `nginx:1.27-alpine`. It must run on `worker-0` with
              exclusive CPUs assigned by the kubelet, not CPUs lent
              from the shared pool. It must use exactly 2 exclusive
              CPUs.

constraints:  - Exactly one container. Checkable: Pod has one
                container.
              - Do not install, drain, or change kubelet
                configuration on any Node.
                Checkable: kubelet config matches the snapshot.

verify:       Snapshot kubelet config before scoring.
              - (2) Pod `reserved/tight` exists, uses
                `nginx:1.27-alpine`, and is Running on `worker-0`.
              - (2) `status.qosClass` is `Guaranteed`.
              - (2) The Pod has one container. Its `requests.cpu`
                and `limits.cpu` are both exactly `2`. Its
                `requests.memory` equals `limits.memory` and both
                are nonzero. Kubelet config matches the snapshot.
              Gate the last four points on `status.qosClass`.
              A Pending Pod scores 0 on the first pair. The kubelet
              assigns exclusive CPUs only when it admits the
              container, so a Pod that never ran proves nothing.
              Fractional CPU (`2.5`, `2500m`) fails: containers in
              Guaranteed pods with fractional requests still run on
              the shared pool, so exclusivity is not granted.
              `1` or `3` CPUs fails the last pair. The task names
              exactly 2.
              Requests without limits fail the QoS pair. A second
              container fails the last pair: the Pod must have one.
              Grade container-level resources only. Equal pod-level
              resources alone do not make this container exclusive.

expected path: - Search `cpu manager static`.
                  Left: CPU Management Policies page. The static
                  policy keeps a shared pool; "only containers that
                  are both part of a Guaranteed pod and have integer
                  CPU requests are assigned exclusive CPUs."
                  Right: Pod QoS page alone. It explains the class
                  but not which CPUs you get. Continue to the CPU
                  manager page.
               - Create one container with CPU `2` and memory
                 `512Mi`, set identically in requests and limits.
                 Apply.
                  Left: `kubectl get pod tight -n reserved -o yaml`
                  shows `qosClass: Guaranteed`, request and limit
                  both `2`.
                  Right: QoS comes back `Burstable`. You set only
                  requests, or request differs from limit, or a
                  second container has no resources. Fix it.
                  Right: `BestEffort`. No CPU and memory at all.
               - Confirm you did not touch kubelet flags.
                  Left: static policy, reservation nonzero.
                  Right: you drained the node or edited kubelet
                  config. Revert; the task is object-only.

trap:         Request `2` CPUs and set no limit. The class is
              Burstable and the container never gets exclusivity.
              Second: write `2500m` or `2.5`, which the kubelet
              counts as fractional and keeps in the shared pool.
              Third: change the kubelet policy to "fix" the Pod.

docs-path:    Search `cpu manager static`.
              Page: Control CPU Management Policies on the Node
              https://kubernetes.io/docs/tasks/administer-cluster/cpu-management-policies/
              Section: static policy configuration.
              QoS reference: Pod Quality of Service Classes
              https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/

docs:         https://kubernetes.io/docs/tasks/administer-cluster/cpu-management-policies/
              https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/
              https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/

---

## Q03 — Request the device, let the driver bind it  ·  8 points  ·  ~8 min  ·  unit u17

topic:        Template, or a named claim

context:      Context `shoal`. Namespace `compute` exists and is
              empty of your objects. DeviceClass `sgx-node` exists;
              its selector matches devices on the nodes. A device
              driver is installed; the scheduler allocates claims.
              No ResourceClaim or ResourceClaimTemplate exists.

task:         Create Pod `tf` in `compute`, image `busybox:1.36`,
              command `sleep 3600`. The Pod must draw one device
              from class `sgx-node`, and its container must be given
              that device. You may either let a claim be created for
              it from a template, or create the claim yourself first
              and point the Pod at it. Do not request the device
              through labels or requests.cpu.

constraints:  - The Pod must reach the scheduler with its need
                declared: `spec.resourceClaims` must have an entry.
                Checkable: Pod spec.
              - The container must consume the claim.
                Checkable: `resources.claims` on the container names
                the Pod claim entry.
              - Do not delete or change DeviceClass `sgx-node`.
                Checkable: DeviceClass matches the snapshot.
              - Do not name a class that does not exist.
                Checkable: referenced class must be `sgx-node`.

verify:       Snapshot DeviceClass `sgx-node` before scoring.
              - (2) Pod `compute/tf` exists, uses `busybox:1.36`,
                is Running, and `spec.resourceClaims` has exactly
                one entry. The `busybox` container's
                `resources.claims[0].name` matches that Pod claim
                entry's `name`.
              - (4) Route A: a ResourceClaimTemplate with apiVersion
                `resource.k8s.io/v1` exists, its
                `spec.spec.devices.requests` has exactly one entry,
                and that entry's `exactly.deviceClassName` is
                `sgx-node`. The Pod's claim entry sets
                `resourceClaimTemplateName` to that template.
                Route B: a ResourceClaim with apiVersion
                `resource.k8s.io/v1` exists, its
                `spec.devices.requests` has exactly one entry, and
                that entry's `exactly.deviceClassName` is
                `sgx-node`. The Pod's claim entry sets
                `resourceClaimName` to it.
              - (2) DeviceClass `sgx-node` matches the snapshot.
              Gate the route pair on the Pod existing. A Pod with
              an empty `resourceClaims` scores 0 there. A template
              that is never referenced scores 0: claims are created
              only from a template the Pod actually uses.
              A Pod that declares `spec.resourceClaims` but leaves
              the container's `resources.claims` empty scores 0 on
              the first pair. The device is allocated and never
              given to the container. Setting `requests.cpu` to
              simulate the device scores 0.

expected path: - Search `dynamic resource allocation pod`.
                  Left: DRA page. A Pod declares
                  `spec.resourceClaims`; one claim entry can name a
                  ResourceClaim by `resourceClaimName` or point at
                  a ResourceClaimTemplate by
                  `resourceClaimTemplateName`. Claims made from a
                  template are generated for the Pod and deleted
                  with it. A container then names that claim entry
                  in `resources.claims`.
                  Right: `requests.cpu` / device-plugins pages.
                  That asks for compute, not a device class.
               - Choose Route A: write a `ResourceClaimTemplate` at
                 apiVersion `resource.k8s.io/v1` with one request
                 under `spec.spec.devices.requests`, setting
                 `exactly.deviceClassName: sgx-node`. Then a Pod
                 with `resourceClaims: [{name: sgx,
                 resourceClaimTemplateName: <template>}]` and
                 `resources.claims: [{name: sgx}]` on the busybox
                 container. Apply.
                  Left: Pod admitted, scheduled, and Running; the
                  scheduler allocates the generated claim on a node
                  that has the device.
                  Right: `no matches for kind ResourceClaimTemplate`.
                  Wrong apiVersion or kind spelling. Use
                  `resource.k8s.io/v1`.
                  Right: `must specify one of: resourceClaimName,
                  resourceClaimTemplateName`. Each entry in
                  `spec.resourceClaims` needs exactly one of them.
                  Right: template exists, Pod ignores it. The
                  scheduler never generates a claim; the Pod stays
                  Pending without the device. Reference it.
                  Right: Pod Running, container gets no device. You
                  left `resources.claims` off the container. The Pod
                  entry declares the need; the container entry hands
                  the device over.
               - Route B also passes: create the ResourceClaim first
                 with one request under `spec.devices.requests` and
                 `exactly.deviceClassName: sgx-node`, then reference
                 it by `resourceClaimName` and name it in the
                 container's `resources.claims`.

trap:         Create only the template and expect the Pod to pick
              it up. Second: put the need in `requests.cpu` or an
              annotation. Third: reference a class name that does
              not match `sgx-node`. Fourth: declare
              `spec.resourceClaims` and forget the container's
              `resources.claims`, so nothing receives the device.

docs-path:    Search `allocate devices dra`.
              Page: Allocate Devices to Workloads with DRA
              https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/
              Sections: Claim resources, and Request devices in
              workloads using DRA.
              Concept: Dynamic Resource Allocation
              https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/

docs:         https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/
              https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/
              https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/

---

## Q04 — Ask, with your own name  ·  6 points  ·  ~7 min  ·  unit u18

topic:        Ask, without becoming them

context:      Context `shoal`. Namespace `tools` exists. ServiceAccount
              `breakfix` exists in `tools`. Users `alice` and `bob`
              exist in the cluster's authentication config. No role
              grants impersonation yet.

task:         Give ServiceAccount `breakfix` the power to act as
              `alice` or `bob` when debugging their permissions. It
              must not be able to act as any other user, group, or
              service account.

constraints:  - The grant must be limited to users `alice` and
                `bob`.
                Checkable: `resourceNames` on the impersonate rule
                is exactly `["alice","bob"]`.
              - The grant must not cover groups or service
                accounts.
                Checkable: no `impersonate` rules on `groups` or
                `serviceaccounts`.
              - Break nothing else.
                Checkable: other RBAC policies match the snapshot.

verify:       Snapshot `roles`, `rolebindings`, `clusterroles`,
              and `clusterrolebindings` before scoring.
              - (2) A ClusterRole grants verb `impersonate` on
                resource `users` in apiGroup `""` (core), with
                `resourceNames: ["alice","bob"]`.
              - (2) A ClusterRoleBinding binds that ClusterRole to
                ServiceAccount `breakfix` in namespace `tools`.
                Authorization answers yes for
                `impersonate users/alice` and `impersonate
                users/bob` as
                `system:serviceaccount:tools:breakfix`.
              - (2) Take the union of every `impersonate` grant on
                `users` that is effective for `breakfix`. It names
                exactly `alice` and `bob`. Authorization answers no
                for `impersonate users/carol`, for `impersonate
                groups/<any>`, and for `impersonate
                serviceaccounts/<any>`. Other RBAC objects match the
                snapshot.
              Gate the binding pair on the ClusterRole pair.
              A second ClusterRole bound to `breakfix` that grants
              `impersonate` on `users` for `carol`, or with no
              `resourceNames`, fails the last pair. The union is
              graded, not one matching rule.
              A namespaced Role + RoleBinding fails: the docs say
              impersonating a user is not namespace scoped, so it
              needs a ClusterRole and a ClusterRoleBinding. A rule
              without `resourceNames` fails the first pair: that
              impersonates anyone. A rule on `serviceaccounts`
              fails the last pair.

expected path: - Search `user impersonation`.
                  Left: User Impersonation page. The requester must
                  hold the `impersonate` verb on the attribute type;
                  users and groups live in the core apiGroup, and
                  the grant is not namespace scoped, so use a
                  ClusterRole and ClusterRoleBinding. Values can be
                  restricted with `resourceNames`.
                  Right: RBAC page alone. It shows bindings but not
                  the impersonate resource rules. Continue.
               - Write a ClusterRole:
                 `apiGroups: [""]`, `resources: ["users"]`,
                 `verbs: ["impersonate"]`,
                 `resourceNames: ["alice","bob"]`. Bind it
                 cluster-wide to `breakfix` (kind ServiceAccount,
                 namespace `tools`). Apply.
                  Left: `kubectl auth can-i impersonate users/alice
                  --as=system:serviceaccount:tools:breakfix` says
                  yes for alice, no for carol.
                  Right: you used a Role in `tools`. User
                  impersonation ignores namespaces; a namespaced
                  binding does not grant it. Use the Cluster
                  variants.
                  Right: you omitted `resourceNames`. Now
                  `breakfix` can impersonate anyone. Narrow it.
               - Check the negatives too. `kubectl auth can-i
                 impersonate users/carol
                 --as=system:serviceaccount:tools:breakfix` must say
                 no, and so must the same query on `groups` and
                 `serviceaccounts`.
                  Left: three noes. Done.
                  Right: a yes. Another ClusterRole bound to
                  `breakfix` widens the grant. Narrow or remove it.

trap:         Grant `impersonate` on `serviceaccounts` or `groups`
              to be safe. Second: create the ClusterRole but bind
              it with a RoleBinding. Third: forget
              `resourceNames` and impersonate everyone.

docs-path:    Search `user impersonation`.
              Page: User Impersonation
              https://kubernetes.io/docs/reference/access-authn-authz/user-impersonation/
              Sections: Required permissions, restricting with
              resourceNames.

docs:         https://kubernetes.io/docs/reference/access-authn-authz/user-impersonation/
              https://kubernetes.io/docs/reference/access-authn-authz/rbac/

---

## Q05 — Apply as hire  ·  6 points  ·  ~6 min  ·  unit u23

topic:        A conflict names an owner

context:      Context `shoal`. Namespace `delivery`. Deployment
              `catalog` (2 replicas, image `nginx:1.27-alpine`)
              exists. Its `metadata.managedFields` shows one
              manager, `ops`, with operation `Apply`. `ops` owns
              `spec.replicas` and the pod template fields.

task:         Using server-side apply with field manager `hire`,
              change `catalog` to 3 replicas and add annotation
              `owner: hire`. Preserve the values and `ops` ownership
              of every other field that `ops` owned. Do not recreate
              the Deployment.

constraints:  - The live object must keep its uid.
                Checkable: `catalog.metadata.uid` matches the
                snapshot.
              - The change must be recorded as an apply by `hire`,
                not an update.
                Checkable: a `metadata.managedFields` entry exists
                with manager `hire` and operation `Apply`.

verify:       Snapshot `catalog.metadata.uid` and every path that
              `ops` owns in `managedFields.fieldsV1` before scoring.
              - (2) Deployment `delivery/catalog` has the snapshot
                uid, `spec.replicas` is 3, and annotation
                `owner: hire` is present.
              - (2) `metadata.managedFields` has an entry with
                manager `hire`, operation `Apply`, a non-null
                `time`, and a `fieldsV1` that owns both
                `f:spec/f:replicas` and
                `f:metadata/f:annotations/f:owner`.
              - (2) The `ops` entry still has operation `Apply` and
                still owns every snapshotted path except
                `f:spec/f:replicas`. Its field values are unchanged.
              Gate the `hire` pair on the uid pair. A Deployment
              deleted and recreated fails the first pair, even with
              the same spec. Client-side `kubectl apply` (no
              `--server-side`) records manager
              `kubectl-client-side-apply` with operation `Update`;
              it fails the `hire` pair. `kubectl edit` or
              `kubectl set` write `Update` entries and fail too.
              `kubectl scale` to 3, followed by a server-side apply
              of only the annotation as `hire`, fails the `hire`
              pair. `hire` never takes `f:spec/f:replicas`.
              An apply by `hire` that also carries the template
              fails the last pair: it takes ownership of paths that
              `ops` must keep.

expected path: - Search `server side apply kubectl`.
                  Left: Server-Side Apply page and the kubectl
                  reference. `kubectl apply --server-side
                  --field-manager=hire -f catalog.yaml` sends an
                  apply patch; the API records `hire` as the
                  manager. Conflicting fields name the manager that
                  owns them; without `--force-conflicts` the apply
                  fails rather than stomping.
                  Right: `kubectl apply` without the flag. That is
                  client-side apply; it becomes
                  `kubectl-client-side-apply` and owns the whole
                  object via update. Not what the task asks.
               - Write a minimal apply configuration: apiVersion,
                 kind, name, namespace, the `owner: hire`
                 annotation, and `spec.replicas: 3`. Nothing else.
                 Apply it with `--server-side
                 --field-manager=hire`.
                  Left: "Apply failed with 1 conflict: conflict with
                  \"ops\": .spec.replicas". `ops` owns that field,
                  and the task is to transfer it. Re-run with
                  `--force-conflicts`.
                  Right: no conflict at all. Your file is not
                  minimal, or you edited it to match the live value
                  and never changed replicas.
               - Re-run with `--server-side --field-manager=hire
                 --force-conflicts`.
                  Left: replicas 3; `kubectl get deploy catalog
                  -n delivery -o yaml --show-managed-fields` shows
                  `hire` owning `f:spec/f:replicas` and the
                  annotation, and `ops` keeping the template.
                  Right: the `ops` entry lost template paths. Your
                  file carried the template too. Strip it to the two
                  fields and apply again.

trap:         Use `kubectl apply` with no flag, or `kubectl edit`.
              Second: `kubectl scale` to 3 and then apply only the
              annotation as `hire`. Replicas change, but `hire`
              never owns the field. Third: send the whole live
              object as `hire`, which strips `ops` of the template.
              Fourth: delete and recreate the Deployment.

docs-path:    Search `server side apply`.
              Page: Server-Side Apply
              https://kubernetes.io/docs/reference/using-api/server-side-apply/
              Sections: Field owners, Conflicts.
              Command: kubectl apply
              https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands/#apply

docs:         https://kubernetes.io/docs/reference/using-api/server-side-apply/
              https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands/#apply

---

## Q06 — Same node only  ·  6 points  ·  ~7 min  ·  unit u25

topic:        Local is not a hint

context:      Context `shoal`. Namespace `near`. Deployment `geo`
              runs 4 replicas, one on each worker. Its Pods listen
              on container port 8080 and carry label `app=geo`. Each
              `geo` Pod answers an HTTP request with its own Pod
              name and its Node name. No Service for them exists yet.

task:         Create Service `geo-svc` in `near` so that a Pod
              calling `geo-svc` from inside the cluster is answered
              only by a `geo` Pod running on the same node as the
              caller. Pods on other nodes must never be used for
              that call. The Service must keep its ClusterIP.

constraints:  - Service type must stay ClusterIP.
                Checkable: `type` is `ClusterIP`.
              - Do not change Deployment `geo`.
                Checkable: `geo` spec matches the snapshot.

verify:       Snapshot Deployment `geo` before scoring.
              - (2) Service `near/geo-svc` exists, `type` is
                `ClusterIP`, and its selector matches `app=geo`.
                `.spec.clusterIP` is not `None`. Its port is 80 and
                its `targetPort` is 8080. Its EndpointSlices carry
                one ready `geo` endpoint per worker.
              - (2) `.spec.internalTrafficPolicy` is `Local`, and
                `.spec.externalTrafficPolicy` is unset or
                `Cluster`.
              - (2) From a Pod on each worker in turn, request
                `geo-svc` on port 80. Every response must name the
                `geo` Pod running on the calling Pod's own node.
                Deployment `geo` matches the snapshot.
              Gate the policy pair on the Service existing, and gate
              the request pair on the ready endpoints.
              `externalTrafficPolicy: Local` fails the request pair:
              that field governs traffic arriving from outside the
              cluster, so in-cluster calls still spread cluster-wide.
              `sessionAffinity` does not affect locality and fails
              the request pair.
              A headless Service (`clusterIP: None`) fails the first
              pair. It has no proxy to apply the policy.
              A Service with the right policy and no ready endpoints
              fails the first pair. It answers no caller.

expected path: - Search `service internal traffic policy`.
                  Left: Service Internal Traffic Policy page.
                  `internalTrafficPolicy` defaults to `Cluster` and
                  can be `Local`: kube-proxy then uses only
                  node-local endpoints for traffic from inside the
                  cluster. Note the field is set on the Service,
                  and it is distinct from `externalTrafficPolicy`.
                  Right: an EndpointSlice or kube-proxy page. Those
                  reflect the choice; they do not set it.
               - Write the Service with selector `app: geo`,
                 port 80 → targetPort 8080, and
                 `internalTrafficPolicy: Local`. Apply.
                  Left: `kubectl get svc geo-svc -n near -o yaml`
                  shows the field; the Service reports endpoints on
                  every node.
                  Right: you set `externalTrafficPolicy: Local`.
                  For a ClusterIP Service that field is not the
                  knob; in-cluster calls still spread cluster-wide.
                  Switch fields.
               - Call the Service from a Pod on each worker.
                  Left: every response names the `geo` Pod on the
                  caller's own node. Done.
                  Right: a response names a `geo` Pod on another
                  node. The policy is not `Local`, or the caller ran
                  on a node with no ready `geo` endpoint.
               - Confirm `geo` is untouched.

trap:         Reach for `externalTrafficPolicy: Local` because both
              spell "Local". Second: assume the setting is a
              per-Pod hint; it is a Service-level policy.
              Third: change selector so the Service has no
              backends on some nodes.

docs-path:    Search `service traffic policy local`.
              Page: Service Internal Traffic Policy
              https://kubernetes.io/docs/concepts/services-networking/service-traffic-policy/
              Distinguish from: Create an External Load Balancer →
              Preserving the client source IP
              https://kubernetes.io/docs/tasks/access-application-cluster/create-external-load-balancer/

docs:         https://kubernetes.io/docs/concepts/services-networking/service-traffic-policy/
              https://kubernetes.io/docs/tasks/access-application-cluster/create-external-load-balancer/
              https://kubernetes.io/docs/concepts/services-networking/service/

---

## Q07 — Baseline is not a wish  ·  6 points  ·  ~7 min  ·  unit u27

topic:        Three modes, one blocks

context:      Context `shoal`. Namespace `guarded` carries labels
              `pod-security.kubernetes.io/enforce: baseline` and
              `pod-security.kubernetes.io/warn: restricted`.
              Deployment `app` (1 replica, image
              `nginx:1.27-alpine`) exists. It is not Available, and
              it has no Pods. Its ReplicaSet reports `FailedCreate`.

task:         Make Deployment `app` in `guarded` Available: 1 ready
              replica. Keep the image, replicas, and container
              command. Do not weaken or remove the namespace's
              enforcement.

constraints:  - Do not change `guarded`'s labels.
                Checkable: labels match the snapshot.
              - Keep Deployment name `app` and image
                `nginx:1.27-alpine`.
                Checkable: name and template image.
              - Do not delete Deployment `app`.
                Checkable: uid matches the snapshot.

verify:       Snapshot `guarded` labels, `app.metadata.uid`,
              `app.spec.replicas`, and every container `command` and
              `args` in the pod template before scoring.
              - (2) Deployment `guarded/app` has the snapshot uid
                and image `nginx:1.27-alpine`. `spec.replicas` is 1
                and equals the snapshot. It reports 1 ready replica
                and 1 available replica.
              - (2) The pod template has no
                `securityContext.privileged: true` (unset or
                false). Every container `command` and `args` equals
                the snapshot exactly.
              - (2) Namespace labels match the snapshot.
              Gate the template pair on the Deployment being
              Available. A template that still sets `privileged:
              true` scores 0 there, however Ready the Deployment
              looks — such a Pod cannot be admitted. Setting the
              namespace to `privileged` or deleting the enforce
              label fails the last pair. Creating a second
              Deployment with a different name scores 0 on the
              first pair.
              Changing a container `command` or `args` to sidestep
              the check fails the template pair. Scaling to another
              replica count fails the first pair, even when one
              replica happens to be ready.

expected path: - `kubectl describe rs -n guarded -l app=app`
                  Left: a `FailedCreate` event naming the Pod
                  Security violation: "pods ... is forbidden:
                  violates PodSecurity \"baseline:latest\":
                  privileged (container ... must not set
                  securityContext.privileged=true)". Read the pod
                  template for the named field. Continue.
                  Right: `kubectl describe pod -n guarded -l
                  app=app` returns nothing. Enforce mode rejects the
                  Pod create request, so no Pod object exists to
                  describe. Go up to the ReplicaSet. Deployment
                  events are another valid route.
                  Right: you reach for runtimeClass or node
                  problems. The event already names PodSecurity.
               - Search `pod security admission`.
                  Left: Pod Security Admission page. `enforce`
                  rejects Pods, `audit` and `warn` only record.
                  The check runs on the resulting Pod objects, so
                  the offending field is in the pod template.
                  Right: PodSecurityPolicy, which is removed. The
                  current mechanism is admission under labeled
                  namespaces.
               - Remove `privileged: true` from the template (keep
                 the rest), apply. Wait for 1/1 Ready.
                  Left: `kubectl get deploy app -n guarded`
                  Available; Pods start; no admission events.
                  Right: you edited the namespace labels instead.
                  Revert the snapshot change and fix the template.
               - Confirm labels untouched.

trap:         "Fix" it by setting the namespace to `privileged` or
              dropping the enforce label. Second: change the
              Deployment's name or delete/recreate it to escape the
              check. Third: expect `warn: restricted` to have
              stopped the Pod — warn only warns.

docs-path:    Search `pod security admission enforce`.
              Page: Pod Security Admission
              https://kubernetes.io/docs/concepts/security/pod-security-admission/
              Sections: Pod Security levels overview, modes
              (enforce / audit / warn), namespace labels.
              Levels reference: Pod Security Standards
              https://kubernetes.io/docs/concepts/security/pod-security-standards/

docs:         https://kubernetes.io/docs/concepts/security/pod-security-admission/
              https://kubernetes.io/docs/concepts/security/pod-security-standards/
              https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
