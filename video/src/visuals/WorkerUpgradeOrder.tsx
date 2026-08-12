import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 13 beat 6 — the conservative worker-upgrade order. Four ordered steps,
 * each beside the failure it prevents: evacuate (no disruption), change (the
 * actual upgrade), verify (catch a broken node), uncordon (only now accept
 * work). Then the wrong order shown once — uncordon before verify — and the
 * workload landing on an unhealthy node.
 */

const STEPS = [
  { n: '01', verb: 'Evacuate', body: 'drain the node first', prevents: 'prevents: disrupting running workloads', color: PALETTE.blue },
  { n: '02', verb: 'Change', body: 'config · binaries', prevents: 'prevents: nothing — this is the actual upgrade', color: PALETTE.cyan },
  { n: '03', verb: 'Verify', body: 'check the node before trusting it', prevents: 'prevents: handing traffic to a broken node', color: PALETTE.good },
  { n: '04', verb: 'Uncordon', body: 'only now accept work', prevents: 'prevents: serving owners an unchecked node', color: PALETTE.violet },
];

export const WorkerUpgradeOrder: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const stepOn = STEPS.map((_, i) => appear(t, 0.06 + i * 0.08, 0.13 + i * 0.08));
  const wrongIn = appear(t, 0.5, 0.62);
  const crash = seg(t, 0.68, 0.8);
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
          <Label color={PALETTE.cyan} size={13}>the conservative order — each step prevents a specific failure</Label>
        </div>

        {/* the four ordered steps */}
        <div style={{ position: 'absolute', left: 40, top: 70, display: 'flex', gap: 12, alignItems: 'stretch', width: 1600 }}>
          {STEPS.map((s, i) => {
            const on = stepOn[i];
            return (
              <div
                key={s.n}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  border: `2px solid ${on > 0.5 ? s.color : PALETTE.line}`,
                  background: on > 0.5 ? `${s.color}0c` : PALETTE.panel,
                  padding: '16px 18px',
                  opacity: Math.max(0.3, on),
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: s.color }}>{s.n}</span>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 21, fontWeight: 900, marginTop: 8 }}>{s.verb}</div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 4 }}>{s.body}</div>
                <div style={{ flex: 1 }} />
                <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.good, marginTop: 12, lineHeight: 1.3 }}>{s.prevents}</div>
              </div>
            );
          })}
        </div>

        {/* the wrong order, once */}
        <div
          style={{
            position: 'absolute',
            left: 160,
            top: 330,
            width: 1360,
            borderRadius: 18,
            border: `2px solid ${PALETTE.bad}77`,
            background: `${PALETTE.bad}06`,
            padding: '20px 26px',
            opacity: wrongIn,
          }}
        >
          <Label color={PALETTE.bad} size={12.5} style={{ marginBottom: 16 }}>the wrong order — uncordon before verify</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'nowrap' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>evacuate</span>
            <span style={{ color: PALETTE.line, fontWeight: 900 }}>→</span>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>change</span>
            <span style={{ color: PALETTE.line, fontWeight: 900 }}>→</span>
            <span
              style={{
                fontFamily: MONO,
                color: PALETTE.bad,
                fontSize: 16,
                fontWeight: 900,
                border: `2px solid ${PALETTE.bad}`,
                borderRadius: 10,
                padding: '8px 14px',
                background: `${PALETTE.bad}0c`,
              }}
            >
              uncordon
            </span>
            <span style={{ color: PALETTE.line, fontWeight: 900 }}>→</span>
            <span
              style={{
                fontFamily: MONO,
                color: PALETTE.good,
                fontSize: 16,
                fontWeight: 900,
                border: `1px solid ${PALETTE.good}66`,
                borderRadius: 10,
                padding: '8px 14px',
              }}
            >
              verify (too late)
            </span>
            <span style={{ flex: 1 }} />
            <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 15, fontWeight: 900, textAlign: 'right', lineHeight: 1.45, opacity: 0.85 + 0.15 * crash }}>
              workload lands on an<br />unhealthy node
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>restoring scheduling before verifying is how you hand traffic to a node nobody has checked</Label>
        </div>
      </div>
    </div>
  );
};
