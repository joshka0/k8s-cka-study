import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 16 beat 1 — aggregate capacity is not locality. One node drawn twice:
 * as the scheduler sees it (a single comfortable pool of CPU/memory/devices)
 * and as the hardware actually is (split across NUMA nodes, the same totals
 * unevenly distributed). Same numbers, different feasibility, both on screen.
 */

export const ClusterVsLocal: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const schIn = appear(t, 0.1, 0.2);
  const hwIn = appear(t, 0.24, 0.36);
  const footer = appear(t, 0.9, 0.97);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 1660, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>cluster feasibility and hardware locality are different questions — same node, two views</Label>
        </div>

        {/* as the scheduler sees it */}
        <div style={{ position: 'absolute', left: 130, top: 70, width: 650, borderRadius: 20, border: `2px solid ${PALETTE.blue}`, background: `${PALETTE.blue}06`, padding: '18px 22px', opacity: schIn }}>
          <Label color={PALETTE.blueInk} size={12} style={{ marginBottom: 12 }}>as the scheduler sees it</Label>
          <div style={{ borderRadius: 12, border: `1px solid ${PALETTE.blue}55`, background: '#0d1522', padding: '12px 16px' }}>
            <div style={{ fontFamily: MONO, fontWeight: 900, color: PALETTE.good, fontSize: 15 }}>a single pool — comfortably sufficient ✓</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 6 }}>
              CPU 32 · memory 128Gi · devices 8
            </div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 10 }}>
            one node, one bucket — sums capacity
          </div>
        </div>

        <div style={{ position: 'absolute', left: 800, top: 210, color: PALETTE.line, fontSize: 40, fontWeight: 900, opacity: schIn }}>→</div>

        {/* as the hardware is */}
        <div style={{ position: 'absolute', left: 880, top: 70, width: 650, borderRadius: 20, border: `2px solid ${PALETTE.amber}`, background: `${PALETTE.amber}06`, padding: '18px 22px', opacity: hwIn }}>
          <Label color={PALETTE.amber} size={12} style={{ marginBottom: 12 }}>as the hardware actually is</Label>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${PALETTE.amber}55`, background: '#0d1522', padding: '12px 14px' }}>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.amber }}>NUMA 0</div>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 13, fontWeight: 800, marginTop: 6 }}>CPU 8 · mem 40Gi</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 4 }}>devices here</div>
            </div>
            <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${PALETTE.amber}55`, background: '#0d1522', padding: '12px 14px' }}>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.amber }}>NUMA 1</div>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 13, fontWeight: 800, marginTop: 6 }}>CPU 24 · mem 88Gi</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 4 }}>no devices</div>
            </div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 13.5, fontWeight: 800, marginTop: 12 }}>
            same totals — but split so a device + its memory + CPU may not sit together
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: hwIn }}>
          <Label color={PALETTE.amber} size={13}>the scheduler is summing capacity — it is not laying out silicon</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>same numbers, different feasibility — the aggregate says yes, locality still has to be proven</Label>
        </div>
      </div>
    </div>
  );
};
