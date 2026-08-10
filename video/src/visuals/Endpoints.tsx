import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Horizontal, Label, SANS, MONO, Dot } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Shared pilot component; module 08 beat 2 extends it. The pilot beat has no
 * `module` prop and renders exactly as before; module 08 renders the extended
 * version — readiness as a condition, not a gate on membership.
 *
 * CORRECTION applied: membership comes from label matching, not readiness.
 * The unready address stays INSIDE the EndpointSlice with ready:false, and
 * the data plane declines to use it. Flip it ready and traffic reaches it —
 * list first, traffic second.
 */
export const Endpoints: React.FC<VisualProps> = ({ module }) => {
  if (module?.module.number === 8) return <ModuleEndpoints />;
  return <PilotEndpoints />;
};

/** The pilot beat — unchanged. */
const PilotEndpoints: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const ready = appear(t, 0.06, 0.18);
  const signal = seg(t, 0.2, 0.34);
  const row = seg(t, 0.34, 0.5);
  const pull = seg(t, 0.52, 0.7);
  const emptyCase = seg(t, 0.74, 0.9);

  const nodes = ['kube-proxy · node-1', 'kube-proxy · node-2', 'kube-proxy · node-3'];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* top: pod reports ready, signal up */}
      <Horizontal center gap={30} style={{ marginTop: 20, alignItems: 'flex-end' }}>
        <Box pad={14} borderColor={PALETTE.good} style={{ width: 200, textAlign: 'center' }}>
          <Label color={PALETTE.cyan} size={11}>pod</Label>
          <Horizontal center gap={8}>
            <Dot color={PALETTE.good} />
            <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 24, fontWeight: 900 }}>Ready</span>
          </Horizontal>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13 }}>10.0.0.16</div>
        </Box>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: PALETTE.cyan, fontSize: 20 }}>
          <span style={{ opacity: signal > 0 ? signal : 0 }}>▲</span>
          <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, opacity: appear(t, 0.14, 0.22) }}>report</span>
        </div>
        <Box pad={14} borderColor={PALETTE.blue} style={{ width: 230, textAlign: 'center' }}>
          <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>EndpointSlice controller</div>
        </Box>
      </Horizontal>

      {/* endpointslice object gains a row */}
      <Box pad={16} borderColor={PALETTE.blue} style={{ width: 760, margin: '34px auto 0', textAlign: 'center' }}>
        <Label color={PALETTE.blue} size={12}>Service · EndpointSlice</Label>
        <div style={{ fontFamily: MONO, fontSize: 17, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', color: PALETTE.muted }}>
            <span>ready backends</span>
            <span>ip</span>
          </div>
          {row > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: `${PALETTE.good}1f`,
                border: `1px solid ${PALETTE.good}`,
                borderRadius: 8,
                color: PALETTE.good,
                fontWeight: 800,
                opacity: row,
                translate: `${(1 - row) * 0}px ${(1 - row) * -20}px`,
              }}
            >
              <span>↳ ready</span>
              <span>10.0.0.16:8080</span>
            </div>
          )}
        </div>
      </Box>

      {/* three nodes pulling the object down */}
      <Horizontal center gap={16} style={{ marginTop: 34, justifyContent: 'center' }}>
        {nodes.map((n, i) => (
          <div key={n} style={{ opacity: appear(t, 0.5 + i * 0.06, 0.56 + i * 0.06), transform: `translateY(${(1 - pull) * -16 * (i % 2 ? 1 : -1)}px)` }}>
            <Box pad={12} borderColor={PALETTE.violet} style={{ width: 280, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 800 }}>{n}</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13 }}>↓ reads EndpointSlice</div>
            </Box>
          </div>
        ))}
      </Horizontal>

      {/* empty endpoints case — kept in flow; absolute right-positioning put it
          outside the frame, and the beat has room for it below the node row. */}
      <div
        style={{
          margin: '34px auto 0',
          width: 'fit-content',
          border: `2px solid ${PALETTE.amber}`,
          borderRadius: 16,
          background: `${PALETTE.amber}12`,
          padding: '14px 26px',
          textAlign: 'center',
          opacity: emptyCase,
        }}
      >
        <Label color={PALETTE.amber} size={11}>no ready backends</Label>
        <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 16, fontWeight: 800, marginTop: 4 }}>
          EndpointSlice empty (0 rows)
        </div>
      </div>
    </div>
  );
};

/**
 * Module 08 beat 2 — labels select, readiness conditions. Three Pods whose
 * labels match the Service; all three addresses live in the EndpointSlice.
 * Readiness only flips each row's condition — the unready address stays in
 * the slice while the data plane declines it.
 */
const PODS = [
  { name: 'pod-a', ip: '10.0.0.16:8080', ready: true },
  { name: 'pod-b', ip: '10.0.0.17:8080', ready: true },
  { name: 'pod-c', ip: '10.0.0.18:8080', ready: false },
];

const ModuleEndpoints: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const podsIn = appear(t, 0.06, 0.13);
  const matchLabel = appear(t, 0.12, 0.18);
  const sliceIn = appear(t, 0.16, 0.24);
  const allListed = seg(t, 0.2, 0.3);
  const dataPlaneIn = appear(t, 0.3, 0.38);
  const decline = seg(t, 0.38, 0.48);
  const flip = seg(t, 0.5, 0.62);
  const trafficC = seg(t, 0.58, 0.7);
  const pubNote = appear(t, 0.7, 0.78);
  const footer = appear(t, 0.82, 0.9);

  const declined = decline > 0.5 && flip < 0.5;

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
      <div style={{ width: 1620, height: 740, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>label matching decides membership · readiness decides use — a readiness probe changes a condition, not an address</Label>
        </div>

        {/* the three Pods */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 44,
            display: 'flex',
            justifyContent: 'center',
            gap: 36,
            opacity: podsIn,
          }}
        >
          {PODS.map((p, i) => {
            const isThird = i === 2;
            // One readiness value, one threshold. Two thresholds (0.3 and 0.5)
            // left a window where the Pod card claimed ready:true while the data
            // plane below declined the same endpoint as ready:false — three
            // renderings of one fact, disagreeing on screen.
            const readyNow = isThird ? flip > 0.5 : p.ready;
            const nowReady = readyNow;
            return (
              <div key={p.name} style={{ width: 300, textAlign: 'center' }}>
                <div
                  style={{
                    border: `2px solid ${readyNow ? PALETTE.good : PALETTE.amber}`,
                    borderRadius: 16,
                    background: readyNow ? `${PALETTE.good}0d` : `${PALETTE.amber}0f`,
                    padding: '16px 18px',
                    boxShadow: readyNow ? `0 0 18px ${PALETTE.good}33` : `0 0 18px ${PALETTE.amber}33`,
                  }}
                >
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>{p.name}</div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 700, marginTop: 4 }}>{p.ip}</div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginTop: 10,
                      fontFamily: MONO,
                      fontSize: 16,
                      fontWeight: 900,
                      color: readyNow ? PALETTE.good : PALETTE.amber,
                    }}
                  >
                    <Dot color={readyNow ? PALETTE.good : PALETTE.amber} />
                    ready: {readyNow ? 'true' : 'false'}
                  </div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                    labels: app=api
                  </div>
                </div>
                {isThird && (
                  <div style={{ marginTop: 10, minHeight: 20 }}>
                    {flip > 0.3 ? (
                      <Label color={PALETTE.good} size={11} style={{ textTransform: 'none', letterSpacing: 0 }}>
                        readiness flips → condition changes
                      </Label>
                    ) : (
                      <Label color={PALETTE.amber} size={11} style={{ textTransform: 'none', letterSpacing: 0 }}>
                        unready — condition, not exclusion
                      </Label>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* label-match arrows into the slice */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 226, opacity: matchLabel }}>
          <Label color={PALETTE.muted} size={11} style={{ textAlign: 'center', textTransform: 'none', letterSpacing: 0 }}>
            all three match the Service selector → all three are members
          </Label>
          {allListed > 0 && (
            <div style={{ textAlign: 'center', fontFamily: MONO, color: PALETTE.cyan, fontSize: 22, fontWeight: 900, marginTop: 2 }}>
              ↓ ↓ ↓
            </div>
          )}
        </div>

        {/* the EndpointSlice — all three addresses inside, ready per row */}
        <div
          style={{
            position: 'absolute',
            left: 260,
            top: 300,
            width: 1100,
            border: `2px solid ${PALETTE.blue}`,
            borderRadius: 18,
            background: `${PALETTE.blue}0c`,
            padding: '16px 20px',
            opacity: sliceIn,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Label color={PALETTE.blue} size={12}>Service · EndpointSlice</Label>
            <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700 }}>
              membership: label match — not readiness
            </span>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            {PODS.map((p, i) => {
              const isThird = i === 2;
              const readyNow = isThird ? flip > 0.5 : p.ready; // same threshold as the Pod card
              return (
                <div
                  key={p.name}
                  style={{
                    flex: 1,
                    border: `1px solid ${readyNow ? PALETTE.good : PALETTE.amber}88`,
                    borderRadius: 12,
                    background: readyNow ? `${PALETTE.good}12` : `${PALETTE.amber}12`,
                    padding: '14px 16px',
                    textAlign: 'center',
                    opacity: allListed > 0 ? 1 : 0.35,
                  }}
                >
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>{p.ip}</div>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 15,
                      fontWeight: 900,
                      marginTop: 8,
                      color: readyNow ? PALETTE.good : PALETTE.amber,
                    }}
                  >
                    ready: {readyNow ? 'true' : 'false'}
                  </div>
                  {isThird && !readyNow && (
                    <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.amber, marginTop: 6 }}>
                      inside the slice — unready
                    </div>
                  )}
                  {isThird && readyNow && (
                    <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.good, marginTop: 6 }}>
                      condition flipped — still the same address
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* the data plane — declines the unready endpoint until it flips */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 540,
            width: 1220,
            border: `2px solid ${PALETTE.violet}`,
            borderRadius: 18,
            background: `${PALETTE.violet}0a`,
            padding: '14px 20px',
            opacity: dataPlaneIn,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>Service data plane</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                routes to ready endpoints only
              </div>
            </div>
            <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around', alignItems: 'center' }}>
              {PODS.map((p, i) => {
                const isThird = i === 2;
                const reached = isThird ? trafficC > 0.5 : true;
                const declinedNow = isThird ? declined : false;
                return (
                  <div key={p.name} style={{ textAlign: 'center', width: 300 }}>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 20,
                        fontWeight: 900,
                        color: declinedNow ? PALETTE.amber : reached ? PALETTE.good : PALETTE.line,
                        opacity: reached || declinedNow ? 1 : 0.3,
                      }}
                    >
                      {declinedNow ? '↷ no traffic' : reached ? '➜ traffic' : '·'}
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 13,
                        fontWeight: 800,
                        color: declinedNow ? PALETTE.amber : reached ? PALETTE.good : PALETTE.muted,
                        marginTop: 4,
                      }}
                    >
                      {declinedNow ? 'declined — ready:false' : reached ? 'accepted — ready:true' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* publishNotReadyAddresses note */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 670, textAlign: 'center', opacity: pubNote }}>
          <Label color={PALETTE.muted} size={12}>
            publishNotReadyAddresses: true — the only thing that tells the data plane to use unready endpoints
          </Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 706, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>list first, traffic second — a readiness probe never adds or removes an address, it changes a condition</Label>
        </div>
      </div>
    </div>
  );
};
