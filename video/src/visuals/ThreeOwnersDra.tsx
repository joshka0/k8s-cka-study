import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 17 beat 5 — a pending device Pod has three owners. Three owners across
 * the stage, each with the object whose status reports its phase: Pod,
 * ResourceClaim, ResourceSlice. One failure lands in each, with the
 * distinguishing status. The three objects have equal weight — reading the
 * right one is the skill.
 */

const OWNERS = [
  { who: 'the scheduler', object: 'Pod', status: 'phase: Pending · reason: no node / SchedulingGated', failure: 'this lands here when no node can take the device', color: PALETTE.blue },
  { who: 'the DRA driver', object: 'ResourceClaim', status: 'allocation: unallocated / Pending', failure: 'this lands here when no device matches the claim', color: PALETTE.cyan },
  { who: 'the kubelet', object: 'ResourceSlice', status: 'inventory: no device / not Ready', failure: 'this lands here when the device is not prepared', color: PALETTE.amber },
];

export const ThreeOwnersDra: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const ownerOn = OWNERS.map((_, i) => appear(t, 0.08 + i * 0.08, 0.15 + i * 0.08));
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
          <Label color={PALETTE.cyan} size={13}>a pending device Pod has three owners — each with the object whose status reports its phase</Label>
        </div>

        <div style={{ position: 'absolute', left: 80, top: 64, width: 1500, display: 'flex', gap: 16 }}>
          {OWNERS.map((o, i) => {
            const on = ownerOn[i];
            return (
              <div
                key={o.who}
                style={{
                  flex: 1,
                  borderRadius: 18,
                  border: `2px solid ${on > 0.5 ? o.color : PALETTE.line}`,
                  background: on > 0.5 ? `${o.color}08` : PALETTE.panel,
                  padding: '18px 20px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <Label color={o.color} size={12} style={{ marginBottom: 12 }}>owner — {o.who}</Label>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 24, fontWeight: 900 }}>{o.object}</div>
                <div style={{ marginTop: 12, borderRadius: 10, border: `1px solid ${o.color}55`, background: '#0d1522', padding: '10px 12px' }}>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 800, color: o.color }}>its status</div>
                  <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 900, color: PALETTE.ink, marginTop: 5, lineHeight: 1.4 }}>{o.status}</div>
                </div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 12, lineHeight: 1.4 }}>
                  {o.failure}
                </div>
              </div>
            );
          })}
        </div>

        {/* the tie line */}
        <div style={{ position: 'absolute', left: 380, top: 430, width: 900, borderTop: `2px dashed ${PALETTE.amber}66`, opacity: header }} />

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.amber} size={13}>status on the Pod, the claim and the slice separates the phases — that is what stops you guessing</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>three objects, equal weight — the skill is reading which one holds the phase you are stuck on</Label>
        </div>
      </div>
    </div>
  );
};
