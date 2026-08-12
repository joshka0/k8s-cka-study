import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 15 beat 5 — policy permits, it does not route. Reuses the module-08
 * policyNotPath idea (permission is not a pipe; enforcement belongs to the
 * implementation) and extends it for this beat: routing, endpoint selection,
 * policy and whether the application listens are four independent layers,
 * each checkable on its own. Module 08's component is untouched — this is a
 * separate derivative.
 */

const LAYERS = [
  { n: '01', name: 'routing', check: 'does the data plane actually forward?', note: 'the network implementation, not the object', color: PALETTE.blue },
  { n: '02', name: 'endpoint selection', check: 'does the Service select ready backends?', note: 'EndpointSlices hold real, ready Pods', color: PALETTE.cyan },
  { n: '03', name: 'policy', check: 'does NetworkPolicy permit the flow?', note: 'a permission only — it creates no route', color: PALETTE.violet },
  { n: '04', name: 'application listening', check: 'is the process actually up?', note: "the Pod's own listener", color: PALETTE.amber },
];

export const PolicyPermitsEdge: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const layerOn = LAYERS.map((_, i) => appear(t, 0.08 + i * 0.09, 0.15 + i * 0.09));
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
      <div style={{ width: 1600, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>permission is not a path — diagnose four independent layers, each checkable on its own</Label>
        </div>

        <div style={{ position: 'absolute', left: 60, top: 64, width: 1480, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {LAYERS.map((l, i) => {
            const on = layerOn[i];
            return (
              <div
                key={l.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  borderRadius: 14,
                  border: `2px solid ${on > 0.5 ? l.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${l.color}08` : '#101826',
                  padding: '14px 20px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 900, color: l.color, width: 34, flex: '0 0 34px' }}>{l.n}</span>
                <div style={{ width: 240, flex: '0 0 240px' }}>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>{l.name}</div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginTop: 3 }}>{l.note}</div>
                </div>
                <div style={{ flex: 1, fontFamily: MONO, color: PALETTE.ink, fontSize: 15.5, fontWeight: 800 }}>
                  check — {l.check}
                </div>
                <div
                  style={{
                    flex: '0 0 300px',
                    textAlign: 'right',
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 800,
                    color: PALETTE.muted,
                    lineHeight: 1.35,
                  }}
                >
                  a fix here proves nothing about the other three
                </div>
              </div>
            );
          })}
        </div>

        {/* the policy stamp — permission, not pipe */}
        <div
          style={{
            position: 'absolute',
            left: 180,
            top: 470,
            width: 1240,
            borderRadius: 16,
            border: `2px solid ${PALETTE.violet}55`,
            background: `${PALETTE.violet}06`,
            padding: '14px 20px',
            textAlign: 'center',
            opacity: footer,
          }}
        >
          <span style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 15, fontWeight: 900 }}>
            NetworkPolicy = PERMIT at the destination and source — a permission, never a route
          </span>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 618, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>enforcement belongs to the network implementation — a fix in one layer proves nothing about the others</Label>
        </div>
      </div>
    </div>
  );
};
