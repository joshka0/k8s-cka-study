import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 08 beat 3 — when the Service steps out. Two queries against the same
 * backends. Left, a normal ClusterIP: one virtual address returned, traffic
 * through the data plane, spread across backends. Right, clusterIP None: the
 * full list of Pod addresses returned to the client, no data plane, and the
 * client choosing — selection depends on the resolver and the application.
 * CORRECTION applied: "client picks the first" is not shown as universal; the
 * client visibly chooses.
 */

const BACKENDS = ['10.0.0.16', '10.0.0.17', '10.0.0.18'];

export const HeadlessService: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const leftIn = appear(t, 0.08, 0.16);
  const rightIn = appear(t, 0.18, 0.26);
  const vip = seg(t, 0.14, 0.2);
  const spread = seg(t, 0.22, 0.32);
  const listIn = seg(t, 0.3, 0.42);
  const clientChoice = seg(t, 0.44, 0.6);
  const enableCost = appear(t, 0.6, 0.68);
  const footer = appear(t, 0.78, 0.86);

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
      <div style={{ width: 1620 }}>
        <div style={{ textAlign: 'center', marginBottom: 30, opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>clusterIP: None removes the Service virtual IP — the Service steps out of the traffic path</Label>
        </div>

        <div style={{ display: 'flex', gap: 26, justifyContent: 'center' }}>
          {/* LEFT — normal ClusterIP */}
          <div
            style={{
              width: 780,
              borderRadius: 20,
              border: `2px solid ${PALETTE.blue}77`,
              background: `${PALETTE.blue}08`,
              padding: '22px 24px',
              opacity: leftIn,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <Label color={PALETTE.blue} size={12.5}>normal Service — ClusterIP</Label>
              <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800 }}>spec.clusterIP: 10.0.0.1</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 210, textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>query: my-svc</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-block',
                    fontFamily: MONO,
                    color: PALETTE.cyan,
                    fontSize: 24,
                    fontWeight: 900,
                    border: `2px solid ${PALETTE.cyan}`,
                    borderRadius: 14,
                    background: `${PALETTE.cyan}10`,
                    padding: '12px 22px',
                    opacity: vip > 0 ? 1 : 0.3,
                  }}
                >
                  DNS → 10.0.0.1
                </div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6 }}>
                  one virtual address returned
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 18 }}>
              <div style={{ width: 210, flex: '0 0 auto', textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: MONO,
                    color: PALETTE.violet,
                    fontSize: 16,
                    fontWeight: 900,
                    border: `2px solid ${PALETTE.violet}`,
                    borderRadius: 12,
                    background: `${PALETTE.violet}10`,
                    padding: '10px 14px',
                  }}
                >
                  data plane
                </div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>
                  traffic passes through
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around' }}>
                {BACKENDS.map((ip, i) => (
                  <div key={ip} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: spread > 0.25 + i * 0.04 ? 19 : 19,
                        fontWeight: 900,
                        color: spread > 0.25 + i * 0.04 ? PALETTE.good : PALETTE.line,
                        opacity: spread > 0.25 + i * 0.04 ? 1 : 0.3,
                      }}
                    >
                      ➜
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        color: PALETTE.ink,
                        fontSize: 16,
                        fontWeight: 800,
                        border: `1px solid ${PALETTE.line}`,
                        borderRadius: 10,
                        background: '#0d1522',
                        padding: '8px 12px',
                        marginTop: 2,
                      }}
                    >
                      {ip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 13.5, fontWeight: 800, textAlign: 'center', marginTop: 14, opacity: spread }}>
              spread across backends — the data plane balances them
            </div>
          </div>

          {/* RIGHT — clusterIP None */}
          <div
            style={{
              width: 780,
              borderRadius: 20,
              border: `2px solid ${PALETTE.amber}88`,
              background: `${PALETTE.amber}08`,
              padding: '22px 24px',
              opacity: rightIn,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <Label color={PALETTE.amber} size={12.5}>headless Service — clusterIP: None</Label>
              <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800 }}>no virtual IP · no data plane</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 210, flex: '0 0 auto', textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>query: my-svc</div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    border: `1px solid ${PALETTE.amber}77`,
                    borderRadius: 14,
                    background: '#0c111c',
                    padding: '12px 16px',
                    opacity: listIn > 0 ? 1 : 0.4,
                  }}
                >
                  <Label color={PALETTE.amber} size={10.5} style={{ marginBottom: 6 }}>DNS returns endpoint records — the full list</Label>
                  {BACKENDS.map((ip, i) => (
                    <div
                      key={ip}
                      style={{
                        fontFamily: MONO,
                        color: PALETTE.ink,
                        fontSize: 16,
                        fontWeight: 800,
                        opacity: listIn > 0.15 + i * 0.1 ? 1 : 0.3,
                      }}
                    >
                      {ip}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 14,
                    fontFamily: MONO,
                    fontSize: 14.5,
                    fontWeight: 800,
                    color: PALETTE.cyan,
                    border: `1px solid ${PALETTE.cyan}66`,
                    borderRadius: 12,
                    background: `${PALETTE.cyan}0d`,
                    padding: '10px 14px',
                    opacity: clientChoice,
                  }}
                >
                  client chooses — which entry depends on the resolver and the application
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
              <div
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: `1px solid ${PALETTE.good}66`,
                  background: `${PALETTE.good}0c`,
                  padding: '12px 16px',
                  opacity: enableCost,
                }}
              >
                <Label color={PALETTE.good} size={10.5} style={{ marginBottom: 4 }}>enables</Label>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>
                  stable per-Pod names — StatefulSet DNS is built on this
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: `1px solid ${PALETTE.bad}66`,
                  background: `${PALETTE.bad}0c`,
                  padding: '12px 16px',
                  opacity: enableCost,
                }}
              >
                <Label color={PALETTE.bad} size={10.5} style={{ marginBottom: 4 }}>costs</Label>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>
                  no balancing — the client owns the choice
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 28, opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>same backends, two answers — with a headless Service, the client becomes part of the load-balancing decision</Label>
        </div>
      </div>
    </div>
  );
};
