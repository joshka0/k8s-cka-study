import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 20 beat 7 — it resolves, it still fails. An ordered trace from
 * module 08's style. DNS is marked already passed and greyed — name
 * resolution proved exactly one thing. The real sequence starts where the
 * evidence actually starts: selection, raw backend reachability, translation,
 * policy, and whether the process is listening at all.
 */

const TRACE = [
  { n: '1', step: 'selection', what: 'which backends the Service selects', color: PALETTE.blue },
  { n: '2', step: 'raw backend reachability', what: 'can you reach a backend Pod directly, past the Service', color: PALETTE.cyan },
  { n: '3', step: 'translation', what: 'endpoint / iptables or IPVS rules actually mapping', color: PALETTE.violet },
  { n: '4', step: 'policy', what: 'NetworkPolicy or anything else in the path', color: PALETTE.amber },
  { n: '5', step: 'is the process listening', what: 'the backend process bound at all:port', color: PALETTE.good },
];

export const ResolvesButFails: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const traceIn = appear(t, 0.1, 0.18);
  const stepOn = TRACE.map((_, i) => appear(t, 0.12 + i * 0.08, 0.2 + i * 0.08));
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
          <Label color={PALETTE.cyan} size={13}>a Service name resolves but connections fail — DNS proved name resolution, nothing more</Label>
        </div>

        {/* the greyed, already-passed DNS step */}
        <div style={{ position: 'absolute', left: 300, top: 70, width: 1080, borderRadius: 14, border: `1px solid ${PALETTE.line}44`, background: '#0d1522', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14, filter: 'grayscale(1)', opacity: 0.65 }}>
          <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.good }}>✓ already passed</span>
          <span style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.ink }}>DNS name resolution</span>
          <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: PALETTE.muted }}>— proved exactly one thing; move on</span>
        </div>

        {/* the trace */}
        <div style={{ position: 'absolute', left: 300, top: 170, width: 1080, display: 'flex', flexDirection: 'column', gap: 13, opacity: traceIn }}>
          {TRACE.map((s, i) => {
            const on = stepOn[i];
            return (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 16, borderRadius: 13, border: `2px solid ${on > 0.5 ? s.color : PALETTE.line}55`, background: on > 0.5 ? `${s.color}08` : '#101826', padding: '12px 16px', opacity: Math.max(0.3, on) }}>
                <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 17, fontWeight: 900, color: s.color, border: `1px solid ${s.color}`, borderRadius: 999, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.n}
                </span>
                <span style={{ flex: '0 0 290px', fontFamily: MONO, color: PALETTE.ink, fontSize: 15.5, fontWeight: 900 }}>{s.step}</span>
                <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.muted, lineHeight: 1.35 }}>{s.what}</span>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>each step rules out one layer — and none of them is proved by the step before it</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>resolution is the only thing DNS proved — the failure begins in selection, not resolution</Label>
        </div>
      </div>
    </div>
  );
};
