import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 17 beat 6 — a template, or a named claim. Two lifecycles side by side.
 * Template: the Pod is created, a claim is generated with it, and both are
 * removed together. Named: a claim exists independently, used by one Pod, then
 * another, outliving both. Ownership arrows are drawn explicitly — that is the
 * whole difference.
 */

export const TemplateVsNamed: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const lhsIn = appear(t, 0.08, 0.16);
  const rhsIn = appear(t, 0.2, 0.28);
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
          <Label color={PALETTE.cyan} size={13}>a template is a factory tied to the workload's lifecycle; a named claim is a separate, shareable object</Label>
        </div>

        {/* template lifecycle */}
        <div style={{ position: 'absolute', left: 120, top: 70, width: 700, borderRadius: 20, border: `2px solid ${PALETTE.blue}`, background: `${PALETTE.blue}06`, padding: '18px 22px', opacity: lhsIn }}>
          <Label color={PALETTE.blueInk} size={12} style={{ marginBottom: 12 }}>ResourceClaimTemplate — tied to the workload</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.blue}55`, borderRadius: 10, background: '#0d1522', padding: '11px 14px' }}>
              Pod created
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: PALETTE.blue, fontWeight: 900 }}>⇣ generates</span>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.blue}55`, borderRadius: 10, background: '#0d1522', padding: '11px 14px' }}>
              its own generated claim
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 4 }}>one per Pod, created + cleaned up with it</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: PALETTE.bad, fontWeight: 900 }}>⇡ removed together</span>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800 }}>both disappear when the Pod goes</div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 850, top: 230, color: PALETTE.line, fontSize: 34, fontWeight: 900, opacity: rhsIn }}>↔</div>

        {/* named lifecycle */}
        <div style={{ position: 'absolute', left: 880, top: 70, width: 700, borderRadius: 20, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}06`, padding: '18px 22px', opacity: rhsIn }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 12 }}>a directly named claim — independent</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.good}55`, borderRadius: 10, background: '#0d1522', padding: '11px 14px' }}>
            the named claim — exists on its own
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 4 }}>shareable between Pods, or outlive any of them</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 14, fontWeight: 900 }}>→ used by Pod A</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 14, fontWeight: 900 }}>→ then Pod B</span>
            <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700 }}>both outlived</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: lhsIn }}>
          <Label color={PALETTE.amber} size={13}>choose by lifetime and sharing, not by which is newer — the ownership arrows are the whole difference</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the arrows tell the story: generated-and-collected with the Pod, or independent and shared</Label>
        </div>
      </div>
    </div>
  );
};
