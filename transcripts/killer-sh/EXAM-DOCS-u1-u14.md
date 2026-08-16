# Exam questions from the Kubernetes docs — units u1–u14

Mechanisms the docs treat as important and the course handles thinly.
Baseline Kubernetes v1.36. Search terms are the navigation half.

| Q   | unit | mechanism                         | pts |
|-----|------|-----------------------------------|-----|
| Q01 | u4   | CronJob concurrency policy        |  6  |
| Q02 | u4   | Deployment surge / Recreate       |  6  |
| Q03 | u5   | CRD + one custom object           |  8  |
| Q04 | u7   | Init container gate               |  6  |
| Q05 | u8   | NodePort on a chosen port         |  6  |
| Q06 | u9   | dnsPolicy None                    |  6  |
| Q07 | u10  | PV reclaim Retain                 |  6  |
| Q08 | u14  | Secret update vs subPath mount    |  6  |

---

## Q01 — Skip the next tick  ·  6 points  ·  ~6 min  ·  unit u4

topic:        Completions and parallelism

context:      Context `shoal`. Namespace `batch` exists and is empty of
              your objects.

task:         Create CronJob `ledger-roll` in `batch`. Image
              `busybox:1.36`. The Job must run
              `sleep 600` every five minutes. If a previous run is
              still active, skip the next scheduled start. Do not
              cancel the active run.

constraints:  - Do not create other CronJobs in `batch`.
                Checkable: the only CronJob in `batch` is `ledger-roll`.

verify:       - (2) CronJob `batch/ledger-roll` exists and is the only
                CronJob in `batch`. `.spec.suspend` is false or
                unset. Its container image is `busybox:1.36`. The
                container runs `sleep 600`. Accept
                `command: ["sleep", "600"]`; accept
                `command: ["sleep"]` with `args: ["600"]`; accept
                `command: ["sh", "-c"]` with an argument whose
                executed command is `sleep 600`.
              - (2) `.spec.schedule` fires every five minutes
                (`*/5 * * * *` or `0/5 * * * *`).
              - (2) `.spec.concurrencyPolicy` is `Forbid`.
              Gate the last four points on the CronJob existing.
              A Job, a Deployment, or a CronJob with `Allow` or
              `Replace` scores 0 on the last pair.
              A suspended CronJob scores 0 on the first pair: it
              never starts a run, so concurrency is untested.
              A second CronJob in `batch` scores 0 on the first pair.
              `echo sleep 600` scores 0 on the first pair. It prints
              the words and exits at once.
              Do not require history-limit fields.

expected path: - Search the docs for `cronjob`.
                  Left: Concepts → Workloads → Controllers → CronJob.
                  Open Concurrency policy.
                  Right: the Job page. Jobs have no schedule and no
                  concurrency policy. You are on the wrong object.
               - Copy a CronJob manifest. Set name, namespace, image,
                 `sleep 600`, schedule `*/5 * * * *`,
                 `concurrencyPolicy: Forbid`. Apply.
                  Left: CronJob created.
                  Right: API rejects the schedule. Fix the five-field
                  cron string. Do not switch to a one-shot Job.
               - `kubectl get cronjob ledger-roll -n batch -o yaml`
                  Left: `concurrencyPolicy: Forbid`. Done.
                  Right: the field is missing or `Allow`. Default is
                  Allow. That overlaps. Set Forbid.
                  Right: `Replace`. That cancels the live Job. Wrong.

trap:         Leave concurrency at the default. The Job runs for ten
              minutes and the next tick starts another. Second: use
              `Replace`, which kills the active run instead of skipping.

docs-path:    Search `cronjob concurrency`.
              Page: CronJob
              https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
              Section: Concurrency policy.

docs:         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
              https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/
              https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/cron-job-v1/

---

## Q02 — New image, no extra pods  ·  6 points  ·  ~7 min  ·  unit u4

topic:        How a rollout actually moves

context:      Context `shoal`. Namespace `shop`. Deployment `web`
              already runs 3 replicas of `nginx:1.27-alpine` with the
              default rolling-update strategy.

task:         `web` must run `nginx:1.28-alpine`. Keep 3 replicas.
              During a later template rollout, the Deployment
              controller must not create more than 3 non-terminating
              `web` Pods.

constraints:  - Leave `spec.replicas` at 3.
                Checkable: `deploy/web.spec.replicas==3`.
              - Do not delete Deployment `web`.
                Checkable: `web.metadata.uid` matches the snapshot.

verify:       Snapshot `web.metadata.uid` before scoring.
              - (2) Deployment `shop/web` still has that uid.
                `spec.replicas` is 3. The template image is
                `nginx:1.28-alpine`. Available replicas are 3.
              - (4) Either `spec.strategy.type` is `Recreate`, or
                type is `RollingUpdate` and `maxSurge` is `0` or `0%`.
              Gate the strategy pair on the image update. An untouched
              Deployment with a later strategy edit scores 0.
              Do not require a particular `maxUnavailable` spelling.
              `1`, `34%`, and `100%` all pass if surge is 0.
              Recreate passes. Default `25%` surge fails the last
              pair even if the image is new.
              Grade the strategy field, not a live Pod count.
              Terminating Pods can push the total above
              `replicas + maxSurge`, so a live count is not evidence.

expected path: - `kubectl get deploy web -n shop -o yaml`
                  Left: 3 replicas, image `1.27-alpine`,
                  RollingUpdate 25% / 25%. Continue.
                  Right: object missing. Wrong namespace or context.
               - Search `deployment maxSurge`.
                  Left: Deployments page, Rolling Update.
                  `maxSurge` and `maxUnavailable` cannot both be 0.
                  25% of 3 rounds down to 0, so surge 0 alone is
                  rejected. Set `maxUnavailable` to at least 1.
                  Recreate waits for old-revision Pods to be removed
                  during an upgrade, but it does not give an at-most
                  guarantee after manual Pod deletion.
                  Right: you only `kubectl set image`. Defaults stay.
                  A later rollout still surges to 4.
               - Patch strategy, then set the image. Wait until
                 Available is 3/3.
                  Left: image `1.28-alpine`. Strategy is Recreate, or
                  RollingUpdate with surge 0. Done.
                  Right: API rejects surge 0 / unavailable 0. Set
                  `maxUnavailable: 1` and retry.

trap:         Change only the image. The default surge still allows a
              fourth Pod. Second: set `maxSurge: 0` and leave
              `maxUnavailable` at 25%. For 3 replicas that is 0, and
              the API rejects the patch.

docs-path:    Search `deployment maxSurge`.
              Page: Deployments
              https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
              Sections: Max Surge, Max Unavailable, Recreate Deployment.

docs:         https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
              https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#max-surge
              https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#recreate-deployment

---

## Q03 — A new kind in factory  ·  8 points  ·  ~8 min  ·  unit u5

topic:        The schema is the API

context:      Context `shoal`. Namespace `factory` exists. No
              CustomResourceDefinition for group `exam.shoal.io`
              exists yet.

task:         The cluster must serve a namespaced kind `Widget` at
              group `exam.shoal.io`, version `v1`. A Widget must
              accept `spec.color` as a string. Create Widget `sample`
              in `factory` with color `blue`.

constraints:  - Do not delete or mutate any other
                CustomResourceDefinition.
                Checkable: every CRD whose group is not
                `exam.shoal.io` matches the snapshot.

verify:       Snapshot the CRD list before scoring.
              - (3) A CRD exists with `spec.group` `exam.shoal.io`,
                `spec.scope` `Namespaced`, and `spec.names.kind`
                `Widget`. Version `v1` is served and is the storage
                version. Condition `Established` is True.
              - (3) Object `factory/sample` of kind `Widget` exists
                and `spec.color` is `blue`.
              - (2) Every other CRD matches the snapshot.
              Gate the Widget pair on Established. A CRD that never
              serves `widget` scores 0 on that pair.
              Extra schema fields pass. Cluster scope fails the first
              triple. A ConfigMap or a plain YAML file named Widget
              scores 0.

expected path: - Search `custom resource definition`.
                  Left: task page “Extend the Kubernetes API with
                  CustomResourceDefinitions”. Copy the v1 example.
                  Right: the concepts page only. It does not show a
                  working v1 manifest. Keep going to the task.
               - Set `group: exam.shoal.io`, `kind: Widget`,
                 `plural: widgets`, `scope: Namespaced`, version `v1`
                 with `served: true` and `storage: true`. Add a
                 structural schema for `spec.color` string. Apply.
                  Left: CRD created. `kubectl get crd` shows
                  `widgets.exam.shoal.io`.
                  Right: API rejects a missing schema. v1 requires
                  `openAPIV3Schema`. Add it. Do not drop to v1beta1.
               - Wait until Established is True. Then apply Widget
                 `sample` in `factory` with `spec.color: blue`.
                  Left: `kubectl get widget sample -n factory`
                  shows the object.
                  Right: `no matches for kind Widget`. The CRD is
                  not Established yet. Wait and retry.
                  Right: the Widget lands in `default`. Set the
                  namespace.

trap:         Omit the schema. The API server rejects the CRD.
              Second: create the Widget before Established, then
              assume the kind does not exist. Third: Cluster scope,
              so `factory/sample` cannot exist.

docs-path:    Search `custom resource definition`.
              Page: Extend the Kubernetes API with CustomResourceDefinitions
              https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/
              Copy the v1 namespaced example, then change group, names,
              and schema.

docs:         https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/
              https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/
              https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#create-a-customresourcedefinition

---

## Q04 — App must not start first  ·  6 points  ·  ~7 min  ·  unit u7

topic:        The order on the node

context:      Context `shoal`. Namespace `prep` exists and is empty of
              your objects.

task:         Create Pod `boot` in `prep`. The application container
              is named `app` and uses `nginx:1.27-alpine`. A helper
              named `prepare` uses `busybox:1.36` and runs
              `sh -c 'printf ready > /work/ready'`. The application
              container must not start until `prepare` has exited 0.
              Both containers share one `emptyDir` at `/work`. The
              `app` mount of that volume must be read-only.

constraints:  - The helper must exit. A helper that keeps running is
                not this task.
                Checkable: the helper's `restartPolicy` is not
                `Always`, and its status is terminated with exit 0.
              - Exactly one init container.
                Checkable: `spec.initContainers` has one entry.

verify:       - (2) Pod `prep/boot` exists. Container `app` uses
                `nginx:1.27-alpine` and is Running. The `app` mount
                of the shared `emptyDir` sets `readOnly: true`.
              - (2) `spec.initContainers` has exactly one entry. It
                is named `prepare`, uses `busybox:1.36`, and its
                command is
                `["sh", "-c", "printf ready > /work/ready"]`. It has
                terminated with exit code 0 under
                `status.initContainerStatuses`, and its
                `restartPolicy` is not `Always`.
              - (2) `kubectl exec boot -n prep -c app -- cat /work/ready`
                prints `ready`.
              Gate the file pair on `prepare` having completed. Two
              ordinary containers that start together score 0 on the
              last four points, even if the file exists. An init
              container with `restartPolicy: Always` scores 0 on the
              helper pair. A no-op init container plus an `app`
              command that writes `/work/ready` scores 0 on the
              helper pair: the read-only `app` mount also prevents
              that write.

expected path: - Search `init container`.
                  Left: Init Containers page. Init containers run to
                  completion, in order, before app containers start.
                  Share an `emptyDir` at `/work`.
                  Right: sidecar containers page. A sidecar keeps
                  running. The helper here must exit.
               - Write a Pod with `initContainers` (one entry named
                 `prepare`, busybox,
                 `sh -c 'printf ready > /work/ready'`) and
                 `containers` (`app`, nginx). Same `emptyDir`, same
                 mount path, `readOnly: true` on the `app` mount.
                 Apply.
                  Left: `Init:0/1`, then Running 1/1.
                  Right: both containers sit in `spec.containers`.
                  `app` can start before the write. Move the helper
                  to `initContainers`.
               - `kubectl exec -n prep boot -c app -- cat /work/ready`
                  Left: `ready`. Done.
                  Right: file missing. Mount paths differ, or the
                  write used a different directory.

trap:         Put both images in `spec.containers`. They start
              together. Second: a native sidecar
              (`initContainers` plus `restartPolicy: Always`). That
              helper never exits.

docs-path:    Search `init container`.
              Page: Init Containers
              https://kubernetes.io/docs/concepts/workloads/pods/init-containers/
              Also: Create a Pod that has an init container
              https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-initialization/

docs:         https://kubernetes.io/docs/concepts/workloads/pods/init-containers/
              https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-initialization/
              https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/

---

## Q05 — Port 31443 on every node  ·  6 points  ·  ~6 min  ·  unit u8

topic:        When the Service steps out

context:      Context `shoal`. Namespace `front`. Deployment `store`
              is Available. Its Pods listen on container port 80 and
              carry label `app=store`. The cluster has more Nodes
              than `store` replicas, so some Nodes run no `store`
              Pod. TCP nodePort 31443 is unused. The API server
              service-node-port range includes 31443.

task:         Clients must reach those Pods by opening TCP port
              `31443` on any Node. Traffic must land on container
              port 80. Do not change the Deployment.

constraints:  - Do not change Deployment `store`.
                Checkable: `store` spec matches the snapshot.
              - Do not change kube-proxy configuration or the API
                server service-node-port-range.
                Checkable: those objects and flags match the
                snapshot.

verify:       Snapshot Deployment `store`, kube-proxy ConfigMap or
              DaemonSet, and API server flags before scoring.
              - (2) A Service in `front` selects `app=store` (or
                otherwise has ready endpoints that are the `store`
                Pod IPs).
              - (2) That Service has a port whose `nodePort` is
                `31443` and whose `targetPort` is 80 (or named port
                80). `type` is `NodePort` or `LoadBalancer`.
                `externalTrafficPolicy` is unset or `Cluster`.
              - (2) Open a TCP connection to `<node-address>:31443`
                for every Node in turn. Each one must answer from a
                `store` Pod. Deployment `store` and kube-proxy / API
                server node-port settings match the snapshot.
              Gate the node-port pair on ready endpoints. A Service
              with the right nodePort and no backends scores 0 on
              that pair. `type: ClusterIP` fails even if `port` is
              31443. A `hostPort` on a Pod is not a node-wide
              Service and fails.
              `externalTrafficPolicy: Local` fails the last pair.
              Nodes that run no `store` Pod drop the request, so
              "on any Node" is not met.

expected path: - `kubectl get deploy,pods,svc -n front --show-labels`
                  Left: `store` Pods, label `app=store`, no Service
                  that publishes 31443. Continue.
                  Right: a Service already has nodePort 31443.
                  Check its selector and stop if it already works.
               - Search `service nodeport`.
                  Left: Service page, `type: NodePort`, “Choosing
                  your own port”. Default range is 30000–32767.
                  31443 is in range. Set `nodePort: 31443`,
                  `targetPort: 80`, selector `app: store`.
                  Right: Ingress page. Ingress does not open a node
                  port. Keep going to Service.
               - Apply. `kubectl get svc -n front`
                  Left: TYPE NodePort (or LoadBalancer), PORT(S)
                  shows `31443`. Endpoints list the store Pods.
                  Right: ClusterIP only. You omitted `type`.
                  Right: nodePort is random. You did not set
                  `31443`. Edit the Service.

trap:         Create a ClusterIP Service on port 31443. That port is
              cluster-internal, not a node port. Second: set
              `hostPort: 31443` on a new Pod. Only nodes that run
              that Pod listen. Third: set
              `externalTrafficPolicy: Local` to preserve the client
              IP. Nodes without a local endpoint then drop the
              request.

docs-path:    Search `service nodeport`.
              Page: Service
              https://kubernetes.io/docs/concepts/services-networking/service/
              Section: type NodePort → Choosing your own port.

docs:         https://kubernetes.io/docs/concepts/services-networking/service/
              https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport
              https://kubernetes.io/docs/tutorials/services/connect-applications-service/

---

## Q06 — Only this nameserver  ·  6 points  ·  ~7 min  ·  unit u9

topic:        The query that actually leaves

context:      Context `shoal`. Namespace `resolver` exists and is
              empty of your objects. Cluster DNS is CoreDNS at the
              usual `kube-dns` Service.

task:         Create Pod `stub` in `resolver`. Image `busybox:1.36`.
              Keep it Running (`sleep 3600` is fine). The Pod must
              send DNS queries only to `192.0.2.53`. It must not use
              the cluster DNS Service.

constraints:  - Do not change CoreDNS, kube-dns, or kubelet
                cluster-dns flags.
                Checkable: those objects and flags match the
                snapshot.

verify:       Snapshot CoreDNS / kube-dns and kubelet config before
              scoring.
              - (2) Pod `resolver/stub` exists, uses `busybox:1.36`,
                and is Running.
              - (2) `spec.dnsPolicy` is `None`.
                `spec.dnsConfig.nameservers` is exactly
                `["192.0.2.53"]`.
              - (2) CoreDNS / kube-dns and kubelet cluster-dns
                settings match the snapshot.
              Gate the DNS pair on the Pod Running.
              `dnsPolicy: ClusterFirst` (the default) plus a
              `dnsConfig.nameservers` entry fails: those addresses
              merge with cluster DNS; they do not replace it.
              `Default` uses the node's resolver and fails.

expected path: - Search `dnspolicy none`.
                  Left: DNS for Services and Pods → Pod's DNS Policy
                  and Pod's DNS Config. `None` ignores cluster DNS.
                  You must set `dnsConfig.nameservers`.
                  Right: CoreDNS Corefile pages. Do not edit cluster
                  DNS for a single Pod.
               - Create the Pod with `dnsPolicy: None` and
                 `dnsConfig.nameservers: ["192.0.2.53"]`. Apply.
                  Left: Running. `kubectl exec stub -n resolver --
                  cat /etc/resolv.conf` shows only `192.0.2.53`.
                  Right: API rejects `None` without nameservers.
                  Add `dnsConfig`.
                  Right: resolv.conf still lists the cluster DNS
                  IP. You used ClusterFirst and appended 192.0.2.53.
                  Switch the policy to None.

trap:         Set `dnsConfig.nameservers` and leave `dnsPolicy` at
              ClusterFirst. The extra server is merged, not exclusive.
              Second: `dnsPolicy: Default`, which copies the node
              resolver, not 192.0.2.53.

docs-path:    Search `dnspolicy none`.
              Page: DNS for Services and Pods
              https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/
              Sections: Pod's DNS Policy, Pod's DNS Config.
              Example: `service/networking/custom-dns.yaml`.

docs:         https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/
              https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/

---

## Q07 — Claim gone, volume stays  ·  6 points  ·  ~7 min  ·  unit u10

topic:        Claim, class, volume

context:      Context `shoal`. Namespace `vault` exists and is empty
              of your objects. The cluster has a default StorageClass
              whose reclaim policy is Delete. You may not delete
              StorageClass objects.

task:         Provide 1Gi of ReadWriteOnce storage whose host path is
              `/srv/vault`. Bind PersistentVolumeClaim `vault-data`
              in `vault` to that storage, then remove the claim. When
              you finish, no claim remains and the volume object
              still exists with path `/srv/vault`.

constraints:  - Do not delete or mutate existing StorageClass
                objects.
                Checkable: StorageClass list and specs match the
                snapshot.

verify:       Snapshot StorageClasses before scoring.
              - (2) A PersistentVolume exists with capacity 1Gi,
                access mode ReadWriteOnce, and
                `hostPath.path=/srv/vault`.
                `persistentVolumeReclaimPolicy` is `Retain`.
              - (2) That volume's phase is `Released`. Its retained
                `claimRef` names `vault/vault-data`. No
                PersistentVolumeClaim `vault-data` exists in `vault`.
              - (2) StorageClass objects match the snapshot.
              Gate the “claim gone” pair on the volume still
              existing. A dynamic volume that disappeared with its
              claim scores 0. A leftover Bound claim scores 0 on the
              second pair.
              A freshly created `Available` Retain volume with no
              `claimRef` scores 0 on the second pair. Nothing ever
              bound to it, so half the task was skipped.
              Do not require a particular volume name.

expected path: - `kubectl get sc,pv`
                  Left: a default StorageClass with reclaim Delete.
                  A claim that omits `storageClassName` is assigned
                  that class. Its volume would be deleted with the
                  claim. Build a static hostPath volume instead.
                  Right: no default. You still need a volume whose
                  reclaim policy is Retain.
               - Search `reclaim policy retain`.
                  Left: Change the Reclaim Policy of a
                  PersistentVolume, and Persistent Volumes → Retain.
                  After the claim is deleted the PV stays, phase
                  Released, claimRef still set.
                  Right: CSI snapshot pages. Wrong object.
               - Create a 1Gi RWO hostPath PV at `/srv/vault` with
                 `persistentVolumeReclaimPolicy: Retain` and
                 `storageClassName: ""`. Create matching claim
                 `vault-data` in `vault`. Wait until Bound. Delete
                 only the claim.
                  Left: no PVC. PV still present, Released,
                  `claimRef` names `vault/vault-data`, path
                  unchanged.
                  Right: PV vanished. You used the default class
                  (Delete). Create a static Retain volume.
                  Right: claim still Bound. You never deleted it.

trap:         Create only a PVC and let the default class provision.
              Delete reclaim removes the volume with the claim.
              Second: leave the PVC in place. The volume is Bound,
              not released.

docs-path:    Search `reclaim policy retain`.
              Pages: Change the Reclaim Policy of a PersistentVolume
              https://kubernetes.io/docs/tasks/administer-cluster/change-pv-reclaim-policy/
              and Persistent Volumes → Reclaiming
              https://kubernetes.io/docs/concepts/storage/persistent-volumes/#reclaiming

docs:         https://kubernetes.io/docs/concepts/storage/persistent-volumes/
              https://kubernetes.io/docs/concepts/storage/persistent-volumes/#retain
              https://kubernetes.io/docs/tasks/administer-cluster/change-pv-reclaim-policy/
              https://kubernetes.io/docs/concepts/storage/volumes/#hostpath

---

## Q08 — Still the old token  ·  6 points  ·  ~7 min  ·  unit u14

topic:        Still using the old credential

context:      Context `shoal`. Namespace `rotate`. Secret `api-cred`
              holds one key, `token`. Its value was rotated to `v2`
              an hour ago. Deployment `edge` (1 replica, image
              `nginx:1.27-alpine`) mounts `api-cred` as a volume, and
              its container reads the credential from the file
              `/etc/cred/token`. That file still holds `v1`.

task:         Make `edge` read `v2` from `/etc/cred/token`. Every
              later rotation of `api-cred` must reach that same file
              without another rollout. Keep the Secret, the image,
              the replica count, and the file path as they are. Do
              not delete the Deployment.

constraints:  - Do not change Secret `api-cred`.
                Checkable: `api-cred` matches the snapshot.
              - Keep the credential at `/etc/cred/token`.
                Checkable: the live file check in `verify`.
              - Do not delete Deployment `edge`.
                Checkable: `edge.metadata.uid` matches the snapshot.

verify:       Snapshot `api-cred` and `edge.metadata.uid` before
              scoring.
              - (2) Deployment `rotate/edge` has the snapshot uid,
                image `nginx:1.27-alpine`, `spec.replicas` 1, and 1
                ready replica. Secret `api-cred` matches the
                snapshot, and `api-cred.immutable` is false or unset.
              - (2) In the live pod template, no `volumeMount` that
                sources the `api-cred` volume sets `subPath` or
                `subPathExpr`. The volume is mounted as a directory.
              - (2) `kubectl exec deploy/edge -n rotate --
                cat /etc/cred/token` prints `v2`.
              Gate the last four points on the uid pair.
              Two routes score. Mount the `api-cred` volume at
              `/etc/cred` with no `subPath`: key `token` surfaces as
              `/etc/cred/token`. Or project the key to path `token`
              through a `projected` volume mounted at `/etc/cred`.
              Both leave a directory mount the kubelet keeps current.
              `kubectl rollout restart` alone scores 0 on the second
              pair. Its new Pods do read `v2`, so the file check
              passes, but the `subPath` mount still blocks every
              later rotation.
              Marking `api-cred` immutable scores 0 on the first
              pair: that Secret can never be rotated again.
              Moving the value to an environment variable scores 0
              on the third pair. The file path is graded, and env
              values are not updated in a running container.

expected path: - `kubectl get deploy edge -n rotate -o yaml`
                  Left: the container mounts the `api-cred` volume
                  with `mountPath: /etc/cred/token` and
                  `subPath: token`. Continue.
                  Right: the mount looks like a plain directory
                  mount. Then the file is stale for another reason;
                  check the Secret key name and the volume's `items`.
               - Search `secret mounted updated`.
                  Left: Secrets page → Using Secrets as files. When a
                  Secret changes, Kubernetes updates the data in the
                  volume, eventually. A container using a Secret as a
                  `subPath` volume mount does not receive automated
                  updates.
                  Right: Immutable Secrets. That section stops
                  updates on purpose. It is the opposite of the goal.
               - Change the mount to a directory: `mountPath:
                 /etc/cred`, no `subPath`. Keep the volume, the key,
                 and the image. Apply and wait for 1/1 Ready.
                  Left: `kubectl exec deploy/edge -n rotate --
                  cat /etc/cred/token` prints `v2`.
                  Right: the file is gone. You mounted over
                  `/etc/cred` with a different key name, or you added
                  `items` with another `path`. Set `path: token`.
                  Right: the directory holds `..data` and `token`.
                  That is the normal projected layout. Read
                  `/etc/cred/token`.

trap:         Run `kubectl rollout restart` and stop. The new Pods
              show `v2`, so the task looks done, but the `subPath`
              mount freezes the file again until the next restart.
              Second: mark the Secret immutable to "stabilise" it.
              That blocks all later rotations. Third: switch to
              `env.valueFrom.secretKeyRef`, which is resolved once at
              container start.

docs-path:    Search `secret mounted updated`.
              Page: Secrets
              https://kubernetes.io/docs/concepts/configuration/secret/
              Section: Using Secrets as files from a Pod, and its
              note on `subPath` volume mounts.
              Mount reference: Volumes → Using subPath
              https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath

docs:         https://kubernetes.io/docs/concepts/configuration/secret/
              https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath
              https://kubernetes.io/docs/concepts/storage/projected-volumes/
              https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/
