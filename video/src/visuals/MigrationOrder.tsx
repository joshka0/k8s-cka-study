import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const STEPS = [
  'serve both versions',
  'verify conversion round-trips both ways',
  'mark the new version for storage',
  'migrate existing objects by rewriting them',
  'confirm what is stored + who still uses the old version, then retire it',
];

export const MigrationOrder: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const stepIn = (i: number) => appear(t, 0.14 + i * 0.1, 0.2 + i * 0.1);
  const replay = appear(t, 0.72, 0.8);
  const footer = appear(t, 0.9, 0.96);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 150, paddingRight: 150 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        the safe order — five steps, each gates the next
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 900 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, opacity: stepIn(i), transform: `translateY(${(1 - stepIn(i)) * 10}px)` }}>
              <span style={{ fontFamily: MONO, color: PALETTE.blue, fontSize: 22, fontWeight: 900, width: 40 }}>{i + 1}.</span>
              <Box pad={12} borderColor={i === 3 ? PALETTE.amber : PALETTE.blue} bg={i === 3 ? `${PALETTE.amber}0c` : `${PALETTE.blue}0a`} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 800 }}>{s}</span>
                  <span style={{ fontSize: 22 }}>{i === 3 ? '⚙' : i === STEPS.length - 1 ? '🚫' : '🔓'}</span>
                </div>
              </Box>
            </div>
          ))}
        </div>
      </div>

      {/* the failure replay */}
      <div style={{ textAlign: 'center', marginTop: 24, opacity: replay }}>
        <Box pad={14} borderColor={PALETTE.bad} bg={`${PALETTE.bad}10`} style={{ display: 'inline-block', maxWidth: 1000 }}>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 18, fontWeight: 900 }}>replay — skip step 4</div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800, marginTop: 8 }}>
            storage marker flips to v2 → old objects are never rewritten → retiring v1 strands them
          </div>
        </Box>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>only retire the old version after the migration actually ran</Label>
      </div>
    </div>
  );
};
