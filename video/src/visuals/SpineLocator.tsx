import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { LANES, PALETTE } from '../theme';
import { Label, MONO, SANS } from '../ui';
import { appear, seg } from '../motion';
import type { VisualProps } from '../module';
import { spineName } from '../module';

/**
 * The series' connective tissue. Reads as the pilot's SpineRecap — same three
 * lane rows, same fourteen segments, same colours — but lights exactly one
 * segment: `module.light`. On the opening beat the module's own segment
 * magnifies while the rest dim; on the closing beat it shows the full spine
 * then previews the next segment.
 */
const ROWS: { lane: string; caption: string; names: string[] }[] = [
  {
    lane: 'control',
    caption: 'decide what should exist',
    names: ['desired object', 'admission / storage', 'watch + cache', 'controller queue', 'scheduler queue + binding'],
  },
  {
    lane: 'node',
    caption: 'make it real',
    names: ['kubelet', 'CRI', 'CNI', 'CSI'],
  },
  {
    lane: 'pod',
    caption: 'expose it, reach it',
    names: ['EndpointSlice', 'service', 'DNS', 'data plane', 'application'],
  },
];

export const SpineLocator: React.FC<VisualProps> = ({ module }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  // Assemble the whole spine, then let the highlight land.
  const assemble = seg(t, 0.08, 0.7);
  const highlight = appear(t, 0.55, 0.72);
  const titleIn = appear(t, 0.62, 0.78);

  const light = module?.light ?? 1;
  const close = module?.close ?? false;
  // Opening annotations come from each module's locate visual.spec.
  const OPEN_ANNOTATION: Record<number, string> = {
    1: 'this module',
    4: 'the objects controllers create',
    5: 'your own kinds',
  };
  const annotation = close
    ? 'next module'
    : (module ? OPEN_ANNOTATION[module.module.number] : 'this module') ?? 'this module';

  const laneColor = (lane: string) => (LANES[lane] ? LANES[lane].color : PALETTE.ink);
  let ordinal = 0;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', paddingTop: 44 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 34 }}>
        the spine — segment {light} of 14 · {spineName(light)}
      </Label>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', columnGap: 24, rowGap: 30, alignSelf: 'center' }}>
        {ROWS.map((row) => {
          const c = laneColor(row.lane);
          const rowStart = ordinal;
          ordinal += row.names.length;

          return (
            <React.Fragment key={row.lane}>
              <div style={{ textAlign: 'right', opacity: 0.9 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 800, color: c }}>
                    {LANES[row.lane]?.label ?? row.lane}
                  </span>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: PALETTE.muted, marginTop: 2 }}>{row.caption}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
                {row.names.map((name, i) => {
                  const idx = rowStart + i;
                  const on = assemble * 14 > idx + 1;
                  const isLit = idx + 1 === light;
                  return (
                    <React.Fragment key={name}>
                      {i > 0 && (
                        <span style={{ color: on ? c : PALETTE.line, fontSize: 18, fontWeight: 900, opacity: on ? 0.7 : 0.3 }}>
                          →
                        </span>
                      )}
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            fontFamily: MONO,
                            fontSize: isLit ? 18 : 15,
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            color: isLit ? PALETTE.ink : on ? PALETTE.ink : PALETTE.line,
                            background: isLit
                              ? `${c}33`
                              : on
                                ? `${c}1a`
                                : 'transparent',
                            border: `1px solid ${isLit ? c : on ? `${c}55` : '#16202f'}`,
                            borderBottom: `3px solid ${isLit ? c : '#16202f'}`,
                            borderRadius: 8,
                            padding: isLit ? '12px 18px 10px' : '9px 13px 7px',
                            opacity: isLit ? 1 : 0.28,
                            transform: isLit ? 'scale(1.12)' : 'none',
                            boxShadow: isLit ? `0 0 28px ${c}88` : 'none',
                            transition: 'none',
                            zIndex: 2,
                          }}
                        >
                          {name}
                        </div>
                        {isLit && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: '100%',
                              transform: 'translateX(-50%)',
                              marginTop: 8,
                              opacity: highlight,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span style={{ color: c, fontSize: 20, lineHeight: 1 }}>▲</span>
                            <Label color={c} size={12} style={{ fontWeight: 900 }}>{annotation}</Label>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* module title card */}
      <div style={{ textAlign: 'center', marginTop: 66, opacity: titleIn }}>
        <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 42, fontWeight: 900, letterSpacing: '-0.02em' }}>
          {module?.module.title ?? ''}
        </div>
        <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 16, fontWeight: 700, marginTop: 8 }}>
          module {module?.module.number ?? ''} · {spineName(light)}
          {close ? ' · next on the spine' : ' · this module'}
        </div>
      </div>
    </div>
  );
};
