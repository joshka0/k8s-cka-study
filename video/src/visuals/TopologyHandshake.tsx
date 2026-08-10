import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 10 beat 8 — topology, in order, not in a standoff. The scheduler
 * selects the node using Pod constraints and the driver's topology signals;
 * only then does the provisioner create the volume there. CORRECTION
 * respected: this is not two sides waiting on each other — the scheduler
 * picks first, then the provisioner acts.
 */

export const TopologyHandshake: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const stageIn = appear(t, 0.08, 0.16);
  const constraintIn = appear(t, 0.14, 0.22);
  const step1 = seg(t, 0.22, 0.36);
  const step2 = seg(t, 0.4, 0.56);
  const unsched = seg(t, 0.6, 0.72);
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
      <div style={{ width: 1620, height: 680, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>topology is an ordered handshake, not a standoff — the scheduler acts first</Label>
        </div>

        {/* the two faces */}
        <div style={{ position: 'absolute', left: 220, top: 180, display: 'flex', alignItems: 'center', gap: 40, opacity: stageIn }}>
          {/* scheduler */}
          <div style={{ width: 400, textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 24, fontWeight: 900, border: `2px solid ${PALETTE.cyan}`, borderRadius: 16, background: `${PALETTE.cyan}0c`, padding: '18px 16px' }}>
              scheduler
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>
              picks the node using Pod constraints + the driver's topology signals
            </div>
          </div>

          {/* the constraint between them */}
          <div style={{ opacity: constraintIn, textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 15.5, fontWeight: 900, border: `1px solid ${PALETTE.amber}66`, borderRadius: 999, background: `${PALETTE.amber}0c`, padding: '10px 18px' }}>
              zone-b has capacity
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 13.5, fontWeight: 800, marginTop: 8 }}>
              and zone-a does not — the shared constraint
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.line, fontSize: 24, fontWeight: 900, marginTop: 6 }}>◆</div>
          </div>

          {/* provisioner */}
          <div style={{ width: 400, textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 24, fontWeight: 900, border: `2px solid ${PALETTE.violet}`, borderRadius: 16, background: `${PALETTE.violet}0c`, padding: '18px 16px' }}>
              provisioner
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>
              creates the volume where the scheduler decided
            </div>
          </div>
        </div>

        {/* the order */}
        <div style={{ position: 'absolute', left: 220, top: 380, width: 1180, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              borderRadius: 14,
              border: `1px solid ${step1 > 0.5 ? PALETTE.cyan : PALETTE.line}66`,
              background: '#0c111c',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              opacity: Math.max(0.3, step1),
            }}
          >
            <span style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 22, fontWeight: 900, flex: '0 0 40px', textAlign: 'center' }}>①</span>
            <div>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17.5, fontWeight: 900 }}>scheduler selects a node in zone-b</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 4 }}>
                volume topology is a scheduling constraint — place the Pod where storage exists or can be created
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', color: PALETTE.line, fontSize: 18, fontWeight: 900, opacity: step1 }}>↓ then, and only then ↓</div>
          <div
            style={{
              borderRadius: 14,
              border: `1px solid ${step2 > 0.5 ? PALETTE.violet : PALETTE.line}66`,
              background: '#0c111c',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              opacity: Math.max(0.3, step2),
            }}
          >
            <span style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 22, fontWeight: 900, flex: '0 0 40px', textAlign: 'center' }}>②</span>
            <div>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17.5, fontWeight: 900 }}>provisioner creates the volume in zone-b</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 4 }}>
                the volume is born where the Pod can run — WaitForFirstConsumer
              </div>
            </div>
          </div>
        </div>

        {/* the failure */}
        <div
          style={{
            position: 'absolute',
            left: 220,
            top: 560,
            width: 1180,
            borderRadius: 14,
            border: `1px solid ${PALETTE.bad}55`,
            background: `${PALETTE.bad}06`,
            padding: '12px 18px',
            textAlign: 'center',
            opacity: unsched,
          }}
        >
          <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 16.5, fontWeight: 900 }}>
            no node satisfies both pod and storage constraints → the Pod stays unschedulable, and the claim stays waiting
          </span>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 636, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>not two sides waiting on each other — one decision first, one creation second, in a fixed order</Label>
        </div>
      </div>
    </div>
  );
};
