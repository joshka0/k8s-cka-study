import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const RULES = [
  { rule: 'match scope as narrowly as possible', icon: '🎯', failure: 'prevents blast radius' },
  { rule: 'pick failurePolicy from the domain', icon: '🧭', failure: 'prevents silent bypass' },
  { rule: 'budget the timeout against API latency', icon: '⏱', failure: 'prevents API latency' },
  { rule: 'run enough replicas for rolling updates', icon: '🛡', failure: 'prevents self-inflicted outage' },
  { rule: 'manage the certificate lifecycle', icon: '📜', failure: 'prevents 3am expiry' },
  { rule: 'keep the verdict deterministic', icon: '🔁', failure: 'prevents undebuggable' },
];

export const WebhookChecklist: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const card = appear(t, 0.08, 0.16);
  const rowIn = (i: number) => appear(t, 0.22 + i * 0.1, 0.28 + i * 0.1);
  const footer = appear(t, 0.86, 0.94);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 24, paddingLeft: 160, paddingRight: 160 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 28 }}>
        a design card, not a to-do list
      </Label>

      <Box pad={26} borderColor={PALETTE.blue} bg={`${PALETTE.blue}08`} style={{ width: 1180, margin: '0 auto', borderRadius: 26, opacity: card }}>
        <Label color={PALETTE.blueInk} size={13} style={{ marginBottom: 18 }}>before you write a webhook</Label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {RULES.map((r, i) => {
            const on = rowIn(i);
            return (
              <div
                key={r.rule}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '12px 18px',
                  border: `1px solid ${on ? `${PALETTE.good}66` : PALETTE.line}`,
                  borderRadius: 14,
                  background: on ? `${PALETTE.good}0e` : 'transparent',
                  opacity: on,
                  transform: `translateY(${(1 - on) * 12}px)`,
                }}
              >
                <span style={{ fontSize: 24, width: 34 }}>{r.icon}</span>
                <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 21, fontWeight: 900, flex: 1 }}>
                  {r.rule}
                </span>
                <span style={{ fontFamily: MONO, color: on ? PALETTE.good : PALETTE.muted, fontSize: 16, fontWeight: 800 }}>
                  ✓ {r.failure}
                </span>
              </div>
            );
          })}
        </div>
      </Box>

      <div style={{ textAlign: 'center', marginTop: 28, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>every item prevents a specific failure — if you cannot name it, leave it out</Label>
      </div>
    </div>
  );
};
