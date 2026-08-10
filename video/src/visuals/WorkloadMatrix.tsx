import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const KINDS = [
  { name: 'Deployment', promise: 'controlled rollouts', rule: 'replaceable pods', color: PALETTE.blue, resp: 'fails → replaced' },
  { name: 'StatefulSet', promise: 'stable ordinal identity', rule: 'identity + order', color: PALETTE.violet, resp: 'fails → same pod returns' },
  { name: 'DaemonSet', promise: 'one per eligible node', rule: 'one per eligible node', color: PALETTE.good, resp: 'fails → replaced on the node' },
  { name: 'Job', promise: 'N successful completions', rule: 'retry until success', color: PALETTE.amber, resp: 'fails → retried' },
];

export const WorkloadMatrix: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const cardIn = (i: number) => appear(t, 0.12 + i * 0.1, 0.2 + i * 0.1);
  const failAt = (i: number) => seg(t, 0.45 + i * 0.12, 0.52 + i * 0.12);
  const footer = appear(t, 0.92, 0.98);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 24, paddingLeft: 80, paddingRight: 80 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 34 }}>
        four workload kinds, four different promises — pick by the invariant your application needs
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 28 }}>
        {KINDS.map((k, i) => {
          const on = cardIn(i);
          const failed = failAt(i) > 0;
          return (
            <Box
              key={k.name}
              pad={18}
              borderColor={k.color}
              style={{
                width: 380,
                textAlign: 'center',
                opacity: on,
                transform: `translateY(${(1 - on) * 16}px)`,
                background: `${k.color}0a`,
              }}
            >
              <div style={{ fontFamily: MONO, color: k.color, fontSize: 24, fontWeight: 900 }}>{k.name}</div>

              {/* a pod */}
              <div
                style={{
                  width: 60,
                  height: 56,
                  borderRadius: 10,
                  margin: '16px auto 0',
                  border: `1px solid ${failed ? PALETTE.bad : k.color}`,
                  background: failed ? `${PALETTE.bad}22` : `${k.color}1c`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: MONO,
                  color: failed ? PALETTE.bad : PALETTE.ink,
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                {failed ? '✕' : 'pod'}
              </div>

              <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 19, fontWeight: 800, marginTop: 16 }}>
                {k.promise}
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 800, marginTop: 6 }}>
                replacement: {k.rule}
              </div>
              <div style={{ fontFamily: MONO, color: failed ? PALETTE.good : PALETTE.line, fontSize: 14, fontWeight: 800, marginTop: 10, opacity: on }}>
                {failed ? '↻ ' + k.resp : '·'}
              </div>
            </Box>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 30, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>choose by the invariant your application actually needs — not by what it stores</Label>
      </div>
    </div>
  );
};
