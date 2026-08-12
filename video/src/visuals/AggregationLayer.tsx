import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 18 beat 1 — claiming a path. One API surface, two implementations
 * behind it. A CRD path resolves into kube-apiserver's own generic storage; an
 * aggregated path is authenticated then proxied out to a separate extension
 * server with its own storage. The proxy hop is drawn explicitly — the module
 * depends on it.
 */

export const AggregationLayer: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const surfaceIn = appear(t, 0.06, 0.14);
  const crdIn = appear(t, 0.1, 0.2);
  const aggIn = appear(t, 0.2, 0.32);
  const proxyIn = appear(t, 0.32, 0.44);
  const footer = appear(t, 0.9, 0.97);

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
          <Label color={PALETTE.cyan} size={13}>one API surface, two implementations behind it — and an explicit proxy hop</Label>
        </div>

        {/* the surface */}
        <div
          style={{
            position: 'absolute',
            left: 620,
            top: 60,
            width: 460,
            borderRadius: 16,
            border: `2px solid ${PALETTE.ink}`,
            background: `${PALETTE.ink}06`,
            padding: '14px 18px',
            textAlign: 'center',
            opacity: surfaceIn,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>the API surface — request paths</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginTop: 6 }}>authenticated by kube-apiserver</div>
        </div>

        {/* CRD path */}
        <div style={{ position: 'absolute', left: 120, top: 210, width: 560, borderRadius: 18, border: `2px solid ${PALETTE.blue}`, background: `${PALETTE.blue}06`, padding: '18px 22px', opacity: crdIn }}>
          <Label color={PALETTE.blueInk} size={12} style={{ marginBottom: 10 }}>a CRD path (e.g. cows.example/v1)</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, borderRadius: 10, border: `1px solid ${PALETTE.blue}55`, background: '#0d1522', padding: '10px 12px' }}>
              <div style={{ fontFamily: MONO, fontWeight: 900, color: PALETTE.blue, fontSize: 13.5 }}>kube-apiserver</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 4 }}>generic storage + generic behaviour</div>
            </div>
            <span style={{ color: PALETTE.blue, fontWeight: 900 }}>→</span>
            <div style={{ flex: 1, borderRadius: 10, border: `1px solid ${PALETTE.line}`, background: '#0d1522', padding: '10px 12px' }}>
              <div style={{ fontFamily: MONO, fontWeight: 900, color: PALETTE.ink, fontSize: 13.5 }}>storage</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 4 }}>the shared store</div>
            </div>
          </div>
        </div>

        {/* aggregated path */}
        <div style={{ position: 'absolute', right: 100, top: 210, width: 640, borderRadius: 18, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}06`, padding: '18px 22px', opacity: aggIn }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 10 }}>an aggregated path (an APIService)</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, borderRadius: 10, border: `1px solid ${PALETTE.line}`, background: '#0d1522', padding: '10px 12px' }}>
              <div style={{ fontFamily: MONO, fontWeight: 900, color: PALETTE.ink, fontSize: 13.5 }}>kube-apiserver</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 4 }}>authenticates, then proxies</div>
            </div>
            <span style={{ color: PALETTE.good, fontWeight: 900, opacity: proxyIn }}>⇢ proxy</span>
            <div style={{ flex: 1, borderRadius: 10, border: `2px solid ${PALETTE.good}`, background: '#0d1522', padding: '10px 12px', opacity: proxyIn }}>
              <div style={{ fontFamily: MONO, fontWeight: 900, color: PALETTE.good, fontSize: 13.5 }}>extension API server</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 4 }}>its own storage · its own subresources</div>
            </div>
          </div>
        </div>

        {/* the dividing arrow down */}
        <div style={{ position: 'absolute', left: 850, top: 140, color: PALETTE.line, fontSize: 30, fontWeight: 900, opacity: surfaceIn }}>↓</div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: aggIn }}>
          <Label color={PALETTE.amber} size={13}>the proxy hop is the whole difference — a CRD stays inside the generic server; an aggregated path leaves it</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>APIService claims a group+version path — requests there are proxied, not stored, by kube-apiserver</Label>
        </div>
      </div>
    </div>
  );
};
