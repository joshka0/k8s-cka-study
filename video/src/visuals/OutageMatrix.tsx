import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE, LANES } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const STOPS = [
  'placement',
  'self-healing',
  'EndpointSlice updates',
  'leases',
  'day-two writes',
];

const KEEPS = [
  'running processes',
  'programmed forwarding rules',
];

export const OutageMatrix: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const down = appear(t, 0.12, 0.26);
  const stopAt = (i: number) => appear(t, 0.34 + i * 0.08, 0.4 + i * 0.08);
  const keepAt = (i: number) => appear(t, 0.5 + i * 0.1, 0.56 + i * 0.1);
  const footer = appear(t, 0.84, 0.92);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 16, paddingLeft: 130, paddingRight: 130 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 24 }}>
        what an outage costs — the control plane goes down
      </Label>

      {/* control-plane lane going dark */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          pad={14}
          borderColor={down ? PALETTE.bad : LANES.control.color}
          style={{
            width: 720,
            textAlign: 'center',
            background: down ? `${PALETTE.bad}18` : `${LANES.control.color}16`,
            opacity: down ? 0.55 : 1,
          }}
        >
          <Label color={down ? PALETTE.bad : LANES.control.color} size={12}>control plane</Label>
          <div style={{ fontFamily: MONO, color: down ? PALETTE.bad : PALETTE.ink, fontSize: 24, fontWeight: 900, marginTop: 4 }}>
            {down ? '✕ down' : 'up'}
          </div>
        </Box>
      </div>

      {/* two columns */}
      <div style={{ marginTop: 40, display: 'flex', gap: 60, justifyContent: 'center' }}>
        <div
          style={{
            width: 500,
            border: `1px solid ${PALETTE.bad}55`,
            borderRadius: 20,
            background: `${PALETTE.bad}0d`,
            padding: 20,
          }}
        >
          <Label color={PALETTE.bad} size={14} style={{ marginBottom: 14, textAlign: 'center' }}>stops</Label>
          {STOPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, opacity: stopAt(i), fontFamily: MONO, fontSize: 20, fontWeight: 800, color: PALETTE.ink }}>
              <span style={{ color: PALETTE.bad }}>✕</span> {s}
            </div>
          ))}
        </div>

        <div
          style={{
            width: 500,
            border: `1px solid ${PALETTE.good}55`,
            borderRadius: 20,
            background: `${PALETTE.good}0d`,
            padding: 20,
          }}
        >
          <Label color={PALETTE.good} size={14} style={{ marginBottom: 14, textAlign: 'center' }}>keeps working</Label>
          {KEEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, opacity: keepAt(i), fontFamily: MONO, fontSize: 20, fontWeight: 800, color: PALETTE.ink }}>
              <span style={{ color: PALETTE.good }}>✓</span> {s}
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 34, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>what keeps working is everything already programmed</Label>
      </div>
    </div>
  );
};
