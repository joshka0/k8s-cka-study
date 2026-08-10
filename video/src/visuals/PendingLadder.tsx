import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 06 beat 7 — why is it still Pending. An ordered diagnostic ladder:
 * each rung lights as it is named, rung one is weighted heaviest because it
 * resolves most cases, and below the ladder 'image size' sits struck through
 * and apart — slow start, not Pending.
 */

const RUNGS = [
  {
    n: 1,
    name: 'scheduler events on the Pod',
    note: 'they usually name the predicate that failed — most searches end here',
    ev: '0/8 nodes are available: 3 Insufficient cpu, 5 node(s) had untolerated taint',
    weight: 'heavy',
  },
  {
    n: 2,
    name: 'requests vs node allocatable',
    note: 'compare the declared requests against allocatable',
    ev: 'predicate: Insufficient cpu — requests vs allocatable',
    weight: 'normal',
  },
  {
    n: 3,
    name: 'affinity · taints · topology spread · host ports',
    note: 'constraints that remove nodes by identity',
    ev: 'untolerated taint · no matching topology · hostPort conflict',
    weight: 'normal',
  },
  {
    n: 4,
    name: 'the volume side',
    note: 'binding mode, storage topology, capacity',
    ev: 'binding mode · storage topology · capacity',
    weight: 'normal',
  },
  {
    n: 5,
    name: 'quota',
    note: 'the namespace has no allowance left',
    ev: 'quota exceeded in namespace',
    weight: 'normal',
  },
];

export const PendingLadder: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const divider = appear(t, 0.68, 0.74);
  const imageRow = appear(t, 0.74, 0.82);
  const footer = appear(t, 0.88, 0.94);

  return (
    <div style={{ position: 'absolute', inset: 0, paddingTop: 20, paddingLeft: 110, paddingRight: 110 }}>
      <div style={{ textAlign: 'center', opacity: header, marginBottom: 26 }}>
        <Label color={PALETTE.cyan} size={13}>a Pending Pod has an order of investigation — most searches end at rung one</Label>
      </div>

      {/* the ladder */}
      <div style={{ position: 'relative', width: 1500, margin: '0 auto' }}>
        {/* rail */}
        <div
          style={{
            position: 'absolute',
            left: 27,
            top: 14,
            bottom: 14,
            width: 4,
            borderRadius: 999,
            background: PALETTE.line,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {RUNGS.map((r, i) => {
            const on = appear(t, 0.12 + i * 0.105, 0.2 + i * 0.105);
            const heavy = r.weight === 'heavy';
            return (
              <div
                key={r.n}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: 18,
                  opacity: on,
                  transform: `translateX(${(1 - on) * -12}px)`,
                }}
              >
                {/* crossbar (rung number on the rail) */}
                <div
                  style={{
                    width: 58,
                    minHeight: heavy ? 96 : 78,
                    borderRadius: 12,
                    border: `2px solid ${heavy ? PALETTE.amber : PALETTE.line}`,
                    background: heavy ? `${PALETTE.amber}18` : PALETTE.panel,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: MONO,
                    fontSize: heavy ? 24 : 18,
                    fontWeight: 900,
                    color: heavy ? PALETTE.amber : PALETTE.muted,
                    flex: '0 0 auto',
                    zIndex: 1,
                  }}
                >
                  {String(r.n).padStart(2, '0')}
                </div>

                {/* the rung body */}
                <div
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    border: `2px solid ${heavy ? PALETTE.amber : PALETTE.line}`,
                    background: heavy ? `${PALETTE.amber}0d` : `${PALETTE.blue}08`,
                    padding: heavy ? '16px 22px' : '11px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 26,
                    boxShadow: heavy ? `0 0 24px ${PALETTE.amber}2e` : 'none',
                  }}
                >
                  <div style={{ flex: '0 0 430px' }}>
                    <div
                      style={{
                        fontFamily: SANS,
                        color: PALETTE.ink,
                        fontSize: heavy ? 25 : 19,
                        fontWeight: 900,
                      }}
                    >
                      {heavy ? '✓ ' : ''}{r.name}
                    </div>
                    <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, marginTop: 4, fontWeight: 700 }}>
                      {r.note}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      fontFamily: MONO,
                      fontSize: heavy ? 17 : 14.5,
                      fontWeight: 700,
                      color: heavy ? PALETTE.amber : PALETTE.cyan,
                      background: '#0c111c',
                      borderRadius: 10,
                      padding: heavy ? '12px 16px' : '8px 14px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {r.ev}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* divider + the struck-through image size */}
      <div style={{ width: 1500, margin: '0 auto', marginTop: 22 }}>
        <div style={{ borderTop: `1px dashed ${PALETTE.line}`, opacity: divider }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 18, opacity: imageRow }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 22,
              fontWeight: 900,
              color: PALETTE.bad,
              textDecoration: 'line-through',
              textDecorationThickness: 3,
            }}
          >
            image size
          </span>
          <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 16, fontWeight: 700 }}>
            not on that list — a large image is slow after scheduling
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 15,
              fontWeight: 900,
              color: PALETTE.good,
              border: `1px solid ${PALETTE.good}55`,
              background: `${PALETTE.good}0d`,
              borderRadius: 999,
              padding: '6px 16px',
              whiteSpace: 'nowrap',
            }}
          >
            slow start, not Pending
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>read the events first — a large image never causes Pending, ever</Label>
      </div>
    </div>
  );
};
