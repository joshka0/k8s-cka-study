import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 19 beat 5 — each gate blocks its own transition. A Pod's lifecycle
 * drawn as transitions, with each gate placed exactly where it blocks:
 * scheduling gate before scheduling, readiness gate before Ready and endpoint
 * membership, finalizer after the deletion timestamp, and the Lease standing
 * beside them governing leadership rather than a Pod. Four distinct positions
 * — that placement is the teaching.
 */

const GATES = [
  { name: 'scheduling gate', pos: 'before scheduling', at: 'pod.spec.schedulingGates', color: PALETTE.blue },
  { name: 'readiness gate', pos: 'before Ready + endpoints', at: 'readinessGate conditions', color: PALETTE.cyan },
  { name: 'finalizer', pos: 'after deletion timestamp', at: 'annotations finalizers', color: PALETTE.amber },
  { name: 'Lease', pos: 'beside — governs leadership, not a Pod', at: 'a separate object', color: PALETTE.violet },
];

export const FourGates: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const stageOn = { 0: appear(t, 0.08, 0.14), 1: appear(t, 0.16, 0.22), 2: appear(t, 0.24, 0.3) };
  const gateOn = GATES.map((_, i) => appear(t, 0.12 + i * 0.07, 0.18 + i * 0.07));
  const footer = appear(t, 0.9, 0.97);

  const STAGES = ['created', 'scheduled', 'running / Ready', 'deleted'];

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
      <div style={{ width: 1700, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>four mechanisms, four different transitions — each gate sits at exactly one place</Label>
        </div>

        {/* the lifecycle line */}
        <div style={{ position: 'absolute', left: 60, top: 90, width: 1580, display: 'flex', alignItems: 'center', gap: 10 }}>
          {STAGES.map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <span style={{ color: PALETTE.line, fontSize: 22, fontWeight: 900 }}>→</span>}
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 15.5,
                  fontWeight: 900,
                  color: PALETTE.ink,
                  border: `1px solid ${stageOn[i as 0 | 1 | 2] ? PALETTE.line : PALETTE.line}55`,
                  borderRadius: 10,
                  background: stageOn[i as 0 | 1 | 2] ? PALETTE.panel : '#0d1522',
                  padding: '12px 16px',
                  opacity: 0.85,
                }}
              >
                {s}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* the gates, each at its position */}
        <div style={{ position: 'absolute', left: 60, top: 260, width: 1580, borderTop: `2px dashed ${PALETTE.line}`, paddingTop: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {GATES.map((g, i) => {
              const on = gateOn[i];
              return (
                <div
                  key={g.name}
                  style={{
                    borderRadius: 16,
                    border: `2px solid ${on > 0.5 ? g.color : PALETTE.line}`,
                    background: on > 0.5 ? `${g.color}08` : '#101826',
                    padding: '16px 18px',
                    opacity: Math.max(0.3, on),
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 900, color: on > 0.5 ? g.color : PALETTE.line }}>⬤</span>
                    <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>{g.name}</div>
                  </div>
                  <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 13.5, fontWeight: 800, marginTop: 10 }}>blocks — {g.pos}</div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6, lineHeight: 1.4 }}>{g.at}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 14, fontWeight: 800, marginTop: 18, textAlign: 'center' }}>
            none of them substitutes for another — a scheduling gate is not a readiness gate, and a finalizer is neither
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the placement is the teaching: each gate holds back exactly one transition</Label>
        </div>
      </div>
    </div>
  );
};
