import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const CONTRACT = [
  'structural schema',
  'list and map semantics',
  'pruning, defaulting, validation',
  'how server-side apply merges your fields',
];

export const ApiContract: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const itemIn = (i: number) => appear(t, 0.14 + i * 0.08, 0.2 + i * 0.08);
  const implIn = appear(t, 0.5, 0.58);
  const swap = seg(t, 0.68, 0.8);
  const footer = appear(t, 0.88, 0.96);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 22, paddingLeft: 130, paddingRight: 130 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 30 }}>
        publishing a CRD is publishing an API — you commit to everything a client can observe
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 80 }}>
        {/* contract column */}
        <div style={{ width: 640, border: `1px solid ${PALETTE.blue}55`, borderRadius: 22, padding: 20, background: `${PALETTE.blue}06` }}>
          <Label color={PALETTE.blue} size={13} style={{ marginBottom: 14 }}>part of the API contract</Label>
          {CONTRACT.map((c, i) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontSize: 18, fontWeight: 800, color: PALETTE.ink, padding: '10px 12px', opacity: itemIn(i), transform: `translateY(${(1 - itemIn(i)) * 12}px)` }}>
              <span style={{ color: PALETTE.blue }}>✓</span> {c}
            </div>
          ))}
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 10, opacity: appear(t, 0.48, 0.56) }}>
            clients depend on this — it cannot change under them
          </div>
        </div>

        {/* not-contract column */}
        <div style={{ width: 640, border: `1px solid ${PALETTE.line}`, borderRadius: 22, padding: 20, opacity: implIn }}>
          <Label color={PALETTE.muted} size={13} style={{ marginBottom: 14 }}>NOT part of the contract — the implementation</Label>
          <Box pad={14} borderColor={swap > 0 ? PALETTE.good : PALETTE.amber} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>
              {swap > 0 ? 'rewritten in another language' : 'controller implementation (Go)'}
            </div>
            <div style={{ fontFamily: MONO, color: swap > 0 ? PALETTE.good : PALETTE.muted, fontSize: 14, fontWeight: 800, marginTop: 8 }}>
              {swap > 0 ? '↻ swapped — and no user notices' : 'you can rewrite this tomorrow'}
            </div>
          </Box>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 12 }}>
            the contract column above is unchanged
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>what you have not committed to is the implementation</Label>
      </div>
    </div>
  );
};
