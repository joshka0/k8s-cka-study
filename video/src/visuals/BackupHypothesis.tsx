import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 11 beat 7 — the untested backup. Three stages with honest labels:
 * snapshot taken (a file exists), snapshot verified (the file parses),
 * restore rehearsed (a cluster actually came back). Most people stop at
 * stage two and treat it as done. The gap between 'parses' and 'comes back'
 * is the point — drawn as the wide gap it is.
 */

export const BackupHypothesis: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const stageOn = [0, 1, 2].map((_, i) => appear(t, 0.1 + i * 0.14, 0.2 + i * 0.14));
  const stopAt = seg(t, 0.5, 0.62);
  const gapWide = seg(t, 0.62, 0.76);
  const footer = appear(t, 0.86, 0.94);

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
          <Label color={PALETTE.cyan} size={13}>a backup is a hypothesis until a restore proves it — three stages, honest labels</Label>
        </div>

        {/* stage 1 */}
        <StageCard
          x={60}
          n="1"
          title="snapshot taken"
          tag="a file exists"
          color={PALETTE.blue}
          on={stageOn[0]}
        />

        {/* stage 2 */}
        <StageCard
          x={400}
          n="2"
          title="snapshot verified"
          tag="the file parses"
          color={PALETTE.cyan}
          on={stageOn[1]}
        />

        {/* the wide gap */}
        <div style={{ position: 'absolute', left: 740, top: 250, width: 420, opacity: gapWide }}>
          <div style={{ borderTop: `3px dashed ${PALETTE.amber}88`, position: 'absolute', left: 0, right: 40, top: 40 }} />
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 15, fontWeight: 900, textAlign: 'center', marginTop: 62 }}>
            the wide gap — 'parses' is not 'comes back'
          </div>
        </div>

        {/* stage 3, far away */}
        <StageCard
          x={1160}
          n="3"
          title="restore rehearsed"
          tag="a cluster actually came back"
          color={PALETTE.good}
          on={stageOn[2]}
        />

        {/* where people stop */}
        <div
          style={{
            position: 'absolute',
            left: 400,
            top: 470,
            borderRadius: 12,
            border: `2px solid ${PALETTE.bad}`,
            background: `${PALETTE.bad}0c`,
            padding: '12px 18px',
            fontFamily: MONO,
            color: PALETTE.bad,
            fontSize: 16,
            fontWeight: 900,
            opacity: stopAt,
            transform: stopAt > 0.5 ? 'none' : 'translateY(-8px)',
            whiteSpace: 'nowrap',
          }}
        >
          ⚠ most people stop here — and call it done
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the file parses, and nothing has ever come back — until stage three runs, the backup is a hypothesis</Label>
        </div>
      </div>
    </div>
  );
};

function StageCard({ x, n, title, tag, color, on }: { x: number; n: string; title: string; tag: string; color: string; on: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 200,
        width: 330,
        borderRadius: 18,
        border: `2px solid ${on > 0.5 ? color : PALETTE.line}`,
        background: on > 0.5 ? `${color}0c` : PALETTE.panel,
        padding: '20px 22px',
        opacity: Math.max(0.3, on),
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 15,
          fontWeight: 900,
          color,
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
        }}
      >
        {n}
      </div>
      <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 21, fontWeight: 900 }}>{title}</div>
      <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 800, marginTop: 10 }}>{tag}</div>
    </div>
  );
}
