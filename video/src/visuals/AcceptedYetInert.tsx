import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 15 beat 7 — accepted, and doing nothing. Four independent reasons a
 * stored NetworkPolicy has no effect, each drawn as its own break in the chain
 * from object to enforcement. All four leave the API looking identical. Core
 * NetworkPolicy has no enforcement status to reveal any of it.
 */

const REASONS = [
  { name: 'unsupported implementation', note: 'the network plugin never enforces NetworkPolicy at all', color: PALETTE.bad },
  { name: 'selector matches nothing', note: 'the podSelector selects no Pods — nothing to isolate', color: PALETTE.amber },
  { name: 'wrong direction covered', note: 'ingress and egress are separate — covering one leaves the other open', color: PALETTE.cyan },
  { name: 'no enforcement status', note: 'core NetworkPolicy reports nothing, so none of this is visible', color: PALETTE.violet },
];

export const AcceptedYetInert: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const chainIn = appear(t, 0.06, 0.14);
  const reasonOn = REASONS.map((_, i) => appear(t, 0.16 + i * 0.07, 0.23 + i * 0.07));
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
          <Label color={PALETTE.cyan} size={13}>a policy can be accepted and still have no effect — four independent breaks, all silent</Label>
        </div>

        {/* the chain: object -> enforcement */}
        <div style={{ position: 'absolute', left: 180, top: 60, display: 'flex', alignItems: 'center', gap: 24, opacity: chainIn }}>
          <div style={{ width: 400, borderRadius: 14, border: `2px solid ${PALETTE.blue}`, background: `${PALETTE.blue}08`, padding: '16px 18px', textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>NetworkPolicy</div>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 13, fontWeight: 800, marginTop: 6 }}>stored · accepted by the API</div>
          </div>
          <span style={{ color: PALETTE.line, fontSize: 30, fontWeight: 900 }}>→</span>
          <div style={{ width: 400, borderRadius: 14, border: `2px solid ${PALETTE.violet}`, background: `${PALETTE.violet}08`, padding: '16px 18px', textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>enforcement</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6 }}>the network implementation's job</div>
          </div>
        </div>

        {/* the four breaks */}
        <div style={{ position: 'absolute', left: 120, top: 250, width: 1420, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {REASONS.map((r, i) => {
            const on = reasonOn[i];
            return (
              <div
                key={r.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  borderRadius: 14,
                  border: `2px solid ${on > 0.5 ? r.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${r.color}08` : '#101826',
                  padding: '16px 18px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 20, fontWeight: 900, color: on > 0.5 ? r.color : PALETTE.line }}>✕{i + 1}</span>
                <div>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>{r.name}</div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 4, lineHeight: 1.4 }}>{r.note}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: reasonOn[3] }}>
          <Label color={PALETTE.amber} size={13}>all four leave the API looking identical — storage is not enforcement, and nothing reports it</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the implementation must support NetworkPolicy at all — check enforcement, not just acceptance</Label>
        </div>
      </div>
    </div>
  );
};
