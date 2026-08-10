import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const ValidateEarly: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const top = appear(t, 0.14, 0.26);
  const topReject = appear(t, 0.34, 0.42);
  const bot = appear(t, 0.5, 0.62);
  const stored = appear(t, 0.62, 0.7);
  const readers = appear(t, 0.72, 0.8);
  const late = appear(t, 0.82, 0.9);
  const footer = appear(t, 0.92, 0.98);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 100, paddingRight: 100 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        push validation into the API server — reject early or explain forever
      </Label>

      {/* top: validated in the CRD */}
      <div style={{ border: `1px solid ${PALETTE.good}55`, borderRadius: 20, padding: 16, opacity: top }}>
        <Label color={PALETTE.good} size={12} style={{ marginBottom: 12 }}>rule expressed in the CRD — rejected at admission</Label>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <Mini label="bad object" color={PALETTE.bad} />
          <span style={{ color: PALETTE.muted, fontSize: 18 }}>→</span>
          <Box pad={10} borderColor={PALETTE.good} style={{ width: 210, textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 15, fontWeight: 900 }}>CRD rule (gate)</div>
          </Box>
          <span style={{ color: PALETTE.bad, fontSize: 24, opacity: topReject }}>✕</span>
          <Mini label="nothing stored" color={PALETTE.good} />
        </div>
        <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 10, textAlign: 'center', opacity: topReject }}>
          rejected before anything is stored, before the controller ever sees it
        </div>
      </div>

      {/* bottom: enforced only in the controller */}
      <div style={{ marginTop: 22, border: `1px solid ${PALETTE.bad}55`, borderRadius: 20, padding: 16, opacity: bot }}>
        <Label color={PALETTE.bad} size={12} style={{ marginBottom: 12 }}>enforced only in the controller — the object is already in etcd</Label>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <Mini label="bad object" color={PALETTE.bad} />
          <span style={{ color: PALETTE.muted, fontSize: 18 }}>→</span>
          <Box pad={10} borderColor={PALETTE.line} style={{ width: 190, textAlign: 'center', opacity: stored }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900 }}>admitted + stored</div>
          </Box>
          <span style={{ color: PALETTE.muted, fontSize: 18, opacity: stored }}>→</span>
          <Box pad={10} borderColor={PALETTE.cyan} style={{ width: 190, textAlign: 'center', opacity: readers }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14, fontWeight: 900 }}>two clients read it</div>
          </Box>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12, opacity: late }}>
          <Box pad={10} borderColor={PALETTE.bad} bg={`${PALETTE.bad}10`} style={{ display: 'inline-block' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 15, fontWeight: 900 }}>
              only later: a status condition nobody is watching
            </span>
          </Box>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>your only way to complain is a status condition nobody is watching</Label>
      </div>
    </div>
  );
};

function Mini({ label, color }: { label: string; color: string }) {
  return (
    <Box pad={10} borderColor={color} style={{ background: `${color}0a` }}>
      <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900 }}>{label}</div>
    </Box>
  );
}
