import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const StatefulLimit: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const sts = appear(t, 0.1, 0.2);
  const kill = seg(t, 0.4, 0.5);
  const returns = seg(t, 0.55, 0.68);
  const callout = appear(t, 0.7, 0.8);
  const footer = appear(t, 0.88, 0.96);

  const ordinals = [
    { name: 'app-0', pvc: 'pvc-0' },
    { name: 'app-1', pvc: 'pvc-1', killed: true },
    { name: 'app-2', pvc: 'pvc-2' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 26, paddingLeft: 110, paddingRight: 110 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 30 }}>
        a StatefulSet provides identity and ordering — not replication, consistency or failover
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 80, alignItems: 'flex-start' }}>
        {/* the StatefulSet */}
        <div style={{ opacity: sts, width: 640 }}>
          <Label color={PALETTE.violet} size={12} style={{ marginBottom: 14 }}>StatefulSet — three ordinals</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ordinals.map((o) => {
              const gone = o.killed && kill > 0 && returns === 0;
              const back = o.killed && returns > 0;
              const killedFlash = o.killed && kill > 0;
              return (
                <div
                  key={o.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '10px 16px',
                    border: `1px solid ${killedFlash ? (back ? PALETTE.good : PALETTE.bad) : PALETTE.violet}`,
                    borderRadius: 12,
                    background: killedFlash ? (back ? `${PALETTE.good}12` : `${PALETTE.bad}12`) : `${PALETTE.violet}0c`,
                    opacity: gone ? 0.35 : 1,
                  }}
                >
                  <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, width: 120 }}>{o.name}</span>
                  <span style={{ fontFamily: MONO, color: o.killed ? PALETTE.good : PALETTE.muted, fontSize: 14, fontWeight: 800, flex: 1 }}>
                    {back ? `returns · same name, same ${o.pvc} bound` : gone ? '✕ killed' : `PVC ${o.pvc}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* what it does not do */}
        <div style={{ opacity: callout, width: 480, border: `1px dashed ${PALETTE.line}`, borderRadius: 18, padding: 18 }}>
          <Label color={PALETTE.muted} size={12} style={{ marginBottom: 14 }}>what a StatefulSet does not do</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 18, fontWeight: 800, textDecoration: 'line-through', margin: '8px 0', opacity: 0.6 }}>✕ no data replicated</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 18, fontWeight: 800, textDecoration: 'line-through', margin: '8px 0', opacity: 0.6 }}>✕ no leader elected</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 12 }}>
            replication and failover are properties of the software inside the pod
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 30, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>it can only guarantee the pod that comes back is recognisably the same one</Label>
      </div>
    </div>
  );
};
