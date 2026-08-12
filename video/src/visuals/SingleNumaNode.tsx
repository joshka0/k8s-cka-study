import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 16 beat 7 — what the strictest policy promises. single-numa-node is a
 * promise about admission, not placement. It is a gate at node admission that
 * refuses anything it cannot satisfy from one NUMA node. CORRECTION applied:
 * the rejected Pod terminates Failed with a TopologyAffinity admission failure —
 * it does NOT return to Pending and is NOT rescheduled somewhere better. The
 * absent feedback to the scheduler upstream is the point.
 */

export const SingleNumaNode: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const schedIn = appear(t, 0.08, 0.16);
  const podIn = appear(t, 0.14, 0.22);
  const gateIn = appear(t, 0.2, 0.3);
  const refuseIn = seg(t, 0.34, 0.5);
  const terminateIn = appear(t, 0.5, 0.62);
  const noFeedback = appear(t, 0.62, 0.72);
  const footer = appear(t, 0.9, 0.97);

  const refused = refuseIn > 0.5;

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
      <div style={{ width: 1680, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>single-numa-node is a promise about admission — and strictness produces rejection, not smarter scheduling</Label>
        </div>

        {/* scheduler, unaware */}
        <div style={{ position: 'absolute', left: 130, top: 90, width: 380, borderRadius: 18, border: `2px solid ${PALETTE.blue}`, background: `${PALETTE.blue}08`, padding: '18px 20px', textAlign: 'center', opacity: schedIn }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>scheduler</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8 }}>
            sees enough in aggregate — unaware of the node-local constraint
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 12.5, fontWeight: 800, marginTop: 10, opacity: noFeedback }}>
            no feedback loop — nothing reports the refusal back
          </div>
        </div>

        {/* the pod being sent */}
        <div style={{ position: 'absolute', left: 560, top: 120, width: 240, borderRadius: 14, border: `2px solid ${PALETTE.ink}`, background: `${PALETTE.ink}06`, padding: '14px 16px', textAlign: 'center', opacity: podIn }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>the Pod</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 4 }}>bound to this node</div>
        </div>

        <div style={{ position: 'absolute', left: 814, top: 150, color: PALETTE.line, fontSize: 28, fontWeight: 900, opacity: podIn }}>→</div>

        {/* the gate at node admission */}
        <div
          style={{
            position: 'absolute',
            left: 900,
            top: 70,
            width: 640,
            borderRadius: 20,
            border: `2px solid ${refused ? PALETTE.bad : PALETTE.violet}`,
            background: refused ? `${PALETTE.bad}08` : `${PALETTE.violet}08`,
            padding: '20px 24px',
            opacity: gateIn,
          }}
        >
          <Label color={refused ? PALETTE.bad : PALETTE.violet} size={12} style={{ marginBottom: 10 }}>node admission — the gate</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>
            policy: single-numa-node
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 8, lineHeight: 1.45 }}>
            refuses any Pod whose resources cannot be satisfied from one NUMA node
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: MONO,
              fontSize: 16,
              fontWeight: 900,
              color: refused ? PALETTE.bad : PALETTE.good,
              border: `2px solid ${refused ? PALETTE.bad : PALETTE.good}`,
              borderRadius: 10,
              background: refused ? `${PALETTE.bad}0c` : `${PALETTE.good}0c`,
              padding: '10px 14px',
              opacity: refuseIn,
            }}
          >
            {refused ? '✕ refused — TopologyAffinity admission failure' : 'admission evaluates…'}
          </div>
        </div>

        {/* the outcome - terminates Failed, not re-pending */}
        <div style={{ position: 'absolute', left: 200, top: 400, width: 1280, borderRadius: 18, border: `2px solid ${PALETTE.bad}66`, background: `${PALETTE.bad}06`, padding: '16px 22px', textAlign: 'center', opacity: terminateIn }}>
          <Label color={PALETTE.bad} size={12.5} style={{ marginBottom: 8 }}>the rejected Pod terminates — it does not recover</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15.5, fontWeight: 900 }}>
            phase → <span style={{ color: PALETTE.bad }}>Failed</span> · reason: TopologyAffinity
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800, marginTop: 10, lineHeight: 1.5 }}>
            it does <span style={{ color: PALETTE.bad, fontWeight: 900 }}>not</span> return to Pending, and it is <span style={{ color: PALETTE.bad, fontWeight: 900 }}>not</span> placed somewhere better —
            the scheduler upstream is unaware
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>strictness here produces rejections, not smarter scheduling — the absence of feedback to the scheduler is the point</Label>
        </div>
      </div>
    </div>
  );
};
