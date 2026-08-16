# Exam questions — differential-diagnosis variants of the core symptom set

Same symptoms as the existing bank, different root causes. A candidate who
memorised the original answer takes the wrong turn here and must diagnose.
Baseline Kubernetes v1.36. Every message string below is quoted from the
release-1.36 sources.

| Q   | unit | symptom                          | actual cause                              | pts |
|-----|------|----------------------------------|-------------------------------------------|-----|
| V01 | u6   | Pod stays Pending                | no Node has enough allocatable CPU        |  6  |
| V02 | u10  | Pod stays Pending                | PVC names a StorageClass that is absent   |  8  |
| V03 | u8   | Service answers nothing          | targetPort misses the container port      |  6  |
| V04 | u25  | Service answers nothing          | client-side NetworkPolicy denies egress   |  8  |
| V05 | u20  | Node NotReady                    | the container runtime is stopped          |  8  |
| V06 | u14  | Workload never becomes Ready     | ConfigMap key in the env ref is absent    |  6  |
| V07 | u9   | No Pod resolves cluster names    | the CoreDNS Deployment is scaled to zero  |  6  |

---

## V01 — press will not start  ·  6 points  ·  ~7 min  ·  unit u6

topic:        Why is it still Pending

context:      Context `mesa`. The control plane is managed, so the only
              Node objects are the three workers `mesa-w1`, `mesa-w2`,
              and `mesa-w3`. No Node carries a taint. Each Node reports
              4 CPU allocatable, and existing Pods already request about
              half of that on every Node. Namespace `mill` holds
              Deployment `press` (1 replica, image `nginx:1.27-alpine`)
              and Deployment `hopper`, which is Available. The single
              `press` Pod has been Pending since it was created.

task:         Make Deployment `press` in `mill` Available with one ready
              replica. Its Pod must be placed by `default-scheduler`.
              Keep the name, the image, and one replica.

constraints:  - Do not add, change, or delete Node labels or taints.
                Checkable: Node labels and taints match the snapshot.
              - Do not set `spec.nodeName` in the pod template.
                Checkable: the template field is empty, and the Pod has
                a `Scheduled` event from `default-scheduler`.
              - Do not delete, scale, or change Deployment `hopper` or
                any other workload in `mill`.
                Checkable: those objects match the snapshot.
              - The container must keep a declared request for both CPU
                and memory.
                Checkable: `requests.cpu` and `requests.memory` are both
                present and nonzero.

verify:       Snapshot Node labels and taints, every other workload in
              `mill`, and `press.metadata.uid` before scoring.
              - (2) Deployment `mill/press` has the snapshot uid, image
                `nginx:1.27-alpine`, `spec.replicas` 1, and 1 ready and
                1 available replica.
              - (2) Its Pod is Running on a Node, `spec.nodeName` is
                unset in the pod template, and the Pod has a `Scheduled`
                event whose reporting component is `default-scheduler`.
              - (2) The container's `requests.cpu` and `requests.memory`
                are both present and nonzero. Node labels and taints,
                and every other workload in `mill`, match the snapshot.
              Gate the last four points on the uid pair.
              Two routes score. Lower `requests.cpu` to a value that
              fits the free allocatable CPU on one Node. Or lower it and
              set an equal limit, which also makes the Pod Guaranteed.
              Both end with a Running Pod and a nonzero CPU request.
              Deleting the requests block scores 0 on the last pair. The
              Pod runs, but it now requests nothing.
              A toleration, a `nodeSelector`, or node affinity scores 0
              on the first two pairs: the Pod is still Pending.
              `spec.nodeName: mesa-w1` scores 0 on the second pair. It
              has no `Scheduled` event, and the kubelet rejects the Pod
              for `OutOfcpu` because the Node cannot fit it either.
              Deleting `hopper` to free CPU fails the last pair.

expected path: - `kubectl get pods -n mill -o wide`
                  Left: one Pending Pod, `NODE` empty. Continue.
                  Right: the Pod is Running. Nothing to do; re-read.
               - `kubectl describe pod -n mill <pending-pod>`
                  Left: `Warning  FailedScheduling` from
                  `default-scheduler`, message
                  `0/3 nodes are available: 3 Insufficient cpu.` Every
                  Node was filtered for the same resource reason. That
                  is a capacity answer, not a placement answer.
                  Right: the census names an untolerated taint or an
                  unmatched node selector. That is the original Pending
                  question, and a toleration would be the fix. It does
                  not say that here.
                  Right: the census names an unbound claim. That is
                  V02, not this question.
               - Search `pod stays pending`.
                  Left: Debug Pods. A Pending Pod that no Node can hold
                  is a resource problem: compare the Pod's requests with
                  each Node's `allocatable`.
                  Right: the taints and tolerations page. It explains a
                  reason the census did not report.
               - `kubectl describe node mesa-w1` and read
                 `Allocatable` and `Allocated resources`.
                  Left: 4 CPU allocatable, about half already requested.
                  The `press` request is larger than what is free on
                  every Node. Lower it.
                  Right: the Node reports plenty free. Then re-read the
                  Pod's request; a `6` is six whole CPUs, and a `6m` is
                  six thousandths of one.
               - Patch the container's `requests.cpu` down and wait.
                  Left: Available 1/1; `describe` shows `Scheduled` from
                  `default-scheduler`.
                  Right: still Pending with the same census. Your value
                  is still bigger than the free allocatable CPU.

trap:         Reaches for a toleration or node affinity, because the
              original Pending question was an untolerated control-plane
              taint. Nothing here is tainted, so the edit changes
              nothing and the Pod stays Pending. Second: forces the Pod
              with `spec.nodeName`, which skips the scheduler and gets
              the Pod rejected by the kubelet with `OutOfcpu`. Third:
              deletes `hopper` to make room. Fourth: strips the requests
              block entirely, which schedules the Pod and gives it no
              share of the Node.

docs-path:    Search `pod stays pending`.
              Page: Debug Pods
              https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/
              Section: My pod stays pending.
              Capacity reference: Node Status → Capacity and Allocatable
              https://kubernetes.io/docs/concepts/architecture/nodes/#node-status

docs:         https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/
              https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
              https://kubernetes.io/docs/concepts/architecture/nodes/#node-status
              https://kubernetes.io/docs/tasks/administer-cluster/reserve-compute-resources/

---

## V02 — ledger will not start  ·  8 points  ·  ~9 min  ·  unit u10

topic:        Four reasons, four checks

context:      Context `mesa`. Namespace `archive`. Pod `ledger` (image
              `nginx:1.27-alpine`) mounts PersistentVolumeClaim
              `ledger-data` at `/var/lib/ledger`. `ledger` has been
              Pending since it was created. The cluster has one
              StorageClass, `standard-rwo`. It is the default class, it
              provisions dynamically, and its `volumeBindingMode` is
              `WaitForFirstConsumer`. No Node carries a taint. Every
              Node has free allocatable CPU and memory.

task:         Make Pod `archive/ledger` Running. It must keep the name
              `ledger`, keep the image `nginx:1.27-alpine`, and mount a
              claim named `ledger-data` at `/var/lib/ledger`, and that
              claim must be Bound to at least 2Gi of ReadWriteOnce
              storage.

constraints:  - `archive` must end with exactly one Pod, named
                `ledger`, running one container on
                `nginx:1.27-alpine`.
                Checkable: the Pod list in `archive`, and the Pod's
                container image.
              - `ledger` must mount `ledger-data` at
                `/var/lib/ledger`.
                Checkable: the Pod's volume and volume mount.
              - Do not create, change, or delete any StorageClass.
                Checkable: the StorageClass list and specs match the
                snapshot.
              - `archive` must end with exactly one PersistentVolumeClaim.
                Checkable: the claim list in `archive` is exactly
                `ledger-data`.

verify:       Snapshot `ledger`'s container image, its volume and
              volume mount, and the StorageClass list before scoring.
              - (2) `archive` holds exactly one Pod, named `ledger`. It
                is Running on a Node, runs one container on
                `nginx:1.27-alpine`, and mounts PersistentVolumeClaim
                `ledger-data` at `/var/lib/ledger`.
              - (3) `archive/ledger-data` is the only claim in
                `archive`. Its phase is `Bound`, its access mode is
                ReadWriteOnce, and its bound PersistentVolume is at
                least 2Gi.
              - (3) The StorageClass list and specs match the snapshot.
                `kubectl exec ledger -n archive -- touch
                /var/lib/ledger/probe` succeeds.
              Gate the storage pairs on the Pod Running.
              Two routes score. Replace the claim with one that names
              the existing class `standard-rwo`, which provisions the
              volume dynamically. Or create a 2Gi ReadWriteOnce
              PersistentVolume yourself and replace the claim with one
              that has `storageClassName: ""` and binds to it. Both end
              Bound, and both leave the class list untouched.
              Both routes need Pod `ledger` deleted first. A claim in
              active use by a Pod object — a Pending Pod counts — is
              held by the `kubernetes.io/pvc-protection` finalizer and
              stays `Terminating` until no Pod uses it. Re-creating
              `ledger` afterwards with the same name, image, and mount
              scores; the grader reads the end state, not the uid.
              Creating a StorageClass with the name the claim already
              uses fails the last triple. It binds the volume and keeps
              the typo as cluster configuration.
              A second claim, such as `ledger-data-2`, fails the middle
              triple even when it is Bound: `ledger` still mounts
              `ledger-data`.
              Editing the Pod to add a toleration, a `nodeSelector`, or
              node affinity fails the first pair. It is still Pending.
              A `ledger` that starts without the volume, or that mounts
              it anywhere but `/var/lib/ledger`, fails the first pair.
              A second Pod left in `archive` fails the first pair too.
              A Bound claim with a Pending Pod scores 0 on every pair.

expected path: - `kubectl describe pod ledger -n archive`
                  Left: `Warning  FailedScheduling`, message
                  `0/3 nodes are available: pod has unbound immediate
                  PersistentVolumeClaims.` The scheduler stopped before
                  it looked at any Node. This is a volume answer, not a
                  placement answer.
                  Right: the census reads `3 Insufficient cpu.` That is
                  V01. Right: it names an untolerated taint. That is the
                  original Pending question.
               - `kubectl get pvc -n archive`
                  Left: `ledger-data` is `Pending`, and its
                  `STORAGECLASS` column names a class you do not
                  recognise. Continue.
                  Right: the claim is `Bound`. Then the Pod is Pending
                  for another reason; go back to the census.
               - `kubectl describe pvc ledger-data -n archive`
                  Left: `Warning  ProvisioningFailed` from
                  `persistentvolume-controller`, message
                  `storageclass.storage.k8s.io "standrd-rwo" not
                  found`. Nothing provisions this claim, because the
                  class it asks for is not an object in this cluster.
                  Right: `Normal  WaitForFirstConsumer  waiting for
                  first consumer to be created before binding`. That is
                  a healthy delayed-binding claim, not this fault.
               - `kubectl get storageclass`
                  Left: one class, `standard-rwo`. The claim's class
                  name differs by one character. Compare the two
                  strings, do not skim them.
                  Right: the named class does exist. Then read the
                  provisioner and its events instead.
               - Replace the claim. Save `ledger`'s manifest, delete
                 Pod `ledger`, delete `ledger-data`, apply the claim
                 again with the same name, 2Gi, ReadWriteOnce, and
                 `storageClassName: standard-rwo`, then apply `ledger`
                 again unchanged.
                  Left: the claim goes Bound once the new `ledger` is
                  scheduled, and `ledger` turns Running.
                  Right: the API rejects your edit of the live claim's
                  `spec`. `storageClassName` cannot be patched.
                  Replace the object instead.
                  Right: the claim sits at `Terminating` and never
                  goes. Storage Object in Use Protection holds it while
                  a Pod object uses it, and a Pending Pod is a use.
                  Delete `ledger` first; do not strip the finalizer.
                  Right: the claim stays Pending with
                  `WaitForFirstConsumer`. That class binds only when a
                  Pod needs it; re-create `ledger` and watch again.

trap:         Reaches for tolerations, node affinity, or a bigger Node,
              because the original Pending question was scheduling. The
              scheduler never reached a Node here, and the edit changes
              nothing. Second: creates a StorageClass whose name matches
              the typo. The claim binds and the cluster now carries the
              mistake. Third: creates a second claim with the right
              class and leaves the Pod pointing at the old one. Fourth:
              deletes the claim while `ledger` still exists, watches it
              hang at `Terminating`, and strips the
              `kubernetes.io/pvc-protection` finalizer by hand instead
              of deleting the Pod. Fifth: drops the volume from
              `ledger` to make it Run, which starts a Pod with no
              storage.

docs-path:    Search `persistentvolumeclaim pending`.
              Page: Persistent Volumes
              https://kubernetes.io/docs/concepts/storage/persistent-volumes/
              Sections: Class, Binding, Storage Object in Use
              Protection, and Volume binding mode on Storage Classes
              https://kubernetes.io/docs/concepts/storage/storage-classes/
              Symptom page: Debug Pods
              https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/

docs:         https://kubernetes.io/docs/concepts/storage/persistent-volumes/
              https://kubernetes.io/docs/concepts/storage/storage-classes/
              https://kubernetes.io/docs/concepts/storage/dynamic-provisioning/
              https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/

---

## V03 — beacon-svc refuses every caller  ·  6 points  ·  ~7 min  ·  unit u8

topic:        It resolves, nothing answers

context:      Context `verdigris`. Namespace `relay`. Deployment
              `beacon` is Available with 3 ready replicas. Its Pods
              carry label `app=beacon` and declare one container port,
              named `http`, number 8080. Each `beacon` Pod answers an
              HTTP request on 8080 with 200 and its own name. Service
              `beacon-svc` in `relay` is ClusterIP and publishes port
              80. Pod `caller` in `relay` resolves `beacon-svc` to the
              Service ClusterIP, and every request to it fails at once
              with a refused connection. No NetworkPolicy exists in the
              cluster.

task:         Make an in-cluster HTTP request to `beacon-svc` on port
              80 reach a `beacon` Pod and return 200. `beacon-svc` must
              keep its name, its ClusterIP, and port 80. Do not change
              Deployment `beacon`, its Pods, or their labels.

constraints:  - Do not change Deployment `beacon` or any Pod label in
                `relay`.
                Checkable: the Deployment and the Pod labels match the
                snapshot.
              - Keep the Service object and its address.
                Checkable: `beacon-svc.metadata.uid` and
                `spec.clusterIP` match the snapshot.
              - Keep the published port at 80.
                Checkable: `spec.ports[*].port` contains 80.

verify:       Snapshot Deployment `beacon`, the Pod labels in `relay`,
              `beacon-svc.metadata.uid`, and `beacon-svc.spec.clusterIP`
              before scoring.
              - (2) Service `relay/beacon-svc` has the snapshot uid and
                clusterIP, `type` is `ClusterIP`, and it publishes port
                80.
              - (2) The EndpointSlices for `beacon-svc` list the three
                ready `beacon` Pod addresses, and every port entry they
                carry is 8080.
              - (2) From a Pod in `relay`, an HTTP request to
                `beacon-svc:80` returns 200 from a `beacon` Pod.
                Deployment `beacon` and the Pod labels match the
                snapshot.
              Gate the request pair on the endpoint pair.
              Two routes score. Set `targetPort: 8080`, or set
              `targetPort: http` and let the name resolve against the
              container port. Both put 8080 in the EndpointSlice.
              Changing `port` to 8080 fails the first and third pairs.
              The caller asks for port 80.
              Deleting and recreating the Service fails the first pair.
              The ClusterIP changes.
              Editing the selector, or relabelling the `beacon` Pods to
              match it, fails the last pair. The selector already
              matches; the Pod labels are graded.
              A Service with the right `targetPort` and no ready
              endpoints fails the endpoint pair.

expected path: - `kubectl get endpointslice -n relay -l
                 kubernetes.io/service-name=beacon-svc`
                  Left: one slice, `ADDRESSTYPE` IPv4, `ENDPOINTS`
                  lists three addresses, and `PORTS` reads `9090`.
                  Membership is correct and the port is not. The
                  selector is not the fault.
                  Right: `ENDPOINTS` is empty. Then the selector or Pod
                  readiness is the fault, which is the original
                  unreachable-Service question, not this one.
               - Search `debug service no endpoints`.
                  Left: Debugging Services. Work down the list: does the
                  Service exist, does it have endpoints, is the Service
                  correct. The port a Service forwards to is
                  `targetPort` on the Pod, and it is not the same field
                  as `port`.
                  Right: the kube-proxy or CNI pages. Traffic is being
                  delivered; it lands on a port nothing listens on.
               - Compare the two numbers.
                 `kubectl get svc beacon-svc -n relay -o yaml` and
                 `kubectl get pod -n relay -l app=beacon -o
                 jsonpath='{.items[0].spec.containers[*].ports}'`
                  Left: Service `port: 80`, `targetPort: 9090`;
                  container port `http` = 8080. The Service forwards to
                  a port no container holds, so the connection is
                  refused at once.
                  Right: they already agree. Then read the container's
                  listen address; a process bound to 127.0.0.1 refuses
                  the same way.
               - Patch `targetPort` to 8080 or to `http`. Re-read the
                 slice, then send the request.
                  Left: `PORTS` reads `8080`; the request returns 200.
                  Right: `PORTS` is `<unset>` or the endpoint vanished.
                  You used a port name the container does not declare.
                  Right: refused still. You changed `port` instead of
                  `targetPort`, so the caller's port 80 is gone.

trap:         Reaches for the selector, because the original unreachable
              Service was a selector that matched nothing. Here the
              EndpointSlice already lists all three Pods, so relabelling
              or re-selecting changes nothing. Second: reads "refused"
              as "no backend" and restarts the Deployment. Third:
              renumbers `port` instead of `targetPort`, which moves the
              published port away from the caller. Fourth: deletes and
              recreates the Service and loses the ClusterIP.

docs-path:    Search `debug service endpoints`.
              Page: Debugging Services
              https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/
              Sections: Does the Service have any Endpoints, Is the
              Service correct.
              Field reference: Service → Defining a Service
              https://kubernetes.io/docs/concepts/services-networking/service/

docs:         https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/
              https://kubernetes.io/docs/concepts/services-networking/service/
              https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/
              https://kubernetes.io/docs/tutorials/services/connect-applications-service/

---

## V04 — courier cannot reach parcel-svc  ·  8 points  ·  ~10 min  ·  unit u25

topic:        An address is not reachability

context:      Context `verdigris`. Namespace `depot` runs Deployment
              `parcel` (3 ready replicas, label `app=parcel`, container
              port 8080) behind Service `parcel-svc`, ClusterIP, port 80
              with `targetPort` 8080. Its EndpointSlice lists all three
              ready Pods. `depot` also runs Pod `strongbox`, label
              `app=strongbox`, listening on 8443. Namespace `dispatch`
              runs Deployment `courier`, label `app=courier`. From a
              `courier` Pod, `parcel-svc.depot.svc.cluster.local`
              resolves to the Service ClusterIP, and every request to it
              hangs until it times out. The same request from a Pod in
              namespace `ops` returns 200. The CNI is a conformant
              NetworkPolicy implementation.

task:         Make HTTP requests from the `courier` Pods to
              `parcel-svc.depot.svc.cluster.local` on port 80 return
              200. `courier` Pods must keep working DNS, and they must
              still be unable to open any other connection, including
              to `strongbox` on 8443. Do not widen access beyond what
              the task needs.

constraints:  - Do not change Service `parcel-svc`, Deployment
                `parcel`, or any label in `depot`.
                Checkable: those objects match the snapshot.
              - Do not change any NetworkPolicy in `depot`.
                Checkable: the policy list and specs in `depot` match
                the snapshot.
              - `courier` Pods must stay denied everywhere else.
                Checkable: the live negative probes in `verify`.

verify:       Snapshot `depot` objects, `depot` NetworkPolicies, and the
              Pod labels in both namespaces before scoring.
              - (3) From a `courier` Pod, an HTTP request to
                `parcel-svc.depot.svc.cluster.local:80` returns 200 from
                a `parcel` Pod.
              - (2) From a `courier` Pod, a DNS lookup of that same name
                still returns the Service ClusterIP.
              - (3) From a `courier` Pod, a TCP connection to the
                `strongbox` Pod address on 8443 does not complete, and a
                connection to any address outside the cluster does not
                complete. Every object and NetworkPolicy in `depot`, and
                every Pod label, matches the snapshot.
              Gate the negative triple on the first triple. A namespace
              that lets everything out scores 0 there.
              Two routes score. Add an egress rule to the existing
              policy, or create a second NetworkPolicy in `dispatch`
              that selects `app=courier` and adds only that rule.
              Policies are additive, so both end with the same effective
              permission.
              Deleting the policy in `dispatch` fails the negative
              triple.
              An egress rule with an empty `to` fails the negative
              triple.
              An egress rule that allows TCP 80 instead of 8080 fails
              the first triple. `ports` in a NetworkPolicy names a port
              on the Pods the rule selects, and the `parcel` Pods
              listen on 8080. The Service publishes 80; the policy
              never sees a Service.
              A new ingress policy in `depot` fails the constraint check
              and does not help: nothing in `depot` denies ingress.
              Changing `parcel-svc.targetPort` fails the last triple.

expected path: - Confirm the backend is healthy first.
                 `kubectl get endpointslice -n depot -l
                 kubernetes.io/service-name=parcel-svc`
                  Left: `ENDPOINTS` lists three addresses and `PORTS`
                  reads `8080`. From `ops` the request returns 200, so
                  the Service and its backends work.
                  Right: `ENDPOINTS` empty, or `PORTS` disagrees with
                  the container port. Then the fault is V03 or the
                  original selector question, not this one.
               - Read the shape of the failure. The name resolves and
                 the connection hangs; it is not refused, and it is not
                 an empty answer. Something is dropping packets on the
                 path.
               - `kubectl get networkpolicy -A`
                  Left: `dispatch` holds a policy that selects
                  `app=courier` with `policyTypes: [Ingress, Egress]`
                  and one egress rule for DNS. An egress policy that
                  selects a Pod denies everything it does not allow.
                  `depot` holds none, so the backend side permits all
                  ingress.
                  Right: a policy in `depot` selects `app=parcel`. Then
                  the deny is on the server side, which is the original
                  policy question. It is not what you have.
               - Search `network policy egress`.
                  Left: Network Policies. `to` selects the peer Pods,
                  and `ports` is "a numerical or named port on a pod" —
                  a port on those peer Pods, not the Service port a
                  caller dials. Pair the peer and the port inside one
                  rule item; two sibling items widen the peer set
                  instead.
                  Right: the Services page. A policy cannot name a
                  Service; it selects the Pods behind it.
               - Add the rule: `to` with `namespaceSelector`
                 `kubernetes.io/metadata.name: depot` and `podSelector`
                 `app: parcel` in the same item, `ports` TCP 8080.
                 Apply, then run all three probes.
                  Left: 200 from `parcel`, DNS still answers,
                  `strongbox:8443` still hangs.
                  Right: still hanging. Your rule allows TCP 80. `to`
                  selected the `parcel` Pods, so `ports` must name a
                  port those Pods hold, and that is 8080. Allow 8080.
                  Right: `strongbox:8443` now answers. Your peer items
                  are siblings, or your `to` is empty. Narrow it.
                  Right: DNS broke. You replaced the DNS rule instead of
                  adding beside it.

trap:         Reaches for the Service or the backend, because the
              original unreachable-Service questions were both on the
              server side. The Service is correct, the endpoints are
              ready, and another namespace already gets 200; the deny is
              in the caller's namespace. Second: deletes the policy,
              which fixes the symptom and removes the containment.
              Third: writes an ingress policy in `depot`, which nothing
              was blocking. Fourth: allows TCP 80, the Service port,
              rather than 8080, the Pod port.

docs-path:    Search `network policy egress`.
              Page: Network Policies
              https://kubernetes.io/docs/concepts/services-networking/network-policies/
              Sections: Behavior of to and from selectors, Default
              policies, and What you can't do with network policies.
              Walkthrough: Declare Network Policy
              https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/

docs:         https://kubernetes.io/docs/concepts/services-networking/network-policies/
              https://kubernetes.io/docs/reference/kubernetes-api/policy-resources/network-policy-v1/
              https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/
              https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/

---

## V05 — slate-w2 has been NotReady for twenty minutes  ·  8 points  ·  ~10 min  ·  unit u20

topic:        What separates a NotReady node

context:      Context `slate`. Nodes: `slate-cp1` (Ready), `slate-w1`
              (Ready), `slate-w2` (NotReady for twenty minutes). You
              have root SSH to every Node. On `slate-w2`,
              `systemctl is-active kubelet` prints `active`, and the
              kubelet process has been up for twenty minutes with no
              restarts. Nothing on `slate-w2` was changed in this
              session.

task:         Make `slate-w2` Ready again and show that the scheduler
              can place a Pod on it. No reboot. No package installs and
              no binary copies. The fix must survive
              `systemctl daemon-reload`, a restart of the kubelet, and a
              later restart of the Node's services.

constraints:  - Do not edit the kubelet unit, its drop-ins, or its
                configuration file.
                Checkable: those files match the snapshot byte for byte.
              - Do not delete or recreate the Node object.
                Checkable: `slate-w2.metadata.uid` matches the snapshot.
              - Do not cordon, drain, or taint any Node.
                Checkable: `spec.unschedulable` and the taints on every
                Node match the snapshot.

verify:       Snapshot the kubelet unit file, its drop-in directory, its
              configuration file, `slate-w2.metadata.uid`, and every
              Node's taints and `spec.unschedulable` before scoring.
              - (2) `kubectl get nodes` shows `slate-w2` Ready, and the
                Node has the snapshot uid.
              - (2) On `slate-w2`, the container runtime service is
                `active` and `enabled`, and
                `crictl --runtime-endpoint <node endpoint> version`
                answers with the runtime name and version.
              - (2) After `systemctl daemon-reload` and
                `systemctl restart kubelet` on `slate-w2`, the runtime
                stays `active` and the Node returns to Ready.
              - (2) The grader creates a probe Pod with required node
                affinity on `kubernetes.io/hostname=slate-w2` and no
                preset `spec.nodeName`. It becomes Running on
                `slate-w2`. The kubelet unit, drop-ins, and
                configuration file match the snapshot, and every Node's
                taints and `spec.unschedulable` match the snapshot.
              Gate the probe pair on the Ready pair.
              Two routes score. `systemctl enable --now containerd`, or
              `systemctl start containerd` followed by
              `systemctl enable containerd`. A masked unit must be
              unmasked first. Any route that ends active and enabled
              passes.
              Starting the runtime without enabling it fails the second
              pair. The Node is Ready now and NotReady after the next
              service restart.
              Restarting or reinstalling the kubelet fails the Ready
              pair. The kubelet was already up.
              Editing the kubelet unit fails the last pair, however
              Ready the Node looks.
              Deleting the Node object so the kubelet re-registers fails
              the uid check, and it does not make the Node Ready.

expected path: - `kubectl get nodes` and
                 `kubectl describe node slate-w2`
                  Left: one Node is NotReady while the others are Ready,
                  so this is node-local. The Ready condition is `False`
                  with reason `KubeletNotReady`, and its message holds
                  `container runtime is down` and `PLEG is not
                  healthy: ...`. The kubelet is running and reporting;
                  it is reporting that the runtime is not there.
                  Right: the Node is missing from the list entirely.
                  Then the kubelet never registered, which is the
                  original kubelet question.
                  Right: reason `KubeletNotReady` with a network
                  message. Then the CNI, not the runtime, is the fault.
               - SSH to `slate-w2`. `systemctl status kubelet` and
                 `journalctl -u kubelet -n 50`.
                  Left: the unit is `active (running)`. The log repeats
                  failures to reach the CRI socket: the dial to
                  `/run/containerd/containerd.sock` fails, and the PLEG
                  relist never succeeds. The kubelet is healthy; its
                  runtime is not.
                  Right: the unit is failing and its `ExecStart` names a
                  path that does not exist. That is the original
                  NotReady question. It does not say that here.
               - `systemctl status containerd`
                  Left: `inactive (dead)` and `disabled`, or `masked`.
                  That is the whole fault: the kubelet cannot create,
                  list, or inspect containers without the runtime.
                  Right: `active (running)`. Then compare the socket
                  path the kubelet uses with the one the runtime serves.
               - Search `container runtimes`.
                  Left: Container Runtimes, and the CRI page. The
                  kubelet talks to the runtime over the CRI socket; it
                  never starts containers itself.
                  Right: the kubelet reference page. Its flags are not
                  the fault; nothing about the unit changed.
               - Start the runtime and enable it, then confirm from both
                 sides: `crictl version` on the Node, and
                 `kubectl get nodes` on the control plane.
                  Left: `crictl` answers, and `slate-w2` flips to Ready
                  within a heartbeat.
                  Right: `crictl` answers and the Node stays NotReady.
                  Wait one more heartbeat, then re-read the Ready
                  message for a second aggregated error.
                  Right: the runtime is active but not enabled.
                  `systemctl is-enabled containerd` says `disabled`.
                  Enable it; the task requires it to survive a restart.

trap:         Restarts, reinstalls, or edits the kubelet unit, because
              the original NotReady question was a broken `ExecStart`.
              The kubelet here has been up for twenty minutes and says
              so. Second: starts the runtime and never enables it, so
              the Node fails again after the next restart. Third:
              deletes the Node object to force a fresh registration.
              Fourth: cordons or drains the Node to hide the symptom.

docs-path:    Search `node conditions ready`.
              Page: Nodes
              https://kubernetes.io/docs/concepts/architecture/nodes/
              Section: Conditions.
              Runtime reference: Container Runtimes
              https://kubernetes.io/docs/setup/production-environment/container-runtimes/
              Tooling: Debugging Kubernetes nodes with crictl
              https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/

docs:         https://kubernetes.io/docs/concepts/architecture/nodes/
              https://kubernetes.io/docs/concepts/architecture/cri/
              https://kubernetes.io/docs/setup/production-environment/container-runtimes/
              https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/
              https://kubernetes.io/docs/tasks/debug/debug-cluster/

---

## V06 — invoicer never becomes Ready  ·  6 points  ·  ~7 min  ·  unit u14

topic:        Delivery has semantics

context:      Context `verdigris`. Namespace `billing`. Deployment
              `invoicer` (1 replica, image `nginx:1.27-alpine`) has been
              at READY 0/1 since it was created, with 0 restarts.
              ConfigMap `billing/invoicer-config` holds three keys:
              `LOG_LEVEL=info`, `REGION=eu-west-1`, and
              `apiKey=prod-77`. The container declares environment
              variable `API_KEY` from that ConfigMap. The image is
              present on every Node.

task:         Make Deployment `invoicer` Available with one ready
              replica. Its container must read `API_KEY=prod-77` from
              ConfigMap `invoicer-config` at start. Keep the Deployment,
              its name, its image, and one replica. `invoicer-config`
              must keep `LOG_LEVEL=info` and `REGION=eu-west-1`
              unchanged.

constraints:  - Do not delete or recreate Deployment `invoicer`.
                Checkable: `invoicer.metadata.uid` matches the snapshot.
              - Keep the image `nginx:1.27-alpine` and one replica.
                Checkable: the template image and `spec.replicas`.
              - `API_KEY` must come from the ConfigMap, not from a
                literal.
                Checkable: the live template sets `API_KEY` through
                `valueFrom.configMapKeyRef` naming `invoicer-config`.
              - Keep the two other ConfigMap entries.
                Checkable: `LOG_LEVEL` and `REGION` match the snapshot.

verify:       Snapshot `invoicer.metadata.uid`, `invoicer.spec.replicas`,
              and ConfigMap `invoicer-config` before scoring.
              - (2) Deployment `billing/invoicer` has the snapshot uid,
                image `nginx:1.27-alpine`, `spec.replicas` 1, and 1
                ready and 1 available replica.
              - (2) `kubectl exec deploy/invoicer -n billing --
                printenv API_KEY` prints `prod-77`.
              - (2) In the live pod template, `API_KEY` is set through
                `valueFrom.configMapKeyRef` whose `name` is
                `invoicer-config`. ConfigMap `invoicer-config` still
                holds `LOG_LEVEL=info` and `REGION=eu-west-1`.
              Gate the last four points on the uid pair.
              Two routes score. Point the reference at the key the
              ConfigMap already holds, `apiKey`. Or add the key the
              reference already names, `api-key: prod-77`, to the
              ConfigMap and let the kubelet's next create attempt pick
              it up. Both end with a running container that read the
              value from the ConfigMap.
              Setting `optional: true` on the reference fails the second
              pair. The container starts and the Deployment reports
              Available, but `API_KEY` is unset.
              A literal `value: prod-77` fails the third pair.
              Deleting `LOG_LEVEL` or `REGION` fails the third pair.
              Deleting and recreating the Deployment fails the uid pair.
              Changing the image fails the first pair.

expected path: - `kubectl get pods -n billing`
                  Left: one Pod, `READY 0/1`, `STATUS
                  CreateContainerConfigError`, `RESTARTS 0`. Nothing has
                  run, so nothing has crashed.
                  Right: `CrashLoopBackOff` with a rising restart count.
                  That is a process that starts and exits; read its
                  logs. Right: `ImagePullBackOff`. That is the registry.
               - `kubectl logs -n billing deploy/invoicer`
                  Left: the command fails; there is no container to read
                  from. That confirms the container was never created.
                  Right: log lines appear. Then the container did start,
                  and you are on the wrong branch.
               - `kubectl describe pod -n billing <pod>`
                  Left: the container `State` is `Waiting` with `Reason:
                  CreateContainerConfigError`, and an event `Warning
                  Failed` carries `Error: couldn't find key api-key in
                  ConfigMap billing/invoicer-config`. The kubelet cannot
                  assemble the container's configuration, so it never
                  calls the runtime.
                  Right: the same reason names a Secret. Then the same
                  method applies to a Secret key.
               - `kubectl get configmap invoicer-config -n billing -o
                 yaml`
                  Left: the keys are `LOG_LEVEL`, `REGION`, and
                  `apiKey`. The reference asks for `api-key`. Keys are
                  matched exactly, and a hyphen is not a case change.
                  Right: the key is there. Then read the `name` in the
                  reference and the Pod's namespace.
               - Search `configmap environment variable`.
                  Left: Configure a Pod to Use a ConfigMap. A
                  `configMapKeyRef` names a ConfigMap and one key. The
                  key must exist unless the reference is `optional`, and
                  `optional` leaves the variable unset.
                  Right: the mounted-ConfigMap section. Environment
                  variables are resolved when the container is created,
                  not refreshed like a mounted file.
               - Correct the key name in the reference, apply, and wait
                 for 1/1.
                  Left: `printenv API_KEY` prints `prod-77`.
                  Right: Available, but `printenv` prints nothing. You
                  set `optional: true` rather than fixing the name.

trap:         Reads "0/1 and not Ready" as a crash or a probe fault,
              because the original workload-down questions were a stale
              mounted credential and a failing readiness probe. Restart
              counts stay at 0 here and `kubectl logs` has nothing to
              show, because the container was never created. Second:
              sets `optional: true`, which starts the container and
              silently drops the value. Third: hardcodes the value in
              the template, which passes the file check and abandons the
              ConfigMap. Fourth: deletes the Deployment to "reset" it.

docs-path:    Search `configmap environment variable`.
              Page: Configure a Pod to Use a ConfigMap
              https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/
              Section: Define container environment variables using
              ConfigMap data.
              Symptom page: Debug Pods
              https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/

docs:         https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/
              https://kubernetes.io/docs/concepts/configuration/configmap/
              https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/
              https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/

---

## V07 — nothing resolves anywhere  ·  6 points  ·  ~8 min  ·  unit u9

topic:        The endpoint is itself a Service

context:      Context `slate`. Namespace `mailroom` runs Pod `sorter`
              (image `busybox:1.36`, default `dnsPolicy`). No
              in-cluster name resolves from `sorter`, including
              `kubernetes.default.svc.cluster.local`. Its
              `/etc/resolv.conf` names one nameserver, the cluster DNS
              address `10.96.0.10`, with the usual search list and
              `ndots:5`. Service `kube-system/kube-dns` exists and holds
              that ClusterIP. Pods in every other namespace fail the
              same way. Node-level resolution on each Node works.

task:         Restore in-cluster DNS. Every Pod must again resolve
              `kubernetes.default.svc.cluster.local` and other
              in-cluster names through the cluster DNS address it
              already has.

constraints:  - Do not change Pod `sorter`.
                Checkable: `sorter.metadata.uid` and `sorter.spec` match
                the snapshot.
              - Do not change the CoreDNS configuration.
                Checkable: ConfigMap `kube-system/coredns` matches the
                snapshot.
              - Do not change or replace Service `kube-dns`.
                Checkable: `kube-dns.metadata.uid` and
                `spec.clusterIP` match the snapshot.

verify:       Snapshot `sorter.metadata.uid`, `sorter.spec`, ConfigMap
              `kube-system/coredns`, and `kube-dns.metadata.uid` and
              `spec.clusterIP` before scoring.
              - (2) Pod `mailroom/sorter` has the snapshot uid and its
                spec matches the snapshot exactly, including `dnsPolicy`
                and `dnsConfig`.
              - (2) Service `kube-system/kube-dns` has the snapshot uid
                and ClusterIP, and its EndpointSlices list at least one
                ready address on port 53. ConfigMap
                `kube-system/coredns` matches the snapshot.
              - (2) `kubectl exec sorter -n mailroom -- nslookup
                kubernetes.default.svc.cluster.local` returns the
                `kubernetes` Service ClusterIP. The grader then creates
                a Pod in a second namespace; the same lookup succeeds
                from it.
              Gate the lookup pair on the endpoint pair.
              Two routes score. Scale the CoreDNS Deployment back to its
              original replica count, or scale it to one. The graded end
              state is ready endpoints behind `kube-dns` and working
              resolution, not a replica number.
              `dnsPolicy: Default` on `sorter` fails the first pair, and
              it fails the last pair too: the Node resolver cannot
              answer `kubernetes.default.svc.cluster.local`.
              `dnsConfig.nameservers` on `sorter` fails the same two
              pairs, and it would fix one Pod out of the whole cluster.
              A second DNS Deployment behind a new Service fails the
              endpoint pair. `kube-dns` still has none, and every
              `resolv.conf` in the cluster points at `kube-dns`.
              Editing the Corefile fails the endpoint pair.
              A Running CoreDNS Pod with no ready endpoint behind
              `kube-dns` fails the endpoint pair.

expected path: - `kubectl exec sorter -n mailroom -- cat
                 /etc/resolv.conf`
                  Left: one nameserver, `10.96.0.10`, the cluster DNS
                  address, with the cluster search list. The Pod's DNS
                  configuration is correct, so the Pod is not the fault.
                  Right: the nameserver is a public address, or the
                  search list is missing. That is the original
                  `dnsPolicy` question, and it is a per-Pod fault. Every
                  namespace fails here, so it is not that.
               - Search `debugging dns resolution`.
                  Left: Debugging DNS Resolution. Work down its order:
                  the Pod's resolver, then the DNS Pods, then the
                  Service, then its endpoints.
                  Right: the Pod DNS policy page. That page changes one
                  Pod; the whole cluster is failing.
               - `kubectl get pods -n kube-system -l k8s-app=kube-dns`
                  Left: no Pods at all. Nothing is serving DNS.
                  Right: Pods exist and are `CrashLoopBackOff`. Then
                  read their logs; a Corefile error looks like this too.
               - `kubectl get deployment coredns -n kube-system`
                  Left: `READY 0/0`. The Deployment was scaled to zero,
                  so no CoreDNS Pod exists to answer.
                  Right: `READY 0/2`. Then the Pods cannot be created or
                  cannot become ready, which is a different fault.
               - `kubectl get endpointslice -n kube-system -l
                 kubernetes.io/service-name=kube-dns`
                  Left: no addresses. The Service is healthy and it
                  fronts nothing. `kube-dns` has no ready endpoint, so
                  nothing answers on `10.96.0.10` and no lookup can
                  succeed. How the failure looks to the client — a
                  refusal or a hang — depends on the proxy mode; it is
                  not what tells you the cause.
                  Right: addresses are listed. Then the Pods are up and
                  the fault is inside CoreDNS.
               - `kubectl scale deployment coredns -n kube-system
                 --replicas=2`, then re-run both checks.
                  Left: the slice lists ready addresses on 53, and the
                  lookup from `sorter` answers.
                  Right: Pods are Running and the slice is still empty.
                  Their readiness probe is failing; read the CoreDNS
                  logs before touching anything else.

trap:         Edits `sorter`'s `dnsPolicy` or `dnsConfig`, because the
              original DNS question was a per-Pod policy. That change
              can make one Pod resolve public names and it cannot
              resolve a cluster name, and it leaves every other Pod
              broken. Second: rewrites the Corefile to "fix" CoreDNS,
              which was never wrong. Third: deploys a second DNS service
              beside `kube-dns`, which no Pod's `resolv.conf` points at.
              Fourth: reads the failure shape — a hang, or an instant
              error — as a network fault and starts on the CNI.

docs-path:    Search `debugging dns resolution`.
              Page: Debugging DNS Resolution
              https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/
              Sections: Check if the DNS pod is running, Is DNS service
              up, Are DNS endpoints exposed.
              Concept: DNS for Services and Pods
              https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/

docs:         https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/
              https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/
              https://kubernetes.io/docs/tasks/administer-cluster/coredns/
              https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/
