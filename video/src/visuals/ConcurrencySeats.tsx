import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 12 beat 2 — a finite pool of concurrency seats as a real countable
 * set. Requests from several clients are classified and take seats; the pool
 * fills; one client is held in a queue rather than being allowed to take
 * every remaining seat. The finiteness is visible — a countable pool, not an
 * abstract meter.
 */

export const ConcurrencySeats: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const sceneIn = appear(t, 0.08, 0.16);
  const clientsIn = appear(t, 0.14, 0.22);
  const fill = seg(t, 0.2, 0.62);
  const queueIn = seg(t, 0.5, 0.66);
  const footer = appear(t, 0.86, 0.94);

  const SEATS = 12;
  const occupied = Math.min(SEATS, Math.round(fill * SEATS));

  const pulse = 0.5 + 0.5 * Math.sin(frame / 8);

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
      <div style={{ width: 1620, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>a finite pool — requests take seats, and when the pool is full, someone queues</Label>
        </div>

        {/* the clients */}
        <div style={{ position: 'absolute', left: 90, top: 130, display: 'flex', flexDirection: 'column', gap: 26, opacity: clientsIn }}>
          {['client A — chatty', 'client B — bursty', 'client C — greedy'].map((c, i) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 14,
                  fontWeight: 900,
                  color: PALETTE.ink,
                  border: `1px solid ${PALETTE.cyan}66`,
                  borderRadius: 10,
                  background: `${PALETTE.cyan}0a`,
                  padding: '10px 14px',
                }}
              >
                {c}
              </span>
              <span style={{ color: PALETTE.line, fontSize: 18, fontWeight: 900 }}>→</span>
              {i === 2 && queueIn > 0.5 && (
                <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.amber, opacity: 0.6 + 0.4 * pulse }}>
                  ⏳ excess requests held in a queue
                </span>
              )}
            </div>
          ))}
        </div>

        {/* the seat pool */}
        <div style={{ position: 'absolute', left: 430, top: 96, width: 780, borderRadius: 18, border: `2px solid ${PALETTE.violet}55`, background: `${PALETTE.violet}04`, padding: '16px 20px', opacity: sceneIn }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Label color={PALETTE.violet} size={12.5}>concurrency seats — countable</Label>
            <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.ink }}>
              {occupied} / {SEATS} taken
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
            {Array.from({ length: SEATS }).map((_, i) => {
              const taken = i < occupied;
              return (
                <div
                  key={i}
                  style={{
                    height: 44,
                    borderRadius: 8,
                    border: `2px solid ${taken ? PALETTE.violet : PALETTE.line}`,
                    background: taken ? `${PALETTE.violet}33` : 'transparent',
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 900,
                    color: taken ? PALETTE.violet : PALETTE.line,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 12, textAlign: 'center', opacity: queueIn > 0.5 ? 0 : 1 }}>
            filling as classified requests arrive
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 14.5, fontWeight: 900, marginTop: 10, textAlign: 'center', opacity: queueIn }}>
            {queueIn > 0.5
              ? 'pool full — client C is held in the queue, not allowed to take every remaining seat'
              : '…'}
          </div>
        </div>

        {/* the queue */}
        <div
          style={{
            position: 'absolute',
            left: 1240,
            top: 96,
            width: 300,
            borderRadius: 18,
            border: `2px solid ${PALETTE.amber}55`,
            background: `${PALETTE.amber}04`,
            padding: '16px 18px',
            opacity: queueIn,
          }}
        >
          <Label color={PALETTE.amber} size={12} style={{ marginBottom: 10 }}>the queue</Label>
          {Array.from({ length: Math.min(4, Math.max(1, Math.round(fill * 4))) }).map((_, i) => (
            <div
              key={i}
              style={{
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 800,
                color: PALETTE.ink,
                border: `1px solid ${PALETTE.amber}55`,
                borderRadius: 8,
                background: '#0d1522',
                padding: '8px 10px',
                marginBottom: 6,
              }}
            >
              C·req {i + 1} <span style={{ color: PALETTE.amber, fontWeight: 900 }}>waiting</span>
            </div>
          ))}
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 11.5, fontWeight: 700, marginTop: 6 }}>
            queued — served as seats free, in priority order
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the finiteness is the feature — an unbounded pool is a different, worse failure</Label>
        </div>
      </div>
    </div>
  );
};
