import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 07 beat 2 — the order on the node. Five ordered steps across the
 * stage; each lights in turn and stays lit. Under the first two, a short note
 * on why they come first — the sandbox anchors the shared namespaces, the
 * attachment needs something to attach to. Steps lay out as a wrapping row,
 * never a fixed-width strip.
 */

const STEPS = [
  {
    n: '01',
    title: 'sandbox created',
    sub: 'anchors the shared namespaces',
    why: 'why first — the sandbox anchors the shared namespaces',
    color: PALETTE.cyan,
  },
  {
    n: '02',
    title: 'network attached',
    sub: 'the attachment belongs to the sandbox',
    why: 'why second — an attachment needs something to attach to',
    color: PALETTE.cyan,
  },
  {
    n: '03',
    title: 'volumes mounted',
    sub: 'mounted before the containers',
    why: null,
    color: PALETTE.violet,
  },
  {
    n: '04',
    title: 'init containers',
    sub: 'run to completion, in order',
    why: null,
    color: PALETTE.violet,
  },
  {
    n: '05',
    title: 'app containers start',
    sub: 'the application comes up',
    why: null,
    color: PALETTE.violet,
  },
];

const CARD_W = 300;
const CARD_H = 176;
const GAP = 24;
const ROW_W = 5 * CARD_W + 4 * GAP; // 1596

export const NodeSequence: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const on = STEPS.map((_, i) => appear(t, 0.1 + i * 0.085, 0.18 + i * 0.085));
  const why = [appear(t, 0.14, 0.2), appear(t, 0.225, 0.285)];
  const footer = appear(t, 0.8, 0.9);

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
      <div style={{ width: ROW_W, position: 'relative' }}>
        {/* header */}
        <div style={{ textAlign: 'center', opacity: header, marginBottom: 26 }}>
          <Label color={PALETTE.cyan} size={13}>once a Pod is bound, the order on the node is fixed</Label>
        </div>

        {/* the five steps */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: GAP }}>
          {STEPS.map((s, i) => {
            const lit = on[i];
            return (
              <React.Fragment key={s.n}>
                {i > 0 && (
                  <span
                    style={{
                      alignSelf: 'center',
                      color: on[i] > 0.5 ? s.color : PALETTE.line,
                      fontSize: 30,
                      fontWeight: 900,
                      opacity: on[i],
                      width: GAP,
                      textAlign: 'center',
                    }}
                  >
                    →
                  </span>
                )}
                <div
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    borderRadius: 16,
                    border: `2px solid ${lit > 0.5 ? s.color : PALETTE.line}`,
                    background: lit > 0.5 ? `${s.color}14` : PALETTE.panel,
                    boxShadow: lit > 0.5 ? `0 0 22px ${s.color}44` : 'none',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: Math.max(0.28, lit),
                    transition: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 18,
                        fontWeight: 900,
                        color: lit > 0.5 ? s.color : PALETTE.muted,
                      }}
                    >
                      {s.n}
                    </span>
                    {lit > 0.5 && <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 15, fontWeight: 900 }}>✓</span>}
                  </div>
                  <div
                    style={{
                      fontFamily: MONO,
                      color: PALETTE.ink,
                      fontSize: 21,
                      fontWeight: 900,
                      marginTop: 12,
                      lineHeight: 1.2,
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontFamily: MONO,
                      color: PALETTE.muted,
                      fontSize: 13.5,
                      fontWeight: 700,
                      marginTop: 8,
                      lineHeight: 1.3,
                    }}
                  >
                    {s.sub}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* why-notes under the first two steps, aligned to their own columns */}
        <div style={{ display: 'flex', gap: GAP, marginTop: 16 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ width: CARD_W }}>
              {s.why && (
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 14,
                    fontWeight: 800,
                    color: PALETTE.amber,
                    background: `${PALETTE.amber}10`,
                    border: `1px solid ${PALETTE.amber}55`,
                    borderRadius: 10,
                    padding: '10px 14px',
                    lineHeight: 1.35,
                    opacity: why[i],
                    textAlign: 'left',
                  }}
                >
                  {s.why}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ textAlign: 'center', marginTop: 26, opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>that order is not arbitrary — each step exists to anchor the one after it</Label>
        </div>
      </div>
    </div>
  );
};
