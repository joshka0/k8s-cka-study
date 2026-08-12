# Backend spike: apple/container + kiac

Ran 2026-08-12 to decide the substrate for the lab before writing content on
top of it. macOS 26.5.2, Apple silicon, `container` 1.2.2, `kiac` v0.5.0.

The question was not "does Kubernetes run" — it obviously does. It was whether
a cluster we deliberately **break** behaves honestly, because every runtime
quirk becomes a "is this fault mine or the platform's?" question inside a
grader.

## Result

| # | Check | Verdict |
| --- | --- | --- |
| 1 | Multi-node kubeadm cluster | **pass** — 3 nodes in 2m13s, v1.36.1, real kubeadm, real etcd, containerd 2.3.1, one VM and one kernel per node |
| 2 | Kubelet breakage reaches the API | **pass** — `systemctl stop kubelet` → NotReady in ~50s; restart → Ready in seconds |
| 3 | etcd snapshot and status | **pass** — the exam's own `etcdctl` invocation with the real cert paths; `etcdutl snapshot status` verifies the file |
| 4 | `kubeadm upgrade` feasible | **conditional pass** — `kubeadm` is present and the k8s apt repo is reachable, but only after fixing DNS in the node VM (below) |
| 5 | NetworkPolicy enforcement | **open** — needs Cilium on the full kernel; first two attempts failed on a missing `cilium-cli` and then on an install timeout |
| 6 | Node stop/start under a scenario | **pass with a constraint** — node returns Ready and schedules Pods, but its **IP changes** (`.64.4` → `.64.6`) |

Four of six clean, one conditional, one open. Enough to build on: every
scenario written so far targets the passing set.

## What has to be designed around

**A node VM gets a new IP on every start.** Verified: worker-1 came back on a
different address and rejoined fine. So no scenario may pin a node by IP, and
any setup or grader that runs after a node restart must re-read node
addresses. Encoded in `tools/backend.mjs`.

**The node VM cannot resolve public DNS.** `/etc/resolv.conf` points at
`192.168.64.1`, which answers for cluster-local names but not for
`pkgs.k8s.io`. Egress itself works — a direct fetch of `1.1.1.1` returns 301,
and with `nameserver 1.1.1.1` written into the VM the k8s apt repo returns
302. So the upgrade scenario ships that one-line fix in its setup rather than
asking the candidate to debug our substrate.

**`container exec` has no shell.** `kubectl exec … -- sh -c '…'` fails with
`exec: "sh": executable file not found`. Commands are argv arrays, never shell
strings; `etcdctl` and `etcdutl` are on PATH in the etcd Pod, so this costs
nothing but has to be known.

**Cilium is not free.** Apple's bundled kernel has no VXLAN, no
`br_netfilter`, no BPF and no loadable modules, so the stock CNI is kindnet —
which does not enforce NetworkPolicy at all. NetworkPolicy scenarios therefore
need `--cni cilium --kernel full` plus `cilium-cli` on the host, and the
install is slow enough to exceed kiac's default wait on a cold image cache.
That is why the lab keeps a separate `netpol` tier instead of one cluster for
everything.

## Not tested

`kubeadm upgrade` end to end, node join, and etcd **restore** (as opposed to
snapshot). These belong to the lifecycle tier, which runs disposable
per-scenario clusters. The signals are good — real kubeadm, real static pods,
reachable package repo — but "signals are good" is not evidence, and no
lifecycle scenario ships until the harness proves one.

## Why not the alternatives

- **k3s / k3d** — sqlite instead of etcd, no kubeadm anywhere, bundled Traefik
  and servicelb. A candidate debugging "where is etcd?" learns k3s, not the
  CKA. Out for this course specifically.
- **OrbStack machines** — works, and stays the documented fallback. One shared
  kernel means non-namespaced sysctls leak between "nodes" and a node cannot
  own its kernel; apple/container gives a kernel per node, which is what
  "real VM" was supposed to mean.
- **kind** — still the right *fast* tier and worth adding later for the
  scenarios that never touch node internals. It cannot host `kubeadm upgrade`
  at all.
