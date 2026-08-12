import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 23 beat 3 — review what the API will see. Three stages with the
 * artefact reviewed at each: values or overlay, rendered objects, runtime
 * status. The rendered objects are the only stage that shows what the API
 * receives — a values diff can produce a surprising rendered diff because the
 * template between them can do anything.
 */

const STAGES = [
  {
    n: '1',
    name: 'values / overlay',
    artefact: 'the small input diff',
    review: 'what you changed — but not what the API sees',
    color: PALETTE.blue,
  },
  {
    n: '2',
    name: 'rendered objects',
    artefact: 'the payload the API receives',
    review: 'the ONLY stage that shows the real payload',
    color: PALETTE.amber,
    hot: true,
  },
  {
    n: '3',
    name: 'runtime status',
    artefact: 'status · events',
    review: 'verify reconciliation separately',
    color: PALETTE.good,
  },
];

export const ReviewPayload: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const stageOn = STAGES.map((_, i) => appear(t, 0.08 + i * 0.14, 0.16 + i * 0.14));
  const template = appear(t, 0.52, 0.64);
  const footer = appear(t, 0.86, 0.93);

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
      <div style={{ width: 1680, height: 740, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>the order for reviewing a declarative change — render first, then apply, then verify</Label>
        </div>

        {/* the three stages */}
        <div style={{ position: 'absolute', left: 80, top: 56, width: 1520, display: 'flex', gap: 20 }}>
          {STAGES.map((s, i) => {
            const hot = (s as { hot?: boolean }).hot;
            const on = stageOn[i];
            const color = hot ? PALETTE.amber : s.color;
            return (
              <div
                key={s.n}
                style={{
                  flex: 1,
                  borderRadius: 18,
                  border: `2px solid ${color}`,
                  background: hot ? `${PALETTE.amber}12` : `${color}08`,
                  boxShadow: hot ? `0 0 30px ${PALETTE.amber}30` : 'none',
                  padding: '20px 22px',
                  opacity: on,
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: color, border: `1px solid ${color}`, borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.n}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 900, color: PALETTE.ink }}>{s.name}</span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.ink, marginBottom: 6 }}>{s.artefact}</div>
                <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: hot ? PALETTE.amber : PALETTE.muted, lineHeight: 1.4 }}>
                  {s.review}
                </div>
                {hot && (
                  <div style={{ position: 'absolute', top: -16, right: 18, fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.amber, border: `2px solid ${PALETTE.amber}`, borderRadius: 999, background: '#0b111d', padding: '5px 12px' }}>
                    shows what the API sees
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* the template gap */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 330,
            width: 1520,
            borderRadius: 16,
            border: `2px dashed ${PALETTE.bad}55`,
            background: `${PALETTE.bad}04`,
            padding: '18px 22px',
            opacity: template,
          }}
        >
          <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 12 }}>reviewing a values file is not reviewing the change</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ flex: 1, fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink }}>
              values diff: <span style={{ color: PALETTE.good }}>+replicas: 3</span>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 900, color: PALETTE.bad }}>→</span>
            <span style={{ flex: 1, fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.muted }}>the template between them can do anything</span>
            <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 900, color: PALETTE.bad }}>→</span>
            <div style={{ flex: 1, fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.bad }}>
              rendered diff: <span style={{ color: PALETTE.bad }}>a resource you never touched</span>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 80, top: 520, width: 1520, opacity: template }}>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.amber, lineHeight: 1.5 }}>
            render the objects first and read them — that is the payload the API will actually receive.
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>then apply, then verify reconciliation through status and events</Label>
        </div>
      </div>
    </div>
  );
};
