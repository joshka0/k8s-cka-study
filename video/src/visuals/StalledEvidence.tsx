import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 23 beat 7 — the minimum discriminating evidence for a stalled
 * rollout. Five items as a diagnostic card, each with the cause it isolates.
 * Laid out so the reader can invert from symptom to item.
 */

const ITEMS = [
  {
    n: '1',
    item: 'Deployment conditions + current revision',
    isolate: 'wrong revision / the rollout never started',
    color: PALETTE.blue,
  },
  {
    n: '2',
    item: 'desired · current · available on both ReplicaSets',
    isolate: 'capacity bound — surge or unavailable ceiling hit',
    color: PALETTE.cyan,
  },
  {
    n: '3',
    item: 'Pod readiness and events',
    isolate: 'failing readiness — new pods never become available',
    color: PALETTE.violet,
  },
  {
    n: '4',
    item: 'the surge and unavailable arithmetic',
    isolate: 'stuck against a bound — the numbers gate the next step',
    color: PALETTE.amber,
  },
  {
    n: '5',
    item: 'managedFields or admission errors on the updates',
    isolate: 'updates rejected — ownership conflict or admission refusal',
    color: PALETTE.good,
  },
];

export const StalledEvidence: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const rowOn = ITEMS.map((_, i) => appear(t, 0.06 + i * 0.1, 0.13 + i * 0.1));
  const footer = appear(t, 0.84, 0.92);

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
          <Label color={PALETTE.cyan} size={13}>the minimum discriminating evidence for a stalled rollout — five items, five causes</Label>
        </div>

        {/* column headers */}
        <div style={{ position: 'absolute', left: 120, top: 46, width: 1440, display: 'flex', gap: 24 }}>
          <div style={{ flex: '0 0 60px', fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: 2, color: PALETTE.muted }}>#</div>
          <div style={{ flex: 1, fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: 2, color: PALETTE.muted }}>EVIDENCE TO READ</div>
          <div style={{ flex: 1, fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: 2, color: PALETTE.muted }}>THE CAUSE IT ISOLATES</div>
        </div>

        {/* the rows */}
        <div style={{ position: 'absolute', left: 120, top: 76, width: 1440, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ITEMS.map((it, i) => {
            const on = rowOn[i];
            return (
              <div
                key={it.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  borderRadius: 14,
                  border: `2px solid ${on > 0.5 ? it.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${it.color}08` : '#101826',
                  padding: '15px 20px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <span style={{ flex: '0 0 48px', fontFamily: MONO, fontSize: 20, fontWeight: 900, color: it.color, border: `1px solid ${it.color}`, borderRadius: 999, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {it.n}
                </span>
                <div style={{ flex: 1, fontFamily: MONO, fontSize: 16.5, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.35 }}>{it.item}</div>
                <div style={{ flex: 1, fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: it.color, borderRadius: 10, background: '#0c111c', padding: '11px 16px', lineHeight: 1.4 }}>
                  {it.isolate}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: appear(t, 0.66, 0.74) }}>
          <Label color={PALETTE.amber} size={13}>invert from symptom to item: whichever cause you suspect has its own pair of numbers to read</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 686, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>read all five, and the wrong-revision · capacity · readiness · rejection · ownership cases separate cleanly</Label>
        </div>
      </div>
    </div>
  );
};
