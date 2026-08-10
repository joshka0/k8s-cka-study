import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 08 beat 9 — the kubelet does not call it. The real call chain as a
 * sequence: kubelet → CRI → runtime → creates the netns → reads CNI config →
 * execs the plugin chain. The imagined shortcut from the kubelet straight to
 * the plugin is struck through. Each hop is tagged with the log you would
 * read if it failed there; the runtime's log is the prominent one.
 */

const HOPS = [
  { name: 'kubelet', sub: 'asks via CRI — since 1.24', log: 'pod events · kubelet logs' },
  { name: 'CRI runtime', sub: 'runtime service, gRPC', log: 'kubelet log → CRI call' },
  { name: 'creates netns', sub: 'the sandbox namespace', log: 'runtime logs', hot: true },
  { name: 'reads CNI config', sub: 'from disk — not required to be', log: 'runtime logs', hot: true },
  { name: 'execs plugin chain', sub: 'ADD / DEL per config', log: 'runtime logs ← the one people skip', hot: true },
];

const CHIP_W = 280;
const GAP = 26;
const ROW_W = HOPS.length * CHIP_W + (HOPS.length - 1) * GAP;

export const WhoExecs: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const on = HOPS.map((_, i) => appear(t, 0.06 + i * 0.07, 0.13 + i * 0.07));
  const shortcut = seg(t, 0.5, 0.62);
  const hotNote = appear(t, 0.64, 0.72);
  const footer = appear(t, 0.82, 0.9);

  const shortcutX = CHIP_W / 2 + 20;
  const endX = ROW_W - CHIP_W / 2 - 20;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: ROW_W, height: 620, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>the kubelet does not exec the plugin — it asks the CRI runtime, and the runtime runs the chain</Label>
        </div>

        {/* the real chain */}
        <div style={{ position: 'absolute', left: 0, top: 120, width: ROW_W, display: 'flex', alignItems: 'stretch', gap: GAP }}>
          {HOPS.map((h, i) => {
            const lit = on[i];
            return (
              <React.Fragment key={h.name}>
                {i > 0 && (
                  <span style={{ alignSelf: 'center', color: lit > 0.5 ? PALETTE.line : PALETTE.line, fontSize: 26, fontWeight: 900, opacity: Math.max(0.3, lit), width: GAP, textAlign: 'center' }}>
                    →
                  </span>
                )}
                <div style={{ width: CHIP_W }}>
                  <div
                    style={{
                      height: 96,
                      borderRadius: 14,
                      border: `2px solid ${lit > 0.5 ? PALETTE.blue : PALETTE.line}`,
                      background: lit > 0.5 ? `${PALETTE.blue}14` : PALETTE.panel,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px 12px',
                      textAlign: 'center',
                      opacity: Math.max(0.28, lit),
                    }}
                  >
                    <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, lineHeight: 1.25 }}>{h.name}</div>
                    <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginTop: 6, lineHeight: 1.3 }}>{h.sub}</div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* log tags under each hop */}
        <div style={{ position: 'absolute', left: 0, top: 236, width: ROW_W, display: 'flex', gap: GAP }}>
          {HOPS.map((h, i) => (
            <div key={h.name} style={{ width: CHIP_W, textAlign: 'center', opacity: on[i] }}>
              <Label color={PALETTE.muted} size={10} style={{ marginBottom: 4 }}>if it fails there</Label>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: h.hot ? 14.5 : 13,
                  fontWeight: 800,
                  color: h.hot ? PALETTE.amber : PALETTE.cyan,
                  border: `1px solid ${h.hot ? PALETTE.amber : PALETTE.line}`,
                  borderRadius: 10,
                  background: h.hot ? `${PALETTE.amber}10` : '#0c111c',
                  padding: '9px 10px',
                  lineHeight: 1.3,
                  minHeight: 58,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {h.log}
              </div>
            </div>
          ))}
        </div>

        {/* the runtime log is the one people skip */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', opacity: hotNote }}>
          <Label color={PALETTE.amber} size={12.5}>the runtime's logs hold the plugin detail — that is the log people skip</Label>
        </div>

        {/* the imagined shortcut — struck through */}
        <div style={{ position: 'absolute', left: 0, top: 400, width: ROW_W, height: 70, opacity: shortcut }}>
          <svg width={ROW_W} height={70} style={{ position: 'absolute', left: 0, top: 0 }}>
            <line x1={shortcutX} y1={54} x2={endX} y2={10} stroke={PALETTE.bad} strokeWidth={3} strokeDasharray="8 6" />
          </svg>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 24,
              transform: 'translateX(-50%)',
              border: `2px solid ${PALETTE.bad}`,
              borderRadius: 12,
              background: `${PALETTE.bad}10`,
              padding: '8px 16px',
              fontFamily: MONO,
              color: PALETTE.bad,
              fontSize: 15,
              fontWeight: 900,
              whiteSpace: 'nowrap',
              textDecoration: 'line-through',
              textDecorationThickness: 3,
            }}
          >
            kubelet execs the plugin directly
          </div>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: -12,
              transform: 'translateX(-50%)',
              fontFamily: MONO,
              color: PALETTE.bad,
              fontSize: 40,
              fontWeight: 900,
            }}
          >
            ✕
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 540, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>start with Pod events and kubelet logs — go to the runtime's logs for plugin detail: the runtime is the one that runs the chain</Label>
        </div>
      </div>
    </div>
  );
};
