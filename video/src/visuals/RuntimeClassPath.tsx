import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 27 beat 5 — a selector, not an implementation. The path runs RuntimeClass
 * object → scheduler honouring its constraints → a node whose runtime has the
 * named handler configured. The last step is broken: the object is valid, but
 * the node lacks the handler, so the Pod cannot run. The object-versus-
 * implementation gap is the beat — a RuntimeClass never provides isolation by
 * itself.
 */

const STEPS = [
  { name: 'RuntimeClass object', detail: 'names a CRI runtime handler · may carry scheduling constraints + Pod overhead', color: PALETTE.blue, ok: true },
  { name: 'scheduler honours the constraints', detail: 'places the Pod where the RuntimeClass allows', color: PALETTE.violet, ok: true },
  { name: 'node runtime has the named handler', detail: 'containerd / CRI-O configured with that handler', color: PALETTE.good, ok: true, broken: true },
];

export const RuntimeClassPath: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const stepOn = STEPS.map((_, i) => appear(t, 0.08 + i * 0.12, 0.16 + i * 0.12));
  const breakLast = seg(t, 0.5, 0.62);
  const gap = appear(t, 0.66, 0.76);
  const footer = appear(t, 0.88, 0.94);

  const lastBroken = breakLast > 0.5;

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
      <div style={{ width: 1680, height: 740, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>RuntimeClass is a selector and a contract — the implementation lives on the node</Label>
        </div>

        {/* the path */}
        <div style={{ position: 'absolute', left: 100, top: 48, width: 1480, display: 'flex', alignItems: 'stretch', gap: 22 }}>
          {STEPS.map((s, i) => {
            const on = stepOn[i];
            const broken = (s as { broken?: boolean }).broken;
            const failedNow = broken && lastBroken;
            return (
              <React.Fragment key={s.name}>
                {i > 0 && (
                  <div style={{ alignSelf: 'center', fontSize: 26, fontWeight: 900, color: failedNow && i === 2 ? PALETTE.bad : PALETTE.line }}>
                    →
                  </div>
                )}
                <div
                  style={{
                    flex: 1,
                    borderRadius: 16,
                    border: `2px solid ${failedNow ? PALETTE.bad : s.color}${failedNow ? '' : '66'}`,
                    background: failedNow ? `${PALETTE.bad}0c` : `${s.color}06`,
                    padding: '16px 18px',
                    opacity: Math.max(0.3, on),
                    boxShadow: failedNow ? `0 0 26px ${PALETTE.bad}22` : 'none',
                    minHeight: 180,
                  }}
                >
                  <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: failedNow ? PALETTE.bad : s.color }}>{s.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 8, lineHeight: 1.4 }}>{s.detail}</div>
                  {failedNow && (
                    <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.bad, marginTop: 12, textDecoration: 'line-through', textDecorationThickness: 2 }}>
                      ✕ handler not configured here
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* the gap */}
        <div
          style={{
            position: 'absolute',
            left: 100,
            top: 330,
            width: 1480,
            borderRadius: 16,
            border: `2px solid ${PALETTE.amber}`,
            background: `${PALETTE.amber}0a`,
            padding: '16px 22px',
            textAlign: 'center',
            opacity: gap,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink }}>
            the object is valid · the node lacks the handler · <span style={{ color: PALETTE.bad }}>the Pod cannot run</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.amber, marginTop: 8, lineHeight: 1.4 }}>
            if the handler is not configured on eligible nodes, the RuntimeClass buys you nothing — the object-versus-implementation gap
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: appear(t, 0.72, 0.8) }}>
          <Label color={PALETTE.amber} size={13}>a RuntimeClass provides no isolation by itself — only a configured handler on the node does</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 686, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>validate the selector, then verify the handler is actually configured where the Pod lands</Label>
        </div>
      </div>
    </div>
  );
};
