import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 13 beat 3 — the container is gone after a reboot. The first check is
 * not the API. A kubeadm control plane is represented by static Pod manifests
 * on disk; if the kubelet cannot read or realise one, the API object you see
 * may only be a stale mirror Pod. A break on the disk side: the manifest is
 * unreadable, the kubelet cannot realise it, and the API still shows the old
 * mirror Pod. That object is a stale reflection, not a running process.
 */

export const StaticPodMirror: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const diskIn = appear(t, 0.08, 0.16);
  const kubeletIn = appear(t, 0.14, 0.22);
  const apiIn = appear(t, 0.2, 0.28);
  const breakDown = seg(t, 0.32, 0.5);
  const stale = appear(t, 0.5, 0.62);
  const footer = appear(t, 0.86, 0.94);

  const broken = breakDown > 0.5;

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
      <div style={{ width: 1640, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>a control-plane container missing after reboot — start with the manifest on disk, not the API</Label>
        </div>

        {/* disk */}
        <div style={{ position: 'absolute', left: 100, top: 110, width: 400, borderRadius: 18, border: `2px solid ${broken ? PALETTE.bad : PALETTE.blue}`, background: broken ? `${PALETTE.bad}0d` : `${PALETTE.blue}0c`, padding: '18px 20px', opacity: diskIn }}>
          <Label color={broken ? PALETTE.bad : PALETTE.blue} size={12} style={{ marginBottom: 12 }}>disk · /etc/kubernetes/manifests</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '12px 14px', marginBottom: 8 }}>
            kube-apiserver.yaml
          </div>
          {broken ? (
            <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 14.5, fontWeight: 900, marginTop: 8, lineHeight: 1.4 }}>
              ✕ unreadable / missing — the kubelet cannot realise it
            </div>
          ) : (
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>
              readable — when present, this IS the control plane
            </div>
          )}
        </div>

        {/* kubelet */}
        <div style={{ position: 'absolute', left: 590, top: 120, width: 340, borderRadius: 18, border: `2px solid ${broken ? PALETTE.line : PALETTE.violet}`, background: `${PALETTE.violet}0c`, padding: '18px 20px', textAlign: 'center', opacity: kubeletIn }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>kubelet</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 10, lineHeight: 1.45 }}>
            {broken ? 'cannot realise the static Pod — nothing starts' : 'reads the manifest and starts the container'}
          </div>
        </div>

        {/* API mirror */}
        <div style={{ position: 'absolute', left: 1020, top: 110, width: 500, borderRadius: 18, border: `2px solid ${broken ? PALETTE.amber : PALETTE.good}`, background: broken ? `${PALETTE.amber}0a` : `${PALETTE.good}0a`, padding: '18px 20px', opacity: apiIn }}>
          <Label color={broken ? PALETTE.amber : PALETTE.good} size={12} style={{ marginBottom: 12 }}>the API — a mirror Pod</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '12px 14px' }}>
            kube-apiserver-<span style={{ color: PALETTE.amber }}>node-1</span>
            <div style={{ color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6 }}>kind: Pod · the mirror published by the kubelet</div>
          </div>
          {broken && (
            <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 15, fontWeight: 900, marginTop: 12, opacity: stale }}>
              stale reflection — a leftover from before the reboot,<br />NOT a running process
            </div>
          )}
        </div>

        {/* flow arrows */}
        <div style={{ position: 'absolute', left: 506, top: 216, color: PALETTE.line, fontSize: 26, fontWeight: 900, opacity: diskIn }}>→</div>
        <div style={{ position: 'absolute', left: 936, top: 216, color: broken ? PALETTE.bad : PALETTE.good, fontSize: 26, fontWeight: 900, opacity: kubeletIn }}>→</div>

        {/* the break X */}
        {broken && (
          <div style={{ position: 'absolute', left: 588, top: 250, color: PALETTE.bad, fontSize: 30, fontWeight: 900, opacity: breakDown }}>
            ✕
          </div>
        )}

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: breakDown }}>
          <Label color={PALETTE.bad} size={13}>the mirror in the API is not the process — treat the API view as a reflection, and read the disk and the kubelet</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>read /etc/kubernetes/manifests and the kubelet first — before trusting any Pod you see in the API</Label>
        </div>
      </div>
    </div>
  );
};
