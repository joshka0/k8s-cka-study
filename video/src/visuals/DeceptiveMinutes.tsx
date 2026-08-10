import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 11 beat 9 — the deceptive minutes. A timeline from the moment the
 * data directory is deleted: control-plane state is gone immediately, yet
 * workloads keep serving and the clock keeps running. At the point where it
 * stops looking fine — a node fails, or something needs rescheduling, and
 * nothing responds — the elapsed time is on screen so the delay reads as a
 * duration.
 */

export const DeceptiveMinutes: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const sceneIn = appear(t, 0.08, 0.16);
  const deleted = seg(t, 0.1, 0.2);
  const serving = seg(t, 0.2, 0.32);
  const clockTicks = seg(t, 0.26, 0.62);
  const breakPoint = seg(t, 0.62, 0.76);
  const footer = appear(t, 0.86, 0.94);

  // The clock runs for the whole beat; elapsed seconds are the point.
  const elapsed = Math.round(clockTicks * 210);
  const mm = Math.floor(elapsed / 60);
  const ss = String(elapsed % 60).padStart(2, '0');
  // The deceptive window is the span between deletion and the first demand.
  const deceptive = Math.round(120 * (0.6 - 0.1));

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
      <div style={{ width: 1620, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>the data directory is gone — the cluster will keep looking fine for a while</Label>
        </div>

        {/* the timeline */}
        <div style={{ position: 'absolute', left: 80, top: 120, width: 1460, opacity: sceneIn }}>
          {/* base line */}
          <div style={{ borderTop: `3px solid ${PALETTE.line}`, position: 'relative', height: 0, marginTop: 90 }}>
            {/* T0 marker */}
            <div style={{ position: 'absolute', left: 0, top: -8 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: PALETTE.bad }} />
            </div>
            {/* the point it stops looking fine */}
            <div style={{ position: 'absolute', left: '62%', top: -8, opacity: breakPoint }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: PALETTE.amber }} />
            </div>
          </div>

          {/* T0 label */}
          <div style={{ position: 'absolute', left: 0, top: 100 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 16, fontWeight: 900, opacity: deleted }}>T0 — data directory deleted</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>
              control-plane state gone immediately
            </div>
          </div>

          {/* the deceptive window */}
          <div
            style={{
              position: 'absolute',
              left: 150,
              top: -22,
              width: '52%',
              borderTop: `3px dashed ${PALETTE.good}`,
              opacity: serving,
            }}
          />
          <div style={{ position: 'absolute', left: 150, top: 100 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 16, fontWeight: 900, opacity: serving }}>
              workloads still serving — it looks fine
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>
              nothing has asked for the control plane yet — the clock runs
            </div>
          </div>

          {/* the break point */}
          <div style={{ position: 'absolute', left: '62%', top: 100, opacity: breakPoint }}>
            <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 16, fontWeight: 900 }}>
              ✕ a node fails — or something needs rescheduling
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 13.5, fontWeight: 800, marginTop: 4 }}>
              nothing responds — that is the first honest signal
            </div>
          </div>
        </div>

        {/* the running clock */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 420,
            textAlign: 'center',
            opacity: clockTicks,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 58, fontWeight: 900, letterSpacing: '0.05em' }}>
            0:{mm}:{ss}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 800, marginTop: 4 }}>
            elapsed since the directory was deleted — {deceptive}+ seconds it looked fine
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the delay is a duration you can measure — and the longer it is, the more dangerously the backup hypothesis sits</Label>
        </div>
      </div>
    </div>
  );
};
