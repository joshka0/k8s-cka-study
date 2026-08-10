import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 12 beat 10 — isolate the layer. The control-plane layers stacked,
 * each with the one signal that belongs to it: API request latency, storage
 * latency, watch and cache behaviour, work queue depth. One layer is lit as
 * slow and its signal moves while the others stay flat. 'Total Pod count'
 * sits aside, struck through, as a non-diagnostic number.
 */

const LAYERS = [
  { name: 'API request latency', signal: 'p99 latency', color: PALETTE.blue, slow: false },
  { name: 'storage (etcd) latency', signal: 'write + read latency', color: PALETTE.violet, slow: true },
  { name: 'watch + cache behaviour', signal: 'watch events · cache staleness', color: PALETTE.cyan, slow: false },
  { name: 'work queue depth', signal: 'queue depth · retries', color: PALETTE.amber, slow: false },
];

export const IsolateLayer: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const layerOn = LAYERS.map((_, i) => appear(t, 0.08 + i * 0.1, 0.16 + i * 0.1));
  const slowIn = seg(t, 0.34, 0.54);
  const strikeIn = seg(t, 0.58, 0.68);
  const footer = appear(t, 0.86, 0.94);

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
      <div style={{ width: 1620, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>each control-plane layer owns one signal — light the slow layer and its signal moves</Label>
        </div>

        <div style={{ position: 'absolute', left: 140, top: 70, width: 1340, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {LAYERS.map((l, i) => {
            const on = layerOn[i];
            const isSlow = l.slow && slowIn > 0.5;
            return (
              <div
                key={l.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  borderRadius: 14,
                  border: `2px solid ${on > 0.5 ? (isSlow ? PALETTE.bad : l.color) : PALETTE.line}`,
                  background: on > 0.5 ? (isSlow ? `${PALETTE.bad}0a` : '#0c111c') : PALETTE.panel,
                  padding: '12px 18px',
                  opacity: Math.max(0.3, on),
                  boxShadow: isSlow ? `0 0 22px ${PALETTE.bad}33` : 'none',
                }}
              >
                <div style={{ width: 300, flex: '0 0 300px' }}>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17.5, fontWeight: 900 }}>{l.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: PALETTE.muted, marginTop: 4 }}>signal: {l.signal}</div>
                </div>
                {/* the signal trace */}
                <div style={{ flex: 1, position: 'relative', height: 42, borderRadius: 8, border: `1px solid ${PALETTE.line}55`, background: '#0a1019', overflow: 'hidden' }}>
                  {/* flat line */}
                  <div style={{ position: 'absolute', left: 0, right: 0, top: 24, borderTop: `2px solid ${PALETTE.line}44` }} />
                  {isSlow && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: 42,
                        background: `linear-gradient(90deg, ${PALETTE.bad}00 0%, ${PALETTE.bad}11 40%, ${PALETTE.bad}66 100%)`,
                        opacity: 0.5 + 0.5 * Math.abs(Math.sin(frame / 10)),
                      }}
                    />
                  )}
                  <div style={{ position: 'absolute', left: 12, top: 8, fontFamily: MONO, fontSize: 13, fontWeight: 900, color: isSlow ? PALETTE.bad : PALETTE.muted }}>
                    {isSlow ? '▲ climbing — the layer that is slow' : '— flat'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* the non-diagnostic number */}
        <div style={{ position: 'absolute', left: 140, top: 516, width: 1340, borderRadius: 14, border: `1px dashed ${PALETTE.line}`, padding: '12px 20px', textAlign: 'center', opacity: strikeIn }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 20,
              fontWeight: 800,
              color: PALETTE.muted,
              textDecoration: 'line-through',
              textDecorationThickness: 2,
              textDecorationColor: PALETTE.bad,
            }}
          >
            total Pod count — 4,212
          </span>
          <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: PALETTE.muted, marginLeft: 16 }}>
            non-diagnostic — set it aside; it names no layer
          </span>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the layer that is slow owns the signal that moves — find the moving signal, and you have named the layer</Label>
        </div>
      </div>
    </div>
  );
};
