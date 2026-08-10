import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 08 beat 10 — where the address comes from. The main plugin receives
 * the ADD; inside it sits a clearly nested IPAM call that returns address,
 * gateway and routes, and the main plugin applies those to the interface.
 * CORRECTION applied: delegation is optional — the delegated path is drawn as
 * one option beside an implementation that allocates through its own node
 * agent. Nesting is genuine containment at full type scale, not a footnote.
 */

export const IpamDelegation: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const mainIn = appear(t, 0.06, 0.14);
  const addIn = seg(t, 0.12, 0.2);
  const nestedIn = seg(t, 0.18, 0.32);
  const applyIn = seg(t, 0.32, 0.44);
  const optionalIn = appear(t, 0.46, 0.56);
  const agentPath = seg(t, 0.58, 0.72);
  const footer = appear(t, 0.8, 0.88);

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
      <div style={{ width: 1620, height: 680, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>a network plugin can delegate address allocation to an IPAM plugin — delegation is optional</Label>
        </div>

        {/* the main plugin — with the nested IPAM call inside */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 52,
            width: 1220,
            borderRadius: 20,
            border: `2px solid ${PALETTE.violet}`,
            background: `${PALETTE.violet}0c`,
            padding: '22px 28px',
            opacity: mainIn,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 24, fontWeight: 900 }}>main plugin</span>
            <span
              style={{
                fontFamily: MONO,
                color: addIn > 0.5 ? PALETTE.cyan : PALETTE.muted,
                fontSize: 16,
                fontWeight: 900,
                border: `1px solid ${PALETTE.cyan}66`,
                borderRadius: 999,
                background: `${PALETTE.cyan}0d`,
                padding: '8px 16px',
              }}
            >
              receives ADD
            </span>
          </div>

          {/* the nested IPAM exec — genuine containment */}
          <div
            style={{
              marginLeft: 46,
              borderLeft: `3px solid ${PALETTE.good}88`,
              paddingLeft: 26,
              opacity: nestedIn,
              transform: `translateY(${(1 - nestedIn) * 14}px)`,
            }}
          >
            <div
              style={{
                border: `2px solid ${PALETTE.good}`,
                borderRadius: 16,
                background: `${PALETTE.good}0e`,
                padding: '18px 24px',
                boxShadow: `0 0 22px ${PALETTE.good}33`,
              }}
            >
              <Label color={PALETTE.good} size={11} style={{ marginBottom: 6 }}>nested IPAM call — inside the plugin, one level down</Label>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>
                ipam plugin <span style={{ color: PALETTE.muted, fontWeight: 700 }}>receives the full configuration</span>
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 19, fontWeight: 900, marginTop: 10 }}>
                ↳ returns {nestedIn > 0.5 ? '{ address, gateway, routes }' : '…'}
              </div>
            </div>
          </div>

          {/* the main plugin applies them to the interface */}
          <div
            style={{
              marginTop: 20,
              borderRadius: 14,
              border: `1px solid ${PALETTE.cyan}77`,
              background: '#0c111c',
              padding: '14px 20px',
              opacity: applyIn,
            }}
          >
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700 }}>then the main plugin applies those to the interface</div>
            <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 18, fontWeight: 900, marginTop: 4 }}>
              eth0 ← 10.0.0.16 · gateway · routes
            </div>
          </div>
        </div>

        {/* delegation is one option — optionality */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 392, textAlign: 'center', opacity: optionalIn }}>
          <Label color={PALETTE.amber} size={13}>delegation is one option — other implementations allocate through their own node agent instead</Label>
        </div>

        {/* option A — delegate */}
        <div
          style={{
            position: 'absolute',
            left: 160,
            top: 424,
            width: 620,
            borderRadius: 16,
            border: `2px solid ${PALETTE.good}88`,
            background: `${PALETTE.good}08`,
            padding: '16px 22px',
          }}
        >
          <Label color={PALETTE.good} size={11} style={{ marginBottom: 6 }}>option — delegate to an IPAM plugin</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16.5, fontWeight: 800, lineHeight: 1.4 }}>
            ipam exec returns address, gateway and routes to the main plugin
          </div>
        </div>

        {/* option B — own node agent */}
        <div
          style={{
            position: 'absolute',
            right: 160,
            top: 424,
            width: 620,
            borderRadius: 16,
            border: `2px solid ${PALETTE.cyan}88`,
            background: `${PALETTE.cyan}08`,
            padding: '16px 22px',
            opacity: Math.max(0.35, agentPath),
          }}
        >
          <Label color={PALETTE.cyan} size={11} style={{ marginBottom: 6 }}>option — allocate through the node agent</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16.5, fontWeight: 800, lineHeight: 1.4 }}>
            the implementation's own daemon hands out the address — no separate IPAM exec
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>so the address does not always come from where you expect — ask which path this implementation uses</Label>
        </div>
      </div>
    </div>
  );
};
