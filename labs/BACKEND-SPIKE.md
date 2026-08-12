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
| 5 | NetworkPolicy enforcement | **pass** — Cilium on the full kernel: deny-all blocks (curl times out), a targeted allow restores HTTP 200 |
| 6 | Node stop/start under a scenario | **pass with a constraint** — node returns Ready and schedules Pods, but its **IP changes** (`.64.4` → `.64.6`) |

Six of six, one of them conditional on a fix we ship ourselves.

## One defect explained two failures

Cilium looked like a kernel problem for three runs. It was not: the full
kernel carries everything it needs (`CONFIG_VXLAN`, `CONFIG_BRIDGE_NETFILTER`,
`CONFIG_BPF_JIT`, `CONFIG_DEBUG_INFO_BTF`, all `=y`, verified on the node).
The actual error was

    failed to pull ... lookup quay.io on 192.168.64.1:53: i/o timeout

which is the **same broken resolver** that blocked the `kubeadm upgrade`
package fetch. A `kindest/node` cluster comes up regardless because every
image it needs is pre-baked; the fault only appears when something has to pull
from a registry. Writing a working nameserver into the node VMs and restarting
containerd fixed both, and Cilium went Running within a minute.

Worth stating plainly because it nearly cost the right decision: three
consecutive failures pointed at the exotic explanation (Apple's kernel is too
minimal for eBPF) when the boring one was already in the notes from check 4.

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

**The etcd Pod has no shell.** `kubectl exec etcd-… -- sh -c '…'` fails with
`exec: "sh": executable file not found` — that image is distroless, and the
`sh -c` wrapper most etcd runbooks use does not work. Commands must be argv
arrays; `etcdctl` and `etcdutl` are on PATH there, so this costs nothing but
has to be known. (`container exec` into a node VM does have a shell.)

**NetworkPolicy needs its own tier.** Apple's bundled kernel has no VXLAN, no
`br_netfilter`, no BPF and no loadable modules, so the stock CNI is kindnet —
which does not enforce NetworkPolicy at all, and would grade policy scenarios
as passing while enforcing nothing. Policy scenarios therefore run on
`--cni cilium --kernel full`, with `cilium-cli` on the host and the resolver
fix applied to the node VMs before the install. That tier costs a few minutes
to create, which is why it is separate rather than the default.

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
