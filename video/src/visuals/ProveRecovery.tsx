import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 11 beat 11 — a rehearsal checklist. Each step builds as named, each
 * with the failure it would have caught. 'New data directory, never over the
 * live one' is emphasised — that one is destructive when got wrong.
 */

const CHECKS = [
  {
    name: 'isolated environment',
    caught: 'a rehearsal that breaks the production cluster',
    warn: false,
  },
  {
    name: 'new data directory — never over the live one',
    caught: 'wiping the live data dir — destructive when got wrong',
    warn: true,
  },
  {
    name: 'API access rebuilt',
    caught: 'certificates and auth missing after restore',
    warn: false,
  },
  {
    name: 'critical objects and controllers validated',
    caught: 'a recovered cluster where nothing reconciles',
    warn: false,
  },
  {
    name: 'application data recovered',
    caught: 'volume data that no snapshot ever held',
    warn: false,
  },
  {
    name: 'measured against RPO and RTO',
    caught: 'a restore that is too slow — or too stale — to matter',
    warn: false,
  },
];

export const ProveRecovery: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const stepOn = CHECKS.map((_, i) => appear(t, 0.08 + i * 0.12, 0.16 + i * 0.12));
  const footer = appear(t, 0.92, 0.98);

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
      <div style={{ width: 1620, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>a restore is rehearsed, not assumed — each step catches a specific failure</Label>
        </div>

        <div style={{ position: 'absolute', left: 120, top: 66, width: 1380, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CHECKS.map((c, i) => {
            const on = stepOn[i];
            return (
              <div
                key={c.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  borderRadius: 14,
                  border: `2px solid ${on > 0.5 ? (c.warn ? PALETTE.bad : PALETTE.good) : PALETTE.line}`,
                  background: on > 0.5 ? (c.warn ? `${PALETTE.bad}0a` : `${PALETTE.good}06`) : PALETTE.panel,
                  padding: '12px 18px',
                  opacity: Math.max(0.3, on),
                  boxShadow: c.warn && on > 0.5 ? `0 0 20px ${PALETTE.bad}33` : 'none',
                }}
              >
                <span
                  style={{
                    flex: '0 0 30px',
                    fontFamily: MONO,
                    fontSize: 17,
                    fontWeight: 900,
                    color: on > 0.5 ? (c.warn ? PALETTE.bad : PALETTE.good) : PALETTE.muted,
                  }}
                >
                  {on > 0.5 ? '✓' : '○'}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 19,
                      fontWeight: 900,
                      color: c.warn ? PALETTE.bad : PALETTE.ink,
                      lineHeight: 1.3,
                    }}
                  >
                    {i + 1}. {c.name}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.muted, marginTop: 4, lineHeight: 1.4 }}>
                    would have caught: {c.caught}
                  </div>
                </div>
                {c.warn && (
                  <span
                    style={{
                      flex: '0 0 auto',
                      fontFamily: MONO,
                      fontSize: 12,
                      fontWeight: 900,
                      color: PALETTE.bad,
                      border: `1px solid ${PALETTE.bad}66`,
                      borderRadius: 999,
                      padding: '5px 12px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    destructive when got wrong
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the checklist is the rehearsal — run it before you need it, and each step names the failure it exists to catch</Label>
        </div>
      </div>
    </div>
  );
};
