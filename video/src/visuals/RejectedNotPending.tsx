import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 24 beat 2 — Forbidden is not Pending. Two failure paths side by side:
 * an admission rejection where no object is ever created, and a scheduling
 * failure where a Pod exists and sits Pending. The empty result of the first —
 * there is nothing to describe — is the diagnostic.
 */

export const RejectedNotPending: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const rejectIn = seg(t, 0.14, 0.28);
  const rejectDetail = appear(t, 0.3, 0.4);
  const pendingIn = seg(t, 0.5, 0.62);
  const pendingDetail = appear(t, 0.64, 0.74);
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
          <Label color={PALETTE.cyan} size={13}>a quota violation is a rejection, not a Pending Pod — the absence is the diagnostic</Label>
        </div>

        {/* path one: admission rejection */}
        <div style={{ position: 'absolute', left: 110, top: 56, width: 720 }}>
          <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 12 }}>path one · admission rejection</Label>
          <div style={{ borderRadius: 14, border: `2px solid ${PALETTE.bad}66`, background: `${PALETTE.bad}06`, padding: '14px 18px', opacity: rejectIn }}>
            <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.ink }}>API request → admission → quota exceeded</div>
            <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.bad, marginTop: 8 }}>
              → returns Forbidden · the object is never stored
            </div>
          </div>
          <div
            style={{
              marginTop: 12,
              borderRadius: 14,
              border: `2px dashed ${PALETTE.line}`,
              background: '#0d1522',
              padding: '22px 18px',
              textAlign: 'center',
              minHeight: 110,
              opacity: rejectDetail,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.muted }}>there is no Pod to inspect</div>
            <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 6 }}>
              nothing to describe · no scheduler event · nothing Pending
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color: PALETTE.bad, marginTop: 12, border: `1px solid ${PALETTE.bad}55`, borderRadius: 999, display: 'inline-block', padding: '5px 14px' }}>
              nothing created — that absence IS the diagnostic
            </div>
          </div>
        </div>

        {/* path two: scheduling failure */}
        <div style={{ position: 'absolute', left: 880, top: 56, width: 690 }}>
          <Label color={PALETTE.violet} size={11.5} style={{ marginBottom: 12 }}>path two · scheduling failure</Label>
          <div style={{ borderRadius: 14, border: `2px solid ${PALETTE.violet}66`, background: `${PALETTE.violet}06`, padding: '14px 18px', opacity: pendingIn }}>
            <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.ink }}>admission passed · the object was stored</div>
            <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.violet, marginTop: 8 }}>
              → scheduler can’t place it → Pod exists, sits Pending
            </div>
          </div>
          <div
            style={{
              marginTop: 12,
              borderRadius: 14,
              border: `2px solid ${PALETTE.violet}66`,
              background: `${PALETTE.violet}06`,
              padding: '22px 18px',
              textAlign: 'center',
              minHeight: 110,
              opacity: pendingDetail,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.ink }}>a Pod object exists to inspect</div>
            <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 6 }}>
              events · conditions · the pending reason
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color: PALETTE.violet, marginTop: 12, border: `1px solid ${PALETTE.violet}55`, borderRadius: 999, display: 'inline-block', padding: '5px 14px' }}>
              look at the scheduler, not admission
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', opacity: appear(t, 0.78, 0.86) }}>
          <Label color={PALETTE.amber} size={13}>when you see exceeded quota, the component to look at is the API request that was rejected — Pending and Forbidden are different boundaries</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>one never becomes a Pod · the other is a Pod that can’t be placed — read them differently</Label>
        </div>
      </div>
    </div>
  );
};
