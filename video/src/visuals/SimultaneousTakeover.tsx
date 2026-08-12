import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 19 beat 3 — two candidates, one winner. Both issue the same
 * conditional update against one Lease at the same moment. Exactly one write
 * lands; the other is rejected with a conflict, sees the Lease is now held by
 * somebody else, and reverts cleanly to following. The API's own consistency
 * does the arbitration.
 */

export const SimultaneousTakeover: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const leaseIn = appear(t, 0.08, 0.16);
  const candIn = appear(t, 0.14, 0.22);
  const fire = seg(t, 0.4, 0.5);
  const resolveIn = appear(t, 0.5, 0.62);
  const footer = appear(t, 0.9, 0.97);

  const both = fire > 0.5;

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
          <Label color={PALETTE.cyan} size={13}>both decide the Lease has expired and update at the same moment — one write lands</Label>
        </div>

        {/* the two candidates */}
        <div style={{ position: 'absolute', left: 120, top: 110, display: 'flex', flexDirection: 'column', gap: 40, opacity: candIn }}>
          {[0, 1].map((i) => {
            const wins = both && i === 0;
            const loses = both && i === 1;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${wins ? PALETTE.good : PALETTE.line}`, borderRadius: 10, padding: '11px 16px', background: wins ? `${PALETTE.good}0a` : '#0d1522' }}>
                  candidate {i === 0 ? 'A' : 'B'}
                </span>
                <span style={{ color: PALETTE.amber, fontSize: 22, fontWeight: 900, opacity: both ? 1 : 0.3 }}>
                  {i === 0 ? '→' : '→'}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted, opacity: both ? 1 : 0.3 }}>
                  {i === 0 ? 'conditional update (rv=42)' : 'conditional update (rv=42)'}
                </span>
              </div>
            );
          })}
        </div>

        {/* the lease */}
        <div style={{ position: 'absolute', left: 700, top: 140, width: 380, borderRadius: 20, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}08`, padding: '20px 24px', textAlign: 'center', opacity: leaseIn }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>the Lease</div>
          <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 14.5, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '10px 14px', textAlign: 'left' }}>
            holder: {both ? 'candidate A' : 'A or B'}
            <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: PALETTE.muted, marginTop: 4 }}>resourceVersion: conditional on 42</div>
            <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: PALETTE.muted, marginTop: 4 }}>duration: expired → takeover permitted</div>
          </div>
        </div>

        {/* the outcome line */}
        <div style={{ position: 'absolute', left: 200, top: 460, width: 1280, textAlign: 'center', opacity: resolveIn }}>
          <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.good, lineHeight: 1.5 }}>
            one conditional update lands — candidate A holds it now
          </div>
          <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.amber, marginTop: 10, lineHeight: 1.5 }}>
            candidate B receives a conflict → sees it held by A → <span style={{ color: PALETTE.good }}>reverts cleanly to following</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>no coordination protocol beyond the API's own consistency — that consistency is the referee</Label>
        </div>
      </div>
    </div>
  );
};
