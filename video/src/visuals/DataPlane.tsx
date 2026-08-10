import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Horizontal, Label, SANS, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Shared pilot component; module 08 beat 5 extends it. The pilot beat has no
 * `module` prop and renders exactly as before; module 08 renders the extended
 * version — one unchanged Service manifest feeding four interchangeable
 * data-plane implementations, with the implementation swapping underneath
 * while the manifest stays visibly identical. No ranking here; that is the
 * next beat.
 */
export const DataPlane: React.FC<VisualProps> = ({ module }) => {
  if (module?.module.number === 8) return <ModuleDataPlane />;
  return <PilotDataPlane />;
};

/** The pilot beat — unchanged. */
const PilotDataPlane: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const left = appear(t, 0.08, 0.4);
  const right = appear(t, 0.42, 0.7);
  const banner = appear(t, 0.5, 0.6);

  const packetU = seg(t, 0.18, 0.38);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* shared banner */}
      <div style={{ textAlign: 'center', marginBottom: 24, opacity: banner }}>
        <span
          style={{
            fontFamily: MONO,
            color: PALETTE.cyan,
            border: `1px solid ${PALETTE.blue}`,
            borderRadius: 999,
            padding: '8px 22px',
            fontSize: 20,
            fontWeight: 900,
            background: `${PALETTE.blue}18`,
          }}
        >
          same Service API — implementations, not APIs
        </span>
      </div>

      <div style={{ display: 'flex', gap: 30, justifyContent: 'center' }}>
        {/* LEFT: kube-proxy + iptables/ipvs/nftables */}
        <Box pad={16} style={{ width: 720, opacity: left }}>
          <Label color={PALETTE.violet} size={12} style={{ marginBottom: 10 }}>kube-proxy · iptables / IPVS / nftables</Label>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div
              style={{
                fontFamily: MONO,
                color: PALETTE.ink,
                fontSize: 15,
                fontWeight: 800,
                border: '1px solid #33415e',
                borderRadius: 8,
                padding: '10px 12px',
                background: '#0d1522',
                whiteSpace: 'nowrap',
                opacity: packetU > 0 ? 1 : 0.4,
              }}
            >
              pkt → dst 10.96.0.1
            </div>
            <span style={{ color: PALETTE.good, fontSize: 22, fontWeight: 900 }}>{packetU > 0.35 ? 'DNAT →' : '→'}</span>
            <div
              style={{
                fontFamily: MONO,
                color: PALETTE.good,
                fontSize: 15,
                border: `1px solid ${PALETTE.good}`,
                borderRadius: 8,
                padding: '10px 12px',
                background: `${PALETTE.good}12`,
                opacity: packetU > 0.5 ? 1 : 0.4,
              }}
            >
              pod IP 10.0.0.16
            </div>
          </div>
          <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 16, lineHeight: 1.8 }}>
            <div style={{ color: PALETTE.muted }}># rules your proxy writes</div>
            <div style={{ color: PALETTE.ink }}>{'-A KUBE-SVC -d 10.96.0.1 -j DNAT --to 10.0.0.16:8080'}</div>
          </div>
        </Box>

        {/* RIGHT: eBPF */}
        <Box pad={16} style={{ width: 720, opacity: right }}>
          <Label color={PALETTE.cyan} size={12} style={{ marginBottom: 10 }}>eBPF data plane</Label>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14 }}>socket layer</div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 16,
                  fontWeight: 800,
                  border: `1px solid ${PALETTE.cyan}`,
                  borderRadius: 8,
                  padding: '10px',
                  background: `${PALETTE.cyan}10`,
                  marginTop: 6,
                }}
              >
                translate before the packet is built
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, marginTop: 10 }}>conntrack lives in BPF maps, not netfilter</div>
            </div>
            <div style={{ width: 250 }}>
              <Label color={PALETTE.good} size={11}>BPF map · conntrack</Label>
              {['10.96.0.1 → 10.0.0.16', '10.96.0.1:443 → …', '10.96.0.1:80 → …'].map((r) => (
                <div key={r} style={{ fontFamily: MONO, fontSize: 13, color: PALETTE.good, borderBottom: '1px solid #223', padding: '6px 4px' }}>
                  {r}
                </div>
              ))}
            </div>
          </div>
        </Box>
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: appear(t, 0.72, 0.82) }}>
        <Label color={PALETTE.muted} size={13}>eBPF moves where the state lives; it does not remove connection tracking</Label>
      </div>
    </div>
  );
};

/**
 * Module 08 beat 5 — implementations, not APIs. One unchanged Service
 * manifest at the top feeds four interchangeable implementations below; the
 * implementation swaps underneath while the manifest stays identical.
 */

const IMPLS = [
  { name: 'iptables', kind: 'kube-proxy mode' },
  { name: 'IPVS', kind: 'kube-proxy mode' },
  { name: 'nftables', kind: 'kube-proxy mode' },
  { name: 'eBPF', kind: 'separate implementation' },
];

const ModuleDataPlane: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const manifestIn = appear(t, 0.06, 0.14);
  const implIn = IMPLS.map((_, i) => appear(t, 0.16 + i * 0.07, 0.24 + i * 0.07));
  const swapStart = 0.5;
  const swapPulse = 0.5 + 0.5 * Math.sin(frame / 7);
  const active = Math.floor(((t - swapStart) * IMPLS.length) % IMPLS.length);
  const swapping = t > swapStart;
  const footer = appear(t, 0.84, 0.92);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 1620, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>iptables, IPVS and nftables are kube-proxy modes — an eBPF data plane is a separate implementation that can replace it entirely</Label>
        </div>

        {/* the manifest — identical, always */}
        <div
          style={{
            position: 'absolute',
            left: 410,
            top: 42,
            width: 800,
            border: `2px solid ${PALETTE.blue}`,
            borderRadius: 16,
            background: '#0a1019',
            padding: '16px 22px',
            opacity: manifestIn,
            boxShadow: `0 0 26px ${PALETTE.blue}33`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Label color={PALETTE.blue} size={12}>Service manifest — unchanged</Label>
            <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 13, fontWeight: 900 }}>identical below every implementation</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 17, lineHeight: 1.75, color: PALETTE.ink }}>
            <div><span style={{ color: PALETTE.muted }}>apiVersion:</span> v1</div>
            <div><span style={{ color: PALETTE.muted }}>kind:</span> Service</div>
            <div><span style={{ color: PALETTE.muted }}>metadata:</span> my-svc</div>
            <div><span style={{ color: PALETTE.muted }}>spec:</span> clusterIP 10.0.0.1 · selector app=api · ports 80→8080</div>
          </div>
        </div>

        {/* the four implementations */}
        <div style={{ position: 'absolute', left: 100, top: 264, width: 1420, display: 'flex', gap: 20, justifyContent: 'center' }}>
          {IMPLS.map((im, i) => {
            const on = implIn[i];
            const swapped = swapping && active === i;
            return (
              <div
                key={im.name}
                style={{
                  width: 340,
                  borderRadius: 16,
                  border: `2px solid ${swapped ? PALETTE.good : on > 0.5 ? PALETTE.violet : PALETTE.line}`,
                  background: swapped ? `${PALETTE.good}12` : on > 0.5 ? `${PALETTE.violet}0e` : PALETTE.panel,
                  boxShadow: swapped ? `0 0 26px ${PALETTE.good}44` : 'none',
                  padding: '18px 20px',
                  textAlign: 'center',
                  opacity: Math.max(0.32, on),
                }}
              >
                <div style={{ fontFamily: MONO, color: swapped ? PALETTE.good : PALETTE.ink, fontSize: 24, fontWeight: 900 }}>
                  {im.name}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    color: im.kind === 'separate implementation' ? PALETTE.cyan : PALETTE.muted,
                    fontSize: 13.5,
                    fontWeight: 800,
                    marginTop: 8,
                  }}
                >
                  {im.kind}
                </div>
                {swapped && (
                  <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 14, fontWeight: 900, marginTop: 10, opacity: swapPulse }}>
                    ▼ swapped in — manifest untouched
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* connecting lines between manifest and implementations */}
        <div style={{ position: 'absolute', left: 410, top: 214, width: 800, textAlign: 'center', fontFamily: MONO, color: PALETTE.blue, fontSize: 22, fontWeight: 900, opacity: manifestIn }}>
          │ │ │ │
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the Service types stay constant too — ClusterIP inside, NodePort on every node, LoadBalancer from an external implementation — all three still use endpoints</Label>
        </div>
      </div>
    </div>
  );
};
