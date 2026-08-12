import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 13 beat 1 — kubeadm composes then exits. A short-lived process on the
 * left writes the durable artefacts (PKI, kubeconfigs, static Pod manifests,
 * bootstrap config), then visibly exits and greys out. The kubelet on the
 * right picks the manifests up and starts the control-plane components in the
 * ordinary node path. The exit is the point — nothing about kubeadm persists
 * as a manager.
 */

const ARTEFACTS = [
  { id: 'PKI', note: 'certs + keys' },
  { id: 'kubeconfigs', note: 'every client identity' },
  { id: 'static Pod manifests', note: '/etc/kubernetes/manifests' },
  { id: 'bootstrap config', note: 'tokens · discovery' },
];

export const KubeadmComposes: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const kubeadmIn = appear(t, 0.06, 0.14);
  const artefactOn = ARTEFACTS.map((_, i) => appear(t, 0.1 + i * 0.09, 0.18 + i * 0.09));
  const exit = seg(t, 0.5, 0.62);
  const kubeletIn = appear(t, 0.6, 0.7);
  const componentOn = seg(t, 0.68, 0.9);
  const footer = appear(t, 0.9, 0.97);

  const COMPONENTS = ['etcd', 'API server', 'scheduler', 'controller-manager'];

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
          <Label color={PALETTE.cyan} size={13}>kubeadm composes a cluster — it writes durable artefacts, then it exits</Label>
        </div>

        {/* kubeadm process */}
        <div
          style={{
            position: 'absolute',
            left: 130,
            top: 120,
            width: 300,
            borderRadius: 18,
            border: `2px solid ${exit > 0.5 ? PALETTE.line : PALETTE.blue}`,
            background: exit > 0.5 ? `${PALETTE.line}0d` : `${PALETTE.blue}14`,
            padding: '18px 20px',
            textAlign: 'center',
            opacity: kubeadmIn,
            boxShadow: exit > 0.5 ? 'none' : `0 0 26px ${PALETTE.blue}44`,
          }}
        >
          <div style={{ fontFamily: MONO, color: exit > 0.5 ? PALETTE.muted : PALETTE.ink, fontSize: 24, fontWeight: 900 }}>
            kubeadm
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
            a short-lived bootstrap process
          </div>
          {exit > 0.5 ? (
            <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 15, fontWeight: 900, marginTop: 12 }}>
              ✕ exited — no daemon watches your cluster
            </div>
          ) : (
            <div style={{ fontFamily: MONO, color: PALETTE.blue, fontSize: 15, fontWeight: 900, marginTop: 12 }}>
              writing artefacts…
            </div>
          )}
        </div>

        {/* artefact column */}
        <div style={{ position: 'absolute', left: 530, top: 96, width: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ARTEFACTS.map((a, i) => (
            <div key={a.id} style={{ opacity: artefactOn[i] }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 16.5,
                    fontWeight: 900,
                    color: PALETTE.ink,
                    border: `1px solid ${PALETTE.good}55`,
                    borderRadius: 10,
                    background: `${PALETTE.good}08`,
                    padding: '11px 16px',
                    textAlign: 'left',
                  }}
                >
                  {a.id}
                  <span style={{ color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginLeft: 10 }}>{a.note}</span>
                </div>
                {/* write arrow from kubeadm */}
                <span style={{ position: 'absolute', left: -28, top: '50%', transform: 'translateY(-50%)', color: PALETTE.good, fontSize: 18, fontWeight: 900, opacity: artefactOn[i] }}>
                  →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* kubelet realises */}
        <div
          style={{
            position: 'absolute',
            right: 120,
            top: 120,
            width: 400,
            borderRadius: 18,
            border: `2px solid ${PALETTE.violet}`,
            background: `${PALETTE.violet}12`,
            padding: '18px 20px',
            textAlign: 'center',
            opacity: Math.max(0, kubeletIn - exit * 0),
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 24, fontWeight: 900 }}>
            kubelet
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
            reads the static Pod manifests — the same node path as every other Pod
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', minHeight: 96 }}>
            {COMPONENTS.map((c, i) => {
              const on = componentOn > i / COMPONENTS.length;
              const delay = componentOn * COMPONENTS.length > i;
              return (
                <span
                  key={c}
                  style={{
                    fontFamily: MONO,
                    fontSize: 13.5,
                    fontWeight: 900,
                    color: on ? PALETTE.ink : PALETTE.line,
                    border: `1px solid ${on ? PALETTE.violet : PALETTE.line}`,
                    borderRadius: 10,
                    background: on ? `${PALETTE.violet}22` : '#0d1522',
                    padding: '9px 12px',
                    opacity: delay ? 1 : 0.25,
                  }}
                >
                  {on ? '' : ''}{c}
                </span>
              );
            })}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>after the exit, control-plane components run only because the kubelet realises the manifests kubeadm wrote</Label>
        </div>
      </div>
    </div>
  );
};
