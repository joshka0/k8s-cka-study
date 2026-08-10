import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const HotLoop: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const fire = seg(t, 0.2, 0.6);
  const fix = appear(t, 0.7, 0.8);
  const footer = appear(t, 0.9, 0.96);

  // write rate climbs while firing, settles after the fix
  const climbs = fire * 14;
  const settles = fix > 0 ? Math.max(0, climbs - fix * 14 * 0.9) : climbs;
  const writes = Math.floor(settles);

  const cycle = (i: number) => appear(t, 0.1 + i * 0.05, 0.14 + i * 0.05);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 24, paddingLeft: 120, paddingRight: 120 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        a controller that writes on every pass builds an infinite loop with an API server in the middle
      </Label>

      {/* the cycle before/after */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 80 }}>
        {/* BEFORE — unconditional write */}
        <div style={{ width: 600, textAlign: 'center', border: `1px solid ${PALETTE.bad}55`, borderRadius: 22, padding: 18, background: `${PALETTE.bad}08` }}>
          <Label color={PALETTE.bad} size={12} style={{ marginBottom: 16 }}>before — write on every pass</Label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            {['observe', 'compare', 'act'].map((s, i) => (
              <Box key={s} pad={10} borderColor={PALETTE.blue} style={{ width: 130, textAlign: 'center', opacity: cycle(i) }}>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>{s}</div>
              </Box>
            ))}
          </div>
          {/* write -> watch feedback */}
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, fontFamily: MONO }}>
            <Box pad={8} borderColor={PALETTE.bad} style={{ width: 150, textAlign: 'center', opacity: fire }}>
              <div style={{ color: PALETTE.bad, fontSize: 15, fontWeight: 900 }}>write</div>
            </Box>
            <span style={{ color: PALETTE.bad, fontSize: 22, opacity: fire }}>↻</span>
            <span style={{ color: PALETTE.muted, fontSize: 13, fontWeight: 800 }}>watch event feeds the same controller</span>
          </div>

          <div style={{ marginTop: 18 }}>
            <Label color={PALETTE.bad} size={10}>write rate</Label>
            <div style={{ height: 12, background: '#0c111c', borderRadius: 999, marginTop: 6, position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, climbs * 7)}%`, height: '100%', background: PALETTE.bad, borderRadius: 999, transition: 'none' }} />
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 16, fontWeight: 900, marginTop: 6 }}>
              {writes} writes and climbing
            </div>
          </div>
        </div>

        {/* AFTER — compare before patch */}
        <div style={{ width: 600, textAlign: 'center', border: `1px solid ${PALETTE.good}55`, borderRadius: 22, padding: 18, background: `${PALETTE.good}08`, opacity: 0.35 + fix * 0.65 }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 16 }}>after — compare before patching</Label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            {['observe', 'compare', 'act?'].map((s, i) => (
              <Box key={s} pad={10} borderColor={PALETTE.line} style={{ width: 130, textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, color: i === 1 ? PALETTE.good : PALETTE.ink, fontSize: 16, fontWeight: 900 }}>{s}</div>
              </Box>
            ))}
          </div>
          <div style={{ marginTop: 16, fontFamily: MONO }}>
            <Box pad={8} borderColor={PALETTE.good} style={{ width: 300, textAlign: 'center', margin: '0 auto' }}>
              <div style={{ color: PALETTE.good, fontSize: 15, fontWeight: 900 }}>semantically nothing changed → skip write</div>
            </Box>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, marginTop: 10 }}>
              the write stops, the loop settles
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <Label color={PALETTE.good} size={10}>write rate</Label>
            <div style={{ height: 12, background: '#0c111c', borderRadius: 999, marginTop: 6, position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, settles * 3)}%`, height: '100%', background: PALETTE.good, borderRadius: 999 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>the cause is almost always cosmetic — a timestamp, or a list the controller reorders</Label>
      </div>
    </div>
  );
};
