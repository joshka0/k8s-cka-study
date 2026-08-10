import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 09 beat 9 — fallthrough is not forwarding. One query, two clearly
 * distinct paths. Fallthrough moves sideways along the local plugin chain,
 * staying inside CoreDNS; forwarding moves outward to a separate upstream
 * server, leaving CoreDNS entirely. The CoreDNS boundary is drawn explicitly
 * so that staying inside versus leaving is the visual difference.
 */

export const FallthroughVsForward: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const boundaryIn = appear(t, 0.08, 0.18);
  const queryIn = seg(t, 0.14, 0.24);
  const decline = seg(t, 0.24, 0.36);
  const fallPath = seg(t, 0.34, 0.48);
  const forwardPath = seg(t, 0.5, 0.66);
  const labels = appear(t, 0.56, 0.66);
  const footer = appear(t, 0.84, 0.92);

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
      <div style={{ width: 1620, height: 640, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>two words used interchangeably — they are different mechanisms with different paths and different failures</Label>
        </div>

        {/* the CoreDNS boundary */}
        <div
          style={{
            position: 'absolute',
            left: 330,
            top: 100,
            width: 760,
            height: 360,
            borderRadius: 28,
            border: `3px dashed ${PALETTE.violet}`,
            opacity: boundaryIn,
          }}
        >
          <Label color={PALETTE.violet} size={12} style={{ position: 'absolute', left: 26, top: 16 }}>CoreDNS — the boundary</Label>

          {/* the plugin chain inside */}
          <div style={{ position: 'absolute', left: 100, top: 130, display: 'flex', alignItems: 'center', gap: 12 }}>
            {['kubernetes', 'errors', 'forward'].map((p, i) => (
              <React.Fragment key={p}>
                {i > 0 && <span style={{ color: PALETTE.line, fontSize: 22, fontWeight: 900 }}>→</span>}
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 19,
                    fontWeight: 900,
                    color: PALETTE.ink,
                    border: `1px solid ${PALETTE.line}`,
                    borderRadius: 10,
                    background: '#0d1522',
                    padding: '12px 16px',
                  }}
                >
                  {p}
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* fallthrough path — sideways, inside */}
          <div style={{ opacity: fallPath }}>
            <div
              style={{
                position: 'absolute',
                left: 470,
                top: 210,
                fontFamily: MONO,
                color: PALETTE.amber,
                fontSize: 15,
                fontWeight: 900,
                border: `1px solid ${PALETTE.amber}66`,
                borderRadius: 12,
                background: `${PALETTE.amber}10`,
                padding: '10px 14px',
                whiteSpace: 'nowrap',
              }}
            >
              ← fallthrough — the next local plugin tries
            </div>
            <div
              style={{
                position: 'absolute',
                left: 340,
                top: 300,
                fontFamily: MONO,
                color: PALETTE.amber,
                fontSize: 13.5,
                fontWeight: 800,
              }}
            >
              staying inside CoreDNS
            </div>
          </div>

          {/* forward path — outward, leaving */}
          <div style={{ opacity: forwardPath }}>
            <div
              style={{
                position: 'absolute',
                right: 24,
                top: 96,
                fontFamily: MONO,
                color: PALETTE.cyan,
                fontSize: 15,
                fontWeight: 900,
                border: `1px solid ${PALETTE.cyan}66`,
                borderRadius: 12,
                background: `${PALETTE.cyan}10`,
                padding: '10px 14px',
                whiteSpace: 'nowrap',
              }}
            >
              forward → leaves CoreDNS entirely ↑
            </div>
          </div>
        </div>

        {/* the query entering */}
        <div style={{ position: 'absolute', left: 70, top: 220, textAlign: 'center', opacity: queryIn }}>
          <div
            style={{
              fontFamily: MONO,
              color: PALETTE.ink,
              fontSize: 19,
              fontWeight: 900,
              border: `2px solid ${PALETTE.cyan}`,
              borderRadius: 12,
              background: `${PALETTE.cyan}0c`,
              padding: '12px 18px',
            }}
          >
            query
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: MONO,
              color: PALETTE.line,
              fontSize: 26,
              fontWeight: 900,
            }}
          >
            →
          </div>
        </div>

        {/* the upstream server — outside */}
        <div style={{ position: 'absolute', right: 120, top: 168, textAlign: 'center', opacity: forwardPath }}>
          <div
            style={{
              fontFamily: MONO,
              color: PALETTE.good,
              fontSize: 18,
              fontWeight: 900,
              border: `2px solid ${PALETTE.good}`,
              borderRadius: 14,
              background: `${PALETTE.good}0c`,
              padding: '12px 18px',
              boxShadow: `0 0 22px ${PALETTE.good}33`,
            }}
          >
            upstream server
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6 }}>
            a different server answers — outside CoreDNS
          </div>
        </div>

        {/* the two definitions */}
        <div style={{ position: 'absolute', left: 330, top: 492, width: 760, display: 'flex', gap: 18, opacity: labels }}>
          <div
            style={{
              flex: 1,
              borderRadius: 12,
              border: `1px solid ${PALETTE.amber}66`,
              background: `${PALETTE.amber}08`,
              padding: '12px 16px',
            }}
          >
            <Label color={PALETTE.amber} size={10.5} style={{ marginBottom: 4 }}>fallthrough</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14.5, fontWeight: 800, lineHeight: 1.35 }}>
              a plugin declines to answer — the next local plugin tries
            </div>
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: 12,
              border: `1px solid ${PALETTE.cyan}66`,
              background: `${PALETTE.cyan}08`,
              padding: '12px 16px',
            }}
          >
            <Label color={PALETTE.cyan} size={10.5} style={{ marginBottom: 4 }}>forwarding</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14.5, fontWeight: 800, lineHeight: 1.35 }}>
              the query is sent to an entirely different upstream server
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>different path, different failure, different thing to check — say one, mean the other, and you will look in the wrong place</Label>
        </div>
      </div>
    </div>
  );
};
