import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 17 beat 2 — policy, and intent. DeviceClass is categorisation and
 * policy; a ResourceClaim is workload intent plus allocation state. One is a
 * category, the other is a request with an answer written back into it. Show
 * the allocation being written back into the claim so it reads as
 * request-plus-answer.
 */

export const ClassVsClaim: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const clsIn = appear(t, 0.08, 0.16);
  const claimIn = appear(t, 0.16, 0.24);
  const writeback = seg(t, 0.44, 0.6);
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
      <div style={{ width: 1660, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>DeviceClass is a category and policy; a ResourceClaim is a request with an answer written back</Label>
        </div>

        {/* DeviceClass */}
        <div style={{ position: 'absolute', left: 150, top: 90, width: 620, borderRadius: 20, border: `2px solid ${PALETTE.blue}`, background: `${PALETTE.blue}06`, padding: '20px 24px', opacity: clsIn }}>
          <Label color={PALETTE.blueInk} size={12} style={{ marginBottom: 10 }}>DeviceClass — category + policy</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>what a kind of device is</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 10, lineHeight: 1.4 }}>
            · how it may be selected<br />· the policy governing the class
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 800, marginTop: 14, lineHeight: 1.4 }}>
            one class, many requests — reused, not consumed
          </div>
        </div>

        <div style={{ position: 'absolute', left: 800, top: 210, color: PALETTE.line, fontSize: 40, fontWeight: 900, opacity: claimIn }}>→</div>

        {/* ResourceClaim */}
        <div style={{ position: 'absolute', left: 880, top: 90, width: 640, borderRadius: 20, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}06`, padding: '20px 24px', opacity: claimIn }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 10 }}>ResourceClaim — intent + allocation state</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>what this workload needs</div>
          <div style={{ marginTop: 14, borderRadius: 10, border: `1px solid ${PALETTE.good}55`, background: '#0d1522', padding: '12px 16px' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700 }}>spec — the request (intent)</div>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, marginTop: 4 }}>deviceClass: fast · count: 1</div>
          </div>
          <div style={{ marginTop: 10, borderRadius: 10, border: `2px solid ${writeback > 0.5 ? PALETTE.amber : PALETTE.line}`, background: writeback > 0.5 ? `${PALETTE.amber}0a` : '#0d1522', padding: '12px 16px', opacity: Math.max(0.4, writeback) }}>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700 }}>status — the answer, written back</div>
            <div style={{ fontFamily: MONO, color: writeback > 0.5 ? PALETTE.amber : PALETTE.muted, fontSize: 15, fontWeight: 900, marginTop: 4, opacity: writeback }}>
              allocation: device node-1/accel-3 ✓
            </div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 800, marginTop: 12, opacity: writeback }}>
            the allocation is written back into the claim — request-plus-answer
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: writeback }}>
          <Label color={PALETTE.amber} size={13}>one is a category you reuse — the other is a request that becomes a record of what you got</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>they get confused immediately — but a class is policy, and a claim is intent plus its result</Label>
        </div>
      </div>
    </div>
  );
};
