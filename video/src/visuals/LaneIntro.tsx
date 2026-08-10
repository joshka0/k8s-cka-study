import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { LANES, PALETTE } from '../theme';
import { Box, Horizontal, Label, SANS, ArrowGlyph } from '../ui';
import type { Beat } from '../script';
import { appear } from '../motion';

const LANE_CHIPS: Record<string, string[]> = {
  control: ['API server', 'etcd', 'Controllers', 'Scheduler'],
  node: ['kubelet', 'Runtime', 'CNI', 'CSI'],
  pod: ['sandbox', 'containers', 'readiness'],
};

export const LaneIntro: React.FC<{ beat: Beat }> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const dissolveFrom = 0.58;
  const dissolveTo = 0.72;
  const arrowOpacity = 1 - appear(t, dissolveFrom, dissolveTo);

  const lanes = Object.entries(LANES).map(([id, lane]) => ({ id, ...lane }));

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 1560,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 22,
        }}
      >
        {lanes.map((lane, li) => {
          const band = appear(t, 0.04 + li * 0.08, 0.12 + li * 0.08);
          const chips = LANE_CHIPS[lane.id] ?? [];
          return (
            <React.Fragment key={lane.id}>
              <Box
                border={2}
                style={{
                  width: '100%',
                  borderRadius: 22,
                  opacity: 0.96,
                  transform: `translateX(${(1 - band) * -40}px)`,
                }}
              >
                <Horizontal gap={26} center style={{ padding: '6px 6px' }}>
                  <div style={{ width: 190, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 4,
                        background: lane.color,
                        display: 'inline-block',
                      }}
                    />
                    <Label color={lane.color} size={13}>
                      {lane.label}
                    </Label>
                  </div>
                  <Horizontal gap={10} wrap>
                    {chips.map((c, ci) => {
                      const on = appear(t, 0.16 + li * 0.03 + ci * 0.05, 0.24 + li * 0.03 + ci * 0.05) > 0.5;
                      const op = appear(t, 0.14 + li * 0.03 + ci * 0.05, 0.2 + li * 0.03 + ci * 0.05);
                      return (
                        <span
                          key={c}
                          style={{
                            fontFamily: SANS,
                            fontSize: 17,
                            fontWeight: 700,
                            color: on ? PALETTE.ink : PALETTE.muted,
                            border: `1px solid ${on ? lane.color : PALETTE.line}`,
                            background: on ? `${lane.color}24` : PALETTE.panel,
                            borderRadius: 999,
                            padding: '9px 16px',
                            opacity: op,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {c}
                        </span>
                      );
                    })}
                  </Horizontal>
                  {/* independent loop arrow */}
                  <LoopArrow color={lane.color} t={t} showAfter={dissolveFrom} li={li} />
                </Horizontal>
              </Box>
              {li < lanes.length - 1 && (
                <div
                  style={{
                    textAlign: 'center',
                    color: PALETTE.line,
                    fontSize: 24,
                    lineHeight: 1,
                    opacity: arrowOpacity,
                    letterSpacing: 6,
                  }}
                >
                  ⬍
                </div>
              )}
            </React.Fragment>
          );
        })}
        <div style={{ textAlign: 'center', marginTop: 4, opacity: 0.5 }}>
          <Label color={PALETTE.line} size={12}>
            three lanes — independent loops, not a pipeline
          </Label>
        </div>
      </div>

      {/* desync note */}
      {t > dissolveFrom && (
        <div
          style={{
            alignSelf: 'center',
            marginTop: 14,
            fontFamily: SANS,
            color: PALETTE.amber,
            fontSize: 15,
            fontWeight: 700,
            opacity: appear(t, dissolveFrom + 0.05, dissolveFrom + 0.15),
          }}
        >
          each loops independently · at different rates
        </div>
      )}
    </div>
  );
};

function LoopArrow({ color, t, showAfter, li }: { color: string; t: number; showAfter: number; li: number }) {
  const shows = appear(t, showAfter + 0.05, showAfter + 0.15 + li * 0.04);
  // different speed per lane
  const period = [2.2, 1.6, 2.8][li] ?? 2;
  const local = ((t - showAfter) / period) % 1;
  const scale = 0.7 + 0.3 * Math.abs(Math.cos(local * Math.PI * 2));
  const deg = local * 360;
  return (
    <span
      style={{
        flex: '0 0 auto',
        color,
        fontSize: 34,
        display: 'inline-block',
        opacity: shows,
        transform: `rotate(${deg}deg) scale(${scale})`,
        transition: 'transform 16ms linear',
      }}
    >
      ↻
    </span>
  );
}
