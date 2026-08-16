# Exam questions for uncovered CKA competencies — gap-fillers

CKA v1.35 curriculum gap-fillers. These task competencies the existing
33-question bank never reaches. Baseline Kubernetes v1.36. The curriculum PDF
names v1.35; every mechanism below is unchanged between v1.35 and v1.36, so
the questions are version-stable. Search terms are the navigation half.

| Q   | unit | mechanism                                   | pts |
|-----|------|---------------------------------------------|-----|
| Q01 | u4   | HPA v2 utilization needs a request          |  8  |
| Q02 | u4   | Rollout undo to a named revision            |  6  |
| Q03 | u23  | Helm install, then upgrade with an override |  8  |
| Q04 | u23  | Kustomize overlay patches a live base       |  6  |
| Q05 | u15  | Gateway plus HTTPRoute path routing         |  8  |
| Q06 | u13  | Drain past a PodDisruptionBudget            |  8  |
| Q07 | u10  | WaitForFirstConsumer binding                |  6  |
| Q08 | u9   | A forwarded zone beside the default block   |  6  |

---

## Q01 — Hold mill at sixty percent CPU  ·  8 points  ·  ~9 min  ·  unit u4

topic:        Two autoscalers, one number

context:      Context `shoal`. Namespace `busy`. Deployment `mill` runs
              2 replicas of image `nginx:1.27-alpine` in a single
              container named `web`. That container declares
              `limits.memory: 128Mi` and nothing else under
              `resources`. No LimitRange exists in `busy`. The Metrics
              Server is installed and `kubectl top pods -n busy`
              returns numbers for both Pods. No HorizontalPodAutoscaler
              exists anywhere in `busy`.

task:         Put Deployment `mill` under a HorizontalPodAutoscaler
              named `mill-hpa` in `busy`. It must hold average CPU
              utilization at 60 percent, never run fewer than 2 Pods,
              and never more than 8. The autoscaler must be working on
              live numbers: its status must carry a current CPU
              utilization, not an empty reading. Keep the container
              name `web` and the image `nginx:1.27-alpine`.

constraints:  - Exactly one HorizontalPodAutoscaler in `busy`, named
                `mill-hpa`.
                Checkable: HPA list in `busy`.
              - Keep the container name and image.
                Checkable: pod template matches the snapshot on those
                two fields.
              - Do not create a second workload.
                Checkable: `mill` is the only Deployment in `busy`.
              - Do not install or change the Metrics Server.
                Checkable: `metrics-server` Deployment matches the
                snapshot.

verify:       Snapshot `mill`'s container name and image, the workload
                list in `busy`, and the `metrics-server` Deployment
                before scoring.
              - (2) HorizontalPodAutoscaler `busy/mill-hpa` exists and
                is the only one in `busy`. Its stored apiVersion is
                `autoscaling/v2`. `spec.scaleTargetRef` names kind
                `Deployment`, apiVersion `apps/v1`, name `mill`.
                `spec.minReplicas` is 2 and `spec.maxReplicas` is 8.
              - (2) `spec.metrics` has exactly one entry. Its `type` is
                `Resource`, its `resource.name` is `cpu`, its
                `resource.target.type` is `Utilization`, and its
                `resource.target.averageUtilization` is 60.
              - (2) `status.currentMetrics` has an entry for `cpu`
                whose `current.averageUtilization` is set and not null.
                `status.desiredReplicas` is between 2 and 8 inclusive,
                and `status.currentReplicas` equals `mill`'s live
                `status.replicas`. As extra evidence,
                `status.conditions` may carry `ScalingActive: True`;
                the utilization reading is the field that decides this
                pair.
              - (2) Every container in `mill`'s pod template declares
                `resources.requests.cpu`. The container is still named
                `web` with image `nginx:1.27-alpine`, `mill` is still
                the only Deployment in `busy`, and `metrics-server`
                matches the snapshot.
              Gate the third and fourth pairs on the first.
              Two routes score. `kubectl autoscale deployment mill
              -n busy --cpu=60% --min=2 --max=8` writes an
              `autoscaling/v2` object with one Resource CPU
              Utilization metric at 60, which satisfies both spec
              pairs; a hand-written `autoscaling/v2` manifest reaches
              the same live object and also scores.
              A correct HPA created while `web` still declares no CPU
              request fails the last two pairs. Utilization is a
              percentage of the container's request, so with no
              request the Pod's CPU utilization is undefined, the
              autoscaler takes no action on that metric, and
              `status.currentMetrics` stays empty — `kubectl get hpa`
              prints `<unknown>/60%`. Both spec pairs still pass, which
              is exactly why the status pair is graded separately.
              `resource.target.type: AverageValue` with an
              `averageValue` fills `status.currentMetrics` but fails
              the second pair: the task names utilization.
              `kubectl scale deployment mill --replicas=5` fails the
              third pair. `status.currentMetrics` stays empty and the
              HPA never computed anything.
              `minReplicas` or `maxReplicas` other than 2 and 8 fails
              the first pair, even when the live replica count looks
              right.

expected path: - `kubectl get deploy mill -n busy -o yaml` and
                 `kubectl top pods -n busy`
                  Left: `top` returns numbers, so the metrics pipeline
                  works. The container sets only a memory limit.
                  Continue.
                  Right: `top` errors. The Metrics Server is the
                  problem, and the task forbids changing it. Re-read
                  the context.
               - Search `horizontal pod autoscaler`.
                  Left: Horizontal Pod Autoscaling page. For a target
                  utilization the controller reads the metric as a
                  percentage of the equivalent resource request on the
                  containers in each Pod. If some container has no such
                  request, the Pod's CPU utilization is not defined and
                  the autoscaler takes no action for that metric.
                  Right: the Metrics Server page. It explains where
                  numbers come from, not why utilization is undefined.
               - Add `resources.requests.cpu` to `web` (for example
                 `100m`), keep the memory limit, and apply.
                  Left: the rollout completes; Pods restart with a
                  request.
                  Right: you set a memory limit only and expected a CPU
                  request to appear. A limit is copied into the request
                  for that same resource, so a memory limit does
                  nothing for CPU. Set the CPU request.
               - Create the HPA, either with `kubectl autoscale
                 deployment mill -n busy --cpu=60% --min=2 --max=8` or
                 from an `autoscaling/v2` manifest.
                  Left: `kubectl get hpa mill-hpa -n busy` prints a
                  real percentage against `60%` within a minute or two.
                  Right: TARGETS reads `<unknown>/60%`. No usable
                  request yet, or the Pods have not been re-created
                  since you added it. Wait for the rollout.
                  Right: `kubectl autoscale ... --cpu-percent=60`
                  errors on an unknown flag. Current kubectl takes
                  `--cpu`, and a percentage sign selects utilization.
               - `kubectl get hpa mill-hpa -n busy -o yaml`
                  Left: `status.currentMetrics` carries a CPU entry
                  with an `averageUtilization`. Done.

trap:         Create the HPA first and stop when the object exists.
              The spec is right and nothing scales. Second: assume the
              memory limit gives the container a CPU request. Third:
              reach for `--cpu-percent`, which current kubectl does not
              take. Fourth: switch to `AverageValue` to make the
              `<unknown>` go away, which answers a different question.

docs-path:    Search `horizontal pod autoscaler`.
              Page: Horizontal Pod Autoscaling
              https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/
              Sections: How does a HorizontalPodAutoscaler work,
              Algorithm details.
              Walkthrough: HorizontalPodAutoscaler Walkthrough
              https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/
              API: HorizontalPodAutoscaler v2
              https://kubernetes.io/docs/reference/kubernetes-api/autoscaling/horizontal-pod-autoscaler-v2/

docs:         https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/
              https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/
              https://kubernetes.io/docs/reference/kubernetes-api/autoscaling/horizontal-pod-autoscaler-v2/
              https://kubernetes.io/docs/reference/kubectl/generated/kubectl_autoscale/
              https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/

---

## Q02 — Back to the blue template  ·  6 points  ·  ~7 min  ·  unit u4

topic:        How a rollout actually moves

context:      Context `shoal`. Namespace `ship`. Deployment `deck` runs
              3 replicas and is Available. `kubectl rollout history
              deployment/deck -n ship` lists revisions 1 to 4. Revision
              2 ran image `nginx:1.26-alpine` with environment
              variable `TIER=blue`. Revision 3 ran
              `nginx:1.28-alpine` with `TIER=green`. Revision 4, the
              current one, runs `nginx:1.29-alpine` with `TIER=green`.
              Every revision carries a `kubernetes.io/change-cause`
              annotation; revision 2's reads `blue build`.
              `spec.revisionHistoryLimit` is at its default.

task:         `deck` is serving the wrong content. Put it back on the
              exact pod template that its history records at revision
              2. Keep 3 replicas. Do not delete the Deployment and do
              not create a new one.

constraints:  - The Deployment keeps its identity.
                Checkable: `deck.metadata.uid` matches the snapshot.
              - Replicas stay at 3.
                Checkable: `spec.replicas` is 3.
              - `deck` stays the only Deployment in `ship`.
                Checkable: Deployment list in `ship`.

verify:       Snapshot `deck.metadata.uid`, the Deployment list in
                `ship`, and the full pod template recorded at revision
                2 (`kubectl rollout history deployment/deck -n ship
                --revision=2`) before scoring.
              - (2) Deployment `ship/deck` has the snapshot uid, is
                the only Deployment in `ship`, `spec.replicas` is 3,
                and it reports 3 ready and 3 available replicas.
              - (2) The live pod template equals revision 2's template
                field for field, ignoring the `pod-template-hash`
                label. In particular the container image is
                `nginx:1.26-alpine` and the `TIER` environment
                variable is `blue`.
              - (2) `kubectl rollout history deployment/deck -n ship`
                lists a revision numbered above 4, and
                `--revision=<that number>` shows the
                `nginx:1.26-alpine` / `TIER=blue` template. Exactly one
                ReplicaSet owned by `deck` has 3 ready Pods, and its
                template is that same template.
              Gate the second and third pairs on the first.
              Grade nothing from `kubernetes.io/change-cause`. It is
              free text and proves nothing about the running template.
              Two routes score. `kubectl rollout undo deployment/deck
              -n ship --to-revision=2` reaches the end state. So does
              reading `kubectl rollout history deployment/deck -n ship
              --revision=2` and then applying that template by hand:
              the Deployment matches the template by hash, re-uses the
              existing ReplicaSet, and records a new higher revision
              exactly as the undo does.
              `kubectl rollout undo deployment/deck -n ship` with no
              `--to-revision` fails the second pair. The default is the
              previous revision, which is 3 — `nginx:1.28-alpine` and
              `TIER=green`.
              Setting only the image back to `nginx:1.26-alpine` and
              leaving `TIER=green` fails the second pair. A revision is
              a whole pod template.
              Annotating `kubernetes.io/change-cause: blue build`
              without changing the template scores 0 on the second and
              third pairs.
              Deleting `deck` and creating it fresh from revision 2's
              template fails the first pair on the uid, however right
              the running Pods look.
              A rollback that also changes replicas fails the first
              pair.

expected path: - `kubectl rollout history deployment/deck -n ship`
                  Left: revisions 1 to 4 with their change causes.
                  Continue.
                  Right: `error: no rollout history found`. Wrong
                  namespace or wrong name.
               - `kubectl rollout history deployment/deck -n ship
                 --revision=2`
                  Left: the full pod template for that revision —
                  image, environment, every other field. This is the
                  target, and it is what will be graded.
                  Right: `unable to find the specified revision`. The
                  old ReplicaSet was pruned past
                  `revisionHistoryLimit`, which defaults to 10. Then
                  undo cannot reach it and you must rebuild the
                  template by hand.
               - Search `rolling back a deployment`.
                  Left: Deployment page, Rolling Back a Deployment.
                  `kubectl rollout undo` takes `--to-revision`, and
                  each rollback updates the revision of the
                  Deployment — the old number is not restored, a new
                  higher one is written.
                  Right: `kubectl rollout restart`. That re-creates
                  Pods on the current template and changes nothing.
               - `kubectl rollout undo deployment/deck -n ship
                 --to-revision=2`
                  Left: `kubectl rollout status deployment/deck
                  -n ship` completes; `kubectl get deploy deck -n ship
                  -o jsonpath='{.spec.template.spec.containers[0]}'`
                  shows the blue image and `TIER=blue`.
                  Right: the running Pods are `nginx:1.28-alpine`. You
                  omitted `--to-revision` and landed on revision 3.
                  Run it again with the flag.
                  Right: history no longer lists a revision 2. That is
                  expected — the blue template now sits at the new
                  highest revision number.

trap:         Run `kubectl rollout undo` bare and land on revision 3.
              Second: match only the image and leave the environment
              variable. Third: chase the `CHANGE-CAUSE` column, which
              is an annotation anybody can write. Fourth: delete and
              re-create the Deployment from the old manifest.

docs-path:    Search `rollback deployment revision`.
              Page: Deployments
              https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment
              Sections: Checking Rollout History of a Deployment,
              Rolling Back to a Previous Revision.
              Command: kubectl rollout undo
              https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/kubectl_rollout_undo/

docs:         https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment
              https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/kubectl_rollout_undo/
              https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/kubectl_rollout_history/
              https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/deployment-v1/

---

## Q03 — Ship the chart, then override it  ·  8 points  ·  ~9 min  ·  unit u23

topic:        Two state machines

context:      Context `shoal`. Helm 3 is installed on the exam host.
              Namespace `retail` exists and holds no workloads.
              Directory `/opt/charts/till` is an unpacked chart:
              `Chart.yaml` with `apiVersion: v2`, `name: till`,
              `version: 0.1.0`; `values.yaml` with
              `replicaCount: 1`, `image.repository: nginx`,
              `image.tag: 1.27-alpine`, `service.port: 80`; and
              `templates/` that render a Deployment `till` and a
              ClusterIP Service `till`. `helm list -n retail` is
              empty.

task:         Bring `/opt/charts/till` up in `retail` as release
              `till`, first exactly as the chart ships. Then move the
              same release forward so the running Deployment has 4
              replicas and image tag `1.29-alpine`, with those two
              values recorded on the release as values you supplied.
              Leave the release deployed at revision 2. Do not edit
              anything under `/opt/charts/till`, and do not change the
              live objects with `kubectl`.

constraints:  - The chart directory is untouched.
                Checkable: every file under `/opt/charts/till` matches
                the snapshot byte for byte.
              - Exactly one release in `retail`, named `till`.
                Checkable: `helm list -n retail`.
              - The Deployment and Service belong to the release.
                Checkable: both appear in `helm get manifest till
                -n retail`.
              - The chart's other defaults are unchanged.
                Checkable: `helm get values till -n retail -a` still
                reports image repository `nginx` and service port 80.

verify:       Snapshot every file under `/opt/charts/till` before
                scoring.
              - (2) `helm list -n retail` shows exactly one release,
                `till`, with STATUS `deployed` and REVISION 2.
                `helm history till -n retail` shows revision 1
                superseded and revision 2 deployed. `helm get values
                till -n retail --revision 1` — user-supplied values
                only, without `-a` — is empty: revision 1 shipped the
                chart with no overrides.
              - (2) `helm get values till -n retail` — user-supplied
                values only, without `-a` — reports the replica count
                as 4 and the image tag as `1.29-alpine`, and reports
                no other override. `helm get values till -n retail -a`
                still shows image repository `nginx` and service port
                80.
              - (2) Deployment `retail/till` appears in `helm get
                manifest till -n retail`, has `spec.replicas` 4, its
                container image ends in `nginx:1.29-alpine`, and it
                reports 4 ready replicas.
              - (2) Service `retail/till` appears in the same manifest
                and serves port 80. Every file under
                `/opt/charts/till` matches the snapshot.
              Gate the last two pairs on the first.
              Two routes score. `helm install till /opt/charts/till
              -n retail` followed by `helm upgrade till
              /opt/charts/till -n retail --set replicaCount=4 --set
              image.tag=1.29-alpine` lands the end state. So does
              writing an override file outside the chart and running
              the upgrade with `-f /tmp/prod.yaml`: both record the
              same user-supplied values on revision 2.
              `kubectl scale deployment till -n retail --replicas=4`
              plus `kubectl set image` fails the first two pairs. The
              live Deployment reads 4 and `1.29-alpine`, so a grader
              that looked only at the cluster would pass it — but the
              release is still revision 1 and its user-supplied values
              are empty. The two state machines have diverged, and the
              next `helm upgrade` would undo the change.
              Editing `values.yaml` inside the chart and upgrading
              fails the last pair on the snapshot and the second pair
              on the empty user values.
              `helm upgrade --install` run twice, with the overrides
              on both runs, fails the first pair. The release does
              reach revision 2, deployed, with the right user values
              and the right live objects — but `helm get values till
              -n retail --revision 1` reports the overrides too, so
              the chart was never shipped as it ships. That revision-1
              reading is the only thing that separates this path from
              the correct one.
              `helm uninstall` and a fresh `helm install` with the
              overrides fails the first pair. It is revision 1.

expected path: - `helm list -n retail` and `ls /opt/charts/till`
                  Left: no release; `Chart.yaml`, `values.yaml`,
                  `templates/` present. Continue.
                  Right: a release already exists. Read its history
                  before you add to it.
               - Search helm docs for `helm install`.
                  Left: Helm Install page. A chart argument may be a
                  path to an unpacked chart directory. `-f` takes a
                  values file, `--set` takes values on the command
                  line, and the right-most one wins.
                  Right: the chart repository pages. There is no
                  repository here; the chart is a local directory.
               - `helm install till /opt/charts/till -n retail`
                  Left: `helm list -n retail` shows `till`, revision 1,
                  deployed. `kubectl get deploy till -n retail` shows
                  1/1. `helm get values till -n retail --revision 1`
                  is empty, which is what proves this revision shipped
                  the chart as it ships.
                  Right: the install fails because the namespace is
                  missing. Add `--create-namespace`, or use the
                  namespace that exists.
               - `helm upgrade till /opt/charts/till -n retail --set
                 replicaCount=4 --set image.tag=1.29-alpine`
                  Left: revision 2, deployed. `helm get values till
                  -n retail` lists exactly those two keys.
                  Right: `helm get values` is empty. You upgraded
                  without the overrides, or you edited `values.yaml`
                  instead of passing values.
                  Right: replicas moved but the tag did not. Your key
                  path does not match the chart —
                  `helm get values till -n retail -a` shows the shape
                  the chart actually reads.
               - `kubectl get deploy,svc -n retail`
                  Left: 4/4 ready on `nginx:1.29-alpine`, Service on
                  80. Done.

trap:         Fix the live objects with `kubectl scale` and
              `kubectl set image`. The cluster looks right and the
              release knows nothing about it. Second: edit the chart's
              `values.yaml`, which changes the chart rather than the
              release. Third: uninstall and reinstall with the
              overrides, which throws away revision 1. Fourth: run
              `helm upgrade --install` twice with the overrides on
              both runs, which lands on revision 2 and never ships the
              chart as it ships. Fifth: guess the value key names
              instead of reading `values.yaml`.

docs-path:    Search helm docs for `helm upgrade values`.
              Page: Helm Install
              https://helm.sh/docs/helm/helm_install/
              Page: Helm Upgrade
              https://helm.sh/docs/helm/helm_upgrade/
              Sections: chart argument forms, `-f` and `--set`
              precedence.
              Release state: Helm Get Values
              https://helm.sh/docs/helm/helm_get_values/
              and Helm History
              https://helm.sh/docs/helm/helm_history/

docs:         https://helm.sh/docs/helm/helm_install/
              https://helm.sh/docs/helm/helm_upgrade/
              https://helm.sh/docs/helm/helm_list/
              https://helm.sh/docs/helm/helm_history/
              https://helm.sh/docs/helm/helm_get_values/
              https://helm.sh/docs/helm/helm_get_manifest/
              https://helm.sh/docs/topics/charts/

---

## Q04 — Three changes, one overlay  ·  6 points  ·  ~8 min  ·  unit u23

topic:        Review what the API will see

context:      Context `shoal`. Namespace `stock`. Directory
              `/opt/kustomize/inventory/base` holds
              `kustomization.yaml` with `resources: [deployment.yaml]`
              and `deployment.yaml`: Deployment `ledger`, 1 replica,
              one container named `web` on image `nginx:1.27-alpine`,
              `spec.selector.matchLabels` of `app: ledger`. That base
              was applied to `stock` some time ago, so Deployment
              `stock/ledger` is live and Available. Directory
              `/opt/kustomize/inventory/overlays/prod` exists and is
              empty.

task:         Fill `/opt/kustomize/inventory/overlays/prod` so that
              `kubectl apply -k` on it changes the live Deployment
              `stock/ledger` to 3 replicas, container image
              `nginx:1.29-alpine`, and adds the label `tier=prod` to
              the Deployment object. Then apply it. The overlay must
              build on the base rather than restate it. Do not edit
              anything under `base/`, and do not change the live
              Deployment with `kubectl edit`, `kubectl scale`, or
              `kubectl set`.

constraints:  - `base/` is untouched.
                Checkable: every file under
                `/opt/kustomize/inventory/base` matches the snapshot.
              - The overlay builds on the base.
                Checkable: the overlay's `kustomization.yaml` has a
                `resources` entry that resolves to
                `/opt/kustomize/inventory/base`.
              - The Deployment keeps its identity and its selector.
                Checkable: `ledger.metadata.uid` and
                `spec.selector` match the snapshot.

verify:       Snapshot the files under
                `/opt/kustomize/inventory/base`, and
                `ledger.metadata.uid` and `ledger.spec.selector`,
                before scoring.
              - (2) `kubectl kustomize
                /opt/kustomize/inventory/overlays/prod` renders
                exactly one object: Deployment `ledger`, with
                `spec.replicas` 3, container `web` on
                `nginx:1.29-alpine`, `metadata.labels` containing
                `tier: prod`, and `spec.selector` equal to the
                snapshot. The overlay's `kustomization.yaml` names the
                base under `resources`.
              - (2) `base/` matches the snapshot, and `kubectl
                kustomize /opt/kustomize/inventory/base` still renders
                1 replica on `nginx:1.27-alpine`.
              - (2) Live Deployment `stock/ledger` has the snapshot
                uid and the snapshot `spec.selector`, `spec.replicas`
                is 3, container `web` runs `nginx:1.29-alpine`,
                `metadata.labels` carries `tier: prod`, and it reports
                3 ready replicas.
              Gate the third pair on the first.
              Two routes score. An overlay using the `images`,
              `replicas`, and `labels` fields reaches the end state;
              so does an overlay whose `patches` entry carries an
              inline strategic-merge patch setting the same three
              things. Grading is on what the build renders and what
              the cluster holds, not on which transformer was used.
              `commonLabels: {tier: prod}` — or `labels` with
              `includeSelectors: true` — fails. Both write the label
              into `spec.selector` as well, and the render alone looks
              plausible, which is why the selector is graded in the
              first pair. The apply is then rejected: a Deployment's
              `spec.selector` is immutable, so the live object never
              reaches 3 replicas and the third pair scores 0 too.
              Copying `deployment.yaml` into the overlay and editing
              it fails the first pair. The build renders the right
              object but the overlay does not name the base, so the
              base and the overlay drift apart on the next change.
              Editing `base/deployment.yaml` fails the second pair,
              even when the live Deployment is correct.
              `kubectl scale` and `kubectl set image` fail the first
              pair: the overlay renders nothing useful.

expected path: - `kubectl kustomize /opt/kustomize/inventory/base` and
                 `kubectl get deploy ledger -n stock -o yaml`
                  Left: base renders 1 replica on `nginx:1.27-alpine`;
                  the live object matches and its selector is
                  `app: ledger`. Continue.
                  Right: the live object differs from the base. Someone
                  changed it outside kustomize. Note it; you still
                  build the overlay against the base.
               - Search `kustomization overlay`.
                  Left: Declarative Management with Kustomize. An
                  overlay is a `kustomization.yaml` whose `resources`
                  names the base directory. `images` sets `newTag` or
                  `newName`, `replicas` sets `count` by object `name`,
                  and `labels` takes `pairs` with `includeSelectors`
                  off by default. `commonLabels` is deprecated and
                  always writes selectors.
                  Right: the patches guide alone. A patch works too,
                  but read the transformers first — they are shorter
                  and they do not touch the selector.
               - Write the overlay: `resources: [../../base]`,
                 `images` with `name: nginx` and
                 `newTag: 1.29-alpine`, `replicas` with
                 `name: ledger` and `count: 3`, `labels` with
                 `pairs: {tier: prod}` and no `includeSelectors`.
                  Left: `kubectl kustomize
                  /opt/kustomize/inventory/overlays/prod` shows 3
                  replicas, the new tag, `tier: prod` in
                  `metadata.labels`, and `spec.selector` still
                  `app: ledger`.
                  Right: the rendered `spec.selector` now carries
                  `tier: prod`. You used `commonLabels`, or you set
                  `includeSelectors: true`. Remove it.
                  Right: the build cannot find a `kustomization.yaml`.
                  The `resources` path does not resolve. Count the
                  `../` levels.
               - `kubectl apply -k
                 /opt/kustomize/inventory/overlays/prod`
                  Left: the Deployment is configured; it rolls to
                  3/3 on the new image.
                  Right: `The Deployment "ledger" is invalid:
                  spec.selector: ... field is immutable`. The overlay
                  is rewriting the selector. Fix the label transformer
                  and apply again.

trap:         Use `commonLabels` because it is the field everybody
              remembers. It rewrites the selector and the apply is
              rejected. Second: set `includeSelectors: true` to be
              thorough, with the same result. Third: copy the base
              Deployment into the overlay and edit it, which renders
              correctly and defeats the point. Fourth: check
              `kubectl kustomize` output and forget to apply.

docs-path:    Search `kustomization`.
              Page: Declarative Management of Kubernetes Objects Using
              Kustomize
              https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/
              Sections: Bases and Overlays, setting images, labels.
              Field reference: images
              https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/images/
              replicas
              https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/replicas/
              labels
              https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/labels/

docs:         https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/
              https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/images/
              https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/replicas/
              https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/labels/
              https://kubernetes.io/docs/reference/kubectl/generated/kubectl_kustomize/

---

## Q05 — One door, two paths  ·  8 points  ·  ~9 min  ·  unit u15

topic:        Who owns which object

context:      Context `shoal`. The Gateway API v1 CRDs are installed
              and a controller runs. GatewayClass `edge` exists and
              reports `Accepted: True`; its controller assigns an
              address to every Gateway of that class. Namespace `front`
              holds Service `alpha` (ClusterIP, port 80) and Service
              `beta` (ClusterIP, port 80). Each `alpha` Pod answers
              every HTTP path with 200 and the word `alpha`; each
              `beta` Pod answers with the word `beta`. No Gateway,
              HTTPRoute, or Ingress exists in `front`.

task:         Put both Services behind one HTTP entry point on port 80
              in `front`, served by GatewayClass `edge`. A request
              carrying Host header `shop.example.com` for `/alpha`, and
              for paths under it such as `/alpha/v1`, must be answered
              by `alpha`. The same Host for `/beta` and paths under it
              must be answered by `beta`. A request for `/gamma` must
              not reach either Service. Do not use an Ingress.

constraints:  - Do not create, change, or delete Services in `front`.
                Checkable: the Service list and both Service specs
                match the snapshot.
              - Do not change GatewayClass `edge`.
                Checkable: `edge` matches the snapshot.
              - Exactly one Gateway in `front`.
                Checkable: Gateway list in `front`.
              - No Ingress anywhere in `front`.
                Checkable: Ingress list in `front` is empty.

verify:       Snapshot the Services in `front` and GatewayClass `edge`
                before scoring.
              - (2) Exactly one Gateway exists in `front`, at
                apiVersion `gateway.networking.k8s.io/v1`. Its
                `spec.gatewayClassName` is `edge`. It has a listener
                with `protocol: HTTP` on `port: 80`. Its
                `status.addresses` is non-empty.
              - (2) At least one HTTPRoute in `front` has a
                `parentRefs` entry naming that Gateway, and its
                `hostnames` list is exactly `shop.example.com`. For
                that parent, `status.parents[].conditions` reports
                `Accepted: True` and `ResolvedRefs: True`. Every
                `backendRefs` entry names `alpha` or `beta` on port 80.
              - (2) Through the Gateway address with Host
                `shop.example.com`: `/alpha` and `/alpha/v1` return 200
                and the word `alpha`; `/beta` and `/beta/v1` return 200
                and the word `beta`.
              - (2) Through the same address with the same Host,
                `/gamma` returns 404 and reaches neither Service. The
                Services in `front`, GatewayClass `edge`, and the empty
                Ingress list all match the snapshot.
              Gate the two live pairs on `status.addresses` being
              non-empty.
              Two routes score. One HTTPRoute with two rules — one
              matching `PathPrefix: /alpha` to `alpha`, one matching
              `PathPrefix: /beta` to `beta` — reaches the end state.
              So do two HTTPRoutes, one per prefix, both with
              `parentRefs` on the same Gateway. The grader counts
              Gateways, not routes.
              `path.type: Exact` on `/alpha` fails the third pair:
              `/alpha/v1` returns 404.
              A rule whose only path match is `PathPrefix: /` to
              `alpha` fails the fourth pair: `/gamma` returns 200.
              An HTTPRoute created in another namespace fails the
              second and third pairs. A listener's
              `allowedRoutes.namespaces.from` defaults to `Same`, so
              the route never attaches and the parent status does not
              report `Accepted: True`.
              A Gateway and route that are syntactically correct but
              name a GatewayClass that does not exist fail the first
              pair: no controller claims it, so no address appears.
              An Ingress that produces the same routing fails the
              fourth pair.

expected path: - `kubectl get gatewayclass,gateway,httproute,svc
                 -n front`
                  Left: `edge` is Accepted, both Services are ClusterIP
                  on 80, nothing else exists. Continue.
                  Right: no GatewayClass at all. Then the CRDs or the
                  controller are missing and no Gateway will ever get
                  an address.
               - Search `gateway api httproute`.
                  Left: Gateway API page. A Gateway names one
                  GatewayClass and declares `listeners`; an HTTPRoute
                  attaches through `parentRefs` and carries
                  `hostnames` and `rules`, each rule with `matches` and
                  `backendRefs`. By default a Gateway accepts routes
                  only from its own namespace.
                  Right: the Ingress page. It solves the same problem
                  with different objects, and the task rules it out.
               - Create the Gateway: `gatewayClassName: edge`, one
                 listener named `http`, `protocol: HTTP`, `port: 80`.
                 Apply.
                  Left: `kubectl get gateway -n front` shows an
                  address after a moment.
                  Right: ADDRESS stays empty. The class name is wrong,
                  or its controller is not running. Check
                  `kubectl describe gateway`.
               - Create the HTTPRoute: `parentRefs` naming the
                 Gateway, `hostnames: [shop.example.com]`, one rule
                 matching `PathPrefix: /alpha` to backend `alpha:80`
                 and one matching `PathPrefix: /beta` to `beta:80`.
                 Apply.
                  Left: `kubectl get httproute <name> -n front -o yaml`
                  shows the parent with `Accepted: True` and
                  `ResolvedRefs: True`.
                  Right: `ResolvedRefs: False`. A backend name or port
                  does not match a Service in this namespace.
                  Right: `Accepted: False`, reason names namespaces.
                  The route is not in the Gateway's namespace and the
                  listener only takes `Same`.
               - Send the five requests with the Host header set.
                  Left: `/alpha`, `/alpha/v1` say `alpha`; `/beta`,
                  `/beta/v1` say `beta`; `/gamma` is 404. Done.
                  Right: `/gamma` returns `alpha`. A rule matches `/`.
                  Narrow it.
                  Right: everything 404s. Wrong Host header, or the
                  route has not been programmed yet.

trap:         Use `path.type: Exact` and lose `/alpha/v1`. Second: add
              a catch-all rule "to be safe", which then serves
              `/gamma`. Third: put the HTTPRoute in a different
              namespace and expect it to attach. Fourth: create the
              Gateway and stop before the route, or the route and stop
              before the Gateway — neither object routes anything on
              its own.

docs-path:    Search `gateway api`.
              Page: Gateway API
              https://kubernetes.io/docs/concepts/services-networking/gateway/
              Sections: API kinds, the Gateway and HTTPRoute examples,
              cross-namespace routing.
              Path matching: HTTP routing
              https://gateway-api.sigs.k8s.io/guides/http-routing/
              Conditions: GEP-1364
              https://gateway-api.sigs.k8s.io/geps/gep-1364/

docs:         https://kubernetes.io/docs/concepts/services-networking/gateway/
              https://gateway-api.sigs.k8s.io/guides/http-routing/
              https://gateway-api.sigs.k8s.io/guides/getting-started/simple-gateway/
              https://gateway-api.sigs.k8s.io/geps/gep-1364/

---

## Q06 — Empty the node, keep the promise  ·  8 points  ·  ~10 min  ·  unit u13

topic:        Drain protects, it does not upgrade

context:      Context `shoal`. Workers `worker-0`, `worker-1`, and
              `worker-2` are all Ready and schedulable. Namespace
              `mill` runs Deployment `press` with 3 replicas labelled
              `app=press`, one on each worker, all Ready.
              PodDisruptionBudget `mill/press-pdb` (policy/v1) selects
              `app=press` with `minAvailable: 3`; `kubectl get pdb
              -n mill` shows ALLOWED DISRUPTIONS 0. DaemonSet
              `mill/logs` runs one Pod on every node. Deployment
              `mill/tmpjob` runs one Pod, `scratch`, currently on
              `worker-1`, and that Pod mounts an `emptyDir` volume.

task:         `worker-1` is going down for a kernel update. Leave the
              cluster with `worker-1` still a member, refusing new
              Pods, and running no workload Pods — only the Pods a node
              is expected to keep. Every application must still have
              the availability its owner asked for. Do not weaken or
              delete any policy object.

constraints:  - `press-pdb` is unchanged.
                Checkable: its spec matches the snapshot.
              - DaemonSet `logs` is unchanged.
                Checkable: its spec matches the snapshot.
              - `worker-1` stays a cluster member.
                Checkable: the Node object exists and is Ready.
              - `tmpjob` keeps one ready replica.
                Checkable: `tmpjob` reports 1 ready replica.

verify:       Snapshot `press-pdb`, DaemonSet `logs`, and the Node list
                before scoring.
              - (2) Node `worker-1` exists, is Ready, and is
                unschedulable: `spec.unschedulable` is true, or it
                carries the `node.kubernetes.io/unschedulable`
                `NoSchedule` taint.
              - (2) The only Pods running on `worker-1` are managed by
                a DaemonSet or are mirror Pods. No `press` Pod and no
                `tmpjob` Pod runs there. DaemonSet `logs` still has a
                ready Pod on `worker-1`.
              - (2) PodDisruptionBudget `mill/press-pdb` matches the
                snapshot exactly — still `minAvailable: 3`, same
                selector — and its `status.currentHealthy` is at least
                its `status.desiredHealthy`.
              - (2) Deployment `press` reports at least 3 ready
                replicas, every one of them on `worker-0` or
                `worker-2`. Deployment `tmpjob` reports 1 ready
                replica, not on `worker-1`. DaemonSet `logs` matches
                the snapshot and is ready on all three nodes.
              Gate the second pair on the first.
              Two routes score. `kubectl scale deployment press
              -n mill --replicas=4` and then `kubectl drain worker-1
              --ignore-daemonsets --delete-emptydir-data` reaches the
              end state. So does raising `spec.replicas` to 4 in the
              Deployment manifest and applying it, then running
              `kubectl cordon worker-1` before the same drain — drain
              marks the node unschedulable itself, so the extra cordon
              changes nothing.
              Scaling `press` back to 3 after the drain also scores.
              The temporary scale-up is a means, not the goal: the
              fourth pair asks for at least 3 ready `press` replicas
              off `worker-1`, and the third pair asks for the original
              budget reporting `currentHealthy` at or above
              `desiredHealthy`.
              Draining without making room first fails. With 3
              replicas and `minAvailable: 3` the budget allows zero
              disruptions, every eviction is refused with 429 Too Many
              Requests, and the drain never completes: `worker-1` still
              holds a `press` Pod. The cordon happened, so the first
              pair scores and the second does not.
              Deleting `press-pdb`, or lowering it to
              `minAvailable: 2`, empties the node and fails the third
              pair. The node looks perfect and the promise was broken.
              Draining without `--delete-emptydir-data` stops on
              `scratch` and fails the second pair.
              Draining without `--ignore-daemonsets` leaves the node
              unschedulable and still holding the `press` and `tmpjob`
              Pods. Drain marks the node unschedulable before it
              evicts anything, so the first pair scores and the second
              does not.
              `kubectl delete node worker-1` fails the first pair.
              Two paths reach the graded end state by the wrong route.
              `--disable-eviction` after scaling to 4 skips the budget
              check, and at 4 replicas the budget was never actually
              violated. `kubectl cordon worker-1` followed by
              `kubectl delete pod` on the `press` and `scratch` Pods
              also empties the node, and the `press` replacement lands
              on another worker. End-state grading cannot separate
              either from an eviction. Both score. Note them in
              feedback; a raw delete drops `currentHealthy` to 2 for
              as long as the replacement takes to go Ready, which is
              the disruption the budget exists to refuse.

expected path: - `kubectl get nodes` and `kubectl get pods -n mill
                 -o wide`
                  Left: three Ready workers; `press` spread one per
                  node; `logs` everywhere; `scratch` on `worker-1`.
                  Continue.
               - `kubectl drain worker-1`
                  Left: the node is cordoned at once, then the command
                  errors, naming DaemonSet-managed Pods and Pods with
                  local storage. The message names the two flags you
                  need. Note that the cordon already happened; the
                  node is unschedulable even though nothing moved.
                  Right: it starts and then hangs on evicting a `press`
                  Pod. Stop it and look at the budget.
               - `kubectl get pdb -n mill`
                  Left: ALLOWED DISRUPTIONS is 0. With
                  `minAvailable: 3` over 3 replicas nothing can ever be
                  evicted. Continue.
                  Right: ALLOWED DISRUPTIONS is 1 or more. Then the
                  drain would have finished; re-read why it stalled.
               - Search `safely drain a node`.
                  Left: Safely Drain a Node. Drain marks the node
                  unschedulable and evicts through the eviction API,
                  which respects PodDisruptionBudgets. Requiring zero
                  voluntary evictions means the drain never completes.
                  The fix is to give the budget room, not to remove it.
                  Right: the `--disable-eviction` flag. It forces
                  delete and bypasses PodDisruptionBudget checks. That
                  is the opposite of what the task asks for.
               - `kubectl scale deployment press -n mill --replicas=4`
                  Left: the fourth Pod goes Ready on `worker-0` or
                  `worker-2`; ALLOWED DISRUPTIONS becomes 1.
                  Right: the fourth Pod is Pending. No room on the
                  other workers; the drain still cannot proceed.
               - `kubectl drain worker-1 --ignore-daemonsets
                 --delete-emptydir-data`
                  Left: it evicts `scratch` and the `press` Pod and
                  returns. `kubectl get pods -n mill -o wide` shows
                  only a `logs` Pod on `worker-1`.
                  Right: it stalls again. Another budget, or the
                  replacement Pod has not gone Ready yet. Watch
                  `kubectl get pdb -n mill`.

trap:         Delete or relax `press-pdb` to make the drain finish.
              Second: reach for `--disable-eviction`, which skips the
              budget check entirely. Third: forget
              `--delete-emptydir-data` and leave `scratch` behind.
              Fourth: `kubectl delete node`, which removes the member
              rather than draining it. Fifth: read the first failed
              drain as "nothing happened" and miss that the node is
              already cordoned.

docs-path:    Search `safely drain node`.
              Page: Safely Drain a Node
              https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/
              Sections: draining with a PodDisruptionBudget,
              `--ignore-daemonsets`.
              Command: kubectl drain
              https://kubernetes.io/docs/reference/kubectl/generated/kubectl_drain/
              Eviction result: API-initiated Eviction
              https://kubernetes.io/docs/concepts/scheduling-eviction/api-eviction/

docs:         https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/
              https://kubernetes.io/docs/reference/kubectl/generated/kubectl_drain/
              https://kubernetes.io/docs/concepts/scheduling-eviction/api-eviction/
              https://kubernetes.io/docs/tasks/run-application/configure-pdb/
              https://kubernetes.io/docs/reference/kubernetes-api/policy-resources/pod-disruption-budget-v1/

---

## Q07 — One claim binds, one waits  ·  6 points  ·  ~7 min  ·  unit u10

topic:        Pending on purpose

context:      Context `shoal`. Namespace `vault` exists and is empty of
              your objects. A CSI driver registered as
              `csi.example.com` runs in the cluster and provisions
              volumes on demand; its volumes are reachable only from
              the node that owns them. The cluster has one
              StorageClass, `fast`, with provisioner
              `csi.example.com` and `volumeBindingMode: Immediate`.
              `fast` is not marked default, and there is no default
              class. No PersistentVolume and no PersistentVolumeClaim
              exists.

task:         Add a StorageClass named `late` that provisions through
              `csi.example.com` and does not commit a volume until a
              Pod that needs it has been scheduled. Then in `vault`
              create two 1Gi `ReadWriteOnce` claims on `late`: `used`,
              which Pod `reader` (image `busybox:1.36`, command
              `sleep 3600`) mounts at `/data`; and `spare`, which no
              Pod uses. Do not change or delete StorageClass `fast`,
              do not make any class the cluster default, and do not
              create PersistentVolumes yourself.

constraints:  - `fast` is unchanged.
                Checkable: `fast` matches the snapshot.
              - No class is the cluster default.
                Checkable: no StorageClass carries
                `storageclass.kubernetes.io/is-default-class: "true"`.
              - Every PersistentVolume was provisioned by the driver.
                Checkable: each PV has `spec.csi.driver:
                csi.example.com` and a `claimRef`.
              - `reader` runs one container.
                Checkable: Pod spec.

verify:       Snapshot StorageClass `fast` and the StorageClass list
                before scoring.
              - (2) StorageClass `late` exists, `provisioner` is
                `csi.example.com`, `volumeBindingMode` is
                `WaitForFirstConsumer`, and it is not marked default.
                `fast` matches the snapshot and no class is default.
              - (2) PVC `vault/used` is `Bound`. Its
                `storageClassName` is `late`, its request is 1Gi, and
                its access mode is `ReadWriteOnce`. Pod `vault/reader`
                is Running on a node, uses `busybox:1.36`, and mounts
                `used` at `/data`. The PV named by
                `used.spec.volumeName` has `spec.csi.driver:
                csi.example.com` and a `claimRef` naming `vault/used`.
              - (2) PVC `vault/spare` exists, its `storageClassName`
                is `late`, its request is 1Gi, and it is still
                `Pending` with an empty `spec.volumeName`. No Pod in
                any namespace references `spare`.
              Gate the second and third pairs on `late` reporting
              `WaitForFirstConsumer`.
              Two routes score. Creating `late`, then both claims,
              then the Pod reaches the end state; so does creating
              `late`, then the Pod and `used` together, then `spare`.
              The grader reads the end state and does not care about
              the order.
              A StorageClass with the right provisioner but
              `volumeBindingMode: Immediate` — or the field left out,
              which means `Immediate` — fails. `used` still ends Bound
              and `reader` still Runs, so a grader that checked only
              the consumed claim would pass it. `spare` binds as well,
              so the third pair scores 0, and the first pair scores 0
              on the field itself. The unconsumed claim is the whole
              proof.
              Creating a PersistentVolume by hand and letting `spare`
              bind to it fails the third pair and the PV constraint.
              Marking `late` default to make binding "work" fails the
              first pair.
              A `spare` on class `fast` fails the third pair: it binds
              at once, and it was never on the class under test.
              `reader` left Pending fails the second pair. Binding
              waits for the scheduler, so a Pod that never scheduled
              proves nothing.

expected path: - `kubectl get sc,pv,pvc -A`
                  Left: only `fast`, `Immediate`, not default; no PVs;
                  no PVCs. Continue.
               - Search `storage class volume binding mode`.
                  Left: Storage Classes page. `volumeBindingMode`
                  defaults to `Immediate`, which binds and provisions
                  as soon as the claim exists.
                  `WaitForFirstConsumer` delays both until a Pod using
                  the claim is created, so the volume is provisioned to
                  match that Pod's scheduling constraints.
                  Right: the PersistentVolume page's static
                  provisioning section. That is hand-made volumes, and
                  the task forbids them.
               - Create `late` with `provisioner:
                 csi.example.com` and `volumeBindingMode:
                 WaitForFirstConsumer`. Apply.
                  Left: `kubectl get sc` shows both classes and
                  `VOLUMEBINDINGMODE` `WaitForFirstConsumer` for
                  `late`.
                  Right: the API rejects the class for a missing
                  `provisioner`. That field is required.
               - Create both claims on `late`, then Pod `reader`
                 mounting `used`.
                  Left: `kubectl get pvc -n vault` shows `used` Bound
                  and `spare` Pending. `kubectl describe pvc spare
                  -n vault` shows a `WaitForFirstConsumer` event:
                  waiting for first consumer to be created before
                  binding.
                  Right: both claims are Bound. The class is
                  `Immediate`, or the claims landed on `fast`.
                  `volumeBindingMode` cannot be edited on an existing
                  class — delete `late` and create it again.
                  Right: `used` stays Pending and `reader` stays
                  Pending. Read `describe pod reader`: the node may
                  have no capacity, or the driver is not provisioning.
               - `kubectl get pv`
                  Left: exactly one PV, bound to `vault/used`. Done.

trap:         Leave `volumeBindingMode` out and get `Immediate` by
              default. Second: create only the consumed claim, which
              proves nothing about when binding happens. Third: try to
              edit `volumeBindingMode` on a live StorageClass. Fourth:
              make `late` the default class so the claims pick it up
              without naming it.

docs-path:    Search `volume binding mode`.
              Page: Storage Classes
              https://kubernetes.io/docs/concepts/storage/storage-classes/
              Sections: Provisioner, Reclaim Policy, Volume Binding
              Mode.
              Concept: Persistent Volumes
              https://kubernetes.io/docs/concepts/storage/persistent-volumes/
              Section: Provisioning, Binding.

docs:         https://kubernetes.io/docs/concepts/storage/storage-classes/
              https://kubernetes.io/docs/concepts/storage/persistent-volumes/
              https://kubernetes.io/docs/concepts/storage/dynamic-provisioning/

---

## Q08 — A zone of its own  ·  6 points  ·  ~8 min  ·  unit u9

topic:        Fallthrough is not forwarding

context:      Context `shoal`. ConfigMap `coredns` in `kube-system`
              holds one Corefile with a single `.:53` server block:
              `errors`, `health` with `lameduck 5s`, `ready`,
              `kubernetes cluster.local in-addr.arpa ip6.arpa` with
              `pods insecure`, `fallthrough in-addr.arpa ip6.arpa` and
              `ttl 30`, then `prometheus :9153`, `forward .
              /etc/resolv.conf`, `cache 30`, `loop`, `reload`,
              `loadbalance`. Deployment `coredns` in `kube-system` runs
              2 Ready replicas. Namespace `probe` holds Pod `dig`, a
              debug image with `dig` and `nslookup`, using cluster DNS.
              A resolver at `10.96.90.53` is authoritative for
              `corp.internal`. Today `db.corp.internal` resolves
              nowhere.

task:         Every Pod in the cluster must resolve names under
              `corp.internal` through the resolver at `10.96.90.53`.
              Names in `cluster.local` and public names must keep
              resolving exactly as they do now, and none of them may be
              sent to `10.96.90.53`. Leave the existing `.:53` server
              block exactly as it is and add whatever you need beside
              it. The change must survive a restart of the DNS Pods.

constraints:  - The `.:53` block is unchanged.
                Checkable: that block in the live Corefile matches the
                snapshot line for line.
              - No Pod's DNS settings changed.
                Checkable: every Pod's `dnsPolicy` and `dnsConfig`
                match the snapshot.
              - The DNS Service is unchanged.
                Checkable: `kube-system/kube-dns` matches the snapshot,
                ClusterIP included.
              - CoreDNS is healthy.
                Checkable: Deployment `kube-system/coredns` reports 2
                ready replicas.

verify:       Snapshot the Corefile, every Pod's `dnsPolicy` and
                `dnsConfig`, and Service `kube-system/kube-dns` before
                scoring.
              - (2) ConfigMap `kube-system/coredns` holds a second
                server block for zone `corp.internal`, and that block
                holds a `forward` line whose destination is
                `10.96.90.53`. Accept any zone argument on that line:
                `forward . 10.96.90.53` and `forward corp.internal
                10.96.90.53` are both valid inside the block, and both
                serve the zone. The `.:53` block matches the snapshot
                line for line: still `kubernetes cluster.local
                in-addr.arpa ip6.arpa`, still `forward .
                /etc/resolv.conf`.
              - (2) The running CoreDNS Pods serve that configuration.
                From Pod `probe/dig`, a lookup of `db.corp.internal`
                is answered. Deployment `coredns` reports 2 ready
                replicas. Do not read the client's SERVER line: every
                Pod queries the cluster DNS address, so `dig` and
                `nslookup` report `10.96.0.10` on a correct answer.
              - (2) From the same Pod,
                `kubernetes.default.svc.cluster.local` still resolves
                to the `kubernetes` Service ClusterIP, and a name that
                only the node resolver can answer — a public name —
                still resolves. Every
                Pod's `dnsPolicy` and `dnsConfig` and Service
                `kube-dns` match the snapshot.
              Gate the second and third pairs on the first.
              Two routes score. Editing the ConfigMap and waiting for
              the `reload` plugin to pick it up — allow two minutes —
              reaches the end state. So does editing it and then
              running `kubectl rollout restart deployment coredns
              -n kube-system`. Both leave the Pods serving the new
              zone, which is what the second pair reads.
              Replacing `forward . /etc/resolv.conf` in the `.:53`
              block with `forward . 10.96.90.53` fails the first and
              third pairs. `db.corp.internal` does resolve, so the
              second pair passes and a grader that only tested the new
              name would pass the whole thing — but every public name
              now goes to a resolver that is not authoritative for it.
              Adding a `forward corp.internal 10.96.90.53` line inside
              the `.:53` block fails the first pair. The zone does
              resolve, but there is no second server block and the
              default block no longer matches the snapshot. The task
              states that the default block stays as it is. The same
              line inside a `corp.internal` block scores.
              Adding `dnsConfig` nameservers to Pod `dig` fails the
              second constraint and the third pair, and leaves every
              other Pod unable to resolve the zone.
              Editing the ConfigMap and never getting CoreDNS to load
              it fails the second pair. So does a Corefile that CoreDNS
              refuses: the Pods CrashLoopBackOff and the replica check
              fails with it.
              Creating a second ConfigMap under a new name fails the
              first pair. The Deployment mounts `coredns`.

expected path: - `kubectl get cm coredns -n kube-system -o yaml` and
                 `kubectl get deploy coredns -n kube-system`
                  Left: one `.:53` block, `reload` present, 2 replicas
                  Ready. Save a copy of the Corefile before you edit.
                  Continue.
               - `kubectl exec -n probe dig -- nslookup
                 db.corp.internal`
                  Left: NXDOMAIN. The zone is not served anywhere yet.
               - Search `custom dns nameservers`.
                  Left: Customizing DNS Service. CoreDNS picks the
                  server block whose zone matches the query, so a stub
                  domain is its own block: `corp.internal:53 { errors
                  cache 30  forward . 10.96.90.53 }` placed beside
                  `.:53`. The `reload` plugin picks up a changed
                  Corefile; allow two minutes.
                  Right: the `fallthrough` directive in the
                  `kubernetes` plugin. That decides which plugin
                  handles a name inside one block; it does not send a
                  zone to another resolver.
                  Right: the Pod `dnsConfig` page. That changes one
                  Pod's resolver, not the cluster's.
               - Edit the ConfigMap: append the `corp.internal:53`
                 block after the closing brace of `.:53`. Leave `.:53`
                 alone. Apply.
                  Left: `kubectl get cm coredns -n kube-system
                  -o yaml` shows both blocks and an untouched `.:53`.
                  Right: the new block is nested inside `.:53`. CoreDNS
                  rejects the file and the Pods CrashLoopBackOff. Put
                  it after the closing brace.
               - Wait for `reload`, or `kubectl rollout restart
                 deployment coredns -n kube-system`.
                  Left: `kubectl get pods -n kube-system -l
                  k8s-app=kube-dns` shows 2 Ready.
                  Right: CrashLoopBackOff. `kubectl logs` names the
                  Corefile line. Fix the syntax; restore your copy if
                  you must.
               - Re-run the three lookups from `probe/dig`.
                  Left: `db.corp.internal` answers;
                  `kubernetes.default.svc.cluster.local` still answers
                  the Service ClusterIP; a public name still answers.
                  Done. The SERVER line still reads `10.96.0.10` on
                  all three: your Pod always asks cluster DNS, and
                  cluster DNS decides which block handles the name.
                  Right: `db.corp.internal` is still NXDOMAIN. The
                  reload has not happened yet, or the zone name in the
                  block is misspelled.

trap:         Point the default block's `forward` at `10.96.90.53` and
              send the whole internet there. Second: nest the new block
              inside `.:53` and crash CoreDNS. Third: expect the
              `kubernetes` plugin's `fallthrough` to forward the zone.
              Fourth: fix Pod `dig` with `dnsConfig` and call it done.
              Fifth: test immediately and conclude it failed — `reload`
              can take two minutes.

docs-path:    Search `customizing dns service`.
              Page: Customizing DNS Service
              https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/
              Sections: CoreDNS ConfigMap options, the stub domain
              example, the `reload` plugin.
              Concept: DNS for Services and Pods
              https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/

docs:         https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/
              https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/
              https://kubernetes.io/docs/tasks/administer-cluster/coredns/
