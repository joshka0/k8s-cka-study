import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const CoverageVsCompletion: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  // node membership churns about halfway through
  const members = Math.floor(seg(t, 0.2, 0.34) * 3) % 2 === 0 ? 3 : 2;
  const left = appear(t, 0.25, 0.4);
  const right = appear(t, 0.5, 0.62);
  const successes = Math.min(5, Math.floor(seg(t, 0.6, 0.95) * 7));
  const footer = appear(t, 0.92, 0.98);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 22, paddingLeft: 100, paddingRight: 100 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 30 }}>
        DaemonSet follows the cluster · Job follows a target
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 60 }}>
        {/* DaemonSet — coverage */}
        <div style={{ width: 650, border: `1px solid ${PALETTE.good}55`, borderRadius: 22, padding: 20, opacity: left }}>
          <Label color={PALETTE.good} size={13} style={{ marginBottom: 14 }}>DaemonSet · guarantees coverage</Label>
          <Box pad={12} borderColor={PALETTE.good} style={{ width: 220, textAlign: 'center', margin: '0 auto' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>eligible nodes</div>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 28, fontWeight: 900 }}>{members}</div>
          </Box>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 12 }}>
            {Array.from({ length: members }).map((_, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 800 }}>node {i + 1}</div>
                <Box pad={8} borderColor={PALETTE.good} style={{ width: 130, textAlign: 'center', marginTop: 4 }}>
                  <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 13, fontWeight: 900 }}>DaemonSet pod</div>
                </Box>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, marginTop: 14, textAlign: 'center' }}>
            adds a pod when a node joins · removes one when a node leaves
          </div>
        </div>

        {/* Job — completion */}
        <div style={{ width: 650, border: `1px solid ${PALETTE.amber}55`, borderRadius: 22, padding: 20, opacity: right }}>
          <Label color={PALETTE.amber} size={13} style={{ marginBottom: 14 }}>Job · guarantees completion</Label>
          <Box pad={12} borderColor={PALETTE.amber} style={{ width: 240, textAlign: 'center', margin: '0 auto' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900 }}>target: 5 successes</div>
            <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 28, fontWeight: 900 }}>{successes} / 5</div>
          </Box>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
            {Array.from({ length: 8 }).map((_, i) => {
              return <span key={i} style={{ width: 20, height: 40, borderRadius: 5, background: i < successes ? PALETTE.amber : '#0c111c', border: `1px solid ${i < successes ? PALETTE.amber : PALETTE.line}` }} />;
            })}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, marginTop: 14, textAlign: 'center' }}>
            pods fail and retry until the success count fills
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 28, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>one follows the cluster · the other follows a target</Label>
      </div>
    </div>
  );
};
