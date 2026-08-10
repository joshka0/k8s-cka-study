import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Horizontal, Label, SANS, MONO, Dot } from '../ui';
import type { Beat } from '../script';
import { appear, seg } from '../motion';

export const Endpoints: React.FC<{ beat: Beat }> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const ready = appear(t, 0.06, 0.18);
  const signal = seg(t, 0.2, 0.34);
  const row = seg(t, 0.34, 0.5);
  const pull = seg(t, 0.52, 0.7);
  const emptyCase = seg(t, 0.74, 0.9);

  const nodes = ['kube-proxy · node-1', 'kube-proxy · node-2', 'kube-proxy · node-3'];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* top: pod reports ready, signal up */}
      <Horizontal center gap={30} style={{ marginTop: 20, alignItems: 'flex-end' }}>
        <Box pad={14} borderColor={PALETTE.good} style={{ width: 200, textAlign: 'center' }}>
          <Label color={PALETTE.cyan} size={11}>pod</Label>
          <Horizontal center gap={8}>
            <Dot color={PALETTE.good} />
            <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 24, fontWeight: 900 }}>Ready</span>
          </Horizontal>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13 }}>10.0.0.16</div>
        </Box>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: PALETTE.cyan, fontSize: 20 }}>
          <span style={{ opacity: signal > 0 ? signal : 0 }}>▲</span>
          <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, opacity: appear(t, 0.14, 0.22) }}>report</span>
        </div>
        <Box pad={14} borderColor={PALETTE.blue} style={{ width: 230, textAlign: 'center' }}>
          <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>EndpointSlice controller</div>
        </Box>
      </Horizontal>

      {/* endpointslice object gains a row */}
      <Box pad={16} borderColor={PALETTE.blue} style={{ width: 760, margin: '34px auto 0', textAlign: 'center' }}>
        <Label color={PALETTE.blue} size={12}>Service · EndpointSlice</Label>
        <div style={{ fontFamily: MONO, fontSize: 17, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', color: PALETTE.muted }}>
            <span>ready backends</span>
            <span>ip</span>
          </div>
          {row > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: `${PALETTE.good}1f`,
                border: `1px solid ${PALETTE.good}`,
                borderRadius: 8,
                color: PALETTE.good,
                fontWeight: 800,
                opacity: row,
                translate: `${(1 - row) * 0}px ${(1 - row) * -20}px`,
              }}
            >
              <span>↳ ready</span>
              <span>10.0.0.16:8080</span>
            </div>
          )}
        </div>
      </Box>

      {/* three nodes pulling the object down */}
      <Horizontal center gap={16} style={{ marginTop: 34, justifyContent: 'center' }}>
        {nodes.map((n, i) => (
          <div key={n} style={{ opacity: appear(t, 0.5 + i * 0.06, 0.56 + i * 0.06), transform: `translateY(${(1 - pull) * -16 * (i % 2 ? 1 : -1)}px)` }}>
            <Box pad={12} borderColor={PALETTE.violet} style={{ width: 280, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 800 }}>{n}</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13 }}>↓ reads EndpointSlice</div>
            </Box>
          </div>
        ))}
      </Horizontal>

      {/* empty endpoints case — kept in flow; absolute right-positioning put it
          outside the frame, and the beat has room for it below the node row. */}
      <div
        style={{
          margin: '34px auto 0',
          width: 'fit-content',
          border: `2px solid ${PALETTE.amber}`,
          borderRadius: 16,
          background: `${PALETTE.amber}12`,
          padding: '14px 26px',
          textAlign: 'center',
          opacity: emptyCase,
        }}
      >
        <Label color={PALETTE.amber} size={11}>no ready backends</Label>
        <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 16, fontWeight: 800, marginTop: 4 }}>
          EndpointSlice empty (0 rows)
        </div>
      </div>
    </div>
  );
};
