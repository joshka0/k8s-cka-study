import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const ExternalState: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const wrong = appear(t, 0.15, 0.3);
  const orphan = appear(t, 0.4, 0.52);
  const right = appear(t, 0.6, 0.72);
  const idBack = appear(t, 0.76, 0.86);
  const footer = appear(t, 0.9, 0.96);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 100, paddingRight: 100 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        reconciling something that is not an API object — it must be safe to run twice
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 60 }}>
        {/* WRONG */}
        <div style={{ width: 700, border: `1px solid ${PALETTE.bad}55`, borderRadius: 22, padding: 20, opacity: 0.35 + wrong * 0.65 }}>
          <Label color={PALETTE.bad} size={12} style={{ marginBottom: 12 }}>wrong — in-memory success lost on restart</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <Box pad={10} borderColor={PALETTE.cyan} style={{ width: 150, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900 }}>controller</div>
            </Box>
            <span style={{ color: PALETTE.muted, fontSize: 20 }}>→ create</span>
            <Box pad={10} borderColor={PALETTE.good} style={{ width: 170, textAlign: 'center', opacity: wrong }}>
              <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 15, fontWeight: 900 }}>cloud LB #A ✓</div>
            </Box>
            <span style={{ color: PALETTE.bad, fontSize: 20, opacity: wrong }}>✕ dies</span>
            <Box pad={10} borderColor={PALETTE.bad} style={{ width: 200, textAlign: 'center', opacity: orphan }}>
              <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 15, fontWeight: 900 }}>cloud LB #B · orphaned</div>
            </Box>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, marginTop: 12, opacity: orphan }}>
            the next reconcile creates a second resource nobody is tracking
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ width: 700, border: `1px solid ${PALETTE.good}55`, borderRadius: 22, padding: 20, opacity: 0.35 + right * 0.65, background: `${PALETTE.good}06` }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 12 }}>right — idempotency key + observe-then-create</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800, margin: '6px 0' }}>
            1 · derive a stable idempotency key from the object
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800, margin: '6px 0' }}>
            2 · observe before you create — reuse the existing resource
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 16, fontWeight: 800, margin: '6px 0', opacity: idBack }}>
            3 · persist provider identity back onto the object's status
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, marginTop: 12 }}>
            a retry addresses the same external resource, not a new one
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>in-memory success is lost on restart — write the id down before you move on</Label>
      </div>
    </div>
  );
};
