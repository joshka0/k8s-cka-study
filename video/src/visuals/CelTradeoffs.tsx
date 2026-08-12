import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 18 beat 6 — safer, not free. What the in-process policy removes
 * (Service, DNS, TLS, deadline) on one side; what it does not remove (matching
 * scope, expression cost, failure policy, validation-only) on the other. Two
 * columns of equal weight — a trade, not an upgrade.
 */

const REMOVES = ['Service', 'DNS', 'TLS', 'deadline'];
const REMAINS = ['matching scope', 'expression cost', 'failure policy', 'validation-only'];

export const CelTradeoffs: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const removesIn = appear(t, 0.08, 0.16);
  const remainsIn = appear(t, 0.2, 0.3);
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
          <Label color={PALETTE.cyan} size={13}>operationally safer, but not free — a trade with equal weight on both sides</Label>
        </div>

        {/* removes */}
        <div style={{ position: 'absolute', left: 140, top: 90, width: 660, borderRadius: 20, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}06`, padding: '22px 26px', opacity: removesIn }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 14 }}>what the in-process policy removes</Label>
          {REMOVES.map((r) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.good}44`, borderRadius: 10, background: '#0d1522', padding: '12px 14px', marginBottom: 10 }}>
              <span style={{ color: PALETTE.good, fontWeight: 900 }}>✕</span>
              {r}
              <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 12, fontWeight: 700, color: PALETTE.muted }}>no longer on the path</span>
            </div>
          ))}
        </div>

        {/* remains */}
        <div style={{ position: 'absolute', right: 140, top: 90, width: 660, borderRadius: 20, border: `2px solid ${PALETTE.amber}`, background: `${PALETTE.amber}06`, padding: '22px 26px', opacity: remainsIn }}>
          <Label color={PALETTE.amber} size={12} style={{ marginBottom: 14 }}>what it does not remove</Label>
          {REMAINS.map((r) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.amber}44`, borderRadius: 10, background: '#0d1522', padding: '12px 14px', marginBottom: 10 }}>
              <span style={{ color: PALETTE.amber, fontWeight: 900 }}>●</span>
              {r}
              <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 12, fontWeight: 700, color: PALETTE.muted }}>still your design work</span>
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: remainsIn }}>
          <Label color={PALETTE.amber} size={13}>it removes the network dependency — not the matching, costing and failure-design decisions</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>validation only: it can reject, never mutate — scope carefully, cost the expressions, choose failure policy consciously</Label>
        </div>
      </div>
    </div>
  );
};
