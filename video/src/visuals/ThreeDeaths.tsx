import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const DEATHS = [
  { actor: 'scheduler · preemption', trigger: 'a higher-priority pod is pending', logs: 'read scheduler events', color: PALETTE.blue, at: { left: 100, top: 40 } },
  { actor: 'kubelet · eviction', trigger: 'local memory / disk pressure', logs: 'read kubelet logs', color: PALETTE.violet, at: { left: 1120, top: 40 } },
  { actor: 'API · eviction (voluntary)', trigger: 'a drain / respects budgets', logs: 'read Eviction API + PDB', color: PALETTE.good, at: { left: 610, top: 380 } },
];

export const ThreeDeaths: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const pod = appear(t, 0.1, 0.2);
  const src = (i: number) => appear(t, 0.3 + i * 0.18, 0.38 + i * 0.18);
  const footer = appear(t, 0.88, 0.96);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 24, paddingLeft: 90, paddingRight: 90 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        three mechanisms get collapsed into one word — different actors, different triggers, different logs
      </Label>

      <div style={{ position: 'relative', width: 1400, height: 600, margin: '0 auto' }}>
        {/* source boxes */}
        {DEATHS.map((d, i) => {
          const on = src(i);
          const yOff = d.at.top === 380 ? 0 : -30;
          return (
            <div key={d.actor} style={{ position: 'absolute', left: d.at.left, top: d.at.top, width: 330, textAlign: 'center', opacity: on }}>
              <Box pad={12} borderColor={d.color} style={{ background: `${d.color}0c` }}>
                <div style={{ fontFamily: MONO, color: d.color, fontSize: 16, fontWeight: 900 }}>{d.actor}</div>
                <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 14, marginTop: 4 }}>{d.trigger}</div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, marginTop: 6, fontWeight: 700 }}>logs → {d.logs}</div>
              </Box>
              <div style={{ textAlign: 'center', marginTop: 6 }}><span style={{ color: d.color, fontSize: 24 }}>▼</span></div>
            </div>
          );
        })}

        {/* the pod */}
        <div style={{ position: 'absolute', left: 610, top: 250, textAlign: 'center', opacity: pod }}>
          <Box pad={16} borderColor={PALETTE.cyan} bg={`${PALETTE.cyan}12`} style={{ width: 220, textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>one Pod</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, marginTop: 4, fontWeight: 700 }}>removed by three paths</div>
          </Box>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 10, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>scheduler preemption removes · kubelet terminates on pressure · API eviction honours budgets</Label>
      </div>
    </div>
  );
};
