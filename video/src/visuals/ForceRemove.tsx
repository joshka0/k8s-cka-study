import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const ORPHANS = ['cloud volume', 'DNS record', 'database'];

export const ForceRemove: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const strip = appear(t, 0.12, 0.24);
  const gone = appear(t, 0.3, 0.4);
  const pan = appear(t, 0.52, 0.64);
  const orphanIn = (i: number) => appear(t, 0.6 + i * 0.08, 0.66 + i * 0.08);
  const footer = appear(t, 0.9, 0.97);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 110, paddingRight: 110 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 28 }}>
        force-removing a finalizer is a decision, not a fix
      </Label>

      {/* strip */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 30, alignItems: 'center', opacity: strip }}>
        <Box pad={12} borderColor={PALETTE.cyan} style={{ width: 240, textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>CR · finalizer</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, marginTop: 4 }}>finalizer: cleanup.example.io</div>
        </Box>
        <span style={{ color: PALETTE.bad, fontSize: 26 }}>➜ strip ✂</span>
        <Box pad={12} borderColor={PALETTE.good} style={{ width: 200, textAlign: 'center', opacity: gone }}>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 17, fontWeight: 900 }}>object gone ✓</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, marginTop: 4 }}>cluster looks healthy</div>
        </Box>
      </div>

      {/* pan out to what was left behind */}
      <div style={{ marginTop: 34, opacity: pan, textAlign: 'center' }}>
        <Label color={PALETTE.bad} size={13} style={{ marginBottom: 16 }}>
          pan out — the external resources are still running, unreferenced
        </Label>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 30 }}>
          {ORPHANS.map((o, i) => (
            <Box key={o} pad={16} borderColor={PALETTE.bad} bg={`${PALETTE.bad}0a`} style={{ width: 280, textAlign: 'center', opacity: orphanIn(i) }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>☁</div>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>{o}</div>
              <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 13, fontWeight: 800, marginTop: 6 }}>nothing tracks it</div>
            </Box>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>find the owner first — remove the finalizer only once cleanup has actually happened</Label>
      </div>
    </div>
  );
};
