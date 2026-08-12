import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 16 beat 5 — a limit is not isolation. Two distinct mechanisms: a CFS
 * quota throttles a container over time; a cpuset pins it in space. They act
 * on different axes. Then the additional requirements for real latency work
 * are listed as further, separate conditions.
 */

export const LimitIsNotIsolation: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const quotaIn = appear(t, 0.1, 0.2);
  const cpusetIn = appear(t, 0.24, 0.34);
  const condIn = appear(t, 0.5, 0.62);
  const footer = appear(t, 0.9, 0.97);

  const throttle = seg(t, 0.14, 0.5);

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
      <div style={{ width: 1660, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>a CPU limit is not CPU isolation — they act on different axes</Label>
        </div>

        {/* quota mechanism */}
        <div style={{ position: 'absolute', left: 130, top: 90, width: 660, borderRadius: 20, border: `2px solid ${PALETTE.blue}`, background: `${PALETTE.blue}06`, padding: '18px 22px', opacity: quotaIn }}>
          <Label color={PALETTE.blueInk} size={12} style={{ marginBottom: 10 }}>a CFS quota — throttles over time</Label>
          {/* a time axis being throttled */}
          <div style={{ position: 'relative', height: 54 }}>
            {Array.from({ length: 14 }).map((_, i) => {
              const on = throttle > (i + 1) / 15;
              const throttled = on && (i === 5 || i === 6 || i === 7);
              return (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    left: i * 44,
                    top: throttled ? 4 : 20,
                    width: 30,
                    height: throttled ? 14 : 34,
                    borderRadius: 5,
                    background: throttled ? PALETTE.bad : PALETTE.blue,
                    opacity: on ? 0.9 : 0.1,
                  }}
                />
              );
            })}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 10, lineHeight: 1.4 }}>
            caps how much CPU time you get — the red bars are time you were not allowed to run
          </div>
        </div>

        {/* cpuset mechanism */}
        <div style={{ position: 'absolute', left: 870, top: 90, width: 660, borderRadius: 20, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}06`, padding: '18px 22px', opacity: cpusetIn }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 10 }}>a cpuset — pins in space</Label>
          <div style={{ position: 'relative', height: 54, display: 'flex', alignItems: 'center', gap: 8 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: i < 2 ? PALETTE.good : PALETTE.line, border: `1px solid ${i < 2 ? PALETTE.good : PALETTE.line}`, borderRadius: 6, padding: '8px 10px', background: i < 2 ? `${PALETTE.good}0c` : '#0d1522' }}>
                {i}
              </span>
            ))}
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.muted }}>…</span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 10, lineHeight: 1.4 }}>
            controls where you run — exclusive cores, separate from the shared pool
          </div>
        </div>

        {/* further conditions */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 440,
            width: 1260,
            borderRadius: 18,
            border: `2px solid ${PALETTE.amber}55`,
            background: `${PALETTE.amber}06`,
            padding: '18px 24px',
            opacity: condIn,
          }}
        >
          <Label color={PALETTE.amber} size={12} style={{ marginBottom: 12 }}>predictable latency usually needs more than either</Label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'nowrap' }}>
            {['reserved system CPUs', 'NUMA-local memory + devices', 'IRQ placement', 'huge pages', 'kernel + runtime preserving the cgroup layout'].map((c) => (
              <div key={c} style={{ flex: 1, fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.ink, border: `1px solid ${PALETTE.amber}55`, borderRadius: 10, background: '#0d1522', padding: '10px 12px', lineHeight: 1.35, textAlign: 'center' }}>
                {c}
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a limit is not a weaker version of isolation — it acts on a different axis entirely</Label>
        </div>
      </div>
    </div>
  );
};
