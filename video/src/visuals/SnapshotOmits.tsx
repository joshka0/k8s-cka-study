import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 11 beat 8 — what the snapshot omits. The snapshot is a container
 * holding API objects; beside it, everything recovery also needs sits
 * visibly outside it: certificates, static Pod manifests, load balancer
 * configuration, volume data. The outside items get equal weight to the
 * inside — the omissions are the content, not a caveat.
 */

const OUTSIDE = [
  { name: 'certificates', note: "PKI — the API can't serve without them" },
  { name: 'static Pod manifests', note: 'what brings the control plane up' },
  { name: 'load balancer configuration', note: 'where clients actually point' },
  { name: 'volume data', note: 'the state the workloads live or die on' },
];

export const SnapshotOmits: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const snapIn = appear(t, 0.08, 0.18);
  const objectOn = [0, 1, 2, 3, 4].map((_, i) => appear(t, 0.12 + i * 0.06, 0.2 + i * 0.06));
  const outsideIn = appear(t, 0.46, 0.56);
  const outsideOn = OUTSIDE.map((_, i) => appear(t, 0.5 + i * 0.08, 0.6 + i * 0.08));
  const footer = appear(t, 0.88, 0.94);

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
      <div style={{ width: 1620, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>the snapshot holds the API objects — recovery needs what it does not hold</Label>
        </div>

        {/* inside the snapshot */}
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: 76,
            width: 520,
            borderRadius: 18,
            border: `2px solid ${PALETTE.blue}66`,
            background: `${PALETTE.blue}04`,
            padding: '18px 22px',
            opacity: snapIn,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Label color={PALETTE.blueInk} size={12.5}>inside — the snapshot (etcd)</Label>
            <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 800 }}>snapshot.db</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Deployments', 'Secrets', 'ConfigMaps', 'CRs', 'Roles', 'Services', 'StatefulSets', 'PVCs'].map((o, i) => (
              <span
                key={o}
                style={{
                  fontFamily: MONO,
                  fontSize: 13.5,
                  fontWeight: 800,
                  color: PALETTE.ink,
                  border: `1px solid ${PALETTE.blue}55`,
                  borderRadius: 8,
                  background: `${PALETTE.blue}0a`,
                  padding: '7px 12px',
                  opacity: Math.max(0.3, objectOn[Math.min(i, 4)]),
                }}
              >
                {o}
              </span>
            ))}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 12 }}>
            API objects — the desired state, as it was stored
          </div>
        </div>

        {/* the symbol between */}
        <div style={{ position: 'absolute', left: 680, top: 300, fontFamily: MONO, color: PALETTE.amber, fontSize: 44, fontWeight: 900, opacity: appear(t, 0.4, 0.5) }}>
          +
        </div>

        {/* outside the snapshot */}
        <div style={{ position: 'absolute', left: 760, top: 76, width: 720, opacity: outsideIn }}>
          <Label color={PALETTE.amber} size={12.5} style={{ marginBottom: 12 }}>outside — not in any snapshot, just as required</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {OUTSIDE.map((o, i) => (
              <div
                key={o.name}
                style={{
                  borderRadius: 14,
                  border: `2px solid ${outsideOn[i] > 0.5 ? PALETTE.amber : PALETTE.line}`,
                  background: outsideOn[i] > 0.5 ? `${PALETTE.amber}0a` : PALETTE.panel,
                  padding: '16px 18px',
                  opacity: Math.max(0.3, outsideOn[i]),
                }}
              >
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17.5, fontWeight: 900 }}>{o.name}</div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6, lineHeight: 1.4 }}>{o.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* the verdict */}
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: 520,
            width: 1340,
            borderRadius: 16,
            border: `1px solid ${PALETTE.amber}66`,
            background: `${PALETTE.amber}08`,
            padding: '14px 22px',
            textAlign: 'center',
            opacity: appear(t, 0.72, 0.82),
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>
            a restore needs <span style={{ color: PALETTE.blue }}>the snapshot</span> and{' '}
            <span style={{ color: PALETTE.amber }}>everything beside it</span> — the omissions are the content of this beat, not a caveat
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>snapshot alone is not recovery — certificates, manifests, balancers and volume data are part of the rebuild</Label>
        </div>
      </div>
    </div>
  );
};
