import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const CRS = [
  { name: 'widgets/alpha-1', color: PALETTE.cyan },
  { name: 'widgets/alpha-2', color: PALETTE.cyan },
  { name: 'widgets/beta-1', color: PALETTE.cyan },
];

export const CrdAlone: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const t = frame / durationInFrames;

  const kind = appear(t, 0.12, 0.22);
  const crs = (i: number) => appear(t, 0.28 + i * 0.06, 0.34 + i * 0.06);
  const hold = seg(t, 0.46, 0.56); // long still stretch
  const controllerStart = appear(t, 0.72, 0.82);
  const footer = appear(t, 0.88, 0.96);

  const loop = (frame / fps) * 2; // spinning once running

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 150, paddingRight: 150 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 24 }}>
        apply a CRD with no controller — the API server will happily accept your objects
      </Label>

      {/* CRD applied -> API gains kind */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <Box pad={10} borderColor={PALETTE.amber}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900 }}>apply CRD</div>
        </Box>
        <span style={{ color: PALETTE.muted, fontSize: 22 }}>→</span>
        <Box pad={10} borderColor={PALETTE.blue} style={{ opacity: kind }}>
          <Label color={PALETTE.blue} size={10}>API server</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.blue, fontSize: 17, fontWeight: 900 }}>+ new kind: widgets.example.io</div>
        </Box>
      </div>

      {/* CRs appear in a list */}
      <div style={{ marginTop: 26, display: 'flex', justifyContent: 'center' }}>
        <Box pad={16} borderColor={PALETTE.line} style={{ width: 520 }}>
          <Label color={PALETTE.muted} size={11} style={{ marginBottom: 10 }}>kubectl get widgets</Label>
          {CRS.map((c, i) => (
            <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 15, fontWeight: 800, padding: '6px 10px', borderTop: `1px solid ${PALETTE.line}`, opacity: crs(i) }}>
              <span style={{ color: PALETTE.ink }}>{c.name}</span>
              <span style={{ color: c.color }}>{controllerStart > 0 ? 'Reconciled ✓' : 'created'}</span>
            </div>
          ))}
        </Box>
      </div>

      {/* nothing downstream moves */}
      <div style={{ textAlign: 'center', marginTop: 22, opacity: appear(t, 0.4, 0.5) }}>
        <Box pad={12} borderColor={PALETTE.line} border="dashed" style={{ display: 'inline-block', background: 'transparent' }}>
          <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 800 }}>nothing downstream moves — still nothing</span>
        </Box>
      </div>

      {/* then a controller starts */}
      {controllerStart > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 22, gap: 20, opacity: controllerStart }}>
          <Box pad={12} borderColor={PALETTE.good} bg={`${PALETTE.good}12`}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>
              <span style={{ display: 'inline-block', transform: `rotate(${loop * 180}deg)`, color: PALETTE.good, marginRight: 10 }}>↻</span>
              controller starts
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 15, fontWeight: 900, marginTop: 6 }}>now everything begins</div>
          </Box>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 24, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>the API server stores intent · controllers create reality</Label>
      </div>
    </div>
  );
};
