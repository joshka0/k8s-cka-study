import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 19 beat 7 — why gating reduces load. Left: an ungated Pod that cannot
 * be placed, cycling through repeated scheduling attempts. Right: the same Pod
 * gated, sitting quietly out of the queue until a controller removes the gate.
 * Attempt counters are shown. The remove-only asymmetry is marked explicitly:
 * gates can be removed after creation but new ones cannot be added later.
 */

export const SchedulingGatesLoad: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const ungatedIn = appear(t, 0.08, 0.16);
  const gatedIn = appear(t, 0.2, 0.3);
  const counters = seg(t, 0.2, 0.62);
  const asymmetry = appear(t, 0.6, 0.72);
  const footer = appear(t, 0.9, 0.97);

  const attempts = Math.min(14, Math.round(counters * 14));

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
          <Label color={PALETTE.cyan} size={13}>gating stops work that cannot succeed from consuming scheduling attempts</Label>
        </div>

        {/* ungated */}
        <div style={{ position: 'absolute', left: 120, top: 70, width: 700, borderRadius: 20, border: `2px solid ${PALETTE.bad}`, background: `${PALETTE.bad}05`, padding: '20px 24px', opacity: ungatedIn }}>
          <Label color={PALETTE.bad} size={12} style={{ marginBottom: 12 }}>ungated — cycling, futile attempts</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.bad}55`, borderRadius: 10, background: '#0d1522', padding: '11px 14px' }}>
            Pod — cannot be placed (prerequisite missing)
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Array.from({ length: Math.min(12, attempts) }).map((_, i) => (
              <span key={i} style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: PALETTE.bad, border: `1px solid ${PALETTE.bad}55`, borderRadius: 6, padding: '3px 6px', background: '#0d1522' }}>
                attempt {i + 1}
              </span>
            ))}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 15, fontWeight: 900, marginTop: 12 }}>
            scheduler keeps retrying → wasted cycles on a busy cluster
          </div>
        </div>

        <div style={{ position: 'absolute', left: 850, top: 240, color: PALETTE.line, fontSize: 36, fontWeight: 900, opacity: gatedIn }}>→</div>

        {/* gated */}
        <div style={{ position: 'absolute', left: 900, top: 70, width: 680, borderRadius: 20, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}05`, padding: '20px 24px', opacity: gatedIn }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 12 }}>gated — quiet, out of the queue</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.good}55`, borderRadius: 10, background: '#0d1522', padding: '11px 14px' }}>
            Pod · schedulingGates: [external-ready]
          </div>
          <div style={{ marginTop: 14, fontFamily: MONO, color: PALETTE.good, fontSize: 14.5, fontWeight: 900, border: `1px solid ${PALETTE.good}55`, borderRadius: 10, background: '#0d1522', padding: '11px 14px' }}>
            attempts: <span style={{ fontSize: 22 }}>0</span> — sitting quietly, not retried
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800, marginTop: 12, lineHeight: 1.4 }}>
            a controller removes the gate once the external prerequisite exists
          </div>
        </div>

        {/* asymmetry */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 470,
            width: 1280,
            borderRadius: 18,
            border: `2px solid ${PALETTE.amber}66`,
            background: `${PALETTE.amber}06`,
            padding: '16px 24px',
            opacity: asymmetry,
          }}
        >
          <Label color={PALETTE.amber} size={12.5} style={{ marginBottom: 8 }}>the remove-only asymmetry</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>
            gates can be <span style={{ color: PALETTE.good }}>removed after creation</span> — but <span style={{ color: PALETTE.bad }}>new ones cannot be added later</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>gating moves the cost of waiting out of the scheduler — on purpose</Label>
        </div>
      </div>
    </div>
  );
};
