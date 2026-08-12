import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 14 beat 7 — why "BestEffort is evicted first" is incomplete. The
 * one-line slogan is expanded into the real ordering: usage above requests,
 * then Priority, then relative excess. Beside it, the other pressure signals —
 * disk, inodes, PIDs — with their own behaviour. The expansion from slogan to
 * mechanism is the beat.
 */

const RANK_ORDER = [
  { tier: '1', note: 'usage above requests', color: PALETTE.blue },
  { tier: '2', note: 'then Priority', color: PALETTE.cyan },
  { tier: '3', note: 'then relative excess', color: PALETTE.good },
];

const OTHER_PRESSURE = [
  { signal: 'disk', note: 'usage against the disk threshold' },
  { signal: 'inodes', note: 'own counting, own marker' },
  { signal: 'PIDs', note: 'own pressure source, own behaviour' },
];

export const EvictionRanking: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const sloganIn = appear(t, 0.08, 0.16);
  const expand = seg(t, 0.24, 0.4);
  const tierOn = RANK_ORDER.map((_, i) => appear(t, 0.3 + i * 0.08, 0.37 + i * 0.08));
  const otherOn = OTHER_PRESSURE.map((_, i) => appear(t, 0.32 + i * 0.08, 0.38 + i * 0.08));
  const footer = appear(t, 0.9, 0.97);

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
      <div style={{ width: 1680, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>"BestEffort is evicted first" is a useful approximation — not the ranking itself</Label>
        </div>

        {/* the slogan */}
        <div
          style={{
            position: 'absolute',
            left: 320,
            top: 60,
            width: 620,
            borderRadius: 16,
            border: `2px solid ${PALETTE.amber}`,
            background: `${PALETTE.amber}0a`,
            padding: '14px 20px',
            textAlign: 'center',
            opacity: sloganIn,
          }}
        >
          <Label color={PALETTE.amber} size={12} style={{ marginBottom: 8 }}>the naive one-liner</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>"BestEffort is evicted first"</div>
        </div>

        <div style={{ position: 'absolute', left: 940, top: 90, color: PALETTE.line, fontSize: 32, fontWeight: 900, opacity: expand }}>↓</div>

        {/* the real ordering */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 180,
            width: 680,
            borderRadius: 18,
            border: `2px solid ${PALETTE.good}55`,
            background: `${PALETTE.good}06`,
            padding: '18px 20px',
            opacity: expand,
          }}
        >
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 12 }}>the actual ordering</Label>
          {RANK_ORDER.map((r, i) => (
            <div
              key={r.tier}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                borderRadius: 10,
                border: `1px solid ${r.color}55`,
                background: '#0d1522',
                padding: '10px 14px',
                marginBottom: 8,
                opacity: tierOn[i],
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color: r.color, border: `1px solid ${r.color}`, borderRadius: 8, padding: '2px 8px' }}>{r.tier}</span>
              <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink }}>{r.note}</span>
            </div>
          ))}
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8 }}>a quality-of-life class is only an approximation of this</div>
        </div>

        {/* other pressure signals */}
        <div
          style={{
            position: 'absolute',
            right: 120,
            top: 180,
            width: 620,
            borderRadius: 18,
            border: `2px solid ${PALETTE.violet}55`,
            background: `${PALETTE.violet}06`,
            padding: '18px 20px',
            opacity: expand,
          }}
        >
          <Label color={PALETTE.violet} size={12} style={{ marginBottom: 12 }}>the other pressure signals behave differently again</Label>
          {OTHER_PRESSURE.map((p, i) => (
            <div
              key={p.signal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                borderRadius: 10,
                border: `1px solid ${PALETTE.violet}55`,
                background: '#0d1522',
                padding: '10px 14px',
                marginBottom: 8,
                opacity: otherOn[i],
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.violet, width: 70 }}>{p.signal}</span>
              <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.muted }}>{p.note}</span>
            </div>
          ))}
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8 }}>disk and PID pressure are not the memory ranking</div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>naming those axes is what shows you have watched it happen rather than read the summary</Label>
        </div>
      </div>
    </div>
  );
};
