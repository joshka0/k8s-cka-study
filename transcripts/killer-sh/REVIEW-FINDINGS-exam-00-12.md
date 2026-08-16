## Accuracy findings

[EXAM-DRAFT-00-12.md · Q01] ungradeable
  problem: `metrics.k8s.io` serving does not mean that it has a sample for every current Pod container. The v1.36 `kubectl top pod` reference says that metrics can be unavailable for several minutes after Pod creation. A correct `kubectl top pods -A --containers` script can therefore fail the requirement for one row per container.
  fix:     Replace the task sentence with: `Put a command in /opt/course/1/pod-usage.sh that prints current CPU and memory usage for every container sample returned by metrics.k8s.io, across every namespace.` Replace the second verify item with: `- (1) Running the file prints one row for every container sample in the live /apis/metrics.k8s.io/v1beta1/pods response, with its namespace, Pod, container, CPU usage, and memory usage. Do not require a row for a Pod or container that has no Metrics API sample.`

[EXAM-DRAFT-00-12.md · Q04] wrong
  problem: The verify note treats a manually created `Endpoints` object as a valid v1.36 route for this selector-bearing Service. It is not. EndpointSlice mirroring is deprecated, and the control plane does not mirror a user-created Endpoints object when the corresponding Service has a non-nil selector. EndpointSlices are the kube-proxy source of truth. The cited `service/#endpoints` section marks Endpoints deprecated and does not support this proposed route.
  fix:     Replace the note with: `A Ready Pod selected by the Service, or a manually managed EndpointSlice that makes lumen's existing readiness probe succeed, is enough. A manual EndpointSlice must use kubernetes.io/service-name=<service-name>, a non-reserved endpointslice.kubernetes.io/managed-by value, the correct address type and port, and a ready endpoint. Do not accept a manually created Endpoints object for this selector-bearing Service.` Replace the final docs URL with `https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/`.

[EXAM-DRAFT-00-12.md · Q05] ungradeable
  problem: The three scored items already total all 6 points. `StorageClass objects match the snapshot` has no points and is not a gate. A candidate can mutate or replace a StorageClass and still receive 6/6 under the written rubric.
  fix:     Add before the scored items: `Scoring precondition: every pre-existing StorageClass has the same name, metadata.uid, and spec as the snapshot. If this precondition fails, score 0 for the question.` Include each pre-existing StorageClass UID in the initial snapshot.

[EXAM-DRAFT-00-12.md · Q06] ungradeable
  problem: `(1) each of apiserver, controller-manager, scheduler, etcd` naturally awards 4 points. The remaining items award 5 more, so this 6-point question has a 9-point rubric.
  fix:     Replace the four bullets with: `- (1 total) apiserver, controller-manager, scheduler, and etcd are all static-pod. - (1) kubelet is process. - (2) dns is pod and its name is coredns, case-insensitive. - (2) the protected kube-system objects, static Pod manifests, and kubelet systemd unit files match their snapshots.`

[EXAM-DRAFT-00-12.md · Q06] ungradeable
  problem: The constraints freeze systemd units, but the verify block compares only `kube-system` objects and files under `/etc/kubernetes/manifests`. Changing the kubelet unit or a drop-in is not graded.
  fix:     Narrow the constraint to `Do not change the kubelet systemd unit or any of its drop-ins.` Before the question, snapshot the exact bytes and paths reported for the kubelet unit fragment and drop-ins. Add those bytes and paths to the final `(2)` equality check.

[EXAM-DRAFT-00-12.md · Q06] wrong
  problem: A `kube-<component>-reef-cp1` name does not prove that the API object is a mirror Pod. A normal Pod can use that name. The v1.36 static Pod documentation says to recognize a mirror Pod by its non-empty `kubernetes.io/config.mirror` annotation. The expected-path step cannot distinguish what it claims to distinguish.
  fix:     Replace that expected-path result with: `Left: each control-plane Pod has a non-empty metadata.annotations["kubernetes.io/config.mirror"]. That confirms it is a mirror of a static Pod. Right: the name has a node suffix but the annotation is absent. The name alone proves nothing; inspect its owner and the node manifest.`

[EXAM-DRAFT-00-12.md · Q07] wrong
  problem: `It only auto-tolerates node-condition taints` is false at v1.36. The DaemonSet controller also adds `node.kubernetes.io/unschedulable:NoSchedule`, which is not a node-condition taint. It still does not add the kubeadm control-plane taint, so the intended diagnosis is valid but the explanation is not.
  fix:     Replace those two sentences with: `The DaemonSet controller automatically adds a defined set of tolerations for not-ready, unreachable, pressure, unschedulable, and, for host-network Pods, network-unavailable taints. It does not add a toleration for node-role.kubernetes.io/control-plane:NoSchedule. Add a matching toleration to the Pod template.`

[EXAM-DRAFT-00-12.md · Q07] ungradeable
  problem: Counting Ready `sweep` Pods does not prove one Pod runs on every Node. A DaemonSet restricted to two Nodes plus an extra Ready `id=sweep` Pod on one of those Nodes can equal the Node count while leaving the third Node uncovered. This wrong end state receives the placement points.
  fix:     Replace the placement item with: `- (3) For every Node in the initial Node snapshot, exactly one Ready Pod directly controlled by DaemonSet quarry/sweep has spec.nodeName equal to that Node's name. No Node is missing, and the DaemonSet controls no second Ready Pod on a Node.`

[EXAM-DRAFT-00-12.md · Q08] ungradeable
  problem: `A third spread Pod exists and is not Running` does not prove that the placement rule left it unscheduled. A bound Pod that is Pending because of an image, volume, sandbox, or admission problem receives the same 2 points. That passes the wrong diagnosis.
  fix:     Replace that item with: `- (2) The current ReplicaSet of Deployment plaza/spread directly owns a third Pod whose phase is Pending, whose spec.nodeName is empty, and whose PodScheduled condition is False with reason Unschedulable. A bound or container-failing Pod does not pass.`

[EXAM-DRAFT-00-12.md · Q09] wrong
  problem: The expected path says to write `spec.nodeName` onto the already-created Pending Pod. A normal Pod update cannot change `spec.nodeName` at v1.36. The API validation allows only the listed narrow Pod-spec updates; `nodeName` is not one of them. The cited node-assignment page shows `nodeName` in a Pod at creation and does not support this update step.
  fix:     Replace that step with: `Bind the existing Pending Pod to inlet-cp1 through the Pod binding subresource using a core/v1 Binding whose target is Node inlet-cp1. If replacement is explicitly allowed instead, export the Pod, remove server-owned fields, set spec.nodeName, and recreate it; do not claim that an in-place Pod update works.` Add `https://kubernetes.io/docs/reference/kubernetes-api/definitions/binding-v1/` to `docs:`.

[EXAM-DRAFT-00-12.md · Q09] ungradeable
  problem: The grader cannot prove that the candidate stopped the scheduler or observed `adrift` while it was unbound. A candidate can leave the scheduler running, create `adrift` with `spec.nodeName: inlet-cp1` from the start, and create `adrift-2` normally. That skips the main task and receives every point.
  fix:     Make the history fixture state instead of a task: `Context: the kube-scheduler static Pod is already stopped; its original manifest is stored outside /etc/kubernetes/manifests at a stated path. Pod default/adrift already exists from httpd:2.4-alpine, is Pending, and has an empty spec.nodeName.` Then start the task with: `Bind the existing adrift Pod to inlet-cp1 without a control-plane toleration. Restore the scheduler from the supplied manifest. Create adrift-2 and let the restored scheduler place it.`

[EXAM-DRAFT-00-12.md · Q09] ungradeable
  problem: The verify block never checks the image of either Pod. Both Pods can use any image and still receive 10/10 if they reach the required placement and event states.
  fix:     Add: `Gate the adrift pair on adrift having exactly one regular container whose image is httpd:2.4-alpine. Gate the adrift-2 pair on adrift-2 having exactly one regular container whose image is httpd:2.4-alpine.`

## Question-quality findings

[EXAM-DRAFT-00-12.md · Q06] unsolvable
  problem: The task says every type must describe how the component is started `on reef-cp1`, but the expected DNS answer describes the cluster-wide CoreDNS workload even if no CoreDNS Pod runs on that node. `application name` is also undefined: `coredns`, the `kube-dns` Service, and the `k8s-app=kube-dns` label are all visible names.
  fix:     Replace the task detail with: `For kube-apiserver, kube-controller-manager, kube-scheduler, etcd, and kubelet, record how the component is started on reef-cp1. For dns, record how the cluster DNS add-on is deployed and give the name of its owning workload object. Use the line dns: <type> <workload-name>.`

[EXAM-DRAFT-00-12.md · Q09] duplicate
  problem: Q03 already tests the important `nodeName` behavior: it bypasses the scheduler and a `NoSchedule` control-plane taint. Q09 tests the same fact again, then adds static-Pod shutdown, historical observation, manual binding, restoration, and event provenance. Keep Q03 because it is a clean end-state question and accepts the legitimate selector-plus-toleration alternative.
  fix:     Refocus Q09 on scheduler recovery only: start with the scheduler manifest stored outside the manifest directory and `adrift-2` already Pending with an empty `spec.nodeName`; ask the candidate to restore the original manifest and make `adrift-2` Running through `default-scheduler`. Verify the restored manifest bytes, a Ready scheduler mirror Pod, `adrift-2` image `httpd:2.4-alpine`, its Running state, its `Scheduled` event from `default-scheduler`, and unchanged Node labels and taints. Remove `adrift` and all manual-placement steps.

ACCURACY: 12 findings
QUALITY: 2 findings
VERDICT: rework
