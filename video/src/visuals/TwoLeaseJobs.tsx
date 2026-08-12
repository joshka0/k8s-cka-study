import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 19 beat 2 — the same API, two jobs. Node liveness uses Leases in
 * their own namespace as a cheap heartbeat the node controller reads.
 * Component leader election uses Leases to decide who is active. Same object
 * shape, entirely different readers and consequences. The namespace difference
 * is labelled explicitly.
 */

const FIELDS = ['holder', 'renewTime', 'duration'];

export const TwoLeaseJobs: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const nodeIn = appear(t, 0.08, 0.16);
  const compIn = appear(t, 0.2, 0.3);
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
          <Label color={PALETTE.cyan} size={13}>the same Lease object type does two unrelated jobs — confusing them makes diagnosis harder</Label>
        </div>

        {/* node heartbeat */}
        <div style={{ position: 'absolute', left: 160, top: 80, width: 640, borderRadius: 20, border: `2px solid ${PALETTE.cyan}`, background: `${PALETTE.cyan}06`, padding: '20px 24px', opacity: nodeIn }}>
          <Label color={PALETTE.cyan} size={12} style={{ marginBottom: 10 }}>node liveness — node heartbeat</Label>
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 900, color: PALETTE.cyan, border: `1px solid ${PALETTE.cyan}55`, borderRadius: 999, padding: '5px 12px', display: 'inline-block', marginBottom: 12 }}>
            namespace: kube-node-lease
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14.5, fontWeight: 900, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '11px 14px' }}>
            {FIELDS.map((f) => <div key={f} style={{ marginBottom: 4 }}>{f}: …</div>)}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800, marginTop: 12, lineHeight: 1.4 }}>
            reader: the <span style={{ color: PALETTE.cyan }}>node controller</span> — a cheap heartbeat that the node is alive
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>consequence: node condition → health</div>
        </div>

        <div style={{ position: 'absolute', left: 830, top: 260, color: PALETTE.line, fontSize: 36, fontWeight: 900, opacity: compIn }}>↔</div>

        {/* component leadership */}
        <div style={{ position: 'absolute', right: 160, top: 80, width: 640, borderRadius: 20, border: `2px solid ${PALETTE.violet}`, background: `${PALETTE.violet}06`, padding: '20px 24px', opacity: compIn }}>
          <Label color={PALETTE.violet} size={12} style={{ marginBottom: 10 }}>component leader election</Label>
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 900, color: PALETTE.violet, border: `1px solid ${PALETTE.violet}55`, borderRadius: 999, padding: '5px 12px', display: 'inline-block', marginBottom: 12 }}>
            namespace: kube-system (per component)
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14.5, fontWeight: 900, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '11px 14px' }}>
            {FIELDS.map((f) => <div key={f} style={{ marginBottom: 4 }}>{f}: …</div>)}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800, marginTop: 12, lineHeight: 1.4 }}>
            reader: <span style={{ color: PALETTE.violet }}>component replicas</span> — decides who is active
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>consequence: leadership → who acts</div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: compIn }}>
          <Label color={PALETTE.amber} size={13}>same fields, entirely different readers — and two Leases in two namespaces, doing unrelated work</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>treat them separately — a node-lease question is not a leadership question</Label>
        </div>
      </div>
    </div>
  );
};
