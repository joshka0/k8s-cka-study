import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 17 beat 7 — which cause is it. Four causes of a Pending device Pod
 * look identical from the Pod alone; each has an object + status field that
 * confirms it. Service and networking checks are set aside downstream and
 * struck through — reaching for them is the common wasted step.
 */

const CAUSES = [
  { name: 'no matching device anywhere', obj: 'ResourceClaim / ResourceSlice', status: 'no device matches your requirements', color: PALETTE.blue },
  { name: 'matching device on no reachable node', obj: 'ResourceClaim status', status: 'node selection: none reachable', color: PALETTE.violet },
  { name: 'allocation conflict', obj: 'ResourceClaim status', status: 'the device is held by another claim', color: PALETTE.amber },
  { name: 'the driver is not ready', obj: 'ResourceSlice / driver', status: 'no inventory published yet', color: PALETTE.cyan },
];

export const DraPendingCauses: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const symptomIn = appear(t, 0.06, 0.14);
  const causeOn = CAUSES.map((_, i) => appear(t, 0.14 + i * 0.07, 0.2 + i * 0.07));
  const downstreamIn = appear(t, 0.62, 0.74);
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
          <Label color={PALETTE.cyan} size={13}>a device Pod Pending — four causes look identical from the Pod alone</Label>
        </div>

        {/* symptom */}
        <div
          style={{
            position: 'absolute',
            left: 690,
            top: 52,
            borderRadius: 14,
            border: `2px solid ${PALETTE.bad}`,
            background: `${PALETTE.bad}0a`,
            padding: '11px 22px',
            textAlign: 'center',
            opacity: symptomIn,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>device Pod → Pending</div>
        </div>

        <div style={{ position: 'absolute', left: 120, top: 140, width: 1440, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {CAUSES.map((c, i) => {
            const on = causeOn[i];
            return (
              <div
                key={c.name}
                style={{
                  borderRadius: 16,
                  border: `2px solid ${on > 0.5 ? c.color : PALETTE.line}`,
                  background: on > 0.5 ? `${c.color}08` : PALETTE.panel,
                  padding: '16px 16px',
                  opacity: Math.max(0.3, on),
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color: c.color }}>cause {i + 1}</span>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, marginTop: 10, minHeight: 60, lineHeight: 1.3 }}>{c.name}</div>
                <div style={{ flex: 1 }} />
                <div style={{ marginTop: 12, borderRadius: 10, border: `1px solid ${PALETTE.line}`, background: '#0d1522', padding: '10px 12px' }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: PALETTE.muted }}>confirm with</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.ink, marginTop: 3 }}>{c.obj}</div>
                </div>
                <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: c.color, lineHeight: 1.35 }}>status: {c.status}</div>
              </div>
            );
          })}
        </div>

        {/* struck-through downstream */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 480,
            width: 1280,
            borderRadius: 16,
            border: `2px solid ${PALETTE.line}55`,
            background: '#0d1522',
            padding: '14px 22px',
            textAlign: 'center',
            opacity: downstreamIn,
          }}
        >
          <Label color={PALETTE.muted} size={12.5}>downstream of all four — reaching for them is the common wasted step</Label>
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.line, marginTop: 8, textDecoration: 'line-through', textDecorationColor: PALETTE.bad, textDecorationThickness: 3 }}>
            Service · networking · EndpointSlices
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>each cause has its own object and status field — the Pod alone cannot tell them apart</Label>
        </div>
      </div>
    </div>
  );
};
