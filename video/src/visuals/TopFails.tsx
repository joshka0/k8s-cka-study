import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 22 beat 2 — when top fails. The same chain with each link testable,
 * and a failure injected at one point (the kubelet summary endpoint is
 * unreachable from metrics-server). Beside it, a healthy Prometheus stack
 * drawn as a parallel, unrelated path — so the reader sees why one can be
 * green while the other is broken.
 */

const LINKS = [
  { name: 'metrics-server running?', check: 'deployment · pod status', color: PALETTE.blue, fail: false },
  { name: 'aggregated API registered & available?', check: 'APIService · discovery', color: PALETTE.cyan, fail: false },
  { name: 'kubelet summary endpoint reachable?', check: 'metrics-server → kubelet:10250', color: PALETTE.violet, fail: true },
];

const PROM = ['Prometheus scrape', 'exporter / metrics endpoint', 'its own view of the world'];

export const TopFails: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const linkOn = LINKS.map((_, i) => appear(t, 0.1 + i * 0.09, 0.18 + i * 0.09));
  const inject = seg(t, 0.32, 0.44);
  const promIn = appear(t, 0.55, 0.66);
  const footer = appear(t, 0.86, 0.93);

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
          <Label color={PALETTE.cyan} size={13}>when kubectl top fails, trace this chain — do not reach for your dashboards</Label>
        </div>

        {/* the chain with testable links */}
        <div style={{ position: 'absolute', left: 120, top: 52, width: 900 }}>
          <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 12 }}>trace the chain — each link testable</Label>
          {LINKS.map((l, i) => {
            const on = linkOn[i];
            const isFail = l.fail && inject > 0.5;
            const state = isFail ? '✕ broken' : '✓ ok';
            const color = isFail ? PALETTE.bad : PALETTE.good;
            return (
              <div
                key={l.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  borderRadius: 12,
                  border: `2px solid ${color}66`,
                  background: isFail ? `${PALETTE.bad}0c` : `${color}06`,
                  padding: '12px 16px',
                  marginBottom: 10,
                  opacity: Math.max(0.3, on),
                  boxShadow: isFail ? `0 0 20px ${PALETTE.bad}22` : 'none',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: MONO, fontSize: 16.5, fontWeight: 900, color: PALETTE.ink }}>{l.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 3 }}>{l.check}</div>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color }}>{state}</span>
              </div>
            );
          })}
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.amber, marginTop: 6, opacity: inject * 0.8 + 0.2 }}>
            failure injected: the kubelet’s summary endpoint is unreachable from metrics-server — the third link, the one usually skipped
          </div>
        </div>

        {/* the healthy unrelated Prometheus path */}
        <div
          style={{
            position: 'absolute',
            left: 1060,
            top: 52,
            width: 500,
            borderRadius: 18,
            border: `2px solid ${PALETTE.good}55`,
            background: `${PALETTE.good}06`,
            padding: '18px 20px',
            opacity: promIn,
          }}
        >
          <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 12 }}>meanwhile — a healthy Prometheus stack</Label>
          {PROM.map((p, i) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, opacity: appear(t, 0.6 + i * 0.06, 0.66 + i * 0.06) }}>
              <span style={{ color: PALETTE.good, fontWeight: 900 }}>✓</span>
              <span style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink }}>{p}</span>
            </div>
          ))}
          <div
            style={{
              marginTop: 12,
              borderTop: `1px solid ${PALETTE.good}44`,
              paddingTop: 10,
              fontFamily: MONO,
              fontSize: 13.5,
              fontWeight: 800,
              color: PALETTE.muted,
              lineHeight: 1.4,
            }}
          >
            a separate observability path entirely — its health proves nothing about the resource-metrics chain
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 1060,
            top: 356,
            width: 500,
            borderRadius: 14,
            border: `2px solid ${PALETTE.amber}`,
            background: `${PALETTE.amber}0a`,
            padding: '14px 18px',
            textAlign: 'center',
            opacity: promIn,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink }}>
            one green, one broken — and both are telling the truth
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>Prometheus being healthy has nothing to do with kubectl top being broken</Label>
        </div>
      </div>
    </div>
  );
};
