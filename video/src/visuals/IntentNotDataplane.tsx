import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 15 beat 1 — the object is not the proxy. Routing objects on one side,
 * a proxy data plane on the other, and a controller as the only thing joining
 * them. Remove the controller: the objects remain, perfectly valid, and no
 * traffic moves. The gap where the controller was is the image to land.
 */

export const IntentNotDataplane: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const objectsIn = appear(t, 0.08, 0.16);
  const ctrlIn = appear(t, 0.14, 0.22);
  const proxyIn = appear(t, 0.14, 0.22);
  const joined = appear(t, 0.2, 0.3);
  const removed = seg(t, 0.42, 0.56);
  const stillValid = appear(t, 0.54, 0.64);
  const noTraffic = appear(t, 0.6, 0.7);
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
      <div style={{ width: 1660, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>Ingress and Gateway API describe intent — they do not forward packets</Label>
        </div>

        {/* routing objects */}
        <div style={{ position: 'absolute', left: 120, top: 110, width: 400, borderRadius: 18, border: `2px solid ${PALETTE.blue}`, background: `${PALETTE.blue}08`, padding: '18px 20px', textAlign: 'center', opacity: objectsIn }}>
          <Label color={PALETTE.blueInk} size={12} style={{ marginBottom: 12 }}>routing objects</Label>
          {['Ingress', 'GatewayClass → Gateway', 'HTTPRoute'].map((o) => (
            <div key={o} style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.blue}55`, borderRadius: 8, padding: '8px 10px', marginBottom: 8, background: '#0d1522' }}>
              {o}
            </div>
          ))}
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginTop: 8 }}>
            intent — valid records, nothing more
          </div>
        </div>

        {/* the controller */}
        <div
          style={{
            position: 'absolute',
            left: 620,
            top: 220,
            width: 300,
            borderRadius: 18,
            border: `2px solid ${removed > 0.5 ? PALETTE.line : PALETTE.good}`,
            background: removed > 0.5 ? `${PALETTE.line}0a` : `${PALETTE.good}0c`,
            padding: '18px 20px',
            textAlign: 'center',
            opacity: ctrlIn,
          }}
        >
          {removed > 0.5 ? (
            <>
              <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 28, fontWeight: 900 }}>— ∅ —</div>
              <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 15, fontWeight: 900, marginTop: 8 }}>the controller is gone</div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>the controller</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8 }}>
                observes the objects and configures a real proxy
              </div>
            </>
          )}
        </div>

        {/* the proxy data plane */}
        <div style={{ position: 'absolute', left: 1020, top: 110, width: 420, borderRadius: 18, border: `2px solid ${PALETTE.violet}`, background: `${PALETTE.violet}08`, padding: '18px 20px', textAlign: 'center', opacity: proxyIn }}>
          <Label color={PALETTE.violet} size={12} style={{ marginBottom: 12 }}>proxy data plane</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.violet}55`, borderRadius: 8, padding: '8px 10px', background: '#0d1522' }}>real traffic forwarding</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginTop: 8 }}>the thing that actually moves packets</div>
        </div>

        {/* arrows */}
        <div style={{ position: 'absolute', left: 534, top: 250, color: removed > 0.5 ? PALETTE.line : PALETTE.good, fontSize: 28, fontWeight: 900, opacity: joined }}>→</div>
        <div style={{ position: 'absolute', left: 934, top: 250, color: removed > 0.5 ? PALETTE.line : PALETTE.good, fontSize: 28, fontWeight: 900, opacity: joined }}>→</div>

        {/* without the controller */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900, opacity: stillValid }}>
            without the controller the objects remain — <span style={{ color: PALETTE.good }}>perfectly valid</span> …
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 17, fontWeight: 900, marginTop: 10, opacity: noTraffic }}>
            … and <span style={{ color: PALETTE.bad }}>no traffic moves</span> — the inert-record trap
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a controller is the only thing joining the objects to a data plane — remove it and acceptance means nothing</Label>
        </div>
      </div>
    </div>
  );
};
