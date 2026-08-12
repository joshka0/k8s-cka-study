import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 15 beat 4 — every programmable boundary. One request travelling from
 * outside to a Pod, with each programmable boundary marked as a gate along the
 * path and the thing that configures it named underneath. Each boundary carries
 * its own failure symptom — the row reads as a diagnostic, not a diagram.
 */

const GATES = [
  { n: '01', name: 'external address + listener', config: 'the load balancer / LB IP', fail: 'connection refused at the edge', color: PALETTE.blue },
  { n: '02', name: 'controller data plane', config: 'the proxy controller', fail: 'accepted, nothing forwards', color: PALETTE.cyan },
  { n: '03', name: 'route match', config: 'the route object', fail: 'no match → default / 404', color: PALETTE.violet },
  { n: '04', name: 'Service translation', config: 'the Service + selector', fail: 'no endpoints from the selector', color: PALETTE.amber },
  { n: '05', name: 'EndpointSlice readiness', config: 'readiness + endpoints controller', fail: 'ready backends missing', color: PALETTE.good },
  { n: '06', name: 'Pod listener (policy between)', config: 'the app + NetworkPolicy', fail: 'nothing listening / policy drops', color: PALETTE.bad },
];

export const RequestBoundaries: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const gateOn = GATES.map((_, i) => appear(t, 0.06 + i * 0.06, 0.12 + i * 0.06));
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
      <div style={{ width: 1760, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>one external request, six programmable boundaries — each configured by something different, each able to fail alone</Label>
        </div>

        {/* the request origin */}
        <div
          style={{
            position: 'absolute',
            left: 20,
            top: 140,
            width: 180,
            borderRadius: 14,
            border: `2px solid ${PALETTE.ink}`,
            background: `${PALETTE.ink}0a`,
            padding: '14px 12px',
            textAlign: 'center',
            opacity: header,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900 }}>request</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 11.5, fontWeight: 700, marginTop: 4 }}>outside →</div>
        </div>

        <div style={{ position: 'absolute', left: 210, top: 175, color: PALETTE.line, fontSize: 26, fontWeight: 900 }}>→</div>

        {/* the gates */}
        <div style={{ position: 'absolute', left: 210, top: 70, display: 'flex', alignItems: 'center', gap: 6 }}>
          {GATES.map((g, i) => {
            const on = gateOn[i];
            return (
              <React.Fragment key={g.n}>
                {i > 0 && <span style={{ color: PALETTE.line, fontSize: 20, fontWeight: 900 }}>→</span>}
                <div
                  style={{
                    width: 185,
                    boxSizing: 'border-box',
                    borderRadius: 14,
                    border: `2px solid ${on > 0.5 ? g.color : PALETTE.line}`,
                    background: on > 0.5 ? `${g.color}0a` : PALETTE.panel,
                    padding: '12px 12px',
                    minHeight: 250,
                    opacity: Math.max(0.3, on),
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 900, color: g.color }}>boundary {g.n}</span>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14.5, fontWeight: 900, marginTop: 8, lineHeight: 1.3, minHeight: 66 }}>
                    {g.name}
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 800, color: PALETTE.muted, lineHeight: 1.35 }}>
                    configured by — {g.config}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontFamily: MONO,
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: PALETTE.bad,
                      border: `1px solid ${PALETTE.bad}44`,
                      borderRadius: 8,
                      background: '#0d1522',
                      padding: '6px 8px',
                      lineHeight: 1.3,
                    }}
                  >
                    fails as: {g.fail}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <span style={{ color: PALETTE.line, fontSize: 20, fontWeight: 900 }}>→</span>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 30,
            top: 140,
            width: 190,
            borderRadius: 14,
            border: `2px solid ${PALETTE.cyan}`,
            background: `${PALETTE.cyan}0a`,
            padding: '14px 12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900 }}>the Pod</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 11.5, fontWeight: 700, marginTop: 4 }}>its own listener</div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 460, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.muted} size={12.5}>each boundary is a separate thing to check — and a fix in one proves nothing about the others</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>six boundaries, each configured by something different — read which one your symptom names</Label>
        </div>
      </div>
    </div>
  );
};
