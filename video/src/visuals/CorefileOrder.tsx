import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 09 beat 7 — Corefile order is not execution order. Two columns that
 * must not be confused: the Corefile as written (editable, reorderable) and
 * the compiled chain from plugin.cfg (fixed). Dragging a line up in the
 * Corefile column leaves the compiled chain untouched; the only thing that
 * changes the chain is a rebuilt binary. The independence of the two columns
 * is the beat.
 */

export const CorefileOrder: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const leftIn = appear(t, 0.08, 0.18);
  const rightIn = appear(t, 0.16, 0.26);
  const notEqual = appear(t, 0.24, 0.3);
  const drag = seg(t, 0.32, 0.48);
  const chainUnchanged = seg(t, 0.44, 0.56);
  const rebuild = seg(t, 0.58, 0.72);
  const footer = appear(t, 0.84, 0.92);

  // The dragged "cache" line moves up inside its column (translate), and a
  // ghost stays at the old slot so the file reads as reordered.
  const lift = seg(t, 0.34, 0.52);

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
      <div style={{ width: 1620, height: 680, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>the Corefile selects and configures plugins — it does not define the order they execute in</Label>
        </div>

        {/* LEFT — the Corefile, editable */}
        <div style={{ position: 'absolute', left: 60, top: 70, width: 700, opacity: leftIn }}>
          <Label color={PALETTE.blue} size={12} style={{ marginBottom: 10 }}>the Corefile — what you write and edit</Label>
          <div style={{ background: '#0a1019', border: `2px solid ${PALETTE.blue}`, borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ marginLeft: 10, color: PALETTE.muted, fontSize: 13 }}>Corefile</span>
            </div>

            {/* editable lines, one dragged */}
            <div style={{ position: 'relative' }}>
              {/* the dragged cache line — moves up over kubernetes */}
              <div
                style={{
                  position: 'relative',
                  fontFamily: MONO,
                  fontSize: 19,
                  fontWeight: 900,
                  color: PALETTE.ink,
                  border: `2px solid ${PALETTE.amber}`,
                  borderRadius: 10,
                  background: `${PALETTE.amber}12`,
                  padding: '13px 16px',
                  marginBottom: 10,
                  zIndex: 3,
                  transform: `translateY(${-lift * 62}px)`,
                  boxShadow: lift > 0.05 ? `0 0 22px ${PALETTE.amber}55` : 'none',
                }}
              >
                <span style={{ color: PALETTE.amber }}>⇅</span> cache
              </div>
              {/* ghost slot it left */}
              {lift > 0.05 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    height: 44,
                    borderRadius: 10,
                    border: `1px dashed ${PALETTE.amber}66`,
                    opacity: 0.6 - lift * 0.4,
                  }}
                />
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, fontFamily: MONO, fontSize: 19, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '13px 16px' }}>
                  kubernetes
                </div>
                <div style={{ flex: 1, fontFamily: MONO, fontSize: 19, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '13px 16px' }}>
                  forward
                </div>
              </div>
            </div>

            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.muted, marginTop: 14, opacity: drag }}>
              {drag > 0.5 ? 'reordered here — nothing about sequence changes' : 'grab a line, move it anywhere…'}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: PALETTE.muted, marginTop: 6 }}>
              server blocks · zones · plugin config — all editable
            </div>
          </div>
        </div>

        {/* the ≠ separator */}
        <div style={{ position: 'absolute', left: 780, top: 200, opacity: notEqual }}>
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 64, fontWeight: 900 }}>≠</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, textAlign: 'center', marginTop: 10, maxWidth: 130 }}>
            same names, different orders — not the same thing
          </div>
        </div>

        {/* RIGHT — the compiled chain, fixed */}
        <div style={{ position: 'absolute', right: 60, top: 70, width: 700, opacity: rightIn }}>
          <Label color={PALETTE.violet} size={12} style={{ marginBottom: 10 }}>the compiled chain — from plugin.cfg, fixed</Label>
          <div style={{ background: '#0a1019', border: `2px solid ${PALETTE.violet}`, borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ marginLeft: 10, color: PALETTE.muted, fontSize: 13 }}>plugin.cfg — compiled into the binary</span>
            </div>

            <div style={{ position: 'relative' }}>
              {['kubernetes', 'errors', 'cache', 'forward'].map((p, i) => (
                <div
                  key={p}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontFamily: MONO,
                    fontSize: 18,
                    fontWeight: 900,
                    color: PALETTE.ink,
                    border: `1px solid ${PALETTE.line}`,
                    borderRadius: 10,
                    background: '#0d1522',
                    padding: '12px 16px',
                    marginBottom: 10,
                    opacity: chainUnchanged > 0.5 ? 0.55 : 1,
                  }}
                >
                  <span style={{ color: PALETTE.violet }}>🔒</span>
                  {p}
                  {i < 3 && <span style={{ color: PALETTE.line, marginLeft: 'auto' }}>↓</span>}
                </div>
              ))}
            </div>

            <div
              style={{
                fontFamily: MONO,
                fontSize: 14.5,
                fontWeight: 900,
                color: chainUnchanged > 0.5 ? PALETTE.good : PALETTE.muted,
                border: `1px solid ${chainUnchanged > 0.5 ? PALETTE.good : PALETTE.line}66`,
                borderRadius: 10,
                background: chainUnchanged > 0.5 ? `${PALETTE.good}0c` : '#0c111c',
                padding: '11px 14px',
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              {chainUnchanged > 0.5 ? 'did not move — the chain is compiled, not read from the Corefile' : 'locked — built into the binary'}
            </div>
          </div>
        </div>

        {/* the only thing that changes it */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 560,
            textAlign: 'center',
            opacity: rebuild,
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 800, border: `1px solid ${PALETTE.amber}66`, borderRadius: 999, background: `${PALETTE.amber}0c`, padding: '12px 24px' }}>
            genuinely reordering the chain means <span style={{ color: PALETTE.amber, fontWeight: 900 }}>rebuilding CoreDNS</span> — the only thing that changes it
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the single most misunderstood thing about CoreDNS — moving a line in the file changes configuration, not sequence</Label>
        </div>
      </div>
    </div>
  );
};
