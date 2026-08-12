import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 25 beat 2 — Local is not a hint. externalTrafficPolicy: Local
 * preserves the client source address and avoids an extra hop, but changes
 * which endpoints are eligible at the receiving node: only node-local ones.
 * The same request at two nodes: one serves and preserves the source; the
 * other refuses rather than forwarding. The two halves of one trade sit side
 * by side.
 */

export const ExternalTrafficLocal: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const reqIn = appear(t, 0.06, 0.12);
  const serveIn = seg(t, 0.2, 0.34);
  const refuseIn = seg(t, 0.5, 0.64);
  const trade = appear(t, 0.7, 0.8);
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
      <div style={{ width: 1680, height: 740, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>externalTrafficPolicy: Local — a behaviour change, not a performance hint</Label>
        </div>

        {/* the request arriving at both */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center', opacity: reqIn }}>
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink }}>the same request — src 203.0.113.5</div>
          <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 900, color: PALETTE.cyan, marginTop: 6 }}>↓ ↓</div>
        </div>

        {/* node A: serves */}
        <div style={{ position: 'absolute', left: 120, top: 140, width: 700, opacity: serveIn }}>
          <div style={{ borderRadius: 18, border: `2px solid ${PALETTE.good}66`, background: `${PALETTE.good}08`, padding: '18px 22px' }}>
            <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 12 }}>node A — has a local endpoint</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: PALETTE.ink }}>endpoint on this node</div>
              <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.good, border: `1px solid ${PALETTE.good}66`, borderRadius: 999, padding: '6px 14px' }}>
                serves — no extra hop
              </div>
            </div>
            <div style={{ marginTop: 14, borderRadius: 10, background: '#0c111c', border: `1px solid ${PALETTE.line}`, padding: '10px 14px' }}>
              <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted }}>source address preserved</div>
              <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: PALETTE.good, marginTop: 4 }}>203.0.113.5 ⇢ pod</div>
            </div>
          </div>
        </div>

        {/* node B: refuses */}
        <div style={{ position: 'absolute', left: 860, top: 140, width: 700, opacity: refuseIn }}>
          <div style={{ borderRadius: 18, border: `2px solid ${PALETTE.bad}66`, background: `${PALETTE.bad}08`, padding: '18px 22px', boxShadow: refuseIn > 0.5 ? `0 0 24px ${PALETTE.bad}1c` : 'none' }}>
            <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 12 }}>node B — no local endpoint</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: PALETTE.ink }}>no endpoint on this node</div>
              <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.bad, border: `1px solid ${PALETTE.bad}66`, borderRadius: 999, padding: '6px 14px' }}>
                ✕ refuses — does not forward
              </div>
            </div>
            <div style={{ marginTop: 14, borderRadius: 10, background: '#0c111c', border: `1px solid ${PALETTE.line}`, padding: '10px 14px' }}>
              <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted }}>this node will not serve the traffic at all</div>
              <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: PALETTE.bad, marginTop: 4 }}>⛔ dropped</div>
            </div>
          </div>
        </div>

        {/* the trade */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 470,
            width: 1440,
            borderRadius: 16,
            border: `2px solid ${PALETTE.amber}66`,
            background: `${PALETTE.amber}06`,
            padding: '16px 22px',
            textAlign: 'center',
            opacity: trade,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink }}>
            the trade: preserved source and no extra hop <span style={{ color: PALETTE.line }}>⇄</span> only node-local endpoints eligible
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.amber, marginTop: 8, lineHeight: 1.4 }}>
            a node with no local endpoint serves nothing — that is the price of Local
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 676, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a real behaviour change, not a hint — decide knowing what it costs</Label>
        </div>
      </div>
    </div>
  );
};
