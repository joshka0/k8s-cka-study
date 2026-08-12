import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 14 beat 5 — QoS is derived, not set. One Pod with three containers;
 * the class is computed from all of them together. Guaranteed while everything
 * is specified; strip a limit from a small sidecar and the whole Pod drops to
 * Burstable. The class is an output — never a field you set.
 */

const CONTAINERS = [
  { name: 'app', request: '500m / 256Mi', limit: '1000m / 512Mi' },
  { name: 'sidecar', request: '100m / 64Mi', limit: '200m / 128Mi' },
  { name: 'sidecar-small', request: '50m / 32Mi', limit: null as string | null },
];

export const QosDerived: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const podIn = appear(t, 0.06, 0.14);
  const guaranteedIn = appear(t, 0.16, 0.24);
  const stripIn = seg(t, 0.4, 0.54);
  const burstableIn = appear(t, 0.56, 0.68);
  const footer = appear(t, 0.9, 0.97);

  const stripped = stripIn > 0.5;
  const isGuaranteed = !stripped;

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
      <div style={{ width: 1660, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>QoS is computed from every container in the Pod — it is an output, not a field</Label>
        </div>

        {/* the pod */}
        <div
          style={{
            position: 'absolute',
            left: 420,
            top: 64,
            width: 900,
            borderRadius: 22,
            border: `2px solid ${PALETTE.violet}`,
            background: `${PALETTE.violet}08`,
            padding: '22px 26px',
            opacity: podIn,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>the Pod — three containers</span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 900,
                color: isGuaranteed ? PALETTE.good : PALETTE.amber,
                border: `2px solid ${isGuaranteed ? PALETTE.good : PALETTE.amber}`,
                borderRadius: 999,
                background: isGuaranteed ? `${PALETTE.good}0c` : `${PALETTE.amber}0c`,
                padding: '6px 14px',
              }}
            >
              QoS = {isGuaranteed ? 'Guaranteed' : 'Burstable'}
            </span>
          </div>
          {CONTAINERS.map((c, i) => {
            // the stripped sidecar has no limit
            const noLimit = stripped && i === 2;
            return (
              <div
                key={c.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  borderRadius: 12,
                  border: `1px solid ${noLimit ? PALETTE.amber : PALETTE.line}`,
                  background: noLimit ? `${PALETTE.amber}06` : '#0d1522',
                  padding: '12px 16px',
                  marginBottom: 10,
                }}
              >
                <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, width: 150, flex: '0 0 150px' }}>{c.name}</span>
                <span style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted, flex: 1 }}>
                  requests {c.request}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: noLimit ? PALETTE.bad : PALETTE.muted }}>
                  {noLimit ? 'limit: — (stripped)' : `limits ${c.limit}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* the mechanism */}
        <div style={{ position: 'absolute', left: 60, top: 300, width: 1540, textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14.5, fontWeight: 800, opacity: guaranteedIn, lineHeight: 1.5 }}>
            every container specifies CPU + memory requests and limits → the class is <span style={{ color: PALETTE.good, fontWeight: 900 }}>Guaranteed</span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 14.5, fontWeight: 900, marginTop: 12, opacity: burstableIn, lineHeight: 1.5 }}>
            strip one limit from a small sidecar → the <span style={{ color: PALETTE.ink }}>whole Pod</span> drops to <span style={{ color: PALETTE.amber, fontWeight: 900 }}>Burstable</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: burstableIn }}>
          <Label color={PALETTE.amber} size={13}>one under-specified sidecar changes the classification of the entire Pod</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>if you thought a workload was Guaranteed and it is not — look at every container, not the one you care about</Label>
        </div>
      </div>
    </div>
  );
};
