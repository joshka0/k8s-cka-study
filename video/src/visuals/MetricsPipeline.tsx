import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 22 beat 1 — one narrow pipeline. kubectl top reads exactly one path:
 * kubelet summary → metrics-server → aggregated metrics API → consumers.
 * Around it, the things people expect it to cover — application metrics,
 * history, logs, component health — are drawn explicitly outside the chain.
 */

const CHAIN = [
  { name: 'kubelet', detail: 'summary endpoint: CPU · memory', color: PALETTE.violet },
  { name: 'metrics-server', detail: 'collects and aggregates', color: PALETTE.blue },
  { name: 'metrics API', detail: 'resource metrics, aggregated', color: PALETTE.cyan },
  { name: 'consumers', detail: 'kubectl top · autoscaling', color: PALETTE.good },
];

const OUTSIDE = [
  'application metrics (whatever your app emits)',
  'durable history (there is no long-term store)',
  'logs (never here)',
  'control-plane health',
];

export const MetricsPipeline: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const chainIn = appear(t, 0.08, 0.18);
  const linkIn = (i: number) => appear(t, 0.16 + i * 0.1, 0.24 + i * 0.1);
  const outsideIn = OUTSIDE.map((_, i) => appear(t, 0.5 + i * 0.07, 0.58 + i * 0.07));
  const footer = appear(t, 0.88, 0.94);

  const feed = seg(t, 0.16, 0.5);

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
          <Label color={PALETTE.cyan} size={13}>kubectl top reads exactly one path — and it is deliberately narrow</Label>
        </div>

        {/* the chain */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 56,
            width: 1440,
            borderRadius: 18,
            border: `2px solid ${PALETTE.good}55`,
            background: `${PALETTE.good}04`,
            padding: '20px 22px',
            opacity: chainIn,
          }}
        >
          <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 16 }}>the one narrow chain — resource signals only</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {CHAIN.map((c, i) => (
              <React.Fragment key={c.name}>
                <Box pad={12} borderColor={c.color} style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                  <div style={{ fontFamily: MONO, color: c.color, fontSize: 17, fontWeight: 900 }}>{c.name}</div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>{c.detail}</div>
                </Box>
                {i < CHAIN.length - 1 && (
                  <span style={{ color: PALETTE.good, fontSize: 20, fontWeight: 900, opacity: linkIn(i) }}>→</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted, marginTop: 14, opacity: feed }}>
            built for recent resource signals — usage now, not history
          </div>
        </div>

        {/* what it is not */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 330,
            width: 1440,
            borderRadius: 18,
            border: `2px dashed ${PALETTE.bad}55`,
            background: `${PALETTE.bad}04`,
            padding: '20px 22px',
          }}
        >
          <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 14 }}>what people expect it to cover — explicitly outside the chain</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {OUTSIDE.map((o, i) => (
              <div
                key={o}
                style={{
                  fontFamily: MONO,
                  fontSize: 15.5,
                  fontWeight: 800,
                  color: PALETTE.ink,
                  border: `1px solid ${PALETTE.bad}44`,
                  borderRadius: 10,
                  background: '#0d1522',
                  padding: '11px 14px',
                  opacity: outsideIn[i],
                }}
              >
                <span style={{ color: PALETTE.bad, fontWeight: 900, marginRight: 8 }}>✕</span>{o}
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.amber, marginTop: 14, opacity: feed }}>
            if the question is “an hour ago” or “is the app healthy”, this is the wrong pipeline
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', opacity: appear(t, 0.7, 0.78) }}>
          <Label color={PALETTE.cyan} size={13}>custom/external HPA metrics are a separate API — a different path entirely</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 676, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>narrow on purpose: resource signals for Pods and Nodes, nothing else</Label>
        </div>
      </div>
    </div>
  );
};
