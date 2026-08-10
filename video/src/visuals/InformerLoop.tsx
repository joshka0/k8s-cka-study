import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const InformerLoop: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const arch = appear(t, 0.1, 0.22);
  const cache = appear(t, 0.3, 0.4);
  const ctrls = (i: number) => appear(t, 0.42 + i * 0.06, 0.48 + i * 0.06);
  const shared = appear(t, 0.6, 0.7);
  const naive = appear(t, 0.74, 0.84);
  const footer = appear(t, 0.9, 0.96);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 18, paddingLeft: 100, paddingRight: 100 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 22 }}>
        nobody polls — a reflector lists once, then watches
      </Label>

      {/* shared-cache architecture */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: arch }}>
        <Box pad={14} borderColor={PALETTE.blue} style={{ width: 200, textAlign: 'center' }}>
          <Label color={PALETTE.blue} size={11}>control plane</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>API server</div>
        </Box>

        <div style={{ textAlign: 'center', opacity: cache }}>
          <Box pad={12} borderColor={PALETTE.violet} style={{ width: 180 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 17, fontWeight: 900 }}>reflector</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, marginTop: 2, fontWeight: 700 }}>list → watch</div>
          </Box>
        </div>

        <span style={{ color: PALETTE.violet, fontSize: 26, opacity: cache }}>→</span>

        <Box pad={14} borderColor={PALETTE.good} style={{ width: 220, textAlign: 'center', opacity: cache, background: `${PALETTE.good}0e` }}>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 20, fontWeight: 900 }}>shared cache</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, marginTop: 2, fontWeight: 700 }}>one copy, many readers</div>
        </Box>
      </div>

      {/* three controllers read the one cache */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 34 }}>
        {['Deployment ctl', 'ReplicaSet ctl', 'Job ctl'].map((c, i) => (
          <div key={c} style={{ textAlign: 'center', opacity: ctrls(i) }}>
            <Box pad={12} borderColor={PALETTE.cyan} style={{ width: 210 }}>
              <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 17, fontWeight: 900 }}>{c}</div>
            </Box>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 8, opacity: shared }}>
        <Label color={PALETTE.good} size={12}>three controllers read that one cache — the word shared matters</Label>
      </div>

      {/* naive alternative */}
      <div style={{ marginTop: 26, opacity: naive, border: `1px dashed ${PALETTE.bad}66`, borderRadius: 18, padding: 16 }}>
        <Label color={PALETTE.bad} size={11} style={{ textAlign: 'center', marginBottom: 12 }}>
          naive alternative — every controller polls the API server separately (heavier)
        </Label>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
          <div style={{ textAlign: 'center' }}>
            <Box pad={8} borderColor={PALETTE.blue} style={{ width: 170, margin: '0 auto' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14, fontWeight: 900 }}>API server</div>
            </Box>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 10 }}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ textAlign: 'center' }}>
                  <span style={{ color: PALETTE.bad, fontSize: 18 }}>⇅</span>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800 }}>poll</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>at a thousand controllers, repeated polling would flatten the API server</Label>
      </div>
    </div>
  );
};
