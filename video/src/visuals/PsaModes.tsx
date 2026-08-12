import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 27 beat 1 — three modes, one blocks. The same violating Pod
 * submitted to three namespaces, one per PSA mode: enforce rejects, audit
 * creates with an audit record, warn creates with a client warning. Two of
 * the three still create the Pod — only enforce blocks anything.
 */

const MODES = [
  {
    name: 'enforce',
    label: 'enforce=restricted',
    outcome: 'rejected — Forbidden',
    detail: 'the only mode that blocks creation',
    creates: false,
    color: PALETTE.bad,
  },
  {
    name: 'audit',
    label: 'audit=restricted',
    outcome: 'created + audit record',
    detail: 'records the violation in the audit log',
    creates: true,
    color: PALETTE.cyan,
  },
  {
    name: 'warn',
    label: 'warn=restricted',
    outcome: 'created + client warning',
    detail: 'tells you about the violation, accepts it anyway',
    creates: true,
    color: PALETTE.amber,
  },
];

export const PsaModes: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const podIn = appear(t, 0.06, 0.12);
  const modeIn = seg(t, 0.16, 0.3);
  const outcomeOn = MODES.map((_, i) => appear(t, 0.3 + i * 0.14, 0.38 + i * 0.14));
  const footer = appear(t, 0.9, 0.96);

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
          <Label color={PALETTE.cyan} size={13}>the same violating Pod, three modes — only enforce blocks anything</Label>
        </div>

        {/* the single violating pod */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', opacity: podIn }}>
          <div style={{ display: 'inline-block', fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink, border: `2px solid ${PALETTE.amber}`, borderRadius: 12, background: `${PALETTE.amber}0a`, padding: '10px 22px' }}>
            one violating Pod — same spec, submitted three ways
          </div>
        </div>

        {/* the three namespaces */}
        <div style={{ position: 'absolute', left: 90, top: 110, width: 1500, display: 'flex', gap: 20 }}>
          {MODES.map((m, i) => {
            const on = Math.max(0.3, outcomeOn[i]);
            return (
              <div
                key={m.name}
                style={{
                  flex: 1,
                  borderRadius: 18,
                  border: `2px solid ${m.color}66`,
                  background: `${m.color}06`,
                  padding: '18px 20px',
                  opacity: on,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 900, color: m.color }}>{m.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.muted, marginTop: 4 }}>namespace label: {m.label}</div>
                </div>
                <div
                  style={{
                    marginTop: 16,
                    borderRadius: 12,
                    border: `2px solid ${m.creates ? PALETTE.good : PALETTE.bad}`,
                    background: m.creates ? `${PALETTE.good}0c` : `${PALETTE.bad}0c`,
                    padding: '16px 14px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: m.creates ? PALETTE.good : PALETTE.bad }}>
                    {m.creates ? '✓ ' : '✕ '}{m.outcome}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: PALETTE.muted, marginTop: 6 }}>{m.detail}</div>
                  {m.creates && (
                    <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 900, color: PALETTE.good, marginTop: 10 }}>
                      Pod created
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* the key point */}
        <div
          style={{
            position: 'absolute',
            left: 90,
            top: 520,
            width: 1500,
            borderRadius: 14,
            border: `2px solid ${PALETTE.amber}`,
            background: `${PALETTE.amber}0a`,
            padding: '14px 20px',
            textAlign: 'center',
            opacity: appear(t, 0.78, 0.86),
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink }}>
            two of the three still create the Pod — only enforce blocks anything
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.amber, marginTop: 6 }}>
            a namespace labelled warn is telling you about violations while accepting every one of them
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>variants of “not blocking” — only enforce changes what gets stored</Label>
        </div>
      </div>
    </div>
  );
};
