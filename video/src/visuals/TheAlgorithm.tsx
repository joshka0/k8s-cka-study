import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { LANES, PALETTE } from '../theme';
import { Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 20 beat 8 — the algorithm underneath. Five numbered steps as the
 * closing frame of the whole course, each legible as a still. Under step two
 * the spine is drawn small as the lookup that answers "who owns this
 * transition". This is the frame the series has been building toward — it gets
 * room and it holds.
 */

const STEPS = [
  { n: '1', text: 'state the transition you expected and what you actually observe' },
  { n: '2', text: 'identify which component owns that transition' },
  { n: '3', text: 'read status, events and logs at that boundary — and nowhere else' },
  { n: '4', text: 'compare against one adjacent layer that is healthy' },
  { n: '5', text: 'change one thing, and verify it' },
];

const SPINE_ROWS: { lane: string; names: string[] }[] = [
  { lane: 'control', names: ['desired object', 'admission', 'watch + cache', 'controller queue', 'scheduler'] },
  { lane: 'node', names: ['kubelet', 'CRI', 'CNI', 'CSI'] },
  { lane: 'pod', names: ['EndpointSlice', 'service', 'DNS', 'data plane', 'application'] },
];

export const TheAlgorithm: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const stepOn = STEPS.map((_, i) => appear(t, 0.06 + i * 0.06, 0.14 + i * 0.06));
  const spineIn = appear(t, 0.4, 0.55);
  const closingIn = appear(t, 0.78, 0.9);

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
      <div style={{ width: 1680, height: 720, position: 'relative' }}>
        <Label color={PALETTE.cyan} size={13} style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center' }}>
          underneath all of it is one algorithm — and it is short
        </Label>

        {/* the five steps */}
        <div style={{ position: 'absolute', left: 100, top: 44, width: 860, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {STEPS.map((s, i) => {
            const on = stepOn[i];
            return (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 14, borderRadius: 12, border: `2px solid ${on > 0.5 ? PALETTE.ink : PALETTE.line}55`, background: on > 0.5 ? PALETTE.panel : '#0d1522', padding: '10px 16px', opacity: Math.max(0.35, on) }}>
                <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 18, fontWeight: 900, color: PALETTE.amber, border: `1px solid ${PALETTE.amber}`, borderRadius: 999, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.n}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 16.5, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.3 }}>{s.text}</span>
              </div>
            );
          })}
        </div>

        {/* the spine lookup under step two */}
          {/* Both columns are anchored from the same edge so they cannot
              collide. Mixing left+width on one with right+width on the other
              overlapped them by 40px, cutting the panel across steps 2-4. */}
        <div style={{ position: 'absolute', left: 1000, top: 90, width: 600, borderRadius: 18, border: `2px solid ${PALETTE.good}55`, background: `${PALETTE.good}04`, padding: '18px 20px', opacity: spineIn }}>
          <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 12 }}>
            step 2, resolved — the spine is the lookup: who owns this transition
          </Label>
          {SPINE_ROWS.map((row) => {
            const c = LANES[row.lane]?.color ?? PALETTE.ink;
            return (
              <div key={row.lane} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ flex: '0 0 66px', fontFamily: MONO, fontSize: 11.5, fontWeight: 900, color: c }}>{row.lane}</span>
                <div style={{ flex: 1, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {row.names.map((nm) => (
                    <span key={nm} style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 800, color: PALETTE.ink, border: `1px solid ${c}55`, borderRadius: 6, padding: '4px 7px', background: `${c}0d` }}>
                      {nm}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 800, color: PALETTE.good, marginTop: 4 }}>
            every transition in every unit of this course lands on one of these segments
          </div>
        </div>

        {/* closing line */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 462, textAlign: 'center', opacity: closingIn }}>
          <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 34, fontWeight: 900, letterSpacing: '-0.02em' }}>
            name the transition, name the owner — you already have your next question
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 15, fontWeight: 700, marginTop: 8 }}>
            everything in every unit of this course is a faster way of answering step two
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', opacity: closingIn }}>
          <Label color={PALETTE.amber} size={14}>INTENT TO PACKET — one method, every unit</Label>
        </div>
      </div>
    </div>
  );
};
