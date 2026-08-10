import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 09 beat 4 — a cache on every node. Before: every Pod on every node
 * queries CoreDNS centrally, and conntrack entries pile up on the node path.
 * After: a node-local cache absorbs most queries and the central load drops.
 * The honest annotation follows — one more cache, one more listener, one more
 * configuration surface between the application and the truth.
 */

const NODES = ['node-1', 'node-2', 'node-3'];

export const NodeLocalCache: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const beforeIn = appear(t, 0.06, 0.16);
  const ctIn = seg(t, 0.14, 0.32);
  const loadHigh = seg(t, 0.2, 0.34);
  const afterIn = appear(t, 0.38, 0.5);
  const absorb = seg(t, 0.46, 0.62);
  const loadLow = seg(t, 0.52, 0.64);
  const costIn = appear(t, 0.66, 0.76);
  const footer = appear(t, 0.82, 0.9);

  const ctCount = Math.round(2200 + ctIn * 3800);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 9);

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
      <div style={{ width: 1620, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>NodeLocal DNSCache genuinely helps — it relives CoreDNS load and conntrack pressure on the node</Label>
        </div>

        {/* BEFORE */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 56,
            width: 730,
            borderRadius: 18,
            border: `2px solid ${PALETTE.bad}55`,
            background: `${PALETTE.bad}04`,
            padding: '18px 20px',
            opacity: beforeIn,
          }}
        >
          <Label color={PALETTE.bad} size={12} style={{ marginBottom: 12 }}>before — every query, one central path</Label>

          {/* nodes on the left */}
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ width: 140 }}>
              {NODES.map((n, i) => (
                <div
                  key={n}
                  style={{
                    marginBottom: 12,
                    borderRadius: 10,
                    border: `1px solid ${PALETTE.line}`,
                    background: PALETTE.panel,
                    padding: '9px 8px',
                    textAlign: 'center',
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 800,
                    color: PALETTE.ink,
                  }}
                >
                  {n}
                  <div style={{ fontSize: 10.5, color: PALETTE.muted, fontWeight: 700 }}>▣▣▣ pods</div>
                </div>
              ))}
            </div>

            {/* query arrows */}
            <div style={{ flex: 1, position: 'relative' }}>
              {NODES.map((_, i) => (
                <div key={i} style={{ position: 'relative', height: 62 }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 26,
                      borderTop: `2px solid ${PALETTE.bad}66`,
                      opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 6 + i)),
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: 14,
                      width: 0,
                      height: 0,
                      borderLeft: '7px solid transparent',
                      borderRight: '7px solid transparent',
                      borderTop: `10px solid ${PALETTE.bad}`,
                      opacity: 0.7,
                    }}
                  />
                </div>
              ))}
              {/* conntrack entries piling up */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 96,
                  borderRadius: 10,
                  border: `1px solid ${PALETTE.amber}66`,
                  background: `${PALETTE.amber}08`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: ctIn > 0 ? 1 : 0.3,
                }}
              >
                <Label color={PALETTE.amber} size={9.5} style={{ marginBottom: 4 }}>conntrack</Label>
                <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 22, fontWeight: 900 }}>{ctCount}</div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 10.5, fontWeight: 700 }}>entries ↑</div>
              </div>
            </div>

            {/* central CoreDNS */}
            <div style={{ width: 190, textAlign: 'center' }}>
              <div
                style={{
                  borderRadius: 12,
                  border: `2px solid ${PALETTE.bad}88`,
                  background: `${PALETTE.bad}0c`,
                  padding: '14px 10px',
                  fontFamily: MONO,
                  color: PALETTE.ink,
                  fontSize: 15,
                  fontWeight: 900,
                  marginTop: 8,
                }}
              >
                CoreDNS
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 12, fontWeight: 800, marginTop: 8, opacity: Math.max(0.5, loadHigh) }}>
                load: high
              </div>
            </div>
          </div>
        </div>

        {/* AFTER */}
        <div
          style={{
            position: 'absolute',
            right: 60,
            top: 56,
            width: 730,
            borderRadius: 18,
            border: `2px solid ${PALETTE.good}66`,
            background: `${PALETTE.good}04`,
            padding: '18px 20px',
            opacity: afterIn,
          }}
        >
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 12 }}>after — a local cache on every node</Label>

          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ width: 140 }}>
              {NODES.map((n, i) => (
                <div
                  key={n}
                  style={{
                    marginBottom: 12,
                    borderRadius: 10,
                    border: `1px solid ${PALETTE.line}`,
                    background: PALETTE.panel,
                    padding: '9px 8px',
                    textAlign: 'center',
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 800,
                    color: PALETTE.ink,
                  }}
                >
                  {n}
                  <div style={{ fontSize: 10.5, color: PALETTE.muted, fontWeight: 700 }}>▣▣▣ pods</div>
                </div>
              ))}
            </div>

            {/* pods → node-local cache; node-local → CoreDNS only for misses */}
            <div style={{ flex: 1 }}>
              {NODES.map((_, i) => (
                <div key={i} style={{ position: 'relative', height: 62 }}>
                  {/* pod → cache */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: '46%',
                      top: 20,
                      borderTop: `2px solid ${PALETTE.good}`,
                      opacity: absorb > 0 ? Math.max(0.3, 0.4 + 0.6 * Math.abs(Math.sin(frame / 5 + i))) : 0.3,
                    }}
                  />
                  {/* cache → CoreDNS, only the misses */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '46%',
                      right: 0,
                      top: 34,
                      borderTop: `1px dashed ${PALETTE.good}66`,
                      opacity: Math.max(0.2, 1 - absorb * 0.75),
                    }}
                  />
                </div>
              ))}
              {/* node-local cache column */}
              <div
                style={{
                  position: 'absolute',
                  left: '42%',
                  top: 0,
                  bottom: 0,
                  width: 96,
                  borderRadius: 10,
                  border: `1px solid ${PALETTE.good}66`,
                  background: `${PALETTE.good}0a`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 13, fontWeight: 900 }}>NodeLocal</div>
                <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 13, fontWeight: 900 }}>DNSCache</div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 10, fontWeight: 700, marginTop: 4 }}>
                  absorbs most queries
                </div>
              </div>
            </div>

            <div style={{ width: 190, textAlign: 'center' }}>
              <div
                style={{
                  borderRadius: 12,
                  border: `2px solid ${PALETTE.good}66`,
                  background: `${PALETTE.good}08`,
                  padding: '14px 10px',
                  fontFamily: MONO,
                  color: PALETTE.ink,
                  fontSize: 15,
                  fontWeight: 900,
                  marginTop: 30,
                }}
              >
                CoreDNS
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 12, fontWeight: 800, marginTop: 8, opacity: Math.max(0.4, loadLow) }}>
                load: drops ↓
              </div>
            </div>
          </div>
        </div>

        {/* the honest cost — an added layer, not a downside footnote */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 470,
            width: 1500,
            borderRadius: 16,
            border: `1px solid ${PALETTE.amber}66`,
            background: `${PALETTE.amber}08`,
            padding: '16px 24px',
            opacity: costIn,
          }}
        >
          <Label color={PALETTE.amber} size={11.5} style={{ marginBottom: 8 }}>the honest cost — a strong answer names it</Label>
          <div style={{ display: 'flex', gap: 26, alignItems: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>one more cache</div>
            <span style={{ color: PALETTE.amber, fontSize: 22, fontWeight: 900 }}>·</span>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>one more listener</div>
            <span style={{ color: PALETTE.amber, fontSize: 22, fontWeight: 900 }}>·</span>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>one more config surface</div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 15, fontWeight: 800, marginTop: 8 }}>
            an added layer between the application and the truth — with every layer comes a new way to be wrong
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 656, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>it helps — and it costs: name both halves of the answer</Label>
        </div>
      </div>
    </div>
  );
};
