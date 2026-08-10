import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 09 beat 3 — one character. The same name twice, stacked. Without the
 * trailing dot: the collapse of failed expansions from the previous beat,
 * small. With it: a single query, straight through. The trailing dot itself
 * is the entire intervention, so it is the most visually unmissable thing on
 * the frame.
 */

const FAILS = [
  'api.example.com.default.svc.cluster.local.',
  'api.example.com.svc.cluster.local.',
  'api.example.com.cluster.local.',
];

export const TrailingDot: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const topIn = appear(t, 0.08, 0.18);
  const failsIn = seg(t, 0.14, 0.4);
  const dotGlow = seg(t, 0.38, 0.58);
  const bottomIn = appear(t, 0.42, 0.52);
  const singleIn = seg(t, 0.5, 0.62);
  const footer = appear(t, 0.8, 0.88);

  const pulse = 0.6 + 0.4 * Math.sin(frame / 7);

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
      <div style={{ width: 1620, height: 690, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>one character changes the entire search behaviour — a trailing dot makes a name fully qualified</Label>
        </div>

        {/* TOP — without the dot */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 96,
            width: 1380,
            border: `1px solid ${PALETTE.bad}55`,
            borderRadius: 18,
            background: `${PALETTE.bad}05`,
            padding: '20px 26px',
            opacity: topIn,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 30, fontWeight: 900 }}>
              api.example.com
            </div>
            <Label color={PALETTE.bad} size={11}>without the dot — not fully qualified</Label>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            {FAILS.map((f, i) => (
              <div
                key={f}
                style={{
                  flex: 1,
                  fontFamily: MONO,
                  fontSize: 12,
                  fontWeight: 700,
                  color: PALETTE.muted,
                  border: `1px solid ${PALETTE.line}`,
                  borderRadius: 8,
                  background: '#0c111c',
                  padding: '8px 10px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  opacity: failsIn > 0.2 + i * 0.16 ? 1 : 0.25,
                }}
              >
                {f} <span style={{ color: PALETTE.bad, fontWeight: 900 }}>NX</span>
              </div>
            ))}
            <div
              style={{
                flex: '0 0 120px',
                alignSelf: 'stretch',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 900,
                color: PALETTE.good,
                border: `1px solid ${PALETTE.good}66`,
                borderRadius: 8,
                background: `${PALETTE.good}0c`,
                opacity: failsIn > 0.8 ? 1 : 0.25,
              }}
            >
              then the absolute query — late
            </div>
          </div>
        </div>

        {/* the giant dot — the entire intervention */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 22,
              opacity: dotGlow > 0 ? 1 : 0.2,
            }}
          >
            <span
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: PALETTE.amber,
                boxShadow: `0 0 60px ${PALETTE.amber}`,
                display: 'inline-block',
                opacity: 0.6 + 0.4 * pulse,
              }}
            />
            <span style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 26, fontWeight: 900 }}>
              one character — the trailing dot
            </span>
          </div>
        </div>

        {/* BOTTOM — with the dot */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 440,
            width: 1380,
            border: `2px solid ${PALETTE.good}`,
            borderRadius: 18,
            background: `${PALETTE.good}0a`,
            padding: '20px 26px',
            boxShadow: `0 0 30px ${PALETTE.good}33`,
            opacity: bottomIn,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 30, fontWeight: 900 }}>
              api.example.com<span style={{ color: PALETTE.amber, fontSize: 44 }}>.</span>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, lineHeight: 1.4, flex: 1 }}>
              fully qualified — the search list ends
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 18,
                  fontWeight: 900,
                  color: PALETTE.good,
                  opacity: singleIn,
                  display: 'inline-block',
                  border: `1px solid ${PALETTE.good}`,
                  borderRadius: 999,
                  background: `${PALETTE.good}10`,
                  padding: '10px 20px',
                }}
              >
                one query — straight through ✓
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>no expansion, no failed round trips — the cheapest possible answer to search amplification</Label>
        </div>
      </div>
    </div>
  );
};
