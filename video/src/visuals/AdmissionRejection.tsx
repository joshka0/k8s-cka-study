import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 16 beat 4 — scheduled, then refused. The scheduler binds the Pod to a
 * node; the node's own admission then refuses it on topology grounds. Both
 * verdicts are correct, side by side, with the different question each was
 * answering written underneath. Neither is a bug — from module 17's sibling
 * note, the rejected object terminates Failed rather than silently re-pending.
 */

export const AdmissionRejection: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const podIn = appear(t, 0.08, 0.16);
  const schedIn = appear(t, 0.16, 0.26);
  const bindIn = appear(t, 0.24, 0.34);
  const refuseIn = seg(t, 0.38, 0.5);
  const questionIn = appear(t, 0.5, 0.62);
  const failedIn = appear(t, 0.62, 0.72);
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
          <Label color={PALETTE.cyan} size={13}>a Pod can be scheduled and then refused by the very node it was sent to — both are correct</Label>
        </div>

        {/* the pod */}
        <div
          style={{
            position: 'absolute',
            left: 130,
            top: 90,
            width: 320,
            borderRadius: 16,
            border: `2px solid ${PALETTE.ink}`,
            background: `${PALETTE.ink}08`,
            padding: '16px 18px',
            textAlign: 'center',
            opacity: podIn,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>the Pod</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6 }}>needs CPU + memory + a device, together</div>
        </div>

        {/* the scheduler */}
        <div style={{ position: 'absolute', left: 520, top: 90, width: 400, borderRadius: 18, border: `2px solid ${PALETTE.blue}`, background: `${PALETTE.blue}08`, padding: '18px 20px', textAlign: 'center', opacity: schedIn }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>scheduler</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8 }}>found enough in aggregate → bind to node</div>
        </div>

        <div style={{ position: 'absolute', left: 468, top: 140, color: PALETTE.line, fontSize: 26, fontWeight: 900 }}>→</div>

        {/* the node its own admission */}
        <div
          style={{
            position: 'absolute',
            left: 1000,
            top: 90,
            width: 560,
            borderRadius: 18,
            border: `2px solid ${refused ? PALETTE.bad : PALETTE.violet}`,
            background: refused ? `${PALETTE.bad}06` : `${PALETTE.violet}08`,
            padding: '18px 22px',
            opacity: bindIn,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>the node's own admission</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8 }}>
            Topology Manager is node-local — it checks whether the allocation is coherent locally
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
            {refused ? '✕ refuses — no coherent local placement' : 'admission evaluates…'}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 936, top: 140, color: PALETTE.line, fontSize: 26, fontWeight: 900 }}>→</div>

        {/* the verdict framing */}
        <div style={{ position: 'absolute', left: 130, top: 330, width: 1430, borderRadius: 18, border: `2px solid ${PALETTE.amber}55`, background: `${PALETTE.amber}06`, padding: '16px 22px', opacity: questionIn }}>
          <Label color={PALETTE.amber} size={12} style={{ marginBottom: 10 }}>two components answered two different questions — and both answered correctly</Label>
          <div style={{ display: 'flex', gap: 30, flexWrap: 'nowrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: MONO, color: PALETTE.blue, fontSize: 15, fontWeight: 900 }}>scheduler asked: can some node fit it in aggregate?</div>
              <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 14, fontWeight: 800, marginTop: 4 }}>answer: yes → correct</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 15, fontWeight: 900 }}>Topology Manager asked: is it coherent on this node?</div>
              <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 14, fontWeight: 800, marginTop: 4 }}>answer: no → refusal is also correct</div>
            </div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 14.5, fontWeight: 900, marginTop: 12, opacity: failedIn }}>
            the Pod stays Failed — the scheduler will not move that object; a controller creates a replacement
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a strict policy can refuse an allocation that looked perfectly feasible in aggregate — that is not a contradiction</Label>
        </div>
      </div>
    </div>
  );
};
