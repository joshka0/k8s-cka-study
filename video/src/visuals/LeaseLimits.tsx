import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 19 beat 4 — what it cannot promise. Two columns: what the Lease
 * guarantees versus what it does not. On the right, a deposed leader still
 * completing an external call while the new leader begins its own — the exact
 * scenario a Lease cannot prevent. Fencing and idempotency are named as the
 * separate mechanisms required.
 */

export const LeaseLimits: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const doesIn = appear(t, 0.08, 0.16);
  const notIn = appear(t, 0.18, 0.28);
  const callIn = seg(t, 0.4, 0.56);
  const mechIn = appear(t, 0.6, 0.72);
  const footer = appear(t, 0.9, 0.97);

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
          <Label color={PALETTE.cyan} size={13}>be precise about what leader election guarantees — and what it cannot</Label>
        </div>

        {/* guarantees */}
        <div style={{ position: 'absolute', left: 120, top: 80, width: 700, borderRadius: 20, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}06`, padding: '22px 26px', opacity: doesIn }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 12 }}>what the Lease guarantees</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, border: `1px solid ${PALETTE.good}55`, borderRadius: 10, background: '#0d1522', padding: '12px 14px', lineHeight: 1.45 }}>
            under API consistency, exactly one current holder
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, border: `1px solid ${PALETTE.good}55`, borderRadius: 10, background: '#0d1522', padding: '12px 14px', marginTop: 10, lineHeight: 1.45 }}>
            failover after renewal stops and the duration expires
          </div>
        </div>

        {/* cannot */}
        <div style={{ position: 'absolute', right: 120, top: 80, width: 700, borderRadius: 20, border: `2px solid ${PALETTE.bad}`, background: `${PALETTE.bad}05`, padding: '22px 26px', opacity: notIn }}>
          <Label color={PALETTE.bad} size={12} style={{ marginBottom: 12 }}>what it cannot give you</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, border: `1px solid ${PALETTE.bad}55`, borderRadius: 10, background: '#0d1522', padding: '12px 14px', lineHeight: 1.45 }}>
            exactly-once external side effects
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 10, lineHeight: 1.45 }}>
            a former leader can still be mid-operation against something outside the cluster
          </div>
        </div>

        {/* the deposed leader mid-call */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 360,
            width: 1280,
            borderRadius: 18,
            border: `2px solid ${PALETTE.amber}55`,
            background: `${PALETTE.amber}06`,
            padding: '16px 24px',
            opacity: callIn,
          }}
        >
          <Label color={PALETTE.amber} size={12.5} style={{ marginBottom: 10 }}>the exact scenario a Lease cannot prevent</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'nowrap' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.bad}55`, borderRadius: 10, padding: '10px 14px', background: '#0d1522' }}>
              deposed leader
            </span>
            <span style={{ color: PALETTE.amber, fontWeight: 900 }}>…still calling an external service…</span>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.good}55`, borderRadius: 10, padding: '10px 14px', background: '#0d1522' }}>
              new leader — begins its own
            </span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 14, fontWeight: 800, marginTop: 10 }}>
            both acting → a Lease cannot stop it
          </div>
        </div>

        {/* the separate mechanisms */}
        <div style={{ position: 'absolute', left: 300, top: 560, width: 1080, textAlign: 'center', opacity: mechIn }}>
          <Label color={PALETTE.amber} size={13}>if that matters you need separate mechanisms — the Lease alone provides neither</Label>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'center' }}>
            <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.cyan}55`, borderRadius: 10, background: '#0d1522', padding: '10px 18px' }}>fencing</span>
            <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.violet}55`, borderRadius: 10, background: '#0d1522', padding: '10px 18px' }}>idempotency</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a Lease orders who thinks they lead — it does not fence, and it does not make you idempotent</Label>
        </div>
      </div>
    </div>
  );
};
