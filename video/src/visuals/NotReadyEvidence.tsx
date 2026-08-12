import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 20 beat 3 — what separates a NotReady node. Three evidence layers
 * stacked with what each proves: the Lease (is it reporting), the conditions
 * (what it reports), component logs (why). A failure at each layer produces a
 * different combination of evidence, so the reader can invert from symptom to
 * layer.
 */

const LAYERS = [
  {
    layer: 'node Lease',
    proves: 'is it reporting at all',
    artefact: 'kube-node-lease / its renewal time',
    fail: 'no renewals → the node stopped reporting — heartbeat gone',
    color: PALETTE.blue,
  },
  {
    layer: 'node conditions',
    proves: 'what it reports',
    artefact: 'MemoryPressure · DiskPressure · network',
    fail: 'conditions name pressure and network symptoms',
    color: PALETTE.cyan,
  },
  {
    layer: 'kubelet · runtime · CNI',
    proves: 'why it reports that',
    artefact: 'their logs, in that order',
    fail: 'component logs locate the actual owner',
    color: PALETTE.amber,
  },
];

export const NotReadyEvidence: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const layerOn = LAYERS.map((_, i) => appear(t, 0.08 + i * 0.08, 0.16 + i * 0.08));
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
      <div style={{ width: 1680, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>three questions, three evidence layers — one NotReady node has all of them</Label>
        </div>

        {/* the layer columns */}
        <div style={{ position: 'absolute', left: 100, top: 70, width: 1480, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {LAYERS.map((l, i) => {
            const on = layerOn[i];
            return (
              <div key={l.layer} style={{ display: 'flex', alignItems: 'stretch', gap: 16, borderRadius: 16, border: `2px solid ${on > 0.5 ? l.color : PALETTE.line}55`, background: on > 0.5 ? `${l.color}06` : '#101826', padding: '14px 18px', opacity: Math.max(0.3, on) }}>
                <div style={{ width: 250, flex: '0 0 250px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontFamily: MONO, color: l.color, fontSize: 17.5, fontWeight: 900 }}>{l.layer}</div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>proves: {l.proves}</div>
                </div>
                <div style={{ width: 260, flex: '0 0 260px', display: 'flex', alignItems: 'center', fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.line}55`, borderRadius: 10, background: '#0d1522', padding: '11px 14px', lineHeight: 1.4 }}>
                  {l.artefact}
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', fontFamily: MONO, color: PALETTE.amber, fontSize: 15, fontWeight: 800, lineHeight: 1.4 }}>
                  {l.fail}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>answer them in order and you stop restarting the wrong thing — each layer's failure leaves its own trace</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>invert from the symptom: renewals? conditions? component logs? — that tells you which layer to fix</Label>
        </div>
      </div>
    </div>
  );
};
