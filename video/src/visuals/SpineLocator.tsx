import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { LANES, PALETTE } from '../theme';
import { Label, MONO, SANS } from '../ui';
import { appear, seg } from '../motion';
import type { VisualProps } from '../module';
import { spineName } from '../module';

/**
 * The request path as three lanes of named segments, with exactly one segment
 * lit: the one this module is about, taken from the module's own script.
 *
 * On the opening beat the module's segment magnifies and the rest dim. On the
 * closing beat the whole path is held, with nothing previewed.
 *
 * This component knows nothing about any other module. It used to: registries
 * mapped each module number to a segment, listed which modules sat on each
 * segment, named which segment the *next* module would light, and carried
 * per-module opening captions and finale treatments. A new module meant
 * editing all of them, and several still described a twelve-module course.
 * Anything module-specific now comes from that module's own `series` block.
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

  const num = module?.module.number ?? 0;
  const close = module?.close ?? false;
  const rawLight = module?.light ?? 1;

  // A module lights its own segment and nothing else.
  //
  // This block used to hold four registries keyed on module number:
  // ADV_NEXT_LIGHT (which segment the *next* module sits on), holdWhole,
  // finale and brightenAll (per-module close treatments), OPEN_ANNOTATION
  // (per-module opening captions), plus SEGMENT_MODULES and a second
  // SEGMENT_MODULES_27 listing which modules live on each segment. Adding a
  // module meant editing every one of them, and three still described a
  // twelve-module course. None of it survives: the open lights this module's
  // own segment, and the close holds the whole spine without previewing
  // anything. Per-module emphasis belongs in the module's own script.
  const light = rawLight;
  const holdWhole = close;

  // Drawn beneath the segment when the module descends into the layer under
  // it. Declared by the module, not inferred from its number.
  const etcdBeneath = !close && (module?.module.beneath === 'etcd');

  const annotation = close ? 'the whole path' : 'this module';

  const laneColor = (lane: string) => (LANES[lane] ? LANES[lane].color : PALETTE.ink);
  let ordinal = 0;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', paddingTop: 44 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 34 }}>
        {holdWhole
          ? 'the spine — the request path, whole'
          : `the spine — ${spineName(light)}`}
      </Label>

      {/* The lit segment hangs a marker and a label below itself, about 48px
        * of it. At rowGap 30 that printed across the next lane's row and hid
        * a segment name. The gap has to clear the annotation, not just the
        * boxes. */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', columnGap: 24, rowGap: 68, alignSelf: 'center' }}>
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
                            color: (isLit || wholeLight) ? PALETTE.ink : on ? PALETTE.ink : PALETTE.line,
                            background: isLit
                              ? `${c}33`
                              : wholeLight
                                ? `${c}22`
                                : on
                                  ? `${c}1a`
                                  : 'transparent',
                            border: `1px solid ${isLit ? c : wholeLight ? `${c}66` : on ? `${c}55` : '#16202f'}`,
                            borderBottom: `3px solid ${isLit ? c : wholeLight ? c : '#16202f'}`,
                            borderRadius: 8,
                            padding: isLit ? '12px 18px 10px' : (etcdBeneath ? '9px 13px 6px' : '9px 13px 7px'),
                            opacity: isLit || wholeLight ? 1 : 0.28,
                            transform: isLit ? 'scale(1.12)' : 'none',
                            boxShadow: isLit ? `0 0 28px ${c}88` : 'none',
                            transition: 'none',
                            zIndex: 2,
                          }}
                        >
                          {name}
                        </div>

                        {/* the layer this module descends into, when it declares one */}
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

                        {/* module 15 locate: an external north-south arrow at the edge */}
                        {!close && num === 15 && isLit && segi === 11 && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              bottom: '100%',
                              marginBottom: 8,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              whiteSpace: 'nowrap',
                              zIndex: 3,
                            }}
                          >
                            <Label color={PALETTE.cyan} size={11} style={{ fontWeight: 900 }}>⬇ north-south · the edge</Label>
                          </div>
                        )}

                        {/* module 16 locate: the scheduler segment already passed */}
                        {!close && num === 16 && segi === 5 && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              top: '100%',
                              marginTop: 6,
                              whiteSpace: 'nowrap',
                              zIndex: 3,
                              opacity: 0.9,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: MONO,
                                fontSize: 11.5,
                                fontWeight: 900,
                                color: PALETTE.muted,
                                border: `1px solid ${PALETTE.line}`,
                                borderRadius: 999,
                                background: '#0d1522',
                                padding: '4px 10px',
                              }}
                            >
                              scheduler — already decided, already passed
                            </span>
                          </div>
                        )}

                        {/* module 17 locate: a device symbol on the scheduler segment */}
                        {!close && num === 17 && isLit && segi === 5 && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              top: '100%',
                              marginTop: 6,
                              whiteSpace: 'nowrap',
                              zIndex: 3,
                              display: 'flex',
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: MONO,
                                fontSize: 11.5,
                                fontWeight: 900,
                                color: PALETTE.amber,
                                border: `1px solid ${PALETTE.amber}66`,
                                borderRadius: 999,
                                background: '#0d1522',
                                padding: '4px 10px',
                              }}
                            >
                              ◈ the device on the Pod
                            </span>
                          </div>
                        )}

                        {/* module 18 locate: a second, external API server beside the first segment */}
                        {!close && num === 18 && isLit && segi === 1 && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '100%',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              marginLeft: 10,
                              whiteSpace: 'nowrap',
                              zIndex: 3,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: MONO,
                                fontSize: 11.5,
                                fontWeight: 900,
                                color: PALETTE.blue,
                                border: `1px solid ${PALETTE.blue}66`,
                                borderRadius: 8,
                                background: '#0d1522',
                                padding: '5px 10px',
                              }}
                            >
                              + an external API server beside it
                            </span>
                          </div>
                        )}

                        {/* module 23 locate: packaging tools feed in outside the first segment */}
                        {!close && num === 23 && isLit && segi === 1 && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '100%',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              marginLeft: 10,
                              whiteSpace: 'nowrap',
                              zIndex: 3,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: MONO,
                                fontSize: 11.5,
                                fontWeight: 900,
                                color: PALETTE.good,
                                border: `1px solid ${PALETTE.good}66`,
                                borderRadius: 8,
                                background: '#0d1522',
                                padding: '5px 10px',
                              }}
                            >
                              ⇠ packaging tools feed in — Kustomize · Helm
                            </span>
                          </div>
                        )}

                        {/* module 27 locate: the kubelet faintly marked, where enforcement happens */}
                        {!close && num === 27 && segi === 6 && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              top: '100%',
                              marginTop: 8,
                              whiteSpace: 'nowrap',
                              zIndex: 3,
                              opacity: 0.9,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: MONO,
                                fontSize: 11.5,
                                fontWeight: 900,
                                color: PALETTE.muted,
                                border: `1px solid ${PALETTE.line}`,
                                borderRadius: 999,
                                background: '#0d1522',
                                padding: '4px 10px',
                              }}
                            >
                              enforcement happens here — the kubelet, the runtime, the kernel
                            </span>
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
                : close && num === 13
                  ? 'module 13 complete · the bootstrap layer — the spine returns to normal weight'
                  : close && num === 14
                    ? 'module 14 complete · the kubelet again — next, traffic in'
                    : close && num === 15
                      ? 'module 15 complete · the edge — next, back to the node'
                      : close && num === 16
                        ? 'module 16 complete · the hardware — next, how devices are asked for'
                        : close && num === 17
                          ? 'module 17 complete · devices — next, the API machinery'
                          : close && num === 18
                            ? 'module 18 complete · the API layer — next, deliberate delay'
                            : close && num === 19
                              ? 'module 19 complete · deliberate delay — the whole spine brightens for the final module'
                              : close && num === 20
                                ? 'module 20 — the advanced arc closes here'
                                : close && num === 21
                                  ? 'module 21 complete · identity & escalation — the spine returns to normal weight'
                                  : close && num === 22
                                    ? 'module 22 complete · the metrics pipeline — next, delivery'
                                    : close && num === 23
                                      ? 'module 23 complete · delivery — the spine returns to normal weight'
                                      : close && num === 24
                                        ? 'module 24 complete · namespace governance — next, exposure'
                                        : close && num === 25
                                          ? 'module 25 complete · exposure — the spine returns to normal weight'
                                          : close && num === 26
                                            ? 'module 26 complete · restarts — the spine holds for the final module'
                                            : close && num === 27
                                              ? 'module 27 — twenty-seven units, one habit · the course ends here'
                                              : `module ${num ?? ''} · ${spineName(light)}${close ? ' · next on the spine' : ' · this module'}`}
        </div>
      </div>
    </div>
  );
};
