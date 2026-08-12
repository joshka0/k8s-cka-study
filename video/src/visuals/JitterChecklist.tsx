import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 16 beat 8 — a Guaranteed Pod that still jitters. An ordered inspection
 * list, each item with the specific artefact you read to check it, laid out as
 * a diagnostic card. Guaranteed is shown at the top as already true, so the
 * list reads as what remains after the obvious answer is exhausted.
 */

const ITEMS = [
  { name: 'CPU Manager policy + cpuset', read: 'the policy and the cpuset the Pod actually got', color: PALETTE.blue },
  { name: 'CFS throttling', read: 'container throttling metrics', color: PALETTE.cyan },
  { name: 'Topology Manager scope + policy', read: 'its scope and enforced policy', color: PALETTE.violet },
  { name: 'did admission compromise?', read: 'whether placement had to relax the alignment', color: PALETTE.amber },
  { name: 'NUMA locality of memory + devices', read: 'where memory and devices actually sit', color: PALETTE.good },
  { name: 'the machine share', read: 'reserved CPUs · IRQ placement · system daemons', color: PALETTE.bad },
];

export const JitterChecklist: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const guaranteedIn = appear(t, 0.06, 0.14);
  const itemOn = ITEMS.map((_, i) => appear(t, 0.14 + i * 0.07, 0.2 + i * 0.07));
  const footer = appear(t, 0.9, 0.97);

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
      <div style={{ width: 1640, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>a Guaranteed Pod that still jitters — a diagnostic card, in order</Label>
        </div>

        {/* guaranteed already true */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 54,
            width: 1400,
            borderRadius: 14,
            border: `2px solid ${PALETTE.good}`,
            background: `${PALETTE.good}08`,
            padding: '12px 20px',
            textAlign: 'center',
            opacity: guaranteedIn,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.ink }}>
            ✓ <span style={{ color: PALETTE.good }}>Guaranteed</span> — already true. The list below is what the obvious answer does not explain
          </span>
        </div>

        <div style={{ position: 'absolute', left: 120, top: 130, width: 1400, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ITEMS.map((it, i) => {
            const on = itemOn[i];
            return (
              <div
                key={it.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  borderRadius: 12,
                  border: `2px solid ${on > 0.5 ? it.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${it.color}06` : '#101826',
                  padding: '11px 18px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: it.color, width: 30, flex: '0 0 30px' }}>{i + 1}</span>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900, width: 480, flex: '0 0 480px' }}>
                  {it.name}
                </div>
                <div style={{ flex: 1, fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, lineHeight: 1.35 }}>
                  read — {it.read}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>each item names the artefact that decides it — the class alone never explains the jitter</Label>
        </div>
      </div>
    </div>
  );
};
