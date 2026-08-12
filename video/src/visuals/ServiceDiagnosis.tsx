import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 15 beat 6 — diagnosing in order. A Service times out; move from
 * identity outward. Each step lights as named, with what a failure at that
 * step would prove. The direct-to-Pod test is the split point between a
 * Service problem and a Pod problem. Rows wrap rather than clip.
 */

const STEPS = [
  { n: '01', title: 'Confirm the Service and its selector', check: 'kubectl get svc · describe · spec.selector', proves: 'wrong selector → no endpoints at all', color: PALETTE.blue, split: false },
  { n: '02', title: 'Confirm the EndpointSlices actually contain ready backends', check: 'kubectl get endpointslices -l kubernetes.io/service-name=<svc>', proves: 'empty or not-ready backends → readiness / endpoints', color: PALETTE.cyan, split: false },
  { n: '03', title: 'Test a Pod address and port directly', check: 'curl <pod-ip>:<port> from a compatible client', proves: 'works → Service layer · fails → Pod layer', color: PALETTE.good, split: true },
  { n: '04', title: 'Inspect translation and data plane for the Service', check: 'kube-proxy / eBPF rules for the Service', proves: 'translation not programmed → Service routing', color: PALETTE.violet, split: false },
  { n: '05', title: 'Look at policy and the Pod path', check: 'NetworkPolicy · routes · the Pod is actually bound and ready', proves: 'policy or node path → the last layer', color: PALETTE.amber, split: false },
];

export const ServiceDiagnosis: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const stepOn = STEPS.map((_, i) => appear(t, 0.08 + i * 0.1, 0.16 + i * 0.1));
  const footer = appear(t, 0.94, 0.98);

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
          <Label color={PALETTE.cyan} size={13}>a Service times out — move from identity outward, changing one layer at a time</Label>
        </div>

        {STEPS.map((s, i) => {
          const on = stepOn[i];
          const split = s.split;
          return (
            <div
              key={s.n}
              style={{
                position: 'absolute',
                left: 60,
                top: 52 + i * 128,
                width: 1540,
                minHeight: 112,
                borderRadius: 16,
                border: `2px solid ${split ? s.color : s.color}55`,
                background: split ? `${s.color}0d` : `${s.color}05`,
                boxShadow: split ? `0 0 26px ${s.color}33` : 'none',
                padding: '14px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                opacity: Math.max(0.3, on),
              }}
            >
              <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 20, fontWeight: 900, color: s.color, border: `1px solid ${s.color}`, borderRadius: 10, padding: '5px 11px' }}>
                {s.n}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, lineHeight: 1.3 }}>{s.title}</div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 6, lineHeight: 1.35 }}>{s.check}</div>
              </div>
              <div style={{ flex: '0 0 360px', fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: split ? PALETTE.cyan : PALETTE.amber, border: `1px solid ${split ? s.color : PALETTE.amber}55`, borderRadius: 12, background: '#0c111c', padding: '10px 15px', lineHeight: 1.4 }}>
                failure proves: {s.proves}
              </div>
              {split && (
                <span
                  style={{
                    position: 'absolute',
                    left: 90,
                    top: -16,
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 900,
                    color: PALETTE.good,
                    border: `2px solid ${PALETTE.good}`,
                    borderRadius: 999,
                    background: '#0b111d',
                    padding: '4px 12px',
                  }}
                >
                  the split point — one test divides Service from Pod
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
