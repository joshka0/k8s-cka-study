import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 20 beat 5 — phase names the state, events name the attempt. Four rows
 * as a parallel lookup table, each phase with the small set of causes it
 * implies and the evidence that discriminates them. Four different places to
 * look — not four phases.
 */

const ROWS = [
  {
    phase: 'Pending',
    causes: 'admission · quota · scheduling · claims',
    evidence: 'events + conditions + claims',
    color: PALETTE.blue,
  },
  {
    phase: 'ContainerCreating',
    causes: 'image · sandbox · network · mounts',
    evidence: 'the attempted pulls and mounts',
    color: PALETTE.cyan,
  },
  {
    phase: 'CrashLoopBackOff',
    causes: 'a container failing the restart policy',
    evidence: 'waiting reason + previous lastState',
    color: PALETTE.violet,
  },
  {
    phase: 'Running but not Ready',
    causes: 'readiness · a dependency · endpoint selection',
    evidence: 'readiness probes + endpoints',
    color: PALETTE.amber,
  },
];

export const PhaseVsEvents: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const rowOn = ROWS.map((_, i) => appear(t, 0.08 + i * 0.07, 0.16 + i * 0.07));
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
          <Label color={PALETTE.cyan} size={13}>phase names the state; events name the attempt — four places to look, not four phases</Label>
        </div>

        {/* column headers */}
        <div style={{ position: 'absolute', left: 120, top: 70, width: 1450, display: 'flex', gap: 14 }}>
          <div style={{ flex: '0 0 300px', fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: 2, color: PALETTE.muted }}>PHASE</div>
          <div style={{ flex: 1, fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: 2, color: PALETTE.muted }}>THE CAUSES IT IMPLIES</div>
          <div style={{ flex: 1, fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: 2, color: PALETTE.muted }}>EVIDENCE THAT DISCRIMINATES</div>
        </div>

        {/* the rows */}
        <div style={{ position: 'absolute', left: 120, top: 100, width: 1450, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ROWS.map((r, i) => {
            const on = rowOn[i];
            return (
              <div key={r.phase} style={{ display: 'flex', alignItems: 'center', gap: 14, borderRadius: 14, border: `2px solid ${on > 0.5 ? r.color : PALETTE.line}55`, background: on > 0.5 ? `${r.color}06` : '#101826', padding: '13px 16px', opacity: Math.max(0.3, on) }}>
                <div style={{ flex: '0 0 300px' }}>
                  <div style={{ fontFamily: MONO, color: r.color, fontSize: 18, fontWeight: 900 }}>{r.phase}</div>
                </div>
                <div style={{ flex: 1, fontFamily: MONO, color: PALETTE.ink, fontSize: 15.5, fontWeight: 800, lineHeight: 1.4 }}>{r.causes}</div>
                <div style={{ flex: 1, fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{r.evidence}</div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>each row is a different question with its own evidence — the phase is where you start, not the answer</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>memorise the table, then read the events at one row — that is the lookup you apply live</Label>
        </div>
      </div>
    </div>
  );
};
