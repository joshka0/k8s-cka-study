import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 12 beat 12 — the ninety-second answer. Six lines build one at a
 * time as spoken; each is anchored to the spine segments it covers, so the
 * answer and the diagram are visibly the same thing. Ends with all six on
 * screen as a single readable summary — the still a viewer will pause and
 * screenshot.
 */

const LINES = [
  {
    text: 'Clients declare intent through a policy-enforcing API, persisted in etcd.',
    spine: 'desired object · admission / storage',
    color: PALETTE.blue,
  },
  {
    text: 'Controllers reconcile objects, and the scheduler binds Pods.',
    spine: 'watch + cache · controller queue · scheduler queue + binding',
    color: PALETTE.cyan,
  },
  {
    text: 'Kubelets coordinate runtime, networking and storage.',
    spine: 'kubelet · CRI · CNI · CSI',
    color: PALETTE.violet,
  },
  {
    text: 'Services and DNS expose ready endpoints.',
    spine: 'EndpointSlice · service · DNS',
    color: PALETTE.amber,
  },
  {
    text: 'Every stage is asynchronous, observable and retryable.',
    spine: 'the whole spine',
    color: PALETTE.good,
  },
  {
    text: 'All of it protected by ownership, quorum, flow control and recovery.',
    spine: 'the whole spine',
    color: PALETTE.good,
  },
];

export const NinetySeconds: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const lineOn = LINES.map((_, i) => appear(t, 0.06 + i * 0.14, 0.14 + i * 0.14));
  const footer = appear(t, 0.94, 0.98);

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
          <Label color={PALETTE.cyan} size={13}>the whole architecture in ninety seconds — six lines, each anchored to the spine</Label>
        </div>

        <div style={{ position: 'absolute', left: 140, top: 60, width: 1340, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {LINES.map((l, i) => {
            const on = lineOn[i];
            return (
              <div
                key={l.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  borderRadius: 12,
                  border: `1px solid ${on > 0.5 ? l.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${l.color}08` : 'transparent',
                  padding: '12px 18px',
                  opacity: Math.max(0.25, on),
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: l.color, width: 34, flex: '0 0 34px' }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, lineHeight: 1.4 }}>
                    {l.text}
                  </div>
                </div>
                <span
                  style={{
                    flex: '0 0 330px',
                    textAlign: 'right',
                    fontFamily: MONO,
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: l.color,
                    lineHeight: 1.35,
                  }}
                >
                  {l.spine}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the answer and the diagram are the same thing — this frame holds up on its own</Label>
        </div>
      </div>
    </div>
  );
};
