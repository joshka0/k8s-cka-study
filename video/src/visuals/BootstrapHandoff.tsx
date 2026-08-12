import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 13 beat 2 — where the handoff happens. Four ordered stages fill the
 * width; each names the owning actor underneath. A clear handoff line divides
 * kubeadm's work (writes) from the kubelet's (realises). The CNI step is drawn
 * visually detached — it is a separate install afterwards, not part of the
 * same bootstrap run.
 */

const STAGES = [
  {
    n: '01', actor: 'kubeadm', verb: 'writes',
    body: ['configuration', 'PKI', 'manifests'],
    detached: false,
  },
  {
    n: '02', actor: 'kubelet', verb: 'realises',
    body: ['static Pods', 'control-plane', 'components'],
    detached: false,
  },
  {
    n: '03', actor: 'API + tokens', verb: 'admit',
    body: ['other nodes', 'join the cluster'],
    detached: false,
  },
  {
    n: '04', actor: 'you / operator', verb: 'installs',
    body: ['CNI — one add-on', 'after the run'],
    detached: true,
  },
];

export const BootstrapHandoff: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const stageOn = STAGES.map((_, i) => appear(t, 0.08 + i * 0.1, 0.16 + i * 0.1));
  const handoff = seg(t, 0.42, 0.52);
  const detached = appear(t, 0.62, 0.72);
  const footer = appear(t, 0.88, 0.95);

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
      <div style={{ width: 1700, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>the durable handoff has an order — each stage is owned by a different actor</Label>
        </div>

        <div style={{ position: 'absolute', left: 30, top: 90, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          {STAGES.map((s, i) => {
            const on = stageOn[i];
            return (
              <React.Fragment key={s.n}>
                {i > 0 && (
                  <div
                    style={{
                      alignSelf: 'center',
                      marginTop: 40,
                      color: PALETTE.line,
                      fontSize: 26,
                      fontWeight: 900,
                      zIndex: 1,
                    }}
                  >
                    →
                  </div>
                )}
                <div
                  style={{
                    width: 380,
                    borderRadius: 18,
                    border: s.detached ? `2px dashed ${PALETTE.amber}88` : `2px solid ${on > 0.5 ? PALETTE.blue : PALETTE.line}`,
                    background: s.detached ? `${PALETTE.amber}06` : on > 0.5 ? `${PALETTE.blue}0c` : PALETTE.panel,
                    padding: '20px 22px',
                    transform: s.detached ? 'translateY(26px)' : 'none',
                    borderColor: s.detached ? `${PALETTE.amber}88` : undefined,
                    opacity: Math.max(0.3, on),
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 900, color: s.detached ? PALETTE.amber : PALETTE.blue }}>
                      {s.n}
                    </span>
                    {s.detached && (
                      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 900, color: PALETTE.amber, border: `1px solid ${PALETTE.amber}66`, borderRadius: 999, padding: '3px 8px' }}>
                        separate run
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900, marginTop: 14 }}>
                    {s.actor}
                  </div>
                  <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 14, fontWeight: 800, marginTop: 2 }}>
                    {s.verb}
                  </div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 700, marginTop: 12, lineHeight: 1.5 }}>
                    {s.body.map((b) => <div key={b}>· {b}</div>)}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* the handoff line between kubeadm and the kubelet */}
        <div
          style={{
            position: 'absolute',
            left: 446,
            top: 116,
            height: 300,
            borderLeft: `3px solid ${PALETTE.amber}`,
            opacity: handoff,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: -14,
              top: 150,
              whiteSpace: 'nowrap',
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 900,
              color: PALETTE.amber,
              border: `1px solid ${PALETTE.amber}66`,
              borderRadius: 10,
              background: '#0b111d',
              padding: '8px 12px',
            }}
          >
            the handoff — kubeadm's work ends, the kubelet's begins
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', opacity: detached }}>
          <Label color={PALETTE.muted} size={12.5}>CNI is installed separately, afterwards — a cluster can have a running control plane and no Pod networking at all</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>one composer writes, one node agent realises, the API admits — and the network is added later, on its own</Label>
        </div>
      </div>
    </div>
  );
};
