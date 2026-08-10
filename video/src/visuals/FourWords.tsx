import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const WORDS = [
  { word: 'CRD', def: 'registers an API kind and its schema', color: PALETTE.blue },
  { word: 'CR', def: 'one stored object of that kind', color: PALETTE.cyan },
  { word: 'controller', def: 'reconciles those objects toward their spec', color: PALETTE.violet },
  { word: 'operator', def: 'controller + domain lifecycle + RBAC + install/upgrade', color: PALETTE.good },
];

export const FourWords: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const cardIn = (i: number) => appear(t, 0.12 + i * 0.12, 0.2 + i * 0.12);
  const assemble = appear(t, 0.66, 0.78);
  const footer = appear(t, 0.88, 0.96);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 130, paddingRight: 130 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        four words people blur — and interviewers use the confusion as a filter
      </Label>

      {/* the four cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {WORDS.map((w, i) => (
          <Box
            key={w.word}
            pad={16}
            borderColor={w.color}
            style={{
              width: 1240,
              margin: '0 auto',
              opacity: cardIn(i),
              transform: `translateY(${(1 - cardIn(i)) * 18}px)`,
              background: `${w.color}0a`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
              <span style={{ fontFamily: MONO, color: w.color, fontSize: 30, fontWeight: 900, width: 200 }}>{w.word}</span>
              <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 700 }}>{w.def}</span>
            </div>
          </Box>
        ))}
      </div>

      {/* assembled */}
      <div style={{ marginTop: 28, opacity: assemble, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Assem color={PALETTE.blue} text="CRD registers the kind" />
        <span style={{ color: PALETTE.muted, fontSize: 20 }}>→</span>
        <Assem color={PALETTE.cyan} text="a CR appears in the API" />
        <span style={{ color: PALETTE.muted, fontSize: 20 }}>→</span>
        <Assem color={PALETTE.violet} text="the controller picks it up" />
        <span style={{ color: PALETTE.muted, fontSize: 20 }}>→</span>
        <Assem color={PALETTE.good} text="the operator wraps it + lifecycle" />
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>say those four cleanly and you have answered most of what follows</Label>
      </div>
    </div>
  );
};

function Assem({ color, text }: { color: string; text: string }) {
  return (
    <Box pad={10} borderColor={color} style={{ background: `${color}0c` }}>
      <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>{text}</span>
    </Box>
  );
}
