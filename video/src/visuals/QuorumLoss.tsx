import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 11 beat 6 — quorum loss behind a green front. Three healthy API
 * servers behind a load balancer, all green, all accepting connections —
 * and a degraded etcd group below them without a majority. A write passes
 * the API servers and dies at the storage layer. Every API server stays
 * green throughout. The green front and the failed write together are the
 * beat.
 */

export const QuorumLoss: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const frontIn = appear(t, 0.08, 0.16);
  const etcdIn = appear(t, 0.14, 0.24);
  const writeIn = seg(t, 0.24, 0.4);
  const die = seg(t, 0.38, 0.54);
  const footer = appear(t, 0.8, 0.88);

  const pulse = 0.55 + 0.45 * Math.sin(frame / 8);

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
          <Label color={PALETTE.cyan} size={13}>everything in front is green — and every write dies behind it</Label>
        </div>

        {/* the green front */}
        <div style={{ position: 'absolute', left: 160, top: 56, width: 1300, borderRadius: 18, border: `2px solid ${PALETTE.good}55`, background: `${PALETTE.good}04`, padding: '14px 20px 18px', opacity: frontIn }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14.5, fontWeight: 900, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '10px 12px', textAlign: 'center' }}>
              load<br />balancer
            </div>
            <span style={{ color: PALETTE.line, fontSize: 20, fontWeight: 900 }}>→</span>
            <div style={{ flex: 1, display: 'flex', gap: 12 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    fontFamily: MONO,
                    fontSize: 14.5,
                    fontWeight: 900,
                    color: PALETTE.ink,
                    border: `2px solid ${PALETTE.good}`,
                    borderRadius: 10,
                    background: `${PALETTE.good}0c`,
                    padding: '12px 8px',
                    textAlign: 'center',
                    boxShadow: `0 0 16px ${PALETTE.good}33`,
                  }}
                >
                  api-server {i + 1}
                  <div style={{ fontSize: 11.5, color: PALETTE.good, marginTop: 4, opacity: 0.5 + 0.5 * pulse }}>● healthy — accepting connections</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* the write path */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', opacity: writeIn }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, border: `1px solid ${PALETTE.cyan}66`, borderRadius: 999, background: `${PALETTE.cyan}0a`, padding: '10px 20px' }}>
            client write <span style={{ color: PALETTE.line }}>→</span> accepted by an API server ✓ <span style={{ color: PALETTE.line }}>→</span> etcd
          </div>
        </div>

        {/* the degraded etcd group */}
        <div style={{ position: 'absolute', left: 160, top: 320, width: 1300, borderRadius: 18, border: `2px solid ${PALETTE.bad}66`, background: `${PALETTE.bad}04`, padding: '16px 20px', opacity: etcdIn }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Label color={PALETTE.bad} size={12.5}>etcd below — no majority</Label>
            <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 14, fontWeight: 900 }}>3 members · only 1 healthy · quorum 2</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'member A', dead: false },
              { label: 'member B', dead: true },
              { label: 'member C', dead: true },
            ].map((m, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 15,
                    fontWeight: 900,
                    color: PALETTE.ink,
                    border: `2px solid ${m.dead ? PALETTE.bad : PALETTE.good}`,
                    borderRadius: 10,
                    background: m.dead ? `${PALETTE.bad}0c` : `${PALETTE.good}0c`,
                    padding: '12px 8px',
                  }}
                >
                  {m.label}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 800, color: m.dead ? PALETTE.bad : PALETTE.good, marginTop: 6 }}>
                  {m.dead ? '✕ lost' : '● alive'}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 14,
              borderRadius: 10,
              border: `1px solid ${PALETTE.bad}66`,
              background: `${PALETTE.bad}0c`,
              padding: '12px 16px',
              textAlign: 'center',
              fontFamily: MONO,
              fontSize: 16.5,
              fontWeight: 900,
              color: PALETTE.bad,
              opacity: die,
            }}
          >
            ✕ the write dies at the storage layer — no majority to record it
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 800, textAlign: 'center', marginTop: 10, opacity: die }}>
            every API server still green — the failure is behind the healthy front
          </div>
        </div>

        {/* the verdict card */}
        <div
          style={{
            position: 'absolute',
            left: 160,
            top: 592,
            width: 1300,
            borderRadius: 16,
            border: `1px solid ${PALETTE.amber}66`,
            background: `${PALETTE.amber}08`,
            padding: '14px 22px',
            textAlign: 'center',
            opacity: appear(t, 0.5, 0.62),
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>
            health checks pass · load balancer passes · the write still fails — <span style={{ color: PALETTE.amber }}>the green front is real, and so is the failed write</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>quorum loss hides behind green — the store, not the front, is where the write needs to land</Label>
        </div>
      </div>
    </div>
  );
};
