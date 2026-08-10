import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 09 beat 10 — what Ready has not proven. One green Ready badge at
 * the top, and beneath it the seven things it says nothing about, each with
 * its own unknown state. The single green light against seven unknowns is
 * the whole argument — the unknowns get equal visual weight.
 */

const UNKNOWNS = [
  { name: 'Service routing', note: 'to the DNS Service — unproven' },
  { name: 'watch freshness', note: 'the watch stays fresh — unproven' },
  { name: 'record correctness', note: 'of answers later — unproven' },
  { name: 'upstream health', note: 'for forwarded names — unproven' },
  { name: 'cache freshness', note: 'in or out — unproven' },
  { name: 'node-local path', note: 'between app and CoreDNS — unproven' },
  { name: 'client resolver behaviour', note: 'of the Pod asking — unproven' },
];

const CARD_W = 372;
const GAP = 20;

export const ReadyProvesLittle: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const badgeIn = appear(t, 0.06, 0.14);
  const cardOn = UNKNOWNS.map((_, i) => appear(t, 0.16 + i * 0.07, 0.24 + i * 0.07));
  const footer = appear(t, 0.84, 0.92);

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
      <div style={{ width: 1620 }}>
        <div style={{ textAlign: 'center', marginBottom: 22, opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>CoreDNS reports Ready — that is one thing, and one thing only</Label>
        </div>

        {/* the single green light */}
        <div style={{ textAlign: 'center', opacity: badgeIn, marginBottom: 30 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: MONO,
              color: PALETTE.good,
              fontSize: 24,
              fontWeight: 900,
              border: `2px solid ${PALETTE.good}`,
              borderRadius: 999,
              background: `${PALETTE.good}0c`,
              padding: '12px 26px',
              boxShadow: `0 0 26px ${PALETTE.good}44`,
            }}
          >
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: PALETTE.good }} />
            Ready ✓ — the readiness check passed, after an initial API sync
          </div>
        </div>

        {/* the seven unknowns */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: GAP }}>
          {[0, 1].map((row) => {
            const rowItems = row === 0 ? UNKNOWNS.slice(0, 4) : UNKNOWNS.slice(4);
            return (
              <div key={row} style={{ display: 'flex', gap: GAP, justifyContent: 'center' }}>
                {rowItems.map((u) => {
                  const i = UNKNOWNS.indexOf(u);
                  const on = cardOn[i];
                  return (
                    <div
                      key={u.name}
                      style={{
                        width: CARD_W,
                        minHeight: 132,
                        borderRadius: 16,
                        border: `2px solid ${on > 0.5 ? PALETTE.amber : PALETTE.line}`,
                        background: on > 0.5 ? `${PALETTE.amber}08` : PALETTE.panel,
                        padding: '16px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        opacity: Math.max(0.3, on),
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, lineHeight: 1.25 }}>
                          {u.name}
                        </span>
                        <span
                          style={{
                            flex: '0 0 auto',
                            fontFamily: MONO,
                            fontSize: 26,
                            fontWeight: 900,
                            color: PALETTE.amber,
                            border: `1px solid ${PALETTE.amber}66`,
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `${PALETTE.amber}10`,
                          }}
                        >
                          ?
                        </span>
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: PALETTE.muted, marginTop: 10, lineHeight: 1.35 }}>
                        says nothing about {u.note}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 30, opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>one green light, seven unknowns — Ready has not proven Service routing, watch health, record truth or anything the client will do</Label>
        </div>
      </div>
    </div>
  );
};
