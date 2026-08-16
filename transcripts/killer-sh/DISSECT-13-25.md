# DISSECT 13–25

Question 21 has no transcript in this directory, so the dissection covers
q13–q20 and q22–q25 (12 files). Every mechanism claim in a block is backed
by a kubernetes.io URL (baseline v1.36) in that block's `docs:` field. The
auto-captions mishear technical terms; where a caption contradicts
Kubernetes behaviour, the docs win and the discrepancy is flagged as a
`caption-error:`.

### q13 — one pod with three containers: C1 knows its own node, C2 appends date lines to a shared file, C3 tails that file

first instinct:   `kubectl run <name> --image=nginx --dry-run=client -o yaml`
                  to get a manifest skeleton, then edit it. Expect to end
                  up with one pod, three containers, one volume, one mount
                  path. Surprise: the dry-run yields one container and no
                  volume; both are yours to add.

path:
  1. Dry-run the skeleton and edit the YAML. Indentation is the cost of
     hand-editing; the presenter hit a bad indent at line 38.
  2. Container C1 (image nginx): env `MY_NODE_NAME` with
     `valueFrom: { fieldRef: { fieldPath: spec.nodeName } }`. That field
     is populated at bind time, so it always carries the node the pod
     actually ran on.
  3. Container C2 (busybox): a command that never exits, e.g.
     `sh -c "date >> /var/log/date.log; sleep 1"`. A command that exits
     puts the pod in CrashLoopBackOff; quoting the sh -c string is where
     the presenter fought twice.
  4. Container C3 (busybox): tail the shared file, e.g.
     `tail -f /var/log/date.log`.
  5. Add ONE `emptyDir` volume under `spec.volumes` and a
     `volumeMounts` entry in all three containers at the same mountPath.
     Apply. If a same-named pod exists, delete with `--grace-period=0`
     — the default graceful delete wastes ~30 seconds.
  6. Verify: `kubectl get pod -o wide` → 3/3 Running on one node;
     `kubectl exec <pod> -c C1 -- printenv MY_NODE_NAME` equals that
     node (cluster-1-worker-2 in the walkthrough); C2's log grows every
     second; C3 shows the same content.

fix:   the Pod manifest is the whole state change. Nothing outside the
       pod spec is created, and the volume is what lets the writer and
       reader share state.

trap:  reaching for three `kubectl run`s → three pods, no shared file.
       Second trap the presenter hit: applying before the volumes section
       exists, then iterating on indentation. Third: bad sh -c quoting
       that keeps the pod crash-looping instead of Running.

objects: Pod (spec.containers[].env[].valueFrom.fieldRef,
       spec.volumes[].emptyDir, volumeMounts).

docs:    https://kubernetes.io/docs/tasks/inject-data-application/environment-variable-expose-pod-information/
         https://kubernetes.io/docs/concepts/storage/volumes/#emptydir

unit: u12 — Which Signal Proves What: the env var is the signal; the
      `-o wide` node column is the evidence for which field populated it.

test-worthy: medium — mostly manifest assembly, but the "one pod, not
      three" decision and the fieldPath choice are real eliminators.

### q14 — record five cluster facts: master/worker counts, service CIDR, CNI plugin and its config file, static-pod name suffix

first instinct:   `kubectl get nodes`. Expect roles from labels, not
                  wording: "master" is just a node carrying the
                  control-plane role label.

path:
  1. `kubectl get nodes`; count control-plane vs workers by the
     `node-role.kubernetes.io/control-plane` label → 1 master, 2
     workers.
  2. Service CIDR: it is a kube-apiserver flag, and this apiserver is a
     static pod (its pod name ends with the node name). Grep
     `--service-cluster-ip-range` in
     `/etc/kubernetes/manifests/kube-apiserver.yaml`. Cross-check with
     `kubectl get svc -n kube-system`: every ClusterIP must fall inside
     the range. Grepping the scheduler or controller-manager manifest
     finds nothing; the apiserver manifest is the local authority.
  3. CNI plugin: on the node, `ls /etc/cni/net.d`, open the config
     file, read the `"type"` field. Record the plugin name and the full
     config file path.
  4. Static-pod suffix: static pods are mirrored as
     `<manifest-name>-<hostname>`. Verify by reading a live pod name
     (e.g. kube-apiserver-cluster-1-master-1), and check the kubelet
     has no `--hostname-override` — the only thing that shifts the
     reported node name.

fix:   none — pure observation; the answer file is the deliverable.

trap:  answering from the file name instead of the `"type"` field,
       and hiding the service CIDR question behind the kubeadm-config
       ConfigMap when the apiserver manifest carries the flag plainly.

objects: Node (role labels), kube-apiserver static pod, its manifest,
       /etc/cni/net.d config file.

docs:    https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/
         https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/
         https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/

caption-error: the presenter says the CNI plugin is "view"/"Viv". Read
       the `"type"` value in the actual config file and trust that.

unit: u13 — kubeadm Writes Files, Then Leaves: every answer lives in
      files kubeadm wrote (manifests, kubeconfigs).

test-worthy: medium — knowing where each fact lives is recall, but the
      cross-checks (svc ClusterIP in range, hostname-override) are worth
      drilling.

### q15 — write the cluster-wide events command to a file, then kill kube-proxy as a pod and as a container on cluster-2-worker-1, recording both event storms

first instinct:   `kubectl get events --all-namespaces
                  --sort-by=.metadata.creationTimestamp` — the literal
                  command the file must contain. Expect a
                  timestamp-ordered stream. Surprise: your `k` alias
                  will not expand when the file is executed as a script.

path:
  1. Write the full command into the file, then execute the file to
     prove it prints events. The presenter's alias version died with
     `k: command not found`.
  2. `kubectl -n kube-system get pods -o wide` and pick the kube-proxy
     pod running on cluster-2-worker-1 (two exist; the other node's
     deletion is a five-minute detour).
  3. `kubectl delete pod -n kube-system kube-proxy-<id>`; the pod is
     recreated within seconds — the DaemonSet controller — under a NEW
     name. The events (Scheduled, image Pulled, Created, Started) go
     into `/opt/course/15/pod_kill.log`. The new name is the proof the
     controller, not the kubelet, revived it.
  4. Kill as a container: on the node, `crictl ps` (CRI list, reads
     containers not pod names), find the kube-proxy line, then
     `crictl stop <id>` and `crictl rm <id>` (stop first; rm refuses
     on a running container). The kubelet reconciles the container list
     back to the PodSpec: a new container ID appears seconds later.
  5. Capture the second storm (image Pull, container Created, container
     Started) into `/opt/course/15/container_kill.log` right away —
     events age out of the apiserver within ~1 hour.

fix:  none — everything is observation. Both kills are undone by
      controllers in seconds; that is the point.

trap: deleting the kube-proxy on the wrong node; using the alias in the
      file; waiting to capture events until they've rotated out; and
      writing the pod-kill events into the container-kill file.

objects: Event (involvedObject, reason), kube-proxy Pod, DaemonSet
       controller, kubelet container reconciliation, crictl stop/rm.

docs:    https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/
         https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/
         https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/

unit: u3 — Events Are Hints: the recreate sequence is the event
      record's whole value.

test-worthy: medium — commands are documented; the alias-trap and
      race-to-capture are the exam-real wrinkles.

### q16 — write every namespaced resource name to a file, then find which project-* namespace has the most Roles

first instinct:   `kubectl api-resources --namespaced`. Expect a clean
                  name list. Surprise: without `-o name` you get the
                  wide table; without `--namespaced` you also drag in
                  cluster-scoped types.

path:
  1. `kubectl get ns` first, then `kubectl create ns ckmaster` — the
     pre-check keeps you from tripping on an existing object.
  2. Redirect `kubectl api-resources --namespaced -o name` into the
     answer file. `-o name` is what makes the file a name list.
  3. Who has the most Roles: `kubectl get roles -A --no-headers | awk
     '{print $1}' | sort | uniq -c | sort -rn` — one line, no
     eyeballing. (The presenter read rows by eye instead.)
  4. Confirm the leader: project-c14 has 300 Roles; every sibling
     (project-c13, project-hamster, project-snake, project-tiger) has
     none.
  5. Write `project-c14 300` into the file.

fix: none — observation; the file is the deliverable.

trap: counting ClusterRoles instead of Roles: ClusterRole is not
      namespaced and the question says Roles. Counting rows from a
      scroll instead of piping `get roles -A` into awk/wc.

objects: Namespace, Role (rbac.authorization.k8s.io/v1), the
       `--namespaced` api-resources filter.

docs:    https://kubernetes.io/docs/reference/kubernetes-api/authorization-resources/role-v1/

unit: u21 — Scope Is Part Of The Permission: "namespaced" is the scope
      filter, and Role vs ClusterRole is the trap that makes it matter.

test-worthy: medium — flag recall plus one counting idiom; the
      discriminators are `--namespaced -o name` and awk/uniq instead of
      rolling your own tally.

### q17 — CRI container id, runtime, and logs on the node that runs a given pod

first instinct:   `kubectl get pod -n <ns> -o wide` first — the node is
       the springboard; the rest happens over SSH, not in kubectl.

path:
  1. Create the pod from the question's spec
     (`kubectl run tigers-reunite -n project-tiger
     --image=httpd:2.4.41-alpine --labels=pod=container,container=pod`).
     Note the NODE column from `-o wide` — cluster-1-worker-2 in the
     walkthrough.
  2. ssh to that node; `crictl ps` lists the node's CRI containers.
     Find the line for this pod's app container (the ID column). Do not
     grab the sandbox/pause container's ID.
  3. `crictl inspect <id> -o json | jq '.info.runtimeType'` — runtime
     type as a value, to be copied verbatim (e.g. "runc"; captions say
     "V2" but your eyes read JSON).
  4. Logs: `crictl logs <id>` on the node (or `ssh <node> 'crictl
     logs <id>' > file`, with `&>` so stderr lands too). Write id +
     runtime + logs to the answer file.

fix: none — the run is read-only; nothing changes cluster state.

trap: `crictl ps` vs `crictl pods` (you need containers); the sandbox
      ID vs the app ID; trying `crictl logs` against the ID of a
      different node's container.

objects: Pod (node assignment), CRI container, inspect output.

docs:    https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/

caption-error: the runtime value is captioned "V2"; the source of truth
   is `info.runtimeType` in the inspect JSON.

unit: GAP — node-side CRI inspection is nowhere in the 27 units; the
      kubelet boundary is its closest cousin but nothing teaches host
      tooling against the runtime.

test-worthy: medium — mechanical, but the pod → node → container → id →
JSON chain has no single command that proves the whole thing.

### q18 — cluster-3-worker-1 is NotReady and the kubelet unit fails to start

first instinct:   `systemctl status kubelet` on cluster-3-worker-1 —
   "is it loaded, is it running" first, before touching anything.

path:
  1. `kubectl get nodes` — master Ready, worker NotReady: a node-local
     problem, not a cluster segmentation failure.
  2. On the node: `ps -ef | grep kubelet` shows nothing running.
     `systemctl status kubelet` shows the unit failing. Read the error:
     it names the ExecStart path that does not exist.
  3. Open the unit file: ExecStart=/usr/local/bin/kubelet.
     `which kubelet` → /usr/bin/kubelet. The unit points at the wrong
     path; the binary lives elsewhere.
  4. Fix the unit's ExecStart (or create the symlink the unit expects),
     then `systemctl daemon-reload` — REQUIRED after editing a unit;
     without it the old definition is used. Then
     `systemctl restart kubelet`.
  5. `systemctl status kubelet` → active (running); `kubectl get nodes`
     → the worker flips Ready. Write the reason into the specified
     file.

fix: the unit-file edit + daemon-reload + restart. Nothing else — it is
     "which command starts kubelet", fixed by making the file match the
     binary's actual home. Service start/restart alone cannot heal a
     refuse to exec.

trap: `service kubelet start` repeated while the failed-ExecStart
     message is on screen; skipping daemon-reload (file edits don't
     reach systemd until reload); and rebooting the node instead of
     reading the unit — the presenter did the first two.

objects: Node (.status.conditions ready), kubelet unit, the kubelet
       binary path.

docs:    https://kubernetes.io/docs/concepts/architecture/nodes/
         https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/

unit: u7 — Running Is Not Ready: the Ready condition is only
      truthful while the kubelet process heartbeats.

test-worthy: high — the discriminating move is diffing ExecStart
   against `which kubelet` and remembering daemon-reload; everything
   before that is restart-fishing.

### q19 — in the new `secret` namespace: mount secret1 read-only, expose secret2's user/pass as env vars, keep the pod sleeping

first instinct:   `kubectl get secret -n secret` after creating the
       namespace — because the supplied manifest's namespace is almost
       always wrong and the failure whispers.

path:
  1. `kubectl create namespace secret` (check it first).
  2. Open the supplied manifest for secret1: its `metadata.namespace`
     is wrong or missing. Fix it to `secret` and create. Validate
     `kubectl get secret secret1 -n secret` (decode the base64 to be
     sure of the contents).
  3. Create secret2 from literals:
     `kubectl create secret generic secret2 -n secret
     --from-literal=user=user1 --from-literal=pass=1234`. The literal
     KEYS are exactly what the env refs will name later; a mismatch
     means the var never populates.
  4. Pod skeleton from `kubectl run secret-pod -n secret
     --image=busybox --dry-run=client -o yaml`. The container must keep
     running — `sleep 3600` as the single command. The transcript's
     first attempt used a wrong command form and the pod crash-looped;
     `kubectl logs secret-pod` showed the shell error each time.
  5. Volume: `volumes: - name: secret-volume, secret: {secretName:
     secret1}`; and inside the container `volumeMounts: {name:
     secret-volume, mountPath: /tmp/secret1, readOnly: true}`.
  6. Env: TWO entries with
     `valueFrom: {secretKeyRef: {name: secret2, key: user}}` and key
     `pass`, under env names exactly `APP_USER` and `APP_PASS`.
  7. Apply, then `kubectl exec -n secret secret-pod -- printenv` to see
     both values; `kubectl exec ... -- cat /tmp/secret1` to see the
     mounted data.

fix: the pod spec's volume + secretKeyRef env entries — a delete and
   recreate if the existing pod's fields are immutable (envs and volumes
   are immutable at runtime). Nothing about secrets themselves changes.

trap: (a) pod created in the wrong namespace (secret refs resolve per
   namespace); (b) literal keys (user/pass) differing from the
   secretKeyRef keys; (c) reading the CrashLoopBackOff as a Secret
   problem when the shell error is in the logs; (d) believing a later
   Secret edit updates the running pod — env values are snapshotted.

caption-error: the env names in the captions ("app_powers", "pause")
   are misheard; copy APP_USER/APP_PASS from the question text.

objects: Secret (Opaque), Pod (secret volume, volumeMount readOnly,
       env from secretKeyRef), CrashLoopBackOff.

docs:    https://kubernetes.io/docs/concepts/configuration/secret/

unit: u14 — An Update Is Not A Reload: envs are snapshotted into the
      container at pod creation; the Secret and the process diverge.

test-worthy: medium — the two Secret mechanisms are documented; the
      crash-loop vs mount-failure discrimination is the drillable
      wrinkle.

### q20 — a node is not part of the cluster and its kubelet/kubectl are an older version; align and join

first instinct:   `kubectl get nodes` — expect to see the node missing,
   then SSH in and run `kubelet --version` and `kubectl version` side
   by side with the control plane's.

path:
  1. Control plane runs v1.25.2 in the walkthrough; the node hosts
     kubelet and kubectl at 1.24.6 (kubeadm is already 1.25.2). The
     older kubelet can not join a newer master cleanly.
  2. On the node: `apt-mark unhold kubelet kubectl`; then
     `apt-get update && apt-get install -y kubelet=1.25.2
     kubectl=1.25.2`; then `apt-mark hold kubelet kubectl` to stop
     future drift.
  3. `systemctl daemon-reload && systemctl restart kubelet`.
  4. On the control plane: `kubeadm token create --print-join-command` —
     the join line carries the token + discovery hash. Run it on the
     node (`kubeadm join ...`). The join runs preflight, writes
     /etc/kubernetes/kubelet.conf, and starts the kubelet; with
     kubeadm-defaults the node is auto-approved by the CSR
     controller.
  5. `kubectl get nodes` — the node appears and turns Ready within a
     few seconds; the VERSION column matches the control plane.

fix: the version-holds + upgrade + join. The kubeadm join is what turns
   a non-member into a member; the node had a membership problem, not a
   package problem.

trap: trying `kubeadm upgrade node` on a node that was never joined
   (that command is for post-join upgrades; without a kubelet.conf it
   fails), or editing only the kubectl version and leaving the kubelet
   stale; and forgetting the unhold/hold cycle so `apt-get upgrade`
   moves the pins later.

objects: the kubeadm/kubelet/kubectl binaries and their version
       constraints, Node membership, kubeadm token.

docs:    https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/
         https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-token/
         https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-join/

unit: u13 — this is the node lifecycle side of "kubeadm Writes Files,
      Then Leaves": the upgrade path and the join are kubeadm commands
      that touch cluster state to add a node.

test-worthy: high — three separate decisions (which binaries to touch,
      hold/unhold, join vs upgrade) with a destructive 10-minute
      re-upgrade if the version is wrong.

### q21 — (no transcript found for question 21 in this range)

The directory jumps from 20 to 22 in the file listing. There is no
`21-cka-question-21-*` transcript to dissect, so this range is 12
transcripts: q13–q20, q22–q25.

### q22 — apiserver cert expiry: openssl value, kubeadm value, and the renew command

first instinct:   `kubeadm certs check-expiration` — one screen lists
   every cert's expiry. Surprise: the question wants the date proven by
   openssl on the actual serving cert, so both reads are required.

path:
  1. Identify the fixed cert: on the master, grep the apiserver's
     manifest for the serving cert path:
     `grep tls-cert /etc/kubernetes/manifests/kube-apiserver.yaml`
     → the cert file the apiserver actually serves.
  2. `openssl x509 -in <path> -noout -text | grep -A2 validity` (or
     `-dates`) — Not After is the expiry, UTC. Copy it.
  3. `kubeadm certs check-expiration` — the apiserver row repeats the
     same time. If the two differ, you've read the wrong cert file.
  4. The renew command is `kubeadm certs renew apiserver` — a single
     cert; `renew all` is the wrong scope. Write it into the file
     as asked.
  5. Optional: actually run it, then `kubeadm certs
     check-expiration` shows the new date. Docs: renewing doesn't
     reload the kube-apiserver; the static pod must be restarted
     (or its manifest touched) to pick the new cert.

fix: the renewal rewrites certs in /etc/kubernetes/pki; the file is
   the deliverable.

trap: editing the wrong cert (the apiserver only serves what its
   manifest points to); using openssl's parsing flags wrong (it prints
   everything; missing `-noout` buries the answer in noise).

objects: the apiserver serving cert, the apiserver static manifest,
       the kubeadm certs API (check-expiration, renew).

docs:    https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/
         https://kubernetes.io/docs/setup/best-practices/certificates/

unit: u13 — the certs are kubeadm-written PKI artifacts, and the only
      "expiration/renewal" API is kubeadm itself.

test-worthy: medium — the two commands are portal-documented; the
      discriminating bit is scoping to the single cert and knowing
      openssl's flag layout.

### q23 — on cluster-2-worker-1, issuer and EKU of the kubelet's client cert and server cert

first instinct:   On the node, open the kubelet config file — it
       declares where the client certificate lives.

path:
  1. ssh to cluster-2-worker-1; `grep cert /var/lib/kubelet/config.yaml`
     exports the client cert path (kubelet-client-current.pem in pki).
  2. `openssl x509 -in <client.pem> -noout -text | grep -A4 'Issuer:'`
     → issuer "kubernetes"; `grep -A4 'Extended Key Usage'` → TLS Web
     Client Authentication. The kubelet's outbound identity.
  3. The serving cert (kubelet.crt) sits in the same pki directory.
     Read issuer and EKU on it: issuer is the node itself
     (self-signed cluster-2-worker-1@...) and EKU is TLS Web Server
     Authentication. Inbound identity for the kubelet's HTTPS
     listener.
  4. Answer file gets all four values and the comparison: issuer
     separates cluster-signed from node-signed; EKU fixes direction
     (client vs server auth).

fix: none.

trap:  reading only one cert and reporting it as "the kubelet cert";
   or pasting the client issuer under the server row — compare step
   exists exactly to catch that.

docs:    https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/
         https://kubernetes.io/docs/setup/best-practices/certificates/

caption-error: "cluster T worker one at some random number" is the
   self-signed serving cert issuer; trust the x509 -text, not the
captions.

unit: u13 — kubeadm-created identities; the "which is which" is an
     EKU/issuer read, not a config hunt.

test-worthy: high — the structure (two certs, two directions) plus
   reading x509 field-by-field is exactly what gets skipped in a
   rush.

### q24 — backend pods may talk only to db1:1111 and db2:2222; everything else is denied

first instinct:   Before writing the policy, prove the baseline:
   `kubectl exec <backend-pod> -- curl <db1-ip>:1111` etc. You can't
   validate a deny you never saw work.

path:
  1. Survey `kubectl -n project-snake get pods -o wide --show-labels`
     → app label per pod: backend, db1, db2, vault.
  2. Baseline from the backend pod: curl db1:1111 → "database one";
     curl db2:2222 → "database two"; curl vault:3333 → "vault secret
     storage". (The presenter records ping too: it works pre-policy.)
  3. Write NetworkPolicy `np-backend` (project-snake):
       spec.podSelector.matchLabels: {app: backend}
       policyTypes: [Egress]
       egress:
         - to: [{podSelector: {matchLabels: {app: db1}}}]
           ports: [{protocol: TCP, port: 1111}]
         - to: [{podSelector: {matchLabels: {app: db2}}}]
           ports: [{protocol: TCP, port: 2222}]
     `to` needs the podSelector in the SAME list item as the ports; a
     `namespaceSelector` can additionally scope it to project-snake.
  4. Apply and rerun the same probes: db1/db2 still answer; vault
     times out; `ping` to db1/db2 is 100% lost — the allow only
     covers those TCP ports, and ICMP is not TCP/UDP/SCTP.
  5. If vault still answers, polarity is inverted: sibling `to`
     entries (podSelector and namespaceSelector in DIFFERENT items)
     OR together and widen the filter.

fix:  the NetworkPolicy object is the full state change; since
   policyTypes: [Egress] on a selected pod means "deny all egress
   except listed", the block is implicit — nothing else to add.

trap:  the OR-vs-AND structure of `to` (two entries widen instead of
      intersect); skipping the baseline; expecting ICMP to pass; the
      namespace label being the `kubernetes.io/metadata.name` label,
      not the namespace NAME in the selector.

objects: NetworkPolicy (spec.podSelector, policyTypes, egress[].to,
       ports), pod labels.

docs:    https://kubernetes.io/docs/concepts/services-networking/network-policies/
         https://kubernetes.io/docs/reference/kubernetes-api/policy-resources/network-policy-v1/

unit: u8 — A Permission Is Not A Path: the policy only changes what
      the CNI data path allows for the selected pods.

test-worthy: high — the layered selector structure and the before/after
      probes are the whole answer; without the probes no one can tell
      the policy works.

### q25 — etcd backup on master, create a pod, restore the snapshot, the pod must be gone

first instinct:   On the master, read the etcd static pod manifest
   and its default flags (endpoints, ca, cert, key), then run the
   docs' snapshot command with those credentials — the file will be
   the backup.

path:
  1. The flags are in the manifest and the docs' example:
     ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379
     --cacert=/etc/kubernetes/pki/etcd/ca.crt
     --cert=/etc/kubernetes/pki/etcd/server.crt
     --key=/etc/kubernetes/pki/etcd/server.key snapshot save <path>
  2. Run it; confirm the file appears and is non-empty.
  3. `kubectl run test --image=nginx` (proof object) — created AFTER
     the snapshot on purpose.
  4. Restore: same etcdctl flags with `snapshot restore <file>
     --data-dir=/var/lib/etcd-backup1` — NEW data dir, never the live
     one, while etcd is running.
  5. Edit `/etc/kubernetes/manifests/etcd.yaml` — the `etcd-data`
     hostPath volume's path → restore dir. The kubelet restarts the
     static etcd pod against it. Wait ~1-2m (connection refused is
     expected mid-restart).
  6. Verify: `kubectl get pods -A` — kube-system back up; the
     `test` pod in default namespace is GONE: the keyspace was rewound
     to the snapshot moment.

fix:    the data-dir cutover in the static manifest plus the etcd
        restart — a rollback, not a repair; after it the cluster
        believes the snapshot time.

trap: restoring into the LIVE data dir while etcd runs (it clobbers
     and then etcd fails); not editing the manifest (restart changes
     nothing); misreading the connection-refused as failure;
     snapshotting to the same dir the restore will use.

caption: "hcd" throughout is etcd; the "12 pods → 11" discrepancy is
   just kube-system still starting — the real assertion is the absent
   test pod.

objects: etcd static pod manifest, etcdctl snapshot save/restore, the
   hostPath volume etcd-data, the pod.

docs:    https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/
         https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/

unit: u11 — "A Backup You Have Restored" is the guarantee; pod created
after the snapshot must not come back.

test-worthy: high — the offline-backup dataflow (snapshot, new dir,
      manifest flip), each with an else that silently looks okay, is
      only provable by the test pod disappearing.
