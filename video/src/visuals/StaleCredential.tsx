import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 14 beat 4 — still using the old credential. Four candidate causes fan
 * out from one symptom, each with its distinguishing evidence and its distinct
 * fix. They are different problems with different fixes — not the same fix.
 */

const CAUSES = [
  {
    name: 'environment delivery',
    evidence: 'value set as an env var; fixed at process start',
    fix: 'restart the Pod',
    color: PALETTE.blue,
  },
  {
    name: 'projection, not yet updated',
    evidence: 'normal volume mount — updates eventually',
    fix: 'wait, or check the mounted file',
    color: PALETTE.violet,
  },
  {
    name: 'application cache',
    evidence: 'the process read the value once and cached it',
    fix: 'reload / re-read path in the app',
    color: PALETTE.cyan,
  },
  {
    name: 'no rollout',
    evidence: 'the Pod template never changed',
    fix: 'touch the template so the Deployment rolls',
    color: PALETTE.amber,
  },
];

export const StaleCredential: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const symptomIn = appear(t, 0.06, 0.14);
  const causeOn = CAUSES.map((_, i) => appear(t, 0.16 + i * 0.08, 0.23 + i * 0.08));
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
      <div style={{ width: 1680, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>still presenting the old credential — four candidates, four different fixes</Label>
        </div>

        {/* the symptom */}
        <div
          style={{
            position: 'absolute',
            left: 640,
            top: 56,
            borderRadius: 14,
            border: `2px solid ${PALETTE.bad}`,
            background: `${PALETTE.bad}0c`,
            padding: '12px 22px',
            textAlign: 'center',
            opacity: symptomIn,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>the Secret changed — the app still uses the old credential</div>
        </div>

        {/* fanning causes */}
        <div style={{ position: 'absolute', left: 140, top: 150, width: 1400, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {CAUSES.map((c, i) => {
            const on = causeOn[i];
            return (
              <div
                key={c.name}
                style={{
                  borderRadius: 16,
                  border: `2px solid ${on > 0.5 ? c.color : PALETTE.line}`,
                  background: on > 0.5 ? `${c.color}0a` : PALETTE.panel,
                  padding: '18px 18px',
                  opacity: Math.max(0.3, on),
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: c.color }}>candidate {i + 1}</span>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, marginTop: 10 }}>{c.name}</div>
                <div style={{ flex: 1 }} />
                <div style={{ marginTop: 12, borderRadius: 10, border: `1px solid ${PALETTE.line}`, background: '#0d1522', padding: '10px 12px' }}>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 800, color: PALETTE.muted }}>evidence</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.ink, marginTop: 4, lineHeight: 1.35 }}>{c.evidence}</div>
                </div>
                <div style={{ marginTop: 10, borderRadius: 10, border: `1px solid ${c.color}55`, background: `${c.color}08`, padding: '10px 12px' }}>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 800, color: c.color }}>its own fix</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.ink, marginTop: 4, lineHeight: 1.35 }}>{c.fix}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>pick the cause from its evidence — and apply that cause's fix, not a generic restart</Label>
        </div>
      </div>
    </div>
  );
};
