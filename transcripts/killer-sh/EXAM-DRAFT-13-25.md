# EXAM-DRAFT-13-25

Timed practice exam authored from the q13–q25 dissection.
9 questions · 66 points · ~84 minutes · composition: 5 high, 3 medium,
1 deliberately low (Q06 — the free-marks pacing task; it was rated medium
in the dissection but is the most representative "write this documented
command" item in the range, so it is marked low here).

All questions re-word the source scenarios with new names, namespaces, and
ports; a candidate who memorised the walkthroughs must still diagnose.
Baseline for cited behaviour: Kubernetes v1.36.

## Q01 — trio: node name, appender, tailer  ·  6 points  ·  ~8 min  ·  unit u12

context:      Context `ck-amber`. Namespace `lab` exists and is empty. All
              nodes are Ready. You may create anything you need inside
              `lab`, nothing outside it.

task:         Run exactly one Pod named `trio` in namespace `lab`, with
              three containers: `alpha`, `beta`, `gamma`. `alpha` must
              expose an environment variable `NODE_NAME` whose value is
              the name of the node the Pod lands on. `beta` must append a
              line to a shared file once per second. `gamma` must keep
              reading that same file. All three must stay Running.

constraints:  Exactly one Pod named `trio`. No `hostPath` volumes. The
              value of `NODE_NAME` must be populated by Kubernetes, not
              written as a literal. All three containers must reference
              the same mount path.

verify:       1 pt: `lab` contains exactly one Pod, `trio`, with exactly
              `alpha`, `beta`, and `gamma`.
              1 pt: the Pod has no `hostPath`; all three containers mount
              the same volume name at the same `mountPath`.
              1 pt: `alpha`'s `NODE_NAME` uses `fieldRef` `spec.nodeName`
              and its runtime value equals `spec.nodeName`.
              1 pt: the shared file grows at roughly one line per second.
              1 pt: `gamma`'s own output gains the same new lines while
              `beta` writes; an ad-hoc `exec cat` is not enough.
              1 pt: the Pod remains 3/3 Running.
              This accepts a direct manifest, a generated skeleton, and
              any non-`hostPath` writable shared volume.

expected path: 1. `kubectl run trio -n lab --image=nginx
              --dry-run=client -o yaml` → yields one container, zero
              volumes; edit in the rest. 2. For `alpha`, env
              `valueFrom.fieldRef.fieldPath: spec.nodeName`; if you wrote
              a literal, the value is static and the NODE_NAME / fieldRef
              point fails → re-edit. 3. `beta`: `command: ["sh", "-c",
              "while true; do date >>
              /shared/log; sleep 1; done"]`. If the command exits, you see
              CrashLoopBackOff, not Running → fix the command, not the Pod
              spec. 4. `gamma` follows `/shared/log` continuously, for
              example with `tail -F /shared/log`. If either container
              mounts the wrong volume or path, replace the Pod with a
              corrected manifest. First rule out a writer error, an empty
              file, and a permission error; empty output does not identify
              a mount-path mismatch by itself. 5. One
              `emptyDir` under `spec.volumes` mounted in all three; if a
              `trio` already exists, delete with `--grace-period=0`. 6.
              Verify as above.

trap:         three `kubectl run` invocations instead of one Pod — three
              pods cannot share the file. Hand-edited YAML indentation
              fails the apply in a loop. Bad quoting of the `sh -c`
              string keeps the container crash-looping.

docs:         https://kubernetes.io/docs/tasks/inject-data-application/environment-variable-expose-pod-information/
              https://kubernetes.io/docs/concepts/storage/volumes/#emptydir

## Q02 — event storms: kill a DaemonSet pod, then its container  ·  6 points  ·  ~8 min  ·  unit u3

context:      Context `ck-amber`. The cluster runs DaemonSet `node-tailer`
              in `kube-system` (image: `node-exporter`-style, one pod per
              node). Files `/opt/exam/02/commands.txt`,
              `/opt/exam/02/events_pod.log`, and
              `/opt/exam/02/events_container.log` exist and are empty.
              Node names: `amber-master-1`, `amber-worker-1`,
              `amber-worker-2`. A grader-owned harness will delete the
              `node-tailer` Pod on `amber-worker-2`, then separately stop
              and remove its container from the node, each inside a
              stated capture window. The harness records the pre-action
              Pod name/UID and container ID before each action, and the
              post-action Pod name/UID and container ID after it.

task:         Write into `commands.txt` the kubectl command that lists
              the cluster's newest events ordered by creation time — the
              literal command, not your shell alias. During the first
              capture window, copy the events generated by the Pod
              replacement into `events_pod.log`. During the second
              capture window, copy the events generated by the container
              replacement into `events_container.log`. Each log gets
              only the events from its own window.

constraints:  The file must contain the raw command text (an alias in
              the file is graded as absent). Capture only within the
              stated window for each log; do not pre-fill or backfill
              either file.

verify:       Scoring precondition: the harness's before/after Pod
              snapshot on `amber-worker-2` shows the old `node-tailer`
              Pod name/UID replaced by a new Pod name/UID owned by
              DaemonSet `node-tailer`; the harness's node-runtime
              snapshot shows the `node-tailer` container ID changed
              while that replacement Pod UID stayed the same; and
              DaemonSet `node-tailer` still has one pod per node after
              both replacements. If any of this fails, score 0 for the
              question.
              2 pts: `commands.txt` is a single line beginning `kubectl
              get events` and contains `--all-namespaces`/`-A` and
              `--sort-by=.metadata.creationTimestamp`.
              2 pts: `events_pod.log` contains at least one event whose
              `involvedObject` UID is the replacement Pod UID and whose
              observed time falls inside the first capture window, and
              no event that fails either filter. An empty file scores 0;
              do not require a fixed reason sequence.
              2 pts: `events_container.log` contains at least one event
              whose `involvedObject` UID is the replacement Pod UID and
              whose observed time falls inside the second capture
              window, and no event that fails either filter. An empty
              file scores 0.

expected path: 1. Write the full events command to the file, then
              execute the file: aliases do not expand in scripts → `k:
              command not found` means you wrote the alias. 2. Watch for
              the harness's first capture-window signal; as soon as it
              opens, run the events command and copy its output to
              `events_pod.log` — the replacement Pod's events rotate out
              in about an hour, so capture promptly rather than after the
              fact. 3. Confirm the window: `kubectl -n kube-system get
              pods -o wide` shows a `node-tailer` Pod on
              `amber-worker-2` with a new name/UID — a different UID is
              the proof the harness, not you, acted. 4. Watch for the
              second capture-window signal, then copy its output to
              `events_container.log` immediately; the container ID
              changes while the Pod UID stays the same, so filter to
              that Pod UID and to the second window — the window, not a
              new UID, is what separates the two captures. 5. Do not act on
              `node-tailer` yourself; your job is capture, not the kill.

trap:         relying on the `k` alias inside the written file; capturing
              before a window opens or after it closes; swapping the two
              log files; trying to perform the Pod or container kill
              yourself instead of capturing the harness's action.

docs:         https://kubernetes.io/docs/reference/kubectl/generated/kubectl_get/
              https://kubernetes.io/docs/reference/kubernetes-api/core/event-v1/
              https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/

## Q03 — a NotReady node whose kubelet will not start  ·  8 points  ·  ~10 min  ·  unit u7

context:      Context `ck-amber`. Nodes: `amber-master-1` (Ready),
              `amber-worker-1` (NotReady). You have root SSH access to
              both. Nothing on `amber-worker-1` has been modified in this
              session.

task:         `amber-worker-1` has been NotReady for an hour and its
              kubelet does not stay up. Make the node Ready again and
              show it can schedule a Pod.

constraints:  No reboot of the node. No package installs or binary
              copies. The fix must survive a service/daemon reload.
              Confirmation must come from `kubectl get nodes` on the
              master, not from the node alone.

verify:       2 pts: `systemctl is-active kubelet` is active and stays
              active after `systemctl daemon-reload` + restart.
              2 pts: the kubelet unit's ExecStart path resolves to a
              real binary (`test -x <execstart-path>`).
              2 pts: `kubectl get nodes` shows `amber-worker-1` Ready.
              2 pts: after the candidate finishes, the grader creates a
              probe Pod with required node affinity for
              `kubernetes.io/hostname=amber-worker-1` and no pre-set
              `nodeName`; the Pod becomes Running on `amber-worker-1`.

expected path: 1. `kubectl get nodes` — master Ready, worker NotReady:
              node-local problem, not a cluster failure. 2. On the node:
              `ps -ef | grep kubelet` → nothing running; `systemctl
              status kubelet` → unit failing; the error names the
              ExecStart path that does not exist. 3. Read the unit:
              ExecStart points at (e.g.) `/opt/bin/kubelet`; `which
              kubelet` → the binary lives at `/usr/bin/kubelet`. Paths
              disagree → this is a unit bug, not a kubelet logic bug.
              If they agreed, the next place to look is the kubelet
              config (bad kubeconfig disappears the same way). 4. Fix the
              unit's ExecStart, `systemctl daemon-reload` (mandatory
              after a unit edit — without it the old definition is
              reused), then restart kubelet; status says active. 5. Back
              on the master, the node flips Ready once the kubelet
              heartbeats; schedule a probe Pod.

trap:         `service kubelet start` retried while the failed-ExecStart
              error is on screen; skipping `daemon-reload` so the edit
              never takes effect; rebooting the node instead of reading
              the unit.

docs:         https://kubernetes.io/docs/concepts/architecture/nodes/
              https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/

## Q04 — two secrets: mount one, project the other  ·  6 points  ·  ~8 min  ·  unit u14

context:      Context `ck-amber`. Namespace `secure` exists.
              `/opt/exam/04/app-secret.yaml` on the workstation declares a
              Secret named `bundle`; its `metadata.namespace` is wrong.
              No other Secrets exist.

task:         In `secure`: ensure Secret `bundle` exists with the correct
              namespace. Create Secret `creds` with keys `api_key` =
              `super$ecret` and `token` = `tok-1234` (literal keys and
              values). Run a Pod `worker` (image `busybox`) that stays
              Running, mounts `bundle` read-only at `/etc/bundle`, and
              exposes environment variables `APP_KEY` (from
              `creds/api_key`) and `APP_TOKEN` (from `creds/token`).

constraints:  `creds` must be one generic Secret. Env names and key
              names must match the task exactly. The mount must be
              read-only. The Pod must not exit.

verify:       1 pt: Secret `bundle` exists in `secure`; its data matches
              `app-secret.yaml`'s data.
              1 pt: Secret `creds` exists in `secure`, `creds.type` is
              `Opaque`, with exactly keys `api_key` and `token`;
              base64-decoded values match `super$ecret` and `tok-1234`.
              1 pt: Pod `worker` in `secure` has either a `secret` volume
              with `secretName: bundle` or a `projected` volume with a
              `secret.name: bundle` source, mounted `readOnly: true` at
              `/etc/bundle`.
              1 pt: `APP_KEY`'s `valueFrom.secretKeyRef` names
              `creds/api_key` and `APP_TOKEN`'s names `creds/token`;
              `exec worker -- printenv APP_KEY` shows `super$ecret`,
              `APP_TOKEN` shows `tok-1234`.
              1 pt: `exec worker -- cat /etc/bundle/<file>` shows the
              mounted secret's data.
              1 pt: Pod is Running and stays Running.

expected path: 1. Fix the namespace in `app-secret.yaml` to `secure`;
              apply; verify with `kubectl get secret bundle -n secure`. 2.
              `kubectl create secret generic creds -n secure
              --from-literal=api_key='super$ecret'
              --from-literal=token=tok-1234` — quote the value so the
              shell does not expand `$`. The literal KEY names are the
              contract: they must be exactly what the env refs name
              later. 3. Pod skeleton via `kubectl run worker -n secure
              --image=busybox --dry-run=client -o yaml`; add a command
              that never exits: `command: ["sh", "-c", "while true; do
              sleep 3600; done"]`. If the command form is malformed, the
              pod CrashLoopBackOffs — read `kubectl logs worker` (shell
              error) before blaming the Secret. 4. Add the `bundle`
              volume + readOnly mount, and the two `secretKeyRef` env
              entries. 5. If a `worker` already exists, delete (env and
              volume are immutable at runtime) and re-apply. 6. Verify
              per above.

trap:         creating `creds` with different key names (envs stay
              empty, pod still Running — silent); creating the Pod in the
              wrong namespace (secret refs resolve per namespace);
              misreading a CrashLoop as a mount failure when logs show a
              shell syntax error; editing `creds` does not update
              `APP_KEY` or `APP_TOKEN` in an existing container because
              environment values are captured at container start.
              Updates to the mounted `bundle` Secret are projected
              eventually unless the mount uses `subPath`.

docs:         https://kubernetes.io/docs/concepts/configuration/secret/

## Q05 — a stray node: match versions, then join  ·  9 points  ·  ~12 min  ·  unit u13

context:      Context `ck-amber`. `kubectl get nodes` lists only
              `amber-master-1` and `amber-worker-1`, both at v1.30.3.
              `amber-worker-2` is reachable over SSH and absent from the
              cluster. A teammate once ran upgrade commands on the box;
              assume nothing about which components already match.

task:         Bring `amber-worker-2` into the cluster at the exact
              version of the control plane, so it appears Ready and at
              v1.30.3.

constraints:  Joining must use kubeadm tooling. The node's kubeadm,
              kubelet, and kubectl must end at v1.30.3 and be held.
              Control-plane components must not be modified. The node
              must be Ready in `kubectl get nodes`.

verify:       2 pts: `kubectl get nodes` shows `amber-worker-2` Ready.
              2 pts: its VERSION column equals the control plane's
              (v1.30.3).
              2 pts: on the node, `kubeadm version`, `kubelet --version`,
              and `kubectl version --client` report v1.30.3.
              2 pts: on the node, `apt-mark showhold` lists `kubeadm`,
              `kubelet`, and `kubectl` (they are held).
              1 pt: after the candidate finishes, the grader creates a
              probe Pod with required node affinity for
              `kubernetes.io/hostname=amber-worker-2` and no pre-set
              `nodeName`; it becomes Running on `amber-worker-2`.

expected path: 1. `kubectl get nodes` — worker-2 missing entirely: not a
              taint problem, a membership problem. 2. `ssh amber-worker-2`;
              version every component: `kubeadm version` (may already
              match), `kubelet --version`, `kubectl version --client`.
              Left: any lag below 1.30.3 → upgrade those binaries. Right:
              all match → skip straight to join. 3. If any binary is not
              v1.30.3, run `apt-cache madison` for `kubeadm`, `kubelet`,
              and `kubectl`; unhold all three; install
              `kubeadm='1.30.3-*' kubelet='1.30.3-*' kubectl='1.30.3-*'`
              with `--allow-downgrades`; then hold all three. If all
              three already match, do not reinstall them. 4.
              `systemctl daemon-reload &&
              systemctl restart kubelet`. 5. On the master: `kubeadm
              token create --print-join-command`; run the printed
              `kubeadm join ...` on the node. The join runs preflight,
              writes `/etc/kubernetes/kubelet.conf`, and starts the
              kubelet; with kubeadm defaults the node's CSR is
              auto-approved. 6. `kubectl get nodes`: appears, briefly
              NotReady, then Ready. Wait seconds, not minutes.

trap:         `kubeadm upgrade node` on a node that was never joined —
              upgrade-node expects a pre-existing kubelet.conf that only
              `kubeadm join` creates. Upgrading kubectl but not kubelet
              (or vice versa) leaves a version skew that the join
              accepts but graders catch. Forgetting unhold/hold.

docs:         https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/
              https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-token/
              https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-join/

## Q06 — apiserver cert: two reads, one renewal  ·  3 points  ·  ~4 min  ·  unit u13  ·  LOW

context:      Context `ck-amber`. Root on `amber-master-1`. The
              kube-apiserver runs as a static pod from
              `/etc/kubernetes/manifests/kube-apiserver.yaml`. The
              manifest sets `--tls-cert-file=/etc/kubernetes/pki/apiserver.crt`.
              This certificate is managed by kubeadm and is signed by
              the on-disk `/etc/kubernetes/pki/ca.key`; the cluster is
              not in external-CA mode. `/opt/exam/06/renew.sh` and
              `/opt/exam/06/expiry.txt` exist and are empty.

task:         Write two lines to `expiry.txt`: `openssl=<Not After
              value>` and `kubeadm=<apiserver expiry value>`. Extract the
              first from the apiserver's serving certificate with
              openssl (read the manifest; do not guess the path).
              Confirm the same value with kubeadm. Write into `renew.sh`
              the kubeadm command that renews exactly that certificate.

constraints:  The expiry must be verified by both openssl and kubeadm.
              The renewal command must target the apiserver certificate
              only (not all certificates). Write the command, do not run
              or need to run it.

verify:       1 pt: `expiry.txt`'s `openssl=` line parses to the same
              UTC instant as `openssl x509` reports on the cert path
              that the apiserver manifest serves.
              1 pt: `expiry.txt`'s `kubeadm=` line parses to the same
              UTC instant as `kubeadm certs check-expiration`'s
              `apiserver` row.
              1 pt: `renew.sh` contains `kubeadm certs renew apiserver`
              and nothing broader (no `renew all`).

expected path: 1. `grep tls-cert /etc/kubernetes/manifests/
              kube-apiserver.yaml` → the serving cert path you are
              graded on (read the manifest; do not guess the filename).
              2. `openssl x509 -in <path> -noout -text | grep -i -A2
              validity` → Not After, UTC; write `openssl=<value>` to
              `expiry.txt`. 3. `kubeadm certs check-expiration` → the
              `apiserver` row must match; if not, you opened the wrong
              file (left → return to step 1); write `kubeadm=<value>` to
              `expiry.txt`. 4. `kubeadm certs renew apiserver` targets
              one cert; write it to `renew.sh`.

trap:         openssl on the wrong cert (the apiserver only serves what
              its manifest points to); `renew all` when the task names
              one certificate; forgetting `-noout` and burying the date
              in the full certificate dump.

docs:         https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/
              https://kubernetes.io/docs/setup/best-practices/certificates/

## Q07 — two kubelet identities, four values  ·  8 points  ·  ~8 min  ·  unit u13

context:      Context `ck-amber`. `amber-worker-1` was added to the
              cluster with kubeadm and TLS bootstrapping. Kubelet config
              at `/etc/kubernetes/kubelet.conf` and
              `/var/lib/kubelet/config.yaml`. `/opt/exam/07/certs.txt`
              exists on the node and must use this template, preserving
              its line prefixes:

                  client issuer=<value>
                  client eku=<value>
                  serving issuer=<value>
                  serving eku=<value>
                  comparison=<issuer comparison and outbound-client/
                  inbound-server roles>

task:         On `amber-worker-1`, extract from the kubelet's client
              certificate and from its serving certificate — for each,
              the Issuer and the Extended Key Usage — into `certs.txt`
              using the required prefixes, then write the `comparison=`
              line describing who signed each certificate and which TLS
              direction each serves.

constraints:  All four values must come from the actual certificate
              files via openssl, not from documentation or memory. Both
              certificates must be reported. The `comparison=` line must
              mention both issuer and EKU roles.

verify:       2 pts: `client issuer=` matches the actual client
              certificate's Issuer, resolved via
              `/etc/kubernetes/kubelet.conf`.
              2 pts: `client eku=` contains TLS Web Client
              Authentication.
              2 pts: `serving issuer=` matches the actual serving
              certificate's Issuer — either the kubeadm-default
              self-signed certificate or a configured signed serving
              certificate.
              2 pts: `serving eku=` contains TLS Web Server
              Authentication, and `comparison=` states client = outbound
              / server = inbound for the kubelet's API and names both
              issuers.

expected path: 1. Read `/etc/kubernetes/kubelet.conf` to resolve the
              active client certificate, then read its Issuer and EKU.
              2. Resolve the serving certificate from the kubelet's
              `tlsCertFile`/runtime configuration; when no file is
              configured, inspect the kubelet-generated serving
              certificate under its certificate directory. 3. Client
              auth is the kubelet's outbound identity to the apiserver.
              Server auth is the inbound kubelet HTTPS identity. State
              that the apiserver validates its chain only when
              `--kubelet-certificate-authority` names the relevant CA.
              If both certs show the same issuer, the cluster uses
              signed serving certs and the discriminator is the EKU —
              keep both rows. 4. Write the four values and the
              comparison using the required prefixes.

trap:         reading only one certificate and reporting it as "the
              kubelet cert"; pasting the client issuer into the server
              row (the compare step exists to catch exactly this);
              trusting a filesystem guess for the client cert name
              instead of resolving it from `kubelet.conf`; assuming the
              serving certificate is always self-signed when the
              cluster may configure a signed one.

docs:         https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/
              https://kubernetes.io/docs/setup/best-practices/certificates/

## Q08 — an egress lockdown for a compromised workload  ·  10 points  ·  ~12 min  ·  unit u8

context:      Context `ck-amber`. Namespace `project-sentinel` contains
              stateful pods labelled `app=api`, `app=orders-db`,
              `app=users-db`, `app=secrets`. `orders-db` listens on TCP
              5432, `users-db` on TCP 6379, `secrets` on TCP 8443. No
              NetworkPolicies exist. The CNI is a conformant
              NetworkPolicy implementation. The `api` pods are not
              `hostNetwork` and contain the supplied TCP probe tool. The
              grader probes the current database Pod IPs directly;
              `orders-db` and `users-db` in this question are app-label
              values, not DNS names.

task:         After an incident, restrict egress so the `api` pods can
              reach only `orders-db` on 5432 and `users-db` on 6379.
              Every other destination must stop working — in particular,
              `secrets` on 8443 must no longer respond from `api`. The
              two databases must still work for `api`.

constraints:  A single NetworkPolicy named `np-api-egress` in
              `project-sentinel`. Selectors must be label-based, not
              IP-based. No `ingress` rules. The policy must not affect
              pods other than `app=api`. Do not change or delete Pods,
              controllers, Services, EndpointSlices, or their labels in
              `project-sentinel`.
                Checkable: those objects match the pre-question
                snapshot.

verify:       Scoring precondition: Pods, controllers, Services,
              EndpointSlices, and their labels in `project-sentinel`
              match the pre-question snapshot. If this precondition
              fails, score 0 for the question.
              2 pts: policy exists, `podSelector` matches `app=api`,
              `policyTypes` is `[Egress]`, and it has no ingress rules.
              2 pts: from an `api` pod, `<orders-db-pod-ip>:5432` still
              responds.
              2 pts: from an `api` pod, `<users-db-pod-ip>:6379` still
              responds.
              2 pts: from an `api` pod, `<secrets-pod-ip>:8443` does not
              respond.
              2 pts: the normalized egress rules allow TCP 5432 only to
              peers selected by `app=orders-db` and TCP 6379 only to
              peers selected by `app=users-db`; no rule allows any other
              peer, port, or protocol. Reject `ipBlock`, empty peers,
              extra peer alternatives, extra ports, and extra protocols.
              The runtime probes above are confirmation, not the only
              scope check.

expected path: 1. `kubectl -n project-sentinel get pods -o wide
              --show-labels` → the `app=` labels you will match, and the
              Pod IPs for `orders-db`, `users-db`, and `secrets` you will
              probe directly. 2. Baseline from an `api` pod: probe each
              Pod IP — `orders-db` and `users-db` respond,
              `secrets:8443` responds. Record this; after the policy you
              cannot re-probe the old state. 3. Write `np-api-egress`:
              `podSelector {app: api}`, `policyTypes: [Egress]`, two
              rules — each rule has its podSelector AND its port for one
              database in the same list item (`to:` with `podSelector`
              `app=orders-db`, `ports: [{protocol: TCP, port: 5432}]`,
              and the second with `app=users-db`, `port: 6379`). 4.
              Apply; re-run the probes: the two databases answer,
              `secrets` hangs. 5. If `secrets:8443` answers, first check
              whether the policy selects `api` and whether any rule
              permits TCP 8443. Separate `podSelector` and
              `namespaceSelector` peer items widen the peer set only on
              that rule's listed ports; detect that error by inspecting
              the normalized rule or by probing a non-database target on
              5432 and 6379. 6. Confirm non-`api` pods still reach
              everything (podSelector scoping), and that no Pod,
              controller, Service, EndpointSlice, or label changed.

trap:         sibling `to` entries that widen instead of intersect;
              skipping the before/after probes and then being unable to
              tell whether the policy works; probing by a Service DNS
              name when the grader probes Pod IPs directly; matching the
              namespace by its NAME string in a label selector instead
              of `kubernetes.io/metadata.name`; changing a Pod, Service,
              or label to force a probe result instead of fixing the
              policy.

docs:         https://kubernetes.io/docs/concepts/services-networking/network-policies/
              https://kubernetes.io/docs/reference/kubernetes-api/policy-resources/network-policy-v1/

## Q09 — etcd: snapshot, create, restore  ·  10 points  ·  ~14 min  ·  unit u11

context:      Context `ck-amber`. `amber-master-1` runs etcd as a static
              pod; `/etc/kubernetes/manifests/etcd.yaml` declares the
              client cert/key flags etcdctl needs. The static Pod uses
              etcd 3.6.8 and `etcdutl` is installed on the master.
              `/opt/exam/09/` is writable on the master. A grader-owned,
              immutable audit trace — outside your write access —
              records: the snapshot's content hash and the etcd revision
              at the moment you save it; the create revision of any Pod
              you create afterward (the marker Pod); any delete of that
              marker Pod; and whether `etcdutl snapshot restore` ran.

task:         Take a snapshot of etcd to `/opt/exam/09/snapshot.db` on
              the master, using etcdctl with flags read from the static
              manifest. Then create a marker Pod of your choice in the
              default namespace. Then restore from that snapshot. After
              the restore: the cluster must be functional, and the
              marker Pod must no longer exist.

constraints:  The restore must write into a directory that is not the
              live data directory. The marker Pod must be created AFTER
              the snapshot. You may not delete the marker Pod yourself
              to satisfy the task. All etcd commands must run against
              the master.

verify:       2 pts: `/opt/exam/09/snapshot.db` exists, and `etcdutl
              snapshot status /opt/exam/09/snapshot.db` reports the same
              content hash the audit trace recorded at save time — a
              non-empty file check alone is not an integrity check.
              2 pts: per the audit trace, the snapshot's recorded
              revision is strictly earlier than the marker Pod's create
              revision (confirms snapshot-then-create ordering, not
              merely a before/after file timestamp).
              2 pts: per the audit trace, `etcdutl snapshot restore` ran,
              and the restored etcd member's current revision falls
              within the bump range (snapshot revision + 1e9, plus
              whatever writes followed). A copied live data directory
              carries the live revision, not the bumped one, and fails
              this pair.
              2 pts: after restore, `kubectl get pods -A` shows
              kube-system healthy (apiserver, controller-manager,
              scheduler, etcd Running), and the marker Pod no longer
              exists in the default namespace. If the audit trace shows
              you deleted the marker Pod yourself, this pair scores 0
              regardless of the end state.
              2 pts: a brand-new Pod you create AFTER the restore
              schedules and Runs (cluster is functional, not merely
              listing).

expected path: 1. Read `/etc/kubernetes/manifests/etcd.yaml` for the
              endpoints, cacert, cert, and key flags; run
              `ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379
              --cacert=... --cert=... --key=... snapshot save
              /opt/exam/09/snapshot.db`. 2. Validate the snapshot with
              `etcdutl snapshot status /opt/exam/09/snapshot.db`; a
              non-empty file check alone is not an integrity check. 3.
              `kubectl run <name> --image=nginx` in the default
              namespace; confirm it Runs. This is the marker Pod,
              created after the snapshot on purpose. 4. Restore offline
              with `etcdutl snapshot restore /opt/exam/09/snapshot.db
              --data-dir=/var/lib/etcd-restored --bump-revision=1000000000
              --mark-compacted`. Do not pass endpoint or TLS flags to
              `etcdutl`. Restoring over the live data dir while etcd
              owns it clobbers the cluster. The audit checks both that
              this command ran and that the resulting member's revision
              actually landed in the bumped range — copying an existing
              data directory to a new path skips both. 5. Cut over: edit
              `etcd.yaml` so the `etcd-data` hostPath points at
              `/var/lib/etcd-restored`; save; the kubelet restarts the
              static etcd pod. Expect seconds of connection refused. 6.
              After a minute, `kubectl get pods -A`: the marker Pod is
              absent — the keyspace was rewound to the snapshot moment
              and the Pod never existed in it. Then create a fresh Pod
              to prove the cluster accepts writes.

trap:         copying the live data directory (`cp -a /var/lib/etcd
              /var/lib/etcd-restored`) instead of running `etcdutl
              snapshot restore`, then pointing `etcd-data` at the copy —
              it looks like a new restored directory, but the audit
              shows no restore ran and the member's revision never
              entered the bump range, so it fails that pair; deleting
              the marker Pod yourself to force the gone-Pod check, which
              the audit catches and zeroes that pair outright;
              restoring onto the live data directory (etcd fails and the
              cluster has no serving member); editing the manifest but
              not the hostPath, so nothing changes and "nothing
              happened" is the only clue; panicking at the connection-
              refused window and restarting everything; snapshotting and
              restoring to the same path so the backup is overwritten;
              passing `--endpoints`/TLS flags to `etcdutl`, which does
              not take them; using `etcdctl snapshot restore`, which
              etcd 3.6 removed.

docs:         https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/
              https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/
