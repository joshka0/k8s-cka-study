import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 23 beat 4 — a rollout is arithmetic. Two ReplicaSets with live
 * counters for desired, current, ready and available. maxSurge bounds how far
 * above desired you may go, maxUnavailable how far below. The rollout steps
 * through checkpoints; a banner names which number gates the next step at each
 * moment.
 */

const DESIRED = 5;
const MAX_SURGE = 2;
const MAX_UNAVAILABLE = 1;

type RS = { des: number; cur: number; ready: number; avail: number };

const CHECKS: { label: string; old: RS; nw: RS; gate: string }[] = [
  { label: 'start', old: { des: 5, cur: 5, ready: 5, avail: 5 }, nw: { des: 5, cur: 0, ready: 0, avail: 0 }, gate: 'maxSurge — new pods may add up to +2 above desired' },
  { label: 'surge', old: { des: 5, cur: 5, ready: 5, avail: 5 }, nw: { des: 5, cur: 2, ready: 0, avail: 0 }, gate: 'surge cap hit — total 7, can’t add more until new are ready' },
  { label: 'ready', old: { des: 5, cur: 5, ready: 5, avail: 5 }, nw: { des: 5, cur: 2, ready: 2, avail: 2 }, gate: 'new available → old may scale down, bounded by maxUnavailable 1' },
  { label: 'scale down', old: { des: 5, cur: 4, ready: 4, avail: 4 }, nw: { des: 5, cur: 2, ready: 2, avail: 2 }, gate: 'availability gates the next cut — one below desired at a time' },
  { label: 'complete', old: { des: 5, cur: 0, ready: 0, avail: 0 }, nw: { des: 5, cur: 5, ready: 5, avail: 5 }, gate: 'new RS at desired — none of the bounds crossed' },
];

export const RolloutArithmetic: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const panelIn = appear(t, 0.08, 0.16);
  const footer = appear(t, 0.88, 0.94);

  const p = seg(t, 0.16, 0.82);
  const idx = Math.min(CHECKS.length - 1, Math.floor(p * CHECKS.length));
  const step = CHECKS[idx];

  const totalLive = step.old.cur + step.nw.cur;
  const overAllowed = totalLive - DESIRED; // how far above desired
  const underAllowed = DESIRED - totalLive;

  const Row = ({ rs, color, name }: { rs: RS; color: string; name: string }) => (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color, marginBottom: 8 }}>{name}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <Counter label="desired" v={rs.des} color={PALETTE.ink} />
        <Counter label="current" v={rs.cur} color={PALETTE.ink} />
        <Counter label="ready" v={rs.ready} color={PALETTE.cyan} />
        <Counter label="available" v={rs.avail} color={PALETTE.good} />
      </div>
    </div>
  );

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
      <div style={{ width: 1680, height: 740, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>a rollout is arithmetic — maxSurge above · maxUnavailable below · availability gates the cut</Label>
        </div>

        {/* the two rs counters */}
        <div style={{ position: 'absolute', left: 120, top: 60, width: 1440, display: 'flex', gap: 24, opacity: panelIn }}>
          <div style={{ flex: 1, borderRadius: 18, border: `2px solid ${PALETTE.blue}66`, background: `${PALETTE.blue}06`, padding: '20px 22px' }}>
            <Row rs={step.old} color={PALETTE.blue} name="old ReplicaSet (replicas draining down)" />
          </div>
          <div style={{ flex: 1, borderRadius: 18, border: `2px solid ${PALETTE.violet}66`, background: `${PALETTE.violet}06`, padding: '20px 22px' }}>
            <Row rs={step.nw} color={PALETTE.violet} name="new ReplicaSet (replicas scaling up)" />
          </div>
        </div>

        {/* the bounds */}
        <div style={{ position: 'absolute', left: 120, top: 336, width: 1440, display: 'flex', gap: 24, opacity: panelIn }}>
          <div style={{ flex: 1, borderRadius: 14, border: `2px solid ${PALETTE.amber}66`, background: `${PALETTE.amber}08`, padding: '14px 18px', textAlign: 'center' }}>
            <Label color={PALETTE.amber} size={11}>maxSurge = {MAX_SURGE}</Label>
            <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, marginTop: 6 }}>
              may go up to {DESIRED + MAX_SURGE} live — currently over desired by {overAllowed}
            </div>
          </div>
          <div style={{ flex: 1, borderRadius: 14, border: `2px solid ${PALETTE.good}66`, background: `${PALETTE.good}08`, padding: '14px 18px', textAlign: 'center' }}>
            <Label color={PALETTE.good} size={11}>maxUnavailable = {MAX_UNAVAILABLE}</Label>
            <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, marginTop: 6 }}>
              may go down to {DESIRED - MAX_UNAVAILABLE} live — currently below desired by {underAllowed}
            </div>
          </div>
        </div>

        {/* current gate banner */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 456,
            width: 1440,
            borderRadius: 16,
            border: `2px solid ${PALETTE.cyan}`,
            background: `${PALETTE.cyan}0a`,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            opacity: appear(t, 0.4, 0.48),
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            {CHECKS.map((c, i) => (
              <span key={c.label} style={{ fontFamily: MONO, fontSize: 12, fontWeight: 900, color: i === idx ? PALETTE.cyan : PALETTE.muted, border: `1px solid ${i === idx ? PALETTE.cyan : PALETTE.line}`, borderRadius: 999, padding: '4px 9px', background: i === idx ? `${PALETTE.cyan}14` : 'transparent' }}>
                {i + 1}
              </span>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.cyan }}>checkpoint {idx + 1} · {step.label}</div>
            <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, marginTop: 3 }}>gates the next step: {step.gate}</div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 120, top: 556, width: 1440, opacity: appear(t, 0.6, 0.68) }}>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.amber, lineHeight: 1.5 }}>
            availability, not readiness alone, is what allows further scale-down — readiness, plus any minimum ready seconds, decides what counts as available.
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the rollout moves as fast as those numbers allow — and no faster</Label>
        </div>
      </div>
    </div>
  );
};

function Counter({ label, v, color }: { label: string; v: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${PALETTE.line}`, borderRadius: 8, background: '#0d1522', padding: '8px 12px' }}>
      <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.muted }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 19, fontWeight: 900, color }}>{v}</span>
    </div>
  );
}
