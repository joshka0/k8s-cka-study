import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 19 beat 6 — and what a budget is not. The four gates from the
 * previous beat, with a PDB drawn deliberately outside that set, attached to
 * the Eviction API request path instead. The things a PDB cannot govern —
 * kernel, power cut, direct delete — pass straight past it.
 */

const GATES = ['scheduling gate', 'readiness gate', 'finalizer', 'Lease'];

export const PdbNotAGate: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const gatesIn = appear(t, 0.08, 0.16);
  const pdbIn = appear(t, 0.2, 0.3);
  const bypassIn = appear(t, 0.34, 0.46);
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
          <Label color={PALETTE.cyan} size={13}>a PDB is not a gate — it restricts a request path, not a transition</Label>
        </div>

        {/* the four gates */}
        <div style={{ position: 'absolute', left: 120, top: 70, width: 1440, borderRadius: 16, border: `2px solid ${PALETTE.line}55`, background: PALETTE.panel, padding: '16px 18px', opacity: gatesIn }}>
          <Label color={PALETTE.muted} size={12} style={{ marginBottom: 10 }}>the four gates from the previous beat — a closed set</Label>
          <div style={{ display: 'flex', gap: 12 }}>
            {GATES.map((g) => (
              <div key={g} style={{ flex: 1, fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '10px 12px', textAlign: 'center' }}>
                {g}
              </div>
            ))}
          </div>
        </div>

        {/* the PDB attached to the Eviction API */}
        <div style={{ position: 'absolute', left: 120, top: 260, width: 1440, display: 'flex', alignItems: 'center', gap: 16, opacity: pdbIn }}>
          <div
            style={{
              width: 420,
              borderRadius: 18,
              border: `3px dashed ${PALETTE.amber}`,
              background: `${PALETTE.amber}06`,
              padding: '18px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 18, fontWeight: 900 }}>PodDisruptionBudget</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
              deliberately outside the gate set — it constrains the Eviction API request path
            </div>
          </div>
          <span style={{ color: PALETTE.amber, fontSize: 24, fontWeight: 900 }}>→</span>
          <div style={{ flex: 1, borderRadius: 14, border: `2px solid ${PALETTE.amber}`, background: `${PALETTE.amber}06`, padding: '18px 22px' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>the Eviction API request path</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
              a PDB limits how many voluntary evictions may proceed — a request-path constraint, not a state gate
            </div>
          </div>
        </div>

        {/* what it cannot govern */}
        <div style={{ position: 'absolute', left: 120, top: 470, width: 1440, borderRadius: 16, border: `2px solid ${PALETTE.bad}40`, background: '#0d1522', padding: '14px 20px', opacity: bypassIn }}>
          <Label color={PALETTE.bad} size={12} style={{ marginBottom: 10 }}>the things a PDB cannot govern — passing straight past it</Label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'nowrap' }}>
            {['the kernel', 'a power cut', 'a direct delete'].map((b) => (
              <div key={b} style={{ flex: 1, fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.line, border: `1px dashed ${PALETTE.bad}55`, borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                <span style={{ color: PALETTE.bad }}>↝</span> {b}
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>it restricts a request path, not a transition — which is why it sits in a different category entirely</Label>
        </div>
      </div>
    </div>
  );
};
