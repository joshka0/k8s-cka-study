import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 12 beat 8 — the object is the contract. One object at the centre,
 * with events, logs and metrics arranged around it, each visibly incomplete
 * about it — an expired event, a log on another node, a metric that has
 * averaged it away. Then the system acts on the object regardless of what
 * the others say. The object's primacy for intent is the beat.
 */

export const ObjectIsContract: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const sceneIn = appear(t, 0.08, 0.16);
  const objectIn = appear(t, 0.12, 0.2);
  const aroundOn = [0, 1, 2].map((_, i) => appear(t, 0.2 + i * 0.08, 0.3 + i * 0.08));
  const actIn = seg(t, 0.5, 0.66);
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
      <div style={{ width: 1620, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>the object is the authority — events, logs and metrics can all be wrong about it</Label>
        </div>

        {/* the object at the centre */}
        <div style={{ position: 'absolute', left: 610, top: 210, width: 400, textAlign: 'center', opacity: objectIn }}>
          <div
            style={{
              fontFamily: MONO,
              color: PALETTE.ink,
              fontSize: 22,
              fontWeight: 900,
              border: `3px solid ${PALETTE.good}`,
              borderRadius: 16,
              background: `${PALETTE.good}0d`,
              padding: '20px 24px',
              boxShadow: `0 0 30px ${PALETTE.good}44`,
            }}
          >
            Deployment payments
            <div style={{ fontSize: 14, color: PALETTE.good, fontWeight: 800, marginTop: 8 }}>
              spec.replicas = 3 — the desired state
            </div>
            <div style={{ fontSize: 13, color: PALETTE.muted, fontWeight: 700, marginTop: 4 }}>
              the contract the system reconciles to
            </div>
          </div>
        </div>

        {/* around it — incomplete views */}
        {[
          { x: 200, y: 90, w: 320, color: PALETTE.blue, title: 'events', body: '“replica set scaled up” — expired · gone', note: 'expired before you looked' },
          { x: 1100, y: 90, w: 320, color: PALETTE.cyan, title: 'logs', body: '“pod-2 crashing on node-4” — a different node, a different object', note: 'not this object, not this node' },
          { x: 200, y: 430, w: 320, color: PALETTE.amber, title: 'metrics', body: '“5-min average: 2.9 replicas” — the object is gone from the signal', note: 'averaged it away' },
        ].map((c, i) => (
          <div
            key={c.title}
            style={{
              position: 'absolute',
              left: c.x,
              top: c.y,
              width: c.w,
              borderRadius: 14,
              border: `2px solid ${aroundOn[i] > 0.5 ? c.color : PALETTE.line}66`,
              background: '#0c111c',
              padding: '14px 16px',
              opacity: Math.max(0.3, aroundOn[i]),
            }}
          >
            <div style={{ fontFamily: MONO, color: c.color, fontSize: 16, fontWeight: 900 }}>{c.title}</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
              {c.body}
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 12.5, fontWeight: 800, marginTop: 8 }}>✕ {c.note}</div>
          </div>
        ))}

        {/* the system acts regardless */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 560,
            textAlign: 'center',
            opacity: actIn,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              fontFamily: MONO,
              color: PALETTE.ink,
              fontSize: 17,
              fontWeight: 900,
              border: `1px solid ${PALETTE.good}66`,
              borderRadius: 999,
              background: `${PALETTE.good}0c`,
              padding: '12px 24px',
            }}
          >
            the controller acts on the object — events lost, logs elsewhere, metrics smoothed: <span style={{ color: PALETTE.good }}>replicas reconciled to 3 anyway</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 636, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the object is what the system obeys — treat its state as the contract, and the other sources as commentary</Label>
        </div>
      </div>
    </div>
  );
};
