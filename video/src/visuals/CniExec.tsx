import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { Beat } from '../script';
import { appear, seg } from '../motion';

export const CniExec: React.FC<{ beat: Beat }> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const envIn = appear(t, 0.06, 0.18);
  const stdinIn = appear(t, 0.14, 0.26);
  const run = seg(t, 0.28, 0.45);
  const runExit = seg(t, 0.45, 0.52);
  const stdoutIn = seg(t, 0.5, 0.68);
  const ipamIn = seg(t, 0.58, 0.72);
  const vethIn = seg(t, 0.78, 0.95);

  const ipamOffset = appear(t, 0.58, 0.7);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
      <Box mono pad={18} style={{ width: 1440, background: '#0a1019' }}>
        {/* window chrome */}
        <div style={{ display: 'flex', gap: 8, paddingBottom: 10, borderBottom: `1px solid ${PALETTE.line}` }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ marginLeft: 12, color: PALETTE.muted, fontSize: 14, fontFamily: MONO }}>runtime → cni exec</span>
        </div>

        {/* env vars */}
        <div style={{ marginTop: 14, opacity: envIn }}>
          <Label color={PALETTE.muted} size={11}>environment</Label>
          {['CNI_COMMAND=ADD', 'CNI_NETNS=<sandbox ns>', 'CNI_IFNAME=eth0'].map((e) => (
            <div key={e} style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 19, fontWeight: 700 }}>{e}</div>
          ))}
        </div>

        {/* stdin */}
        <div style={{ marginTop: 12, opacity: stdinIn }}>
          <Label color={PALETTE.muted} size={11}>stdin (JSON config)</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 17 }}>
            {"$ echo '{ \"cniVersion\": \"1.0\", \"type\": \"cilium|calico|…\" }' |"}
          </div>
        </div>

        {/* plugin binary */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Assignee on={envIn > 0.7} />
          <div
            style={{
              fontFamily: MONO,
              color: PALETTE.ink,
              fontSize: 18,
              fontWeight: 800,
              border: `1px solid ${run > 0 ? PALETTE.violet : PALETTE.line}`,
              borderRadius: 8,
              padding: '10px 16px',
              background: run > 0 ? `${PALETTE.violet}18` : '#0d1522',
              opacity: appear(t, 0.26, 0.34),
            }}
          >
            CNI plugin — a binary, not a daemon
          </div>
          <span
            style={{
              fontFamily: MONO,
              color: runExit > 0.3 ? PALETTE.good : PALETTE.muted,
              fontSize: 17,
              fontWeight: 800,
            }}
          >
            {runExit > 0.3 ? '→ exit 0' : run > 0.02 ? 'running…' : ''}
          </span>
        </div>

        {/* The delegation is the point of this beat, so give it its own nested
            exec block rather than a caption squeezed against the right edge. */}
        <div
          style={{
            marginLeft: 74,
            marginTop: 12,
            borderLeft: `2px solid ${PALETTE.good}55`,
            paddingLeft: 18,
            opacity: ipamIn,
            transform: `translateY(${(1 - ipamOffset) * 14}px)`,
          }}
        >
          <div
            style={{
              border: `1px solid ${PALETTE.good}77`,
              borderRadius: 10,
              background: `${PALETTE.good}12`,
              padding: '12px 18px',
              display: 'inline-block',
            }}
          >
            <Label color={PALETTE.good} size={11}>
              delegated exec · same contract, one level down
            </Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 800, marginTop: 4 }}>
              ipam plugin <span style={{ color: PALETTE.muted, fontWeight: 600 }}>(host-local)</span>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 17, marginTop: 6 }}>
              ↳ returns {ipamIn > 0.45 ? '{ ip: 10.0.0.16, gateway, routes }' : '…'}
            </div>
          </div>
        </div>

        {/* stdout result */}
        <div style={{ marginTop: 16, opacity: stdoutIn }}>
          <Label color={PALETTE.muted} size={11}>stdout (JSON result)</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 18, lineHeight: 1.7 }}>
            {stdoutIn > 0.15 && <>{"{ \"ips\": [\"10.0.0.16\"], \"routes\": […], \"dns\": {…} }"}</>}
          </div>
        </div>
      </Box>

      {/* veth appears inside sandbox */}
      <div style={{ display: 'flex', justifyContent: 'center', opacity: vethIn }}>
        <div
          style={{
            border: `2px solid ${PALETTE.cyan}`,
            borderRadius: 18,
            background: `${PALETTE.cyan}0f`,
            padding: '18px 60px',
            textAlign: 'center',
          }}
        >
          <Label color={PALETTE.cyan} size={12}>pod namespace</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 30, fontWeight: 900, margin: '6px 0 2px' }}>
            veth0 · 10.0.0.16
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15 }}>
            whose IP? an IPAM plugin ← invoked by a CNI plugin ← invoked by the runtime
          </div>
        </div>
      </div>
    </div>
  );
};

function Assignee({ on }: { on: boolean }) {
  return (
    <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 16, fontWeight: 700, opacity: on ? 1 : 0.3 }}>
      $ run
    </span>
  );
}
