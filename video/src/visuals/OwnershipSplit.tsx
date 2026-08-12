import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 15 beat 3 — who owns which object. Two ownership zones as distinct
 * territories: platform owns GatewayClass and Gateway; application teams own
 * Routes and attach them explicitly. Attachment is an explicit link with
 * status on both ends. Contrasted with Ingress — a single object both teams
 * must edit together.
 */

export const OwnershipSplit: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const zonesIn = appear(t, 0.08, 0.16);
  const linkIn = appear(t, 0.2, 0.3);
  const contrastIn = appear(t, 0.5, 0.62);
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
      <div style={{ width: 1700, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>Gateway API's strongest addition over Ingress — separate ownership, explicit attachment</Label>
        </div>

        {/* platform zone */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 70,
            width: 520,
            borderRadius: 20,
            border: `2px solid ${PALETTE.blue}`,
            background: `${PALETTE.blue}08`,
            padding: '18px 22px',
            opacity: zonesIn,
          }}
        >
          <Label color={PALETTE.blueInk} size={12} style={{ marginBottom: 12 }}>platform team</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, border: `1px solid ${PALETTE.blue}55`, borderRadius: 8, padding: '9px 12px', marginBottom: 8, background: '#0d1522' }}>
            GatewayClass — the implementation
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, border: `1px solid ${PALETTE.blue}55`, borderRadius: 8, padding: '9px 12px', background: '#0d1522' }}>
            Gateway — infrastructure + its listeners
          </div>
        </div>

        {/* app zone */}
        <div
          style={{
            position: 'absolute',
            right: 120,
            top: 70,
            width: 560,
            borderRadius: 20,
            border: `2px solid ${PALETTE.cyan}`,
            background: `${PALETTE.cyan}08`,
            padding: '18px 22px',
            opacity: zonesIn,
          }}
        >
          <Label color={PALETTE.cyan} size={12} style={{ marginBottom: 12 }}>application teams</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, border: `1px solid ${PALETTE.cyan}55`, borderRadius: 8, padding: '9px 12px', background: '#0d1522' }}>
            Routes — their own, attached explicitly
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8 }}>
            attach to the Gateway and read status on your own Route
          </div>
        </div>

        {/* the attachment link */}
        <div
          style={{
            position: 'absolute',
            left: 655,
            top: 210,
            width: 390,
            textAlign: 'center',
            opacity: linkIn,
          }}
        >
          <div style={{ color: PALETTE.good, fontSize: 30, fontWeight: 900 }}>⟷</div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 800,
              color: PALETTE.good,
              border: `1px solid ${PALETTE.good}66`,
              borderRadius: 10,
              background: `${PALETTE.good}08`,
              padding: '8px 12px',
              marginTop: 8,
            }}
          >
            attachment = a declared relationship,<br />status on both ends
          </div>
        </div>

        {/* contrast with ingress */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 440,
            width: 1300,
            borderRadius: 18,
            border: `2px solid ${PALETTE.amber}66`,
            background: `${PALETTE.amber}06`,
            padding: '18px 26px',
            opacity: contrastIn,
          }}
        >
          <Label color={PALETTE.amber} size={12} style={{ marginBottom: 12 }}>the contrast — Ingress: a single object both teams must edit</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, border: `1px solid ${PALETTE.amber}66`, borderRadius: 8, padding: '12px 18px', background: '#0d1522' }}>
              Ingress — one shared object
            </div>
            <span style={{ color: PALETTE.amber, fontWeight: 900 }}>→</span>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800, lineHeight: 1.4 }}>
              annotations and route rules piled into it<br />by everyone who needs a path
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>ownership is the declared relationship — not a pile of annotations in one shared object</Label>
        </div>
      </div>
    </div>
  );
};
