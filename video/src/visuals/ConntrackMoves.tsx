import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 08 beat 7 — the requirement does not go away. The requirement is
 * drawn once, in the centre, unchanged: "remember which flow this packet
 * belongs to". Two implementations beneath it hold the same state — the
 * netfilter conntrack table and BPF maps. CORRECTION applied: this is not a
 * universal migration — some products move state to BPF maps, others keep
 * kernel conntrack for some traffic or modes. The fixed requirement is the
 * argument.
 */

const FLOW = 'pkt 5-tuple ↔ reply';

export const ConntrackMoves: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const reqIn = appear(t, 0.06, 0.14);
  const implIn = appear(t, 0.14, 0.24);
  const splitIn = seg(t, 0.24, 0.36);
  const toBpf = seg(t, 0.34, 0.48);
  const keepNf = seg(t, 0.42, 0.54);
  const footer = appear(t, 0.8, 0.88);

  const pulse = 0.5 + 0.5 * Math.sin(frame / 8);

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
      <div style={{ width: 1620, height: 620, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>a related claim: that an eBPF data plane removes connection tracking — separate the implementation from the requirement</Label>
        </div>

        {/* the requirement — fixed */}
        <div
          style={{
            position: 'absolute',
            left: 350,
            top: 46,
            width: 920,
            height: 132,
            borderRadius: 18,
            border: `2px solid ${PALETTE.cyan}`,
            background: `${PALETTE.cyan}0e`,
            boxShadow: `0 0 30px ${PALETTE.cyan}33`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: reqIn,
          }}
        >
          <Label color={PALETTE.cyan} size={11} style={{ marginBottom: 10 }}>the requirement — unchanged, whatever the implementation</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 30, fontWeight: 900 }}>
            remember which flow this packet belongs to
          </div>
        </div>

        {/* split into two implementation choices */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 196, textAlign: 'center', opacity: splitIn > 0 ? 1 : 0.4 }}>
          <Label color={PALETTE.muted} size={12} style={{ textTransform: 'none', letterSpacing: 0 }}>
            same requirement — implementation-dependent where the state lives
          </Label>
        </div>

        {/* netfilter conntrack — kept by some products */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 250,
            width: 660,
            borderRadius: 18,
            border: `2px solid ${PALETTE.violet}`,
            background: `${PALETTE.violet}0a`,
            padding: '20px 24px',
            opacity: implIn,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 21, fontWeight: 900 }}>netfilter conntrack table</span>
            <span style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 13, fontWeight: 800 }}>kernel</span>
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: MONO,
              fontSize: 15,
              fontWeight: 800,
              color: keepNf > 0.5 ? PALETTE.ink : PALETTE.muted,
              border: `1px solid ${PALETTE.violet}55`,
              borderRadius: 12,
              background: '#0c111c',
              padding: '14px 16px',
              opacity: Math.max(0.55, keepNf),
            }}
          >
            <Label color={PALETTE.amber} size={10.5} style={{ marginBottom: 6 }}>some products keep it for some traffic or modes</Label>
            {keepNf > 0.3 && (
              <div style={{ color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>
                <span style={{ opacity: 0.6 + 0.4 * pulse }}>●</span> {FLOW}
              </div>
            )}
          </div>
        </div>

        {/* BPF maps — where other products hold the state */}
        <div
          style={{
            position: 'absolute',
            right: 120,
            top: 250,
            width: 660,
            borderRadius: 18,
            border: `2px solid ${PALETTE.good}`,
            background: `${PALETTE.good}0a`,
            padding: '20px 24px',
            opacity: implIn,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 21, fontWeight: 900 }}>BPF maps</span>
            <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 13, fontWeight: 800 }}>eBPF data plane</span>
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: MONO,
              fontSize: 15,
              fontWeight: 800,
              border: `1px solid ${PALETTE.good}55`,
              borderRadius: 12,
              background: '#0c111c',
              padding: '14px 16px',
              opacity: Math.max(0.4, toBpf),
            }}
          >
            <Label color={PALETTE.good} size={10.5} style={{ marginBottom: 6 }}>some products move the same state here</Label>
            {toBpf > 0.4 && (
              <div style={{ color: PALETTE.good, fontSize: 16, fontWeight: 900 }}>
                <span style={{ opacity: 0.6 + 0.4 * pulse }}>●</span> {FLOW}
              </div>
            )}
          </div>
        </div>

        {/* animation tags */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 460, display: 'flex', justifyContent: 'center', gap: 120, opacity: toBpf > 0.3 ? 1 : 0.4 }}>
          <span style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 14, fontWeight: 800 }}>
            keeps kernel conntrack — traffic or modes
          </span>
          <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 14, fontWeight: 800 }}>
            replaces it with BPF maps
          </span>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 540, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>something still has to remember the connection — check the product, and check the mode: the requirement never moves</Label>
        </div>
      </div>
    </div>
  );
};
