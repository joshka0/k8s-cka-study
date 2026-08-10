import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { LANES, PALETTE } from '../theme';
import { Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { seg } from '../motion';

/**
 * The fourteen segments the narration lists, grouped into the three passes the
 * request actually makes: control plane, down to the node, then back up and out
 * to the caller. Rows beat a single 14-column strip — the labels vary in width
 * by 4x, so a fixed slot either clips them or shrinks the type past legibility.
 *
 * Module 12 extension (the payoff frame, gated on module number 12): the spine
 * walks once in course order, and as each module's segment lights, the strip
 * surfaces the characteristic failure signature taught in that module — write
 * refused, nothing reconciles, no node name, no address, resolves but nothing
 * answers. Pilot renders are unchanged.
 */

const ROWS: { lane: string; caption: string; names: string[] }[] = [
  {
    lane: 'control',
    caption: 'decide what should exist',
    names: ['desired object', 'admission / storage', 'watch + cache', 'controller queue', 'scheduler queue + binding'],
  },
  {
    lane: 'node',
    caption: 'make it real',
    names: ['kubelet', 'CRI', 'CNI', 'CSI'],
  },
  {
    lane: 'pod',
    caption: 'expose it, reach it',
    names: ['EndpointSlice', 'service', 'DNS', 'data plane', 'application'],
  },
];

const TOTAL = ROWS.reduce((n, r) => n + r.names.length, 0);

/** Which spine ordinal each course module lives on. */
const MODULE_SEGMENT: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 4, 6: 5, 7: 6, 8: 8, 9: 12, 10: 9, 11: 2, 12: 1,
};

/** The characteristic failure signature taught in each module. */
const MODULE_SIGNATURE: Record<number, string> = {
  1: 'write refused — admission and validation gates',
  2: 'rejected before storage — admission or webhook',
  3: 'nothing reconciles — watch or cache stale',
  4: 'replicas never converge — spec and status disagree',
  5: 'a new API that breaks every older client',
  6: 'no node name — Pending forever',
  7: 'running, not ready — phase green, health red',
  8: 'no address — ContainerCreating',
  9: 'resolves but nothing answers',
  10: 'claims Pending, volume never mounts',
  11: 'writes die at the storage layer — quorum lost',
  12: 'no ground truth — audit off, nothing to recover',
};

export const SpineRecap: React.FC<VisualProps> = ({ module }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const isFinale = module?.module.number === 12;

  const assemble = seg(t, 0.06, isFinale ? 0.34 : 0.6);
  const loops = seg(t, 0.62, 0.72);
  const titleIn = seg(t, 0.82, 0.94);

  // Module 12: walk the twelve modules in course order after assembly.
  const walk = seg(t, 0.4, 0.92);
  const walkIdx = Math.min(11, Math.floor(walk * 12));
  const walkModule = walkIdx + 1;
  const walkSegment = MODULE_SEGMENT[walkModule];

  const laneColor = (lane: string) => (LANES[lane] ? LANES[lane].color : PALETTE.ink);
  let ordinal = 0;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 46 }}>
        {isFinale
          ? 'the spine — every failure you have studied has a home segment, and often only one'
          : 'the spine — every stage async · observable · retryable · none in charge of the next'}
      </Label>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', columnGap: 28, rowGap: 34, alignItems: 'center', justifyContent: 'center' }}>
        {ROWS.map((row) => {
          const c = laneColor(row.lane);
          const rowStart = ordinal;
          ordinal += row.names.length;
          const rowRevealed = assemble * TOTAL > rowStart;

          return (
            <React.Fragment key={row.lane}>
              {/* lane gutter — the loop icon belongs to its row, not to open space */}
              <div style={{ textAlign: 'right', opacity: rowRevealed ? 1 : 0.25 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: MONO, fontSize: 19, fontWeight: 800, color: c }}>
                    {LANES[row.lane]?.label ?? row.lane}
                  </span>
                  {!isFinale && <span style={{ color: c, fontSize: 30, opacity: loops }}>↻</span>}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 14, color: PALETTE.muted, marginTop: 3 }}>{row.caption}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'nowrap' }}>
                {row.names.map((name, i) => {
                  const idx = rowStart + i;
                  const segi = idx + 1;
                  const on = assemble * TOTAL > idx + 1;
                  const walkHit = isFinale && segi === walkSegment && walk > 0.35;
                  return (
                    <React.Fragment key={name}>
                      {i > 0 && (
                        <span style={{ color: on ? c : PALETTE.line, fontSize: 22, fontWeight: 900, opacity: on ? 0.8 : 0.3 }}>
                          →
                        </span>
                      )}
                      <div
                        style={{
                          fontFamily: MONO,
                          fontSize: 21,
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          color: on ? PALETTE.ink : PALETTE.line,
                          background: on ? `${c}22` : 'transparent',
                          border: `1px solid ${walkHit ? c : on ? `${c}66` : '#16202f'}`,
                          borderBottom: `3px solid ${walkHit ? c : on ? c : '#16202f'}`,
                          borderRadius: 8,
                          padding: '13px 20px 11px',
                          opacity: on ? 1 : 0.25,
                          transform: walkHit
                            ? 'scale(1.06)'
                            : on
                              ? 'none'
                              : 'translateY(6px)',
                          boxShadow: walkHit ? `0 0 26px ${c}66` : 'none',
                        }}
                      >
                        {name}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* module 12: the failure signature strip */}
      <div
        style={{
          marginTop: isFinale ? 36 : 56,
          minHeight: isFinale ? 92 : 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isFinale ? titleIn : undefined,
        }}
      >
        {isFinale && walk > 0.35 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 18,
              borderRadius: 14,
              border: `2px solid ${PALETTE.amber}66`,
              background: `${PALETTE.amber}0a`,
              padding: '14px 26px',
              minWidth: 900,
              justifyContent: 'center',
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.amber, whiteSpace: 'nowrap' }}>
              module {walkModule} · {MODULE_SIGNATURE[walkModule]}
            </span>
          </div>
        )}
        {isFinale && walk <= 0.35 && (
          <Label color={PALETTE.muted} size={13}>walking the spine — each module's characteristic failure surfaces as its segment lights</Label>
        )}

        <div style={{ textAlign: 'center', marginTop: isFinale ? 22 : 0, opacity: isFinale ? titleIn : titleIn }}>
          <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 38, fontWeight: 900, letterSpacing: '-0.02em' }}>
            INTENT TO PACKET
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 16, fontWeight: 700, marginTop: 6 }}>
            kubernetes beyond yaml — interactive architecture course
          </div>
        </div>
      </div>
    </div>
  );
};
