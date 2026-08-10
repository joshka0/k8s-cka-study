import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const Finalizers: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const del = appear(t, 0.12, 0.2);
  const stamp = appear(t, 0.24, 0.32);
  const good = appear(t, 0.44, 0.55);
  const stuck = appear(t, 0.62, 0.72);
  const footer = appear(t, 0.88, 0.96);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 110, paddingRight: 110 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 28 }}>
        a finalizer says do not actually remove me yet — deletion that waits
      </Label>

      {/* delete a CR with a finalizer */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center' }}>
        <Box pad={12} borderColor={PALETTE.cyan} style={{ width: 260, textAlign: 'center', opacity: del }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>CR · widget-a</div>
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 13, fontWeight: 800, marginTop: 6 }}>finalizer: cleanup.example.io</div>
        </Box>
        <span style={{ color: PALETTE.muted, fontSize: 22, opacity: del }}>kubectl delete →</span>
      </div>

      {stamp > 0 && (
        <div style={{ textAlign: 'center', marginTop: 14, opacity: stamp }}>
          <Box pad={10} borderColor={PALETTE.amber} bg={`${PALETTE.amber}0e`} style={{ display: 'inline-block' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800 }}>
              deletionTimestamp set · <b style={{ color: PALETTE.amber }}>the object stays</b>
            </span>
          </Box>
        </div>
      )}

      {/* two outcomes */}
      <div style={{ marginTop: 26, display: 'flex', justifyContent: 'center', gap: 60 }}>
        {/* controller cleans up */}
        <div style={{ width: 620, border: `1px solid ${PALETTE.good}55`, borderRadius: 20, padding: 18, opacity: 0.25 + good * 0.75 }}>
          <Label color={PALETTE.good} size={13} style={{ marginBottom: 10 }}>controller is up — it cleans up</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800, margin: '6px 0' }}>1 · removes the external resource</div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800, margin: '6px 0' }}>2 · removes the finalizer</div>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 16, fontWeight: 900, marginTop: 6 }}>✓ object disappears cleanly</div>
        </div>

        {/* stuck */}
        <div style={{ width: 620, border: `1px solid ${PALETTE.bad}55`, borderRadius: 20, padding: 18, opacity: 0.25 + stuck * 0.75 }}>
          <Label color={PALETTE.bad} size={13} style={{ marginBottom: 10 }}>controller is down — the object simply waits</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900, margin: '8px 0' }}>
            Terminating <span style={{ color: PALETTE.bad }}>…</span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 800 }}>
            a CR stuck in Terminating is usually not a Kubernetes bug — it is a controller that is down or blocked
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>finalizer holds the object until the owning controller clears it</Label>
      </div>
    </div>
  );
};
