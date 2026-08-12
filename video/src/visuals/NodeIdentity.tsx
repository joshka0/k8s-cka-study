import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 21 beat 4 — a node is an authenticated principal. The bootstrap
 * sequence is an identity being minted: temporary token, CSR submitted,
 * certificate issued, identity named. The Node object appears only after the
 * credential, and the identity convention — system:node:<name> in
 * system:nodes — is what authorization keys on.
 */

const STEPS = [
  { n: '01', title: 'temporary token', detail: 'a bootstrap token with a one-time purpose', color: PALETTE.blue },
  { n: '02', title: 'CSR submitted', detail: 'kubelet requests a client certificate', color: PALETTE.violet },
  { n: '03', title: 'certificate issued', detail: 'signed client cert — the credential', color: PALETTE.cyan },
  { n: '04', title: 'identity named', detail: 'system:node:<name> · system:nodes', color: PALETTE.good },
];

export const NodeIdentity: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const stepOn = STEPS.map((_, i) => appear(t, 0.08 + i * 0.1, 0.16 + i * 0.1));
  const nodeAfter = appear(t, 0.56, 0.66);
  const tag = appear(t, 0.7, 0.8);
  const footer = appear(t, 0.86, 0.93);

  const nodeIn = seg(t, 0.56, 0.66);

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
      <div style={{ width: 1680, height: 730, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>a node is a principal the API authenticates — the credentials come first</Label>
        </div>

        {/* the four minting steps */}
        <div style={{ position: 'absolute', left: 60, top: 56, display: 'flex', flexDirection: 'column', gap: 18, width: 980 }}>
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                borderRadius: 14,
                border: `2px solid ${s.color}55`,
                background: `${s.color}06`,
                padding: '14px 18px',
                opacity: stepOn[i],
                transform: `translateX(${(1 - stepOn[i]) * -16}px)`,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: s.color, border: `1px solid ${s.color}`, borderRadius: 10, padding: '6px 10px' }}>
                {s.n}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 900, color: PALETTE.ink }}>{s.title}</div>
                <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.muted, marginTop: 3 }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* the Node object appearing after */}
        <div
          style={{
            position: 'absolute',
            left: 1120,
            top: 120,
            width: 500,
            borderRadius: 18,
            border: `2px solid ${PALETTE.cyan}`,
            background: `${PALETTE.cyan}0a`,
            padding: 22,
            textAlign: 'center',
            opacity: nodeAfter,
            transform: `translateY(${(1 - nodeIn) * -18}px)`,
          }}
        >
          <Label color={PALETTE.good} size={11}>only after the credential</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 24, fontWeight: 900, marginTop: 10 }}>Node object</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14.5, fontWeight: 700, marginTop: 8, lineHeight: 1.5 }}>
            created / updated only once the kubelet can authenticate for itself
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 1120,
            top: 120,
            width: 500,
            textAlign: 'center',
            fontFamily: MONO,
            fontSize: 16,
            fontWeight: 800,
            color: PALETTE.good,
            opacity: nodeAfter > 0 ? 0 : 1,
          }}
        >
          <div style={{ marginTop: 40, fontFamily: MONO, fontSize: 14, color: PALETTE.muted }}>
            (no Node yet — nothing exists to describe)
          </div>
        </div>

        {/* the convention tag */}
        <div
          style={{
            position: 'absolute',
            left: 1120,
            top: 320,
            width: 500,
            borderRadius: 16,
            border: `2px solid ${PALETTE.amber}`,
            background: `${PALETTE.amber}0a`,
            padding: 18,
            textAlign: 'center',
            opacity: tag,
          }}
        >
          <Label color={PALETTE.amber} size={11}>the identity convention — what authz keys on</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, marginTop: 10 }}>
            user: system:node:{"<name>"}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, marginTop: 6 }}>
            group: system:nodes
          </div>
        </div>

        <div style={{ position: 'absolute', left: 1120, top: 480, width: 500, opacity: tag }}>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.muted, lineHeight: 1.5 }}>
            the Node object existing is not the beginning of trust — the credential is
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>identity is minted, then the object — never the other way around</Label>
        </div>
      </div>
    </div>
  );
};
