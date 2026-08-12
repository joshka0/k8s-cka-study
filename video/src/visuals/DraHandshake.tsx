import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 17 beat 3 — the order of the handshake. Four ordered stages: the
 * driver publishes inventory, the scheduler allocates a device into the claim,
 * the scheduler selects a reachable node, then the kubelet and driver prepare
 * the device there. A boundary marks where the decision becomes node-local.
 * Preparing before allocation is impossible, not merely wrong.
 */

const STAGES = [
  { n: '01', who: 'driver', verb: 'publishes inventory', note: 'nothing can be allocated from inventory that does not exist yet', color: PALETTE.cyan },
  { n: '02', who: 'scheduler', verb: 'allocates a device', note: 'a matching device into the claim', color: PALETTE.blue },
  { n: '03', who: 'scheduler', verb: 'selects a reachable node', note: 'the node that can reach the device', color: PALETTE.blue },
  { n: '04', who: 'kubelet + driver', verb: 'prepare the device', note: 'node-local preparation before use', color: PALETTE.violet },
];

export const DraHandshake: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const stageOn = STAGES.map((_, i) => appear(t, 0.08 + i * 0.07, 0.15 + i * 0.07));
  const boundary = seg(t, 0.4, 0.52);
  const impossibleIn = appear(t, 0.72, 0.84);
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
      <div style={{ width: 1720, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>the handshake has an order — allocation always precedes preparation</Label>
        </div>

        {/* the four stages */}
        <div style={{ position: 'absolute', left: 60, top: 80, display: 'flex', alignItems: 'stretch', gap: 10, width: 1600 }}>
          {STAGES.map((s, i) => {
            const on = stageOn[i];
            return (
              <div
                key={s.n}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  border: `2px solid ${on > 0.5 ? s.color : PALETTE.line}`,
                  background: on > 0.5 ? `${s.color}08` : PALETTE.panel,
                  padding: '16px 18px',
                  opacity: Math.max(0.3, on),
                  minHeight: 230,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: s.color }}>{s.n}</span>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, marginTop: 8 }}>{s.who}</div>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, marginTop: 2 }}>{s.verb}</div>
                <div style={{ flex: 1 }} />
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginTop: 12, lineHeight: 1.4 }}>{s.note}</div>
              </div>
            );
          })}
        </div>

        {/* the node-local boundary */}
        <div style={{ position: 'absolute', left: 1238, top: 120, height: 150, borderLeft: `3px solid ${PALETTE.amber}`, opacity: boundary }}>
          <div
            style={{
              position: 'absolute',
              left: -140,
              top: 60,
              whiteSpace: 'nowrap',
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 900,
              color: PALETTE.amber,
              border: `1px solid ${PALETTE.amber}66`,
              borderRadius: 10,
              background: '#0b111d',
              padding: '7px 12px',
            }}
          >
            here the decision becomes node-local
          </div>
        </div>

        {/* impossible order */}
        <div
          style={{
            position: 'absolute',
            left: 180,
            top: 440,
            width: 1360,
            borderRadius: 18,
            border: `2px solid ${PALETTE.bad}66`,
            background: `${PALETTE.bad}06`,
            padding: '16px 24px',
            textAlign: 'center',
            opacity: impossibleIn,
          }}
        >
          <Label color={PALETTE.bad} size={12.5} style={{ marginBottom: 10 }}>the impossible order — prepare before allocation</Label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>prepare</span>
            <span style={{ color: PALETTE.line, fontWeight: 900 }}>→</span>
            <span
              style={{
                fontFamily: MONO,
                color: PALETTE.bad,
                fontSize: 16,
                fontWeight: 900,
                border: `2px solid ${PALETTE.bad}`,
                borderRadius: 10,
                padding: '8px 14px',
                background: `${PALETTE.bad}0c`,
              }}
            >
              allocate
            </span>
            <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 20, fontWeight: 900 }}>✕</span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14.5, fontWeight: 800, marginTop: 12, lineHeight: 1.5 }}>
            not merely wrong — impossible. There is no device to prepare until allocation has picked one
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>allocation precedes preparation, never the other way round — that is the order the lifecycle depends on</Label>
        </div>
      </div>
    </div>
  );
};
