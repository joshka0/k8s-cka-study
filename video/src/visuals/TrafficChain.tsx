import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 07 beat 8 — Running, receiving nothing. A four-link chain, each
 * link a question with a real check beside it. One link breaks and traffic
 * stops there; the Pod's phase sits above the chain reading Running
 * throughout, unchanged, to make the point that it is not part of the chain.
 * Each link owns its own question and its own check — no shared positional
 * labels.
 */

const X0 = 50;
const SERVICE_W = 200;
const LINK_W = 280;
const APP_W = 140;
const GAP = 16;
const CHAIN_Y = 140;
const CHAIN_H = 210;

const LINKS = [
  {
    q: 'Is the container ready?',
    check: 'Ready condition = True',
  },
  {
    q: 'Is the Pod in the EndpointSlice?',
    check: 'pod IP ∈ addresses',
  },
  {
    q: 'Does the selector match the labels?',
    check: 'selector == labels',
  },
  {
    q: 'Does targetPort match the container port?',
    check: 'targetPort == containerPort',
  },
];

const SERVICE_X = X0;
const LINK_X = (i: number) => X0 + SERVICE_W + GAP + i * (LINK_W + GAP);
const APP_X = X0 + SERVICE_W + GAP + 4 * (LINK_W + GAP);
const BROKEN = 1; // link 2 (0-based) — EndpointSlice membership

export const TrafficChain: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const phase = appear(t, 0.04, 0.1);
  const chainIn = appear(t, 0.08, 0.18);
  const tokenTo1 = seg(t, 0.22, 0.3);
  const link1Ok = appear(t, 0.3, 0.34);
  const tokenTo2 = seg(t, 0.32, 0.42);
  const link2Fail = appear(t, 0.42, 0.48);
  const stopTag = appear(t, 0.46, 0.52);
  const bracket = appear(t, 0.5, 0.56);
  const footer = appear(t, 0.8, 0.88);

  // Token x: leaves the Service, passes link 1 (checked), arrives at link 2
  // and stops — traffic stops at the first failure.
  const tokenEnd = LINK_X(BROKEN) + LINK_W / 2;
  const tokenX =
    t < 0.3
      ? SERVICE_X + SERVICE_W + (LINK_X(0) - SERVICE_X - SERVICE_W) * tokenTo1
      : LINK_X(0) + (tokenEnd - LINK_X(0)) * tokenTo2;
  const tokenY = CHAIN_Y + CHAIN_H / 2;

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
      <div style={{ width: 1640, height: 560, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>when a Pod is Running and receives nothing, phase is exactly what misled you — follow the chain instead</Label>
        </div>

        {/* the phase — above the chain, unchanged the whole beat */}
        <div
          style={{
            position: 'absolute',
            left: 690,
            top: 40,
            width: 280,
            height: 64,
            border: `2px solid ${PALETTE.good}88`,
            borderRadius: 14,
            background: `${PALETTE.good}0d`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: phase,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: PALETTE.good, display: 'inline-block' }} />
            <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 20, fontWeight: 900 }}>phase: Running</span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>
            not part of the chain — never changes
          </div>
        </div>

        {/* the chain */}
        <div style={{ opacity: chainIn }}>
          {/* Service — where traffic comes from */}
          <div
            style={{
              position: 'absolute',
              left: SERVICE_X,
              top: CHAIN_Y,
              width: SERVICE_W,
              height: CHAIN_H,
              border: `2px solid ${PALETTE.blue}`,
              borderRadius: 16,
              background: `${PALETTE.blue}10`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>Service</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 4 }}>my-svc</div>
            <Label color={PALETTE.blueInk} size={11} style={{ marginTop: 14 }}>traffic enters</Label>
          </div>

          {/* the four links */}
          {LINKS.map((link, i) => {
            const checked = link1Ok > 0.5 && i === 0;
            const failed = link2Fail > 0.5 && i === BROKEN;
            // Links before the break are lit once the token has passed them;
            // the broken link lights as it fails; the rest stay dim — the
            // chain is only followed up to the first failure.
            const reached =
              i < BROKEN ? (link1Ok > 0.5 ? 1 : 0.5)
              : i === BROKEN ? (link2Fail > 0.5 ? 1 : 0.65)
              : 0.45;
            return (
              <div
                key={link.q}
                style={{
                  position: 'absolute',
                  left: LINK_X(i),
                  top: CHAIN_Y,
                  width: LINK_W,
                  height: CHAIN_H,
                  border: `2px solid ${failed ? PALETTE.bad : checked ? PALETTE.good : PALETTE.line}`,
                  borderRadius: 16,
                  background: failed ? `${PALETTE.bad}14` : checked ? `${PALETTE.good}0d` : PALETTE.panel,
                  boxShadow: failed ? `0 0 22px ${PALETTE.bad}44` : 'none',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: reached ? 1 : 0.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, lineHeight: 1.25, flex: 1 }}>
                    {link.q}
                  </div>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 18,
                      fontWeight: 900,
                      color: failed ? PALETTE.bad : checked ? PALETTE.good : PALETTE.line,
                      flex: '0 0 auto',
                    }}
                  >
                    {failed ? '✕' : checked ? '✓' : '?'}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 'auto',
                    fontFamily: MONO,
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: failed ? PALETTE.bad : checked ? PALETTE.good : PALETTE.muted,
                    background: '#0c111c',
                    borderRadius: 8,
                    padding: '8px 10px',
                    lineHeight: 1.3,
                  }}
                >
                  {failed ? '✕ not a member — check fails' : `check: ${link.check}`}
                </div>
              </div>
            );
          })}

          {/* the app at the end — never reached */}
          <div
            style={{
              position: 'absolute',
              left: APP_X,
              top: CHAIN_Y,
              width: APP_W,
              height: CHAIN_H,
              border: `2px solid ${PALETTE.line}`,
              borderRadius: 16,
              background: PALETTE.panel,
              filter: 'grayscale(1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
            }}
          >
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 20, fontWeight: 900 }}>app</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 4 }}>never reached</div>
          </div>
        </div>

        {/* traffic token — stops at the broken link */}
        <div
          style={{
            position: 'absolute',
            left: tokenX - 55,
            top: tokenY - 20,
            width: 110,
            height: 40,
            borderRadius: 10,
            background: PALETTE.cyan,
            color: '#051022',
            fontFamily: MONO,
            fontSize: 15,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 18px ${PALETTE.cyan}55`,
            zIndex: 4,
          }}
        >
          traffic
        </div>

        {/* stop tag above the broken link, pointing down into it */}
        {stopTag > 0 && (
          <div
            style={{
              position: 'absolute',
              left: LINK_X(BROKEN) + 24,
              top: CHAIN_Y - 34,
              opacity: stopTag,
              fontFamily: MONO,
              color: PALETTE.bad,
              fontSize: 16,
              fontWeight: 900,
              background: `${PALETTE.bad}10`,
              border: `1px solid ${PALETTE.bad}66`,
              borderRadius: 10,
              padding: '7px 14px',
              whiteSpace: 'nowrap',
            }}
          >
            traffic stops here ↓
          </div>
        )}

        {/* first-failure bracket */}
        {bracket > 0 && (
          <div
            style={{
              position: 'absolute',
              left: LINK_X(BROKEN) - 8,
              top: CHAIN_Y - 8,
              width: LINK_W + 16,
              height: CHAIN_H + 16,
              border: `3px solid ${PALETTE.bad}`,
              borderRadius: 20,
              opacity: bracket * 0.9,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '100%',
                transform: 'translateX(-50%)',
                marginTop: 8,
                whiteSpace: 'nowrap',
                fontFamily: MONO,
                color: PALETTE.bad,
                fontSize: 15,
                fontWeight: 900,
              }}
            >
              ▲ first link that fails = the answer
            </div>
          </div>
        )}

        {/* footer */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 495, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>each link is checkable in a second — the first one that fails is the answer, and the phase never changes</Label>
        </div>
      </div>
    </div>
  );
};
