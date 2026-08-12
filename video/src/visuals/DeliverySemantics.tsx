import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 14 beat 1 — delivery has semantics. One ConfigMap feeds two
 * containers: one by environment, one by projected volume. When the source is
 * updated, the environment path stays frozen at process start, while the file
 * path updates after a delay — and the application beside it keeps using the
 * old value because nothing told it to re-read. Two different failures, side
 * by side.
 */

export const DeliverySemantics: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const cmIn = appear(t, 0.06, 0.14);
  const envIn = appear(t, 0.16, 0.24);
  const fileIn = appear(t, 0.16, 0.24);
  const sourceUpdate = seg(t, 0.4, 0.52);
  const envFreeze = appear(t, 0.52, 0.62);
  const fileDelay = seg(t, 0.6, 0.78);
  const appStale = appear(t, 0.72, 0.84);
  const footer = appear(t, 0.9, 0.97);

  const updated = sourceUpdate > 0.5;
  const fileUpdated = updated && fileDelay > 0.6;

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
          <Label color={PALETTE.cyan} size={13}>a ConfigMap can reach a container two ways — and each path fails differently</Label>
        </div>

        {/* the source ConfigMap */}
        <div
          style={{
            position: 'absolute',
            left: 690,
            top: 70,
            width: 340,
            borderRadius: 16,
            border: `2px solid ${updated ? PALETTE.amber : PALETTE.good}`,
            background: updated ? `#0b111d` : `${PALETTE.good}0c`,
            padding: '16px 20px',
            textAlign: 'center',
            opacity: cmIn,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>ConfigMap</div>
          <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: updated ? PALETTE.amber : PALETTE.good, marginTop: 8 }}>
            DB_HOST = {updated ? 'v2' : 'v1'}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 8, opacity: updated ? 1 : 0 }}>
            {updated ? '← updated (the source changed)' : ''}
          </div>
        </div>

        {/* environment path */}
        <div style={{ position: 'absolute', left: 180, top: 220, width: 520, borderRadius: 18, border: `2px solid ${PALETTE.blue}55`, background: `${PALETTE.blue}08`, padding: '18px 22px', opacity: envIn }}>
          <Label color={PALETTE.blueInk} size={12} style={{ marginBottom: 12 }}>delivered by environment</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 800, border: `1px solid ${PALETTE.line}`, borderRadius: 8, padding: '8px 10px', background: '#0d1522' }}>
            container env: DB_HOST = <span style={{ color: updated ? PALETTE.bad : PALETTE.good, fontWeight: 900 }}>v1</span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 14, fontWeight: 900, marginTop: 14, opacity: envFreeze }}>
            fixed when the process starts — never changes again
          </div>
        </div>

        {/* projected file path */}
        <div style={{ position: 'absolute', left: 960, top: 220, width: 520, borderRadius: 18, border: `2px solid ${PALETTE.violet}55`, background: `${PALETTE.violet}08`, padding: '18px 22px', opacity: fileIn }}>
          <Label color={PALETTE.violet} size={12} style={{ marginBottom: 12 }}>delivered by projected volume</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 800, border: `1px solid ${PALETTE.line}`, borderRadius: 8, padding: '8px 10px', background: '#0d1522' }}>
            file: DB_HOST = <span style={{ color: fileUpdated ? PALETTE.violet : PALETTE.muted, fontWeight: 900 }}>{fileUpdated ? 'v2' : 'v1'}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: PALETTE.muted }}>{fileUpdated ? '(updated, after a delay)' : '(eventually)'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
            <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.ink, border: `1px solid ${PALETTE.violet}66`, borderRadius: 8, padding: '7px 10px', background: '#0d1522' }}>
              app reads: <span style={{ color: updated ? PALETTE.bad : PALETTE.good, fontWeight: 900 }}>v1</span>
            </span>
            <span style={{ color: PALETTE.line, fontWeight: 900 }}>→</span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 14, fontWeight: 900, marginTop: 14, opacity: appStale }}>
            still the old value — nothing told it to re-read
          </div>
        </div>

        {/* arrows from CM to paths */}
        <div style={{ position: 'absolute', left: 400, top: 195, color: PALETTE.blue, fontSize: 26, fontWeight: 900, opacity: envIn }}>↓</div>
        <div style={{ position: 'absolute', left: 1200, top: 195, color: PALETTE.violet, fontSize: 26, fontWeight: 900, opacity: fileIn }}>↓</div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', opacity: envFreeze }}>
          <Label color={PALETTE.muted} size={12.5}>two different failures — the environment never updates, the file does and the app still ignores it</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>delivery and consumption are separate problems — Kubernetes owns only the first one</Label>
        </div>
      </div>
    </div>
  );
};
