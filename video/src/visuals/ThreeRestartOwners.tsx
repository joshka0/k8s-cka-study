import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 26 beat 1 — three owners, three objects. The kubelet restarts a
 * container inside an existing Pod; a workload controller creates a
 * replacement Pod when desired replicas are missing; the Job controller
 * counts completions and failures. The object boundary each one acts on is
 * the discriminator.
 */

const OWNERS = [
  {
    name: 'kubelet',
    acts: 'a container inside an existing Pod',
    boundary: 'inside the Pod — same sandbox, same UID',
    how: 'according to the restart policy',
    color: PALETTE.violet,
  },
  {
    name: 'workload controller',
    acts: 'a Pod, inside a ReplicaSet',
    boundary: 'the Pod object — a new object, a new UID',
    how: 'when desired replicas are missing',
    color: PALETTE.blue,
  },
  {
    name: 'Job controller',
    acts: 'Pods in the Job’s completion accounting',
    boundary: 'the accounting — decided by completions & failures',
    how: 'whether more Pods are needed at all',
    color: PALETTE.good,
  },
];

export const ThreeRestartOwners: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const colOn = OWNERS.map((_, i) => appear(t, 0.08 + i * 0.14, 0.16 + i * 0.14));
  const footer = appear(t, 0.86, 0.94);

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
          <Label color={PALETTE.cyan} size={13}>three different things restart, and they act on different objects</Label>
        </div>

        {/* the three columns */}
        <div style={{ position: 'absolute', left: 80, top: 48, width: 1520, display: 'flex', gap: 20 }}>
          {OWNERS.map((o, i) => {
            const on = colOn[i];
            return (
              <div key={o.name} style={{ flex: 1, opacity: on, transform: `translateY(${(1 - on) * -14}px)` }}>
                <Box pad={16} borderColor={o.color} style={{ minHeight: 420 }}>
                  <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 900, color: o.color, marginBottom: 14 }}>{o.name}</div>

                  <Label color={PALETTE.muted} size={10.5}>restarts / decides</Label>
                  <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.ink, marginTop: 5, lineHeight: 1.4 }}>{o.acts}</div>

                  <div
                    style={{
                      marginTop: 16,
                      borderRadius: 10,
                      border: `1px solid ${o.color}55`,
                      background: `${o.color}08`,
                      padding: '12px 14px',
                    }}
                  >
                    <Label color={o.color} size={10.5}>object boundary</Label>
                    <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.ink, marginTop: 5, lineHeight: 1.4 }}>
                      {o.boundary}
                    </div>
                  </div>

                  <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted, lineHeight: 1.4 }}>
                    {`decided by → ${o.how}`}
                  </div>
                </Box>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: appear(t, 0.66, 0.74) }}>
          <Label color={PALETTE.amber} size={13}>the boundary each one crosses is the discriminator — asking which object is being restarted answers most of the question</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>container · Pod · Job accounting — three owners, three different objects to look at</Label>
        </div>
      </div>
    </div>
  );
};
