import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Horizontal, Label, MONO, SANS } from '../ui';
import type { Beat } from '../script';
import { appear, seg } from '../motion';

const SPINE = [
  'request', 'gates', 'etcd', 'controllers', 'scheduler', 'binding', 'node',
  'sandbox', 'cni', 'images', 'probes', 'endpoints', 'data plane', 'packet',
];

const SYMPTOMS = [
  { title: 'Pod Pending', text: 'never got past scheduling', range: [4], color: PALETTE.bad, note: 'filter → compare requests vs allocatable · read scheduler events' },
  { title: 'ContainerCreating, network error', text: 'runtime executes the plugin', range: [7, 8], color: PALETTE.amber, note: 'check runtime logs, not kubelet · did IPAM run out of addresses?' },
  { title: 'Running but no traffic', text: 'readiness → EndpointSlice → selector', range: [10, 11], color: PALETTE.cyan, note: 'readiness, EndpointSlice membership, then the service selector' },
  { title: 'DNS resolves, connection times out', text: 'ready backends first, then hit a pod IP', range: [11, 12], color: PALETTE.violet, note: 'separate Service translation from the workload' },
];

export const FailureMap: React.FC<{ beat: Beat }> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const spineBuild = appear(t, 0.06, 0.24);
  const appearAt = (i: number) => 0.2 + i * 0.15;
  const appeared = (i: number) => t >= appearAt(i);
  const cardOpacity = (i: number) => appear(t, appearAt(i), appearAt(i) + 0.06);

  // current active symptom for bracket emphasis (latest appeared)
  let activeIdx = -1;
  for (let i = SYMPTOMS.length - 1; i >= 0; i--) if (appeared(i)) { activeIdx = i; break; }

  const slot = 1768 / SPINE.length;

  const stageHot = (j: number) => {
    for (let i = 0; i < SYMPTOMS.length; i++) {
      if (appeared(i) && SYMPTOMS[i].range.includes(j)) return true;
    }
    return false;
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* compact spine along the top */}
      <div style={{ opacity: spineBuild, paddingTop: 16 }}>
        <Horizontal center gap={4} style={{ justifyContent: 'center', flexWrap: 'nowrap' }}>
          {SPINE.map((s, j) => {
            const hot = stageHot(j);
            return (
              <div
                key={s}
                style={{
                  width: slot - 4,
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: hot ? 900 : 700,
                  textAlign: 'center',
                  color: hot ? PALETTE.ink : PALETTE.line,
                  background: hot ? `${PALETTE.blue}24` : 'transparent',
                  borderBottom: hot ? `3px solid ${PALETTE.blue}` : '3px solid #16202f',
                  paddingBottom: 5,
                  whiteSpace: 'nowrap',
                }}
              >
                {s}
              </div>
            );
          })}
        </Horizontal>
      </div>

      {/* symptom cards */}
      <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14, padding: '0 40px' }}>
        {SYMPTOMS.map((sym, i) => {
          const isActive = i === activeIdx;
          const dimOthers = appeared(i) && !isActive && i !== SYMPTOMS.length - 1 && activeIdx > i;
          return (
            <div
              key={sym.title}
              style={{
                opacity: cardOpacity(i) * (dimOthers ? 0.35 : 1),
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '12px 18px',
                border: `1px solid ${isActive ? sym.color : PALETTE.line}`,
                borderRadius: 16,
                background: isActive ? `${sym.color}12` : '#0e1522',
                width: 1680,
                margin: '0 auto',
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  color: sym.color,
                  fontSize: 16,
                  fontWeight: 900,
                  borderLeft: `4px solid ${sym.color}`,
                  paddingLeft: 12,
                  minWidth: 260,
                }}
              >
                {sym.title}
              </span>
              <span style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 16, minWidth: 330 }}>
                {sym.text}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 15, color: isActive ? sym.color : PALETTE.muted }}>
                stage{sym.range.length > 1 ? `s ${sym.range[0] + 1}–${sym.range[1] + 1}` : ` ${sym.range[0] + 1}`}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 14, color: PALETTE.muted, flex: 1, textAlign: 'right' }}>
                {isActive ? sym.note : sym.note.slice(0, 40) + '…'}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: appear(t, 0.88, 1) }}>
        <Label color={PALETTE.amber} size={13}>same symptom class · four different subsystems · the spine tells them apart</Label>
      </div>
    </div>
  );
};
