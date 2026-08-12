import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 18 beat 4 — what registering costs you. The API request path with an
 * extension server inserted, and the four new dependencies marked along it:
 * latency, TLS, request-header trust, proxy behaviour. Then a failure degrades
 * discovery for an unrelated client. The blast radius beyond your own API is
 * the beat.
 */

const COSTS = [
  { name: 'latency', note: 'every matching request waits on the extension server', color: PALETTE.blue },
  { name: 'TLS', note: 'a TLS handshake joins the path', color: PALETTE.cyan },
  { name: 'request-header trust', note: 'trust is granted to the proxy', color: PALETTE.violet },
  { name: 'proxy behaviour', note: 'kube-apiserver proxies, it cannot answer for you', color: PALETTE.amber },
];

export const AggregationCost: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const costOn = COSTS.map((_, i) => appear(t, 0.1 + i * 0.06, 0.17 + i * 0.06));
  const pathIn = appear(t, 0.06, 0.14);
  const degradeIn = seg(t, 0.5, 0.66);
  const footer = appear(t, 0.9, 0.97);

  const degraded = degradeIn > 0.5;

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
      <div style={{ width: 1700, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>registering an APIService adds four dependencies to the request path</Label>
        </div>

        {/* the path */}
        <div style={{ position: 'absolute', left: 100, top: 90, width: 1500, display: 'flex', alignItems: 'center', gap: 12, opacity: pathIn }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.ink}66`, borderRadius: 10, padding: '10px 12px', background: '#0d1522' }}>
            client
          </div>
          <span style={{ color: PALETTE.line, fontWeight: 900 }}>→</span>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.blue}66`, borderRadius: 10, padding: '10px 12px', background: '#0d1522' }}>
            kube-apiserver (auth + proxy)
          </div>
          <span style={{ color: PALETTE.amber, fontWeight: 900 }}>⇢</span>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `2px solid ${PALETTE.amber}`, borderRadius: 10, padding: '10px 12px', background: `${PALETTE.amber}08` }}>
            extension API server
          </div>
        </div>

        {/* the four costs attached */}
        <div style={{ position: 'absolute', left: 100, top: 220, width: 1500, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {COSTS.map((c, i) => {
            const on = costOn[i];
            return (
              <div
                key={c.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  borderRadius: 12,
                  border: `2px solid ${on > 0.5 ? c.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${c.color}08` : '#101826',
                  padding: '12px 16px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 16, fontWeight: 900, color: c.color }}>+{i + 1}</span>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, width: 200, flex: '0 0 200px' }}>{c.name}</div>
                <div style={{ flex: 1, fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, lineHeight: 1.4 }}>{c.note}</div>
              </div>
            );
          })}
        </div>

        {/* the blast radius */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 490,
            width: 1300,
            borderRadius: 18,
            border: `2px solid ${degraded ? PALETTE.bad : PALETTE.line}`,
            background: degraded ? `${PALETTE.bad}06` : '#0d1522',
            padding: '16px 24px',
            textAlign: 'center',
            opacity: degradeIn,
          }}
        >
          <Label color={degraded ? PALETTE.bad : PALETTE.muted} size={12.5} style={{ marginBottom: 8 }}>
            the blast radius beyond your own API
          </Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>
            {degraded
              ? 'a failure in your extension server degrades discovery for clients that never wanted your API at all'
              : 'a slow or down extension server degrades discovery for everyone'}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>kube-apiserver proxies rather than stores, so it cannot answer on your behalf</Label>
        </div>
      </div>
    </div>
  );
};
