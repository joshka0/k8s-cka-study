import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { MONO, SANS } from '../ui';
import type { Beat } from '../script';
import { interpolate } from 'remotion';

// Six failure phrases, all drawn verbatim from the narration (which lists
// three concrete symptoms); no Kubernetes claims added.
const PHRASES = [
  'Pending',
  'Running, no traffic',
  'Resolves, times out',
];

const SPOTS = [
  { x: 340, y: 320, size: 40 },
  { x: 900, y: 240, size: 44 },
  { x: 760, y: 520, size: 42 },
];

export const ColdOpen: React.FC<{ beat: Beat }> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const collapseFrom = 0.46;
  const collapseTo = 0.6;
  const titleIn = 0.66;

  const title = (t - titleIn) / (1 - titleIn);
  const titleOpacity = interpolate(title, [0, 0.12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(title, [0, 0.18], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (x: number) => 1 - Math.pow(1 - x, 3),
  });

  // Collapsed spine line.
  const spineW = interpolate(t, [collapseFrom, collapseTo], [0, 900], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {/* scattered phrases */}
      {PHRASES.map((p, i) => {
        const fade = appear2(frame, durationInFrames, 0.05 + i * 0.07, 0.05 + i * 0.07 + 0.08);
        const collapse = seg2(t, collapseFrom + i * 0.02, collapseTo);
        const collOpacity = 1 - collapse;
        const jx = interpolate(collapse, [0, 1], [0, (520 - SPOTS[i].x) * 0.4]);
        const jy = interpolate(collapse, [0, 1], [0, (470 - SPOTS[i].y) * 0.4]);
        const jscale = interpolate(collapse, [0, 1], [1, 0.15]);
        return (
          <span
            key={p}
            style={{
              position: 'absolute',
              left: SPOTS[i].x,
              top: SPOTS[i].y,
              fontFamily: MONO,
              fontSize: SPOTS[i].size,
              color: '#ffffff',
              opacity: fade * collOpacity,
              transform: `translate(${jx}px, ${jy}px) scale(${jscale})`,
              whiteSpace: 'nowrap',
            }}
          >
            {p}
          </span>
        );
      })}

      {/* spine line */}
      <div
        style={{
          position: 'absolute',
          left: 510,
          top: 464,
          height: 10,
          width: spineW,
          borderRadius: 999,
          background: PALETTE.cyan,
          boxShadow: `0 0 34px ${PALETTE.cyan}`,
          opacity: t < collapseFrom ? 0.25 : 1,
        }}
      />

      {/* title card */}
      {t >= titleIn && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 380,
            textAlign: 'center',
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              color: PALETTE.cyan,
              letterSpacing: 0.42,
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 18,
              textTransform: 'uppercase',
            }}
          >
            kubectl apply · —— · packet arrives
          </div>
          <div
            style={{
              fontFamily: SANS,
              color: '#ffffff',
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: '-0.015em',
            }}
          >
            INTENT TO PACKET
          </div>
        </div>
      )}
    </div>
  );
};

function appear2(f: number, dur: number, a: number, b: number): number {
  return interpolate(f, [a * dur, b * dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (x: number) => 1 - Math.pow(1 - x, 3),
  });
}
function seg2(t: number, a: number, b: number): number {
  if (t <= a) return 0;
  if (t >= b) return 1;
  return (t - a) / (b - a);
}
