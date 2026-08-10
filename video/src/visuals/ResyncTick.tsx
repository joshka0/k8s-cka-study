import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const OBJS = ['obj A', 'obj B', 'obj C', 'obj D', 'obj E', 'obj F'];

export const ResyncTick: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const t = frame / durationInFrames;

  const cache = appear(t, 0.08, 0.16);
  const tick = seg(t, 0.3, 0.66);
  const missedIn = tick > 0.45 ? 1 : 0;
  const repeat = (t - 0.3) * 1.8 % 1;  // recurring sweep look
  const footer = appear(t, 0.8, 0.88);

  const sweepPos = Math.sin(t * 18 * (durationInFrames / 60)) * 0.5 + 0.5;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 30, paddingLeft: 120, paddingRight: 120 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 30 }}>
        informers resync on a timer — replay everything through the handlers, even when nothing changed
      </Label>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50, opacity: cache }}>
        {/* the cached objects */}
        <Box pad={16} borderColor={PALETTE.blue} style={{ width: 560 }}>
          <Label color={PALETTE.blue} size={11} style={{ marginBottom: 12 }}>informer cache</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {OBJS.map((o, i) => {
              const isMissed = i === 2;
              const swept = tick > i / OBJS.length;
              const pickedUp = isMissed && missedIn > 0;
              return (
                <div key={o} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: `1px solid ${PALETTE.line}`, borderRadius: 8, background: pickedUp ? `${PALETTE.good}14` : 'transparent' }}>
                  <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800 }}>{o}</span>
                  {isMissed ? (
                    <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 900, color: pickedUp ? PALETTE.good : PALETTE.bad }}>
                      {pickedUp ? '✓ acted on by sweep' : 'missed on original event'}
                    </span>
                  ) : (
                    <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: swept ? PALETTE.muted : PALETTE.line }}>
                      {swept ? 'replayed' : '·'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Box>

        {/* handler box */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: PALETTE.muted, fontSize: 30 }}>⟶</span>
          <Box pad={16} borderColor={PALETTE.violet} style={{ width: 240, marginTop: 16 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 18, fontWeight: 900 }}>handlers</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, marginTop: 4, fontWeight: 700 }}>reconcile each key</div>
          </Box>
        </div>
      </div>

      {/* recurring sweep indicator */}
      <div style={{ marginTop: 30, textAlign: 'center', opacity: tick }}>
        <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
          periodic resync tick — sweeping every object back through the handlers
        </div>
        <div style={{ height: 10, width: 900, background: '#0c111c', borderRadius: 999, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: 120, background: `${PALETTE.cyan}88`, borderRadius: 999, left: `calc(${sweepPos * 100}% - 60px)`, transition: 'none' }} />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>a safety net — catches what a controller failed to act on, and drift that happened outside the API</Label>
      </div>
    </div>
  );
};
