import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 12 beat 9 — who deleted this, and when. The question tested against
 * each evidence source: events expired or never recorded; logs not
 * necessarily present; metrics aggregated away; audit has identity, verb,
 * resource and timestamp. Then the honest failure case — audit disabled,
 * information genuinely gone, nothing to recover.
 */

const ROWS = [
  {
    source: 'events',
    answer: 'expired — or never recorded at all',
    ok: false,
    color: PALETTE.blue,
  },
  {
    source: 'logs',
    answer: 'not necessarily present — and not necessarily shipped',
    ok: false,
    color: PALETTE.cyan,
  },
  {
    source: 'metrics',
    answer: 'aggregated away — the who and the when are gone',
    ok: false,
    color: PALETTE.amber,
  },
  {
    source: 'audit',
    answer: 'identity · verb · resource · timestamp — all present',
    ok: true,
    color: PALETTE.good,
  },
];

export const AuditAnswers: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const questionIn = appear(t, 0.06, 0.12);
  const rowOn = ROWS.map((_, i) => appear(t, 0.14 + i * 0.1, 0.22 + i * 0.1));
  const failIn = seg(t, 0.62, 0.76);
  const footer = appear(t, 0.86, 0.94);

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
      <div style={{ width: 1620, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>one question, four evidence sources — only one can answer it</Label>
        </div>

        {/* the question */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 48, textAlign: 'center', opacity: questionIn }}>
          <span
            style={{
              fontFamily: MONO,
              color: PALETTE.ink,
              fontSize: 25,
              fontWeight: 900,
              border: `2px solid ${PALETTE.cyan}`,
              borderRadius: 14,
              background: `${PALETTE.cyan}0c`,
              padding: '12px 26px',
            }}
          >
            who deleted this Service — and when?
          </span>
        </div>

        {/* the four answers */}
        <div style={{ position: 'absolute', left: 200, top: 150, width: 1220, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ROWS.map((r, i) => {
            const on = rowOn[i];
            return (
              <div
                key={r.source}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 22,
                  borderRadius: 14,
                  border: `2px solid ${on > 0.5 ? (r.ok ? PALETTE.good : r.color) : PALETTE.line}`,
                  background: on > 0.5 ? (r.ok ? `${PALETTE.good}0d` : '#0c111c') : PALETTE.panel,
                  padding: '14px 20px',
                  opacity: Math.max(0.3, on),
                  boxShadow: r.ok && on > 0.5 ? `0 0 22px ${PALETTE.good}33` : 'none',
                }}
              >
                <span style={{ width: 110, fontFamily: MONO, color: r.color, fontSize: 20, fontWeight: 900 }}>{r.source}</span>
                <span
                  style={{
                    flex: 1,
                    fontFamily: MONO,
                    fontSize: 17,
                    fontWeight: r.ok ? 900 : 700,
                    color: r.ok ? PALETTE.good : PALETTE.muted,
                    lineHeight: 1.4,
                  }}
                >
                  {r.ok ? '✓ ' : '✕ '}{r.answer}
                </span>
              </div>
            );
          })}
        </div>

        {/* the honest failure case */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 500,
            width: 1220,
            borderRadius: 16,
            border: `2px solid ${PALETTE.bad}66`,
            background: `${PALETTE.bad}0a`,
            padding: '16px 22px',
            textAlign: 'center',
            opacity: failIn,
          }}
        >
          <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 8 }}>the honest failure case</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>
            audit disabled → the information is <span style={{ color: PALETTE.bad }}>genuinely gone</span> — nothing to recover, no matter how long you look
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>audit is the only source that answers who-and-when — and only if it was on before the incident</Label>
        </div>
      </div>
    </div>
  );
};
