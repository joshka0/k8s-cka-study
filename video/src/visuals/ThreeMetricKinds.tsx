import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 22 beat 3 — three kinds of metric get called monitoring. Each answers
 * a different question: what (resource), who collects it, and — the point —
 * how long it lives. Retention decides whether a question is answerable an
 * hour later, so it is drawn as the row that differs.
 */

const KINDS = [
  {
    name: 'resource metrics',
    answers: 'CPU & memory for Pods and Nodes',
    collects: 'kubelet summary → metrics-server → metrics API',
    life: 'recent only — in-memory, no durable history',
    color: PALETTE.blue,
  },
  {
    name: 'component metrics',
    answers: 'Kubernetes internals and health',
    collects: 'component endpoints, scraped by an observability stack',
    life: 'as long as your store keeps it',
    color: PALETTE.violet,
  },
  {
    name: 'application metrics',
    answers: 'whatever your workload emits',
    collects: 'your app’s own exporter / telemetry',
    life: 'whatever you run — often the longest of the three',
    color: PALETTE.cyan,
  },
];

export const ThreeMetricKinds: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const colOn = KINDS.map((_, i) => appear(t, 0.08 + i * 0.12, 0.16 + i * 0.12));
  const footer = appear(t, 0.84, 0.92);

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
      <div style={{ width: 1680, height: 740, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>three kinds of metric, three different answers — and three different lives</Label>
        </div>

        {/* column headers */}
        <div style={{ position: 'absolute', left: 120, top: 52, width: 1440, display: 'flex', gap: 30 }}>
          <div style={{ flex: 1, fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: 2, color: PALETTE.muted }}>WHAT IT MEASURES</div>
          <div style={{ flex: 1, fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: 2, color: PALETTE.muted }}>WHO COLLECTS IT</div>
          <div style={{ flex: 1, fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: 2, color: PALETTE.muted }}>HOW LONG IT LIVES</div>
        </div>

        {/* the three rows */}
        <div style={{ position: 'absolute', left: 120, top: 80, width: 1440, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {KINDS.map((k, i) => {
            const on = colOn[i];
            return (
              <div
                key={k.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 30,
                  borderRadius: 14,
                  border: `2px solid ${on > 0.5 ? k.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${k.color}08` : '#101826',
                  padding: '16px 20px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: MONO, color: k.color, fontSize: 19, fontWeight: 900 }}>{k.name}</div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14.5, fontWeight: 700, marginTop: 4 }}>{k.answers}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0, fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 800, lineHeight: 1.4 }}>{k.collects}</div>
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontFamily: MONO,
                    fontSize: 15,
                    fontWeight: 800,
                    color: i === 2 ? PALETTE.good : PALETTE.amber,
                    borderRadius: 10,
                    background: '#0c111c',
                    padding: '11px 14px',
                    lineHeight: 1.4,
                  }}
                >
                  {k.life}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: appear(t, 0.6, 0.68) }}>
          <Label color={PALETTE.amber} size={13}>knowing which kind you need tells you where to look — the retention row decides whether the question is answerable later</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>by the time you ask “an hour ago”, only one of the three can answer — retention is the discriminator</Label>
        </div>
      </div>
    </div>
  );
};
