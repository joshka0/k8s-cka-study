import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 25 beat 5 — a requirement, or a preference. Two panels running the
 * same failure (no local endpoint on the receiving node): under a strict
 * requirement traffic stops; under a preference it falls back to a remote
 * endpoint and continues. One is labelled Requirement, the other Hint, and the
 * outcome difference is unmistakable.
 */

export const StrictVsPreferred: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const strictIn = seg(t, 0.12, 0.28);
  const hintIn = seg(t, 0.52, 0.66);
  const footer = appear(t, 0.86, 0.93);

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
          <Label color={PALETTE.cyan} size={13}>locality comes in two strengths — confusing them wastes time</Label>
        </div>

        {/* strict panel */}
        <div style={{ position: 'absolute', left: 100, top: 48, width: 740, borderRadius: 18, border: `2px solid ${PALETTE.bad}66`, background: `${PALETTE.bad}06`, padding: '18px 22px', opacity: strictIn }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Label color={PALETTE.bad} size={12}>REQUIREMENT</Label>
            <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 900, color: PALETTE.bad, border: `1px solid ${PALETTE.bad}66`, borderRadius: 999, padding: '4px 12px' }}>
              strict internal traffic policy
            </span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.5 }}>
            requires a node-local endpoint — no local endpoint, no traffic
          </div>
          <div style={{ marginTop: 16, borderRadius: 12, background: '#0c111c', border: `1px solid ${PALETTE.bad}66`, padding: '14px 16px', textAlign: 'center', boxShadow: strictIn > 0.5 ? `0 0 20px ${PALETTE.bad}1a` : 'none' }}>
            <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 900, color: PALETTE.bad }}>⛔ traffic stops</div>
            <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted, marginTop: 6 }}>
              this can be the reason nothing is being served
            </div>
          </div>
        </div>

        {/* preference panel */}
        <div style={{ position: 'absolute', left: 880, top: 48, width: 700, borderRadius: 18, border: `2px solid ${PALETTE.good}66`, background: `${PALETTE.good}06`, padding: '18px 22px', opacity: hintIn }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Label color={PALETTE.good} size={12}>HINT</Label>
            <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 900, color: PALETTE.good, border: `1px solid ${PALETTE.good}66`, borderRadius: 999, padding: '4px 12px' }}>
              topology-aware routing · traffic distribution
            </span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.5 }}>
            expresses a preference — it will fall back when there is no local endpoint
          </div>
          <div style={{ marginTop: 16, borderRadius: 12, background: '#0c111c', border: `1px solid ${PALETTE.good}66`, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 900, color: PALETTE.good }}>↻ falls back to a remote endpoint</div>
            <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted, marginTop: 6 }}>
              traffic continues — just possibly from farther away
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', opacity: appear(t, 0.68, 0.76) }}>
          <Label color={PALETTE.amber} size={13}>during failure analysis treat a requirement and a hint completely differently — only one can be the reason nothing is served</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 486, width: 1560, textAlign: 'center', opacity: appear(t, 0.72, 0.8) }}>
          <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: PALETTE.ink }}>
            same failure, two policies, two outcomes — <span style={{ color: PALETTE.bad }}>one stops</span> · <span style={{ color: PALETTE.good }}>the other continues</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a requirement and a hint are not the same strength of promise — do not diagnose them the same way</Label>
        </div>
      </div>
    </div>
  );
};
