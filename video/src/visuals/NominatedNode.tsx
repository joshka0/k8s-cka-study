import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 06 beat 8 — a hint, not a reservation. A high-priority Pod is
 * pending; victims on node-3 are marked terminating with a visible grace
 * countdown. The pending Pod carries a 'nominatedNodeName: node-3' sticky
 * note (deliberately not a lock). While it counts down, other Pods take the
 * freed capacity; when it ends, the nominated Pod re-enters the queue. The
 * tag survives unchanged while the outcome diverges.
 */

const VICTIMS = ['victim-a', 'victim-b', 'victim-c', 'victim-d'];

export const NominatedNode: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const scene = appear(t, 0.06, 0.14);
  const sticky = appear(t, 0.16, 0.24);
  const terminatePulse = 0.55 + 0.45 * Math.sin(frame / 6);
  const cd = Math.max(0, Math.ceil(30 * (1 - seg(t, 0.2, 0.52))));
  const otherPod0 = seg(t, 0.3, 0.38);
  const otherPod1 = seg(t, 0.4, 0.46);
  const otherPod2 = seg(t, 0.46, 0.52);
  const requeue = seg(t, 0.5, 0.6);
  const footer = appear(t, 0.64, 0.72);

  // slot fill: which pod occupies each slot at time t
  const slotOf = (i: number): { label: string; state: string } => {
    if (i === 0) return otherPod0 > 0 ? { label: 'pod-x', state: 'other' } : { label: VICTIMS[i], state: 'victim' };
    if (i === 1) return otherPod1 > 0 ? { label: 'pod-y', state: 'other' } : { label: VICTIMS[i], state: 'victim' };
    if (i === 2) return otherPod2 > 0 ? { label: 'pod-z', state: 'other' } : { label: VICTIMS[i], state: 'victim' };
    // slot 3 stays a victim through the countdown, then its capacity is gone too
    if (t > 0.56) return { label: '—', state: 'taken' };
    return { label: VICTIMS[i], state: 'victim' };
  };

  return (
    <div style={{ position: 'absolute', inset: 0, paddingTop: 18 }}>
      <div style={{ textAlign: 'center', opacity: header, marginBottom: 20 }}>
        <Label color={PALETTE.cyan} size={13}>victims chosen, grace running — the nomination is a hint about where it may land</Label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 90, opacity: scene }}>
        {/* the pending Pod with its sticky note */}
        <div style={{ width: 380, position: 'relative', paddingTop: 40 }}>
          <div
            style={{
              border: `2px solid ${PALETTE.cyan}`,
              background: `${PALETTE.cyan}0d`,
              borderRadius: 16,
              padding: '18px 22px',
              textAlign: 'center',
            }}
          >
            <Label color={PALETTE.cyan} size={12} style={{ marginBottom: 8 }}>Pending — no node yet</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 24, fontWeight: 900 }}>high-priority Pod</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, marginTop: 8, fontWeight: 700 }}>
              priorityClass: high · prio 100
            </div>
          </div>

          {/* sticky note — a hint, not a lock */}
          <div
            style={{
              position: 'absolute',
              left: '100%',
              top: -8,
              marginLeft: 8,
              background: '#f6e58d',
              color: '#1a160a',
              borderRadius: 5,
              padding: '12px 16px',
              fontFamily: MONO,
              fontSize: 15,
              fontWeight: 800,
              transform: 'rotate(-3deg)',
              boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
              opacity: sticky,
              width: 210,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -10,
                left: '50%',
                marginLeft: -22,
                width: 44,
                height: 20,
                background: 'rgba(255,255,255,0.55)',
                transform: 'rotate(2deg)',
                borderRadius: 2,
              }}
            />
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>sticky note — not a lock</div>
            <div style={{ marginTop: 4 }}>nominatedNodeName:</div>
            <div style={{ fontWeight: 900, fontSize: 17 }}>node-3</div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 18, minHeight: 22 }}>
            {requeue > 0 ? (
              <Label color={PALETTE.amber} size={12} style={{ textTransform: 'none', letterSpacing: 0 }}>
                ↓ re-enters the queue — the note travels with it, unchanged
              </Label>
            ) : (
              <Label color={PALETTE.muted} size={12} style={{ textTransform: 'none', letterSpacing: 0 }}>
                waiting on node-3's grace period…
              </Label>
            )}
          </div>
        </div>

        {/* node-3 with terminating victims */}
        <div style={{ width: 640, position: 'relative' }}>
          {/* countdown badge */}
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 800 }}>grace period</div>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                border: `4px solid ${cd <= 5 ? PALETTE.bad : PALETTE.amber}`,
                color: cd <= 5 ? PALETTE.bad : PALETTE.amber,
                fontFamily: MONO,
                fontSize: 32,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '6px auto 0',
                background: '#0c111c',
                boxShadow: cd <= 5 ? `0 0 22px ${PALETTE.bad}55` : `0 0 16px ${PALETTE.amber}33`,
              }}
            >
              {cd}s
            </div>
          </div>

          <div
            style={{
              border: `2px solid ${PALETTE.violet}`,
              borderRadius: 18,
              background: `${PALETTE.violet}0a`,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>node-3</span>
              <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 13, fontWeight: 800 }}>victims → terminating</span>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {[0, 1, 2, 3].map((i) => {
                const s = slotOf(i);
                const victimLeft = t > 0.56 && i === 3;
                return (
                  <div
                    key={i}
                    style={{
                      width: 136,
                      height: 96,
                      borderRadius: 12,
                      border: `2px solid ${s.state === 'other' ? PALETTE.good : s.state === 'taken' ? PALETTE.line : PALETTE.bad}`,
                      background: s.state === 'other' ? `${PALETTE.good}12` : s.state === 'taken' ? '#0d131f' : `${PALETTE.bad}10`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      opacity: victimLeft ? 0.55 : 1,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 14,
                        fontWeight: 900,
                        color: s.state === 'other' ? PALETTE.good : s.state === 'taken' ? PALETTE.muted : PALETTE.bad,
                      }}
                    >
                      {s.state === 'victim' ? `⏳ ${s.label}` : s.state === 'other' ? `▣ ${s.label}` : '—'}
                    </div>
                    {s.state === 'victim' && (
                      <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: PALETTE.bad, opacity: terminatePulse }}>
                        terminating…
                      </div>
                    )}
                    {s.state === 'other' && (
                      <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: PALETTE.muted }}>
                        other Pod took it
                      </div>
                    )}
                    {s.state === 'taken' && (
                      <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: PALETTE.muted }}>
                        capacity gone
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* the queue — the nominated Pod comes back to it */}
      <div style={{ width: 1180, margin: '34px auto 0', display: 'flex', alignItems: 'center', gap: 16, opacity: scene }}>
        <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, flex: '0 0 auto' }}>queue</span>
        <div
          style={{
            flex: 1,
            border: `1px solid ${PALETTE.line}`,
            borderRadius: 14,
            background: PALETTE.panel,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minHeight: 54,
          }}
        >
          <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800 }}>waiting: pod-1 · pod-2 · pod-3 · …</span>
          <div style={{ flex: 1 }} />
          {/* the nominated Pod returns */}
          <div
            style={{
              fontFamily: MONO,
              color: PALETTE.cyan,
              border: `2px solid ${PALETTE.cyan}`,
              borderRadius: 10,
              padding: '7px 14px',
              fontSize: 14,
              fontWeight: 900,
              background: `${PALETTE.cyan}12`,
              opacity: requeue,
              transform: `translateX(${(1 - requeue) * 40}px)`,
              whiteSpace: 'nowrap',
            }}
          >
            high-priority Pod (re-queued)
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>the tag survived unchanged while the outcome diverged — saying the nomination guarantees placement is the wrong answer</Label>
      </div>
    </div>
  );
};
