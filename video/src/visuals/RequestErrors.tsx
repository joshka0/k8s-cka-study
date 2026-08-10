import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 06 beat 6 — wrong in both directions. Split stage: left, requests
 * set far above real usage (allocatable wasted, a Pod Pending, fails at
 * schedule time); right, requests below real usage (Pods packed, usage grows
 * past its request outlines, the kubelet evicts, fails hours later). Each
 * side carries a labelled clock so the delay reads.
 */

const LEFT_BLOCKS = [
  { name: 'pod-a', req: 2.6, usage: 0.5 },
  { name: 'pod-b', req: 2.4, usage: 0.6 },
  { name: 'pod-c', req: 2.6, usage: 0.4 },
];
const RIGHT_PODS = 6;

export const RequestErrors: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const in1 = appear(t, 0.04, 0.12);
  const buildLeft = seg(t, 0.1, 0.3);
  const leftUsage = seg(t, 0.3, 0.42);
  const pendingChip = appear(t, 0.38, 0.44);
  const leftTag = appear(t, 0.52, 0.58);

  const buildRight = seg(t, 0.12, 0.28);
  const evict = seg(t, 0.66, 0.74);
  const rightTag = appear(t, 0.74, 0.8);
  const rightClock = seg(t, 0.4, 0.85);

  return (
    <div style={{ position: 'absolute', inset: 0, paddingTop: 18 }}>
      <div style={{ textAlign: 'center', opacity: in1, marginBottom: 20 }}>
        <Label color={PALETTE.cyan} size={13}>requests off in either direction cost you — one at schedule time, one hours later</Label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 44, opacity: in1 }}>
        {/* LEFT — over-requested */}
        <div style={{ width: 800, borderRadius: 20, border: `1px solid ${PALETTE.line}`, background: `${PALETTE.panel}66`, padding: '18px 22px' }}>
          <Label color={PALETTE.amber} size={12} style={{ marginBottom: 12 }}>over-requested — requests ≫ usage</Label>
          <div style={{ display: 'flex', gap: 26, justifyContent: 'center' }}>
            {/* the node column */}
            <div style={{ width: 300 }}>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, textAlign: 'center', borderBottom: `1px solid ${PALETTE.line}`, paddingBottom: 6, marginBottom: 8 }}>
                node allocatable · full
              </div>
              <NodeStack
                blocks={LEFT_BLOCKS}
                build={buildLeft}
                usageBuild={leftUsage}
              />
            </div>
            {/* side stack: pending pod + failure tag + clock */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 14, paddingTop: 34, width: 300 }}>
              <div style={{ opacity: pendingChip, textAlign: 'center' }}>
                <span style={{ fontFamily: MONO, color: PALETTE.cyan, border: `2px solid ${PALETTE.cyan}`, background: `${PALETTE.cyan}10`, borderRadius: 10, padding: '8px 16px', fontSize: 16, fontWeight: 900, whiteSpace: 'nowrap', display: 'inline-block' }}>
                  ⏳ another Pod — Pending
                </span>
              </div>
              <div style={{ opacity: leftTag, textAlign: 'center' }}>
                <span style={{ fontFamily: MONO, color: PALETTE.bad, fontWeight: 900, fontSize: 16, background: `${PALETTE.bad}12`, border: `1px solid ${PALETTE.bad}66`, borderRadius: 10, padding: '8px 16px', whiteSpace: 'nowrap', display: 'inline-block' }}>
                  ✕ fails at schedule time
                </span>
              </div>
              <MiniClock
                sweep={0}
                endLabel="schedule time"
                color={PALETTE.bad}
                show={leftTag}
              />
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, opacity: appear(t, 0.6, 0.66) }}>
            <Label color={PALETTE.amber} size={12}>the node is idle, but the scheduler believes it is full — capacity is wasted</Label>
          </div>
        </div>

        {/* RIGHT — under-requested */}
        <div style={{ width: 800, borderRadius: 20, border: `1px solid ${PALETTE.line}`, background: `${PALETTE.panel}66`, padding: '18px 22px' }}>
          <Label color={PALETTE.bad} size={12} style={{ marginBottom: 12 }}>under-requested — requests ≪ usage</Label>
          <div style={{ display: 'flex', gap: 26, justifyContent: 'center' }}>
            {/* the node column */}
            <div style={{ width: 300 }}>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, textAlign: 'center', borderBottom: `1px solid ${PALETTE.line}`, paddingBottom: 6, marginBottom: 8 }}>
                node allocatable · packed
              </div>
              <div style={{ height: 376, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 9 }}>
                {Array.from({ length: RIGHT_PODS }).map((_, i) => {
                  const grow = seg(t, 0.34 + i * 0.045, 0.58 + i * 0.01);
                  const boot = evict > 0.4 && i === 3;
                  const label = `pod ${String.fromCharCode(97 + i)}`;
                  return (
                    <div key={i} style={{ height: 50, position: 'relative', opacity: buildRight }}>
                      {/* request outline — what the scheduler packed for */}
                      <div
                        style={{
                          border: `1px dashed ${PALETTE.good}88`,
                          borderRadius: 8,
                          height: 50,
                          width: '100%',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                        }}
                      />
                      {/* usage growing past the outline */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          bottom: 0,
                          width: '100%',
                          height: 50,
                          borderRadius: 8,
                          background: boot ? `${PALETTE.bad}55` : `${PALETTE.bad}33`,
                          border: boot ? `2px solid ${PALETTE.bad}` : 'none',
                          transform: `scaleY(${Math.max(0.02, grow)})`,
                          transformOrigin: 'bottom',
                          boxShadow: grow > 1 ? `0 0 14px ${PALETTE.bad}44` : 'none',
                        }}
                      >
                        {grow > 1.05 && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              textAlign: 'center',
                              fontFamily: MONO,
                              color: PALETTE.bad,
                              fontSize: 11,
                              fontWeight: 900,
                              lineHeight: 1,
                              paddingTop: 2,
                            }}
                          >
                            {boot ? '✕ evicted' : 'over'}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          right: 8,
                          bottom: 3,
                          fontFamily: MONO,
                          fontSize: 11,
                          color: boot ? PALETTE.bad : PALETTE.muted,
                          fontWeight: 700,
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* side stack: eviction tag + failure tag + clock */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 14, paddingTop: 34, width: 300 }}>
              <div style={{ opacity: appear(t, 0.66, 0.72), textAlign: 'center' }}>
                <span style={{ fontFamily: MONO, color: PALETTE.bad, fontWeight: 900, fontSize: 16, background: `${PALETTE.bad}12`, border: `1px solid ${PALETTE.bad}66`, borderRadius: 10, padding: '8px 16px', whiteSpace: 'nowrap', display: 'inline-block' }}>
                  kubelet starts evicting
                </span>
              </div>
              <div style={{ opacity: rightTag, textAlign: 'center' }}>
                <span style={{ fontFamily: MONO, color: PALETTE.bad, fontWeight: 900, fontSize: 16, background: `${PALETTE.bad}12`, border: `1px solid ${PALETTE.bad}66`, borderRadius: 10, padding: '8px 16px', whiteSpace: 'nowrap', display: 'inline-block' }}>
                  ✕ fails hours later
                </span>
              </div>
              <MiniClock
                sweep={rightClock}
                endLabel="hours later · t+3h"
                color={PALETTE.bad}
                show={rightTag}
              />
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, opacity: appear(t, 0.8, 0.86) }}>
            <Label color={PALETTE.bad} size={12}>the scheduler packed the node, the Pods grew past their requests, pressure evicts</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Left node stack: request blocks with small usage inside and wasted space shaded. */
function NodeStack({
  blocks,
  build,
  usageBuild,
}: {
  blocks: { name: string; req: number; usage: number }[];
  build: number;
  usageBuild: number;
}) {
  return (
    <div
      style={{
        height: 376,
        borderRadius: 12,
        border: `2px solid ${PALETTE.amber}55`,
        background: PALETTE.panel,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: 8,
      }}
    >
      {blocks.map((b, i) => {
        const local = Math.min(1, Math.max(0, build * 3 - i * 0.9));
        const blockH = 100;
        const usageH = Math.max(12, Math.round(blockH * 0.32) * usageBuild);
        return (
          <div
            key={b.name}
            style={{
              height: blockH,
              borderRadius: 8,
              border: `2px solid ${PALETTE.blue}66`,
              transform: `scaleY(${Math.max(0.02, local)})`,
              transformOrigin: 'bottom',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              overflow: 'hidden',
              opacity: local,
            }}
          >
            {/* wasted space — shaded, above the usage */}
            <div
              style={{
                flex: 1,
                background: `repeating-linear-gradient(45deg, ${PALETTE.amber}30 0 8px, transparent 8px 16px)`,
                borderBottom: `1px dashed ${PALETTE.amber}66`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 12, fontWeight: 800 }}>
                {i === 1 ? 'wasted — requested, unused' : ''}
              </span>
            </div>
            {/* usage, small */}
            <div
              style={{
                height: usageH,
                background: `${PALETTE.cyan}44`,
                borderTop: `1px solid ${PALETTE.cyan}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <span style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
                {b.name} · req {b.req.toFixed(1)} — using {b.usage.toFixed(1)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Small analog clock whose hands sweep from 0 to `sweep` (0..1 ≈ three hours). */
function MiniClock({
  sweep,
  endLabel,
  color,
  show,
}: {
  sweep: number;
  endLabel: string;
  color: string;
  show: number;
}) {
  const hours = sweep * 3.1;
  const minutes = hours * 60;
  const hourDeg = (hours % 12) * 30 + (minutes % 60) * 0.5;
  const minuteDeg = (minutes % 60) * 6;
  return (
    <div style={{ textAlign: 'center', opacity: show }}>
      <div style={{ fontFamily: MONO, color, fontSize: 13, fontWeight: 900, marginBottom: 6 }}>
        {sweep < 0.02 ? 't+0' : endLabel}
      </div>
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          border: `3px solid ${color}`,
          margin: '0 auto',
          position: 'relative',
          background: '#0c111c',
        }}
      >
        <ClockHand deg={hourDeg} len={16} thick={4} color={color} />
        <ClockHand deg={minuteDeg} len={26} thick={2} color={color} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 6, height: 6, margin: -3, borderRadius: '50%', background: color }} />
      </div>
    </div>
  );
}

function ClockHand({ deg, len, thick, color }: { deg: number; len: number; thick: number; color: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: thick,
        height: len,
        marginLeft: -thick / 2,
        marginTop: -len,
        background: color,
        borderRadius: 2,
        transformOrigin: '50% 100%',
        transform: `rotate(${deg}deg)`,
      }}
    />
  );
}
