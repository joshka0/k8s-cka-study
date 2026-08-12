import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 17 beat 4 — the architectural discriminator. Since module 08 already
 * draws the Extended-Resource side and CSI the node path, this compares two
 * architectures on the axes that actually differ: what is advertised, through
 * what path, what the scheduler can reason about, and what lifecycle is
 * possible. Node-side preparation is marked as shared by both, so it does not
 * read as DRA-only.
 */

const ROWS = [
  { axis: 'what is advertised', plugin: 'a scalar count', dra: 'structured devices (attributes)', color: PALETTE.cyan },
  { axis: 'through what path', plugin: 'via the kubelet (extended resources)', dra: 'API objects (ResourceSlices)', color: PALETTE.blue },
  { axis: 'what the scheduler can reason about', plugin: 'just the integer', dra: 'attributes — filtering, sharing, lifecycle', color: PALETTE.violet },
  { axis: 'what lifecycle is possible', plugin: 'limited', dra: 'full — allocate, share, release', color: PALETTE.amber },
];

export const PluginVsDra: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const headIn = appear(t, 0.06, 0.12);
  const rowOn = ROWS.map((_, i) => appear(t, 0.12 + i * 0.07, 0.19 + i * 0.07));
  const sharedIn = appear(t, 0.56, 0.68);
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
          <Label color={PALETTE.cyan} size={13}>the architectural discriminator — two architectures on the axes that actually differ</Label>
        </div>

        {/* headers */}
        <div style={{ position: 'absolute', left: 220, top: 54, display: 'flex', gap: 16, opacity: headIn }}>
          <div style={{ width: 420, textAlign: 'center' }} />
          <div style={{ width: 400, fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900, textAlign: 'center' }}>device plugin</div>
          <div style={{ width: 400, fontFamily: MONO, color: PALETTE.good, fontSize: 17, fontWeight: 900, textAlign: 'center' }}>DRA</div>
        </div>

        <div style={{ position: 'absolute', left: 220, top: 100, width: 1230, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ROWS.map((r, i) => {
            const on = rowOn[i];
            return (
              <div
                key={r.axis}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  borderRadius: 12,
                  border: `1px solid ${on > 0.5 ? r.color : PALETTE.line}44`,
                  background: on > 0.5 ? `${r.color}06` : '#101826',
                  padding: '12px 14px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <div style={{ width: 400, flex: '0 0 400px', fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 800 }}>
                  {r.axis}
                </div>
                <div style={{ width: 400, flex: '0 0 400px', fontFamily: MONO, color: PALETTE.ink, fontSize: 14, fontWeight: 800, lineHeight: 1.35 }}>
                  {r.plugin}
                </div>
                <div style={{ flex: 1, fontFamily: MONO, color: PALETTE.good, fontSize: 14, fontWeight: 800, lineHeight: 1.35 }}>
                  {r.dra}
                </div>
              </div>
            );
          })}
        </div>

        {/* shared node-side preparation */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 470,
            width: 1260,
            borderRadius: 18,
            border: `2px solid ${PALETTE.good}`,
            background: `${PALETTE.good}08`,
            padding: '16px 24px',
            textAlign: 'center',
            opacity: sharedIn,
          }}
        >
          <Label color={PALETTE.good} size={12.5} style={{ marginBottom: 8 }}>shared by both — not DRA-only</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>
            both still need node-side preparation before a container can use anything
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>DRA's power is the structured path through the API — preparation stays a node-side step in both</Label>
        </div>
      </div>
    </div>
  );
};
