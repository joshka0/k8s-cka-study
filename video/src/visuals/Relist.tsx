import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const STEPS = [
  { label: 'watch running', color: PALETTE.good },
  { label: 'connection drops', color: PALETTE.bad },
  { label: 'resume from expired rv → refused', color: PALETTE.bad },
  { label: 'reflector relists', color: PALETTE.cyan },
  { label: 'watch resumes from new rv', color: PALETTE.good },
];

export const Relist: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const t = frame / durationInFrames;

  const watch = seg(t, 0.08, 0.22);
  const drop = appear(t, 0.28, 0.36);
  const refused = appear(t, 0.4, 0.5);
  const relist = appear(t, 0.56, 0.68);
  const resume = appear(t, 0.74, 0.86);
  const footer = appear(t, 0.9, 0.97);

  const pulse = Math.sin((frame / fps) * 26) * 0.5 + 0.5;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 30, paddingLeft: 120, paddingRight: 120 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 30 }}>
        when the watch breaks — routine, not an incident
      </Label>

      {/* API server <-> reflector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60 }}>
        <Box pad={14} borderColor={PALETTE.blue} style={{ width: 220, textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>API server</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700 }}>bounded watch history</div>
        </Box>

        <div style={{ position: 'relative', width: 300, height: 90 }}>
          {/* watch line */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 0,
              right: 0,
              borderTop: drop > 0 ? `3px dashed ${PALETTE.bad}` : `3px solid ${PALETTE.good}`,
              opacity: drop > 0 ? 0.5 : 0.3 + pulse * 0.7,
            }}
          />
          {drop > 0 && <div style={{ position: 'absolute', left: 120, top: 12, fontSize: 30 }}>✕</div>}
          <div style={{ position: 'absolute', top: 48, left: 104, fontFamily: MONO, fontSize: 13, fontWeight: 800, color: drop > 0 ? PALETTE.bad : PALETTE.good }}>
            watch
          </div>
          {relist > 0 && (
            <div style={{ position: 'absolute', top: 8, left: 134, fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.cyan, opacity: relist }}>
              ⟲ relist
            </div>
          )}
        </div>

        <Box pad={14} borderColor={PALETTE.violet} style={{ width: 220, textAlign: 'center' }}>
          <Label color={PALETTE.violet} size={11}>reflector</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>cache</div>
        </Box>
      </div>

      {refused > 0 && (
        <div style={{ textAlign: 'center', marginTop: 18, opacity: refused }}>
          <Box pad={10} borderColor={PALETTE.bad} bg={`${PALETTE.bad}10`} style={{ display: 'inline-block' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 17, fontWeight: 900 }}>
              resume from rv 4711 → 410 Gone · the version no longer exists
            </span>
          </Box>
        </div>
      )}

      {/* build a fresh cache + resume */}
      {relist > 0 && (
        <div style={{ textAlign: 'center', marginTop: 14, opacity: relist }}>
          <Label color={PALETTE.cyan} size={12}>cache refills, latest rv recorded</Label>
        </div>
      )}
      {resume > 0 && (
        <div style={{ textAlign: 'center', marginTop: 10, opacity: resume }}>
          <Label color={PALETTE.good} size={12}>watch resumes from the new version ✓</Label>
        </div>
      )}

      {/* step log */}
      <div style={{ marginTop: 34, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => {
          const on = [0.1, 0.3, 0.44, 0.6, 0.8][i];
          return (
            <div
              key={s.label}
              style={{
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 800,
                color: s.color,
                border: `1px solid ${s.color}`,
                borderRadius: 999,
                padding: '6px 14px',
                opacity: appear(t, on, on + 0.05) > 0 ? 1 : 0.15,
                background: `${s.color}0e`,
              }}
            >
              {i + 1} · {s.label}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>correctness never depended on the stream staying up</Label>
      </div>
    </div>
  );
};
