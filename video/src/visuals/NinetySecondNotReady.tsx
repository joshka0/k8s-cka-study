import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 20 beat 4 — the ninety-second version. Five ordered checks building
 * as a card, each with the command or artefact beside it. The clock is made
 * explicit — it is the one people skip and it produces certificate failures
 * that look like something else.
 */

const CHECKS = [
  { n: '1', what: 'conditions, taints, the Lease', artefact: 'kubectl describe node / get node', color: PALETTE.blue },
  { n: '2', what: 'host reachability and the clock', artefact: 'ping + date / timedatectl', color: PALETTE.good, note: 'the one people skip — skewed clocks make certificates fail like they were revoked' },
  { n: '3', what: 'the kubelet', artefact: 'status, certificate & config errors', color: PALETTE.cyan },
  { n: '4', what: 'the runtime', artefact: 'container runtime responses', color: PALETTE.violet },
  { n: '5', what: 'the network plugin', artefact: 'CNI health & pod network', color: PALETTE.amber },
];

export const NinetySecondNotReady: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const checkOn = CHECKS.map((_, i) => appear(t, 0.08 + i * 0.06, 0.16 + i * 0.06));
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
      <div style={{ width: 1660, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>the compact NotReady sequence — five checks, ninety seconds, almost always the owner</Label>
        </div>

        {/* the card */}
        <div style={{ position: 'absolute', left: 120, top: 90, width: 1420, borderRadius: 22, border: `2px solid ${PALETTE.amber}55`, background: `${PALETTE.amber}05`, padding: '26px 30px' }}>
          {CHECKS.map((c, i) => {
            const on = checkOn[i];
            return (
              <div key={c.n} style={{ display: 'flex', alignItems: 'center', gap: 18, borderBottom: i < CHECKS.length - 1 ? `1px solid ${PALETTE.line}33` : 'none', padding: '12px 4px', opacity: Math.max(0.3, on) }}>
                <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 19, fontWeight: 900, color: c.color, border: `2px solid ${c.color}`, borderRadius: 999, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {c.n}
                </span>
                <span style={{ flex: '0 0 300px', fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>{c.what}</span>
                <span style={{ flex: '1', fontFamily: MONO, color: PALETTE.muted, fontSize: 14.5, fontWeight: 800 }}>{c.artefact}</span>
                {c.note && (
                  <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.good, border: `1px solid ${PALETTE.good}55`, borderRadius: 999, padding: '5px 10px', background: `${PALETTE.good}06`, maxWidth: 480 }}>
                    {c.note}
                  </span>
                )}
              </div>
            );
          })}
          <div style={{ marginTop: 16, textAlign: 'center', fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.amber }}>
            …then preserve the evidence, and restart what the evidence names — not what is easiest
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>almost always enough to name the owner — because the clock and the layers cut the search space</Label>
        </div>
      </div>
    </div>
  );
};
