import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Reused from the pilot — eight nodes with per-node rejection reasons,
 * survivors scored, highest wins. Module 06 extends it additively (gated on
 * the module so pilot and modules 01–05 render unchanged): a 'preferred
 * affinity' badge lands on an already-eliminated node and changes nothing.
 */

const NODES = [
  { name: 'node-1', reason: 'taint' },
  { name: 'node-2', reason: null },
  { name: 'node-3', reason: 'insufficient cpu request' },
  { name: 'node-4', reason: null },
  { name: 'node-5', reason: null },
  { name: 'node-6', reason: 'no matching zone' },
  { name: 'node-7', reason: 'insufficient cpu request' },
  { name: 'node-8', reason: null },
];

const SCORES = [64, 91, 55];

export const SchedulerCycle: React.FC<VisualProps> = ({ module }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const module6 = module?.module.number === 6;

  const filtering = seg(t, 0.06, 0.42);
  const scoring = seg(t, 0.46, 0.62);
  const split = seg(t, 0.66, 1);

  // eliminate 5 nodes progressively during filtering
  const killedOrder = [0, 2, 5, 3, 6]; // indices eliminated
  const isKilled = (i: number) => {
    const pos = killedOrder.indexOf(i);
    if (pos < 0) return false;
    return filtering > (pos + 1) / killedOrder.length;
  };
  const killOpacity = (i: number) => {
    const pos = killedOrder.indexOf(i);
    if (pos < 0) return 0;
    return appear(filtering, pos / killedOrder.length, (pos + 1.4) / killedOrder.length);
  };

  const survivorScores = {
    1: Math.round(SCORES[0] * scoring),
    4: Math.round(SCORES[1] * scoring),
    7: Math.round(SCORES[2] * scoring),
  };
  const winner = 4; // highest

  const gauge = 0.15;
  const gaugeP = Math.round(15 * split);
  const allocP = Math.round(100 * Math.min(1, split * 3));

  // Module 06 extension: a preferred affinity badge lands on already-eliminated node-3.
  const badgeIn = appear(t, 0.74, 0.84);
  const affinityFooter = appear(t, 0.9, 0.96);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        // The stage's AbsoluteFill keeps its frame width (right: 76 is
        // ignored once width is set), so full-width rows would run past the
        // visible stage to the frame edge. The pilot path stays as-is; only
        // the module-06 render constrains its root to the visible stage.
        ...(module6 ? { width: 1768 } : {}),
      }}
    >
      <Label color={PALETTE.muted} size={12} style={{ margin: '0 0 18px' }}>
        phase 1 · filter vs allocatable · phase 2 · score
      </Label>

      {/* node grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, width: 1500, margin: '0 auto' }}>
        {NODES.map((n, i) => {
          const killed = isKilled(i);
          const kOp = killOpacity(i);
          const score = survivorScores[i as 1 | 4 | 7];
          const isWinner = i === winner && scoring > 0.4;
          const card = (
            <div
              key={n.name}
              style={{
                border: `2px solid ${isWinner ? PALETTE.good : killed || n.reason ? PALETTE.line : PALETTE.blue}`,
                borderRadius: 14,
                background: killed || n.reason ? '#0d131f' : `${PALETTE.blue}1a`,
                padding: '12px 14px',
                opacity: n.reason ? 1 - kOp * 0.7 : 1,
                position: 'relative',
                boxShadow: isWinner ? `0 0 0 4px ${PALETTE.good}66` : 'none',
              }}
            >
              <div style={{ fontFamily: MONO, color: killed || n.reason ? PALETTE.muted : PALETTE.ink, fontSize: 18, fontWeight: 800 }}>
                {n.name}
              </div>
              {n.reason && killed && (
                <div
                  style={{
                    fontFamily: MONO,
                    color: PALETTE.bad,
                    fontSize: 13,
                    fontWeight: 700,
                    marginTop: 6,
                    borderTop: `1px dashed ${PALETTE.bad}55`,
                    paddingTop: 5,
                    opacity: kOp,
                  }}
                >
                  ✕ {n.reason}
                </div>
              )}
              {score !== undefined && (
                <div
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 10,
                    fontFamily: MONO,
                    color: isWinner ? PALETTE.good : PALETTE.ink,
                    fontSize: 26,
                    fontWeight: 900,
                  }}
                >
                  {score}
                </div>
              )}
            </div>
          );

          if (!module6) return card;

          return (
            <div key={n.name} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              {card}
              {/* preferred affinity lands on eliminated node-3, in flow */}
              {i === 2 && (
                <div
                  style={{
                    opacity: badgeIn,
                    transform: `translateY(${(1 - badgeIn) * 10}px)`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      color: PALETTE.violet,
                      border: `1px solid ${PALETTE.violet}`,
                      background: `${PALETTE.violet}14`,
                      borderRadius: 999,
                      padding: '6px 14px',
                      fontSize: 14,
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                      boxShadow: badgeIn > 0.9 ? `0 0 16px ${PALETTE.violet}44` : 'none',
                    }}
                  >
                    ＋ preferred affinity
                  </span>
                  <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    lands on an eliminated node — changes nothing
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* split panel: actual vs requests */}
      <div style={{ display: 'flex', gap: 20, marginTop: 26, opacity: split }}>
        <Box pad={16} style={{ flex: 1, alignItems: 'center' }}>
          <Label color={PALETTE.muted} size={12}>measured CPU</Label>
          <Gauge pct={gaugeP} color={PALETTE.good} label="15%" />
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 18, fontWeight: 800, marginTop: 4 }}>actual</div>
        </Box>
        <Box pad={16} style={{ flex: 1, alignItems: 'center' }}>
          <Label color={PALETTE.muted} size={12}>allocated CPU requests</Label>
          <Bar pct={allocP} color={PALETTE.bad} label="100%" />
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 18, fontWeight: 800, marginTop: 4 }}>
            requests
          </div>
        </Box>
      </div>
      <div style={{ textAlign: 'center', marginTop: 12, opacity: appear(t, 0.74, 0.82) }}>
        <Label color={PALETTE.amber} size={13}>the scheduler reads the right-hand one — free dashboards are not evidence</Label>
      </div>
      {module6 && (
        <div style={{ textAlign: 'center', marginTop: 14, opacity: affinityFooter }}>
          <Label color={PALETTE.bad} size={13}>scoring never revisits filtering — a preferred affinity cannot rescue a Pod that was eliminated everywhere</Label>
        </div>
      )}
    </div>
  );
};

function Gauge({ pct, color, label }: { pct: number; color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <div style={{ width: 240, height: 18, borderRadius: 999, background: PALETTE.line, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontFamily: MONO, color, fontSize: 24, fontWeight: 900 }}>{label}</span>
    </div>
  );
}

function Bar({ pct, color, label }: { pct: number; color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <div style={{ width: 240, height: 18, borderRadius: 999, background: PALETTE.line, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontFamily: MONO, color, fontSize: 24, fontWeight: 900 }}>{label}</span>
    </div>
  );
}
