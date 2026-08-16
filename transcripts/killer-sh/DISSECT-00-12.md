# Dissection — killer.sh transcripts 00–12

Auto-captions mishear technical terms. Trust the docs where speech and Kubernetes disagree.

### q00 — Exam simulator login, not a cluster symptom

first instinct:   none. This transcript never reaches a cluster. Confirm you are
                  on the Linux Foundation exam-prep page for the CKA you bought.

path:             - Open My Training Portal → Certified Kubernetes Administrator.
                    Start / Resume → exam checklist.
                  - Left: if the name on the page is not your legal name, stop and
                    fix the LF profile. That string is what the certificate prints.
                    Right: continue.
                  - Click the exam-simulator link. You get a remote desktop:
                    question pane, terminal, Firefox.
                  - Left: you can open kubernetes.io in that Firefox tab.
                    Right: a second browser tab, or any other site, is out of
                    bounds.
                  - Each session lives 36 hours from activation. Log off and come
                    back inside that window. The session is not gone.
                  - Two sessions come with the exam. After that you buy more.

fix:              nothing in the cluster. This is access and UI only.

trap:             treat the simulator as the real exam clock. It is a 36-hour
                  lab. Also: start work before you switch to the context the
                  question names. Later questions fail silently on the wrong
                  cluster.

objects:          none
docs:             https://kubernetes.io/docs/reference/kubectl/generated/kubectl_config/kubectl_config_use-context/
                  https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/
unit:             GAP
test-worthy:      low — portal navigation. Reading the booking page once is
                  enough. Keep only the one-tab docs rule and the context switch
                  as exam hygiene.

---

### q01 — Write every kubeconfig context name, then a current-context command, then the same fact without kubectl

first instinct:   `kubectl config get-contexts`. Expect a table with CURRENT,
                  NAME, CLUSTER, AUTHINFO, NAMESPACE. Surprise: an empty list,
                  or more contexts than the question's cluster names.

path:             - `kubectl config current-context`
                    Left: it matches the context string in the question. Stay.
                    Right: it does not. `kubectl config use-context <given>`
                    first. Later writes land in the wrong cluster.
                  - `kubectl config get-contexts -o name`
                    Left: one name per line. That is what the file must hold.
                    Right: default table output. Do not dump CURRENT/CLUSTER
                    columns into the answer file.
                  - Redirect those names to the path the question names.
                    `cat` the file. Left: names only. Right: headers or extra
                    columns — redo with `-o name`.
                  - Second file: write the command itself, not its output.
                    `echo 'kubectl config current-context' > <script>`
                    Left: `sh <script>` prints the current context name.
                    Right: the file holds a context name and no command. The
                    grader runs the file.
                  - Third file: same fact, no kubectl. Open the kubeconfig
                    (`${KUBECONFIG:-$HOME/.kube/config}`).
                    Left: a `current-context:` key. Extract the value
                    (`grep`/`awk`/`sed`). Write that pipeline into the file.
                    Right: you used kubectl again. The question forbids it.

fix:              three files on disk. File 1 is data (context names). Files 2
                  and 3 are executable commands. Nothing in the API changes.

trap:             write the output of `current-context` into the script file.
                  The presenter almost did this, then prefixed `echo`. Second
                  trap: `awk` the default table and keep the `*` current-context
                  marker. Use `-o name`.

caption-error:    "cube cuddle" / "cubicle" / "Q cuddle" = kubectl. "set command"
                  = sed. "Keller shell" = killer.sh. "current config" = current-context.

objects:          kubeconfig `contexts[].name`, kubeconfig `current-context`
docs:             https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/
                  https://kubernetes.io/docs/reference/kubectl/generated/kubectl_config/kubectl_config_get-contexts/
                  https://kubernetes.io/docs/reference/kubectl/generated/kubectl_config/kubectl_config_current-context/
                  https://kubernetes.io/docs/reference/kubectl/quick-reference/
unit:             GAP
test-worthy:      low — documented kubectl config commands plus one grep. Real
                  exam work. It teaches nothing the kubeconfig page does not.

---

### q02 — Create pod1 on the control-plane node without labelling any node

first instinct:   `kubectl config current-context`, then `kubectl get nodes`.
                  Expect one control-plane node and one or more workers.
                  Surprise: you are on another cluster, or the control-plane
                  node has no `node-role.kubernetes.io/control-plane` label.

path:             - Confirm context. Wrong context wastes the rest of the path.
                  - `kubectl get nodes --show-labels`
                    Left: a node named like `cluster1-master1` with
                    `node-role.kubernetes.io/control-plane`. Copy that node
                    name. Do not `kubectl label` anything. The question forbids
                    new node labels.
                    Right: no control-plane label. Stop and re-read the node
                    list. Do not invent a label.
                  - `kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints`
                    Left: control-plane taint
                    `node-role.kubernetes.io/control-plane:NoSchedule`.
                    Scheduler placement needs a matching toleration.
                    `spec.nodeName` does not. That is the fork.
                    Right: no taint. Then `nodeSelector` on the existing role
                    label would also land the Pod.
                  - `kubectl run pod1 -n default --image=httpd:2.4.41-alpine \
                      --dry-run=client -o yaml > 2.yaml`
                    Edit `spec.containers[0].name` to `pod1-container`.
                    Set `spec.nodeName` to the control-plane node name.
                    Do not add `nodeSelector`. Do not add a toleration. Do not
                    add node labels.
                  - `kubectl apply -f 2.yaml`
                    Left: API accepts the object.
                    Right: AlreadyExists — delete only if it is your leftover.
                  - `kubectl get pod pod1 -o wide`
                    Left: Running on the control-plane node. Done.
                    Right: Pending. `kubectl describe pod pod1`.
                      - FailedScheduling + untolerated taint: you used
                        `nodeSelector`/`nodeAffinity` and the scheduler still
                        owns placement. Switch to `nodeName`, or add a
                        toleration without labelling the node.
                      - other FailedScheduling: image or resource. Not this
                        question.

fix:              write `spec.nodeName`. That bind skips the scheduler.
                  `NoSchedule` taints do not apply. A `NoExecute` taint would
                  still let the kubelet evict the Pod. kubeadm control-plane
                  taints are `NoSchedule`, so the Pod stays.
                  Alternative that also keeps the "no new labels" rule:
                  `nodeSelector` on the existing role label plus a matching
                  toleration. More YAML. Same result. `nodeName` is the smaller
                  change.

trap:             `nodeSelector: node-role.kubernetes.io/control-plane: ""`
                  without a toleration. The Pod stays Pending. Second trap:
                  `kubectl taint` or `kubectl label` the node to make the
                  selector work. The question forbids new labels. Third trap:
                  the presenter said "static pod", then corrected. This is an
                  ordinary API Pod with `nodeName` set. It is not a static Pod.

caption-error:    presenter speech, not the caption: "static pod" for a normal
                  Pod. The YAML is a v1 Pod submitted to the API.

objects:          Pod `spec.nodeName`, Pod `spec.containers[].name`,
                  Node `metadata.labels`, Node `spec.taints`
docs:             https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/
                  https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/
                  https://kubernetes.io/docs/reference/labels-annotations-taints/#node-role-kubernetes-io-control-plane-taint
unit:             u6
test-worthy:      high — the discriminating step is `nodeName` versus the
                  scheduler. Someone who only knows `nodeSelector` fails the
                  taint and then breaks the "do not label nodes" rule.

---

### q03 — Two o3db-* pods in project-c13; scale the workload to one replica

first instinct:   `kubectl get all -n project-c13`. Expect two pods `o3db-0`
                  and `o3db-1`. Surprise: a Deployment or ReplicaSet you can
                  `kubectl scale` by habit. There is none.

path:             - Switch to the given context.
                  - `kubectl get all -n project-c13`
                    Left: StatefulSet `o3db` with 2 replicas, pods `o3db-0`
                    and `o3db-1`, a matching Service. Scale the StatefulSet.
                    Right: a Deployment or ReplicaSet owns those pods. Scale
                    that owner instead. Do not delete a pod and call it scaled.
                  - `kubectl scale statefulset o3db -n project-c13 --replicas=1`
                    Left: `statefulset.apps/o3db scaled`.
                    Right: not found. You scaled the wrong kind.
                  - `kubectl get statefulset,pods -n project-c13`
                    Left: StatefulSet 1/1, only `o3db-0` remains.
                    Right: `o3db-1` comes back. You deleted the pod. The
                    StatefulSet still wants 2. Scale the owner.

fix:              `spec.replicas: 1` on the StatefulSet. The controller deletes
                  the highest ordinal (`o3db-1`) and keeps identity `o3db-0`.
                  Deleting the pod does not change desired replicas.
                  `kubectl scale deploy` fails because there is no Deployment.

trap:             treat `o3db-0` / `o3db-1` as a Deployment. Or delete `o3db-1`
                  and watch the controller recreate it. The ordinal names are
                  the hint that the owner is a StatefulSet.

objects:          StatefulSet `spec.replicas`, Pods `o3db-0` `o3db-1`, Service
docs:             https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/
                  https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#scaling-a-statefulset
unit:             u4
test-worthy:      medium — the command is `kubectl scale`. The wrinkle is
                  naming the owner. Ordinal pod names are the signal.

---

### q04 — Pod ready-if-service-ready stays 0/1 until a Service has an endpoint

first instinct:   `kubectl get pods,svc,endpoints -n default`. Expect no
                  ready-if-service-ready pod yet, and a Service
                  `service-am-i-ready` with no endpoints. Surprise: the first
                  pod already Running 1/1. Then the Service already has a
                  backend and the readiness story is gone.

path:             - Switch context. `kubectl get pods,svc,ep -n default`
                    Left: Service `service-am-i-ready` exists, endpoints none.
                    Continue.
                    Right: a leftover pod with the same name. Delete it first.
                  - Build `ready-if-service-ready` from
                    `kubectl run --dry-run=client -o yaml`.
                    Image `nginx:1.16.1-alpine`.
                    Liveness: exec `true` (always succeeds). That probe must
                    not restart the container.
                    Readiness: exec the wget the question gives, against the
                    existing Service name on port 80.
                    Apply. Do not expect this pod to become Ready yet.
                  - `kubectl get pod ready-if-service-ready`
                    Left: Running 0/1. That is the required state.
                    Right: Pending. The pod is not scheduled. That is a
                    different failure. `describe` and leave the probe path.
                    Right: Running 1/1 already. The Service already has an
                    endpoint, or the probe is not the one the question named.
                  - `kubectl describe pod ready-if-service-ready`
                    Left: event `Readiness probe failed` and a wget timeout
                    or connection error to the Service. Phase is Running.
                    `Ready` is False. Scheduled is True. Continue.
                    Right: presenter claim that the pod is "not scheduled".
                    Discard that. Running 0/1 is bound and started. Ready is
                    the bit that failed.
                  - `kubectl get endpoints service-am-i-ready -n default`
                    Left: `none`. The ClusterIP exists. There is no backend.
                    The first pod's wget cannot succeed.
                    Right: an address already. Find which pod owns it before
                    you create a second one.
                  - Create `am-i-ready` with image `nginx:1.16.1-alpine` and
                    the label the Service already selects (`id=cross-server-ready`
                    in this walkthrough). No extra probes.
                  - `kubectl get pod am-i-ready -o wide` and
                    `kubectl get endpoints service-am-i-ready`
                    Left: second pod Running 1/1, its IP is now the Service
                    endpoint on port 80.
                    Right: endpoints still none. The label does not match the
                    Service selector. `kubectl get svc service-am-i-ready -o yaml`
                    and fix the pod labels. Do not edit the existing Service
                    unless the question says to.
                  - `kubectl get pod ready-if-service-ready`
                    Left: 1/1. The readiness wget now hits a real backend.
                    Right: still 0/1 after the endpoint exists. Wait one probe
                    period, then `describe` again. If wget still fails, the
                    probe command or URL is wrong.

fix:              two writes. (1) First pod: liveness exec `true`, readiness
                  exec wget to the Service. The first pod is not a Service
                  backend. (2) Second pod: labels that match the existing
                  Service. EndpointSlice/Endpoints populate. kube-proxy has a
                  backend. The first pod's readiness flips.
                  Do not add the first pod to the Service. Do not delete the
                  Service. Do not change the first pod to 1/1 by removing the
                  readiness probe.

trap:             hear "not ready" as "not scheduled" and start debugging
                  the scheduler. The presenter said the probe failure means
                  the pod cannot be scheduled. That is false. Second trap:
                  put the Service-matching label on the first pod. Then the
                  first pod is 0/1, so it never becomes an endpoint, and its
                  own probe can never succeed. Third trap: HTTP readiness to
                  localhost:80 on the first pod. That would go Ready without
                  the second pod, and fail the question.

caption-error:    presenter, not only the caption: "it will not schedule the
                  pod" / "not able to schedule the pod even though it's
                  running". The pod is scheduled. Ready is false.

objects:          Pod `spec.containers[].livenessProbe.exec`,
                  Pod `spec.containers[].readinessProbe.exec`,
                  Pod `status.phase`, Pod `status.conditions[type=Ready]`,
                  Service `spec.selector`, Endpoints / EndpointSlice
docs:             https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
                  https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes
                  https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-conditions
                  https://kubernetes.io/docs/concepts/services-networking/service/
                  https://kubernetes.io/docs/concepts/services-networking/service/#endpoints
unit:             u7
test-worthy:      high — Ready is not Running, and the probe target is another
                  object's dataplane. Guessing `kubectl run` without the
                  endpoint step cannot finish the question.

---

### q05 — Write two kubectl get commands: all pods sorted by age, then by metadata.uid

first instinct:   `kubectl get pods -A`. Expect a list. Surprise: none. Then
                  the cluster is empty or you are on the wrong context.

path:             - Switch context.
                  - `kubectl get pods -A --sort-by=.metadata.creationTimestamp`
                    Left: oldest AGE at the top. That is sort by
                    `creationTimestamp`, which is what AGE is computed from.
                    Right: unsorted, or you sorted a column with
                    `--sort-by=.status.startTime`. Redo with
                    `.metadata.creationTimestamp`.
                  - Echo that exact command into the first file the question
                    names. The file holds the command, not the listing.
                  - `kubectl get pods -A --sort-by=.metadata.uid`
                    Left: the AGE column is no longer time-ordered. That is
                    evidence the sort key changed. You will not see `uid`
                    unless you add a custom column.
                    Right: you grepped or `sort`ed the table in the shell.
                    The question wants kubectl sorting for both commands.
                  - Echo the second command into the second file. `sh` both
                    files.

fix:              two command strings on disk. No API objects change.
                  `--sort-by` takes a JSONPath. Leading dot.
                  `-A` / `--all-namespaces` is required.

trap:             write the `get` output into the file. Same trap as q01.
                  Second trap: `sort`/`grep` instead of `--sort-by`. Third:
                  `--sort-by=AGE` or `--sort-by=metadata.creationTimestamp`
                  without the leading dot.

objects:          Pod `metadata.creationTimestamp`, Pod `metadata.uid`
docs:             https://kubernetes.io/docs/reference/kubectl/quick-reference/
                  https://kubernetes.io/docs/reference/kubectl/jsonpath/
unit:             GAP
test-worthy:      low — one documented flag, twice. Reading the kubectl
                  quick reference once is enough.

---

### q06 — Bind safari-pvc to a 2Gi hostPath PV, then mount it on Deployment safari

first instinct:   `kubectl get pv,pvc,sc`. Expect no `safari-pv`, no
                  `safari-pvc`. Surprise: a default StorageClass. That changes
                  how you must write `storageClassName` on the claim.

path:             - Switch context.
                  - `kubectl get pv,sc`
                    Left: no `safari-pv`. Note whether any StorageClass has
                    `storageclass.kubernetes.io/is-default-class=true`.
                    Right: `safari-pv` already exists with the wrong class or
                    size. Delete only your leftover.
                  - Create PV `safari-pv`:
                    `spec.capacity.storage: 2Gi`
                    `spec.accessModes: [ReadWriteOnce]`
                    `spec.hostPath.path: /Volumes/Data` (the path the question
                    gives; `path` is a string, not a list)
                    no `storageClassName`, or `storageClassName: ""`
                    Do not set `volumeMode` unless the question does.
                  - `kubectl apply -f` the PV.
                    Left: `STATUS=Available`.
                    Right: API reject on `hostPath`. You pasted `hostPath` as
                    a list. Fix to `hostPath.path`.
                  - `kubectl get sc`
                    Left: no default class. A PVC that omits
                    `storageClassName` can bind to this PV.
                    Right: a default class exists. A PVC that omits the field
                    is mutated to that class and will not bind to a PV with
                    empty class. Set `storageClassName: ""` on the PVC.
                  - Create PVC `safari-pvc` in `project-tiger`:
                    `spec.resources.requests.storage: 2Gi`
                    `spec.accessModes: [ReadWriteOnce]`
                    `storageClassName` empty string if a default class exists,
                    otherwise omit or empty. Must match the PV.
                  - `kubectl get pvc safari-pvc -n project-tiger`
                    Left: `Bound` to `safari-pv`.
                    Right: `Pending`. Diff the four bind fields: access mode,
                    size (PV >= request), `storageClassName` (including empty),
                    `volumeMode`. Fix the PVC. Do not create a second PV.
                  - Create Deployment `safari` in `project-tiger` with the
                    given image. Pod template:
                    `volumes[]` with `persistentVolumeClaim.claimName: safari-pvc`
                    `volumeMounts[]` at `/tmp/safari-data`.
                  - `kubectl get deploy,pods -n project-tiger` and
                    `kubectl describe pod -n project-tiger -l app=safari`
                    Left: pod Running, mount present.
                    Right: pod Pending, `unbound immediate PersistentVolumeClaim`.
                    The PVC is not Bound. Go back to the class/size/mode check.
                    Right: Running but no mount. The volume name in
                    `volumeMounts` does not match `volumes`.

fix:              three objects. The PV is static hostPath, not CSI. Binding
                  still uses the same contract: class, access mode, size,
                  volume mode. The Deployment only consumes the claim name.
                  Do not set a StorageClass on one side only.
                  Do not use `hostPath` on the Pod and skip the PVC. The
                  question asks for all three objects.

trap:             omit `storageClassName` on the PVC while a default class
                  exists. The claim sits Pending or binds to a dynamic volume,
                  not `safari-pv`. The presenter omitted the field and it
                  Bound — this exam cluster likely has no default class. Do
                  not copy that luck.
                  Second trap: `hostPath: - /Volumes/Data` (list). The field
                  is `path:`.
                  Third trap: create the PVC in `default`. PVC is namespaced.
                  The PV is not.

objects:          PersistentVolume `safari-pv` (`spec.capacity`,
                  `spec.accessModes`, `spec.hostPath.path`,
                  `spec.storageClassName`),
                  PersistentVolumeClaim `safari-pvc` (`spec.resources`,
                  `spec.accessModes`, `spec.storageClassName`,
                  `status.phase`),
                  Deployment `safari` (`volumes.persistentVolumeClaim`,
                  `volumeMounts`),
                  StorageClass default annotation
docs:             https://kubernetes.io/docs/concepts/storage/persistent-volumes/
                  https://kubernetes.io/docs/concepts/storage/persistent-volumes/#class-1
                  https://kubernetes.io/docs/concepts/storage/storage-classes/#default-storageclass
                  https://kubernetes.io/docs/concepts/storage/volumes/#hostpath
unit:             u10
test-worthy:      medium — three documented objects. The discriminating wrinkle
                  is empty `storageClassName` versus omit-when-default-exists.
                  hostPath itself is copy-from-docs.

---

### q07 — Metrics Server is installed; write kubectl top for nodes and for pods-with-containers

first instinct:   `kubectl top nodes`. Expect CPU and memory columns.
                  Surprise: `Metrics API not available`. Then Metrics Server
                  is not reachable and the question's premise is false.

path:             - Switch context.
                  - `kubectl top nodes`
                    Left: node name, CPU, CPU%, memory, memory%. Write
                    `kubectl top nodes` into the first file.
                    Right: Metrics API error. `kubectl get apiservice | grep metrics`
                    and `kubectl -n kube-system get deploy,pods | grep metrics`.
                    The question said it is installed. If it is down, that is
                    a different problem than this one-point write-the-command
                    item.
                  - `kubectl top pods --containers -A` (or `-n` if the
                    question scopes it)
                    Left: columns for pod, container, CPU, memory. Write
                    `kubectl top pods --containers` into the second file,
                    with the namespace flag the question asks for.
                    Right: you wrote `kubectl top pods` without
                    `--containers`. The question asked for container usage.
                  - `sh` both files.

fix:              two command strings on disk. `kubectl top` reads
                  `metrics.k8s.io`. It is not a monitoring product. Nothing
                  in the cluster changes.

trap:             `kubectl describe nodes` and scrape Allocated resources.
                  That is requests, not usage. Second trap: write the top
                  output into the file. Third: `--containers` on `top nodes`.
                  That flag is for pods.

objects:          metrics.k8s.io NodeMetrics, PodMetrics; Metrics Server
docs:             https://kubernetes.io/docs/reference/kubectl/generated/kubectl_top/
                  https://kubernetes.io/docs/reference/kubectl/generated/kubectl_top/kubectl_top_pod/
                  https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/
unit:             u22
test-worthy:      low — two documented commands. The course already teaches
                  that the Metrics API is not monitoring. This item only
                  asks you to type `top`.

---

### q08 — On the control-plane node, classify how apiserver, scheduler, controller-manager, etcd, kubelet, and DNS are installed

first instinct:   SSH to the given master. `kubectl get pods -n kube-system`.
                  Expect mirror pods named `<component>-<nodename>` for the
                  control plane, a CoreDNS Deployment, and no kubelet pod.
                  Surprise: kubelet as a pod, or etcd missing from
                  `/etc/kubernetes/manifests`. Then this is not a kubeadm
                  static-pod control plane.

path:             - Switch context. SSH with the command the question gives.
                  - `ls /etc/kubernetes/manifests`
                    Left: `kube-apiserver.yaml`, `kube-controller-manager.yaml`,
                    `kube-scheduler.yaml`, `etcd.yaml`. Those four are static
                    Pods. Record type `static pod`.
                    Right: empty directory. They are not static Pods on this
                    node. Check systemd units and `ps` next. Do not guess.
                  - `kubectl get pods -n kube-system -o wide`
                    Left: names `etcd-<node>`, `kube-apiserver-<node>`,
                    `kube-controller-manager-<node>`, `kube-scheduler-<node>`.
                    The node-name suffix is the mirror-pod name. Confirms
                    static Pods. Deleting those objects does nothing durable.
                    Right: names without the node suffix, owned by a
                    Deployment/DaemonSet. Type is `pod`, not `static pod`.
                  - `kubectl get all -n kube-system | grep -i dns`
                    Left: Deployment `coredns`, pods `coredns-*`. Type `pod`,
                    name `coredns`. Not a static Pod. Not a process on the
                    master.
                    Right: no DNS objects. Type `not installed`, or look for
                    kube-dns. Do not invent CoreDNS.
                  - `ps aux | grep kubelet` (and `systemctl status kubelet`
                    if you need the unit)
                    Left: a kubelet process, often with
                    `--config=/var/lib/kubelet/config.yaml`. Type `process`.
                    Right: a kubelet pod in kube-system. Unusual here. Record
                    what you see, not the habit.
                  - Write the file in the template the question gives. Allowed
                    types only: not installed | process | static pod | pod.

fix:              one findings file. Do not change manifests. Do not restart
                  kubelet. Observation only.

trap:             `kubectl delete pod kube-scheduler-<node>` and record
                  "process" or "not installed" when it comes back. That is a
                  mirror Pod. The static manifest is still in
                  `/etc/kubernetes/manifests`.
                  Second trap: call CoreDNS a static Pod because it lives in
                  kube-system. It is a Deployment.
                  Third trap: `grep kubelet` matches apiserver command lines
                  that mention kubelet flags. Read the process owner. The
                  presenter hit this and had to pick the real kubelet line.

caption-error:    "qvp server" / "qbaby" / "Cube API" = kube-apiserver.
                  "hcd" / "ha" = etcd. "coordinates" = CoreDNS.
                  "static port" / "static Port" / "static path" = static Pod.
                  "Plus or IB" = ClusterIP. "cube control wolf manager" =
                  kube-controller-manager.

objects:          static Pod manifests under `/etc/kubernetes/manifests`,
                  mirror Pods in kube-system, Deployment `coredns`,
                  kubelet process / systemd unit
docs:             https://kubernetes.io/docs/concepts/workloads/pods/static-pods/
                  https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/
                  https://kubernetes.io/docs/reference/setup-tools/kubeadm/implementation-details/
                  https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/
unit:             u13
test-worthy:      medium — the commands are inventory. The wrinkle is the
                  three install types. Missing the node-name suffix or the
                  kubelet process is a real miss.

---

### q09 — Scheduler stopped; create an unscheduled pod; you bind it; scheduler returns; a second pod schedules

first instinct:   SSH to `cluster2-master1`. `ls /etc/kubernetes/manifests`.
                  Expect `kube-scheduler.yaml`. Surprise: the file is already
                  gone, or the scheduler is a systemd unit. Then the stop
                  method changes.

path:             - Switch context. SSH. Stay on this node until the stop and
                  restore are done. Then `exit` before you work other
                  questions.
                  - `kubectl -n kube-system get pod -l component=kube-scheduler`
                    Left: one Running pod named `kube-scheduler-<node>`.
                    Right: already gone. Someone else moved the file. Check
                    `/etc/kubernetes/manifests` and `/etc/kubernetes/` for
                    the yaml before you create anything.
                  - `mv /etc/kubernetes/manifests/kube-scheduler.yaml /etc/kubernetes/`
                    Do not `kubectl delete` the mirror pod. Do not `kill` the
                    container. The kubelet recreates any file that remains in
                    the manifests directory, including `*.yaml.backup`.
                  - `kubectl -n kube-system get pod | grep scheduler`
                    Left: the scheduler pod disappears. Continue.
                    Right: it is still Running. The file is still in
                    `manifests/`, or you moved a copy and left the original.
                  - From the exam jump host (kubectl, not only the node):
                    `kubectl run manual-schedule --image=httpd:2.4-alpine`
                    Do not set `nodeName` yet.
                  - `kubectl get pod manual-schedule -o wide`
                    Left: Pending, `NODE` empty. `describe` shows no
                    FailedScheduling from a filter. There is no scheduler.
                    Right: Running. The scheduler is still up. Do not bind
                    anything until Pending is proven.
                  - You are the scheduler. Patch the existing object:
                    `kubectl patch pod manual-schedule --type=merge \
                      -p '{"spec":{"nodeName":"cluster2-master1"}}'`
                    or `kubectl edit` and set `spec.nodeName`.
                    Do not restore the scheduler to place this pod.
                  - `kubectl get pod manual-schedule -o wide`
                    Left: Running on `cluster2-master1`. `nodeName` bypasses
                    the scheduler and the control-plane `NoSchedule` taint.
                    Right: still Pending. The patch did not stick, or you
                    created a new pod instead of editing this one.
                    Right: you moved the manifest back and the scheduler
                    bound it. That is not "you are the scheduler". Undo and
                    bind with `nodeName` while the scheduler is still down
                    if the grader checks the event trail. If the pod is
                    already Running because you restored early, you cannot
                    honestly show a manual bind. Recreate only if the
                    question still allows it.
                  - `mv /etc/kubernetes/kube-scheduler.yaml /etc/kubernetes/manifests/`
                    Wait until the scheduler mirror pod is Running.
                  - `kubectl run manual-schedule2 --image=httpd:2.4-alpine`
                    Do not set `nodeName` on this one. The live scheduler
                    must place it.
                  - `kubectl get pod manual-schedule2 -o wide`
                    Left: Running on a worker (`cluster2-worker1` if that is
                    what the question asks you to check). Scheduler is back.
                    Right: Pending. Scheduler file is not in `manifests/`,
                    or the pod has a nodeSelector that nothing matches.
                    Right: you set `nodeName: cluster2-worker1` on pod 2.
                    That proves nothing about the scheduler.

fix:              move the static manifest out, then back. That is how you
                  stop and start a kubeadm scheduler. Bind pod 1 by writing
                  `spec.nodeName` while the scheduler is down. Let the
                  restored scheduler bind pod 2.
                  Killing the scheduler container does not stop it.
                  Deleting the mirror pod does not stop it.

trap:             this is the trap the presenter walked. After Pending, they
                  restored the scheduler so it would schedule `manual-schedule`,
                  then forced `manual-schedule2` onto the worker with
                  `nodeName`. That inverts the question. "You are the
                  scheduler" means you write the bind. The second pod is the
                  proof the real scheduler is alive, so it must not have
                  `nodeName`.
                  Second trap: `cp` the manifest to `kube-scheduler.yaml.bak`
                  inside `manifests/`. The kubelet loads every non-dot file.
                  Third trap: stay SSHed into the node and run the next
                  question's kubectl against the wrong host.

caption-error:    "cluster T Dash Master one" = cluster2-master1.
                  "cluster 2 Dash worker one" = cluster2-worker1.
                  "httpd colon 2.4 Alpine" = httpd:2.4-alpine.

objects:          static Pod manifest `kube-scheduler.yaml`,
                  mirror Pod `kube-scheduler-<node>`,
                  Pod `manual-schedule` `spec.nodeName`,
                  Pod `manual-schedule2` (no nodeName)
docs:             https://kubernetes.io/docs/concepts/workloads/pods/static-pods/
                  https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/
                  https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/
                  https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/
unit:             u6
test-worthy:      high — two mechanisms, and the presenter failed the second.
                  Static-pod desired state is a file. Binding without a
                  scheduler is `nodeName`. One of those is not enough.

---

### q10 — ServiceAccount processor may create secrets and configmaps in project-hamster, and nothing else

first instinct:   `kubectl get sa,role,rolebinding -n project-hamster`.
                  Expect no `processor` objects. Surprise: a Role that already
                  uses those names. Then `create` fails and you must edit.

path:             - Switch context.
                  - `kubectl get sa processor -n project-hamster`
                    Left: not found. `kubectl create sa processor -n project-hamster`.
                    Right: exists. Reuse it. Do not create a second account.
                  - `kubectl api-resources | egrep 'secrets|configmaps'`
                    Left: resource names `secrets` and `configmaps`. Use those
                    in `--resource`.
                    Right: you guessed `secret,configmap` and the API rejected
                    the Role. Fix the names. Both singular and plural often
                    work; confirm before you create.
                  - `kubectl create role processor -n project-hamster \
                      --verb=create --resource=secrets,configmaps`
                    Left: Role created. `kubectl describe role processor -n project-hamster`
                    shows verbs `create` only, resources secrets and configmaps.
                    Right: you added `get,list`. The question says only create.
                    Delete and recreate the Role. `roleRef` is not the problem
                    yet.
                  - `kubectl create rolebinding processor -n project-hamster \
                      --role=processor \
                      --serviceaccount=project-hamster:processor`
                    The `--serviceaccount` value is `namespace:name`, not
                    the SA name alone.
                    Left: binding created. `describe` shows subject
                    ServiceAccount `processor` in `project-hamster`, roleRef
                    Role `processor`.
                    Right: you bound a ClusterRole, or a User, or omitted the
                    namespace in `--serviceaccount`. Recreate the RoleBinding.
                    You cannot change `roleRef` in place.
                  - `kubectl auth can-i create secrets \
                      --as=system:serviceaccount:project-hamster:processor \
                      -n project-hamster`
                    Left: `yes`. Repeat for `configmaps`. Also `yes`.
                    Right: `no`. You forgot `-n project-hamster` on `can-i`.
                    The presenter did this. Impersonation still needs the
                    namespace of the request.
                  - Negative checks (same `--as`):
                    `can-i create secrets -n default` → `no`
                    `can-i get secrets -n project-hamster` → `no`
                    `can-i create pods -n project-hamster` → `no`
                    Left: all `no`. Scope and verbs are tight.
                    Right: `yes` in `default`. You created a ClusterRoleBinding.

fix:              three namespaced objects in `project-hamster`: ServiceAccount,
                  Role (verb `create`, resources secrets and configmaps),
                  RoleBinding of that Role to that ServiceAccount.
                  A ClusterRole plus RoleBinding would also authorise the
                  namespace, but the question asks for a Role. Do not use
                  ClusterRoleBinding. That would leak create into every
                  namespace.

trap:             `--serviceaccount=processor` without `project-hamster:`.
                  The binding subject is wrong.
                  Second trap: `can-i` without `-n`. You get `no` and rewrite
                  a correct Role.
                  Third trap: Role verb `*` or resource `*`. The question is
                  only create on two kinds.

caption-error:    "role winding" / "roll pointing" = RoleBinding.
                  "project Dash hamster" / "project dance hamster" =
                  project-hamster. "kit essay" = kubectl get sa.

objects:          ServiceAccount `processor`,
                  Role `processor` (`rules[].verbs`, `rules[].resources`),
                  RoleBinding `processor` (`subjects`, `roleRef`)
docs:             https://kubernetes.io/docs/reference/access-authn-authz/rbac/
                  https://kubernetes.io/docs/concepts/security/service-accounts/
                  https://kubernetes.io/docs/reference/kubectl/generated/kubectl_create/kubectl_create_role/
                  https://kubernetes.io/docs/reference/kubectl/generated/kubectl_create/kubectl_create_rolebinding/
                  https://kubernetes.io/docs/reference/kubectl/generated/kubectl_auth/kubectl_auth_can-i/
unit:             u21
test-worthy:      medium — three `kubectl create` commands. The wrinkle is
                  SA subject syntax and `can-i` namespace scope.

---

### q11 — DaemonSet ds-important on every node, including the control plane

first instinct:   `kubectl get nodes,ds -n project-tiger`. Expect three nodes
                  (one control-plane, two workers) and no `ds-important`.
                  Surprise: `kubectl create daemonset` works. It does not.
                  There is no such create helper.

path:             - Switch context. `kubectl get nodes`
                    Left: control-plane plus workers. Desired DaemonSet count
                    equals node count if you tolerate the control-plane taint.
                    Right: control-plane untainted. Then a DaemonSet without
                    an extra toleration still covers every node.
                  - `kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints`
                    Left: `node-role.kubernetes.io/control-plane:NoSchedule`.
                    You must add that toleration on the pod template. The
                    DaemonSet controller does not add it for you. It only
                    auto-tolerates node-condition taints (not-ready,
                    unreachable, disk/memory/pid-pressure, unschedulable).
                    Right: no control-plane taint. Skip the extra toleration.
                  - There is no `kubectl create daemonset`. Copy the DaemonSet
                    manifest from the docs. Do not convert a Deployment and
                    forget `updateStrategy` / selector hygiene unless you
                    know the fields.
                  - Set: name `ds-important`, namespace `project-tiger`,
                    image `httpd:2.4-alpine`,
                    labels `id=ds-important` and `uuid=<random>` on the
                    DaemonSet, the selector, and the pod template. They must
                    match.
                    `resources.requests.cpu: 10m`,
                    `resources.requests.memory: 10Mi`.
                    No limits unless asked.
                    Toleration:
                    `key: node-role.kubernetes.io/control-plane`
                    `operator: Exists`
                    `effect: NoSchedule`
                    (older clusters also taint `node-role.kubernetes.io/master`;
                    tolerate what `get nodes` showed).
                  - `kubectl apply -f`. Then `kubectl get ds,pods -n project-tiger -o wide`
                    Left: Desired = Current = number of nodes. One pod on the
                    control-plane node, one on each worker.
                    Right: Desired is 2 on a 3-node cluster. The control-plane
                    taint is not tolerated. Add the toleration.
                    Right: 0 pods. Selector does not match template labels.

fix:              a DaemonSet, not a Deployment with replicas=3. Count is
                  derived from eligible nodes. Eligibility includes taints.
                  Add the control-plane toleration. Do not set `spec.replicas`.
                  Do not `kubectl taint` the control-plane node to make the
                  pods land.

trap:             convert `kubectl create deployment` and change `kind`. You
                  leave `replicas` and miss the toleration. Two worker pods,
                  none on the master, and the question said all nodes.
                  Second trap: believe DaemonSets already run on the
                  control plane. Auto-tolerations do not include that taint.
                  The docs example includes it as YAML you copy, not as a
                  controller default.
                  Third trap: set `uuid` on the DaemonSet object only, not on
                  the pod template / selector.

objects:          DaemonSet `ds-important` (`spec.selector`,
                  `spec.template.metadata.labels`,
                  `spec.template.spec.tolerations`,
                  `spec.template.spec.containers[].resources.requests`),
                  Node taints
docs:             https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/
                  https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/
                  https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
unit:             u4
test-worthy:      high — picking DaemonSet is the invariant, and the
                  control-plane taint is the discriminating check. A
                  Deployment with replicas equal to node count is the miss.

---

### q12 — Three-replica Deployment, one pod per worker, third replica stays Pending

first instinct:   `kubectl get nodes,deploy -n project-tiger`. Expect two
                  workers, one tainted control-plane, no
                  `deploy-important`. Surprise: the control-plane is
                  untainted. Then anti-affinity alone puts a replica on the
                  master and all three go Running.

path:             - Switch context. `kubectl get nodes` and taints.
                    Left: two schedulable workers, control-plane
                    `NoSchedule`. Ordinary pods will not land on the master.
                    You still need anti-affinity or you get two pods on one
                    worker.
                    Right: control-plane untainted. Add a node selector /
                    affinity that excludes it. Do not add a control-plane
                    toleration.
                  - `kubectl create deployment deploy-important \
                      -n project-tiger --image=nginx:1.17.6-alpine \
                      --replicas=3 --dry-run=client -o yaml > 12.yaml`
                  - Edit the pod template:
                    two containers: `container1` image `nginx:1.17.6-alpine`,
                    `container2` image `registry.k8s.io/pause` (the image the
                    question names).
                    labels `id: very-important` on the Deployment, the
                    selector, and the pod template. Remove the default
                    `app=` label from all three or keep it consistent.
                    `affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution`
                    with `labelSelector` matching `id=very-important` and
                    `topologyKey: kubernetes.io/hostname`.
                  - Apply. `kubectl get deploy,pods -n project-tiger -o wide`
                    Left: Deployment 2/3. Two pods Running, one on each
                    worker. One pod Pending. `describe` on the Pending pod
                    shows anti-affinity / no more nodes. That Pending is
                    success.
                    Right: 3/3, one pod on the control-plane. You added a
                    control-plane toleration (DaemonSet habit) or the master
                    is not tainted. Remove the toleration or exclude the
                    master with node affinity.
                    Right: 3/3, two pods on one worker. Anti-affinity is
                    missing, preferred instead of required, or the
                    `labelSelector` does not match the pod labels.
                    Right: 0/3 or 1/3 all Pending. Selector/template label
                    mismatch, or required anti-affinity that cannot place
                    even the first pod.

fix:              a Deployment, not a DaemonSet. Desired count stays 3.
                  Hard inter-pod anti-affinity on hostname gives at most one
                  pod per node. The control-plane taint keeps ordinary pods
                  off the master, so the third replica has nowhere to go.
                  Do not lower `replicas` to 2 to make Ready look clean.

trap:              copy the DaemonSet toleration from q11 into this
                  Deployment. The third pod runs on the master and you fail
                  the "only on workers" rule.
                  Second trap: treat the Pending replica as a bug and delete
                  it, or set replicas=2.
                  Third trap: `preferredDuringSchedulingIgnoredDuringExecution`.
                  The scheduler may still pack two pods on one worker.

objects:          Deployment `deploy-important` (`spec.replicas`,
                  `spec.selector`, `spec.template.metadata.labels`,
                  `spec.template.spec.affinity.podAntiAffinity`,
                  two containers),
                  Node taints, Node label `kubernetes.io/hostname`
docs:             https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity
                  https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/
                  https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
unit:             u6
test-worthy:      high — Pending is the correct end state. Anti-affinity plus
                  the control-plane taint is the mechanism. Someone who only
                  sets replicas=3 cannot produce it.
