import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 07 beat 10 — the API repeats what it was told. A node reports Pod
 * status up to the API on a tick. The link is cut: the tick stops, the API's
 * stored value freezes at Running while the node visibly goes dark. The node
 * lease counts down, the node controller marks the node unreachable, and only
 * then do downstream controllers move. The elapsed time on screen makes the
 * delay read as a duration, not an instant. (The numeric seconds are
 * illustrative — the narration does not carry lease or controller timings.)
 */

const LEASE_SECONDS = 30;
const TOTAL_SECONDS = 45;

const TICKS = [0.15, 0.206, 0.262, 0.318];

const CHAIN = [
  { label: 'node lease', sub: 'stops being renewed', color: PALETTE.amber },
  { label: 'node controller', sub: 'marks the node unreachable', color: PALETTE.bad },
  { label: 'other controllers', sub: 'finally react', color: PALETTE.cyan },
];

export const StaleStatus: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const scene = appear(t, 0.05, 0.12);
  const cut = seg(t, 0.36, 0.4);
  const frozen = appear(t, 0.4, 0.46);
  const nodeDark = seg(t, 0.38, 0.46);

  // Elapsed time starts when the link is cut and runs to TOTAL_SECONDS.
  const elapsed = seg(t, 0.36, 0.9) * TOTAL_SECONDS;
  const leaseProg = seg(t, 0.42, 0.72);
  const leaseLeft = Math.max(0, Math.ceil(LEASE_SECONDS * (1 - leaseProg)));
  const leaseExpired = leaseLeft === 0;
  const unreachable = appear(t, 0.72, 0.76);
  const controllers = appear(t, 0.84, 0.88);

  const stalePulse = 0.6 + 0.4 * Math.sin(frame / 8);
  const cutPulse = 0.5 + 0.5 * Math.sin(frame / 5);

  const mm = String(Math.floor(elapsed)).padStart(2, '0');

  // Event bubbles under the progress bar, at their actual elapsed fractions.
  const bubbles = [
    { label: 'link cut', frac: 0 / TOTAL_SECONDS, color: PALETTE.bad, on: cut > 0.1 },
    { label: 'lease expires', frac: LEASE_SECONDS / TOTAL_SECONDS, color: PALETTE.amber, on: leaseExpired },
    { label: 'unreachable', frac: 31.5 / TOTAL_SECONDS, color: PALETTE.bad, on: unreachable > 0.5 },
    { label: 'controllers react', frac: 41.5 / TOTAL_SECONDS, color: PALETTE.cyan, on: controllers > 0.5 },
  ];

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
      <div style={{ width: 1640, height: 750, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>pod status is reported by the kubelet, asynchronously — if the node stops reporting, the last value simply persists</Label>
        </div>

        {/* API server — its stored value freezes at Running */}
        <div
          style={{
            position: 'absolute',
            left: 720,
            top: 36,
            width: 590,
            height: 116,
            border: `2px solid ${PALETTE.blue}`,
            borderRadius: 16,
            background: `${PALETTE.blue}10`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: scene,
          }}
        >
          <Label color={PALETTE.blueInk} size={12} style={{ marginBottom: 6 }}>API server — stored Pod object</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 800 }}>
            web-7f9c8 · status.phase:
            <span style={{ color: PALETTE.good, fontWeight: 900 }}> Running</span>
          </div>
          {frozen > 0 && (
            <div
              style={{
                marginTop: 8,
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 900,
                color: PALETTE.amber,
                background: `${PALETTE.amber}12`,
                border: `1px solid ${PALETTE.amber}66`,
                borderRadius: 999,
                padding: '5px 14px',
                opacity: frozen * stalePulse,
              }}
            >
              stale — last value persists, nothing new arrives
            </div>
          )}
        </div>

        {/* the link */}
        <div
          style={{
            position: 'absolute',
            left: 1015 - 1.5,
            top: 152,
            width: 3,
            height: 108,
            background: cut > 0 ? PALETTE.bad : PALETTE.violet,
            opacity: cut > 0 ? 0.7 : 0.4 + 0.6 * Math.abs(Math.sin(frame / 12)),
            boxShadow: cut > 0 ? `0 0 12px ${PALETTE.bad}` : `0 0 10px ${PALETTE.violet}`,
            zIndex: 2,
          }}
        />
        {/* status ticks travelling up — they stop at the cut */}
        {cut <= 0 &&
          TICKS.map((t0, i) => {
            const prog = seg(t, t0, t0 + 0.11);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 1015 - 8,
                  top: 260 - prog * 108 - 8,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: PALETTE.violet,
                  opacity: prog > 0 && prog < 1 ? 1 : 0,
                  zIndex: 3,
                }}
              />
            );
          })}
        {/* the link is cut */}
        {cut > 0.15 && (
          <div
            style={{
              position: 'absolute',
              left: 1015 - 20,
              top: 190,
              zIndex: 4,
              opacity: cutPulse,
            }}
          >
            <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 40, fontWeight: 900, textShadow: `0 0 18px ${PALETTE.bad}66` }}>
              ✕
            </span>
          </div>
        )}

        {/* the node — goes dark when the link is cut */}
        <div
          style={{
            position: 'absolute',
            left: 640,
            top: 260,
            width: 750,
            height: 180,
            border: `2px solid ${PALETTE.violet}88`,
            borderRadius: 18,
            background: `${PALETTE.violet}10`,
            opacity: scene * (1 - nodeDark * 0.55),
            filter: nodeDark > 0 ? 'grayscale(0.9)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 30,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 24, fontWeight: 900 }}>kubelet</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 16, fontWeight: 800 }}>web-7f9c8 · still running</div>
            {nodeDark > 0.4 && (
              <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 13, fontWeight: 800, marginTop: 4, opacity: 0.9 }}>
                connectivity lost — stops reporting
              </div>
            )}
          </div>
        </div>

        {/* recovery chain */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 492,
            width: 1520,
            height: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            opacity: scene,
          }}
        >
          {CHAIN.map((c, i) => {
            const on = i === 0 ? (leaseExpired ? 1 : appear(t, 0.44, 0.5)) : i === 1 ? unreachable : controllers;
            return (
              <React.Fragment key={c.label}>
                {i > 0 && (
                  <span style={{ fontFamily: MONO, color: on > 0.5 ? c.color : PALETTE.line, fontSize: 28, fontWeight: 900, opacity: on }}>
                    →
                  </span>
                )}
                <div
                  style={{
                    width: 360,
                    height: 90,
                    borderRadius: 14,
                    border: `2px solid ${on > 0.5 ? c.color : PALETTE.line}`,
                    background: on > 0.5 ? `${c.color}12` : PALETTE.panel,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: Math.max(0.3, on),
                    boxShadow: on > 0.5 ? `0 0 16px ${c.color}33` : 'none',
                  }}
                >
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>{c.label}</div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>{c.sub}</div>
                  {i === 0 && (
                    <div
                      style={{
                        fontFamily: MONO,
                        color: leaseExpired ? PALETTE.good : PALETTE.amber,
                        fontSize: 15,
                        fontWeight: 900,
                        marginTop: 4,
                      }}
                    >
                      {leaseExpired ? '✓ expired' : `⏳ ${leaseLeft}s`}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* elapsed time — the delay reads as a duration */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 622, textAlign: 'center', opacity: frozen > 0.3 ? 1 : 0.15 }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 30, fontWeight: 900 }}>
            elapsed <span style={{ color: PALETTE.amber }}>t+0:{mm}</span>
          </div>
          <div
            style={{
              width: 760,
              height: 12,
              borderRadius: 999,
              background: '#0c111c',
              border: `1px solid ${PALETTE.line}`,
              margin: '12px auto 0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${Math.max(1.5, (elapsed / TOTAL_SECONDS) * 100)}%`,
                background: cut > 0 ? PALETTE.bad : PALETTE.violet,
                opacity: 0.9,
              }}
            />
          </div>
          {/* event bubbles at their actual elapsed times */}
          <div style={{ position: 'relative', width: 760, height: 44, margin: '6px auto 0' }}>
            {bubbles.map((b) => (
              <div
                key={b.label}
                style={{
                  position: 'absolute',
                  left: b.frac * 760 - 70,
                  top: 0,
                  width: 140,
                  textAlign: 'center',
                  opacity: b.on ? 1 : 0.25,
                }}
              >
                <div style={{ fontFamily: MONO, color: b.color, fontSize: 12, fontWeight: 900, lineHeight: 1 }}>
                  {elapsed >= b.frac * TOTAL_SECONDS ? '▲' : '·'}
                </div>
                <div style={{ fontFamily: MONO, color: b.color, fontSize: 12.5, fontWeight: 800, marginTop: 2, whiteSpace: 'nowrap' }}>
                  {b.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 724, textAlign: 'center', opacity: appear(t, 0.85, 0.92) }}>
          <Label color={PALETTE.amber} size={13}>the lease has to expire, the node has to be marked unreachable, and only then do other controllers react</Label>
        </div>
      </div>
    </div>
  );
};
