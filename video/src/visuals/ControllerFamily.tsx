import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const CONTROLLERS = [
  { name: 'Deployment', color: PALETTE.blue, rate: 1.0 },
  { name: 'ReplicaSet', color: PALETTE.violet, rate: 0.8 },
  { name: 'Job', color: PALETTE.good, rate: 1.3 },
  { name: 'node', color: PALETTE.amber, rate: 0.7 },
  { name: 'endpoints', color: PALETTE.cyan, rate: 1.1 },
];

export const ControllerFamily: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const t = frame / durationInFrames;

  const box = appear(t, 0.06, 0.16);
  const unpack = seg(t, 0.3, 0.42);
  const chipIn = (i: number) => appear(t, 0.3 + i * 0.05, 0.38 + i * 0.05);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 30, paddingLeft: 120, paddingRight: 120 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 30 }}>
        the controller manager is one binary containing dozens of controllers
      </Label>

      {/* the single binary */}
      <div style={{ display: 'flex', justifyContent: 'center', opacity: box }}>
        <Box pad={18} borderColor={PALETTE.blue} bg={`${PALETTE.blue}12`} style={{ width: 560, textAlign: 'center', boxShadow: unpack > 0 ? `0 0 18px ${PALETTE.blue}55` : 'none' }}>
          <Label color={PALETTE.blueInk} size={12}>one binary · one process</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 30, fontWeight: 900, marginTop: 4 }}>
            kube-controller-manager
          </div>
        </Box>
      </div>

      {/* unpack arrow + grid of controllers */}
      <div style={{ textAlign: 'center', marginTop: 10, opacity: unpack }}>
        <span style={{ color: PALETTE.muted, fontSize: 26 }}>▼</span>
      </div>

      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 22, justifyItems: 'center' }}>
        {CONTROLLERS.map((c, i) => {
          const on = chipIn(i);
          const spin = (frame / fps) * c.rate;
          return (
            <Box
              key={c.name}
              pad={16}
              borderColor={on ? c.color : PALETTE.line}
              style={{
                width: 220,
                textAlign: 'center',
                opacity: on,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                transform: `translateY(${(1 - on) * 16}px)`,
                background: on ? `${c.color}10` : PALETTE.panel,
              }}
            >
              <span style={{ fontSize: 34, color: c.color, display: 'inline-block', transform: `rotate(${spin * 180}deg)` }}>↻</span>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>{c.name}</div>
              <Label color={on ? c.color : PALETTE.muted} size={10}>independent loop</Label>
            </Box>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 34, opacity: appear(t, 0.72, 0.82) }}>
        <Label color={PALETTE.amber} size={13}>they run independently and fail independently — ask which one did it</Label>
      </div>
    </div>
  );
};
