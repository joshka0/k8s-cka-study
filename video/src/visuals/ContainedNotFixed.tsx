import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 12 beat 5 — APF protects, it does not fix. A flooding controller
 * and a protected API server with the protection visibly working; then the
 * frame splits into two labelled outcomes: 'API server protected' marked
 * done, and 'controller still looping' marked outstanding. Both states true
 * at once; neither half looks like the whole answer.
 */

export const ContainedNotFixed: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const sceneIn = appear(t, 0.08, 0.18);
  const shieldOn = seg(t, 0.16, 0.32);
  const splitIn = appear(t, 0.5, 0.6);
  const footer = appear(t, 0.84, 0.92);

  const pulse = 0.55 + 0.45 * Math.sin(frame / 8);

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
          <Label color={PALETTE.cyan} size={13}>APF holds the door — it does not stop the controller misbehaving</Label>
        </div>

        {/* the scene */}
        <div style={{ position: 'absolute', left: 160, top: 64, width: 1300, display: 'flex', alignItems: 'center', gap: 20, opacity: sceneIn }}>
          <div style={{ width: 380, textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900, border: `2px solid ${PALETTE.bad}`, borderRadius: 14, background: `${PALETTE.bad}0c`, padding: '14px 12px' }}>
              flooding controller
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 13, fontWeight: 800, marginTop: 8 }}>
              lists + watches in a tight loop, forever
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', height: 120 }}>
            {/* requests */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 14,
                    height: i % 3 === 0 ? 52 : 38,
                    borderRadius: 4,
                    background: `${PALETTE.bad}88`,
                    opacity: shieldOn > 0.5 ? 0.4 + 0.6 * Math.abs(Math.sin(frame / 4 + i)) : 1,
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ width: 380, textAlign: 'center', position: 'relative' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900, border: `2px solid ${PALETTE.good}`, borderRadius: 14, background: `${PALETTE.good}0c`, padding: '14px 12px' }}>
              API server
            </div>
            {shieldOn > 0.5 && (
              <div
                style={{
                  position: 'absolute',
                  left: -66,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: MONO,
                  fontSize: 40,
                  fontWeight: 900,
                  color: PALETTE.good,
                  opacity: 0.5 + 0.5 * pulse,
                }}
              >
                🛡
              </div>
            )}
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 13.5, fontWeight: 900, marginTop: 12, opacity: shieldOn }}>
              {shieldOn > 0.5 ? 'requests throttled — the API stays responsive' : 'flood arriving'}
            </div>
          </div>
        </div>

        {/* the two outcomes */}
        <div style={{ position: 'absolute', left: 160, top: 330, width: 1300, display: 'flex', gap: 24, opacity: splitIn }}>
          <div
            style={{
              flex: 1,
              borderRadius: 18,
              border: `2px solid ${PALETTE.good}`,
              background: `${PALETTE.good}06`,
              padding: '18px 22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Label color={PALETTE.good} size={13}>API server protected</Label>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11.5,
                  fontWeight: 900,
                  color: PALETTE.good,
                  border: `1px solid ${PALETTE.good}66`,
                  borderRadius: 999,
                  padding: '3px 10px',
                }}
              >
                done ✓
              </span>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16.5, fontWeight: 800, marginTop: 12, lineHeight: 1.5 }}>
              the control plane keeps serving — clients, other controllers and you are not collateral damage
            </div>
          </div>

          <div
            style={{
              flex: 1,
              borderRadius: 18,
              border: `2px solid ${PALETTE.amber}`,
              background: `${PALETTE.amber}06`,
              padding: '18px 22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Label color={PALETTE.amber} size={13}>controller still looping</Label>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11.5,
                  fontWeight: 900,
                  color: PALETTE.amber,
                  border: `1px solid ${PALETTE.amber}66`,
                  borderRadius: 999,
                  padding: '3px 10px',
                }}
              >
                outstanding ⚠
              </span>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16.5, fontWeight: 800, marginTop: 12, lineHeight: 1.5 }}>
              the misbehaving controller is still misbehaving — its bug is untouched, and it is still burning the cluster's budget
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>both states are true at once — protection done, cause outstanding; neither half is the whole answer</Label>
        </div>
      </div>
    </div>
  );
};
