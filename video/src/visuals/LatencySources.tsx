import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 16 beat 6 — latency without high usage. A low, flat average
 * utilisation line up top; beneath it three distinct sources of latency the
 * average conceals — throttling, run-queue delay, remote memory access — each
 * with the node-level metric that reveals it. The contrast between the calm
 * average and the specific evidence is the beat.
 */

const SOURCES = [
  { name: 'throttling', metric: 'cfs_throttled / quota metrics', note: 'time you were not allowed to run', color: PALETTE.bad },
  { name: 'run-queue delay', metric: 'scheduling delay / runqueue', note: 'time you waited for a core', color: PALETTE.amber },
  { name: 'remote memory access', metric: 'NUMA-crossing memory access', note: 'locality broken — memory off-node', color: PALETTE.cyan },
];

export const LatencySources: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const avgIn = appear(t, 0.08, 0.16);
  const sourceOn = SOURCES.map((_, i) => appear(t, 0.24 + i * 0.08, 0.31 + i * 0.08));
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
          <Label color={PALETTE.cyan} size={13}>average utilisation can look low while latency is poor — the average conceals three things</Label>
        </div>

        {/* the calm average */}
        <div style={{ position: 'absolute', left: 130, top: 64, width: 1400, borderRadius: 16, border: `2px solid ${PALETTE.line}55`, background: '#0d1522', padding: '16px 22px', opacity: avgIn }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Label color={PALETTE.muted} size={12}>average CPU utilisation — low, flat</Label>
            <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color: PALETTE.muted }}>~ 12%</span>
          </div>
          {/* a flat low line */}
          <svg width="1340" height="60" viewBox="0 0 1340 60">
            <polyline
              points="0,44 200,46 420,42 640,45 860,43 1080,46 1340,44"
              fill="none"
              stroke={PALETTE.muted}
              strokeWidth="2.5"
            />
            <text x="20" y="18" fill={PALETTE.muted} fontSize="14" fontFamily="monospace">“everything looks fine”</text>
          </svg>
        </div>

        {/* the sources */}
        <div style={{ position: 'absolute', left: 130, top: 300, width: 1400, display: 'flex', gap: 16 }}>
          {SOURCES.map((s, i) => {
            const on = sourceOn[i];
            return (
              <div
                key={s.name}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  border: `2px solid ${on > 0.5 ? s.color : PALETTE.line}`,
                  background: on > 0.5 ? `${s.color}08` : '#101826',
                  padding: '16px 18px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <div style={{ fontFamily: MONO, color: s.color, fontSize: 16, fontWeight: 900 }}>{i + 1} · {s.name}</div>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14, fontWeight: 800, marginTop: 8 }}>{s.note}</div>
                <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.muted, borderTop: `1px solid ${PALETTE.line}`, marginTop: 12, paddingTop: 10, lineHeight: 1.4 }}>
                  node metric: <span style={{ color: s.color }}>{s.metric}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>averages hide all three, and each leaves different evidence on the node — read the specific metric</Label>
        </div>
      </div>
    </div>
  );
};
