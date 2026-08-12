import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 27 beat 3 — passing Restricted is not a claim. A small Restricted
 * pass badge at the centre, with everything it does not cover arranged around
 * it: runtime enforcement, network, identity, image provenance, secrets. The
 * uncovered area gets far more visual weight than the badge.
 */

const NOT_COVERED = [
  { name: 'runtime enforcement', detail: 'whether the runtime/kernel apply the settings at all', color: PALETTE.amber },
  { name: 'network', detail: 'policy, exposure, egress — never looked at here', color: PALETTE.bad },
  { name: 'identity', detail: 'who is allowed in, RBAC, service accounts', color: PALETTE.bad },
  { name: 'image provenance', detail: 'where the image came from, its integrity', color: PALETTE.bad },
  { name: 'secrets', detail: 'how secrets are stored, mounted, rotated', color: PALETTE.bad },
];

export const PassedIsNotSecure: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const badgeIn = appear(t, 0.06, 0.12);
  const itemOn = NOT_COVERED.map((_, i) => appear(t, 0.2 + i * 0.1, 0.28 + i * 0.1));
  const footer = appear(t, 0.86, 0.94);

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
      <div style={{ width: 1680, height: 740, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>passing Restricted admission is a bounded baseline — not a complete security claim</Label>
        </div>

        {/* the central badge — deliberately small */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 68, textAlign: 'center', opacity: badgeIn }}>
          <div
            style={{
              display: 'inline-block',
              fontFamily: MONO,
              fontSize: 15,
              fontWeight: 900,
              color: PALETTE.good,
              border: `2px solid ${PALETTE.good}66`,
              borderRadius: 999,
              background: `${PALETTE.good}0a`,
              padding: '7px 18px',
            }}
          >
            ✓ passed Restricted
          </div>
        </div>

        {/* everything not covered — far more weight */}
        <div style={{ position: 'absolute', left: 180, top: 150, width: 1320 }}>
          <Label color={PALETTE.bad} size={12} style={{ textAlign: 'center', marginBottom: 14 }}>what this never looked at — the dominant surface</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {NOT_COVERED.map((n, i) => (
              <div
                key={n.name}
                style={{
                  borderRadius: 14,
                  border: `2px solid ${n.color}66`,
                  background: `${n.color}08`,
                  padding: '16px 18px',
                  opacity: itemOn[i],
                  transform: `translateY(${(1 - itemOn[i]) * 10}px)`,
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: PALETTE.ink }}>{n.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 6, lineHeight: 1.4 }}>{n.detail}</div>
                <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: n.color, marginTop: 10 }}>
                  ✕ separate control
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: appear(t, 0.8, 0.88) }}>
          <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.5 }}>
            the standards are a bounded baseline, and admission checked a spec, not a running process
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>passing the badge is one box in a much larger matrix — read the uncovered surface</Label>
        </div>
      </div>
    </div>
  );
};
