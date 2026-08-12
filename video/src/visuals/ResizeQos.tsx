import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 24 beat 6 — QoS does not move. A Pod can be resized while its QoS
 * class stays visibly fixed, keeping the eviction ranking it feeds unchanged.
 * The only route to a different class is replacement — resizing is not a way
 * to promote a workload to Guaranteed.
 */

export const ResizeQos: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const podIn = appear(t, 0.08, 0.16);
  const resize = seg(t, 0.22, 0.36);
  const fixed = appear(t, 0.4, 0.5);
  const ranking = appear(t, 0.54, 0.62);
  const replace = appear(t, 0.7, 0.8);
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
          <Label color={PALETTE.cyan} size={13}>an in-place resize never changes the Pod’s QoS class</Label>
        </div>

        {/* the pod being resized */}
        <div style={{ position: 'absolute', left: 150, top: 52, width: 560, opacity: podIn }}>
          <Box pad={14} borderColor={PALETTE.blue} style={{ textAlign: 'center' }}>
            <Label color={PALETTE.blueInk} size={11}>the Pod — resized in place</Label>
            <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: PALETTE.ink, marginTop: 8 }}>
              cpu/memory requests & limits
            </div>
            <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: PALETTE.ink, marginTop: 6 }}>
              {resize > 0 && <span>{resize > 0.3 && '→ scaled up without replacing the Pod'}</span>}
            </div>
          </Box>
        </div>

        {/* the fixed qos */}
        <div
          style={{
            position: 'absolute',
            left: 150,
            top: 216,
            width: 560,
            borderRadius: 16,
            border: `2px solid ${PALETTE.amber}`,
            background: `${PALETTE.amber}0a`,
            padding: 18,
            textAlign: 'center',
            opacity: fixed,
          }}
        >
          <Label color={PALETTE.amber} size={11}>QoS class — fixed for the Pod’s lifetime</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 26, fontWeight: 900, marginTop: 12 }}>Burstable</div>
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.amber, marginTop: 8 }}>
            resize does not move it — not even to Guaranteed
          </div>
        </div>

        {/* the eviction ranking unchanged */}
        <div
          style={{
            position: 'absolute',
            left: 150,
            top: 420,
            width: 560,
            borderRadius: 14,
            border: `2px solid ${PALETTE.violet}66`,
            background: `${PALETTE.violet}06`,
            padding: '14px 18px',
            opacity: ranking,
          }}
        >
          <Label color={PALETTE.violet} size={11}>the eviction ranking that depends on it</Label>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, marginTop: 8, lineHeight: 1.5 }}>
            scheduling and eviction semantics stay stable — the class is what ranks it, and the class did not move
          </div>
        </div>

        {/* the only route */}
        <div
          style={{
            position: 'absolute',
            left: 800,
            top: 110,
            width: 720,
            borderRadius: 18,
            border: `2px solid ${PALETTE.good}66`,
            background: `${PALETTE.good}06`,
            padding: '20px 24px',
            opacity: replace,
          }}
        >
          <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 12 }}>the only route to a different class</Label>
          <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 900, color: PALETTE.ink }}>
            a new Pod
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.muted, marginTop: 10, lineHeight: 1.5 }}>
            if you need a different class you need a different Pod — resizing is not a way to promote a workload to Guaranteed.
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, marginTop: 12 }}>
            replace it → <span style={{ color: PALETTE.good }}>new class, new lifetime</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>resize changes the numbers, not the class — the class is fixed with the Pod</Label>
        </div>
      </div>
    </div>
  );
};
