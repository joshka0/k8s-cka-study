import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 25 beat 6 — the shortest EndpointSlice-centred diagnosis. Five
 * ordered checks, each with what it eliminates, ending at the Pod’s own
 * listener. The eligibility step is marked as the one most often skipped —
 * membership and eligibility being different is the module’s core point.
 */

const STEPS = [
  { n: '1', name: 'verify selector membership', eliminates: 'wrong/empty selection removes the Service', color: PALETTE.blue, skip: false },
  { n: '2', name: 'inspect ready · serving · terminating', eliminates: 'unready or terminating members remove themselves', color: PALETTE.cyan, skip: false },
  { n: '3', name: 'check the IP family and the port', eliminates: 'a family or port mismatch removes the address', color: PALETTE.violet, skip: false },
  { n: '4', name: 'apply traffic policy and locality rules to see which endpoints are eligible', eliminates: 'eligibility decides what is actually used — the step most often skipped', color: PALETTE.amber, skip: true },
  { n: '5', name: 'test the Pod’s listener directly', eliminates: 'the Pod’s own listener or policy removes the last explanation', color: PALETTE.good, skip: false },
];

export const SliceDiagnosis: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const stepOn = STEPS.map((_, i) => appear(t, 0.06 + i * 0.12, 0.13 + i * 0.12));
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
          <Label color={PALETTE.cyan} size={13}>the shortest EndpointSlice-centred diagnosis — five ordered steps, each removes one explanation</Label>
        </div>

        {/* column headers */}
        <div style={{ position: 'absolute', left: 130, top: 44, width: 1420, display: 'flex', gap: 20 }}>
          <div style={{ flex: '0 0 60px', fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: 2, color: PALETTE.muted }}>#</div>
          <div style={{ flex: 1.3, fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: 2, color: PALETTE.muted }}>CHECK</div>
          <div style={{ flex: 1, fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: 2, color: PALETTE.muted }}>WHAT IT ELIMINATES</div>
        </div>

        {/* the steps */}
        <div style={{ position: 'absolute', left: 130, top: 74, width: 1420, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map((s, i) => {
            const on = stepOn[i];
            const skip = (s as { skip?: boolean }).skip;
            return (
              <div
                key={s.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  borderRadius: 13,
                  border: `2px solid ${on > 0.5 ? s.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${s.color}08` : '#101826',
                  padding: '12px 18px',
                  opacity: Math.max(0.3, on),
                  position: 'relative',
                }}
              >
                <span style={{ flex: '0 0 44px', fontFamily: MONO, fontSize: 18, fontWeight: 900, color: s.color, border: `1px solid ${s.color}`, borderRadius: 999, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.n}
                </span>
                <div style={{ flex: 1.3, fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, lineHeight: 1.35 }}>{s.name}</div>
                <div style={{ flex: 1, fontFamily: MONO, fontSize: 14.5, fontWeight: 700, color: PALETTE.muted, lineHeight: 1.4 }}>{s.eliminates}</div>
                {skip && (
                  <div style={{ position: 'absolute', top: -16, right: 18, fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.amber, border: `2px solid ${PALETTE.amber}`, borderRadius: 999, background: '#0b111d', padding: '5px 12px' }}>
                    most often skipped
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 606, textAlign: 'center', opacity: appear(t, 0.76, 0.84) }}>
          <Label color={PALETTE.amber} size={13}>membership and eligibility are not the same — step four is where the two diverge</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 686, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>each step removes one explanation — run them in order and the Service story ends at the Pod’s listener</Label>
        </div>
      </div>
    </div>
  );
};
