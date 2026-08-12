import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 15 beat 2 — valid, and serving nothing. An HTTPRoute accepted by the
 * API, then its status block expanded: parents, conditions, resolved or not.
 * The same object in two states — accepted-and-attached versus
 * accepted-and-unattached — identical in spec, different only in status.
 * Status is where the answer lives.
 */

export const AcceptedNotServed: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const lhsIn = appear(t, 0.08, 0.16);
  const rhsIn = appear(t, 0.2, 0.28);
  const statusIn = appear(t, 0.3, 0.4);
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
      <div style={{ width: 1680, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>the API accepting the object is not the controller serving it — the status block holds the answer</Label>
        </div>

        {/* the shared spec */}
        <div
          style={{
            position: 'absolute',
            left: 390,
            top: 56,
            width: 900,
            borderRadius: 14,
            border: `2px solid ${PALETTE.blue}`,
            background: `${PALETTE.blue}08`,
            padding: '12px 18px',
            textAlign: 'center',
            opacity: lhsIn,
          }}
        >
          <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>
            HTTPRoute — spec: path /api · backend: my-svc:80
          </span>
          <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 13, fontWeight: 800, marginLeft: 14 }}>accepted by the API ✓</span>
        </div>

        {/* two states */}
        <div style={{ position: 'absolute', left: 140, top: 170, width: 680, borderRadius: 18, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}08`, padding: '18px 22px', opacity: lhsIn }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 10 }}>state A — accepted + attached</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700 }}>identical spec</div>
          <div style={{ marginTop: 12, border: `1px solid ${PALETTE.good}55`, borderRadius: 10, background: '#0d1522', padding: '12px 14px' }}>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.good }}>status.controllers → "accepted"</div>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.good, marginTop: 6 }}>parentRef → attached ✓</div>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.muted, marginTop: 6 }}>resolved: True</div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 10 }}>
            a listener serves this route
          </div>
        </div>

        <div style={{ position: 'absolute', left: 860, top: 170, width: 680, borderRadius: 18, border: `2px solid ${PALETTE.bad}`, background: `${PALETTE.bad}06`, padding: '18px 22px', opacity: rhsIn }}>
          <Label color={PALETTE.bad} size={12} style={{ marginBottom: 10 }}>state B — accepted, unattached</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700 }}>identical spec — accepted the same way</div>
          <div style={{ marginTop: 12, border: `1px solid ${PALETTE.bad}55`, borderRadius: 10, background: '#0d1522', padding: '12px 14px' }}>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.good }}>status.controllers → "accepted"</div>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.bad, marginTop: 6 }}>parentRef → not attached ✕</div>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.muted, marginTop: 6 }}>resolved: False</div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 13.5, fontWeight: 800, marginTop: 10 }}>
            nothing serves it — the object is inert
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: statusIn }}>
          <Label color={PALETTE.amber} size={13}>the two are identical in spec — only status distinguishes them, and only a controller writes it</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>read the parents and conditions, because API acceptance and controller implementation are two different events</Label>
        </div>
      </div>
    </div>
  );
};
