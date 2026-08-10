import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const FailurePolicy: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const clock = appear(t, 0.2, 0.3);
  const leftBounce = appear(t, 0.4, 0.52);
  const rightPass = appear(t, 0.4, 0.52);
  const counter = Math.floor(seg(t, 0.55, 1) * 34);
  const note = appear(t, 0.62, 0.72);
  const footer = appear(t, 0.84, 0.92);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 90, paddingRight: 90 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 30 }}>
        failurePolicy — the decision you cannot avoid: fail closed or fail open
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 50 }}>
        {/* LEFT — fail closed */}
        <div style={{ width: 680, border: `1px solid ${PALETTE.bad}55`, borderRadius: 24, background: `${PALETTE.bad}0a`, padding: 22 }}>
          <Label color={PALETTE.bad} size={14} style={{ marginBottom: 16 }}>FAIL · fail closed</Label>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
            <Box pad={10} borderColor={PALETTE.cyan} style={{ width: 150, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15 }}>request</div>
            </Box>
            <div style={{ opacity: clock, fontFamily: MONO, color: PALETTE.muted, fontSize: 20 }}>
              ⏱ timeout
            </div>
            <Box pad={10} borderColor={PALETTE.blue} style={{ width: 150, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15 }}>webhook</div>
            </Box>
          </div>

          {leftBounce > 0 && (
            <div style={{ textAlign: 'center', marginTop: 18, opacity: leftBounce }}>
              <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 30, fontWeight: 900, display: 'inline-block', border: `2px solid ${PALETTE.bad}`, borderRadius: 6, padding: '4px 18px', transform: 'rotate(-6deg)' }}>
                ✕ REJECTED
              </span>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 16, opacity: leftBounce }}>
            <Label color={PALETTE.bad} size={11}>policy is never bypassed</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900, marginTop: 6 }}>
              blocked writes: {counter}
            </div>
          </div>
        </div>

        {/* RIGHT — fail open */}
        <div style={{ width: 680, border: `1px solid ${PALETTE.good}55`, borderRadius: 24, background: `${PALETTE.good}0a`, padding: 22 }}>
          <Label color={PALETTE.good} size={14} style={{ marginBottom: 16 }}>IGNORE · fail open</Label>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
            <Box pad={10} borderColor={PALETTE.cyan} style={{ width: 150, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15 }}>request</div>
            </Box>
            <div style={{ opacity: clock, fontFamily: MONO, color: PALETTE.muted, fontSize: 20 }}>⏱ timeout</div>
            <Box pad={10} borderColor={PALETTE.blue} style={{ width: 150, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15 }}>webhook</div>
            </Box>
          </div>

          {rightPass > 0 && (
            <div style={{ textAlign: 'center', marginTop: 18, opacity: rightPass }}>
              <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 26, fontWeight: 900, display: 'inline-block', border: `2px solid ${PALETTE.good}`, borderRadius: 6, padding: '4px 20px' }}>
                ✓ passed through
              </span>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 16, opacity: note }}>
            <Label color={PALETTE.amber} size={11}>writes keep flowing — but the policy silently stopped applying</Label>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 28, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>no correct default — pick from the domain, not from habit</Label>
      </div>
    </div>
  );
};
