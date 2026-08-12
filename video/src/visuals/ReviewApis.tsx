import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 18 beat 7 — ask, without becoming them. Three review APIs with the
 * exact question each answers, as distinct queries to distinct subsystems —
 * authorizer versus authenticator. Beside them, impersonation with its
 * required verb and an audit record showing both identities. Identity and
 * authorization are never merged into one box.
 */

const REVIEWS = [
  { name: 'SubjectAccessReview', subsystem: 'authorizer', question: 'can this named subject do X?', color: PALETTE.blue },
  { name: 'SelfSubjectAccessReview', subsystem: 'authorizer', question: 'can I (the caller) do X?', color: PALETTE.cyan },
  { name: 'TokenReview', subsystem: 'authenticator', question: 'who is this token / is it valid?', color: PALETTE.violet },
];

export const ReviewApis: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const reviewOn = REVIEWS.map((_, i) => appear(t, 0.08 + i * 0.07, 0.15 + i * 0.07));
  const impersonIn = appear(t, 0.4, 0.52);
  const auditIn = appear(t, 0.52, 0.62);
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
          <Label color={PALETTE.cyan} size={13}>ask, without borrowing their credentials — each review API asks a different subsystem</Label>
        </div>

        {/* the review APIs */}
        <div style={{ position: 'absolute', left: 100, top: 64, width: 900, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {REVIEWS.map((r, i) => {
            const on = reviewOn[i];
            return (
              <div
                key={r.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  borderRadius: 14,
                  border: `2px solid ${on > 0.5 ? r.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${r.color}08` : '#101826',
                  padding: '13px 18px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <div style={{ width: 360, flex: '0 0 360px' }}>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16.5, fontWeight: 900 }}>{r.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: r.color, marginTop: 3 }}>asks the {r.subsystem}</div>
                </div>
                <div style={{ flex: 1, fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 800, lineHeight: 1.35 }}>{r.question}</div>
              </div>
            );
          })}
        </div>

        {/* impersonation */}
        <div style={{ position: 'absolute', left: 1040, top: 90, width: 560, borderRadius: 18, border: `2px solid ${PALETTE.amber}`, background: `${PALETTE.amber}06`, padding: '18px 22px', opacity: impersonIn }}>
          <Label color={PALETTE.amber} size={12} style={{ marginBottom: 10 }}>impersonation — acting as another identity</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, border: `1px solid ${PALETTE.amber}55`, borderRadius: 10, background: '#0d1522', padding: '11px 14px', marginBottom: 10 }}>
            requires the <span style={{ color: PALETTE.amber }}>impersonate</span> verb
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700 }}>a different question entirely</div>
          <div
            style={{
              marginTop: 12,
              borderRadius: 10,
              border: `1px solid ${PALETTE.line}`,
              background: '#0d1522',
              padding: '11px 14px',
              opacity: auditIn,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 800, color: PALETTE.muted }}>the audit record holds both identities</div>
            <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 900, color: PALETTE.ink, marginTop: 5 }}>impersonated: p&#8203;latform<sub style={{ color: PALETTE.muted }}> (who you acted as)</sub></div>
            <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 900, color: PALETTE.ink, marginTop: 4 }}>user: alice<sub style={{ color: PALETTE.muted }}> (who you actually were)</sub></div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: auditIn }}>
          <Label color={PALETTE.amber} size={13}>identity evidence is not authorization — a TokenReview and an access review answer different questions</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>do not merge identity and authorization into one box — authenticator and authorizer are distinct</Label>
        </div>
      </div>
    </div>
  );
};
