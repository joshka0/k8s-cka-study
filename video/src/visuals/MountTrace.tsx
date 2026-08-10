import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 10 beat 9 — a storage stuck trace, in order. Each step lights up
 * with the artefact you actually inspect beside it. Step one is emphasised:
 * the VolumeAttachment object splits control-plane problems from node
 * problems in a single check. Rows wrap; longer checks are never clipped.
 */

const STEPS = [
  {
    name: '1 · VolumeAttachment first',
    artefact: 'kubectl describe volumeattachment',
    why: 'did attach succeed at all?',
    emphasized: true,
    color: PALETTE.cyan,
    note: 'it splits control-plane problems from node problems in a single check — attach state, driver, node, and status all live here',
  },
  {
    name: '2 · CSI sidecar logs — control plane',
    artefact: 'external-provisioner / external-attacher logs',
    why: 'did provisioning or attach RPC fail?',
    color: PALETTE.blue,
    note: 'the sidecars record every Controller RPC attempt against the storage provider',
  },
  {
    name: '3 · node plugin registration on that node',
    artefact: 'csi-<driver> registration · kubelet plugin socket',
    why: 'is the node half even registered and alive here?',
    color: PALETTE.violet,
    note: 'an unregistered plugin makes every node-side RPC fail immediately — check registration before blaming the driver',
  },
  {
    name: '4 · kubelet logs for stage/publish',
    artefact: 'kubelet log — stage and publish attempts',
    why: 'what exactly did the node half refuse?',
    color: PALETTE.violet,
    note: 'the bind-mount and target-path errors appear here, on the right node at the right time',
  },
  {
    name: '5 · device-level checks',
    artefact: 'credentials · device state · filesystem · multi-attach',
    why: 'is the underlying storage healthy and reachable?',
    color: PALETTE.amber,
    note: 'the deepest checks, only after 1–4 have pointed here',
  },
];

export const MountTrace: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const stepOn = STEPS.map((_, i) => appear(t, 0.08, 0.12 + i * 0.16));
  const footer = appear(t, 0.92, 0.98);

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
          <Label color={PALETTE.cyan} size={13}>a storage problem, traced in order — each step beside the artefact you actually inspect</Label>
        </div>

        <div style={{ position: 'absolute', left: 60, top: 56, width: 1500, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map((s, i) => {
            const on = stepOn[i];
            return (
              <div
                key={s.name}
                style={{
                  borderRadius: 16,
                  border: `2px solid ${on > 0.5 ? s.color : PALETTE.line}`,
                  background: on > 0.5 ? `${s.color}0c` : PALETTE.panel,
                  boxShadow: s.emphasized && on > 0.5 ? `0 0 26px ${s.color}33` : 'none',
                  padding: '16px 20px',
                  opacity: Math.max(0.3, on),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                }}
              >
                <div style={{ width: 430, flex: '0 0 430px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: MONO, color: s.color, fontSize: 21, fontWeight: 900, lineHeight: 1.3 }}>{s.name}</span>
                    {s.emphasized && (
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 11,
                          fontWeight: 900,
                          color: PALETTE.bad,
                          border: `1px solid ${PALETTE.bad}66`,
                          borderRadius: 999,
                          padding: '3px 10px',
                          background: `${PALETTE.bad}0a`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        start here
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 6 }}>
                    {s.why}
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    fontFamily: MONO,
                    color: PALETTE.ink,
                    fontSize: 17.5,
                    fontWeight: 800,
                    borderLeft: `1px solid ${s.color}44`,
                    paddingLeft: 24,
                    lineHeight: 1.45,
                  }}
                >
                  <span style={{ color: s.color, fontWeight: 900 }}>▸ inspect: </span>
                  {s.artefact}
                  {s.note && (
                    <div style={{ color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 6, lineHeight: 1.4 }}>{s.note}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>start at the VolumeAttachment — it tells you which side of the split to dig into before you open any log</Label>
        </div>
      </div>
    </div>
  );
};
