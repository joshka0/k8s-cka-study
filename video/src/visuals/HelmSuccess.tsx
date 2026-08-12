import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 23 beat 2 — what a green release proves. A green release record
 * beside unhealthy Pods, with an explicit list of what the green state covers
 * and what it does not. Both are true on screen at once — they measure
 * different things, so nothing is contradictory.
 */

const COVERS = [
  'objects were rendered and accepted (no wait flags)',
  'release metadata tracked — last applied chart',
  'with wait: a one-shot readiness check at install time',
];

const NOT_COVER = [
  'continuous reconciliation',
  'what the objects are doing right now',
  'current status, readiness, or events',
];

export const HelmSuccess: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const greenIn = appear(t, 0.06, 0.14);
  const podsIn = appear(t, 0.28, 0.36);
  const listsIn = appear(t, 0.44, 0.54);
  const footer = appear(t, 0.84, 0.92);

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
          <Label color={PALETTE.cyan} size={13}>a green release and unhealthy Pods are not contradictory — they measure different things</Label>
        </div>

        {/* the green release record */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 56,
            width: 560,
            borderRadius: 18,
            border: `2px solid ${PALETTE.good}`,
            background: `${PALETTE.good}0a`,
            boxShadow: `0 0 26px ${PALETTE.good}1c`,
            padding: 20,
            textAlign: 'center',
            opacity: greenIn,
          }}
        >
          <Label color={PALETTE.good} size={11}>Helm release record</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900, marginTop: 10 }}>my-app · v1.4.0</div>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 20, fontWeight: 900, marginTop: 10, border: `1px solid ${PALETTE.good}66`, borderRadius: 999, display: 'inline-block', padding: '6px 18px' }}>
            STATUS: deployed ✓
          </div>
        </div>

        {/* unhealthy pods */}
        <div
          style={{
            position: 'absolute',
            left: 760,
            top: 56,
            width: 800,
            borderRadius: 18,
            border: `2px solid ${PALETTE.bad}66`,
            background: `${PALETTE.bad}06`,
            padding: 18,
            opacity: podsIn,
          }}
        >
          <Label color={PALETTE.bad} size={11} style={{ marginBottom: 12 }}>the workload, right now</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {(['CrashLoopBackOff', 'Not ready', 'ImagePullBackOff'] as const).map((s) => (
              <div key={s} style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 900, color: PALETTE.amber, border: `1px solid ${PALETTE.bad}44`, borderRadius: 10, background: '#0d1522', padding: '10px 8px', textAlign: 'center' }}>
                {s}
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 10, textAlign: 'center' }}>
            the object status and events own what the workload is doing now
          </div>
        </div>

        {/* what green covers / does not */}
        <div style={{ position: 'absolute', left: 120, top: 320, width: 1440, display: 'flex', gap: 24, opacity: listsIn }}>
          <div style={{ flex: 1, borderRadius: 16, border: `2px solid ${PALETTE.good}55`, background: `${PALETTE.good}06`, padding: '18px 20px' }}>
            <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 12 }}>what “green” actually covers</Label>
            {COVERS.map((c) => (
              <div key={c} style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink, marginBottom: 10, lineHeight: 1.4 }}>
                <span style={{ color: PALETTE.good, fontWeight: 900, marginRight: 8 }}>✓</span>{c}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, borderRadius: 16, border: `2px solid ${PALETTE.bad}55`, background: `${PALETTE.bad}06`, padding: '18px 20px' }}>
            <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 12 }}>what it does not cover</Label>
            {NOT_COVER.map((c) => (
              <div key={c} style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink, marginBottom: 10, lineHeight: 1.4 }}>
                <span style={{ color: PALETTE.bad, fontWeight: 900, marginRight: 8 }}>✕</span>{c}
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 120, top: 636, fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.amber, opacity: appear(t, 0.62, 0.7) }}>
          so when Helm says “successful” and the Pods are unhealthy — the release worked, and the deployment didn’t
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a green release is a fact about shipped objects — never a fact about a healthy workload</Label>
        </div>
      </div>
    </div>
  );
};
