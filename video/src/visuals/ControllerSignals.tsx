import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const ControllerSignals: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const phaseA = seg(t, 0.2, 0.42);
  const phaseB = seg(t, 0.5, 0.7);
  const scA = phaseA > 0 && phaseB === 0;
  const footer = appear(t, 0.86, 0.94);

  const depth = Math.round((40 + (scA ? 40 : 40) * 1) * (phaseA + phaseB));
  const latency = Math.round((40 * (phaseA + phaseB)));
  const duration = Math.round((30 * phaseA + (scA ? 0 : 55) * phaseB));

  const gauges = [
    { name: 'queue depth', val: Math.min(100, depth), color: PALETTE.cyan },
    { name: 'queue latency', val: Math.min(100, latency + 5), color: PALETTE.violet },
    { name: 'reconcile duration', val: Math.min(100, duration), color: duration > 70 && phaseB > 0 ? PALETTE.bad : PALETTE.amber },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 24, paddingLeft: 140, paddingRight: 140 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        three signals separate the causes when a controller stalls
      </Label>

      {/* scenario banner */}
      <div style={{ textAlign: 'center', marginBottom: 34 }}>
        <Box pad={12} borderColor={phaseB > 0 ? PALETTE.bad : PALETTE.blue} bg={scA ? `${PALETTE.blue}12` : `${PALETTE.bad}12`} style={{ display: 'inline-block' }}>
          <span style={{ fontFamily: MONO, color: phaseB > 0 ? PALETTE.bad : PALETTE.blue, fontSize: 20, fontWeight: 900 }}>
            {phaseB > 0 ? 'blocked handler — duration high' : 'too few workers — depth climbing, latency normal'}
          </span>
        </Box>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 60 }}>
        {gauges.map((g, i) => {
          const on = g.val > 0 ? 1 : 0;
          return (
            <div key={g.name} style={{ textAlign: 'center' }}>
              <Label color={g.color} size={12} style={{ marginBottom: 12 }}>{g.name}</Label>
              <div style={{ position: 'relative', width: 110, height: 300, background: '#0c111c', border: `1px solid ${PALETTE.line}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${g.val}%`, background: `${g.color}cc`, borderRadius: 10, opacity: on }} />
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 16, fontWeight: 900, marginTop: 8 }}>{g.val}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 30, textAlign: 'center', opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>depth climbing with normal latency → too few workers · with high duration → the handler is blocked</Label>
      </div>
    </div>
  );
};
