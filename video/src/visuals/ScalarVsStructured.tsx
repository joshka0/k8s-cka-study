import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 17 beat 1 — a count, or a description. Left: a device plugin
 * advertising a bare integer count of an opaque resource, and a Pod asking for
 * a number. Right: the same hardware published as structured inventory with
 * attributes, and a claim expressing requirements against it. The difference
 * between counting and describing is the image.
 */

export const ScalarVsStructured: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const scalarIn = appear(t, 0.08, 0.16);
  const structuredIn = appear(t, 0.24, 0.34);
  const bannerIn = seg(t, 0.44, 0.56);
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
      <div style={{ width: 1700, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>device plugins count; DRA describes. A number versus a filterable description</Label>
        </div>

        {/* left: scalar */}
        <div style={{ position: 'absolute', left: 100, top: 64, width: 700, borderRadius: 20, border: `2px solid ${PALETTE.blue}`, background: `${PALETTE.blue}06`, padding: '18px 24px', opacity: scalarIn }}>
          <Label color={PALETTE.blueInk} size={12} style={{ marginBottom: 12 }}>device plugin — a scalar count</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>
            gpu.example/device: <span style={{ color: PALETTE.blue }}>8</span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 10, lineHeight: 1.4 }}>
            the node advertises an opaque integer — nothing to filter on
          </div>
          <div style={{ marginTop: 16, fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, border: `1px solid ${PALETTE.blue}55`, borderRadius: 10, background: '#0d1522', padding: '12px 16px' }}>
            Pod asks: gpu.example/device: <span style={{ color: PALETTE.blue }}>2</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 830, top: 210, color: PALETTE.line, fontSize: 40, fontWeight: 900, opacity: structuredIn }}>→</div>

        {/* right: structured */}
        <div style={{ position: 'absolute', left: 900, top: 64, width: 700, borderRadius: 20, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}06`, padding: '18px 24px', opacity: structuredIn }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 12 }}>DRA — structured inventory</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.good}55`, borderRadius: 10, background: '#0d1522', padding: '12px 16px', marginBottom: 10 }}>
            ResourceSlice — a device with attributes
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6 }}>
              model: A100 · memory: 80Gi · node: n1 · <span style={{ color: PALETTE.good }}>Healthy</span>
            </div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.good}55`, borderRadius: 10, background: '#0d1522', padding: '12px 16px' }}>
            ResourceClaim — requirements, expressible
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6 }}>
              "a device with memory ≥ 64Gi"
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', opacity: bannerIn }}>
          <Label color={PALETTE.amber} size={13.5}>a number becomes a description you can filter on</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>counting answers "how many"; describing answers "which one, of what kind, where"</Label>
        </div>
      </div>
    </div>
  );
};
