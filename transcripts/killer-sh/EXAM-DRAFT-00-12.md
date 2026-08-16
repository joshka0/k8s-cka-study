# Exam draft — killer.sh range 00–12

| Q   | source | unit | pick                         | pts |
|-----|--------|------|------------------------------|-----|
| Q01 | q07    | u22  | low (pacing)                 |  2  |
| Q02 | q03    | u4   | medium                       |  4  |
| Q03 | q02    | u6   | high                         |  6  |
| Q04 | q04    | u7   | high                         |  8  |
| Q05 | q06    | u10  | medium                       |  6  |
| Q06 | q08    | u13  | medium                       |  6  |
| Q07 | q11    | u4   | high                         |  8  |
| Q08 | q12    | u6   | high                         |  8  |
| Q09 | q09    | u6   | high                         | 10  |

High items included: q02, q04, q09, q11, q12. Strongest mediums: q08, q06, q03. Low: q07 (write `kubectl top`). Skipped lows: q00, q01, q05. Skipped medium: q10.

---

## Q01 — Node and container usage  ·  2 points  ·  ~3 min  ·  unit u22  ·  LOW (pacing)

context:      Context `reef`. Metrics Server is installed and serving
              `metrics.k8s.io`. Empty files wait at
              `/opt/course/1/node-usage.sh` and
              `/opt/course/1/pod-usage.sh`.

task:         Put a command in `/opt/course/1/node-usage.sh` that prints
              current CPU and memory usage for every Node.
              Put a command in `/opt/course/1/pod-usage.sh` that prints
              current CPU and memory usage for every container sample
              returned by `metrics.k8s.io`, across every namespace.
              Each file must run under `sh`.

constraints:  - Each file holds a command, not saved command output.
                Checkable: `sh` on the file talks to the live Metrics API.

verify:       - (1) `sh /opt/course/1/node-usage.sh` prints a row per Node
                with CPU and memory usage. Not request/limit figures.
              - (1) `sh /opt/course/1/pod-usage.sh` prints one row for
                every container sample in the live
                `/apis/metrics.k8s.io/v1beta1/pods` response, with its
                namespace, Pod, container, CPU usage, and memory usage.
                Do not require a row for a Pod or container that has no
                Metrics API sample.
              Do not require a specific binary name or flag spelling.
              `kubectl top node` and `kubectl top nodes` both pass.
              A working `kubectl get --raw` against `metrics.k8s.io` that
              prints the same classes of usage also passes.

expected path: - `kubectl top nodes`
                  Left: a table of node usage. Write that command into
                  `node-usage.sh`.
                  Right: `Metrics API not available`. Then this cluster
                  does not match the stated context. Do not invent numbers.
               - `kubectl top pods -A --containers`
                  Left: pod name, container name, CPU, memory.
                  Write that command into `pod-usage.sh`.
                  Right: no container column. You omitted `--containers`.
               - `sh` both files. Left: live tables. Right: the file holds
                 a captured table. Replace it with the command.

trap:         `kubectl describe node` and copy Allocated resources. That is
              requests, not usage. Writing the table into the file instead
              of the command.

docs:         https://kubernetes.io/docs/reference/kubectl/generated/kubectl_top/
              https://kubernetes.io/docs/reference/kubectl/generated/kubectl_top/kubectl_top_pod/
              https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/

---

## Q02 — Extra cash pod keeps coming back  ·  4 points  ·  ~4 min  ·  unit u4

context:      Context `reef`. Namespace `ledger`. Two Pods named `cash-0`
              and `cash-1` have been Running for some time. Operations
              wants that workload cut to a single replica.

task:         Leave only one of those Pods. The cut must still hold after
              either Pod is deleted.

constraints:  - Do not delete namespace `ledger`.
              - Do not rename the remaining Pod.
                Checkable: a pod named `cash-0` still exists.

verify:       - (2) Exactly one Pod in `ledger` whose name matches `cash-*`.
              - (2) The controller that owns `cash-0` has `spec.replicas=1`
                and `status.readyReplicas=1`.
              Gate the second pair on the first. A leftover controller at
              2 replicas with `cash-1` Terminating scores 0.
              Do not require a particular kubectl verb. A patched
              `spec.replicas` scores the same as `kubectl scale`.

expected path: - `kubectl get all -n ledger`
                  Left: a StatefulSet (or other owner) at 2 replicas, pods
                  `cash-0` and `cash-1`. Scale that owner.
                  Right: only two naked Pods and no owner. Then deleting
                  `cash-1` would work, but that is not this cluster.
               - Scale the owner to 1.
                  Left: the owner reports 1/1. Only `cash-0` remains.
                  Right: `not found` because you scaled Deployment by habit.
               - `kubectl get pods -n ledger`
                  Left: only `cash-0`. Done.
                  Right: `cash-1` reappears. You deleted a Pod. The owner
                  still wants 2.

trap:         Delete `cash-1` and move on. The owner recreates the highest
              ordinal. The names `cash-0` / `cash-1` are the signal to find
              the owner before you change count.

docs:         https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/
              https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#scaling-a-statefulset

---

## Q03 — Pier must run on harbor-cp1  ·  6 points  ·  ~6 min  ·  unit u6

context:      Context `harbor`. Namespace `dock`. Nodes: `harbor-cp1`,
              `harbor-w1`, `harbor-w2`. Create a single Pod.

task:         Create Pod `pier` in `dock`. Image `nginx:1.27-alpine`.
              The container name must be `winch`. The Pod must be Running
              on `harbor-cp1`.

constraints:  - Do not add, change, or delete labels on any Node.
              - Do not add, change, or delete taints on any Node.
                Checkable: Node label keys and taint tuples stay as they
                were when the question started.

verify:       Grader snapshot of each Node's labels and taints is taken
              before scoring.
              - (2) Pod `dock/pier` exists. Container `winch` uses
                `nginx:1.27-alpine`.
              - (2) `pier` is Running on `harbor-cp1`.
              - (2) Every Node's labels and taints match the snapshot.
              `spec.nodeName: harbor-cp1` passes.
              `nodeSelector` on an existing Node label plus a matching
              toleration also passes.
              A new Node label or a removed taint fails the third pair
              even if the Pod is Running on `harbor-cp1`.

expected path: - `kubectl get nodes --show-labels` and
                 `kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints`
                  Left: `harbor-cp1` carries
                  `node-role.kubernetes.io/control-plane:NoSchedule`.
                  Scheduler placement onto that node needs a toleration.
                  Setting `spec.nodeName` does not.
                  Right: no taint. Then a `nodeSelector` on the existing
                  role label is enough.
               - `kubectl run` `--dry-run=client -o yaml`. Set container
                 name `winch`. Set `spec.nodeName: harbor-cp1`. Apply.
                  Left: API accepts the Pod.
                  Right: AlreadyExists. Delete only your leftover.
               - `kubectl get pod pier -n dock -o wide`
                  Left: Running on `harbor-cp1`. Done.
                  Right: Pending, FailedScheduling, untolerated taint.
                  You used the scheduler (`nodeSelector` / affinity) and
                  did not tolerate. Either write `nodeName`, or add a
                  toleration and keep the existing Node labels.

trap:         `nodeSelector` on the control-plane role label and no
              toleration. The Pod stays Pending. Then you label or
              untaint the node to force it. That breaks the constraint.

docs:         https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/
              https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/
              https://kubernetes.io/docs/reference/labels-annotations-taints/#node-role-kubernetes-io-control-plane-taint

---

## Q04 — lumen is Running and serves nothing  ·  8 points  ·  ~8 min  ·  unit u7

context:      Context `harbor`. Namespace `signal`. Pod `lumen` has been
              Running for several minutes. Ready is False.

task:         Make `lumen` Ready. Do not replace the Pod.

constraints:  - Do not change `lumen`'s `spec`.
              - Do not delete `lumen`.
                Checkable: `lumen`'s uid is unchanged, and
                `spec.containers[*]` matches the original object.

verify:       Grader snapshots `lumen.metadata.uid` and
              `lumen.spec.containers` before scoring.
              - (4) `lumen` has `status.conditions[type=Ready]=True`.
              - (2) `lumen.metadata.uid` equals the snapshot.
              - (2) `lumen.spec.containers` equals the snapshot.
              Gate the last four points on Ready. A untouched broken Pod
              scores 0.
              Do not require a second Pod with a particular name.
              A Ready Pod selected by the Service, or a manually managed
              EndpointSlice that makes `lumen`'s existing readiness probe
              succeed, is enough. A manual EndpointSlice must use
              `kubernetes.io/service-name=<service-name>`, a non-reserved
              `endpointslice.kubernetes.io/managed-by` value, the correct
              address type and port, and a ready endpoint. Do not accept a
              manually created Endpoints object for this selector-bearing
              Service.

expected path: - `kubectl get pod lumen -n signal`
                  Left: Running 0/1. Continue.
                  Right: Pending. This is not a bind problem. Stop and
                  re-read.
                  Right: Running 1/1. Already solved.
               - `kubectl describe pod lumen -n signal`
                  Left: Ready False. Event: readiness probe failed.
                  Probe is an exec wget to a Service name on port 80.
                  Phase is Running. Scheduled is True.
                  Right: you treat 0/1 as "unscheduled" and start
                  debugging the scheduler. Discard that.
               - `kubectl get svc,endpoints,endpointslice -n signal`
                  Left: a Service whose name matches the probe URL, and
                  no addresses. The ClusterIP exists. Nothing answers.
                  Right: an address already. Find what owns it before
                  you add another backend.
               - Create a Ready Pod whose labels match that Service
                 selector. Do not put those labels on `lumen`.
                  Left: Endpoints gain the new Pod IP. After one probe
                  period, `lumen` is 1/1.
                  Right: Endpoints still none. Labels do not match.
                  Read the Service selector. Fix the new Pod, not the
                  Service, unless you have another working backend.

trap:         Hear "not Ready" as "not scheduled". Second: label `lumen`
              to match the Service. `lumen` is 0/1, so it never becomes
              an endpoint, and its own probe cannot succeed. Third:
              strip the readiness probe. That violates the spec freeze.

docs:         https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
              https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes
              https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-conditions
              https://kubernetes.io/docs/concepts/services-networking/service/
              https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/

---

## Q05 — Saw needs two gigabytes on disk  ·  6 points  ·  ~7 min  ·  unit u10

context:      Context `harbor`. Namespace `timber` exists and is empty of
              your objects. The cluster may already have StorageClass
              objects. You may not delete them. Each pre-existing
              StorageClass's name, metadata.uid, and spec are recorded in
              the initial snapshot.

task:         Deployment `saw` in `timber` must run one replica of
              `nginx:1.27-alpine` and mount 2Gi of ReadWriteOnce storage
              at `/data`. That storage must be the host path `/srv/timber`
              on whatever node the Pod lands on. The volume and the claim
              must not carry a StorageClass name. The claim must bind to
              the volume you create.

constraints:  - Do not delete or mutate existing StorageClass objects.
                Checkable: StorageClass list and each object's spec match
                the pre-question snapshot.
              - The PersistentVolume and PersistentVolumeClaim must have
                an empty `storageClassName` (the field absent or `""`).
                Checkable on both objects.

verify:       Scoring precondition: every pre-existing StorageClass has
              the same name, metadata.uid, and spec as the snapshot. If
              this precondition fails, score 0 for the question.
              - (2) A PersistentVolume exists with `capacity=2Gi`,
                `accessModes` including `ReadWriteOnce`,
                `hostPath.path=/srv/timber`, and `storageClassName` empty.
              - (2) A PersistentVolumeClaim in `timber` is Bound to that
                volume, requests 2Gi, includes `ReadWriteOnce`, and has
                an empty `storageClassName`.
              - (2) Deployment `timber/saw` is available. Its Pod mounts
                that claim at `/data`.
              Do not require particular object names for the volume or
              the claim, only the bind and the mount.

expected path: - `kubectl get sc,pv`
                  Left: a default StorageClass is present. A claim that
                  omits `storageClassName` is assigned that class and
                  will not bind to a volume with an empty class. Set
                  `storageClassName: ""` on the claim.
                  Right: no default. Omit or empty both sides. They still
                  have to match.
               - Create the PersistentVolume. `hostPath.path` is a string,
                 not a list. No class name. Apply.
                  Left: Available.
                  Right: API rejects `hostPath`. You pasted a list.
               - Create the claim in `timber`, 2Gi, ReadWriteOnce,
                 `storageClassName: ""`.
                  Left: Bound to your volume.
                  Right: Pending. Diff class (including empty), access
                  mode, size (volume >= request), volumeMode. Fix the
                  claim. Do not add a second volume.
               - Create Deployment `saw` with a
                 `persistentVolumeClaim` volume and a mount at `/data`.
                  Left: Pod Running, mount present.
                  Right: Pending, unbound claim. Return to the bind check.

trap:         Omit `storageClassName` on the claim while a default class
              exists. The claim is mutated to that class and never binds
              to your empty-class volume. Second: put the claim in
              `default`. Claims are namespaced.

docs:         https://kubernetes.io/docs/concepts/storage/persistent-volumes/
              https://kubernetes.io/docs/concepts/storage/persistent-volumes/#class-1
              https://kubernetes.io/docs/concepts/storage/storage-classes/#default-storageclass
              https://kubernetes.io/docs/concepts/storage/volumes/#hostpath

---

## Q06 — How is this control plane running  ·  6 points  ·  ~6 min  ·  unit u13

context:      Context `reef`. You may SSH to `reef-cp1` with
              `ssh reef-cp1`. File `/opt/course/6/control-plane.txt`
              exists and is a template:

                  kube-apiserver: <type>
                  kube-controller-manager: <type>
                  kube-scheduler: <type>
                  etcd: <type>
                  kubelet: <type>
                  dns: <type> <name>

              Allowed `<type>` values: `process`, `static-pod`, `pod`,
              `not-installed`. `<name>` is required only for `dns`.

task:         For kube-apiserver, kube-controller-manager, kube-scheduler,
              etcd, and kubelet, record how the component is started on
              `reef-cp1`. For dns, record how the cluster DNS add-on is
              deployed and give the name of its owning workload object.
              Use the line `dns: <type> <workload-name>`.

constraints:  - Do not change the kubelet systemd unit or any of its
                drop-ins, static Pod manifests, or any object in
                `kube-system`.
                Checkable: those objects match the pre-question snapshot.
                The kubelet unit fragment and drop-ins are recorded, by
                exact bytes and path, in the pre-question snapshot.
              - Use only the allowed type strings.

verify:       - (1 total) apiserver, controller-manager, scheduler, and
                etcd are all `static-pod`.
              - (1) kubelet is `process`.
              - (2) dns is `pod` and its name is `coredns`, case-insensitive.
              - (2) the protected `kube-system` objects, static Pod
                manifests, and kubelet systemd unit files match their
                snapshots.
              Partial credit as above. A correct file that also deletes
                a mirror Pod scores 0 on the last pair and keeps the
                classification points.

expected path: - SSH to `reef-cp1`. `ls /etc/kubernetes/manifests`
                  Left: `kube-apiserver.yaml`,
                  `kube-controller-manager.yaml`, `kube-scheduler.yaml`,
                  `etcd.yaml`. Those four are static Pods.
                  Right: the directory is empty. Then they are not
                  static Pods. Check units and `ps`. Do not guess.
               - `kubectl get pods -n kube-system`
                  Left: each control-plane Pod has a non-empty
                  `metadata.annotations["kubernetes.io/config.mirror"]`.
                  That confirms it is a mirror of a static Pod.
                  Right: the name has a node suffix but the annotation is
                  absent. The name alone proves nothing; inspect its
                  owner and the node manifest.
               - `kubectl get deploy,pods -n kube-system` and look for DNS.
                  Left: Deployment `coredns`. Type `pod`, name `coredns`.
                  Right: nothing. Type `not-installed`. Do not invent
                  a name.
               - `ps aux | grep kubelet` or `systemctl status kubelet`
                  Left: a kubelet process. Type `process`.
                  Right: a kubelet Pod in `kube-system`. Record `pod`.
               - Write the file. Do not restart anything.

trap:         `kubectl delete` a mirror Pod and record `not-installed`
              when it comes back. The manifest is still in
              `/etc/kubernetes/manifests`. Second: call CoreDNS a
              static Pod because it lives in `kube-system`. Third:
              `grep kubelet` matches apiserver command lines. Read the
              process owner.

docs:         https://kubernetes.io/docs/concepts/workloads/pods/static-pods/
              https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/
              https://kubernetes.io/docs/reference/setup-tools/kubeadm/implementation-details/
              https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/

---

## Q07 — Sweep every node  ·  8 points  ·  ~7 min  ·  unit u4

context:      Context `quarry`. Namespace `quarry`. Nodes: `quarry-cp1`,
              `quarry-w1`, `quarry-w2`. `quarry` has no DaemonSet yet.

task:         Create DaemonSet `sweep` in `quarry`. Image
              `httpd:2.4-alpine`. Pods must carry label `id=sweep`.
              Each container must request `10m` CPU and `10Mi` memory.
              A `sweep` Pod must be Running on every current Node.

constraints:  - Do not add, change, or delete taints or labels on any
                Node.
                Checkable: Node labels and taints match the snapshot.

verify:       - (2) DaemonSet `quarry/sweep` exists. Selector and pod
                template both include `id=sweep`. Image is
                `httpd:2.4-alpine`.
              - (2) Each template container requests `cpu=10m` and
                `memory=10Mi`.
              - (3) For every Node in the initial Node snapshot, exactly
                one Ready Pod directly controlled by DaemonSet
                `quarry/sweep` has `spec.nodeName` equal to that Node's
                name. No Node is missing, and the DaemonSet controls no
                second Ready Pod on a Node.
              - (1) Node labels and taints match the snapshot.
              Gate the Ready-count pair on the DaemonSet existing.
              Do not require a particular toleration key string if the
              Pods are nevertheless Running on every Node. A correct
              toleration for whatever taint `quarry-cp1` actually has
              is enough.

expected path: - `kubectl get nodes` and their taints.
                  Left: `quarry-cp1` has
                  `node-role.kubernetes.io/control-plane:NoSchedule`.
                  The DaemonSet controller automatically adds a defined
                  set of tolerations for not-ready, unreachable,
                  pressure, unschedulable, and, for host-network Pods,
                  network-unavailable taints. It does not add a
                  toleration for `node-role.kubernetes.io/control-plane:NoSchedule`.
                  Add a matching toleration to the Pod template.
                  Right: no control-plane taint. Skip the extra
                  toleration.
               - There is no `kubectl create daemonset`. Copy a
                 DaemonSet manifest. Set name, namespace, image, label,
                 requests, and the control-plane toleration.
               - Apply. `kubectl get ds,pods -n quarry -o wide`
                  Left: Desired = Current = 3. One Pod on `quarry-cp1`.
                  Right: Desired 2 on a 3-node cluster. The
                  control-plane taint is not tolerated.
                  Right: 0 Pods. Selector does not match template
                  labels.

trap:         Convert a Deployment, leave `replicas: 3`, and skip the
              toleration. You get two worker Pods and nothing on
              `quarry-cp1`. Second: believe DaemonSets already run on
              the control plane. The docs example includes that
              toleration as YAML you copy, not as a controller default.

docs:         https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/
              https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/
              https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/

---

## Q08 — Three copies, two workers  ·  8 points  ·  ~7 min  ·  unit u6

context:      Context `quarry`. Namespace `plaza`. Nodes: `quarry-cp1`,
              `quarry-w1`, `quarry-w2`.

task:         Create Deployment `spread` in `plaza` with 3 replicas.
              Image `nginx:1.27-alpine`. Pods must carry label
              `tier=edge`. At most one `spread` Pod may be Running on
              any given Node. No `spread` Pod may be Running on
              `quarry-cp1`. A replica that stays unscheduled is
              acceptable.

constraints:  - Do not add, change, or delete taints or labels on any
                Node.
              - Leave `spec.replicas` at 3.
                Checkable: Node snapshot, and
                `deploy/spread.spec.replicas==3`.

verify:       - (2) Deployment `plaza/spread` exists, `spec.replicas=3`,
                template label `tier=edge`, image `nginx:1.27-alpine`.
              - (3) Exactly two `spread` Pods are Running, on two
                different Nodes, and neither Node is `quarry-cp1`.
              - (2) The current ReplicaSet of Deployment `plaza/spread`
                directly owns a third Pod whose phase is Pending, whose
                `spec.nodeName` is empty, and whose `PodScheduled`
                condition is False with reason `Unschedulable`. A bound
                or container-failing Pod does not pass.
              - (1) Node labels and taints match the snapshot.
              Gate the placement pairs on `replicas==3`.
              Do not require a particular affinity field. Required
              inter-pod anti-affinity on `kubernetes.io/hostname` and
              topology spread with `maxSkew: 1` and
              `whenUnsatisfiable: DoNotSchedule` both pass if the end
              state matches.

expected path: - `kubectl get nodes` and taints.
                  Left: two schedulable workers, control-plane
                  `NoSchedule`. Ordinary Pods will not land on
                  `quarry-cp1`. You still need a hard one-per-node
                  rule or two replicas share a worker.
                  Right: control-plane untainted. Then also exclude
                  `quarry-cp1` with node affinity or a selector.
                  Do not add a control-plane toleration.
               - Create the Deployment at 3 replicas. Add a required
                 one-per-hostname rule on `tier=edge`. Apply.
               - `kubectl get deploy,pods -n plaza -o wide`
                  Left: 2/3. One Running Pod per worker. One Pending.
                  `describe` on the Pending Pod names the spread rule.
                  That Pending is the required end state.
                  Right: 3/3, one Pod on `quarry-cp1`. You tolerated
                  the control-plane taint.
                  Right: 3/3, two Pods on one worker. The rule is
                  missing, or it is preferred rather than required.
                  Right: you set `replicas: 2` to make Ready look
                  clean. That fails the replica check.

trap:         Copy a control-plane toleration from a DaemonSet example
              into this Deployment. The third Pod runs on `quarry-cp1`.
              Second: treat the Pending replica as a bug and delete it.

docs:         https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity
              https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/
              https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/
              https://kubernetes.io/docs/concepts/workloads/controllers/deployment/

---

## Q09 — Scheduler down, adrift-2 waits  ·  10 points  ·  ~10 min  ·  unit u6

context:      Context `inlet`. You may SSH to `inlet-cp1` with
              `ssh inlet-cp1`. Nodes: `inlet-cp1`, `inlet-w1`.
              Namespace `default`. The kube-scheduler static Pod is
              already stopped; its original manifest is stored outside
              `/etc/kubernetes/manifests`, at a stated path. The grader
              records the exact bytes of that stored original manifest
              before scoring. Pod `default/adrift-2` already exists from
              `httpd:2.4-alpine`, is Pending, and has an empty
              `spec.nodeName`.

task:         Restore cluster scheduling on `inlet-cp1` from the
              manifest stored outside `/etc/kubernetes/manifests`. Let
              the restored `default-scheduler` place the existing
              Pending Pod `adrift-2`. `adrift-2` must become Running.

constraints:  - Do not add, change, or delete taints or labels on any
                Node.
              - Before you finish, the scheduler must be Running again.
                Checkable: Node snapshot; a scheduler Pod is Running.

verify:       - (2) The scheduler static-pod manifest at
                `/etc/kubernetes/manifests/kube-scheduler.yaml` on
                `inlet-cp1` matches, byte for byte, the grader's
                pre-question snapshot of the stored original manifest at
                its external path.
              - (2) A `kube-scheduler-*` Pod in `kube-system` is Ready.
              - (1) `adrift-2` has exactly one regular container whose
                image is `httpd:2.4-alpine`.
              - (2) `adrift-2` is Running.
              - (2) `adrift-2` has a `Scheduled` event whose reporting
                component is `default-scheduler`.
              - (1) Node labels and taints match the snapshot.
              Gate the last three pairs on the scheduler manifest and
              Ready Pod checks. Do not require a particular restore
              command. Moving the manifest back by any means, or any
              other method that leaves the scheduler Running with the
              original manifest bytes, is fine if the six checks pass.

expected path: - SSH to `inlet-cp1`. Find `kube-scheduler.yaml` at the
                 stated path outside `/etc/kubernetes/manifests`.
                  Left: the file is there, untouched. Move it back into
                  `/etc/kubernetes/manifests`, not to a `*.bak` beside
                  it. The kubelet loads every non-dot file in that
                  directory.
                  Right: the file is missing or altered. Stop; the
                  fixture does not match the stated context.
               - `kubectl -n kube-system get pods | grep scheduler`
                  Left: a `kube-scheduler-*` Pod appears and becomes
                  Ready.
                  Right: no Pod appears. The manifest did not land in
                  the watched directory, or its filename or extension
                  is wrong.
               - `kubectl get pod adrift-2 -o wide`
                  Left: Running on a Node, with a `Scheduled` event
                  from `default-scheduler`.
                  Right: still Pending. The scheduler is not yet Ready,
                  or `adrift-2` has an unmet constraint; `describe` it.
                  Right: Running because you set `nodeName` yourself.
                  That path produces no `Scheduled` event from
                  `default-scheduler` and fails that check.

trap:         Set `spec.nodeName` on `adrift-2` directly instead of
              restoring the scheduler. The Pod runs but produces no
              `Scheduled` event from `default-scheduler`, and the
              manifest and Ready-Pod checks still fail. Second: `cp`
              the manifest to `kube-scheduler.yaml.bak` inside
              `manifests/`. Third: stay SSHed into `inlet-cp1` and run
              later questions against the wrong host.

docs:         https://kubernetes.io/docs/concepts/workloads/pods/static-pods/
              https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/
              https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/
              https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/
