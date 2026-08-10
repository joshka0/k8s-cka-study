import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 07 beat 4 — four contracts, not one runtime. Four boundaries drawn
 * between named parties, never as a flat list. Each row owns its own labels:
 * the parties, the contract between them, its failure mode and the log you
 * would open. The specific failure/log wording stays at what the narration
 * carries — each boundary has "its own failure mode and its own logs" — so
 * each cell restates that per boundary rather than inventing log paths.
 */

const BOUNDARIES = [
  {
    color: PALETTE.cyan,
    a: 'kubelet',
    b: 'containerd',
    acronym: 'CRI',
    tag: 'gRPC · runtime service + image service',
    failure: 'the CRI call fails',
    log: 'pod events + kubelet',
  },
  {
    color: PALETTE.amber,
    a: 'containerd',
    b: 'runc',
    acronym: 'OCI',
    tag: 'image + runtime primitives',
    failure: 'OCI primitives fail',
    log: 'runtime logs',
  },
  {
    color: PALETTE.violet,
    a: 'sandbox',
    b: 'pod network',
    acronym: 'CNI',
    tag: 'network attachment',
    failure: 'the attachment fails',
    log: 'runtime logs',
  },
  {
    color: PALETTE.good,
    a: 'pod',
    b: 'volume',
    acronym: 'CSI',
    tag: 'storage',
    failure: 'storage fails',
    log: 'CSI node-plugin logs',
  },
];

const A_W = 210;
const B_W = 210;
const BRIDGE_W = 400;
const FAIL_W = 250;
const LOG_W = 240;
const GAP = 16;
const ROW_H = 108;
const ROW_GAP = 30;
const X0 = 100;

export const FourBoundaries: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const rowOn = BOUNDARIES.map((_, i) => appear(t, 0.12 + i * 0.1, 0.2 + i * 0.1));
  const settle = appear(t, 0.72, 0.82);
  const footer = appear(t, 0.8, 0.88);

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
      <div style={{ width: 1640, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>four acronyms get collapsed into “the runtime” — they are four separate contracts</Label>
        </div>

        {BOUNDARIES.map((row, i) => {
          const y = 60 + i * (ROW_H + ROW_GAP);
          const on = rowOn[i];
          const bStart = X0 + A_W + GAP;
          const chipCx = bStart + BRIDGE_W / 2;
          const failX = bStart + BRIDGE_W + GAP;
          const logX = failX + FAIL_W + GAP;
          return (
            <div key={row.acronym} style={{ opacity: on, transform: `translateY(${(1 - on) * 14}px)` }}>
              {/* party A */}
              <div
                style={{
                  position: 'absolute',
                  left: X0,
                  top: y,
                  width: A_W,
                  height: ROW_H,
                  border: `2px solid ${row.color}`,
                  borderRadius: 14,
                  background: `${row.color}12`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 21, fontWeight: 900 }}>{row.a}</div>
              </div>

              {/* the boundary bridge: a line with the contract chip on it */}
              <div
                style={{
                  position: 'absolute',
                  left: bStart,
                  top: y,
                  width: BRIDGE_W,
                  height: ROW_H,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: ROW_H / 2 - 1,
                    borderTop: `2px solid ${row.color}`,
                    opacity: 0.85,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: `2px solid ${row.color}`,
                    borderRadius: 14,
                    background: '#0c111c',
                    boxShadow: `0 0 18px ${row.color}33`,
                    padding: '10px 18px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ fontFamily: MONO, color: row.color, fontSize: 26, fontWeight: 900, letterSpacing: '0.04em' }}>
                    {row.acronym}
                  </div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 2 }}>
                    {row.tag}
                  </div>
                </div>
              </div>

              {/* party B */}
              <div
                style={{
                  position: 'absolute',
                  left: bStart + BRIDGE_W + GAP,
                  top: y,
                  width: B_W,
                  height: ROW_H,
                  border: `2px solid ${row.color}`,
                  borderRadius: 14,
                  background: `${row.color}12`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 21, fontWeight: 900 }}>{row.b}</div>
              </div>

              {/* failure mode — its own */}
              <div
                style={{
                  position: 'absolute',
                  left: failX,
                  top: y,
                  width: FAIL_W,
                  height: ROW_H,
                  border: `1px solid ${PALETTE.bad}55`,
                  borderRadius: 14,
                  background: `${PALETTE.bad}0a`,
                  padding: '12px 14px',
                }}
              >
                <Label color={PALETTE.bad} size={10} style={{ marginBottom: 6 }}>failure mode</Label>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{row.failure}</div>
              </div>

              {/* which log */}
              <div
                style={{
                  position: 'absolute',
                  left: logX,
                  top: y,
                  width: LOG_W,
                  height: ROW_H,
                  border: `1px solid ${PALETTE.line}`,
                  borderRadius: 14,
                  background: PALETTE.panel,
                  padding: '12px 14px',
                }}
              >
                <Label color={PALETTE.muted} size={10} style={{ marginBottom: 6 }}>which log to open</Label>
                <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{row.log}</div>
              </div>
            </div>
          );
        })}

        {/* settle ring around the whole set — this is the screenshot beat */}
        <div
          style={{
            position: 'absolute',
            left: X0 - 26,
            top: 44,
            width: 1368 + 52,
            height: 4 * (ROW_H + ROW_GAP) + 16 + 8,
            borderRadius: 26,
            border: `2px solid ${PALETTE.amber}44`,
            opacity: settle * 0.8,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>each has its own failure mode and its own logs — knowing which boundary broke tells you which log to open</Label>
        </div>
      </div>
    </div>
  );
};
