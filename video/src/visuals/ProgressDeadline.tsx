import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 23 beat 5 — the deadline reports, it does not act. When
 * progressDeadlineSeconds elapses, the Deployment reports a stalled
 * condition. It does not roll back, does not stop trying, does not page. The
 * controller keeps retrying, the old ReplicaSet stays in place, and the
 * imagined automatic rollback is struck through.
 */

export const ProgressDeadline: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const rolloutIn = appear(t, 0.06, 0.12);
  const deadlineElapsed = seg(t, 0.3, 0.42);
  const condition = appear(t, 0.44, 0.54);
  const retries = appear(t, 0.5, 0.6);
  const imagined = appear(t, 0.64, 0.74);
  const footer = appear(t, 0.86, 0.93);

  const retryCount = Math.floor(seg(t, 0.5, 0.85) * 6);

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
          <Label color={PALETTE.cyan} size={13}>progressDeadlineSeconds is status evidence — not a remediation policy</Label>
        </div>

        {/* the stalled rollout */}
        <div style={{ position: 'absolute', left: 120, top: 52, width: 1440, borderRadius: 16, border: `2px solid ${PALETTE.amber}66`, background: `${PALETTE.amber}06`, padding: '16px 20px', opacity: rolloutIn }}>
          <Label color={PALETTE.amber} size={11} style={{ marginBottom: 10 }}>the stalled rollout</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.blue}66`, borderRadius: 10, background: '#0d1522', padding: '10px 14px' }}>
              old ReplicaSet · 5
            </div>
            <span style={{ color: PALETTE.line, fontSize: 18, fontWeight: 900 }}>⇄</span>
            <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.amber, border: `1px solid ${PALETTE.amber}66`, borderRadius: 10, background: '#0d1522', padding: '10px 14px' }}>
              new ReplicaSet · 1 (never ready)
            </div>
            <span style={{ color: PALETTE.line, fontSize: 18, fontWeight: 900 }}>⇄</span>
            <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.good, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '10px 14px' }}>
              controller keeps retrying
            </div>
          </div>
        </div>

        {/* the deadline elapsing */}
        <div style={{ position: 'absolute', left: 120, top: 180, width: 1440, opacity: rolloutIn }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.muted }}>progressDeadlineSeconds</span>
            <div style={{ flex: 1, height: 16, borderRadius: 999, background: '#0d1522', border: `1px solid ${PALETTE.line}`, overflow: 'hidden' }}>
              <div style={{ width: `${deadlineElapsed * 100}%`, height: '100%', background: deadlineElapsed > 0.5 ? PALETTE.bad : PALETTE.amber }} />
            </div>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: deadlineElapsed > 0.5 ? PALETTE.bad : PALETTE.amber }}>
              {deadlineElapsed > 0.5 ? 'elapsed' : 'counting'}
            </span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.muted, marginTop: 6 }}>
            the controller keeps trying regardless — the deadline only reports
          </div>
        </div>

        {/* the condition appearing */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 280,
            width: 640,
            borderRadius: 14,
            border: `2px solid ${PALETTE.bad}`,
            background: `${PALETTE.bad}0a`,
            padding: '14px 18px',
            opacity: condition,
            boxShadow: condition > 0 ? `0 0 22px ${PALETTE.bad}1c` : 'none',
          }}
        >
          <Label color={PALETTE.bad} size={11}>condition appears in status</Label>
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, marginTop: 8 }}>
            Progressing = False · deadline exceeded
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 4 }}>
            Deployment still progressing? False → a reported stall
          </div>
        </div>

        {/* retry loop keeps going */}
        <div style={{ position: 'absolute', left: 820, top: 280, width: 740, opacity: retries }}>
          <Label color={PALETTE.violet} size={11} style={{ marginBottom: 8 }}>and it does not stop working</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: 900,
                  color: i < retryCount ? PALETTE.violet : PALETTE.line,
                  border: `1px solid ${i < retryCount ? PALETTE.violet : PALETTE.line}`,
                  borderRadius: 6,
                  padding: '4px 7px',
                  opacity: i < retryCount ? 1 : 0.3,
                }}
              >
                ↻
              </span>
            ))}
            <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.muted }}>reconciles continue</span>
          </div>
        </div>

        {/* imagined automatic rollback struck through */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 430,
            width: 1440,
            borderRadius: 14,
            border: `2px dashed ${PALETTE.bad}66`,
            background: `${PALETTE.bad}04`,
            padding: '14px 20px',
            textAlign: 'center',
            opacity: imagined,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: PALETTE.ink, textDecoration: 'line-through', textDecorationThickness: 3 }}>
            “when the deadline elapses the Deployment rolls itself back”
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.bad, marginTop: 8 }}>
            it does not roll back · it does not stop trying · it does not page anyone
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 556, textAlign: 'center', opacity: appear(t, 0.66, 0.74) }}>
          <Label color={PALETTE.amber} size={13}>treating it as automatic recovery is how a stalled rollout stays stalled overnight</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the deadline is evidence in the object — you are the remediation</Label>
        </div>
      </div>
    </div>
  );
};
