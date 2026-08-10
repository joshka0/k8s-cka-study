import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 06 beat 9 — queue order without displacement. Priority is two
 * independent switches on one Pod: A orders the queue, B authorises
 * preemption. The same Pod runs twice — both switches on (victims
 * displaced), then preemptionPolicy: Never (still jumps the queue, the
 * occupied node is left untouched, it simply waits). The two switches must
 * read as two settings.
 */

const QUEUE_PODS = ['pod-3', 'pod-2', 'pod-1'];

// Anchor points for the Pod token on the stage.
const CARD = { x: 560, y: 150 };
const QFRONT = { x: 185, y: 46 };
const NODE = { x: 985, y: 150 };

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

export const PreemptionPolicy: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const scene = appear(t, 0.06, 0.13);
  const run1 = t < 0.42;
  const run2 = t >= 0.46;

  const toFront1 = seg(t, 0.14, 0.26);
  const toNode1 = seg(t, 0.3, 0.4);
  const displaced1 = seg(t, 0.28, 0.36);
  const reset = seg(t, 0.44, 0.48);
  const toFront2 = seg(t, 0.52, 0.62);
  const wait = seg(t, 0.64, 0.72);
  const footer = appear(t, 0.86, 0.94);

  // Token position.
  let x = CARD.x;
  let y = CARD.y;
  if (t >= 0.14 && t < 0.3) {
    const u = toFront1;
    x = lerp(CARD.x, QFRONT.x, u);
    y = lerp(CARD.y, QFRONT.y, u);
  } else if (t >= 0.3 && t < 0.44) {
    const u = toNode1;
    x = lerp(QFRONT.x, NODE.x, u);
    y = lerp(QFRONT.y, NODE.y, u);
  } else if (t >= 0.44 && t < 0.52) {
    x = CARD.x;
    y = CARD.y;
  } else if (t >= 0.52) {
    const u = toFront2;
    x = lerp(CARD.x, QFRONT.x, u);
    y = lerp(QFRONT.y, QFRONT.y, u);
  }

  const tokenOpacity =
    t < 0.14 ? appear(t, 0.1, 0.14)
    : t >= 0.44 && t < 0.52 ? 1 - reset * 0.4
    : 1;

  const toggleBOff = t >= 0.46;

  return (
    <div style={{ position: 'absolute', inset: 0, paddingTop: 16 }}>
      <div style={{ textAlign: 'center', opacity: header, marginBottom: 12 }}>
        <Label color={PALETTE.cyan} size={13}>priority does two separate jobs — two switches, and you can take one without the other</Label>
      </div>

      {/* run badge */}
      <div style={{ textAlign: 'center', marginBottom: 14, opacity: scene }}>
        {run1 ? (
          <span style={{ fontFamily: MONO, color: PALETTE.blue, fontWeight: 900, fontSize: 15, border: `1px solid ${PALETTE.blue}66`, background: `${PALETTE.blue}10`, borderRadius: 999, padding: '7px 18px', whiteSpace: 'nowrap' }}>
            run 1 · both switches on
          </span>
        ) : (
          <span style={{ fontFamily: MONO, color: PALETTE.amber, fontWeight: 900, fontSize: 15, border: `1px solid ${PALETTE.amber}66`, background: `${PALETTE.amber}10`, borderRadius: 999, padding: '7px 18px', whiteSpace: 'nowrap' }}>
            run 2 · preemptionPolicy: Never
          </span>
        )}
      </div>

      <div style={{ position: 'relative', width: 1240, height: 400, margin: '0 auto', opacity: scene }}>
        {/* queue */}
        <div style={{ position: 'absolute', left: 40, top: 20, width: 300 }}>
          <Label color={PALETTE.muted} size={11} style={{ marginBottom: 8 }}>scheduling queue</Label>
          {QUEUE_PODS.map((p, i) => (
            <div
              key={p}
              style={{
                fontFamily: MONO,
                color: PALETTE.muted,
                border: `1px solid ${PALETTE.line}`,
                borderRadius: 10,
                padding: '9px 14px',
                fontSize: 15,
                fontWeight: 800,
                marginBottom: 8,
                background: PALETTE.panel,
              }}
            >
              {p}
            </div>
          ))}
          {/* front-of-queue marker */}
          <div
            style={{
              position: 'absolute',
              left: -14,
              top: -16,
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 900,
              color: PALETTE.good,
              opacity: (toFront1 > 0.5 || toFront2 > 0.5) ? 1 : 0.3,
            }}
          >
            ▲ next
          </div>
        </div>

        {/* the pod card with its two switches */}
        <div style={{ position: 'absolute', left: 400, top: 30, width: 360, textAlign: 'center' }}>
          <div
            style={{
              border: `2px solid ${PALETTE.cyan}`,
              background: `${PALETTE.cyan}0d`,
              borderRadius: 16,
              padding: '14px 18px',
            }}
          >
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>one Pod, priority high</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, marginTop: 4, fontWeight: 700 }}>
              two independent switches on the same Pod
            </div>

            {/* switch A — queue order */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 15, fontWeight: 900 }}>switch A · queue order</div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700 }}>considered first</div>
              </div>
              <Toggle on color={PALETTE.cyan} label="ON" />
            </div>

            {/* switch B — preemption */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: MONO, color: toggleBOff ? PALETTE.muted : PALETTE.bad, fontSize: 15, fontWeight: 900 }}>switch B · preemption</div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700 }}>
                  {toggleBOff ? 'set to Never' : 'may displace victims'}
                </div>
              </div>
              <Toggle on={!toggleBOff} color={PALETTE.bad} label={toggleBOff ? 'OFF' : 'ON'} />
            </div>
          </div>
        </div>

        {/* node-3 */}
        <div style={{ position: 'absolute', left: 840, top: 20, width: 360 }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, marginBottom: 8 }}>node-3 · occupied</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <NodeSlot label="workload-a" displaced={run1 ? displaced1 : 0} />
            <NodeSlot label="workload-b" displaced={run1 ? displaced1 : 0} />
            <NodeSlot label="workload-c" displaced={0} />
          </div>
          <div style={{ marginTop: 10, minHeight: 20 }}>
            {run1 && displaced1 > 0.2 && (
              <Label color={PALETTE.bad} size={12} style={{ textTransform: 'none', letterSpacing: 0 }}>✕ victims displaced to make room</Label>
            )}
            {run2 && t > 0.6 && (
              <Label color={PALETTE.good} size={12} style={{ textTransform: 'none', letterSpacing: 0 }}>left untouched — nothing displaced</Label>
            )}
          </div>
        </div>

        {/* the Pod token */}
        <div
          style={{
            position: 'absolute',
            left: x - 70,
            top: y - 20,
            width: 140,
            height: 40,
            borderRadius: 10,
            background: PALETTE.cyan,
            color: '#051022',
            fontFamily: MONO,
            fontSize: 15,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 22px ${PALETTE.cyan}66`,
            opacity: tokenOpacity,
            whiteSpace: 'nowrap',
            zIndex: 5,
          }}
        >
          high-prio Pod
        </div>

        {/* wait tag in run 2 */}
        {run2 && wait > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 60,
              top: 240,
              opacity: wait,
              fontFamily: MONO,
              color: PALETTE.amber,
              fontSize: 16,
              fontWeight: 900,
              background: `${PALETTE.amber}10`,
              border: `1px solid ${PALETTE.amber}66`,
              borderRadius: 10,
              padding: '9px 16px',
              whiteSpace: 'nowrap',
            }}
          >
            ⏳ first in queue, still Pending — the node will not be emptied for it
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 18, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>the setting for work that should be considered early but must never cost another team its Pods</Label>
      </div>
    </div>
  );
};

function NodeSlot({ label, displaced }: { label: string; displaced: number }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        color: PALETTE.ink,
        border: `1px solid ${PALETTE.violet}`,
        borderRadius: 10,
        padding: '9px 14px',
        fontSize: 15,
        fontWeight: 800,
        background: `${PALETTE.violet}0a`,
        opacity: 1 - displaced,
        transform: `translateY(${-displaced * 26}px)`,
      }}
    >
      {label}
    </div>
  );
}

function Toggle({ on, color, label }: { on: boolean; color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 54,
          height: 28,
          borderRadius: 999,
          background: on ? color : PALETTE.line,
          position: 'relative',
          transition: 'none',
          boxShadow: on ? `0 0 12px ${color}55` : 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: on ? 27 : 3,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#e8edf7',
          }}
        />
      </div>
      <span style={{ fontFamily: MONO, color: on ? color : PALETTE.muted, fontSize: 13, fontWeight: 900, width: 34 }}>
        {label}
      </span>
    </div>
  );
}
