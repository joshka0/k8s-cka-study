import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 07 beat 9 — deletion is not a transaction. Two parallel timelines
 * on one clock, deliberately not synchronised. Top: grace period starts,
 * PreStop runs, TERM delivered, force kill at expiry. Bottom: endpoint
 * removal propagating through EndpointSlice to the data plane. The overlap
 * window is shaded; a request lands on the already-terminating container
 * inside it. Then a PreStop sleep widens the gap so the overlap closes.
 */

const RAIL_X = 60;
const RAIL_W = 1450;
const TOP_Y = 100;
const TOP_H = 140;
const BOT_Y = 290;
const BOT_H = 140;

const fx = (f: number) => RAIL_X + f * RAIL_W;

// Phase 1: TERM lands at 0.32, data plane stops at 0.56 — overlap between.
const TERM_1 = 0.32;
// Phase 2: a PreStop sleep holds, TERM lands at 0.64 — after the data plane
// (0.56), so the overlap closes.
const TERM_2 = 0.64;
const DP_STOP = 0.56;

const TOP_EVENTS = [
  { f: 0.02, label: 'grace period starts' },
  { f: 0.13, label: 'PreStop runs' },
  { f: TERM_1, label: 'TERM delivered', term: true },
  { f: 0.98, label: 'force kill at expiry' },
];
const BOT_EVENTS = [
  { f: 0.06, label: 'removed from endpoints' },
  { f: 0.28, label: 'EndpointSlice updated' },
  { f: DP_STOP, label: 'data plane stops routing' },
];

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

export const TerminationRace: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const rails = appear(t, 0.06, 0.14);
  const axis = appear(t, 0.08, 0.14);
  const footer = appear(t, 0.9, 0.96);

  // Two passes of the clock. Run 1 scans the original timeline; the
  // transition resets; run 2 scans the PreStop-sleep timeline.
  const run2 = t >= 0.5;
  const scan1 = seg(t, 0.08, 0.42);
  const scan2 = seg(t, 0.56, 0.88);
  const scan = run2 ? scan2 : t < 0.44 ? scan1 : 1;

  // TERM slides right as the sleep is inserted.
  const trans = seg(t, 0.44, 0.56);
  const termF = TERM_1 + (TERM_2 - TERM_1) * trans;
  const sleepIn = appear(t, 0.46, 0.54);

  // The overlap: from TERM to data-plane stop; in run 2 it has closed. The
  // band fades away as TERM slides past the data-plane stop.
  const bandL = fx(termF);
  const bandR = fx(DP_STOP);
  const bandW = Math.max(0, bandR - bandL);
  const bandOn = 1 - trans;

  // Requests: run 1 lands inside the overlap; run 2 lands after the data
  // plane has stopped and before TERM.
  const req1 = seg(t, 0.3, 0.38);
  const req1Gone = 1 - seg(t, 0.42, 0.46);
  const req2 = seg(t, 0.72, 0.8);
  const req1X = lerp(fx(1.05), fx(0.44), req1);
  const req1Y = lerp(84, 152, req1);
  const req2X = lerp(fx(1.05), fx(0.6), req2);

  const pulse = 0.6 + 0.4 * Math.sin(frame / 6);

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
      <div style={{ width: 1640, height: 660, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>deletion is not a transaction — the grace period and the endpoint removal run concurrently</Label>
        </div>

        {/* phase badge */}
        <div style={{ position: 'absolute', left: 60, top: 34, opacity: run2 ? 0 : appear(t, 0.05, 0.12) }}>
          <PhaseBadge color={PALETTE.bad} text="run 1 · no sleep — the overlap is open" />
        </div>
        <div style={{ position: 'absolute', left: 60, top: 34, opacity: run2 ? appear(t, 0.5, 0.56) : 0 }}>
          <PhaseBadge color={PALETTE.good} text="run 2 · PreStop sleep — the gap widens" />
        </div>

        {/* ---- rails ---- */}
        <div style={{ opacity: rails }}>
          {/* top rail — pod termination */}
          <div
            style={{
              position: 'absolute',
              left: RAIL_X,
              top: TOP_Y,
              width: RAIL_W,
              height: TOP_H,
              border: `2px solid ${PALETTE.violet}66`,
              borderRadius: 16,
              background: `${PALETTE.violet}0a`,
            }}
          >
            <Label color={PALETTE.violet} size={11} style={{ position: 'absolute', left: 16, top: -24 }}>pod termination</Label>
          </div>
          {/* bottom rail — endpoint removal */}
          <div
            style={{
              position: 'absolute',
              left: RAIL_X,
              top: BOT_Y,
              width: RAIL_W,
              height: BOT_H,
              border: `2px solid ${PALETTE.cyan}66`,
              borderRadius: 16,
              background: `${PALETTE.cyan}0a`,
            }}
          >
            <Label color={PALETTE.cyan} size={11} style={{ position: 'absolute', left: 16, top: -24 }}>endpoint removal (concurrent, not synchronised)</Label>
          </div>
        </div>

        {/* ---- top events ---- */}
        <div style={{ opacity: rails }}>
          {TOP_EVENTS.map((e) => {
            const lit = scan >= (run2 && e.term ? termF : e.f) && scan > 0;
            const useTerm = run2 && e.term;
            const x = fx(useTerm ? termF : e.f);
            return (
              <EventChip key={e.label} x={x} y={TOP_Y + 58} color={e.term ? PALETTE.bad : PALETTE.violet} lit={lit} pulse={e.term ? pulse : 1}>
                {e.label}
              </EventChip>
            );
          })}
        </div>

        {/* ---- bottom events ---- */}
        <div style={{ opacity: rails }}>
          {BOT_EVENTS.map((e) => {
            const lit = scan >= e.f && scan > 0;
            return (
              <EventChip key={e.label} x={fx(e.f)} y={BOT_Y + 58} color={PALETTE.cyan} lit={lit} pulse={1}>
                {e.label}
              </EventChip>
            );
          })}
        </div>

        {/* ---- the sleep chip (run 2 only) ---- */}
        <div
          style={{
            position: 'absolute',
            left: fx(0.3),
            top: TOP_Y + 26,
            height: 86,
            borderRadius: 12,
            border: `2px solid ${PALETTE.amber}`,
            background: `${PALETTE.amber}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: MONO,
            color: PALETTE.amber,
            fontSize: 15,
            fontWeight: 900,
            opacity: sleepIn,
            padding: '0 16px',
            whiteSpace: 'nowrap',
            zIndex: 2,
          }}
        >
          ⏳ sleep — the hook holds
        </div>

        {/* ---- overlap band ---- */}
        <div
          style={{
            position: 'absolute',
            left: bandL,
            top: TOP_Y - 6,
            width: bandW,
            height: BOT_Y + BOT_H + 6 - (TOP_Y - 6),
            opacity: bandOn * 0.55,
            background: `repeating-linear-gradient(45deg, ${PALETTE.bad}26 0 10px, transparent 10px 20px)`,
            borderLeft: `2px dashed ${PALETTE.bad}`,
            borderRight: `2px dashed ${PALETTE.bad}`,
            zIndex: 0,
          }}
        />
        {bandW > 70 && (
          <div
            style={{
              position: 'absolute',
              left: bandL + bandW / 2 - 170,
              top: BOT_Y + BOT_H + 10,
              width: 340,
              opacity: bandOn,
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                color: PALETTE.bad,
                fontSize: 14,
                fontWeight: 900,
                background: '#0c111c',
                border: `1px solid ${PALETTE.bad}66`,
                borderRadius: 10,
                padding: '8px 12px',
                textAlign: 'center',
              }}
            >
              overlap — traffic can still arrive
            </div>
          </div>
        )}

        {/* ---- requests ---- */}
        {/* run 1: lands on the already-terminating container */}
        {req1 > 0.02 && req1Gone > 0 && (
          <div style={{ zIndex: 4 }}>
            <div
              style={{
                position: 'absolute',
                left: req1X - 50,
                top: req1Y - 20,
                width: 100,
                height: 40,
                borderRadius: 9,
                background: PALETTE.cyan,
                color: '#051022',
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 16px ${PALETTE.cyan}55`,
                opacity: req1Gone,
              }}
            >
              request
            </div>
            {req1 >= 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: fx(0.44) - 190,
                  top: 196,
                  width: 380,
                  opacity: req1Gone * 0.9,
                }}
              >
                <Label color={PALETTE.bad} size={12} style={{ textTransform: 'none', letterSpacing: 0 }}>
                  ▲ arrives at a container already told to shut down
                </Label>
              </div>
            )}
          </div>
        )}
        {/* run 2: endpoints are already gone — the request never reaches it */}
        {req2 > 0.02 && (
          <div style={{ zIndex: 4 }}>
            <div
              style={{
                position: 'absolute',
                left: req2X - 50,
                top: 64,
                width: 100,
                height: 40,
                borderRadius: 9,
                background: PALETTE.cyan,
                color: '#051022',
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 16px ${PALETTE.cyan}55`,
              }}
            >
              request
            </div>
            {req2 >= 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: fx(0.6) - 210,
                  top: 110,
                  width: 420,
                }}
              >
                <Label color={PALETTE.good} size={12} style={{ textTransform: 'none', letterSpacing: 0 }}>
                  ▲ endpoints gone before TERM — this request never reaches the container
                </Label>
              </div>
            )}
          </div>
        )}

        {/* ---- clock axis ---- */}
        <div style={{ opacity: axis }}>
          <div
            style={{
              position: 'absolute',
              left: RAIL_X,
              top: 494,
              width: RAIL_W,
              height: 0,
              borderTop: `2px solid ${PALETTE.line}`,
            }}
          />
          <div style={{ position: 'absolute', left: RAIL_X - 3, top: 486, width: 0, height: 16, borderLeft: `2px solid ${PALETTE.line}` }} />
          <div style={{ position: 'absolute', left: RAIL_X + RAIL_W - 3, top: 486, width: 0, height: 16, borderLeft: `2px solid ${PALETTE.line}` }} />
          <div style={{ position: 'absolute', left: RAIL_X - 4, top: 506, fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800 }}>
            deletion — both start here
          </div>
          <div style={{ position: 'absolute', left: RAIL_X + RAIL_W - 250, top: 506, fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800 }}>
            grace expires — force kill
          </div>
        </div>

        {/* ---- scan cursor ---- */}
        <div
          style={{
            position: 'absolute',
            left: RAIL_X + scan * RAIL_W - 2,
            top: TOP_Y - 10,
            width: 4,
            height: BOT_Y + BOT_H + 10 - (TOP_Y - 10),
            background: PALETTE.ink,
            opacity: 0.25 + 0.2 * Math.abs(Math.sin(frame / 5)),
            zIndex: 3,
            pointerEvents: 'none',
          }}
        />

        {/* footer */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the two run concurrently, so traffic can still arrive after TERM — a PreStop sleep is a real fix for that, not a hack</Label>
        </div>
      </div>
    </div>
  );
};

function EventChip({
  x,
  y,
  color,
  lit,
  pulse,
  children,
}: {
  x: number;
  y: number;
  color: string;
  lit: boolean;
  pulse: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y - 20,
        transform: 'translateX(-50%)',
        height: 40,
        borderRadius: 10,
        border: `2px solid ${lit ? color : PALETTE.line}`,
        background: lit ? `${color}16` : '#0e1522',
        color: lit ? PALETTE.ink : PALETTE.muted,
        fontFamily: MONO,
        fontSize: 13.5,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: lit ? `0 0 14px ${color}44` : 'none',
        opacity: lit ? pulse : 0.35,
        whiteSpace: 'nowrap',
        padding: '0 12px',
        zIndex: 2,
      }}
    >
      {children}
    </div>
  );
}

function PhaseBadge({ color, text }: { color: string; text: string }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        color,
        fontSize: 15,
        fontWeight: 900,
        border: `1px solid ${color}66`,
        background: `${color}10`,
        borderRadius: 999,
        padding: '7px 16px',
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {text}
    </span>
  );
}
