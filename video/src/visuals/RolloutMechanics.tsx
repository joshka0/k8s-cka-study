import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const RolloutMechanics: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  // normal rollout phase
  const normal = seg(t, 0.12, 0.5);
  // stalled replay
  const stalled = appear(t, 0.62, 0.72);
  const deadline = seg(t, 0.78, 0.9);

  const footer = appear(t, 0.9, 0.97);

  // old descends, new ascends within the band [3..7] around desired 5
  const oldCount = Math.round(5 - normal * 5);
  const newCount = Math.round(normal * 5);

  // stalled: new never goes ready, frozen at low count
  const stallNew = 1;
  const stallOld = 5;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 18, paddingLeft: 130, paddingRight: 130 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 18 }}>
        a rollout is two ReplicaSets and a pair of numbers — maxSurge · maxUnavailable
      </Label>

      {/* NORMAL rollout */}
      <div style={{ opacity: appear(t, 0.08, 0.18) }}>
        <ReplicaChart old={oldCount} new={newCount} title="normal — steps within the band" />
      </div>

      {/* STALLED replay */}
      <div style={{ marginTop: 26, opacity: 0.2 + stalled * 0.8 }}>
        <ReplicaChart old={stallOld} new={stallNew} title="stalled — new pods never go ready" />
        {deadline > 0 && (
          <div style={{ textAlign: 'center', marginTop: 12, opacity: deadline }}>
            <Box pad={12} borderColor={PALETTE.bad} bg={`${PALETTE.bad}12`} style={{ display: 'inline-block' }}>
              <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 17, fontWeight: 900 }}>
                after progressDeadlineSeconds → condition: Progressing = False (deadline exceeded)
              </span>
            </Box>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 22, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>it does not fail loudly — it stalls, and the deadline turns that into a reported condition</Label>
      </div>
    </div>
  );
};

function ReplicaChart({ old, new: nw, title }: { old: number; new: number; title: string }) {
  const total = old + nw;
  const tickLabels = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <div style={{ border: `1px solid ${PALETTE.line}`, borderRadius: 16, padding: 14 }}>
      <Label color={PALETTE.muted} size={11} style={{ marginBottom: 10 }}>{title} · desired 5 · window 3–7</Label>
      <div style={{ position: 'relative', height: 46 }}>
        {/* the band 3..7 (surge up, unavailable down) */}
        <div style={{ position: 'absolute', left: `${(3 / 8) * 100}%`, right: `${(1 - 7 / 8) * 100}%`, top: 0, bottom: 0, background: `${PALETTE.good}14`, border: `1px dashed ${PALETTE.good}66` }} />
        {/* old RS marker */}
        <Marker v={old} color={PALETTE.blue} label={`old RS ${old}`} />
        <Marker v={nw} color={PALETTE.violet} label={`new RS ${nw}`} />
        {/* axis */}
        <div style={{ position: 'absolute', top: 34, left: 0, right: 0, borderTop: `1px solid ${PALETTE.line}` }} />
        <div style={{ position: 'absolute', top: 36, left: 0, right: 0, display: 'flex', justifyContent: 'space-between' }}>
          {tickLabels.map((n) => (
            <span key={n} style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.muted }}>{n}</span>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 10, fontFamily: MONO, color: PALETTE.ink, fontSize: 14, fontWeight: 800 }}>
        total live: {total}
      </div>
    </div>
  );
}

function Marker({ v, color, label }: { v: number; color: string; label: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${(v / 8) * 100}%`,
        top: 8,
        transform: 'translateX(-50%)',
        fontFamily: MONO,
        fontSize: 13,
        fontWeight: 900,
        color,
        background: `${color}22`,
        border: `1px solid ${color}`,
        borderRadius: 6,
        padding: '2px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  );
}
