import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

function ListDemo({ mode, colorA, colorB, resultA, resultB, label, t }: {
  mode: string; colorA: string; colorB: string; resultA: string[]; resultB: string[]; label: string; t: number;
}) {
  const ctrls = appear(t, 0.14, 0.26);
  const result = appear(t, 0.4, 0.54);
  return (
    <div style={{ border: `1px solid ${PALETTE.line}`, borderRadius: 20, padding: 18, width: 700 }}>
      <Label color={mode === 'atomic' ? PALETTE.bad : PALETTE.good} size={13} style={{ marginBottom: 12 }}>
        {label}
      </Label>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12, opacity: ctrls }}>
        <Ctl name="controller A" color={colorA} ent={resultA.length ? resultA[0] : ''} />
        <Ctl name="controller B" color={colorB} ent={resultB.length ? resultB[0] : ''} />
      </div>
      <div style={{ textAlign: 'center', opacity: result }}>
        <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700 }}>the list field ends up as →</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8, minHeight: 40, opacity: result }}>
        {(mode === 'atomic' ? resultB : [...resultA, ...resultB]).map((v, i) => (
          <div key={i} style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: i === 0 ? colorA : colorB, border: `1px solid ${i === 0 ? colorA : colorB}`, borderRadius: 8, padding: '6px 14px', background: i === 0 ? `${colorA}1a` : `${colorB}1a` }}>
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

export const SchemaSemantics: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const footer = appear(t, 0.9, 0.96);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 24, paddingLeft: 90, paddingRight: 90 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 30 }}>
        your structural schema decides how server-side apply merges lists
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 50 }}>
        <ListDemo mode="atomic" colorA={PALETTE.blue} colorB={PALETTE.amber} resultA={['entry A']} resultB={['entry B']} label="declared atomic — the second apply replaces the first" t={t} />
        <ListDemo mode="merge" colorA={PALETTE.blue} colorB={PALETTE.amber} resultA={['entry A']} resultB={['entry B']} label="declared with a merge key — both entries survive" t={t} />
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>that choice looks like a detail in the CRD and behaves like an API design decision forever</Label>
      </div>
    </div>
  );
};

function Ctl({ name, color, ent }: { name: string; color: string; ent: string }) {
  return (
    <Box pad={10} borderColor={color} style={{ width: 280, textAlign: 'center' }}>
      <div style={{ fontFamily: MONO, color: color, fontSize: 15, fontWeight: 900 }}>{name}</div>
      <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14, fontWeight: 700, marginTop: 6 }}>writes: {ent || '—'}</div>
    </Box>
  );
}
