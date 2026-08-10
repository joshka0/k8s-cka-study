import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 12 beat 4 — shuffle sharding. Many flows map across a set of
 * queues. Without shuffle sharding, one pathological flow poisons everything
 * it touches. With it, that flow is confined to a small subset and most
 * other flows are untouched — but the pathological flow is visibly still
 * pathological. Not fixed; contained.
 */

const QUEUES = 8;

export const ShuffleSharding: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const leftIn = appear(t, 0.08, 0.18);
  const poison = seg(t, 0.2, 0.38);
  const rightIn = appear(t, 0.44, 0.54);
  const contained = seg(t, 0.56, 0.74);
  const footer = appear(t, 0.86, 0.94);

  const pulse = 0.5 + 0.5 * Math.sin(frame / 7);

  // Without shuffle sharding, the pathological flow touches all queues.
  // With it, it touches only two; the rest stay clean.
  const pathQueues = new Set([0, 1]);

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
      <div style={{ width: 1620, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>shuffle sharding confines the pathological flow — it does not cure it</Label>
        </div>

        <QueuePanel
          title="without shuffle sharding"
          x={60}
          on={leftIn}
          tintAll={poison}
          flowQueues={null}
          verdict="one pathological flow poisons everything it touches"
          verdictColor={PALETTE.bad}
          bad
        />

        <QueuePanel
          title="with shuffle sharding"
          x={840}
          on={rightIn}
          tintAll={contained}
          flowQueues={pathQueues}
          verdict="confined to a small subset — most flows untouched — but still pathological"
          verdictColor={PALETTE.amber}
          bad={false}
        />

        <div style={{ position: 'absolute', left: 0, right: 0, top: 636, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>do not draw it as fixed — draw it as contained: the bad flow is still bad, it just cannot reach most queues</Label>
        </div>
      </div>
    </div>
  );
};

function QueuePanel({
  title, x, on, tintAll, flowQueues, verdict, verdictColor, bad,
}: {
  title: string;
  x: number;
  on: number;
  tintAll: number;
  flowQueues: Set<number> | null;
  verdict: string;
  verdictColor: string;
  bad: boolean;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 70,
        width: 720,
        borderRadius: 18,
        border: `2px solid ${bad ? PALETTE.bad : PALETTE.good}55`,
        background: 'transparent',
        padding: '16px 20px',
        opacity: Math.max(0.3, on),
      }}
    >
      <Label color={bad ? PALETTE.bad : PALETTE.good} size={13} style={{ marginBottom: 14 }}>{title}</Label>

      {/* the pathological flow */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: MONO,
          fontSize: 14,
          fontWeight: 900,
          color: PALETTE.bad,
          border: `2px solid ${PALETTE.bad}`,
          borderRadius: 10,
          background: `${PALETTE.bad}0c`,
          padding: '10px 14px',
          marginBottom: 14,
          boxShadow: `0 0 18px ${PALETTE.bad}44`,
        }}
      >
        ⬤ pathological flow
        <span style={{ fontSize: 12, fontWeight: 800, color: PALETTE.bad, opacity: 0.6 + 0.4 * Math.abs(Math.sin(0)) }}>
          floods every request it makes
        </span>
      </div>

      {/* the queues */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {Array.from({ length: QUEUES }).map((_, i) => {
          const poisoned = flowQueues === null ? tintAll > 0.5 : (flowQueues.has(i) && tintAll > 0.5);
          return (
            <div
              key={i}
              style={{
                height: 44,
                borderRadius: 8,
                border: `2px solid ${poisoned ? PALETTE.bad : PALETTE.good}55`,
                background: poisoned ? `${PALETTE.bad}22` : `${PALETTE.good}0a`,
                fontFamily: MONO,
                fontSize: 12.5,
                fontWeight: 800,
                color: poisoned ? PALETTE.bad : PALETTE.good,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              queue {i + 1}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 14,
          fontFamily: MONO,
          fontSize: 14.5,
          fontWeight: 900,
          color: verdictColor,
          textAlign: 'center',
          lineHeight: 1.4,
          opacity: tintAll,
        }}
      >
        {tintAll > 0.5 ? verdict : '…'}
      </div>
    </div>
  );
}
