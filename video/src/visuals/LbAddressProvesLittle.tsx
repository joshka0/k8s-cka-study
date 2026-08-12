import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 25 beat 3 — an address is not reachability. A provisioned ingress
 * address proves provisioning happened and nothing else. Five independent
 * break points sit beneath it, each able to fail while the address stays
 * green. The address gets a small footprint, the failures get the space — the
 * imbalance is the argument.
 */

const BREAKS = [
  { name: 'backend health', detail: 'the Pods are unhealthy behind it', color: PALETTE.bad },
  { name: 'Service ports', detail: 'the ports are wrong for the backends', color: PALETTE.bad },
  { name: 'EndpointSlices', detail: 'empty, or every member unready', color: PALETTE.bad },
  { name: 'traffic policy', detail: 'excludes every endpoint on the node that received the packet', color: PALETTE.bad },
  { name: 'the Pod itself', detail: 'its listener, or policy, refuses', color: PALETTE.bad },
];

export const LbAddressProvesLittle: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const addrIn = appear(t, 0.04, 0.1);
  const breakOn = BREAKS.map((_, i) => appear(t, 0.2 + i * 0.12, 0.28 + i * 0.12));
  const footer = appear(t, 0.88, 0.94);

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
          <Label color={PALETTE.cyan} size={13}>a provisioned ingress address proves provisioning happened — nothing else</Label>
        </div>

        {/* the green address, deliberately small */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center', opacity: addrIn }}>
          <div style={{ display: 'inline-block', fontFamily: MONO, fontSize: 18, fontWeight: 900, color: PALETTE.good, border: `2px solid ${PALETTE.good}66`, borderRadius: 999, background: `${PALETTE.good}0a`, padding: '8px 22px' }}>
            ingress IP: 192.0.2.10 — green
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 104, textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 900, color: PALETTE.line }}>↓</div>
          <Label color={PALETTE.muted} size={11.5} style={{ marginTop: 4 }}>it can fail in five independent places and the address still stays green</Label>
        </div>

        {/* the five break points */}
        <div style={{ position: 'absolute', left: 200, top: 190, width: 1280, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {BREAKS.map((b, i) => (
            <div
              key={b.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                borderRadius: 13,
                border: `2px solid ${PALETTE.bad}55`,
                background: `${PALETTE.bad}06`,
                padding: '14px 20px',
                opacity: breakOn[i],
                transform: `translateX(${(1 - breakOn[i]) * -16}px)`,
              }}
            >
              <span style={{ flex: '0 0 40px', fontFamily: MONO, fontSize: 18, fontWeight: 900, color: PALETTE.bad, border: `1px solid ${PALETTE.bad}66`, borderRadius: 999, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {i + 1}
              </span>
              <div style={{ flex: '0 0 260px', fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink }}>{b.name}</div>
              <div style={{ flex: 1, fontFamily: MONO, fontSize: 14.5, fontWeight: 700, color: PALETTE.muted, lineHeight: 1.4 }}>{b.detail}</div>
              <span style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 900, color: PALETTE.bad }}>✕ can fail while green</span>
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 668, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>five independent failures behind one green address — the address is the smallest part of the story</Label>
        </div>
      </div>
    </div>
  );
};
