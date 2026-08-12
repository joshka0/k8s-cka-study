import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 18 beat 5 — policy without a network call. The webhook path from
 * module 02 beside the in-process path. The four hot-path dependencies are
 * present on one and absent on the other. The policy, its binding and an
 * optional parameter resource are three separate objects with distinct jobs.
 */

const WEBHOOK_DEPS = ['Service', 'DNS', 'TLS', 'deadline'];
const CEL_ABSENT = ['no Service', 'no DNS', 'no TLS', 'no deadline'];

export const CelAdmission: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const webhookIn = appear(t, 0.08, 0.16);
  const celIn = appear(t, 0.2, 0.3);
  const threeIn = appear(t, 0.34, 0.46);
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
          <Label color={PALETTE.cyan} size={13}>there is a way to enforce policy without putting a service on the hot path</Label>
        </div>

        {/* the webhook path */}
        <div style={{ position: 'absolute', left: 120, top: 70, width: 700, borderRadius: 20, border: `2px solid ${PALETTE.blue}`, background: `${PALETTE.blue}06`, padding: '20px 22px', opacity: webhookIn }}>
          <Label color={PALETTE.blueInk} size={12} style={{ marginBottom: 12 }}>the webhook path (from module 02)</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap', marginBottom: 12 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.blue}55`, borderRadius: 8, padding: '7px 10px', background: '#0d1522' }}>apiserver</span>
            <span style={{ color: PALETTE.blue, fontWeight: 900 }}>→</span>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.blue}55`, borderRadius: 8, padding: '7px 10px', background: '#0d1522' }}>webhook</span>
            <span style={{ color: PALETTE.blue, fontWeight: 900 }}>→</span>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.blue}55`, borderRadius: 8, padding: '7px 10px', background: '#0d1522' }}>your policy</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {WEBHOOK_DEPS.map((d) => (
              <div key={d} style={{ display: 'flex', gap: 8, fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.bad, border: `1px solid ${PALETTE.bad}44`, borderRadius: 8, padding: '7px 10px', background: '#0d1522' }}>
                <span style={{ color: PALETTE.bad, fontWeight: 900 }}>●</span> needs: {d} — on the hot path
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 850, top: 240, color: PALETTE.line, fontSize: 40, fontWeight: 900, opacity: celIn }}>→</div>

        {/* the CEL in-process path */}
        <div style={{ position: 'absolute', left: 920, top: 70, width: 660, borderRadius: 20, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}06`, padding: '20px 22px', opacity: celIn }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 12 }}>the in-process path — CEL, evaluated in kube-apiserver</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {CEL_ABSENT.map((d) => (
              <div key={d} style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.good, border: `1px solid ${PALETTE.good}55`, borderRadius: 8, padding: '7px 10px', background: '#0d1522' }}>
                {d} ✓
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 14.5, fontWeight: 900 }}>
            evaluated in process — no network hop at all
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6, lineHeight: 1.4 }}>
            nothing leaves the API server on the admission path
          </div>
        </div>

        {/* three objects */}
        <div style={{ position: 'absolute', left: 120, top: 500, width: 1460, borderRadius: 18, border: `2px solid ${PALETTE.amber}55`, background: `${PALETTE.amber}06`, padding: '16px 24px', opacity: threeIn }}>
          <Label color={PALETTE.amber} size={12} style={{ marginBottom: 12 }}>three separate objects — distinct jobs</Label>
          <div style={{ display: 'flex', gap: 14 }}>
            {[
              ['ValidatingAdmissionPolicy', 'holds the CEL logic evaluated in process'],
              ['a binding', 'scopes it and picks the enforcement actions'],
              ['optional parameter resource', 'supplies data to the expression'],
            ].map(([t, n]) => (
              <div key={t} style={{ flex: 1, fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.amber}55`, borderRadius: 10, background: '#0d1522', padding: '12px 14px', lineHeight: 1.4 }}>
                {t}
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginTop: 6 }}>{n}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>no webhook, no Service, no DNS, no TLS, no deadline — the policy lives in the request path itself</Label>
        </div>
      </div>
    </div>
  );
};
