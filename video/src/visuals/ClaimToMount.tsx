import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 10 beat 6 — claim to mount, six steps. One continuous journey
 * filling the stage width, each step marked with the side of the CSI split
 * it belongs to, and the object it produces drawn beneath it. CORRECTION
 * respected: the attach-detach controller creates the VolumeAttachment and
 * the external-attacher watches it; and provisioning does not always precede
 * scheduler involvement — that is Immediate binding only.
 */

const STEPS = [
  {
    name: 'claim created',
    side: 'control-plane',
    color: PALETTE.blue,
    object: 'PVC',
    note: 'a request in the namespace',
  },
  {
    name: 'provisioner creates the volume',
    side: 'control-plane',
    color: PALETTE.blue,
    object: 'PV',
    note: 'scheduler picks the node first when binding is WaitForFirstConsumer — not under Immediate',
  },
  {
    name: 'attach — the attach-detach controller writes it',
    side: 'control-plane',
    color: PALETTE.blue,
    object: 'VolumeAttachment',
    note: 'external-attacher watches it → ControllerPublishVolume',
  },
  {
    name: 'NodeStageVolume on the node',
    side: 'node',
    color: PALETTE.violet,
    object: 'staged device',
    note: 'once per volume per node — the privileged plugin',
  },
  {
    name: 'NodePublishVolume into the Pod target path',
    side: 'node',
    color: PALETTE.violet,
    object: 'bind mount at target',
    note: 'per Pod — the same staged device',
  },
  {
    name: 'container starts',
    side: 'node',
    color: PALETTE.violet,
    object: 'running container',
    note: "the mount is in the Pod's mount namespace",
  },
];

export const ClaimToMount: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const stepOn = STEPS.map((_, i) => appear(t, 0.1 + i * 0.11, 0.2 + i * 0.11));
  const connectorOn = STEPS.map((_, i) => (i === 0 ? 0 : appear(t, 0.14 + (i - 1) * 0.11, 0.2 + i * 0.11)));
  const footer = appear(t, 0.94, 0.98);

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
      <div style={{ width: 1620, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>claim to mount — six steps, one journey, each step producing the object you will inspect</Label>
        </div>

        {/* the legend */}
        <div style={{ position: 'absolute', left: 60, top: 42, display: 'flex', gap: 22, opacity: header }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.muted }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: PALETTE.blue }} /> control-plane half
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.muted }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: PALETTE.violet }} /> node half
          </span>
        </div>

        {/* the six steps */}
        <div style={{ position: 'absolute', left: 40, top: 84, display: 'flex', alignItems: 'flex-start' }}>
          {STEPS.map((s, i) => {
            const on = stepOn[i];
            return (
              <React.Fragment key={s.name}>
                {i > 0 && (
                  <span
                    style={{
                      alignSelf: 'center',
                      margin: '0 8px',
                      fontSize: 22,
                      fontWeight: 900,
                      color: PALETTE.line,
                      opacity: Math.max(0.3, connectorOn[i]),
                    }}
                  >
                    →
                  </span>
                )}
                <div style={{ width: 236, display: 'flex', flexDirection: 'column' }}>
                  {/* the step card */}
                  <div
                    style={{
                      minHeight: 236,
                      borderRadius: 16,
                      border: `2px solid ${on > 0.5 ? s.color : PALETTE.line}`,
                      background: on > 0.5 ? `${s.color}0a` : PALETTE.panel,
                      padding: '14px 16px',
                      opacity: Math.max(0.3, on),
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 11.5,
                        fontWeight: 900,
                        color: s.color,
                        border: `1px solid ${s.color}55`,
                        borderRadius: 999,
                        alignSelf: 'flex-start',
                        padding: '3px 10px',
                        marginBottom: 10,
                      }}
                    >
                      {s.side}
                    </div>
                    <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900, lineHeight: 1.35, marginBottom: 10 }}>
                      {i + 1}. {s.name}
                    </div>
                    <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, lineHeight: 1.4 }}>
                      {s.note}
                    </div>
                  </div>
                  {/* the produced object beneath */}
                  <div
                    style={{
                      marginTop: 12,
                      borderRadius: 10,
                      border: `1px solid ${on > 0.5 ? s.color : PALETTE.line}66`,
                      background: on > 0.5 ? `${s.color}0c` : '#0c111c',
                      padding: '10px 12px',
                      textAlign: 'center',
                      fontFamily: MONO,
                      fontSize: 14,
                      fontWeight: 900,
                      color: PALETTE.ink,
                      opacity: Math.max(0.3, on),
                    }}
                  >
                    {s.object}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>each step's produced object is the artefact in the matching log — six steps, six places to look</Label>
        </div>
      </div>
    </div>
  );
};
