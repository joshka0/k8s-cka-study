import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 20 beat 1 — start where something still answers. Two zones with a
 * hard line between them: above, everything answerable through the API; below,
 * host-level evidence. When the API stops answering, the diagnostic entry
 * point moves below the line, and kubectl is greyed out there. The line is the
 * beat.
 */

const ABOVE = ['object status', 'events', 'component health endpoints'];
const BELOW = ['load balancer', 'static Pod manifests', 'kubelet service', 'runtime', 'certificates', 'sockets & host resources'];

export const NearestAuthority: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const aboveIn = appear(t, 0.08, 0.16);
  const belowIn = appear(t, 0.16, 0.26);
  const lineIn = appear(t, 0.2, 0.3);
  const descend = seg(t, 0.44, 0.58);
  const footer = appear(t, 0.9, 0.97);

  const below = descend > 0.5;

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
      <div style={{ width: 1680, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>start at the nearest authority that is still answering — and know where the line is</Label>
        </div>

        {/* the diagnostic entry point */}
        <div
          style={{
            position: 'absolute',
            left: 720,
            bottom: below ? 88 : 360,
            borderRadius: 999,
            border: `3px solid ${PALETTE.amber}`,
            background: `${PALETTE.amber}08`,
            padding: '12px 26px',
            fontFamily: MONO,
            fontSize: 17,
            fontWeight: 900,
            color: PALETTE.amber,
            zIndex: 3,
            transition: 'none',
          }}
        >
          you are here
        </div>

        {/* the line */}
        <div style={{ position: 'absolute', left: 80, right: 80, top: 360, height: 3, background: `${PALETTE.bad}AA`, boxShadow: `0 0 22px ${PALETTE.bad}55`, zIndex: 2, opacity: lineIn }}>
          <span style={{ position: 'absolute', left: 0, right: 0, top: -26, textAlign: 'center', fontFamily: MONO, letterSpacing: 4, fontSize: 15, fontWeight: 900, color: PALETTE.bad }}>
            —— THE LINE — the API answers here ——
          </span>
        </div>

        {/* above: answerable through the API */}
        <div style={{ position: 'absolute', left: 140, top: 84, width: 1400, borderRadius: 20, border: `2px solid ${PALETTE.good}55`, background: `${PALETTE.good}04`, padding: '22px 26px', opacity: aboveIn }}>
          <Label color={PALETTE.good} size={13} style={{ marginBottom: 14 }}>if the API responds — ask it</Label>
          <div style={{ display: 'flex', gap: 12 }}>
            {ABOVE.map((a) => (
              <div key={a} style={{ flex: 1, fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.good}55`, borderRadius: 10, background: '#0d1522', padding: '14px 16px', textAlign: 'center' }}>
                {a}
              </div>
            ))}
          </div>
        </div>

        {/* below: host-level evidence */}
        <div style={{ position: 'absolute', left: 140, top: 470, width: 1400, borderRadius: 20, border: `2px solid ${PALETTE.cyan}55`, background: `${PALETTE.cyan}03`, padding: '22px 26px', opacity: belowIn }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <Label color={PALETTE.cyan} size={13}>if it does not — move below Kubernetes</Label>
            <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 900, color: PALETTE.muted, border: `1px solid ${PALETTE.line}`, borderRadius: 999, padding: '4px 10px', filter: 'grayscale(1)' }}>
              kubectl — greyed out, it cannot diagnose the server that makes it work
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {BELOW.map((b) => (
              <div key={b} style={{ flex: '1 1 220px', fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.cyan}55`, borderRadius: 10, background: '#0d1522', padding: '13px 15px', textAlign: 'center' }}>
                {b}
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>which side of the line you diagnose from changes everything — and only the line tells you</Label>
        </div>
      </div>
    </div>
  );
};
