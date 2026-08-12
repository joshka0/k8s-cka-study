import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 14 beat 3 — what a Secret gives you. The stored value is base64 and
 * trivially decoded — base64 is a representation, not encryption. Around it,
 * the protections that are genuinely separate. CORRECTION applied: RBAC is
 * already in the request path, so it is drawn as present (not an optional
 * switch) with overly broad grants as the real risk. Only encryption at rest
 * and external secret lifecycle are optional switches, defaulting off.
 */

const PROTECTIONS = [
  {
    name: 'RBAC on the resource',
    kind: 'present',
    note: 'already in the request path — API authorization applies to Secrets like anything else',
    risk: 'the real risk: overly broad grants to read the Secret',
    color: PALETTE.cyan,
    switch: false,
  },
  {
    name: 'encryption at rest',
    kind: 'optional',
    note: 'configure api-server encryption — without it the value is stored in plaintext (base64 only)',
    risk: '',
    color: PALETTE.amber,
    switch: true,
  },
  {
    name: 'external secret lifecycle',
    kind: 'optional',
    note: 'an external system can manage the value — only if you set that integration up',
    risk: '',
    color: PALETTE.violet,
    switch: true,
  },
];

export const SecretIsNotEncryption: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const secretIn = appear(t, 0.06, 0.14);
  const decodeIn = appear(t, 0.14, 0.24);
  const protOn = PROTECTIONS.map((_, i) => appear(t, 0.28 + i * 0.08, 0.36 + i * 0.08));
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
          <Label color={PALETTE.cyan} size={13}>base64 is a representation, not encryption — the name Secret protects nothing by itself</Label>
        </div>

        {/* secret + decode */}
        <div style={{ position: 'absolute', left: 150, top: 70, display: 'flex', alignItems: 'center', gap: 24, opacity: secretIn }}>
          <div style={{ width: 500, borderRadius: 18, border: `2px solid ${PALETTE.blue}`, background: `${PALETTE.blue}0c`, padding: '20px 24px' }}>
            <Label color={PALETTE.blueInk} size={12} style={{ marginBottom: 10 }}>kind: Secret · the stored value</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, wordBreak: 'break-all' }}>
              cGFzc3dvcmQ=
            </div>
          </div>
          <span style={{ color: PALETTE.line, fontSize: 30, fontWeight: 900, opacity: decodeIn }}>→</span>
          <div style={{ width: 460, borderRadius: 18, border: `2px solid ${PALETTE.amber}`, background: `${PALETTE.amber}06`, padding: '20px 24px', opacity: decodeIn }}>
            <Label color={PALETTE.amber} size={12} style={{ marginBottom: 10 }}>base64-decoded — trivially</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>
              password<span style={{ color: PALETTE.muted, fontWeight: 700 }}> (example)</span>
            </div>
          </div>
        </div>

        {/* the protections */}
        <div style={{ position: 'absolute', left: 70, top: 250, width: 1560, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PROTECTIONS.map((p, i) => {
            const on = protOn[i];
            return (
              <div
                key={p.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 22,
                  borderRadius: 14,
                  border: `2px solid ${on > 0.5 ? p.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${p.color}08` : '#101826',
                  padding: '16px 20px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <div style={{ width: 250, flex: '0 0 250px' }}>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>{p.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 800, color: p.kind === 'present' ? PALETTE.good : PALETTE.amber, marginTop: 4 }}>
                    {p.kind === 'present' ? 'already in the request path' : 'optional · default off'}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, lineHeight: 1.4 }}>{p.note}</div>
                  {p.risk && (
                    <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 13, fontWeight: 800, marginTop: 6 }}>{p.risk}</div>
                  )}
                </div>
                {p.switch ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 130px', justifyContent: 'flex-end' }}>
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.amber }}>switch ↦ OFF</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 130px', justifyContent: 'flex-end' }}>
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.good }}>✓ in the path</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>only encryption at rest and external lifecycle are choices you make — and both default to off</Label>
        </div>
      </div>
    </div>
  );
};
