import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 11 beat 4 — the fourth member. Three, four and five members in a
 * row, each with its majority and its tolerance. Three and four are visibly
 * identical in tolerance despite the extra member — that equality is the
 * image — and the fourth member's cost is marked: more replication, more
 * coordination, no benefit.
 */

export const FourthMember: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const colOn = [0, 1, 2].map((_, i) => appear(t, 0.08 + i * 0.1, 0.18 + i * 0.1));
  const equality = seg(t, 0.42, 0.54);
  const cost = seg(t, 0.56, 0.7);
  const footer = appear(t, 0.84, 0.92);

  const cluster = (n: number) => {
    const majority = Math.floor(n / 2) + 1;
    const tolerance = n - majority;
    return { majority, tolerance };
  };

  const c3 = cluster(3);
  const c4 = cluster(4);
  const c5 = cluster(5);

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
          <Label color={PALETTE.cyan} size={13}>the fourth member buys you nothing — three and four tolerate the same loss</Label>
        </div>

        {[
          { n: 3, title: 'three members', data: c3, at: 60 },
          { n: 4, title: 'four members', data: c4, at: 590 },
          { n: 5, title: 'five members', data: c5, at: 1120 },
        ].map((col, ci) => {
          const on = colOn[ci];
          return (
            <div
              key={col.n}
              style={{
                position: 'absolute',
                left: col.at,
                top: 88,
                width: 440,
                borderRadius: 18,
                border: `2px solid ${ci === 1 && equality > 0.5 ? PALETTE.amber : PALETTE.violet}66`,
                background: ci === 1 && equality > 0.5 ? `${PALETTE.amber}06` : `${PALETTE.violet}04`,
                padding: '16px 20px',
                opacity: Math.max(0.3, on),
              }}
            >
              <Label color={ci === 1 && equality > 0.5 ? PALETTE.amber : PALETTE.violet} size={13} style={{ marginBottom: 14 }}>
                {col.title}
              </Label>

              {/* members */}
              <div style={{ display: 'flex', gap: 8 }}>
                {Array.from({ length: col.n }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      fontFamily: MONO,
                      fontSize: 12.5,
                      fontWeight: 900,
                      color: PALETTE.ink,
                      border: `2px solid ${PALETTE.violet}`,
                      borderRadius: 10,
                      background: `${PALETTE.violet}0c`,
                      padding: '10px 4px',
                      textAlign: 'center',
                    }}
                  >
                    m{i + 1}
                  </div>
                ))}
              </div>

              {/* majority */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 14 }}>
                <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800 }}>majority</span>
                <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 26, fontWeight: 900 }}>{col.data.majority}</span>
              </div>
              {/* tolerance — the image: 3 and 4 identical */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginTop: 6,
                  borderTop: `1px solid ${PALETTE.line}55`,
                  paddingTop: 6,
                }}
              >
                <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800 }}>tolerates</span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 26,
                    fontWeight: 900,
                    color: ci === 0 || ci === 1 ? PALETTE.amber : PALETTE.good,
                    border: ci === 0 || ci === 1 ? `2px solid ${PALETTE.amber}88` : '2px solid transparent',
                    borderRadius: 10,
                    padding: '4px 14px',
                    background: ci === 0 || ci === 1 ? `${PALETTE.amber}10` : 'transparent',
                  }}
                >
                  {col.data.tolerance}
                </span>
              </div>

              {ci === 1 && (
                <div
                  style={{
                    fontFamily: MONO,
                    color: PALETTE.amber,
                    fontSize: 15,
                    fontWeight: 900,
                    textAlign: 'center',
                    marginTop: 16,
                    opacity: equality,
                  }}
                >
                  ⚠ same tolerance as three — the equality is the image
                </div>
              )}
            </div>
          );
        })}

        {/* the fourth member's cost */}
        <div
          style={{
            position: 'absolute',
            left: 590,
            top: 500,
            width: 440,
            borderRadius: 16,
            border: `2px solid ${PALETTE.bad}77`,
            background: `${PALETTE.bad}06`,
            padding: '16px 20px',
            textAlign: 'center',
            opacity: cost,
          }}
        >
          <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 8 }}>the fourth member's cost</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16.5, fontWeight: 900, lineHeight: 1.5 }}>
            more replication · more coordination · <span style={{ color: PALETTE.bad }}>no benefit</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 636, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>clusters are sized by failure tolerance, not by vanity — three and four are the same cluster with extra write traffic</Label>
        </div>
      </div>
    </div>
  );
};
