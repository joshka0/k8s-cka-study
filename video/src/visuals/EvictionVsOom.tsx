import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 14 beat 6 — kubelet eviction, kernel OOM. Two paths from the same
 * memory pressure, kept clearly apart. Kubernetes path: the kubelet ranks
 * candidates, evicts, marks the Pod Failed so a controller can replace it.
 * Kernel path: the OOM killer selects a container and kills it; the restart
 * policy applies. Different actor, different resulting object state, different
 * log. Never merged into one arrow.
 */

export const EvictionVsOom: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const pressureIn = appear(t, 0.06, 0.14);
  const kubePath = appear(t, 0.16, 0.24);
  const kernelPath = appear(t, 0.16, 0.24);
  const kubeStep2 = appear(t, 0.3, 0.4);
  const kernelStep2 = appear(t, 0.3, 0.4);
  const kubeStep3 = appear(t, 0.42, 0.52);
  const kernelStep3 = appear(t, 0.42, 0.52);
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
          <Label color={PALETTE.cyan} size={13}>same memory pressure — two mechanisms, two actors, two resulting states</Label>
        </div>

        {/* shared pressure at top */}
        <div
          style={{
            position: 'absolute',
            left: 620,
            top: 56,
            borderRadius: 14,
            border: `2px solid ${PALETTE.bad}`,
            background: `${PALETTE.bad}0a`,
            padding: '10px 22px',
            textAlign: 'center',
            opacity: pressureIn,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>memory pressure</div>
        </div>

        {/* left: the Kubernetes path */}
        <div style={{ position: 'absolute', left: 120, top: 170, width: 660, borderRadius: 18, border: `2px solid ${PALETTE.blue}`, background: `${PALETTE.blue}08`, padding: '18px 20px', opacity: kubePath }}>
          <Label color={PALETTE.blueInk} size={12.5} style={{ marginBottom: 12 }}>the Kubernetes path — kubelet node-pressure eviction</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: MONO, fontSize: 14.5, fontWeight: 800 }}>
            <div style={{ borderRadius: 10, border: `1px solid ${PALETTE.blue}55`, background: '#0d1522', padding: '9px 12px' }}>
              an actor above the kernel: the kubelet ranks candidates
            </div>
            <div style={{ borderRadius: 10, border: `1px solid ${PALETTE.blue}55`, background: '#0d1522', padding: '9px 12px', opacity: kubeStep2 }}>
              by usage over requests → Priority → relative excess
            </div>
            <div style={{ borderRadius: 10, border: `1px solid ${PALETTE.blue}55`, background: '#0d1522', padding: '9px 12px', opacity: kubeStep3 }}>
              evicts → Pod marked <span style={{ color: PALETTE.amber, fontWeight: 900 }}>Failed</span> → a controller can replace it
            </div>
          </div>
        </div>

        {/* right: the kernel path */}
        <div style={{ position: 'absolute', right: 120, top: 170, width: 660, borderRadius: 18, border: `2px solid ${PALETTE.bad}`, background: `${PALETTE.bad}06`, padding: '18px 20px', opacity: kernelPath }}>
          <Label color={PALETTE.bad} size={12.5} style={{ marginBottom: 12 }}>the kernel path — a kernel OOM kill, below Kubernetes</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: MONO, fontSize: 14.5, fontWeight: 800 }}>
            <div style={{ borderRadius: 10, border: `1px solid ${PALETTE.bad}55`, background: '#0d1522', padding: '9px 12px' }}>
              the kernel picks a container and kills it
            </div>
            <div style={{ borderRadius: 10, border: `1px solid ${PALETTE.bad}55`, background: '#0d1522', padding: '9px 12px', opacity: kernelStep2 }}>
              the kubelet may simply restart it under the restart policy
            </div>
            <div style={{ borderRadius: 10, border: `1px solid ${PALETTE.bad}55`, background: '#0d1522', padding: '9px 12px', opacity: kernelStep3 }}>
              resulting state differs — a restart, not a Failed Pod to replace
            </div>
          </div>
        </div>

        {/* split markers */}
        <div style={{ position: 'absolute', left: 830, top: 170, fontFamily: MONO, fontSize: 20, fontWeight: 900, color: PALETTE.line, opacity: pressureIn }}>⁄</div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: kubeStep3 }}>
          <Label color={PALETTE.muted} size={12.5}>different actor · different object state · different log — the discriminator matters</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>do not merge them into one arrow — eviction is a Kubernetes action over objects; OOM is the kernel killing a process</Label>
        </div>
      </div>
    </div>
  );
};
