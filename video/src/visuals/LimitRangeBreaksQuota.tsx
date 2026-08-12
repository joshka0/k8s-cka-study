import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 24 beat 4 — how a default breaks a quota. The same submitted Pod is
 * evaluated twice: once with no LimitRange, admitted comfortably; once with a
 * LimitRange injecting default requests, pushing the namespace total over
 * quota and rejected. The submitted YAML is identical in both — that is the
 * surprise.
 */

const YAML = `spec:
  containers:
  - name: app
    image: nginx`;

export const LimitRangeBreaksQuota: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const yamlIn = appear(t, 0.06, 0.12);
  const leftIn = seg(t, 0.18, 0.32);
  const defaultIn = seg(t, 0.4, 0.52);
  const rejectIn = seg(t, 0.58, 0.7);
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
          <Label color={PALETTE.cyan} size={13}>the same submitted Pod — one path admits it, the other rejects it</Label>
        </div>

        {/* the identical yaml */}
        <div style={{ position: 'absolute', left: 130, top: 44, width: 1420, opacity: yamlIn }}>
          <Label color={PALETTE.muted} size={11.5} style={{ marginBottom: 8 }}>the submitted YAML — identical in both paths</Label>
          <div style={{ borderRadius: 12, border: `1px solid ${PALETTE.line}`, background: '#0d1522', padding: '12px 18px', fontFamily: MONO, fontSize: 15, fontWeight: 700, color: PALETTE.ink, whiteSpace: 'pre' }}>
            {YAML}
          </div>
        </div>

        {/* path one: no limitrange */}
        <div style={{ position: 'absolute', left: 130, top: 236, width: 660, opacity: leftIn }}>
          <div style={{ borderRadius: 16, border: `2px solid ${PALETTE.good}66`, background: `${PALETTE.good}06`, padding: '16px 20px' }}>
            <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 10 }}>no LimitRange</Label>
            <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.5 }}>
              no defaults injected — the Pod passes through admission untouched
            </div>
            <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.good, marginTop: 12 }}>
              ✓ admitted comfortably
            </div>
          </div>
        </div>

        {/* path two: limitrange injects defaults */}
        <div style={{ position: 'absolute', left: 850, top: 236, width: 700, opacity: defaultIn }}>
          <div style={{ borderRadius: 16, border: `2px solid ${PALETTE.amber}66`, background: `${PALETTE.amber}06`, padding: '16px 20px' }}>
            <Label color={PALETTE.amber} size={11.5} style={{ marginBottom: 10 }}>with a LimitRange in the namespace</Label>
            <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.5 }}>
              the LimitRange injects default requests / limits before quota evaluates the object
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.muted, marginTop: 8 }}>
              + default request: 100m / 64Mi — now the object carries a declared cost
            </div>
          </div>
          {/* the rejection */}
          <div
            style={{
              marginTop: 12,
              borderRadius: 14,
              border: `2px solid ${PALETTE.bad}`,
              background: `${PALETTE.bad}0c`,
              padding: '14px 18px',
              textAlign: 'center',
              opacity: rejectIn,
              boxShadow: rejectIn > 0.5 ? `0 0 24px ${PALETTE.bad}22` : 'none',
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.bad }}>
              ✕ quota evaluates the admitted object, not the submitted one
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, marginTop: 6 }}>
              those defaults push the namespace total over quota → Forbidden
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 566, textAlign: 'center', opacity: appear(t, 0.66, 0.74) }}>
          <Label color={PALETTE.amber} size={13}>nothing about the Pod changed — what changed is what the namespace now says it means</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 686, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>quota evaluates the object as admitted after admission — defaults count against the budget</Label>
        </div>
      </div>
    </div>
  );
};
