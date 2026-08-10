import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const AutoscalerFix: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const intro = appear(t, 0.12, 0.22);
  const footer = appear(t, 0.86, 0.94);
  // flat, settled utilisation
  const util = 62;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 24, paddingLeft: 120, paddingRight: 120 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        the fix — stop sharing the signal
      </Label>

      <div style={{ opacity: intro }}>
        {/* flat utilisation */}
        <div style={{ textAlign: 'center' }}>
          <Label color={PALETTE.good} size={12}>utilisation settles</Label>
          <svg width="1100" height="70" viewBox="0 0 1100 70" preserveAspectRatio="none" style={{ marginTop: 6 }}>
            <polyline points="0,35 1100,35" fill="none" stroke={PALETTE.good} strokeWidth="3" />
          </svg>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 18, fontWeight: 900 }}>{util}% · flat</div>
        </div>

        {/* two separate arrows */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 120, marginTop: 34 }}>
          <div style={{ textAlign: 'center', width: 420 }}>
            <Label color={PALETTE.cyan} size={12}>HPA</Label>
            <Box pad={12} borderColor={PALETTE.cyan} style={{ width: 280, margin: '8px auto', textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>scales replicas</div>
            </Box>
            <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 16, fontWeight: 800, margin: '8px 0' }}>reads ▲ queue depth</div>
            <Box pad={10} borderColor={PALETTE.cyan} style={{ width: 240, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 14, fontWeight: 800 }}>queue depth / RPS</div>
            </Box>
          </div>

          <div style={{ textAlign: 'center', width: 420 }}>
            <Label color={PALETTE.violet} size={12}>VPA</Label>
            <Box pad={12} borderColor={PALETTE.violet} style={{ width: 280, margin: '8px auto', textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>adjusts requests</div>
            </Box>
            <div style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 16, fontWeight: 800, margin: '8px 0' }}>owns ▼ resource requests</div>
            <Box pad={10} borderColor={PALETTE.violet} style={{ width: 240, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 14, fontWeight: 800 }}>requests line</div>
            </Box>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 26 }}>
          <Label color={PALETTE.good} size={12}>the two arrows no longer meet — no shared variable to fight over</Label>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>scale horizontally on something VPA does not touch · let VPA own requests</Label>
      </div>
    </div>
  );
};
