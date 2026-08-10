import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const OptimisticConcurrency: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const read = appear(t, 0.08, 0.16);
  const aWrites = seg(t, 0.2, 0.3);
  const bRejected = appear(t, 0.34, 0.44);
  const split = appear(t, 0.5, 0.58);
  const wrongGrey = appear(t, 0.52, 0.62);
  const rightSol = appear(t, 0.6, 0.72);
  const footer = appear(t, 0.86, 0.94);

  const aOn = aWrites > 0 || t > 0.3 || wrongGrey > 0;
  const bOnRight = rightSol > 0;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 16, paddingLeft: 110, paddingRight: 110 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 18 }}>
        resourceVersion keeps concurrent writes safe
      </Label>

      {/* the object */}
      <div style={{ display: 'flex', justifyContent: 'center', opacity: read }}>
        <Box pad={16} borderColor={PALETTE.blue} style={{ width: 760, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Label color={PALETTE.muted} size={11}>object</Label>
            <span style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 20, fontWeight: 900 }}>
              rv {aWrites >= 1 ? '42' : bRejected > 0 && bOnRight ? '43' : bRejected ? '42' : '41'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14 }}>
            <FieldChip label="A's edit" on={aOn} />
            <FieldChip label="B's edit" on={bOnRight} />
          </div>
        </Box>
      </div>

      {/* the conflict */}
      {bRejected > 0 && (
        <div style={{ textAlign: 'center', marginTop: 18, opacity: bRejected }}>
          <Box pad={12} borderColor={PALETTE.bad} bg={`${PALETTE.bad}12`} style={{ display: 'inline-block' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 22, fontWeight: 900 }}>
              B submits carrying rv 41 → conflict (409)
            </span>
          </Box>
        </div>
      )}

      {/* two outcomes */}
      <div style={{ marginTop: 26, display: 'flex', justifyContent: 'center', gap: 50, opacity: split }}>
        {/* wrong path */}
        <div style={{ width: 520, border: `1px solid ${PALETTE.line}`, borderRadius: 20, padding: 18, opacity: 0.5 * (0.4 + wrongGrey * 0.6) }}>
          <Label color={PALETTE.muted} size={12} style={{ marginBottom: 12 }}>wrong path — B force-writes</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 17, fontWeight: 800, marginTop: 8 }}>↳ replay stale body</div>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 17, fontWeight: 800, marginTop: 6 }}>✕ A's change vanishes</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, marginTop: 8 }}>replaying a stale body destroys what the other writer did</div>
        </div>

        {/* right path */}
        <div style={{ width: 520, border: `1px solid ${PALETTE.good}66`, borderRadius: 20, padding: 18, opacity: 0.4 + rightSol * 0.6, background: `${PALETTE.good}0a` }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 12 }}>right path — re-read, recompute, retry</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 800, marginTop: 8 }}>1 · fetch current object at rv 42</div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 800, marginTop: 6 }}>2 · recompute delta against it</div>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 17, fontWeight: 800, marginTop: 6 }}>3 · write rv 43 — A's + B's both present</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>a conflict is not an error to retry blindly — recompute first</Label>
      </div>
    </div>
  );
};

function FieldChip({ label, on }: { label: string; on: boolean }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 16,
        fontWeight: 800,
        color: on ? PALETTE.good : PALETTE.line,
        border: `1px solid ${on ? PALETTE.good : PALETTE.line}`,
        borderRadius: 8,
        padding: '6px 14px',
        background: on ? `${PALETTE.good}12` : 'transparent',
      }}
    >
      {on ? '✓ ' : '· '}{label}
    </div>
  );
}
