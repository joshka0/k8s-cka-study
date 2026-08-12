import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 19 beat 8 — Pending can have nothing to do with the scheduler. Four
 * investigation steps in order, each with the artefact it reads; the scheduler
 * sits greyed out, uninvolved. The absence of the scheduler from its own
 * Pending reason is the point.
 */

const STEPS = [
  { n: '1', name: 'retry / no progress', read: 'Events — a controller is waiting, not the scheduler', color: PALETTE.blue },
  { n: '2', name: 'inside Pending', read: 'Pod conditions — something in the cluster the scheduler cannot see', color: PALETTE.cyan },
  { n: '3', name: 'gates', read: 'schedulingGates list — a gate is the reason it is held, by design', color: PALETTE.violet },
  { n: '4', name: 'waiting conditions', read: 'waiting reason / container-start — a placement that will not progress', color: PALETTE.amber },
];

export const GatedDiagnosis: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const stepOn = STEPS.map((_, i) => appear(t, 0.08 + i * 0.08, 0.16 + i * 0.08));
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
          <Label color={PALETTE.cyan} size={13}>Pending does not mean "the scheduler is stuck" — it may mean the scheduler is doing nothing, by design</Label>
        </div>

        {/* scheduler greyed out */}
        <div
          style={{
            position: 'absolute',
            right: 160,
            top: 100,
            width: 360,
            borderRadius: 18,
            border: `2px solid ${PALETTE.line}55`,
            background: '#0d1522',
            padding: '18px 22px',
            textAlign: 'center',
            opacity: 1,
            filter: 'grayscale(1)',
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 18, fontWeight: 900 }}>the scheduler</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.line, marginTop: 8, lineHeight: 1.4 }}>
            greyed out — not placing it, not deciding against it, just uninvolved
          </div>
        </div>

        {/* the four investigation steps */}
        <div style={{ position: 'absolute', left: 120, top: 70, width: 900, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {STEPS.map((s, i) => {
            const on = stepOn[i];
            return (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 16, borderRadius: 14, border: `2px solid ${on > 0.5 ? s.color : PALETTE.line}55`, background: on > 0.5 ? `${s.color}08` : '#101826', padding: '13px 18px', opacity: Math.max(0.3, on) }}>
                <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 18, fontWeight: 900, color: s.color, border: `1px solid ${s.color}`, borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.n}
                </span>
                <div style={{ width: 210, flex: '0 0 210px' }}>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15.5, fontWeight: 900 }}>{s.name}</div>
                </div>
                <div style={{ flex: 1, fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, lineHeight: 1.35 }}>{s.read}</div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>read the conditions, the gates and the waiting reason — then the scheduler's silence makes sense</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>Pending with a gate or waiting condition is not scheduling latency — it is a deliberate hold</Label>
        </div>
      </div>
    </div>
  );
};
