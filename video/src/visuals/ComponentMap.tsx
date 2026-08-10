import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE, LANES } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Five actors around a central API server. Each chip lights and draws its
 * single connection to the centre as it is named; the outer four never touch
 * each other.
 */
const CHIPS = [
  { name: 'etcd', own: 'stores what the API persists', color: PALETTE.amber, cx: 320, cy: 560 },
  { name: 'controllers', own: 'decide what should exist', color: PALETTE.blue, cx: 360, cy: 200 },
  { name: 'scheduler', own: 'chooses which node', color: PALETTE.violet, cx: 1520, cy: 200 },
  { name: 'kubelet', own: 'assignment → running containers', color: PALETTE.cyan, cx: 1540, cy: 560 },
];

export const ComponentMap: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const API = { cx: 880, cy: 380 };

  const reveal = (i: number) => appear(t, 0.14 + i * 0.09, 0.2 + i * 0.09);
  const cross = appear(t, 0.08, 0.16);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginTop: 10 }}>
        five things do the work — every interaction runs through the API server
      </Label>

      {/* connector lines, all through the centre */}
      <svg
        width="1768"
        height="800"
        viewBox="0 0 1768 800"
        style={{ position: 'absolute', left: 0, top: 50 }}
      >
        {[CHIPS[0], CHIPS[2]].map((c, k) => (
          <line
            key={`h${k}`}
            x1={c.cx - 130}
            y1={c.cy}
            x2={c.cx + 130}
            y2={c.cy}
            stroke={c.color}
            strokeWidth={2}
            strokeDasharray="3 6"
            opacity={cross * (k === 0 ? reveal(0) : reveal(2))}
          />
        ))}
        <line
          x1={360}
          y1={330}
          x2={880}
          y2={300}
          stroke={PALETTE.blue}
          strokeWidth={2}
          strokeDasharray="3 6"
          opacity={reveal(1) * 0.8}
        />
        <line
          x1={1520}
          y1={330}
          x2={880}
          y2={300}
          stroke={PALETTE.violet}
          strokeWidth={2}
          strokeDasharray="3 6"
          opacity={reveal(2) * 0.8}
        />
        <line
          x1={1540}
          y1={460}
          x2={880}
          y2={440}
          stroke={PALETTE.cyan}
          strokeWidth={2}
          strokeDasharray="3 6"
          opacity={reveal(3) * 0.8}
        />
        <line
          x1={320}
          y1={460}
          x2={880}
          y2={440}
          stroke={PALETTE.amber}
          strokeWidth={2}
          strokeDasharray="3 6"
          opacity={reveal(0) * 0.8}
        />
      </svg>

      {/* central API server */}
      <div
        style={{
          position: 'absolute',
          left: API.cx - 170,
          top: API.cy - 60,
          width: 340,
          textAlign: 'center',
          opacity: 1,
        }}
      >
        <Box pad={18} borderColor={PALETTE.blue} bg={`${PALETTE.blue}14`}
          style={{ boxShadow: `0 0 34px ${PALETTE.blue}44` }}>
          <Label color={PALETTE.blue} size={12}>control plane</Label>
          <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 30, fontWeight: 900 }}>API server</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, marginTop: 5, fontWeight: 700 }}>
            the only writer of state
          </div>
        </Box>
      </div>

      {/* outer chips */}
      {CHIPS.map((c, i) => {
        const on = reveal(i) > 0;
        return (
          <div
            key={c.name}
            style={{
              position: 'absolute',
              left: c.cx - 210,
              top: c.cy - 62,
              width: 420,
              textAlign: 'center',
              opacity: reveal(i),
            }}
          >
            <Box pad={14} borderColor={on ? c.color : PALETTE.line}
              style={{ background: on ? `${c.color}12` : PALETTE.panel }}>
              <div style={{ fontFamily: MONO, color: on ? c.color : PALETTE.muted, fontSize: 24, fontWeight: 900 }}>
                {c.name}
              </div>
              <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 15, marginTop: 4 }}>{c.own}</div>
            </Box>
          </div>
        );
      })}

      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', opacity: appear(t, 0.62, 0.72) }}>
        <Label color={PALETTE.muted} size={12}>five chips, five connections, all through the middle — none between the outer four</Label>
      </div>
    </div>
  );
};
