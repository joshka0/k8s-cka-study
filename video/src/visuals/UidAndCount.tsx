import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 26 beat 2 — UID and restart count. Two timelines side by side: one
 * Pod keeping its UID while restartCount increments, one Pod replaced by a
 * new object with a fresh UID. Both UIDs are on screen; the difference is the
 * whole check — two fields separate the two cases with no guesswork.
 */

export const UidAndCount: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const leftIn = appear(t, 0.08, 0.16);
  const rightIn = appear(t, 0.4, 0.5);
  const footer = appear(t, 0.86, 0.94);

  const inc = seg(t, 0.2, 0.36);
  const replace = seg(t, 0.5, 0.62);

  const rcSteps = [1, 2, 3, 4];
  const activeRc = Math.min(rcSteps.length - 1, Math.floor(inc * rcSteps.length));

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
          <Label color={PALETTE.cyan} size={13}>one field separates the two cases — the same UID, or a fresh one</Label>
        </div>

        {/* left timeline: same UID */}
        <div style={{ position: 'absolute', left: 110, top: 48, width: 720, opacity: leftIn }}>
          <div style={{ borderRadius: 18, border: `2px solid ${PALETTE.violet}66`, background: `${PALETTE.violet}06`, padding: '18px 22px' }}>
            <Label color={PALETTE.violet} size={11.5} style={{ marginBottom: 12 }}>same Pod keeps its UID</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontSize: 14.5, fontWeight: 900, color: PALETTE.ink, background: '#0c111c', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ color: PALETTE.muted }}>uid:</span><span style={{ color: PALETTE.violet }}>a3f2-…-91de</span>
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              {rcSteps.map((rc, i) => (
                <div key={rc} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {i > 0 && <span style={{ color: PALETTE.line, fontSize: 16, fontWeight: 900 }}>→</span>}
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 14.5,
                      fontWeight: 900,
                      color: i === activeRc ? PALETTE.violet : PALETTE.muted,
                      border: `1px solid ${i === activeRc ? PALETTE.violet : PALETTE.line}`,
                      borderRadius: 8,
                      background: i === activeRc ? `${PALETTE.violet}14` : '#0d1522',
                      padding: '7px 10px',
                      textAlign: 'center',
                    }}
                  >
                    rc: {rc}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.amber, marginTop: 12 }}>
              the kubelet restarted a container in the existing sandbox — same UID, higher rc
            </div>
          </div>
        </div>

        {/* right timeline: replaced object */}
        <div style={{ position: 'absolute', left: 860, top: 48, width: 700, opacity: rightIn }}>
          <div style={{ borderRadius: 18, border: `2px solid ${PALETTE.blue}66`, background: `${PALETTE.blue}06`, padding: '18px 22px' }}>
            <Label color={PALETTE.blueInk} size={11.5} style={{ marginBottom: 12 }}>the Pod replaced by a new object</Label>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 900, color: PALETTE.line, textDecoration: 'line-through', opacity: 0.5 }}>
                uid: a3f2-…-91de
              </div>
              <span style={{ color: PALETTE.line, fontSize: 16, fontWeight: 900 }}>→</span>
              <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 900, color: PALETTE.blue, background: '#0c111c', borderRadius: 10, padding: '8px 12px' }}>
                uid: e7b8-…-02cf
              </div>
            </div>

            <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.5, opacity: replace > 0 ? 1 : 0.4 }}>
              a new Pod object entirely — created by a controller because desired replicas were missing
            </div>

            <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.amber, lineHeight: 1.4 }}>
              then ownerReferences and events name which controller did it
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', opacity: appear(t, 0.66, 0.74) }}>
          <Label color={PALETTE.amber} size={13}>two fields separate the two cases — UID and restart count — and neither requires guesswork</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', opacity: appear(t, 0.72, 0.8) }}>
          <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: PALETTE.ink }}>
            <span style={{ color: PALETTE.violet }}>same UID, higher rc</span> = kubelet restarting a container · <span style={{ color: PALETTE.blue }}>fresh UID</span> = a new Pod from a controller
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>read the UID first — it tells you whether anything above the container ever happened</Label>
        </div>
      </div>
    </div>
  );
};
