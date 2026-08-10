import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const Workqueue: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const evt = seg(t, 0.1, 0.3);
  const leftPile = seg(t, 0.14, 0.34);
  const rightCollapse = seg(t, 0.34, 0.5);
  const worker = appear(t, 0.55, 0.65);
  const cache = appear(t, 0.7, 0.8);
  const footer = appear(t, 0.86, 0.94);

  const piled = Math.floor(leftPile * 20);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 110, paddingRight: 110 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 24 }}>
        twenty rapid change events fire at one object
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 90 }}>
        {/* left lane: payloads pile up */}
        <div style={{ width: 520, textAlign: 'center' }}>
          <Label color={PALETTE.bad} size={11} style={{ marginBottom: 12 }}>payload queue — what a change carries</Label>
          <Box pad={12} borderColor={PALETTE.bad} bg={`${PALETTE.bad}0d`} style={{ height: 240, position: 'relative', overflow: 'hidden' }}>
            <Label color={PALETTE.muted} size={9} style={{ textAlign: 'left' }}>enqueue a payload per change</Label>
            {Array.from({ length: Math.min(piled, 9) }).map((_, k) => (
              <div key={k} style={{ position: 'absolute', left: 14, top: 26 + k * 20, background: PALETTE.bad, color: '#fff', fontFamily: MONO, fontSize: 11, fontWeight: 900, borderRadius: 4, padding: '2px 8px', opacity: 1 - k * 0.08 }}>
                change #{k + 1} (full object)
              </div>
            ))}
            {piled > 9 && <div style={{ position: 'absolute', left: 14, top: 26 + 9 * 20, fontFamily: MONO, color: PALETTE.bad, fontSize: 15, fontWeight: 900 }}>… + {piled - 9} more</div>}
          </Box>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 15, marginTop: 8, fontWeight: 800, opacity: leftPile }}>
            {piled} payloads queued · stale snapshots
          </div>
        </div>

        {/* right lane: keys collapse */}
        <div style={{ width: 520, textAlign: 'center' }}>
          <Label color={PALETTE.good} size={11} style={{ marginBottom: 12 }}>key queue — namespace / name</Label>
          <Box pad={12} borderColor={PALETTE.good} bg={`${PALETTE.good}0d`} style={{ height: 240, position: 'relative', overflow: 'hidden' }}>
            <Label color={PALETTE.muted} size={9} style={{ textAlign: 'left' }}>a burst of twenty collapses into one key</Label>
            {rightCollapse > 0 && (
              <div style={{ position: 'absolute', left: 14, top: 26, background: PALETTE.good, color: '#03110a', fontFamily: MONO, fontSize: 15, fontWeight: 900, borderRadius: 6, padding: '8px 14px' }}>
                ns/my-app/5f8c (×20)
              </div>
            )}
          </Box>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 15, marginTop: 8, fontWeight: 800, opacity: rightCollapse }}>
            one key in the queue — the worker acts on what is true now
          </div>
        </div>
      </div>

      {/* worker pops the key and reads current state */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, marginTop: 30, opacity: worker }}>
        <Box pad={12} borderColor={PALETTE.cyan} style={{ width: 200, textAlign: 'center' }}>
          <Label color={PALETTE.cyan} size={11}>worker</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>pop key</div>
        </Box>
        <span style={{ color: PALETTE.muted, fontSize: 24 }}>→</span>
        <Box pad={12} borderColor={PALETTE.blue} style={{ width: 260, textAlign: 'center', opacity: cache }}>
          <div style={{ fontFamily: MONO, color: PALETTE.blue, fontSize: 18, fontWeight: 900 }}>read current object</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, marginTop: 2, fontWeight: 700 }}>from the shared cache</div>
        </Box>
      </div>

      <div style={{ textAlign: 'center', marginTop: 22, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>the handler never acts on a stale snapshot that arrived in a message</Label>
      </div>
    </div>
  );
};
