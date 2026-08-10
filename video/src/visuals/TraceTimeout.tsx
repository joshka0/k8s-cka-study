import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 08 beat 11 — it resolves, nothing answers. An ordered trace: each
 * row lights as named, with the check beside it and what a failure there
 * would prove. Row two — testing a ready Pod address directly — is the split
 * point: it divides a Service problem from a Pod problem. Rows wrap text
 * rather than clipping the longer checks.
 */

const ROWS = [
  {
    n: '01',
    title: 'Check the Service selector, its ports, its EndpointSlices',
    check: 'kubectl get svc my-svc · kubectl get endpointslices -l kubernetes.io/service-name=my-svc',
    proves: 'empty or wrong endpoints → a Service problem',
    branch: null,
    color: PALETTE.blue,
  },
  {
    n: '02',
    title: 'From the same source, test the ready Pod address and port directly',
    check: 'curl <pod-ip>:<port> — from the same client',
    proves: 'the step that divides a Service problem from a Pod problem',
    branch: null,
    color: PALETTE.cyan,
    split: true,
  },
  {
    n: '03',
    title: 'Direct path works → inspect the Service data plane',
    check: 'kube-proxy rules / eBPF maps for the Service',
    proves: 'rules not programmed → Service routing',
    branch: 'when the direct path works',
    color: PALETTE.violet,
  },
  {
    n: '04',
    title: 'Direct path fails → inspect routing, MTU and NetworkPolicy',
    check: 'routes · MTU · NetworkPolicy on the Pod path',
    proves: 'the Pod path itself',
    branch: 'when the direct path fails',
    color: PALETTE.amber,
  },
];

export const TraceTimeout: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const rowOn = ROWS.map((_, i) => appear(t, 0.1 + i * 0.11, 0.19 + i * 0.11));
  const splitTag = seg(t, 0.16, 0.5);
  const footer = appear(t, 0.86, 0.94);

  const splitPulse = 0.55 + 0.45 * Math.sin(frame / 8);

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
      <div style={{ width: 1620, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>DNS resolves and the ClusterIP times out — an ordered trace, each step lighting as named</Label>
        </div>

        {ROWS.map((r, i) => {
          const on = rowOn[i];
          const y = 56 + i * 152;
          const isSplit = (r as { split?: boolean }).split;
          return (
            <div
              key={r.n}
              style={{
                position: 'absolute',
                left: 40,
                top: y,
                width: 1540,
                minHeight: 132,
                borderRadius: 16,
                border: `2px solid ${i === 2 || i === 3 ? r.color : isSplit ? r.color : PALETTE.line}`,
                background: isSplit ? `${PALETTE.cyan}0d` : i >= 2 ? `${r.color}0a` : PALETTE.panel,
                boxShadow: isSplit ? `0 0 26px ${PALETTE.cyan}33` : 'none',
                padding: '16px 22px',
                display: 'flex',
                flexDirection: 'column',
                opacity: Math.max(0.3, on),
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                <span
                  style={{
                    flex: '0 0 auto',
                    fontFamily: MONO,
                    fontSize: 22,
                    fontWeight: 900,
                    color: isSplit ? PALETTE.cyan : r.color,
                    border: `1px solid ${isSplit ? PALETTE.cyan : r.color}`,
                    borderRadius: 10,
                    padding: '6px 12px',
                  }}
                >
                  {r.n}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900, lineHeight: 1.3 }}>
                    {r.title}
                  </div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 700, marginTop: 8, lineHeight: 1.35 }}>
                    check: {r.check}
                  </div>
                </div>
                <div
                  style={{
                    flex: '0 0 380px',
                    alignSelf: 'flex-start',
                    fontFamily: MONO,
                    fontSize: 15,
                    fontWeight: 800,
                    color: r.proves.startsWith('the step') ? PALETTE.good : PALETTE.amber,
                    border: `1px solid ${PALETTE.amber}55`,
                    borderRadius: 12,
                    background: '#0c111c',
                    padding: '12px 16px',
                    lineHeight: 1.4,
                  }}
                >
                  failure proves: {r.proves}
                </div>
              </div>
              {r.branch && (
                <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 13.5, fontWeight: 900, color: r.color }}>
                  {r.branch}
                </div>
              )}
              {isSplit && (
                <div
                  style={{
                    position: 'absolute',
                    right: 420,
                    top: -18,
                    fontFamily: MONO,
                    fontSize: 14,
                    fontWeight: 900,
                    color: PALETTE.cyan,
                    border: `2px solid ${PALETTE.cyan}`,
                    borderRadius: 999,
                    background: '#0b111d',
                    padding: '6px 14px',
                    opacity: 0.6 + 0.4 * splitPulse,
                  }}
                >
                  the split point — one command divides Service from Pod
                </div>
              )}
            </div>
          );
        })}

        <div style={{ position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>step two decides which way to look — Service data plane, or the Pod's own path</Label>
        </div>
      </div>
    </div>
  );
};
