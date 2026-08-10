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
 *
 * Extensions (each gated on the module number so earlier modules and the
 * pilot render identically):
 *  - module 9 close: the DNS segment collapses but the CSI segment lights,
 *    because course order, not spine adjacency, decides the next module.
 *  - module 10 close: no adjacent preview — the spine holds whole and the
 *    counter advances to eleven.
 *  - module 11 close: the whole spine brightens, previewing a final module
 *    about the spine as a diagnostic tool rather than any single segment.
 *  - module 11 locate: etcd drawn beneath the segment as the layer this
 *    module descends into.
 *  - module 12 locate: the first segment lit, the rest of the spine visible
 *    but dim — the finale returns to the entry point.
 *  - module 12 close: the whole spine lit end to end with all twelve module
 *    numbers marked against their segments. The last frame of the series.
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

/** Which spine ordinal each course module lives on. */
export const MODULE_SEGMENT: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 4, 6: 5, 7: 6, 8: 8, 9: 12, 10: 9, 11: 2, 12: 1,
};

/** Course modules that sit on each spine segment (1..14). */
const SEGMENT_MODULES: Record<number, number[]> = {
  1: [1, 12], 2: [2, 11], 3: [3], 4: [4, 5], 5: [6], 6: [7], 8: [8], 9: [10], 12: [9],
};

export const SpineLocator: React.FC<VisualProps> = ({ module }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  // Assemble the whole spine, then let the highlight land.
  const assemble = seg(t, 0.08, 0.7);
  const highlight = appear(t, 0.55, 0.72);
  const titleIn = appear(t, 0.62, 0.78);

  const num = module?.module.number ?? 0;
  const close = module?.close ?? false;
  const rawLight = module?.light ?? 1;

  // Module 9's close previews module ten (CSI, segment 9) — not the spine
  // segment adjacent to DNS. The rest of the closes follow spine adjacency.
  const light = (close && num === 9) ? 9 : rawLight;

  // Whole-spine closes: module 10 holds the spine and advances the counter;
  // module 11 brightens the whole spine; module 12 lights it end to end.
  const holdWhole = close && (num === 10 || num === 11 || num === 12);
  const finale = close && num === 12;
  const brightenAll = close && num === 11;

  // Module 11's locate draws etcd beneath the segment.
  const etcdBeneath = !close && num === 11;

  const OPEN_ANNOTATION: Record<number, string> = {
    1: 'this module',
    4: 'the objects controllers create',
    5: 'your own kinds',
    12: 'the finale — back to the start',
  };
  const annotation = close ? 'next module' : (module ? OPEN_ANNOTATION[num] : 'this module') ?? 'this module';

  const laneColor = (lane: string) => (LANES[lane] ? LANES[lane].color : PALETTE.ink);
  let ordinal = 0;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', paddingTop: 44 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 34 }}>
        {holdWhole
          ? close && num === 12
            ? 'the spine — the whole path, lit end to end · twelve modules · this is the last frame'
            : 'the spine — whole, held together'
          : `the spine — segment ${light} of 14 · ${spineName(light)}`}
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
                  const segi = idx + 1;
                  const on = assemble * 14 > segi;
                  const isLit = !holdWhole && segi === light;
                  const wholeLight = holdWhole && (assemble * 14 > segi);
                  const modulesHere = SEGMENT_MODULES[segi];
                  return (
                    <React.Fragment key={name}>
                      {i > 0 && (
                        <span style={{ color: (on || brightenAll) ? c : PALETTE.line, fontSize: 18, fontWeight: 900, opacity: (on || brightenAll) ? 0.7 : 0.3 }}>
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
                            color: (isLit || wholeLight) ? PALETTE.ink : on ? PALETTE.ink : PALETTE.line,
                            background: isLit
                              ? `${c}33`
                              : (wholeLight || brightenAll)
                                ? `${c}22`
                                : on
                                  ? `${c}1a`
                                  : 'transparent',
                            border: `1px solid ${isLit ? c : (wholeLight || brightenAll) ? `${c}66` : on ? `${c}55` : '#16202f'}`,
                            borderBottom: `3px solid ${isLit ? c : (wholeLight || brightenAll) ? c : '#16202f'}`,
                            borderRadius: 8,
                            padding: isLit ? '12px 18px 10px' : (etcdBeneath ? '9px 13px 6px' : '9px 13px 7px'),
                            opacity: isLit || wholeLight ? 1 : brightenAll ? 0.9 : 0.28,
                            transform: isLit ? 'scale(1.12)' : 'none',
                            boxShadow: isLit ? `0 0 28px ${c}88` : (brightenAll ? `0 0 18px ${c}33` : 'none'),
                            transition: 'none',
                            zIndex: 2,
                          }}
                        >
                          {name}
                        </div>

                        {/* module numbers on the finale close */}
                        {finale && modulesHere && modulesHere.length > 0 && wholeLight && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              top: '100%',
                              marginTop: 4,
                              display: 'flex',
                              gap: 4,
                              whiteSpace: 'nowrap',
                              zIndex: 3,
                            }}
                          >
                            {modulesHere.map((m) => (
                              <span
                                key={m}
                                style={{
                                  fontFamily: MONO,
                                  fontSize: 11,
                                  fontWeight: 900,
                                  color: PALETTE.ink,
                                  border: `1px solid ${c}66`,
                                  borderRadius: 999,
                                  background: `${c}22`,
                                  padding: '2px 8px',
                                }}
                              >
                                m{m}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* etcd beneath module 11's segment */}
                        {etcdBeneath && isLit && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              top: '100%',
                              marginTop: 10,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              whiteSpace: 'nowrap',
                              zIndex: 3,
                            }}
                          >
                            <span style={{ color: c, fontSize: 16, lineHeight: 1 }}>▼</span>
                            <span
                              style={{
                                fontFamily: MONO,
                                fontSize: 13.5,
                                fontWeight: 900,
                                color: PALETTE.amber,
                                border: `1px solid ${PALETTE.amber}66`,
                                borderRadius: 8,
                                background: `${PALETTE.amber}0c`,
                                padding: '6px 12px',
                                marginTop: 6,
                              }}
                            >
                              etcd — the layer this module descends into
                            </span>
                          </div>
                        )}

                        {isLit && !etcdBeneath && (
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
          {close && num === 10
            ? `module ${num} complete · the counter advances to eleven`
            : close && num === 11
              ? 'module 11 complete · the whole spine brightens for the final module'
              : close && num === 12
                ? 'module 12 — the spine as a diagnostic tool · the series ends here'
                : `module ${num ?? ''} · ${spineName(light)}${close ? ' · next on the spine' : ' · this module'}`}
        </div>
      </div>
    </div>
  );
};
