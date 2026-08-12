import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 20 beat 2 — descend, outside in, and preserve evidence first. Each
 * step is one boundary with what it rules out. A prominent 'preserve evidence
 * before restart' marker ends it; the alternative — restarting first — erases
 * the logs and state that held the answer.
 */

const STEPS = [
  { n: '1', what: 'the API load balancer (if present)', rules: 'rules out LB routing', color: PALETTE.blue },
  { n: '2', what: 'which boundary is actually failing', rules: 'narrows where failure lives', color: PALETTE.cyan },
  { n: '3', what: 'static Pod manifests on the node', rules: 'rules out a broken apiserver manifest', color: PALETTE.violet },
  { n: '4', what: 'the kubelet and the runtime', rules: 'rules out node-agent problems', color: PALETTE.amber },
  { n: '5', what: 'certificates', rules: 'rules out identity / expiry', color: PALETTE.good },
];

export const ControlPlaneOrder: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const stepOn = STEPS.map((_, i) => appear(t, 0.1 + i * 0.06, 0.17 + i * 0.06));
  const preserve = appear(t, 0.5, 0.62);
  const erase = seg(t, 0.64, 0.78);
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
      <div style={{ width: 1700, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>for one unhealthy control-plane node, work from outside in</Label>
        </div>

        {/* the outside-in steps */}
        <div style={{ position: 'absolute', left: 140, top: 68, width: 900, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map((s, i) => {
            const on = stepOn[i];
            return (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 16, borderRadius: 13, border: `2px solid ${on > 0.5 ? s.color : PALETTE.line}55`, background: on > 0.5 ? `${s.color}08` : '#101826', padding: '12px 16px', opacity: Math.max(0.3, on) }}>
                <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 17, fontWeight: 900, color: s.color, border: `1px solid ${s.color}`, borderRadius: 999, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.n}
                </span>
                <span style={{ flex: '0 0 320px', fontFamily: MONO, color: PALETTE.ink, fontSize: 15.5, fontWeight: 900 }}>{s.what}</span>
                <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700 }}>rules out {s.rules}</span>
              </div>
            );
          })}
        </div>

        {/* preserve evidence vs restart first */}
        <div style={{ position: 'absolute', right: 60, top: 120, width: 520 }}>
          <div style={{ borderRadius: 18, border: `3px solid ${PALETTE.good}`, background: `${PALETTE.good}08`, padding: '18px 22px', textAlign: 'center', opacity: preserve }}>
            <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: PALETTE.good }}>preserve evidence before restart</div>
            <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 8, lineHeight: 1.4 }}>
              a restart destroys the state that would have told you why
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 16,
              border: `2px dashed ${PALETTE.bad}55`,
              background: '#0d1522',
              padding: '16px 20px',
              textAlign: 'center',
              opacity: erase,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.bad, textDecoration: 'line-through', textDecorationColor: PALETTE.bad, textDecorationThickness: 2 }}>
              restarting first
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 8, lineHeight: 1.4 }}>
              erases the logs and the state that held the answer
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>gather before you restart — the error message is worth more than a clean process</Label>
        </div>
      </div>
    </div>
  );
};
