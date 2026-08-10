import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 08 beat 1 — three owners, not one network. Pod reachability and
 * Service identity are two problems shared by three owners. Each column owns
 * its own labels: what it owns and how it fails. The failure text carries the
 * beat, so it gets the same weight as the owner name.
 */

const OWNERS = [
  {
    name: 'CNI',
    color: PALETTE.violet,
    owns: 'Pod address and routes',
    fails: 'no address — ContainerCreating',
    logLine: 'runtime logs · CNI exec result',
  },
  {
    name: 'EndpointSlice',
    color: PALETTE.blue,
    owns: 'which backends are ready',
    fails: 'empty slice — no backends',
    logLine: 'kubectl get endpointslices',
  },
  {
    name: 'kube-proxy / eBPF',
    color: PALETTE.cyan,
    owns: 'Service address to backend',
    fails: 'rules not programmed — connection times out',
    logLine: 'the data plane implementation',
  },
];

export const ThreeOwners: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const colOn = OWNERS.map((_, i) => appear(t, 0.1 + i * 0.09, 0.18 + i * 0.09));
  const footer = appear(t, 0.82, 0.9);

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
      <div style={{ width: 1620 }}>
        <div style={{ textAlign: 'center', marginBottom: 34, opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>Pod reachability and Service identity are two problems — three owners share them</Label>
        </div>

        <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
          {OWNERS.map((o, i) => {
            const on = colOn[i];
            return (
              <div
                key={o.name}
                style={{
                  width: 520,
                  minHeight: 380,
                  borderRadius: 20,
                  border: `2px solid ${on > 0.5 ? o.color : PALETTE.line}`,
                  background: on > 0.5 ? `${o.color}0e` : PALETTE.panel,
                  boxShadow: on > 0.5 ? `0 0 26px ${o.color}33` : 'none',
                  padding: '24px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: Math.max(0.3, on),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: MONO, color: o.color, fontSize: 34, fontWeight: 900, letterSpacing: '0.02em' }}>
                    {o.name}
                  </span>
                  <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 800 }}>
                    owner {i + 1}
                  </span>
                </div>

                <div style={{ marginTop: 26 }}>
                  <Label color={PALETTE.muted} size={11} style={{ marginBottom: 6 }}>owns</Label>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 800, lineHeight: 1.3 }}>
                    {o.owns}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 22 }}>
                  <Label color={PALETTE.bad} size={11} style={{ marginBottom: 8 }}>how it fails — its own signature</Label>
                  <div
                    style={{
                      fontFamily: MONO,
                      color: PALETTE.bad,
                      fontSize: 24,
                      fontWeight: 900,
                      lineHeight: 1.3,
                      border: `1px solid ${PALETTE.bad}66`,
                      borderRadius: 14,
                      background: `${PALETTE.bad}0d`,
                      padding: '14px 18px',
                    }}
                  >
                    {o.fails}
                  </div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 12 }}>
                    logs: {o.logLine}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 30, opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>three owners — three failure modes — three sets of logs: naming the owner names the log</Label>
        </div>
      </div>
    </div>
  );
};
