import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 10 beat 5 — one privileged half, one ordinary half. The node half
 * runs on every node and is marked privileged; the controller half runs once
 * in the control plane and is not. Then the two failure signatures side by
 * side: controller-side, nothing provisions and no PV appears at all;
 * node-side, the PV exists and attaches while the Pod still cannot mount.
 * The contrast in symptom is the takeaway.
 */

export const PrivilegedHalf: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const cpIn = appear(t, 0.08, 0.18);
  const nodeOn = [0, 1, 2].map((_, i) => appear(t, 0.16 + i * 0.08, 0.26 + i * 0.08));
  const failsIn = appear(t, 0.5, 0.6);

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
          <Label color={PALETTE.cyan} size={13}>one half is privileged and everywhere — the other is ordinary and once</Label>
        </div>

        {/* the control plane, once */}
        <div style={{ position: 'absolute', left: 60, top: 66, width: 1500, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, borderRadius: 16, border: `2px solid ${PALETTE.blue}66`, background: `${PALETTE.blue}04`, padding: '14px 18px', opacity: cpIn }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Label color={PALETTE.blueInk} size={12}>control-plane node — the controller half lives here</Label>
              <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800 }}>unprivileged</span>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800, borderRadius: 10, border: `1px solid ${PALETTE.line}`, background: '#0d1522', padding: '10px 14px' }}>
              external-provisioner · external-attacher · … <span style={{ color: PALETTE.muted, fontWeight: 700 }}>— talks to the storage provider's API</span>
            </div>
          </div>

          {/* the worker nodes */}
          <div style={{ flex: 1.6, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['node-1', 'node-2', 'node-3'].map((n, i) => (
              <div
                key={n}
                style={{
                  borderRadius: 14,
                  border: `2px solid ${nodeOn[i] > 0.5 ? PALETTE.violet : PALETTE.line}66`,
                  background: nodeOn[i] > 0.5 ? `${PALETTE.violet}06` : PALETTE.panel,
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  opacity: Math.max(0.3, nodeOn[i]),
                }}
              >
                <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, width: 110 }}>{n}</span>
                <span style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 14, fontWeight: 900 }}>csi-&lt;driver&gt; nodeplugin</span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: MONO,
                    fontSize: 12.5,
                    fontWeight: 900,
                    color: PALETTE.violet,
                    border: `1px solid ${PALETTE.violet}66`,
                    borderRadius: 999,
                    background: `${PALETTE.violet}0c`,
                    padding: '5px 12px',
                  }}
                >
                  privileged ✓ — a DaemonSet on every node with storage
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* the two failure signatures */}
        <div style={{ position: 'absolute', left: 60, top: 360, width: 1500, display: 'flex', gap: 24, opacity: failsIn }}>
          <div
            style={{
              flex: 1,
              borderRadius: 18,
              border: `2px solid ${PALETTE.bad}77`,
              background: `${PALETTE.bad}06`,
              padding: '18px 22px',
            }}
          >
            <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 8 }}>controller-side failure — nothing provisions</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>
              no PV appears at all
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14.5, fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
              the claim never gets a volume — look at the provisioner sidecars
            </div>
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: 18,
              border: `2px solid ${PALETTE.bad}77`,
              background: `${PALETTE.bad}06`,
              padding: '18px 22px',
            }}
          >
            <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 8 }}>node-side failure — attach worked</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>
              PV exists and attaches — the Pod still cannot mount
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14.5, fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
              the volume is fine — the node half cannot publish it — look at kubelet and the plugin on that node
            </div>
          </div>
        </div>

        {/* the contrast */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 560,
            width: 1500,
            borderRadius: 16,
            border: `1px solid ${PALETTE.amber}66`,
            background: `${PALETTE.amber}08`,
            padding: '14px 22px',
            textAlign: 'center',
            opacity: appear(t, 0.7, 0.8),
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>
            the symptom tells you the half — <span style={{ color: PALETTE.bad }}>no volume at all</span> points control-plane,{' '}
            <span style={{ color: PALETTE.amber }}>a volume that will not mount</span> points node
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 636, textAlign: 'center', opacity: appear(t, 0.86, 0.94) }}>
          <Label color={PALETTE.amber} size={13}>one privileged half on every node changes what you check and who you ask — and where the crash happened</Label>
        </div>
      </div>
    </div>
  );
};
