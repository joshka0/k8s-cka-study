#!/usr/bin/env node
/* The one surface the lab runner uses to touch a cluster.
 *
 * Everything a scenario's setup/grade/solution does routes through here, so
 * the substrate (kiac on apple/container today; kind or real VMs tomorrow) is
 * a single swappable module rather than a detail smeared through 150 shell
 * scripts. The spike in reports/backend-spike.md validated every operation
 * below against kiac v0.5.0.
 *
 *   import { backend } from './backend.mjs';
 *   const b = backend('kiac');
 *   await b.ensureCluster('systems', { workers: 2 });
 *   await b.nodeExec('systems', 'worker-2', ['systemctl', 'stop', 'kubelet']);
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);

/* Two cluster tiers, named by role rather than by node count so a scenario
 * asks for what it needs, not for a topology.
 *
 *   systems  multi-node kubeadm — scheduling, drain, kubelet breakage, RBAC,
 *            quota, storage, services, DNS. The default for most scenarios.
 *   netpol   the full-kernel Cilium cluster — only NetworkPolicy scenarios
 *            need it, because Apple's bundled kernel has no VXLAN, no
 *            br_netfilter, and no loadable modules, so kindnet (which does not
 *            enforce NetworkPolicy anyway) is all the stock kernel can run.
 *
 * The lifecycle tier (etcd restore, kubeadm upgrade, node join) uses
 * disposable single-purpose clusters created per scenario, not a shared one —
 * added when the first lifecycle scenario lands.
 */
const CLUSTERS = {
  systems: { name: 'cka-systems', workers: 2, args: [] },
  netpol: { name: 'cka-netpol', workers: 1, args: ['--cni', 'cilium', '--kernel', 'full'] },
};

function kiacBackend() {
  const ctx = (tier) => `kiac-${CLUSTERS[tier].name}`;
  const nodeVM = (tier, node) =>
    node === 'control-plane' ? `${ctx(tier).replace('kiac-', 'kiac-')}` // filled below
      : null;

  // kiac names the VMs kiac-<clustername>-control-plane / -worker-N.
  const vmName = (tier, node) => `kiac-${CLUSTERS[tier].name}-${node}`;

  return {
    /** kubectl against a tier's context. Args are passed through verbatim. */
    async kubectl(tier, args, opts = {}) {
      return exec('kubectl', ['--context', ctx(tier), ...args], { maxBuffer: 1 << 24, ...opts });
    },

    /* Run a command inside a node's VM. This is how a scenario breaks or
     * inspects node-level state — stop the kubelet, corrupt a static-pod
     * manifest, read a systemd unit. `container exec` puts no shell in the
     * path, and flags cannot precede the plugin verb, so args are an argv
     * array and never a shell string. */
    async nodeExec(tier, node, argv) {
      return exec('container', ['exec', vmName(tier, node), ...argv], { maxBuffer: 1 << 24 });
    },

    /* etcd operations run inside the etcd static Pod, with the certs the exam
     * expects. etcdctl/etcdutl are on PATH there; `sh` is not, so no shell
     * wrapper. Matches the real CKA etcd backup command exactly. */
    async etcdctl(tier, argv) {
      const certs = [
        '--cacert=/etc/kubernetes/pki/etcd/ca.crt',
        '--cert=/etc/kubernetes/pki/etcd/server.crt',
        '--key=/etc/kubernetes/pki/etcd/server.key',
        '--endpoints=https://127.0.0.1:2379',
      ];
      return this.kubectl(tier, ['-n', 'kube-system', 'exec',
        `etcd-kiac-${CLUSTERS[tier].name}-control-plane`, '--', 'etcdctl', ...certs, ...argv]);
    },

    /* Stop/start a whole node VM. State returns because kubelet is Restart=on
     * and static pods restart — but the VM gets a NEW IP on start (verified),
     * so a scenario must never pin a node by IP, and setup must re-read node
     * addresses after any restart. */
    async nodeStop(tier, node) { return exec('container', ['stop', vmName(tier, node)]); },
    async nodeStart(tier, node) { return exec('container', ['start', vmName(tier, node)]); },

    /* Give the node VMs a working resolver.
     *
     * They boot pointing at the vmnet gateway, which answers cluster-local
     * names but times out on public ones. A kindest/node cluster hides this
     * because its images are pre-baked — it only surfaces when something
     * pulls from a registry or fetches a package, which is exactly what a
     * Cilium install and a kubeadm upgrade do. Three Cilium installs failed
     * on this and read as an eBPF kernel limitation.
     *
     * Call after creating any cluster whose scenarios pull anything. */
    async fixResolver(tier, nodes) {
      for (const node of nodes) {
        await this.nodeExec(tier, node, ['sh', '-c',
          'printf "nameserver 1.1.1.1\\nnameserver 8.8.8.8\\n" > /etc/resolv.conf']);
        await this.nodeExec(tier, node, ['systemctl', 'restart', 'containerd']).catch(() => {});
      }
    },

    /** Create the tier's cluster if it is not already up. */
    async ensureCluster(tier) {
      const c = CLUSTERS[tier];
      const { stdout } = await exec('kubectl', ['config', 'get-contexts', '-o', 'name']).catch(() => ({ stdout: '' }));
      if (stdout.split('\n').includes(ctx(tier))) {
        const ok = await this.kubectl(tier, ['get', 'nodes']).then(() => true).catch(() => false);
        if (ok) return { created: false };
      }
      await exec('kiac', ['create', 'cluster', '--name', c.name, '--workers', String(c.workers), ...c.args],
        { maxBuffer: 1 << 24 });
      return { created: true };
    },

    /** Tear a tier down between scenario runs when a clean slate is needed. */
    async destroyCluster(tier) {
      return exec('kiac', ['delete', 'cluster', '--name', CLUSTERS[tier].name]).catch(() => {});
    },

    tierContext: ctx,
    tierVM: vmName,
  };
}

const BACKENDS = { kiac: kiacBackend };

export function backend(name = 'kiac') {
  const make = BACKENDS[name];
  if (!make) throw new Error(`unknown backend "${name}"; have: ${Object.keys(BACKENDS).join(', ')}`);
  return make();
}
