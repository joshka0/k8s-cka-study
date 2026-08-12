import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 21 beat 5 — two constraints on the kubelet's identity. One request
 * passes two distinct gates, each rejecting a different thing: the Node
 * authorizer limits which operations a kubelet may request at all, and
 * NodeRestriction admission constrains the mutations that get through. Reuses
 * the module 02 gate visual language — the two stages read as one pipeline.
 */

export const NodeAuthzAdmission: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const g1Pass = seg(t, 0.12, 0.3);
  const g2Pass = seg(t, 0.32, 0.46);
  const rejectOp = appear(t, 0.56, 0.64);
  const rejectPayload = appear(t, 0.7, 0.78);
  const footer = appear(t, 0.88, 0.94);

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
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>one kubelet request, two gates — each rejects a different thing</Label>
        </div>

        {/* the request into the pipeline */}
        <div style={{ position: 'absolute', left: 130, top: 110, width: 280, textAlign: 'center' }}>
          <Box pad={12} borderColor={PALETTE.violet} style={{ textAlign: 'center' }}>
            <Label color={PALETTE.violet} size={11}>kubelet request</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 800, marginTop: 6 }}>
              system:node:node-3 · system:nodes
            </div>
          </Box>
          <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: PALETTE.muted, marginTop: 8 }}>
            identity already established
          </div>
        </div>

        <div style={{ position: 'absolute', left: 450, top: 96, display: 'flex', gap: 60 }}>
          <GateBox title="node authorizer" sub="authorization" color={PALETTE.blue} code="403 · not allowed" />
          <GateBox title="NodeRestriction" sub="admission" color={PALETTE.good} code="rejected · unacceptable payload" />
        </div>

        <div style={{ position: 'absolute', left: 870, top: 196, fontFamily: MONO, fontSize: 15, fontWeight: 700, color: PALETTE.muted }}>
          g1 pass → {g1Pass > 0.5 ? '✓' : '·'} &nbsp;&nbsp;g2 pass → {g2Pass > 0.5 ? '✓' : '·'}
        </div>

        {/* what each gate rejects */}
        <div style={{ position: 'absolute', left: 130, top: 360, width: 1420, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 20, opacity: rejectOp }}>
            <span style={{ flex: '0 0 34px', color: PALETTE.bad, fontSize: 22, fontWeight: 900, textAlign: 'center' }}>✕</span>
            <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${PALETTE.bad}66`, background: `${PALETTE.bad}0a`, padding: '12px 16px' }}>
              <Label color={PALETTE.bad} size={11}>gate one rejects</Label>
              <div style={{ fontFamily: MONO, fontSize: 16.5, fontWeight: 900, color: PALETTE.ink, marginTop: 6 }}>
                the operation itself — a request the kubelet may not make at all
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, opacity: rejectPayload }}>
            <span style={{ flex: '0 0 34px', color: PALETTE.bad, fontSize: 22, fontWeight: 900, textAlign: 'center' }}>✕</span>
            <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${PALETTE.bad}66`, background: `${PALETTE.bad}0a`, padding: '12px 16px' }}>
              <Label color={PALETTE.bad} size={11}>gate two rejects</Label>
              <div style={{ fontFamily: MONO, fontSize: 16.5, fontWeight: 900, color: PALETTE.ink, marginTop: 6 }}>
                a permitted operation carrying an unacceptable payload — e.g. mutating another node’s object
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
            <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${PALETTE.good}55`, background: `${PALETTE.good}06`, padding: '12px 16px', opacity: g2Pass > 0.5 ? 1 : 0.3 }}>
              <Label color={PALETTE.good} size={11}>what gate two is for</Label>
              <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: PALETTE.ink, marginTop: 6, lineHeight: 1.4 }}>
                a kubelet cannot modify objects belonging to another node
              </div>
            </div>
            <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${PALETTE.good}55`, background: `${PALETTE.good}06`, padding: '12px 16px', opacity: g1Pass > 0.5 ? 1 : 0.3 }}>
              <Label color={PALETTE.good} size={11}>what gate one is for</Label>
              <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: PALETTE.ink, marginTop: 6, lineHeight: 1.4 }}>
                limits which API operations the kubelet is allowed to request
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 606, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>authorization decides whether you may ask · admission decides whether what you asked for is acceptable</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 666, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>two constraints, at two stages — an operation, and a payload</Label>
        </div>
      </div>
    </div>
  );
};

function GateBox({ title, sub, color, code }: { title: string; sub: string; color: string; code: string }) {
  return (
    <Box pad={16} borderColor={color} bg={`${color}0e`} style={{ width: 250, textAlign: 'center' }}>
      <div style={{ fontFamily: MONO, color, fontSize: 22, fontWeight: 900 }}>{title}</div>
      <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, marginTop: 4, fontWeight: 700 }}>{sub}</div>
      <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 15, fontWeight: 900, marginTop: 10 }}>✕ {code}</div>
    </Box>
  );
}
