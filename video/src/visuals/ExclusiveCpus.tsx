import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 16 beat 3 — who gets exclusive CPUs. Under the static CPU Manager
 * policy, exclusive CPUs are an exact rule, not a priority: a container
 * qualifies only if the Pod is Guaranteed AND the CPU request is a whole
 * number. Two Guaranteed Pods side by side — one with a whole-number request
 * gets a cpuset, one with a fraction stays in the shared pool. The QoS class is
 * the same for both; it is not what decides it.
 */

export const ExclusiveCpus: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const wholeIn = appear(t, 0.1, 0.2);
  const fracIn = appear(t, 0.24, 0.34);
  const sharedIn = appear(t, 0.4, 0.5);
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
      <div style={{ width: 1660, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>exclusive CPUs are an exact rule, not a priority — Guaranteed is necessary, but not enough</Label>
        </div>

        {/* the rule */}
        <div
          style={{
            position: 'absolute',
            left: 300,
            top: 56,
            width: 1060,
            borderRadius: 14,
            border: `2px solid ${PALETTE.good}55`,
            background: `${PALETTE.good}06`,
            padding: '12px 20px',
            textAlign: 'center',
            opacity: header,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.ink }}>
            <span style={{ color: PALETTE.good }}>Guaranteed</span> AND a whole-number CPU request → a dedicated cpuset
          </span>
        </div>

        {/* the whole-cpu pod */}
        <div style={{ position: 'absolute', left: 130, top: 150, width: 660, borderRadius: 20, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}06`, padding: '20px 24px', opacity: wholeIn }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>Pod A — Guaranteed</span>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 800, color: PALETTE.good, border: `1px solid ${PALETTE.good}66`, borderRadius: 999, padding: '4px 10px' }}>QoS: Guaranteed</span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800, marginTop: 6 }}>cpu: 2 (a whole number)</div>
          <div style={{ marginTop: 14, borderRadius: 10, border: `1px solid ${PALETTE.good}55`, background: '#0d1522', padding: '10px 12px' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 11.5, fontWeight: 700 }}>cpuset →</div>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 15, fontWeight: 900, marginTop: 4 }}>
              [0-1] dedicated — pinned, exclusive
            </div>
          </div>
        </div>

        {/* the fractional pod */}
        <div style={{ position: 'absolute', left: 870, top: 150, width: 660, borderRadius: 20, border: `2px solid ${PALETTE.amber}`, background: `${PALETTE.amber}06`, padding: '20px 24px', opacity: fracIn }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>Pod B — Guaranteed too</span>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 800, color: PALETTE.good, border: `1px solid ${PALETTE.good}66`, borderRadius: 999, padding: '4px 10px' }}>QoS: Guaranteed</span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800, marginTop: 6 }}>cpu: 500m (a fraction)</div>
          <div style={{ marginTop: 14, borderRadius: 10, border: `1px solid ${PALETTE.amber}55`, background: '#0d1522', padding: '10px 12px' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 11.5, fontWeight: 700 }}>no cpuset →</div>
            <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 15, fontWeight: 900, marginTop: 4 }}>
              left in the shared pool with everything else
            </div>
          </div>
        </div>

        {/* the shared pool */}
        <div style={{ position: 'absolute', left: 200, top: 430, width: 1260, borderRadius: 16, border: `2px solid ${PALETTE.line}55`, background: '#0d1522', padding: '14px 20px', textAlign: 'center', opacity: sharedIn }}>
          <Label color={PALETTE.muted} size={12} style={{ marginBottom: 10 }}>the shared pool — for every fractional request, however important the workload</Label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'nowrap' }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} style={{ fontFamily: MONO, fontSize: 12, fontWeight: 800, color: PALETTE.line, border: `1px solid ${PALETTE.line}`, borderRadius: 6, padding: '6px 8px', background: `${PALETTE.line}0d` }}>
                {i}
              </span>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>both are Guaranteed — the class does not decide it. The exact whole-number rule does</Label>
        </div>
      </div>
    </div>
  );
};
