import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 09 beat 2 — what expansion costs. One external name enters, then the
 * expanded queries fire in sequence, each returning NXDOMAIN, before the
 * correct absolute query succeeds. A round-trip counter and accumulating
 * latency sit on screen; then the same pattern is multiplied across many
 * requests so the waste reads as a rate, not a one-off.
 */

const TRIES = [
  'api.example.com.default.svc.cluster.local.',
  'api.example.com.svc.cluster.local.',
  'api.example.com.cluster.local.',
  'api.example.com.  ← absolute',
];

const RTT_MS = 20;
const TOTAL_WASTED = RTT_MS * 3;

export const NdotsAmplification: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const nameIn = appear(t, 0.06, 0.13);
  const tryIn = TRIES.map((_, i) => seg(t, 0.1 + i * 0.09, 0.18 + i * 0.09));
  const counter = seg(t, 0.18, 0.4);
  const latency = seg(t, 0.3, 0.5);
  const multiply = appear(t, 0.56, 0.66);
  const footer = appear(t, 0.82, 0.9);

  // Accumulating latency as each failed round trip lands.
  const completed = tryIn.filter((v) => v > 0.5).length;
  const successDone = tryIn[3] > 0.6;
  const rts = completed;
  const wastedMs = Math.min(3, Math.max(0, completed - (successDone ? 1 : 0))) * RTT_MS;

  const pulse = 0.55 + 0.45 * Math.sin(frame / 8);

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
      <div style={{ width: 1620, height: 680, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>with ndots:5 an external name is treated as partial — every expanded query is a real round trip that fails</Label>
        </div>

        {/* the incoming name */}
        <div style={{ position: 'absolute', left: 60, top: 150, width: 320, textAlign: 'center', opacity: nameIn }}>
          <div
            style={{
              fontFamily: MONO,
              color: PALETTE.ink,
              fontSize: 26,
              fontWeight: 900,
              border: `2px solid ${PALETTE.cyan}`,
              borderRadius: 14,
              background: `${PALETTE.cyan}0c`,
              padding: '16px 20px',
              boxShadow: `0 0 22px ${PALETTE.cyan}33`,
            }}
          >
            api.example.com
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>
            {'2 dots < 5 → searches first'}
          </div>
        </div>

        {/* the expanding queries */}
        <div style={{ position: 'absolute', left: 420, top: 96, width: 720 }}>
          <Label color={PALETTE.muted} size={11} style={{ marginBottom: 8 }}>search expansion in order — each is a round trip</Label>
          {TRIES.map((q, i) => {
            const on = tryIn[i];
            const failed = i < 3 && on > 0.5;
            const success = i === 3 && on > 0.5;
            return (
              <div key={q} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, opacity: Math.max(0.3, on) }}>
                <div
                  style={{
                    flex: 1,
                    fontFamily: MONO,
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: PALETTE.ink,
                    border: `1px solid ${success ? PALETTE.good : PALETTE.line}`,
                    borderRadius: 10,
                    background: success ? `${PALETTE.good}0d` : '#0c111c',
                    padding: '10px 14px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {q}
                </div>
                <div
                  style={{
                    flex: '0 0 110px',
                    textAlign: 'center',
                    fontFamily: MONO,
                    fontSize: 14,
                    fontWeight: 900,
                    color: success ? PALETTE.good : PALETTE.bad,
                    border: `1px solid ${success ? PALETTE.good : PALETTE.bad}66`,
                    borderRadius: 10,
                    background: success ? `${PALETTE.good}0d` : `${PALETTE.bad}0c`,
                    padding: '10px 8px',
                  }}
                >
                  {success ? '200 OK ✓' : failed ? 'NXDOMAIN' : '…'}
                </div>
              </div>
            );
          })}
        </div>

        {/* round-trip counter + accumulating latency */}
        <div style={{ position: 'absolute', right: 60, top: 96, width: 360 }}>
          <div
            style={{
              border: `1px solid ${PALETTE.line}`,
              borderRadius: 14,
              background: PALETTE.panel,
              padding: '16px 18px',
              opacity: counter > 0 ? 1 : 0.4,
            }}
          >
            <Label color={PALETTE.amber} size={11} style={{ marginBottom: 8 }}>round-trip counter</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 30, fontWeight: 900 }}>
              {rts} <span style={{ fontSize: 16, color: PALETTE.muted }}>so far</span>
            </div>
          </div>
          <div
            style={{
              marginTop: 14,
              border: `1px solid ${PALETTE.bad}55`,
              borderRadius: 14,
              background: `${PALETTE.bad}08`,
              padding: '16px 18px',
              opacity: latency > 0 ? 1 : 0.4,
            }}
          >
            <Label color={PALETTE.bad} size={11} style={{ marginBottom: 8 }}>accumulating latency</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 26, fontWeight: 900 }}>
              +{wastedMs} ms <span style={{ fontSize: 14, color: PALETTE.muted }}>wasted on failures</span>
            </div>
          </div>
        </div>

        {/* multiply — read as a rate */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 470,
            width: 1500,
            borderRadius: 16,
            border: `1px solid ${PALETTE.amber}66`,
            background: `${PALETTE.amber}08`,
            padding: '16px 22px',
            opacity: multiply,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            <Label color={PALETTE.amber} size={11.5} style={{ flex: '0 0 auto' }}>now multiply</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 800, lineHeight: 1.45 }}>
              3 failed round trips × every uncached external lookup = latency and load no one can attribute
            </div>
            <div
              style={{
                fontFamily: MONO,
                color: PALETTE.amber,
                fontSize: 15,
                fontWeight: 900,
                opacity: pulse,
                flex: '0 0 auto',
              }}
            >
              the waste reads as a rate
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 610, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>before the correct absolute query is finally sent, every search-domain attempt is a failed round trip</Label>
        </div>
      </div>
    </div>
  );
};
