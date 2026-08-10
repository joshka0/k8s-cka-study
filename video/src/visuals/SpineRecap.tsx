import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { LANES, PALETTE } from '../theme';
import { Label, MONO, SANS } from '../ui';
import type { Beat } from '../script';
import { seg } from '../motion';

/**
 * The fourteen segments the narration lists, grouped into the three passes the
 * request actually makes: control plane, down to the node, then back up and out
 * to the caller. Rows beat a single 14-column strip — the labels vary in width
 * by 4x, so a fixed slot either clips them or shrinks the type past legibility.
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

export const SpineRecap: React.FC<{ beat: Beat }> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const assemble = seg(t, 0.06, 0.60);
  const loops = seg(t, 0.62, 0.72);
  const titleIn = seg(t, 0.82, 0.94);

  const laneColor = (lane: string) => (LANES[lane] ? LANES[lane].color : PALETTE.ink);
  let ordinal = 0;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 46 }}>
        the spine — every stage async · observable · retryable · none in charge of the next
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
                  <span style={{ color: c, fontSize: 30, opacity: loops }}>↻</span>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 14, color: PALETTE.muted, marginTop: 3 }}>{row.caption}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'nowrap' }}>
                {row.names.map((name, i) => {
                  const idx = rowStart + i;
                  const on = assemble * TOTAL > idx + 1;
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
                          border: `1px solid ${on ? `${c}66` : '#16202f'}`,
                          borderBottom: `3px solid ${on ? c : '#16202f'}`,
                          borderRadius: 8,
                          padding: '13px 20px 11px',
                          opacity: on ? 1 : 0.25,
                          transform: on ? 'none' : 'translateY(6px)',
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

      <div style={{ textAlign: 'center', marginTop: 56, opacity: titleIn }}>
        <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 38, fontWeight: 900, letterSpacing: '-0.02em' }}>
          INTENT TO PACKET
        </div>
        <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 16, fontWeight: 700, marginTop: 6 }}>
          kubernetes beyond yaml — interactive architecture course
        </div>
      </div>
    </div>
  );
};
