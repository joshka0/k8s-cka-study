import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

// Desired value = good throughout. A transition is dropped at step 3.
const EDGE = ['good', 'good', 'good', 'bad', 'bad', 'bad', 'bad'];
const LEVEL = ['good', 'good', 'good', 'bad', 'bad', 'good', 'good'];

function Timeline({ name, steps, droppedStart, drop: dropT, resync: resyncT, recovers, color, verdict }: {
  name: string; steps: string[]; droppedStart: number; drop: number; resync: number; recovers: boolean; color: string; verdict: string;
}) {
  return (
    <div style={{ width: 1200, margin: '0 auto' }}>
      <Label color={color} size={12} style={{ marginBottom: 10 }}>{name}</Label>
      <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
        {steps.map((s, i) => {
          const good = s === 'good';
          const isDrop = i === droppedStart;
          const on = dropT > i / (steps.length - 1) ? 1 : Math.max(0, resyncT - (i / steps.length));
          return (
            <div key={i} style={{ textAlign: 'center', opacity: on }}>
              <div
                style={{
                  width: 120,
                  height: 40,
                  borderRadius: 8,
                  border: `1px solid ${good ? PALETTE.good : PALETTE.bad}`,
                  background: good ? `${PALETTE.good}16` : `${PALETTE.bad}16`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: MONO,
                  color: good ? PALETTE.good : PALETTE.bad,
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {good ? '✓' : '✕'}
              </div>
              {isDrop && dropT > 0 && (
                <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 12, fontWeight: 800, marginTop: 3 }}>▼ drop</div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: MONO, color, fontSize: 14, fontWeight: 800 }}>{verdict}</div>
    </div>
  );
}

export const LevelVsEdge: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const edgeT = seg(t, 0.2, 0.55);
  const levelT = seg(t, 0.6, 0.95);
  const edgeDrop = seg(t, 0.3, 0.4);
  const levelDrop = seg(t, 0.65, 0.72);
  const resync = seg(t, 0.8, 0.9);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 40, paddingLeft: 100, paddingRight: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 36 }}>
        level, not edge — a dropped transition costs latency, never correctness
      </Label>

      <Timeline
        name="edge-triggered — must see every transition"
        steps={EDGE}
        droppedStart={3}
        drop={edgeDrop}
        resync={edgeT}
        recovers={false}
        color={PALETTE.bad}
        verdict="the transition is dropped → state diverges permanently"
      />

      <div style={{ height: 34 }} />

      <Timeline
        name="level-based — recomputes from current state"
        steps={LEVEL}
        droppedStart={3}
        drop={levelDrop}
        resync={levelT}
        recovers
        color={PALETTE.good}
        verdict={`${resync > 0 ? 'resync tick → ' : ''}the next reconcile produces the same answer it would have produced anyway`}
      />
    </div>
  );
};
