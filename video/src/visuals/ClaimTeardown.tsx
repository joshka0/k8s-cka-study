import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 17 beat 8 — what deletion actually does. Deletion runs the handshake
 * backwards. The inventory count stays unavailable until the final step, so
 * the lag between a Pod disappearing and capacity returning is visible rather
 * than instantaneous.
 */

const STEPS = [
  { n: '1', text: 'container stops', color: PALETTE.cyan },
  { n: '2', text: 'kubelet + driver unprepare the device', color: PALETTE.violet },
  { n: '3', text: 'the reservation is released', color: PALETTE.blue },
  { n: '4', text: 'a generated claim completes its lifecycle', color: PALETTE.amber },
];

export const ClaimTeardown: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const stepOn = STEPS.map((_, i) => appear(t, 0.08 + i * 0.08, 0.15 + i * 0.08));
  const inventoryIn = appear(t, 0.1, 0.18);
  const availStep = seg(t, 0.5, 0.9);
  const footer = appear(t, 0.92, 0.98);

  // inventory becomes allocatable only at the very end
  const available = availStep > 0.97;

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
      <div style={{ width: 1680, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>deletion runs the handshake backwards — and capacity does not return instantly</Label>
        </div>

        {/* the reverse sequence */}
        <div style={{ position: 'absolute', left: 120, top: 80, width: 900, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {STEPS.map((s, i) => {
            const on = stepOn[i];
            return (
              <div
                key={s.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  borderRadius: 12,
                  border: `2px solid ${on > 0.5 ? s.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${s.color}06` : '#101826',
                  padding: '12px 18px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: s.color, border: `1px solid ${s.color}`, borderRadius: 8, padding: '3px 9px' }}>{s.n}</span>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16.5, fontWeight: 900 }}>{s.text}</div>
              </div>
            );
          })}
        </div>

        {/* the inventory count */}
        <div style={{ position: 'absolute', right: 120, top: 100, width: 520, borderRadius: 20, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}06`, padding: '20px 24px', opacity: inventoryIn }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 10 }}>inventory — allocatable devices</Label>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: MONO, fontSize: 46, fontWeight: 900, color: available ? PALETTE.good : PALETTE.amber }}>
              {available ? 8 : 7}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 800, color: PALETTE.muted }}>/ 8</span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 12, lineHeight: 1.5 }}>
            {available
              ? 'available again — only after the whole teardown'
              : 'still unavailable — held by a reservation, even though the Pod is gone'}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 460, textAlign: 'center', opacity: inventoryIn }}>
          <Label color={PALETTE.amber} size={13}>the lag between the Pod disappearing and capacity returning is the window — make it visible, not instantaneous</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>only at the final step does the inventory become allocatable again — capacity can look missing for a while</Label>
        </div>
      </div>
    </div>
  );
};
