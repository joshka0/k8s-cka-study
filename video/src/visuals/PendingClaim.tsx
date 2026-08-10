import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 10 beat 3 — a Pending claim, four candidate causes. Each cause has
 * the specific evidence that confirms or eliminates it, at full type scale.
 * A discarded non-signal sits apart, struck through: replica count tells you
 * nothing about any of these.
 */

const CAUSES = [
  {
    name: 'waiting deliberately',
    why: 'nothing consumes the claim yet',
    check: 'check — binding mode + is any Pod referencing this PVC?',
    color: PALETTE.cyan,
  },
  {
    name: 'no capacity',
    why: 'the provisioner creates nothing',
    check: 'check — provisioner events: “out of capacity” · no matching PV',
    color: PALETTE.amber,
  },
  {
    name: 'rejected by quota',
    why: 'the namespace itself refuses the object',
    check: 'check — ResourceQuota events in the namespace',
    color: PALETTE.violet,
  },
  {
    name: 'no topologically compatible node',
    why: 'no node satisfies both pod and storage constraints',
    check: 'check — scheduling events: “no node satisfies storage topology”',
    color: PALETTE.bad,
  },
];

export const PendingClaim: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const claimIn = appear(t, 0.06, 0.14);
  const causeOn = CAUSES.map((_, i) => appear(t, 0.2 + i * 0.12, 0.3 + i * 0.12));
  const discardIn = appear(t, 0.78, 0.86);
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
      <div style={{ width: 1620, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>PVC Pending — four candidate causes, each with evidence that confirms or eliminates it</Label>
        </div>

        {/* the pending claim */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center', opacity: claimIn }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              fontFamily: MONO,
              color: PALETTE.ink,
              fontSize: 24,
              fontWeight: 900,
              border: `2px solid ${PALETTE.amber}`,
              borderRadius: 999,
              background: `${PALETTE.amber}0c`,
              padding: '12px 26px',
              boxShadow: `0 0 24px ${PALETTE.amber}33`,
            }}
          >
            PVC <span style={{ color: PALETTE.amber }}>Pending</span>
          </div>
        </div>

        {/* fanning out */}
        <div style={{ position: 'absolute', left: 60, top: 160, width: 1500, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {CAUSES.map((c, i) => {
            const on = causeOn[i];
            return (
              <div
                key={c.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  borderRadius: 16,
                  border: `2px solid ${on > 0.5 ? c.color : PALETTE.line}`,
                  background: on > 0.5 ? `${c.color}0a` : PALETTE.panel,
                  padding: '14px 20px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <div style={{ width: 250, flex: '0 0 250px' }}>
                  <div style={{ fontFamily: MONO, color: c.color, fontSize: 20, fontWeight: 900 }}>{i + 1}. {c.name}</div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 4 }}>{c.why}</div>
                </div>
                <div
                  style={{
                    flex: 1,
                    fontFamily: MONO,
                    color: PALETTE.ink,
                    fontSize: 17.5,
                    fontWeight: 800,
                    borderLeft: `1px solid ${c.color}44`,
                    paddingLeft: 24,
                    lineHeight: 1.4,
                  }}
                >
                  {c.check}
                </div>
              </div>
            );
          })}
        </div>

        {/* the discarded non-signal */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 590,
            width: 1500,
            borderRadius: 14,
            border: `1px dashed ${PALETTE.line}`,
            padding: '16px 22px',
            textAlign: 'center',
            opacity: discardIn,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              color: PALETTE.muted,
              fontSize: 20,
              fontWeight: 800,
              textDecoration: 'line-through',
              textDecorationThickness: 2,
              textDecorationColor: PALETTE.bad,
            }}
          >
            workload replica count
          </span>
          <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 16, fontWeight: 700, marginLeft: 16 }}>
            tells you nothing about any of these — discard it
          </span>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 668, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>every cause has a named artefact with the distinguishing evidence on it — check the artefact, not the vibe</Label>
        </div>
      </div>
    </div>
  );
};
