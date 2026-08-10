import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 12 beat 7 — the evidence hierarchy. Six sources, each with what it
 * is good for and its specific blind spot. Object state is marked distinctly
 * as authoritative for current intent; everything else explains how it got
 * there. All six legible at once.
 */

const SOURCES = [
  {
    name: 'events',
    good: 'what recently happened, near an object',
    blind: 'lossy · expire',
    color: PALETTE.blue,
  },
  {
    name: 'logs',
    good: 'what a component actually said',
    blind: 'local unless shipped',
    color: PALETTE.cyan,
  },
  {
    name: 'metrics',
    good: 'how much · how fast · how often',
    blind: 'aggregated — the individual event is gone',
    color: PALETTE.amber,
  },
  {
    name: 'audit',
    good: 'who did what, and when',
    blind: 'only when enabled · no audit, no who',
    color: PALETTE.violet,
  },
  {
    name: 'traces',
    good: "one request's exact path",
    blind: 'one path only — the rest is dark',
    color: PALETTE.cyan,
  },
  {
    name: 'object state',
    good: 'authoritative for current intent',
    blind: 'not how it got here — only what is true now',
    color: PALETTE.good,
    authoritative: true,
  },
];

export const EvidenceHierarchy: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const cardOn = SOURCES.map((_, i) => appear(t, 0.08 + i * 0.07, 0.16 + i * 0.07));
  const footer = appear(t, 0.88, 0.94);

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
          <Label color={PALETTE.cyan} size={13}>every evidence source is good at something and blind to something — none is ground truth except one</Label>
        </div>

        <div style={{ position: 'absolute', left: 60, top: 64, width: 1500, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {SOURCES.map((s, i) => {
            const on = cardOn[i];
            return (
              <div
                key={s.name}
                style={{
                  borderRadius: 16,
                  border: `2px solid ${on > 0.5 ? (s.authoritative ? PALETTE.good : s.color) : PALETTE.line}`,
                  background: on > 0.5 ? (s.authoritative ? `${PALETTE.good}0d` : `${s.color}08`) : PALETTE.panel,
                  padding: '16px 18px',
                  opacity: Math.max(0.3, on),
                  boxShadow: s.authoritative && on > 0.5 ? `0 0 26px ${PALETTE.good}33` : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 190,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>
                    {s.name}
                  </span>
                  {s.authoritative && (
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10.5,
                        fontWeight: 900,
                        color: PALETTE.good,
                        border: `1px solid ${PALETTE.good}`,
                        borderRadius: 999,
                        padding: '3px 10px',
                        background: `${PALETTE.good}0c`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      authoritative for intent
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, marginTop: 12, lineHeight: 1.45 }}>
                  good for: <span style={{ fontWeight: 700, color: PALETTE.muted }}>{s.good}</span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.bad, marginTop: 'auto', paddingTop: 10, lineHeight: 1.4 }}>
                  blind spot: <span style={{ fontWeight: 700 }}>{s.blind}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>everything else explains how it got there — object state is what is true right now, and what the system acts on</Label>
        </div>
      </div>
    </div>
  );
};
