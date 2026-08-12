import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 13 beat 4 — separate contracts, separate steps. Six independently
 * versioned boundaries stacked, each with its own skew contract drawn as a
 * permitted range rather than a single number. One boundary advances while
 * the others hold still — the point is independence, never one cluster
 * version.
 */

const BOUNDARIES = [
  { name: 'kube-apiserver', range: 'permitted skew band' },
  { name: 'kube-controller-manager', range: 'permitted skew band' },
  { name: 'kube-scheduler', range: 'permitted skew band' },
  { name: 'kubelet', range: 'older / newer window' },
  { name: 'kube-proxy', range: 'its own window' },
  { name: 'runtime · CNI · stored APIs', range: 'separate compatibility limits' },
];

const AMBER = PALETTE.amber;
const CYAN = PALETTE.cyan;

export const SkewBoundaries: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const rowOn = BOUNDARIES.map((_, i) => appear(t, 0.06 + i * 0.08, 0.13 + i * 0.08));
  const advance = appear(t, 0.58, 0.72);
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
      <div style={{ width: 1560, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>six boundaries, each versioned on its own — advances happen one compatibility contract at a time</Label>
        </div>

        <div style={{ position: 'absolute', left: 40, top: 70, width: 1480, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {BOUNDARIES.map((b, i) => {
            const on = rowOn[i];
            const isAdvancing = i === 0 && advance > 0.5;
            return (
              <div
                key={b.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  borderRadius: 14,
                  border: `2px solid ${isAdvancing ? AMBER : on > 0.5 ? PALETTE.line : '#16202f'}`,
                  background: isAdvancing ? `${AMBER}0d` : on > 0.5 ? PALETTE.panel : '#101826',
                  padding: '14px 20px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: isAdvancing ? AMBER : PALETTE.ink, width: 360, flex: '0 0 360px' }}>
                  {b.name}
                </span>
                {/* a permitted range, not one number */}
                <div style={{ flex: 1, position: 'relative', height: 22 }}>
                  {/* the band */}
                  <div style={{ position: 'absolute', left: 60, right: 180, top: 3, height: 16, borderRadius: 8, border: `1px solid ${isAdvancing ? AMBER : PALETTE.blue}55`, background: `${isAdvancing ? AMBER : PALETTE.blue}22` }} />
                  {/* ticks within the band */}
                  {[0, 1, 2, 3, 4].map((k) => (
                    <span key={k} style={{ position: 'absolute', left: 60 + k * ((1480 - 260 - 60) / 4), top: 3, width: 2, height: 16, background: '#0b111d' }} />
                  ))}
                  {/* the advancing marker */}
                  <span
                    style={{
                      position: 'absolute',
                      left: isAdvancing ? 250 : 130,
                      top: -2,
                      fontFamily: MONO,
                      fontSize: 13,
                      fontWeight: 900,
                      color: isAdvancing ? AMBER : PALETTE.cyan,
                      border: `2px solid ${isAdvancing ? AMBER : CYAN}`,
                      borderRadius: 999,
                      background: '#0d1522',
                      padding: '3px 10px',
                    }}
                  >
                    {isAdvancing ? 'advancing' : 'now'}
                  </span>
                  <span style={{ position: 'absolute', right: 0, top: 3, fontFamily: MONO, fontSize: 13, fontWeight: 800, color: isAdvancing ? AMBER : PALETTE.muted, whiteSpace: 'nowrap' }}>
                    {b.range}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: advance }}>
          <Label color={PALETTE.amber} size={13}>advance one and the rest hold still — an upgrade moves a single compatibility boundary, not "the cluster version"</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>treating the cluster as one version is exactly what turns an upgrade into an outage</Label>
        </div>
      </div>
    </div>
  );
};
