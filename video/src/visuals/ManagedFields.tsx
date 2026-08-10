import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const FIELDS = [
  { path: 'spec.template', owner: 'Deployment' },
  { path: 'metadata.annotations', owner: 'service-mesh' },
  { path: 'spec.replicas', owner: 'HPA' },
];

export const ManagedFields: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const t = frame / durationInFrames;

  const rowsIn = (i: number) => appear(t, 0.1 + i * 0.08, 0.16 + i * 0.08);
  const conflict = appear(t, 0.42, 0.5);
  const fighting = seg(t, 0.58, 0.9);
  const footer = appear(t, 0.9, 0.97);

  // ownership flips rapidly once fighting starts — reads as a fight
  const tick = Math.floor((frame / fps) * 6);
  const replicasOwner = fighting > 0 ? (tick % 2 === 0 ? 'HPA' : 'applier') : 'HPA';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 150, paddingRight: 150 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        server-side apply tracks ownership per field path — managed fields
      </Label>

      <Box pad={20} borderColor={PALETTE.blue} style={{ width: 980, margin: '0 auto' }}>
        <Label color={PALETTE.muted} size={11} style={{ marginBottom: 12 }}>object · managed fields</Label>
        {FIELDS.map((f, i) => {
          const isReplicas = f.path === 'spec.replicas';
          const on = rowsIn(i);
          const owner = isReplicas ? replicasOwner : f.owner;
          const contested = isReplicas && fighting > 0;
          return (
            <div
              key={f.path}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderTop: `1px solid ${PALETTE.line}`,
                borderRadius: 10,
                opacity: on,
                background: contested ? `${PALETTE.amber}14` : 'transparent',
              }}
            >
              <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 800 }}>{f.path}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {contested && <span style={{ color: PALETTE.bad, fontSize: 22 }}>⚔</span>}
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 17,
                    fontWeight: 900,
                    color: contested ? PALETTE.amber : PALETTE.cyan,
                    border: `1px solid ${contested ? PALETTE.amber : PALETTE.cyan}`,
                    borderRadius: 999,
                    padding: '4px 14px',
                    background: contested ? `${PALETTE.amber}18` : 'transparent',
                  }}
                >
                  {owner}
                </span>
              </div>
            </div>
          );
        })}
      </Box>

      {conflict > 0 && (
        <div style={{ textAlign: 'center', marginTop: 18, opacity: conflict }}>
          <Box pad={12} borderColor={PALETTE.bad} bg={`${PALETTE.bad}12`} style={{ display: 'inline-block' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 20, fontWeight: 900 }}>
              apply claims spec.replicas — already owned by the HPA → conflict
            </span>
          </Box>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 22, opacity: appear(t, 0.6, 0.68) }}>
        <Label color={PALETTE.amber} size={12}>forcing the apply takes the field — the previous owner sets it back on its next reconcile</Label>
      </div>

      <div style={{ textAlign: 'center', marginTop: 14, opacity: footer }}>
        <Label color={PALETTE.amber} size={14}>you have built a fight, not a fix</Label>
      </div>
    </div>
  );
};
