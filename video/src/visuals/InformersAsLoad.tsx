import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 12 beat 6 — informers as load. Left: many controllers each listing
 * independently, with request count and etcd load climbing. Right: the same
 * controllers sharing one informer cache fed by a single watch, with the
 * load collapsing. Counts on screen for both — the difference is
 * quantitative. References module three without re-explaining informers.
 */

export const InformersAsLoad: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const leftIn = appear(t, 0.08, 0.18);
  const climb = seg(t, 0.16, 0.46);
  const rightIn = appear(t, 0.5, 0.6);
  const collapse = seg(t, 0.56, 0.72);
  const footer = appear(t, 0.86, 0.94);

  // quantitative: listings per interval
  const leftRps = Math.round(400 + climb * 1800);
  const rightRps = Math.round(20 + collapse * 40);

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
      <div style={{ width: 1620, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>requests to the API are load — informers are the module 03 pattern that removes most of it</Label>
        </div>

        {/* LEFT — independent listings */}
        <div style={{ position: 'absolute', left: 60, top: 64, width: 720, borderRadius: 18, border: `2px solid ${PALETTE.bad}55`, background: `${PALETTE.bad}04`, padding: '16px 20px', opacity: leftIn }}>
          <Label color={PALETTE.bad} size={12.5} style={{ marginBottom: 12 }}>without shared informers — each controller lists itself</Label>
          <div style={{ display: 'flex', gap: 10 }}>
            {['deployment-ctl', 'job-ctl', 'hpa-ctl', 'ds-ctl'].map((c, i) => (
              <div key={c} style={{ flex: 1, fontFamily: MONO, fontSize: 12, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.bad}55`, borderRadius: 10, background: '#0d1522', padding: '10px 6px', textAlign: 'center' }}>
                {c}
              </div>
            ))}
          </div>
          <div style={{ position: 'relative', height: 60, marginTop: 12 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${12 + i * 22}%`,
                  top: 8,
                  width: 2,
                  height: 40,
                  background: `${PALETTE.bad}66`,
                  transform: `rotate(${16 - i * 4}deg)`,
                  opacity: Math.max(0.3, climb),
                }}
              />
            ))}
            <div style={{ position: 'absolute', right: 0, top: 0, fontFamily: MONO, fontSize: 13.5, fontWeight: 900, color: PALETTE.bad }}>
              {leftRps} list req/s ↗
            </div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 14, fontWeight: 800, marginTop: 8, textAlign: 'center', opacity: climb }}>
            etcd load climbing — every list is a request
          </div>
        </div>

        {/* the divider */}
        <div style={{ position: 'absolute', left: 50, top: 340, width: 1520, textAlign: 'center', color: PALETTE.line, fontSize: 22, fontWeight: 900, opacity: appear(t, 0.42, 0.5) }}>
          ▼
        </div>

        {/* RIGHT — shared informer cache */}
        <div style={{ position: 'absolute', left: 60, top: 380, width: 720, borderRadius: 18, border: `2px solid ${PALETTE.good}55`, background: `${PALETTE.good}04`, padding: '16px 20px', opacity: rightIn }}>
          <Label color={PALETTE.good} size={12.5} style={{ marginBottom: 12 }}>with shared informers — one watch, one cache, all consumers</Label>
          <div style={{ display: 'flex', gap: 10 }}>
            {['deployment-ctl', 'job-ctl', 'hpa-ctl', 'ds-ctl'].map((c) => (
              <div key={c} style={{ flex: 1, fontFamily: MONO, fontSize: 12, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.good}55`, borderRadius: 10, background: '#0d1522', padding: '10px 6px', textAlign: 'center' }}>
                {c}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 15, fontWeight: 900, border: `1px dashed ${PALETTE.good}66`, borderRadius: 10, background: `${PALETTE.good}0a`, padding: '10px 12px', display: 'inline-block' }}>
              shared informer cache ← one watch
            </div>
          </div>
          <div style={{ position: 'relative', height: 46, marginTop: 10 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 20, borderTop: `2px solid ${PALETTE.good}88` }} />
            <div style={{ position: 'absolute', left: '46%', top: 8, fontFamily: MONO, fontSize: 13.5, fontWeight: 900, color: PALETTE.good }}>
              {rightRps} watch-driven · list req/s ↘
            </div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 14, fontWeight: 800, marginTop: 8, textAlign: 'center', opacity: collapse }}>
            etcd load collapses — the API stays quiet
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the number of controllers does not change — the number of requests does, and that is the load that matters</Label>
        </div>
      </div>
    </div>
  );
};
