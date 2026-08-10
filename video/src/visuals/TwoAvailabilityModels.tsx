import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 11 beat 2 — two availability models with visibly different
 * structure. Left: API servers are identical interchangeable units behind a
 * load balancer — remove one, traffic redistributes, nothing else changes.
 * Right: etcd members are a bonded consensus group with links between them —
 * remove one and the remaining members must still agree. No load balancer in
 * front of etcd: that mistake is the beat.
 */

export const TwoAvailabilityModels: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const leftIn = appear(t, 0.08, 0.18);
  const rightIn = appear(t, 0.16, 0.26);
  const removeApiserver = seg(t, 0.28, 0.42);
  const removeEtcd = seg(t, 0.46, 0.6);
  const noteLb = seg(t, 0.6, 0.7);
  const footer = appear(t, 0.8, 0.88);

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
          <Label color={PALETTE.cyan} size={13}>two ways to be highly available — a replaceable group, and a bonded group</Label>
        </div>

        {/* LEFT — API servers, interchangeable */}
        <div style={{ position: 'absolute', left: 60, top: 56, width: 720, borderRadius: 18, border: `2px solid ${PALETTE.blue}66`, background: `${PALETTE.blue}04`, padding: '16px 20px', opacity: leftIn }}>
          <Label color={PALETTE.blue} size={13} style={{ marginBottom: 12 }}>API servers — identical, interchangeable units</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '12px 14px', textAlign: 'center' }}>
              load<br />balancer
            </div>
            <span style={{ color: PALETTE.line, fontSize: 20, fontWeight: 900 }}>→</span>
            <div style={{ flex: 1, display: 'flex', gap: 12 }}>
              {[0, 1, 2].map((i) => {
                const removed = removeApiserver > 0.5 && i === 1;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      fontFamily: MONO,
                      fontSize: 14,
                      fontWeight: 900,
                      color: PALETTE.ink,
                      border: `2px solid ${removed ? PALETTE.bad : PALETTE.blue}`,
                      borderRadius: 10,
                      background: removed ? `${PALETTE.bad}08` : `${PALETTE.blue}0c`,
                      padding: '12px 8px',
                      textAlign: 'center',
                      opacity: removed ? 0.45 : 1,
                    }}
                  >
                    api-server {i + 1}
                    {removed && <div style={{ fontSize: 12, color: PALETTE.bad, marginTop: 4 }}>✕ removed</div>}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 14, fontWeight: 800, marginTop: 12, textAlign: 'center', opacity: removeApiserver }}>
            ✓ remove one — the balancer redistributes, nothing else changes
          </div>
        </div>

        {/* the divider */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center', color: PALETTE.line, fontSize: 20, fontWeight: 900 }}>
          vs
        </div>

        {/* RIGHT — etcd, bonded consensus group */}
        <div style={{ position: 'absolute', left: 60, top: 296, width: 720, borderRadius: 18, border: `2px solid ${PALETTE.violet}66`, background: `${PALETTE.violet}04`, padding: '16px 20px', opacity: rightIn }}>
          <Label color={PALETTE.violet} size={13} style={{ marginBottom: 12 }}>etcd — a bonded consensus group</Label>
          {/* members in a linked row — bonded, not interchangeable */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {['A', 'B', 'C'].map((m, i) => {
              const dead = removeEtcd > 0.5 && i === 1;
              return (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <span
                      style={{
                        fontFamily: MONO,
                        fontWeight: 900,
                        fontSize: 20,
                        color: removeEtcd > 0.5 ? PALETTE.bad : PALETTE.violet,
                        opacity: removeEtcd > 0.5 ? 0.6 : 0.8,
                      }}
                    >
                      ↔
                    </span>
                  )}
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 14.5,
                      fontWeight: 900,
                      color: PALETTE.ink,
                      border: `2px solid ${dead ? PALETTE.bad : PALETTE.violet}`,
                      borderRadius: 10,
                      background: dead ? `${PALETTE.bad}0c` : `${PALETTE.violet}0c`,
                      padding: '12px 18px',
                      opacity: dead ? 0.45 : 1,
                    }}
                  >
                    member {m}
                    {dead && <span style={{ color: PALETTE.bad }}> ✕</span>}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          <div style={{ fontFamily: MONO, color: removeEtcd > 0.5 ? PALETTE.amber : PALETTE.violet, fontSize: 14, fontWeight: 800, textAlign: 'center', marginTop: 8, opacity: removeEtcd > 0.5 ? 1 : 0.4 }}>
            {removeEtcd > 0.5 ? 'remove one — the remaining members must still agree' : 'links between them — they must agree on every write'}
          </div>
        </div>

        {/* the lb mistake, struck through */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 610, textAlign: 'center', opacity: noteLb }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 17,
              fontWeight: 800,
              color: PALETTE.muted,
              textDecoration: 'line-through',
              textDecorationThickness: 2,
              textDecorationColor: PALETTE.bad,
            }}
          >
            add a load balancer in front of etcd
          </span>
          <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.bad, marginLeft: 14 }}>
            ✕ that mistake is the beat — consensus is not load balancing
          </span>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 656, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>replaceable units scale and shrug; bonded members must agree — different failure modes, different maths</Label>
        </div>
      </div>
    </div>
  );
};
