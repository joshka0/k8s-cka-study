import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 10 beat 7 — stage versus publish. One node, one staged device, two
 * Pods each publishing into their own target path. Stage runs exactly once
 * per volume per node; publish runs per Pod. Failing them independently:
 * stage failure leaves no usable device at all; publish failure leaves a
 * healthy staged device that never reaches one container. CORRECTION
 * respected: staging is optional (STAGE_UNSTAGE_VOLUME) — the no-stage
 * driver goes straight to publish.
 */

export const StageVsPublish: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const nodeIn = appear(t, 0.08, 0.18);
  const stageIn = seg(t, 0.12, 0.24);
  const publishIn = seg(t, 0.22, 0.34);
  const noStageIn = seg(t, 0.32, 0.42);
  const failIn = appear(t, 0.46, 0.56);

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
          <Label color={PALETTE.cyan} size={13}>stage happens once per volume per node — publish happens once per Pod</Label>
        </div>

        {/* the node */}
        <div
          style={{
            position: 'absolute',
            left: 180,
            top: 56,
            width: 1260,
            borderRadius: 20,
            border: `2px solid ${PALETTE.violet}66`,
            background: `${PALETTE.violet}04`,
            padding: '16px 22px 20px',
            opacity: nodeIn,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Label color={PALETTE.violet} size={13.5}>node-2</Label>
            <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 800 }}>
              csi-&lt;driver&gt; nodeplugin · kubelet
            </span>
          </div>

          <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
            {/* the staged device */}
            <div style={{ width: 300 }}>
              <div
                style={{
                  fontFamily: MONO,
                  color: PALETTE.ink,
                  fontSize: 15.5,
                  fontWeight: 900,
                  borderRadius: 12,
                  border: `1px solid ${PALETTE.line}`,
                  background: `${PALETTE.violet}0c`,
                  padding: '12px 14px',
                }}
              >
                /var/lib/kubelet/plugins/kubernetes.io/csi/…/globalmount
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 13.5,
                  fontWeight: 900,
                  color: stageIn > 0.5 ? PALETTE.good : PALETTE.muted,
                  marginTop: 10,
                  opacity: stageIn > 0.5 ? 1 : 0.4,
                }}
              >
                ✓ NodeStageVolume — once per volume per node
              </div>
              <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: PALETTE.muted, marginTop: 4 }}>
                a staged device exists
              </div>
            </div>

            <div style={{ width: 1, alignSelf: 'stretch', background: PALETTE.line }} />

            {/* the two pods */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 20 }}>
                {['pod-a', 'pod-b'].map((p, i) => (
                  <div key={p} style={{ flex: 1 }}>
                    <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900, borderRadius: 10, border: `1px solid ${PALETTE.line}`, background: '#0d1522', padding: '9px 12px', textAlign: 'center' }}>
                      {p}
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: PALETTE.muted,
                        marginTop: 6,
                        padding: '8px 10px',
                        border: `1px solid ${PALETTE.line}55`,
                        borderRadius: 8,
                        lineHeight: 1.35,
                      }}
                    >
                      target: /var/lib/kubelet/pods/&lt;{p}&gt;/volumes/.../mount
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 13,
                        fontWeight: 900,
                        color: publishIn > 0.5 ? PALETTE.good : PALETTE.muted,
                        marginTop: 8,
                        opacity: publishIn > 0.5 ? 1 : 0.4,
                      }}
                    >
                      {stageIn > 0.5 ? `✓ NodePublishVolume #${i + 1} — per Pod` : '…'}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 13, fontWeight: 800, marginTop: 14, opacity: noStageIn }}>
                ⇩ no STAGE_UNSTAGE_VOLUME capability → the driver skips stage and goes straight to publish
              </div>
            </div>
          </div>
        </div>

        {/* fail each independently */}
        <div style={{ position: 'absolute', left: 180, top: 400, width: 1260, display: 'flex', gap: 20, opacity: failIn }}>
          <div style={{ flex: 1, borderRadius: 16, border: `1px solid ${PALETTE.bad}55`, background: `${PALETTE.bad}05`, padding: '14px 18px' }}>
            <Label color={PALETTE.bad} size={10.5} style={{ marginBottom: 6 }}>stage fails</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>
              no usable device at all — publish has nothing to mount
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 13.5, fontWeight: 800, marginTop: 8 }}>
              log: kubelet + the node plugin's stage path
            </div>
          </div>
          <div style={{ flex: 1, borderRadius: 16, border: `1px solid ${PALETTE.bad}55`, background: `${PALETTE.bad}05`, padding: '14px 18px' }}>
            <Label color={PALETTE.bad} size={10.5} style={{ marginBottom: 6 }}>publish fails</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>
              healthy staged device — one container still never gets the bind mount
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 13.5, fontWeight: 800, marginTop: 8 }}>
              log: kubelet + the publish/bind-mount path
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: appear(t, 0.7, 0.8) }}>
          <Label color={PALETTE.amber} size={13}>two different logs, two different questions — which half of the node plugin saw the failure?</Label>
        </div>
      </div>
    </div>
  );
};
