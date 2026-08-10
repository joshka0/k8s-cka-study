import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const ONE = [
  { task: 'a fixed sequence someone runs occasionally', icon: '📦' },
  { task: 'a one-off migration', icon: '🗄' },
];

const CONT = [
  { task: 'something must be watched', icon: '👁' },
  { task: 'repaired and reconciled', icon: '🔁' },
  { task: 'without a human present', icon: '🤖' },
];

export const OperatorTest: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const colOne = appear(t, 0.2, 0.3);
  const colCont = appear(t, 0.4, 0.5);
  const resolveOne = appear(t, 0.66, 0.74);
  const resolveCont = appear(t, 0.66, 0.74);
  const footer = appear(t, 0.88, 0.96);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 24, paddingLeft: 120, paddingRight: 120 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 30 }}>
        write an operator when the work is continuous — not because the domain feels complicated
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 80 }}>
        {/* run-once */}
        <div style={{ width: 640, border: `1px solid ${PALETTE.blue}55`, borderRadius: 22, padding: 20, opacity: 0.25 + colOne * 0.75 }}>
          <Label color={PALETTE.blue} size={14} style={{ marginBottom: 14 }}>run-once</Label>
          {ONE.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 800, padding: '10px 12px', opacity: colOne }}>
              <span style={{ fontSize: 22 }}>{c.icon}</span> {c.task}
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: 16, opacity: resolveOne }}>
            <Box pad={12} borderColor={PALETTE.blue} bg={`${PALETTE.blue}10`} style={{ display: 'inline-block' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.blue, fontSize: 22, fontWeight: 900 }}>→ a Job (or a script) — honest and cheaper</div>
            </Box>
          </div>
        </div>

        {/* continuous */}
        <div style={{ width: 640, border: `1px solid ${PALETTE.violet}55`, borderRadius: 22, padding: 20, opacity: 0.25 + colCont * 0.75 }}>
          <Label color={PALETTE.violet} size={14} style={{ marginBottom: 14 }}>continuous — the work never stops</Label>
          {CONT.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 800, padding: '10px 12px', opacity: colCont }}>
              <span style={{ fontSize: 22 }}>{c.icon}</span> {c.task}
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: 16, opacity: resolveCont }}>
            <Box pad={12} borderColor={PALETTE.violet} bg={`${PALETTE.violet}10`} style={{ display: 'inline-block' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 22, fontWeight: 900 }}>→ an operator — watched, repaired, reconciled</div>
            </Box>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 28, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>that is the test — continuous, without a human present</Label>
      </div>
    </div>
  );
};
