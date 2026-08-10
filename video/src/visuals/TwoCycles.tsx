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
const STAGE_W = 300;
const GAP = 40;
const TRACK_W = 4 * STAGE_W + 3 * GAP;
const TOP_STAGES = ['sort', 'pre-filter', 'filter', 'score'];
const BOTTOM_STAGES = ['reserve', 'permit', 'pre-bind', 'bind'];

// Each row carries its own captions. Deriving them from the column index gave
// the binding row the scheduling row's captions — "bind · pick best", which is
// not what binding does. Only captions the narration supports are used; permit
// is left blank rather than invented.
const TOP_SUBS = ['queue order', 'per-node', 'per-node', 'pick best'];
const BOTTOM_SUBS = ['hold the claim', '', 'slow work', 'write the name'];

const stageLeft = (i: number) => i * (STAGE_W + GAP);
const stageCenter = (i: number) => stageLeft(i) + STAGE_W / 2;

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
function activeStage(x: number): number {
  for (let i = 0; i < 4; i++) {
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

  // Pod A — scheduling cycle first (serial), then the binding cycle.
  const aTop: Hop[] = [
    { a: 0.1, b: 0.15, x0: -30, x1: stageCenter(0) },
    { a: 0.15, b: 0.205, x0: stageCenter(0), x1: stageCenter(1) },
    { a: 0.205, b: 0.26, x0: stageCenter(1), x1: stageCenter(2) },
    { a: 0.26, b: 0.315, x0: stageCenter(2), x1: stageCenter(3) },
    { a: 0.315, b: 0.36, x0: stageCenter(3), x1: TRACK_W + 30 },
  ];
  // Pod B — starts the scheduling cycle the moment A leaves it.
  const bTop: Hop[] = [
    { a: 0.38, b: 0.43, x0: -30, x1: stageCenter(0) },
    { a: 0.43, b: 0.48, x0: stageCenter(0), x1: stageCenter(1) },
    { a: 0.48, b: 0.53, x0: stageCenter(1), x1: stageCenter(2) },
    { a: 0.53, b: 0.58, x0: stageCenter(2), x1: stageCenter(3) },
    { a: 0.58, b: 0.63, x0: stageCenter(3), x1: TRACK_W + 30 },
  ];
  // Pod A — binding cycle, slower; held at pre-bind for a volume attach.
  const aBot: Hop[] = [
    { a: 0.36, b: 0.42, x0: -30, x1: stageCenter(0) },
    { a: 0.42, b: 0.48, x0: stageCenter(0), x1: stageCenter(1) },
    { a: 0.48, b: 0.54, x0: stageCenter(1), x1: stageCenter(2) },
    { a: 0.54, b: 0.7, x0: stageCenter(2), x1: stageCenter(3) },
    { a: 0.7, b: 0.76, x0: stageCenter(3), x1: TRACK_W + 30 },
  ];

  const aTopX = lastNonNull(aTop.map((h) => tokenX(h, t)), -30);
  const bTopX = tokenX(bTop[0], t) !== null
    ? lastNonNull(bTop.map((h) => tokenX(h, t)), null)
    : null;
  const aBotX = lastNonNull(aBot.map((h) => tokenX(h, t)), null);

  const aTopDone = t > 0.36 && t < 0.42; // in the gap while it drops to the bind track
  const aBotStage = aBotX !== null ? activeStage(aBotX) : -1;
  const aTopStage = aTopX !== null ? activeStage(aTopX) : -1;

  // Volume-attach wait: A stalls at pre-bind (stage 2 of the bottom track).
  const attachWait = seg(t, 0.56, 0.62) - seg(t, 0.68, 0.72) > 0;
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
          <Label color={PALETTE.blue} size={12}>scheduling cycle — serial · one Pod at a time</Label>
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
            <div style={{ position: 'absolute', left: stageLeft(2), top: 110, width: STAGE_W, textAlign: 'center', opacity: 0.6 + 0.4 * waitPulse }}>
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
            {i > 0 && <span style={{ color: PALETTE.line, fontSize: 30, fontWeight: 900 }}>→</span>}
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
        top: 26,
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
