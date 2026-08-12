import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 23 beat 1 — two state machines. The packaging tool (Kustomize/Helm)
 * moves through render and release states; the cluster moves through
 * admission, storage and reconciliation. The handoff is a one-way boundary —
 * nothing after it reports back into the release record. One of them knows
 * whether your application works, and it is not the release tool.
 */

const PACK = [
  { name: 'render', detail: 'Kustomize overlays · Helm renders a chart', color: PALETTE.blue },
  { name: 'release', detail: 'Helm tracks release metadata · waits / hooks', color: PALETTE.cyan },
];

const CLUSTER = [
  { name: 'admission', detail: 'mutate · validate · quota', color: PALETTE.amber },
  { name: 'storage', detail: 'the object persisted', color: PALETTE.violet },
  { name: 'reconciliation', detail: 'controllers converge it — the only machine that knows if the app works', color: PALETTE.good },
];

export const TwoStateMachines: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const packIn = appear(t, 0.08, 0.16);
  const stateOn = (i: number) => appear(t, 0.14 + i * 0.08, 0.22 + i * 0.08);
  const clusterIn = appear(t, 0.4, 0.48);
  const handoff = seg(t, 0.36, 0.5);
  const noReport = appear(t, 0.72, 0.8);
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
      <div style={{ width: 1680, height: 740, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>release orchestration and runtime convergence are two separate state machines</Label>
        </div>

        {/* machine one: packaging tool */}
        <div style={{ position: 'absolute', left: 100, top: 58, width: 620, opacity: packIn }}>
          <Box pad={14} borderColor={PALETTE.blue} style={{ textAlign: 'center' }}>
            <Label color={PALETTE.blueInk} size={11.5} style={{ marginBottom: 14 }}>machine one · the packaging tool</Label>
            {PACK.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, borderRadius: 10, border: `1px solid ${p.color}55`, background: `${p.color}06`, padding: '12px 14px', opacity: stateOn(i) }}>
                <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: p.color }}>{p.name}</span>
                <span style={{ flex: 1, textAlign: 'left', fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.muted }}>{p.detail}</span>
              </div>
            ))}
            <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted, textAlign: 'center' }}>
              neither tool becomes the continuous controller for your application
            </div>
          </Box>
        </div>

        {/* one-way handoff */}
        <div style={{ position: 'absolute', left: 744, top: 260, textAlign: 'center', opacity: handoff }}>
          <div style={{ fontFamily: MONO, fontSize: 30, fontWeight: 900, color: PALETTE.good }}>⇉</div>
          <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 900, color: PALETTE.good }}>objects accepted</div>
        </div>

        {/* machine two: the cluster */}
        <div style={{ position: 'absolute', left: 880, top: 58, width: 700, opacity: clusterIn }}>
          <Box pad={14} borderColor={PALETTE.good} style={{ textAlign: 'center' }}>
            <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 14 }}>machine two · the cluster</Label>
            {CLUSTER.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, borderRadius: 10, border: `1px solid ${c.color}55`, background: `${c.color}06`, padding: '12px 14px', opacity: stateOn(i + 2) }}>
                <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: c.color, width: 150 }}>{c.name}</span>
                <span style={{ flex: 1, textAlign: 'left', fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.muted }}>{c.detail}</span>
              </div>
            ))}
            <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 900, color: PALETTE.amber, textAlign: 'center' }}>
              only this machine knows whether your application works
            </div>
          </Box>
        </div>

        {/* nothing reports back */}
        <div
          style={{
            position: 'absolute',
            left: 880,
            top: 486,
            width: 700,
            borderRadius: 14,
            border: `2px dashed ${PALETTE.bad}66`,
            background: `${PALETTE.bad}06`,
            padding: '14px 18px',
            textAlign: 'center',
            opacity: noReport,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.bad, textDecoration: 'line-through', textDecorationThickness: 3 }}>
            a successful release proving the workload is healthy
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.muted, marginTop: 8 }}>
            nothing after the handoff reports back into the release record
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the release tool knows it shipped; the cluster knows whether it ran — read the second one</Label>
        </div>
      </div>
    </div>
  );
};
