import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const SpecStatus: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const obj = appear(t, 0.1, 0.2);
  const status = appear(t, 0.3, 0.4);
  const right = appear(t, 0.45, 0.55);
  const wrong = appear(t, 0.68, 0.78);
  const footer = appear(t, 0.88, 0.96);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 120, paddingRight: 120 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        split your object honestly — spec is intent, status is observation
      </Label>

      {/* the object */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, opacity: obj }}>
        {/* spec */}
        <Box pad={16} borderColor={PALETTE.blue} bg={`${PALETTE.blue}08`} style={{ width: 420 }}>
          <Label color={PALETTE.blue} size={12} style={{ marginBottom: 10 }}>spec · intent (written by user)</Label>
          <Field k="replicas" v="10" />
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8 }}>what was requested</div>
        </Box>

        {/* status */}
        <Box pad={16} borderColor={PALETTE.good} bg={`${PALETTE.good}08`} style={{ width: 420, opacity: appear(t, 0.26, 0.36) }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 10 }}>status · observation (written by controller)</Label>
          <Field k="replicas" v={wrong > 0 ? '10' : '6'} valColor={PALETTE.amber} />
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 14, fontWeight: 800, marginTop: 8 }}>
            condition: Progressing / shortfall reported
          </div>
        </Box>
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: right }}>
        <Label color={PALETTE.good} size={12}>right — the shortfall is reported in status, spec keeps the record of what was asked</Label>
      </div>

      {/* wrong: controller rewrites spec */}
      <div style={{ textAlign: 'center', marginTop: 16, opacity: wrong }}>
        <Box pad={12} borderColor={PALETTE.bad} bg={`${PALETTE.bad}10`} style={{ display: 'inline-block' }}>
          <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 17, fontWeight: 900 }}>
            wrong — controller rewrites spec down to 6 · the gap silently vanishes
          </span>
        </Box>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>do not edit spec down to match what you managed — that destroys the record of what was requested</Label>
      </div>
    </div>
  );
};

function Field({ k, v, valColor }: { k: string; v: string; valColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#0c111c', borderRadius: 8, border: `1px solid ${PALETTE.line}` }}>
      <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 16, fontWeight: 700 }}>{k}:</span>
      <span style={{ fontFamily: MONO, color: valColor ?? PALETTE.ink, fontSize: 16, fontWeight: 900 }}>{v}</span>
    </div>
  );
}
