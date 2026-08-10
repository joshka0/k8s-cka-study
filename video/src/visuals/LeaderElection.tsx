import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 11 beat 5 — leases, not consensus. Three scheduler replicas: one
 * holds a Lease and does the work, two are idle but ready. The Lease
 * expires; another replica acquires it and becomes active. Contrasted
 * explicitly against the etcd group beside it — one active writer versus a
 * majority agreeing. Three models on screen: replaceable, consensus,
 * leader-elected.
 */

export const LeaderElection: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const sceneIn = appear(t, 0.08, 0.16);
  const leaseHold = seg(t, 0.12, 0.24);
  const expire = seg(t, 0.3, 0.42);
  const acquire = seg(t, 0.44, 0.58);
  const contrast = seg(t, 0.62, 0.72);
  const models = appear(t, 0.76, 0.84);
  const footer = appear(t, 0.88, 0.94);

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
          <Label color={PALETTE.cyan} size={13}>leader election is not consensus — one active writer, chosen by lease, not by a majority vote</Label>
        </div>

        {/* the three replicas */}
        <div style={{ position: 'absolute', left: 60, top: 80, width: 900, borderRadius: 18, border: `2px solid ${PALETTE.cyan}55`, background: `${PALETTE.cyan}03`, padding: '16px 20px', opacity: sceneIn }}>
          <Label color={PALETTE.cyan} size={12.5} style={{ marginBottom: 14 }}>scheduler replicas — three processes, one doing the work</Label>

          <div style={{ display: 'flex', gap: 16 }}>
            {[0, 1, 2].map((i) => {
              const active = (expire > 0.5 ? i === 1 : i === 0) && leaseHold > 0.1;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    border: `2px solid ${active ? PALETTE.good : PALETTE.line}`,
                    background: active ? `${PALETTE.good}0c` : '#0d1522',
                    padding: '12px 14px',
                    textAlign: 'center',
                    boxShadow: active ? `0 0 20px ${PALETTE.good}33` : 'none',
                  }}
                >
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>scheduler-{i + 1}</div>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 13,
                      fontWeight: 800,
                      color: active ? PALETTE.good : PALETTE.muted,
                      marginTop: 8,
                    }}
                  >
                    {active ? '● active — doing the work' : '○ idle but ready'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* the lease */}
          <div
            style={{
              marginTop: 16,
              borderRadius: 12,
              border: `2px solid ${expire > 0.5 ? PALETTE.bad : PALETTE.amber}`,
              background: expire > 0.5 ? `${PALETTE.bad}0c` : `${PALETTE.amber}0c`,
              padding: '12px 16px',
              textAlign: 'center',
              opacity: leaseHold > 0.1 ? 1 : 0.5,
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: expire > 0.5 ? PALETTE.bad : PALETTE.amber }}>
              {expire > 0.5
                ? `✕ Lease expired — scheduler-2 renews it and becomes active`
                : `Lease — held by ${leaseHold > 0.1 ? (expire > 0.5 ? 'scheduler-2' : 'scheduler-1') : '…'}, renewed by heartbeat`}
            </span>
            {expire > 0.5 && (
              <span style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted, marginLeft: 12 }}>
                {acquire > 0.5 ? 'acquired' : 'renewal in flight'}
              </span>
            )}
          </div>

          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 14, fontWeight: 800, marginTop: 12, textAlign: 'center', opacity: acquire }}>
            ✓ one active writer — the others wait, heartbeat-ready to take over
          </div>
        </div>

        {/* the contrast — etcd beside it */}
        <div style={{ position: 'absolute', right: 60, top: 80, width: 540, borderRadius: 18, border: `2px solid ${PALETTE.violet}55`, background: `${PALETTE.violet}03`, padding: '16px 20px', opacity: contrast }}>
          <Label color={PALETTE.violet} size={12.5} style={{ marginBottom: 14 }}>etcd beside it — consensus</Label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {['A', 'B', 'C'].map((m) => (
              <div key={m} style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.ink, border: `2px solid ${PALETTE.violet}`, borderRadius: 10, background: `${PALETTE.violet}0c`, padding: '12px 16px' }}>
                member {m}
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 14, fontWeight: 800, textAlign: 'center', marginTop: 14, opacity: contrast }}>
            a majority must agree on every write — different mechanism entirely
          </div>
        </div>

        {/* three models on screen */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 540,
            width: 1500,
            display: 'flex',
            gap: 14,
            opacity: models,
          }}
        >
          {[
            { label: 'replaceable', detail: 'API servers — the balancer just picks another' },
            { label: 'consensus', detail: 'etcd — members must agree' },
            { label: 'leader-elected', detail: 'schedulers — one holds the lease' },
          ].map((m, i) => (
            <div
              key={m.label}
              style={{
                flex: 1,
                borderRadius: 14,
                border: `1px solid ${PALETTE.line}`,
                background: '#0d1522',
                padding: '14px 18px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 18, fontWeight: 900 }}>{i + 1}. {m.label}</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6 }}>{m.detail}</div>
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 646, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>three models in one cluster — know which one each component uses before you debug its failure</Label>
        </div>
      </div>
    </div>
  );
};
