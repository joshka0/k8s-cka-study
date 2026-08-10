import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const ReadinessThrottle: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const honest = seg(t, 0.2, 0.55);
  const eager = seg(t, 0.55, 0.6);
  const footer = appear(t, 0.86, 0.94);

  // honest: steps in increments; eager: jumps all at once
  const honestNew = Math.floor(honest * 5);
  const eagerNew = Math.round(eager * 5);
  const honestErr = Math.round(honest * 12);
  const eagerErr = Math.round(eager * 85);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 24, paddingLeft: 110, paddingRight: 110 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 30 }}>
        readiness is the throttle on every rollout you run
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 60 }}>
        {/* honest probe */}
        <div style={{ width: 700, border: `1px solid ${PALETTE.good}55`, borderRadius: 22, padding: 20, background: `${PALETTE.good}06` }}>
          <Label color={PALETTE.good} size={13} style={{ marginBottom: 12 }}>honest readiness probe — controlled steps</Label>
          <StepBar filled={honestNew} total={5} color={PALETTE.good} />
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 13, color: PALETTE.muted, fontWeight: 700 }}>
              <span>error rate</span><span>{honestErr}%</span>
            </div>
            <div style={{ height: 12, background: '#0c111c', borderRadius: 999, marginTop: 4 }}>
              <div style={{ width: `${honestErr}%`, height: '100%', background: PALETTE.good, borderRadius: 999 }} />
            </div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800, marginTop: 12 }}>
            new Pods replace old ones only as each becomes ready
          </div>
        </div>

        {/* eager probe */}
        <div style={{ width: 700, border: `1px solid ${PALETTE.bad}55`, borderRadius: 22, padding: 20, opacity: 0.35 + eager * 0.65, background: `${PALETTE.bad}06` }}>
          <Label color={PALETTE.bad} size={13} style={{ marginBottom: 12 }}>probe passes immediately — replaces all at once</Label>
          <StepBar filled={eagerNew} total={5} color={PALETTE.bad} />
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 13, color: PALETTE.muted, fontWeight: 700 }}>
              <span>error rate</span><span>{eagerErr}%</span>
            </div>
            <div style={{ height: 12, background: '#0c111c', borderRadius: 999, marginTop: 4 }}>
              <div style={{ width: `${eagerErr}%`, height: '100%', background: PALETTE.bad, borderRadius: 999 }} />
            </div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 14, fontWeight: 800, marginTop: 12 }}>
            a broken version replaces a working one at full speed
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 28, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>most bad deploys are not deploy bugs — they are readiness definitions that do not mean what the author thought</Label>
      </div>
    </div>
  );
};

function StepBar({ filled, total, color }: { filled: number; total: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 40,
            borderRadius: 8,
            border: `1px solid ${i < filled ? color : PALETTE.line}`,
            background: i < filled ? `${color}33` : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: MONO,
            color: i < filled ? color : PALETTE.line,
            fontWeight: 900,
          }}
        >
          {i < filled ? '✓' : '·'}
        </div>
      ))}
    </div>
  );
}
