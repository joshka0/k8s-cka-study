import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 24 beat 7 — proving a live resize took effect. Three checks, each
 * with the field it reads: desired in the spec, applied in resource status,
 * and the resize condition for deferred/infeasible. Two outcomes — all three
 * agree, or a mismatch localised to a specific step. The mismatch case is the
 * more prominent, because it is the reason to check at all.
 */

const CHECKS = [
  {
    n: '1',
    name: 'compare desired resources',
    field: 'spec.containers[].resources',
    color: PALETTE.good,
  },
  {
    n: '2',
    name: 'read allocated & applied status',
    field: 'status.containerStatuses[].resources',
    color: PALETTE.cyan,
  },
  {
    n: '3',
    name: 'check the resize condition',
    field: 'status.conditions — ResizePending / Infeasible',
    color: PALETTE.violet,
  },
];

export const ProveResize: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const checkOn = CHECKS.map((_, i) => appear(t, 0.06 + i * 0.09, 0.13 + i * 0.09));
  const agree = appear(t, 0.42, 0.5);
  const mismatch = appear(t, 0.56, 0.66);
  const footer = appear(t, 0.86, 0.93);

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
      <div style={{ width: 1680, height: 750, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>proving a live resize took effect — three checks, each with the field it reads</Label>
        </div>

        {/* the three checks */}
        <div style={{ position: 'absolute', left: 130, top: 44, width: 1420, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CHECKS.map((c, i) => {
            const on = checkOn[i];
            return (
              <div
                key={c.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  borderRadius: 12,
                  border: `2px solid ${on > 0.5 ? c.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${c.color}08` : '#101826',
                  padding: '12px 18px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: c.color, border: `1px solid ${c.color}`, borderRadius: 999, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {c.n}
                </span>
                <div style={{ flex: 1, fontFamily: MONO, fontSize: 16.5, fontWeight: 900, color: PALETTE.ink }}>{c.name}</div>
                <div style={{ flex: 1, fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.muted, lineHeight: 1.4 }}>{c.field}</div>
              </div>
            );
          })}
        </div>

        {/* outcome: agree */}
        <div style={{ position: 'absolute', left: 130, top: 292, width: 1420, borderRadius: 14, border: `2px solid ${PALETTE.good}66`, background: `${PALETTE.good}06`, padding: '14px 20px', opacity: agree }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20, color: PALETTE.good, fontWeight: 900 }}>✓</span>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.good }}>all three agree</div>
              <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 3 }}>
                desired = applied = no deferred condition → the change is real
              </div>
            </div>
          </div>
        </div>

        {/* outcome: mismatch — more prominent */}
        <div
          style={{
            position: 'absolute',
            left: 130,
            top: 360,
            width: 1420,
            borderRadius: 16,
            border: `2px solid ${PALETTE.bad}`,
            background: `${PALETTE.bad}0a`,
            padding: '18px 22px',
            opacity: mismatch,
            boxShadow: mismatch > 0 ? `0 0 30px ${PALETTE.bad}22` : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 22, color: PALETTE.bad, fontWeight: 900 }}>✕</span>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: PALETTE.bad }}>a mismatch — localised to a specific step</div>
              <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 3 }}>
                this is the reason to check at all
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ borderRadius: 12, border: `1px solid ${PALETTE.good}66`, background: '#0d1522', padding: '12px 14px' }}>
              <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.good }}>spec</div>
              <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, marginTop: 4 }}>2 Gi <span style={{ color: PALETTE.good }}>✓ changed</span></div>
            </div>
            <div style={{ borderRadius: 12, border: `2px solid ${PALETTE.bad}66`, background: '#0d1522', padding: '12px 14px', boxShadow: `0 0 14px ${PALETTE.bad}18` }}>
              <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.bad }}>applied status</div>
              <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, marginTop: 4 }}>1 Gi <span style={{ color: PALETTE.bad }}>✕ still old → stopped here</span></div>
            </div>
            <div style={{ borderRadius: 12, border: `1px solid ${PALETTE.line}`, background: '#0d1522', padding: '12px 14px' }}>
              <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.muted }}>condition</div>
              <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, marginTop: 4 }}>ResizePending</div>
            </div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.amber, marginTop: 12 }}>
            the mismatch is localised to step two — the applied status says the cgroup never changed
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 668, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>if the three agree the change is real · if they do not, you have found where it stopped</Label>
        </div>
      </div>
    </div>
  );
};
