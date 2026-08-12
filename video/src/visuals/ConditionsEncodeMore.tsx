import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 25 beat 4 — Ready, serving, terminating. One EndpointSlice with
 * endpoints in different condition combinations, each annotated with what a
 * data plane does about it. Membership comes from the Service selector, not
 * from the conditions; the conditions then distinguish ready, serving and
 * terminating. The terminating-but-serving endpoint is called out explicitly,
 * because it is the one people do not expect.
 */

const ENDPOINTS = [
  {
    ip: '10.0.0.11:8080',
    ready: true,
    serving: true,
    term: false,
    what: 'in use — receives traffic',
    color: PALETTE.good,
  },
  {
    ip: '10.0.0.12:8080',
    ready: false,
    serving: false,
    term: false,
    what: 'present but not ready — excluded',
    color: PALETTE.amber,
  },
  {
    ip: '10.0.0.13:8080',
    ready: false,
    serving: false,
    term: true,
    what: 'terminating — no new traffic',
    color: PALETTE.line,
  },
  {
    ip: '10.0.0.14:8080',
    ready: true,
    serving: true,
    term: true,
    what: 'terminating but still serving — lets graceful shutdown drain',
    color: PALETTE.cyan,
    hot: true,
  },
];

export const ConditionsEncodeMore: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const sliceIn = appear(t, 0.06, 0.14);
  const rowOn = ENDPOINTS.map((_, i) => appear(t, 0.16 + i * 0.12, 0.23 + i * 0.12));
  const hot = appear(t, 0.7, 0.8);
  const footer = appear(t, 0.88, 0.94);

  const Cell = ({ label, v }: { label: string; v: boolean }) => (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 800, color: PALETTE.muted }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: v ? PALETTE.good : PALETTE.bad, marginTop: 4 }}>
        {v ? '✓' : '✕'}
      </div>
    </div>
  );

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
          <Label color={PALETTE.cyan} size={13}>EndpointSlice conditions encode more than presence — ready, serving, terminating</Label>
        </div>

        {/* the slice */}
        <div style={{ position: 'absolute', left: 160, top: 48, width: 1360, borderRadius: 18, border: `2px solid ${PALETTE.blue}66`, background: `${PALETTE.blue}06`, padding: '18px 22px', opacity: sliceIn }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Label color={PALETTE.blueInk} size={11.5}>Service · EndpointSlice</Label>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: PALETTE.muted }}>
              membership: Service selector / managed Endpoints — not the conditions
            </span>
          </div>
          <div style={{ display: 'flex', gap: 14, flexDirection: 'column' }}>
            {ENDPOINTS.map((e, i) => {
              const hot = (e as { hot?: boolean }).hot;
              return (
                <div
                  key={e.ip}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 12,
                    border: `${hot ? 2 : 1}px solid ${e.color}${hot ? 'FF' : '66'}`,
                    background: hot ? `${PALETTE.cyan}10` : '#0d1522',
                    padding: '10px 16px',
                    opacity: rowOn[i],
                    boxShadow: hot ? `0 0 24px ${PALETTE.cyan}22` : 'none',
                  }}
                >
                  <div style={{ flex: '0 0 200px', fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.ink }}>{e.ip}</div>
                  <Cell label="ready" v={e.ready} />
                  <Cell label="serving" v={e.serving} />
                  <Cell label="terminating" v={e.term} />
                  <div style={{ flex: 1, fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: e.color, textAlign: 'right' }}>
                    {e.what}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* the unexpected combination */}
        <div
          style={{
            position: 'absolute',
            left: 160,
            top: 470,
            width: 1360,
            borderRadius: 14,
            border: `2px solid ${PALETTE.amber}`,
            background: `${PALETTE.amber}0a`,
            padding: '14px 20px',
            textAlign: 'center',
            opacity: hot,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink }}>
            terminating but still serving — that combination is what lets a graceful shutdown drain
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.amber, marginTop: 6 }}>
            membership alone tells you an address exists, not that anything will use it
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 664, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>an endpoint can be present and not ready · it can be terminating and still serving — read the conditions</Label>
        </div>
      </div>
    </div>
  );
};
