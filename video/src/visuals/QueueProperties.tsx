import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const QueueProperties: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const dedup = appear(t, 0.2, 0.3);
  const backoff = appear(t, 0.44, 0.54);
  const inflight = appear(t, 0.68, 0.78);
  const footer = appear(t, 0.9, 0.96);

  const BO = [1, 2, 4, 8];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 26, paddingLeft: 90, paddingRight: 90 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 34 }}>
        the workqueue does more than hold keys — three properties
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 44 }}>
        {/* dedup */}
        <div style={{ width: 470, border: `1px solid ${PALETTE.cyan}55`, borderRadius: 20, padding: 18, opacity: 0.25 + dedup * 0.75 }}>
          <Label color={PALETTE.cyan} size={13} style={{ marginBottom: 12 }}>dedup — a burst becomes one item</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800 }}>20 events →</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} style={{ width: 18, height: 18, borderRadius: 4, background: PALETTE.cyan, opacity: 0.7 }} />
              ))}
              <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 900, alignSelf: 'center' }}>…</span>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 15, fontWeight: 900, background: `${PALETTE.cyan}14`, border: `1px solid ${PALETTE.cyan}`, borderRadius: 6, padding: '6px 10px', marginTop: 4 }}>
              key: ns/name (×1)
            </div>
          </div>
        </div>

        {/* backoff */}
        <div style={{ width: 470, border: `1px solid ${PALETTE.amber}55`, borderRadius: 20, padding: 18, opacity: 0.25 + backoff * 0.75 }}>
          <Label color={PALETTE.amber} size={13} style={{ marginBottom: 12 }}>rate-limit — a failing key backs off exponentially</Label>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 90 }}>
            {BO.map((b, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 13, fontWeight: 900 }}>{b}s</div>
                <div style={{ width: 44, height: (b / 8) * 70, background: PALETTE.amber, borderRadius: 6, opacity: 0.4 + (b / 8) * 0.6 }} />
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, marginTop: 6 }}>
            … instead of spinning
          </div>
        </div>

        {/* in-flight lock */}
        <div style={{ width: 470, border: `1px solid ${PALETTE.violet}55`, borderRadius: 20, padding: 18, opacity: 0.25 + inflight * 0.75 }}>
          <Label color={PALETTE.violet} size={13} style={{ marginBottom: 12 }}>in-flight — one worker at a time per key</Label>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Box pad={8} borderColor={PALETTE.violet} style={{ width: 150, textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 13, fontWeight: 900 }}>worker 1 · busy</div>
              </Box>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 30, marginBottom: 2 }}>🔒</div>
              <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 13, fontWeight: 900 }}>blocked</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Box pad={8} borderColor={PALETTE.line} style={{ width: 150, textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 900 }}>worker 2 · waiting</div>
              </Box>
            </div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, marginTop: 8 }}>
            the same key is never processed by two workers at once
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 30, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>three properties — why controllers survive a bad day without a queue of their own</Label>
      </div>
    </div>
  );
};
