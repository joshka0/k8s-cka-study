import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 10 beat 4 — the two halves of CSI. Left, control plane: four named
 * sidecars watching objects and calling Controller RPCs. Right, node: the
 * privileged plugin running stage and publish. Between them the only
 * connection is the API objects they both touch — PV and VolumeAttachment.
 * No direct arrow between the halves; that absence is the point.
 */

const SIDECARS = [
  { name: 'external-provisioner', watches: 'PVC → CreateVolume', join: 'always' },
  { name: 'external-attacher', watches: 'VolumeAttachment → ControllerPublishVolume', join: 'always' },
  { name: 'external-resizer', watches: 'PVC resized → ControllerExpandVolume', join: 'joins when the feature is installed' },
  { name: 'external-snapshotter', watches: 'VolumeSnapshot → CreateSnapshot', join: 'joins when the feature is installed' },
];

export const CsiTwoHalves: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const leftIn = appear(t, 0.08, 0.18);
  const sidecarOn = SIDECARS.map((_, i) => appear(t, 0.16 + i * 0.09, 0.26 + i * 0.09));
  const objectsIn = appear(t, 0.5, 0.6);
  const rightIn = appear(t, 0.6, 0.7);
  const noArrow = appear(t, 0.72, 0.78);
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
      <div style={{ width: 1620, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>one driver, two halves — they never call each other directly</Label>
        </div>

        {/* LEFT — control-plane half */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 56,
            width: 700,
            borderRadius: 20,
            border: `2px solid ${PALETTE.blue}66`,
            background: `${PALETTE.blue}04`,
            padding: '18px 20px',
            opacity: leftIn,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Label color={PALETTE.blue} size={13.5}>control-plane half — the sidecars</Label>
            <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 800 }}>privileged: no</span>
          </div>
          {SIDECARS.map((s, i) => (
            <div
              key={s.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                borderRadius: 12,
                border: `1px solid ${sidecarOn[i] > 0.5 ? PALETTE.blue : PALETTE.line}`,
                background: '#0d1522',
                padding: '12px 16px',
                marginBottom: 10,
                opacity: Math.max(0.3, sidecarOn[i]),
              }}
            >
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18.5, fontWeight: 900, width: 280, flex: '0 0 280px' }}>
                {s.name}
              </div>
              <div style={{ flex: 1, fontFamily: MONO, color: PALETTE.blue, fontSize: 14.5, fontWeight: 800, lineHeight: 1.35 }}>
                watches {s.watches}
              </div>
            </div>
          ))}
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 6 }}>
            runs once, anywhere — they talk to the storage provider's API
          </div>
        </div>

        {/* the middle — API objects as the only connection */}
        <div
          style={{
            position: 'absolute',
            left: 772,
            top: 190,
            width: 260,
            textAlign: 'center',
            opacity: objectsIn,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900, border: `2px solid ${PALETTE.amber}`, borderRadius: 12, background: `${PALETTE.amber}0c`, padding: '12px 12px', marginBottom: 12 }}>
            PV
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900, border: `2px solid ${PALETTE.amber}`, borderRadius: 12, background: `${PALETTE.amber}0c`, padding: '12px 12px', marginBottom: 12 }}>
            VolumeAttachment
          </div>
          <div
            style={{
              fontFamily: MONO,
              color: PALETTE.amber,
              fontSize: 13.5,
              fontWeight: 800,
              border: `1px dashed ${PALETTE.amber}66`,
              borderRadius: 10,
              padding: '10px 12px',
              opacity: noArrow,
            }}
          >
            the only connection — API objects, not a direct call
          </div>
        </div>

        {/* RIGHT — node half */}
        <div
          style={{
            position: 'absolute',
            right: 60,
            top: 56,
            width: 470,
            borderRadius: 20,
            border: `2px solid ${PALETTE.violet}66`,
            background: `${PALETTE.violet}04`,
            padding: '18px 20px',
            opacity: rightIn,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Label color={PALETTE.violet} size={13.5}>node half — the privileged plugin</Label>
            <span style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 12, fontWeight: 800 }}>privileged: yes</span>
          </div>
          <div style={{ borderRadius: 12, border: `1px solid ${PALETTE.violet}`, background: `${PALETTE.violet}0c`, padding: '14px 16px', marginBottom: 12, boxShadow: `0 0 20px ${PALETTE.violet}22` }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>csi-&lt;driver&gt; nodeplugin</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 4 }}>a DaemonSet — present on every node with storage</div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15.5, fontWeight: 800, borderRadius: 10, border: `1px solid ${PALETTE.line}`, background: '#0d1522', padding: '10px 14px', marginBottom: 10 }}>
            NodeStageVolume <span style={{ color: PALETTE.muted, fontWeight: 700 }}>— once per volume per node</span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15.5, fontWeight: 800, borderRadius: 10, border: `1px solid ${PALETTE.line}`, background: '#0d1522', padding: '10px 14px' }}>
            NodePublishVolume <span style={{ color: PALETTE.muted, fontWeight: 700 }}>— per Pod</span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>
            walks the node's devices and mounts — that is why it runs privileged
          </div>
        </div>

        {/* no arrow between the halves */}
        <div
          style={{
            position: 'absolute',
            left: 1040,
            top: 470,
            width: 300,
            textAlign: 'center',
            fontFamily: MONO,
            color: PALETTE.bad,
            fontSize: 15.5,
            fontWeight: 900,
            opacity: noArrow,
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 900, marginBottom: 4 }}>⌀</div>
          no direct call between the halves — they meet only in the objects
        </div>

        <div style={{ position: 'absolute', left: 60, top: 640, width: 1500, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the two halves are different processes with different privileges and different logs — separate them in your head and in the terminal</Label>
        </div>
      </div>
    </div>
  );
};
