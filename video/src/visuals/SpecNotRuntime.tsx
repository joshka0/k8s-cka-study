import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 27 beat 2 — it evaluates the spec. Admission reads the Pod spec and
 * decides against the standard before the object is stored. Whether the
 * runtime and kernel actually enforce those settings on the node is a
 * separate question. The two are drawn apart: a spec that passes admission
 * and a runtime that does not deliver what it promised, with the gap labelled.
 */

const SPEC_CHECKS = ['securityContext', 'host namespaces', 'volume types', 'privileged mode'];

export const SpecNotRuntime: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const admitIn = seg(t, 0.1, 0.22);
  const pass = appear(t, 0.26, 0.34);
  const runtimeIn = seg(t, 0.4, 0.54);
  const gap = seg(t, 0.58, 0.7);
  const footer = appear(t, 0.86, 0.94);

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
          <Label color={PALETTE.cyan} size={13}>admission checks the spec · the runtime and kernel enforce it — two separate questions</Label>
        </div>

        {/* stage one: admission reads the spec */}
        <div style={{ position: 'absolute', left: 120, top: 44, width: 720, borderRadius: 18, border: `2px solid ${PALETTE.blue}66`, background: `${PALETTE.blue}06`, padding: '18px 22px', opacity: admitIn }}>
          <Label color={PALETTE.blueInk} size={11.5} style={{ marginBottom: 12 }}>admission — reads the spec, decides</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SPEC_CHECKS.map((c) => (
              <div key={c} style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, border: `1px solid ${PALETTE.line}`, borderRadius: 8, background: '#0d1522', padding: '8px 12px' }}>
                {c}
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.muted, marginTop: 12 }}>
            checked against the standard before the object is stored
          </div>
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.good, opacity: pass }}>
            ✓ passes Restricted admission
          </div>
        </div>

        <div style={{ position: 'absolute', left: 880, top: 180, color: PALETTE.line, fontSize: 26, fontWeight: 900, opacity: runtimeIn }}>
          →
        </div>

        {/* stage two: runtime + kernel apply */}
        <div style={{ position: 'absolute', left: 940, top: 44, width: 620, borderRadius: 18, border: `2px solid ${PALETTE.violet}66`, background: `${PALETTE.violet}06`, padding: '18px 22px', opacity: runtimeIn }}>
          <Label color={PALETTE.violet} size={11.5} style={{ marginBottom: 12 }}>runtime + kernel — apply on the node later</Label>
          <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.5 }}>
            whether the runtime and kernel actually enforce those settings is answered by the runtime and the kernel, not by the API server
          </div>
          <div
            style={{
              marginTop: 14,
              borderRadius: 10,
              border: `1px solid ${PALETTE.bad}66`,
              background: `${PALETTE.bad}06`,
              padding: '12px 14px',
              opacity: gap > 0 ? gap : 0,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 900, color: PALETTE.bad }}>✕ runtime does not deliver what the spec promised</div>
          </div>
        </div>

        {/* the gap */}
        <div style={{ position: 'absolute', left: 940, top: 360, width: 620, borderRadius: 12, border: `2px dashed ${PALETTE.bad}66`, background: `${PALETTE.bad}06`, padding: '12px 16px', opacity: gap }}>
          <Label color={PALETTE.bad} size={11}>the gap</Label>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, marginTop: 6, lineHeight: 1.4 }}>
            a spec that passes admission is not proof the running process is restricted — enforcement is a node-side fact
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>admission and enforcement are separate boundaries — passing one says nothing about the other</Label>
        </div>
      </div>
    </div>
  );
};
