import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 18 beat 3 — what a watch owes you. A watch stream with ordinary
 * events, a BOOKMARK carrying only a resource version (optional), and then an
 * HTTP 410 where the requested history no longer exists. The wrong response —
 * guessing at what you missed — is struck through; the right one is relist and
 * rebuild.
 */

export const WatchSemantics: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const streamIn = appear(t, 0.08, 0.16);
  const bookmarkIn = appear(t, 0.2, 0.3);
  const goneIn = seg(t, 0.36, 0.5);
  const wrongIn = appear(t, 0.52, 0.62);
  const rightIn = appear(t, 0.6, 0.7);
  const footer = appear(t, 0.9, 0.97);

  const gone = goneIn > 0.5;

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
          <Label color={PALETTE.cyan} size={13}>two watch behaviours worth knowing by name — BOOKMARK and 410 Gone</Label>
        </div>

        {/* the stream */}
        <div style={{ position: 'absolute', left: 200, top: 64, width: 1040, display: 'flex', flexDirection: 'column', gap: 12, opacity: streamIn }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '10px 14px' }}>
            event: Added · rv 100
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '10px 14px' }}>
            event: Modified · rv 142
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.cyan, border: `1px solid ${PALETTE.cyan}55`, borderRadius: 10, background: `${PALETTE.cyan}05`, padding: '10px 14px', opacity: bookmarkIn }}>
            <span style={{ fontWeight: 900, color: PALETTE.cyan }}>BOOKMARK</span>
            <span style={{ color: PALETTE.muted, fontWeight: 700 }}>— no object change, just "resource version advanced to 201"</span>
            <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, fontWeight: 800, color: PALETTE.amber, border: `1px solid ${PALETTE.amber}66`, borderRadius: 999, padding: '3px 8px' }}>
              optional
            </span>
          </div>
          {gone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.bad, border: `2px solid ${PALETTE.bad}`, borderRadius: 10, background: `${PALETTE.bad}08`, padding: '12px 14px', opacity: goneIn }}>
              HTTP 410 Gone — the history you asked to resume from has expired
            </div>
          )}
        </div>

        {/* the wrong response */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 430,
            width: 640,
            borderRadius: 16,
            border: `2px solid ${PALETTE.bad}55`,
            background: '#0d1522',
            padding: '14px 20px',
            textAlign: 'center',
            opacity: wrongIn,
          }}
        >
          <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 8 }}>the wrong response</Label>
          <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink, textDecoration: 'line-through', textDecorationColor: PALETTE.bad, textDecorationThickness: 3 }}>
            guess at which events you missed
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8 }}>
            there is no way to infer what you missed
          </div>
        </div>

        {/* the right response */}
        <div
          style={{
            position: 'absolute',
            right: 200,
            top: 430,
            width: 640,
            borderRadius: 16,
            border: `2px solid ${PALETTE.good}`,
            background: `${PALETTE.good}08`,
            padding: '14px 20px',
            textAlign: 'center',
            opacity: rightIn,
          }}
        >
          <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 8 }}>the only correct response</Label>
          <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink }}>
            relist and rebuild current state
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 13, fontWeight: 800, marginTop: 8 }}>
            a bookmark lets you resume from a newer point first
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>on 410 the answer is always to rebuild — never to continue from stale assumptions</Label>
        </div>
      </div>
    </div>
  );
};
