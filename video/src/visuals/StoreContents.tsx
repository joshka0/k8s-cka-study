import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const REDIRECT = [
  { label: 'container images', home: 'registry', homeColor: PALETTE.amber },
  { label: 'metrics', home: 'metrics pipeline', homeColor: PALETTE.good },
  { label: 'logs', home: 'the node (unless shipped)', homeColor: PALETTE.cyan },
];

export const StoreContents: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const etcdIn = appear(t, 0.08, 0.2);
  const settle = appear(t, 0.24, 0.34);
  const rowAt = (i: number) => appear(t, 0.4 + i * 0.14, 0.46 + i * 0.14);
  const bounce = (i: number) => seg(t, 0.46 + i * 0.14, 0.54 + i * 0.14);
  const footer = appear(t, 0.86, 0.94);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 16, paddingLeft: 120, paddingRight: 120 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 22 }}>
        etcd holds API state — not images, not metrics, not logs
      </Label>

      {/* etcd cylinder + API objects flowing in */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: etcdIn }}>
          <Box pad={10} borderColor={PALETTE.cyan}>
            <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 17, fontWeight: 800 }}>API object</div>
          </Box>
          <span style={{ color: PALETTE.cyan, fontSize: 28 }}>→</span>
        </div>

        {/* cylinder graphic */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: etcdIn }}>
          <div style={{ width: 150, height: 26, borderRadius: 180, border: `2px solid ${PALETTE.amber}`, background: `${PALETTE.amber}22` }} />
          <div style={{ width: 150, height: 70, borderLeft: `2px solid ${PALETTE.amber}`, borderRight: `2px solid ${PALETTE.amber}`, background: `${PALETTE.amber}0e`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 22, fontWeight: 900 }}>etcd</span>
          </div>
          <div style={{ width: 150, height: 26, borderRadius: 180, border: `2px solid ${PALETTE.amber}`, background: `${PALETTE.amber}22`, marginTop: -2 }} />
        </div>
      </div>

      {settle > 0 && (
        <div style={{ textAlign: 'center', marginTop: 12, opacity: settle }}>
          <Label color={PALETTE.muted} size={12}>API objects settle — declared intent, not your running cluster</Label>
        </div>
      )}

      {/* three redirects */}
      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {REDIRECT.map((r, i) => {
          const on = rowAt(i);
          const b = bounce(i);
          return (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: on, width: 1240, margin: '0 auto' }}>
              <Box pad={12} borderColor={PALETTE.bad} style={{ width: 260, textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>{r.label}</div>
              </Box>
              <div style={{ position: 'relative', width: 260, height: 44 }}>
                <div style={{ position: 'absolute', top: 18, left: 0, width: 200, borderTop: `2px dashed ${PALETTE.bad}`, opacity: 0.7 }} />
                <span style={{ position: 'absolute', left: 200, top: 4, fontSize: 24 }}>✕</span>
                <div style={{ position: 'absolute', top: 18, left: 90, fontFamily: MONO, color: PALETTE.bad, fontSize: 13, fontWeight: 800 }}>
                  not etcd
                </div>
              </div>
              <Box pad={12} borderColor={r.homeColor} style={{ width: 320, textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, color: r.homeColor, fontSize: 20, fontWeight: 900 }}>{r.home}</div>
              </Box>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>a snapshot of etcd captures declared intent — not your cluster</Label>
      </div>
    </div>
  );
};
