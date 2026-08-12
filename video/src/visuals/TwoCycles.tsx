import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 06 beat 1 — two cycles, not one. The scheduling cycle is serial
 * (one Pod at a time); the binding cycle may overlap the next Pod's
 * scheduling cycle. Pod A slides through the top track, drops onto the
 * bottom track, and while it is still binding (held at pre-bind for a slow
 * volume attach) Pod B is already running the top track. The overlap is the
 * point: a slow bind delays one Pod, never the queue.
 */
// The row is `display:flex; gap:GAP` with an arrow element between boxes, so a
// gap sits on BOTH sides of every arrow. Real pitch is STAGE_W + 2*GAP +
// ARROW_W. Modelling it as STAGE_W + GAP drifted every token further from its
// stage across the row, and pushed the last box off the track.
const STAGE_W = 240;
const GAP = 16;
const ARROW_W = 26;
const TOP_N = 6;
const PITCH = STAGE_W + 2 * GAP + ARROW_W;
const TRACK_W = TOP_N * STAGE_W + (TOP_N - 1) * (2 * GAP + ARROW_W);
// Corrected against the scheduling framework. QueueSort orders Pods BEFORE an
// attempt begins — it is not a stage inside a Pod's scheduling cycle. Reserve
// and Permit end the SCHEDULING cycle; the binding cycle is PreBind, Bind and
// PostBind. The previous arrangement had all four on the wrong track.
const TOP_STAGES = ['pre-filter', 'filter', 'pre-score', 'score', 'reserve', 'permit'];
const BOTTOM_STAGES = ['pre-bind', 'bind', 'post-bind'];

// Each row carries its own captions. Deriving them from the column index gave
// the binding row the scheduling row's captions — "bind · pick best", which is
// not what binding does. Only captions the narration supports are used; permit
// is left blank rather than invented.
const TOP_SUBS = ['setup', 'per-node', 'setup', 'pick best', 'hold the claim', 'may delay'];
const BOTTOM_SUBS = ['slow work', 'write the name', 'after bind'];

const stageLeft = (i: number) => i * PITCH;
const stageCenter = (i: number) => stageLeft(i) + STAGE_W / 2;
const BOTTOM_TRACK_W = 3 * STAGE_W + 2 * (2 * GAP + ARROW_W);

interface Hop {
  a: number;
  b: number;
  x0: number;
  x1: number;
}

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ease = (u: number) => u * u * (3 - 2 * u);

function tokenX(hop: Hop, t: number): number | null {
  const u = seg(t, hop.a, hop.b);
  if (u <= 0) return null;
  return lerp(hop.x0, hop.x1, ease(u));
}

/** Stage a token is currently inside (by its centre), or -1. */
function activeStage(x: number, count = TOP_N): number {
  for (let i = 0; i < count; i++) {
    if (x >= stageLeft(i) && x <= stageLeft(i) + STAGE_W) return i;
  }
  return -1;
}

export const TwoCycles: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.03, 0.1);
  const tracksIn = appear(t, 0.06, 0.14);
  const footer = appear(t, 0.8, 0.9);
  const transfer = appear(t, 0.3, 0.4);

  // Pod A — the full serial scheduling cycle, all six stages, then binding.
  const aTop: Hop[] = [
    { a: 0.10, b: 0.15, x0: -30, x1: stageCenter(0) },
    { a: 0.15, b: 0.19, x0: stageCenter(0), x1: stageCenter(1) },
    { a: 0.19, b: 0.23, x0: stageCenter(1), x1: stageCenter(2) },
    { a: 0.23, b: 0.27, x0: stageCenter(2), x1: stageCenter(3) },
    { a: 0.27, b: 0.31, x0: stageCenter(3), x1: stageCenter(4) },
    { a: 0.31, b: 0.35, x0: stageCenter(4), x1: stageCenter(5) },
    { a: 0.35, b: 0.40, x0: stageCenter(5), x1: TRACK_W - 10 },
  ];
  // Pod B — enters the scheduling cycle as soon as A leaves it, which is the
  // overlap the beat exists to show.
  const bTop: Hop[] = [
    { a: 0.44, b: 0.49, x0: -30, x1: stageCenter(0) },
    { a: 0.49, b: 0.53, x0: stageCenter(0), x1: stageCenter(1) },
    { a: 0.53, b: 0.57, x0: stageCenter(1), x1: stageCenter(2) },
    { a: 0.57, b: 0.61, x0: stageCenter(2), x1: stageCenter(3) },
    { a: 0.61, b: 0.65, x0: stageCenter(3), x1: stageCenter(4) },
    { a: 0.65, b: 0.69, x0: stageCenter(4), x1: stageCenter(5) },
    { a: 0.69, b: 0.74, x0: stageCenter(5), x1: TRACK_W - 10 },
  ];
  // Pod A — the binding cycle has three stages. The gap between the first and
  // second hop is the volume-attach wait: the token holds at pre-bind, because
  // `seg` saturates at 1 once a hop ends.
  const aBot: Hop[] = [
    { a: 0.41, b: 0.47, x0: -30, x1: stageCenter(0) },
    { a: 0.62, b: 0.68, x0: stageCenter(0), x1: stageCenter(1) },
    { a: 0.68, b: 0.74, x0: stageCenter(1), x1: stageCenter(2) },
    { a: 0.74, b: 0.79, x0: stageCenter(2), x1: BOTTOM_TRACK_W - 10 },
  ];

  // Null once A has left the scheduling row: it previously stayed visible on
  // both tracks at once, showing one Pod in two places.
  const aTopX = t > 0.41 ? null : lastNonNull(aTop.map((h) => tokenX(h, t)), -30);
  const bTopX = tokenX(bTop[0], t) !== null
    ? lastNonNull(bTop.map((h) => tokenX(h, t)), null)
    : null;
  const aBotX = lastNonNull(aBot.map((h) => tokenX(h, t)), null);

  const aTopDone = t > 0.36 && t < 0.42; // in the gap while it drops to the bind track
  const aBotStage = aBotX !== null ? activeStage(aBotX, BOTTOM_STAGES.length) : -1;
  const aTopStage = aTopX !== null ? activeStage(aTopX) : -1;

  // Volume-attach wait: A holds at pre-bind, which is stage 0 of the bottom
  // track. It was previously annotated at stage 2, which is post-bind.
  const attachWait = t > 0.49 && t < 0.62;
  const waitPulse = 0.55 + 0.45 * Math.sin(frame / 9);

  return (
    <div style={{ position: 'absolute', inset: 0, paddingTop: 20 }}>
      <div style={{ textAlign: 'center', opacity: header, marginBottom: 24 }}>
        <Label color={PALETTE.cyan} size={13}>two cycles, not one — the split keeps the scheduler fast while it does slow work</Label>
      </div>

      {/* top track — scheduling cycle */}
      <div style={{ opacity: tracksIn }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: PALETTE.blue, display: 'inline-block' }} />
          <Label color={PALETTE.blueInk} size={12}>scheduling cycle — serial · one Pod at a time</Label>
        </div>
        <div style={{ position: 'relative', width: TRACK_W, margin: '0 auto' }}>
          <StageRow stages={TOP_STAGES} subs={TOP_SUBS} color={PALETTE.blue} active={aTopStage} />
          {/* Pod A token */}
          {aTopX !== null && (
            <PodToken x={aTopX} label="pod A" color={PALETTE.cyan} dim={aTopDone && aBotX === null} />
          )}
          {/* Pod B waiting at the entrance, then running */}
          {bTopX !== null ? (
            <PodToken x={bTopX} label="pod B" color={PALETTE.violet} />
          ) : (
            t > 0.06 && (
              <div style={{ position: 'absolute', left: -30, top: 16, textAlign: 'center', opacity: appear(t, 0.06, 0.12) }}>
                <PodToken x={0} label="pod B · waits" color={PALETTE.violet} dim />
              </div>
            )
          )}
          {/* transfer hint at the exit */}
          {transfer > 0 && aTopDone && (
            <div style={{ position: 'absolute', left: TRACK_W - 330, top: 108, textAlign: 'center', opacity: transfer }}>
              <Label color={PALETTE.violet} size={12} style={{ textTransform: 'none', letterSpacing: 0 }}>↓ pod A continues on the binding cycle</Label>
            </div>
          )}
        </div>
      </div>

      {/* bottom track — binding cycle */}
      <div style={{ opacity: tracksIn, marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: PALETTE.violet, display: 'inline-block' }} />
          <Label color={PALETTE.violet} size={12}>binding cycle — may overlap the next Pod's scheduling cycle</Label>
        </div>
        <div style={{ position: 'relative', width: TRACK_W, margin: '0 auto' }}>
          <StageRow stages={BOTTOM_STAGES} subs={BOTTOM_SUBS} color={PALETTE.violet} active={aBotStage} />
          {aBotX !== null && (
            <PodToken x={aBotX} label="pod A" color={PALETTE.cyan} />
          )}
          {attachWait && (
            <div style={{ position: 'absolute', left: stageLeft(0), top: 152, width: STAGE_W, textAlign: 'center', opacity: 0.6 + 0.4 * waitPulse }}>
              <Label color={PALETTE.amber} size={11} style={{ textTransform: 'none', letterSpacing: 0.04 }}>
                ⏳ volume attach — slow, but only this Pod waits
              </Label>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 34, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>a slow bind delays one Pod — it does not stall the queue</Label>
      </div>
    </div>
  );
};

function StageRow({ stages, subs, color, active }: { stages: string[]; subs: string[]; color: string; active: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: GAP }}>
      {stages.map((s, i) => {
        const on = active === i;
        return (
          <React.Fragment key={s}>
            {i > 0 && (
              <span style={{ width: ARROW_W, flex: `0 0 ${ARROW_W}px`, textAlign: 'center',
                             color: PALETTE.line, fontSize: 26, fontWeight: 900 }}>→</span>
            )}
            <div
              style={{
                width: STAGE_W,
                height: 92,
                borderRadius: 14,
                border: `2px solid ${on ? color : PALETTE.line}`,
                background: on ? `${color}22` : withAlpha(PALETTE.panel),
                boxShadow: on ? `0 0 22px ${color}55` : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontFamily: MONO, color: on ? color : PALETTE.ink, fontSize: 26, fontWeight: 900 }}>
                {s}
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, marginTop: 6, fontWeight: 700 }}>
                {subs[i] || ' '}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function PodToken({ x, label, color, dim }: { x: number; label: string; color: string; dim?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 44,
        // Below the box, not over it: at top 26 the token covered the stage name.
        top: 104,
        width: 88,
        height: 40,
        borderRadius: 10,
        background: color,
        color: '#051022',
        fontFamily: MONO,
        fontSize: 17,
        fontWeight: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        boxShadow: `0 0 20px ${color}66`,
        opacity: dim ? 0.35 : 1,
      }}
    >
      {label}
    </div>
  );
}

function withAlpha(hex: string, alpha = 0.6): string {
  // PALETTE.panel is a hex colour; return a semi-transparent panel look.
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Progress through a list of hops: the last hop that has started. */
function lastNonNull<T>(arr: T[], fallback: T): T {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== null) return arr[i];
  }
  return fallback;
}
