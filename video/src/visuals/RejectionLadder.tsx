import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const GATES = ['authn', 'authz', 'mutate', 'validate', 'persist'];

const SUSPECTS = [
  { name: 'admission / webhooks', msg: 'denied by webhook' },
  { name: 'schema validation', msg: 'invalid value' },
  { name: 'resource quota', msg: 'quota exceeded' },
  { name: 'immutable fields', msg: 'field is immutable' },
  { name: 'API conversion', msg: 'no conversion' },
  { name: 'storage failures', msg: 'store timeout' },
];

export const RejectionLadder: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const gateLight = appear(t, 0.1, 0.2);
  const suspectIn = (i: number) => appear(t, 0.34 + i * 0.09, 0.4 + i * 0.09);
  const footer = appear(t, 0.92, 0.98);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 22, paddingLeft: 120, paddingRight: 120 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 22 }}>
        a successful authorisation clears exactly one gate
      </Label>

      {/* the five gates with authorisation lit green */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: gateLight }}>
        {GATES.map((g, i) => {
          const isAuthz = g === 'authz';
          return (
            <React.Fragment key={g}>
              {i > 0 && <span style={{ color: PALETTE.muted, fontSize: 20 }}>→</span>}
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 18,
                  fontWeight: 900,
                  color: isAuthz ? PALETTE.good : PALETTE.muted,
                  borderBottom: isAuthz ? `3px solid ${PALETTE.good}` : `3px solid ${PALETTE.line}`,
                  padding: '8px 18px',
                  borderRadius: 8,
                  background: isAuthz ? `${PALETTE.good}16` : 'transparent',
                }}
              >
                {isAuthz ? '✓ authz' : g}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 14, opacity: gateLight }}>
        <Label color={PALETTE.good} size={12}>authorisation is green — and it still fails</Label>
      </div>

      {/* six suspects fan out downstream */}
      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, justifyItems: 'center' }}>
        {SUSPECTS.map((s, i) => {
          const on = suspectIn(i);
          return (
            <Box
              key={s.name}
              pad={14}
              borderColor={on ? PALETTE.bad : PALETTE.line}
              style={{
                width: 360,
                opacity: on,
                transform: `translateY(${(1 - on) * 14}px)`,
                background: on ? `${PALETTE.bad}0e` : PALETTE.panel,
              }}
            >
              <div style={{ fontFamily: MONO, color: on ? PALETTE.ink : PALETTE.muted, fontSize: 18, fontWeight: 900 }}>{s.name}</div>
              <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 15, marginTop: 8, background: '#0c111c', borderRadius: 8, padding: '8px 12px', fontWeight: 700 }}>
                {on ? s.msg : '····'}
              </div>
            </Box>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>they fail with different messages — reading the message is faster than reasoning about the pipeline</Label>
      </div>
    </div>
  );
};
