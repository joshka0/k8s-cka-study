import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 26 beat 6 — why a global limit is awkward. A large indexed Job where
 * a few indexes fail permanently. Under a global backoff limit the whole Job
 * fails with most work incomplete; under per-index accounting the healthy
 * indexes finish and the failures are named. Both end states show their
 * completion counts.
 */

export const PerIndexBackoff: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const globalIn = seg(t, 0.1, 0.28);
  const globalDetail = appear(t, 0.3, 0.4);
  const perIn = seg(t, 0.5, 0.66);
  const perDetail = appear(t, 0.68, 0.78);
  const footer = appear(t, 0.88, 0.94);

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
          <Label color={PALETTE.cyan} size={13}>a few permanently broken shards, a large indexed Job — two accounting styles, two end states</Label>
        </div>

        {/* global limit */}
        <div style={{ position: 'absolute', left: 100, top: 44, width: 680, borderRadius: 18, border: `2px solid ${PALETTE.bad}66`, background: `${PALETTE.bad}06`, padding: '18px 22px', opacity: globalIn }}>
          <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 12 }}>global backoff limit</Label>
          <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.5 }}>
            a handful of broken shards exhaust the whole budget
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
            <span style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted }}>broken shards: 7 · 12 · 45</span>
            <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.line }}>→</span>
            <span style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted }}>budget exhausted</span>
          </div>
          <div style={{ marginTop: 16, borderRadius: 12, background: '#0c111c', border: `1px solid ${PALETTE.bad}66`, padding: '14px 16px', textAlign: 'center', opacity: globalDetail }}>
            <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 900, color: PALETTE.bad }}>Job Failed</div>
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.muted, marginTop: 6 }}>
              most work incomplete — a few bad shards wiped unfinished indexes mid-run
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 900, color: PALETTE.bad, marginTop: 10 }}>
              completed: 12 / 50
            </div>
          </div>
        </div>

        {/* per-index */}
        <div style={{ position: 'absolute', left: 820, top: 44, width: 760, borderRadius: 18, border: `2px solid ${PALETTE.good}66`, background: `${PALETTE.good}06`, padding: '18px 22px', opacity: perIn }}>
          <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 12 }}>per-index accounting</Label>
          <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.5 }}>
            healthy indexes finish; the failures are named, not shared
          </div>
          <div style={{ marginTop: 16, borderRadius: 12, background: '#0c111c', border: `1px solid ${PALETTE.good}66`, padding: '14px 16px', textAlign: 'center', opacity: perDetail }}>
            <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 900, color: PALETTE.good }}>completed: 47 / 50</div>
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.muted, marginTop: 6 }}>
              the three broken ones are recorded by index
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 900, color: PALETTE.bad, marginTop: 10, border: `1px solid ${PALETTE.bad}55`, borderRadius: 999, display: 'inline-block', padding: '5px 14px' }}>
              failed indexes: 7 · 12 · 45
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 100, top: 420, width: 1480, opacity: perDetail }}>
          <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.amber, textAlign: 'center', lineHeight: 1.5 }}>
            the Job still ends Failed if any index is permanently failed — but you keep the completed work and a named failure set, instead of one global budget wiping unfinished indexes
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>same workload, same three broken shards — the accounting style decides how much of it survives</Label>
        </div>
      </div>
    </div>
  );
};
