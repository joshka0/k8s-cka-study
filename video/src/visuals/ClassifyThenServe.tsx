import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 12 beat 3 — FlowSchema and PriorityLevelConfiguration are two
 * stages with a clear handover. A FlowSchema change alters only which bucket
 * a request lands in; a PriorityLevelConfiguration change alters only how
 * that bucket is served. The independence is the beat.
 */

const BUCKETS = [
  { name: 'workload-high', seats: 30, queue: 'fair · limited', color: PALETTE.cyan },
  { name: 'system', seats: 8, queue: 'strict · no drop', color: PALETTE.violet },
  { name: 'workload-low', seats: 6, queue: 'shallow · drops first', color: PALETTE.amber },
];

export const ClassifyThenServe: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const sceneIn = appear(t, 0.08, 0.16);
  const bucketsIn = appear(t, 0.16, 0.26);
  const fsChange = seg(t, 0.28, 0.42);
  const plcChange = seg(t, 0.48, 0.62);
  const footer = appear(t, 0.84, 0.92);

  const reqColor = fsChange > 0.5 ? PALETTE.violet : PALETTE.cyan;

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
          <Label color={PALETTE.cyan} size={13}>two objects, one handover — FlowSchema picks the bucket, PriorityLevelConfiguration runs the bucket</Label>
        </div>

        <div style={{ position: 'absolute', left: 80, top: 80, display: 'flex', alignItems: 'center', gap: 36, opacity: sceneIn }}>
          {/* FLOWSCHEMA — the classifier */}
          <div style={{ width: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Label color={PALETTE.cyan} size={12.5}>FlowSchema — sorts requests into buckets</Label>
              {fsChange > 0.5 && (
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 900, color: PALETTE.cyan, border: `1px solid ${PALETTE.cyan}66`, borderRadius: 999, padding: '4px 10px' }}>
                  only this changed
                </span>
              )}
            </div>

            {/* a request getting reclassified */}
            <div style={{ borderRadius: 12, border: `2px solid ${reqColor}`, background: `${reqColor}0c`, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15.5, fontWeight: 900 }}>request from workload B</div>
              <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: reqColor, marginTop: 6 }}>
                {fsChange > 0.5 ? 'FlowSchema edit → now lands in system' : 'normally classified into workload-high'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['workload-high', 'system', 'workload-low'].map((b, i) => (
                <div
                  key={b}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontFamily: MONO,
                    fontSize: 14.5,
                    fontWeight: 900,
                    color: PALETTE.ink,
                    border: `1px solid ${i === 1 && fsChange > 0.5 ? PALETTE.violet : PALETTE.line}`,
                    borderRadius: 10,
                    background: i === 1 && fsChange > 0.5 ? `${PALETTE.violet}0c` : '#0d1522',
                    padding: '10px 14px',
                  }}
                >
                  <span style={{ color: BUCKETS[i].color }}>▣</span> {b}
                  {i === 1 && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontFamily: MONO,
                        fontSize: 12,
                        fontWeight: 900,
                        color: fsChange > 0.5 ? PALETTE.violet : PALETTE.muted,
                        opacity: fsChange > 0.5 ? 1 : 0.3,
                      }}
                    >
                      ← request now lands here
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <span style={{ fontFamily: MONO, color: PALETTE.line, fontSize: 26, fontWeight: 900 }}>→</span>

          {/* PRIORITYLEVELCONFIGURATION — the server */}
          <div style={{ width: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Label color={PALETTE.violet} size={12.5}>PriorityLevelConfiguration — runs each bucket</Label>
              {plcChange > 0.5 && (
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 900, color: PALETTE.violet, border: `1px solid ${PALETTE.violet}66`, borderRadius: 999, padding: '4px 10px' }}>
                  only this changed
                </span>
              )}
            </div>

            {BUCKETS.map((b, i) => (
              <div
                key={b.name}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${i === 0 && plcChange > 0.5 ? PALETTE.amber : PALETTE.line}`,
                  background: i === 0 && plcChange > 0.5 ? `${PALETTE.amber}0a` : '#0d1522',
                  padding: '12px 16px',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15.5, fontWeight: 900 }}>{b.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: PALETTE.muted, marginTop: 3 }}>
                    {plcChange > 0.5 && i === 0
                      ? 'seats lowered to 12 — queuing behaviour changed'
                      : `seats ${b.seats} · ${b.queue}`}
                  </div>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color: i === 0 && plcChange > 0.5 ? PALETTE.amber : b.color }}>
                  {plcChange > 0.5 && i === 0 ? 'edited ⚠' : 'steady'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* the independence verdict */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 520,
            width: 1460,
            borderRadius: 16,
            border: `1px solid ${PALETTE.amber}66`,
            background: `${PALETTE.amber}08`,
            padding: '14px 22px',
            textAlign: 'center',
            opacity: appear(t, 0.62, 0.72),
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>
            one FlowSchema edit moved a request between buckets — the bucket's serving never changed. One PriorityLevelConfiguration edit changed serving — no request moved.
            <span style={{ color: PALETTE.amber }}> They are independent objects.</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>classification and serving are two separate policies — changing one must never silently change the other</Label>
        </div>
      </div>
    </div>
  );
};
