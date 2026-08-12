import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 19 beat 1 — leadership is a conditional write. A Lease at the centre
 * with its three meaningful fields; several candidates watch it. The holder
 * renews, then stops; the duration elapses; candidates issue conditional
 * updates, exactly one wins, the rest observe a conflict. A conflict is a
 * normal outcome, not an error.
 */

const CANDIDATES = ['candidate A', 'candidate B', 'candidate C'];

export const LeaseElection: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const leaseIn = appear(t, 0.08, 0.16);
  const candIn = appear(t, 0.14, 0.22);
  const renewIn = appear(t, 0.2, 0.28);
  const stop = seg(t, 0.34, 0.42);
  const expiry = seg(t, 0.46, 0.58);
  const attempt = seg(t, 0.62, 0.78);
  const winner = appear(t, 0.74, 0.84);
  const footer = appear(t, 0.9, 0.97);

  const expired = expiry > 0.5;
  const holder: number = attempt > 0.5 && expired ? 2 : 0; // candidate index who wins

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
          <Label color={PALETTE.cyan} size={13}>leader election is optimistic concurrency over expiring state</Label>
        </div>

        {/* the lease */}
        <div style={{ position: 'absolute', left: 680, top: 80, width: 420, borderRadius: 20, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}08`, padding: '20px 24px', textAlign: 'center', opacity: leaseIn }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>the Lease</div>
          <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.line}`, borderRadius: 10, background: '#0d1522', padding: '10px 14px', textAlign: 'left' }}>
            holder: {expired && attempt > 0.5 ? CANDIDATES[holder] : expired ? '—' : CANDIDATES[0]}
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: PALETTE.muted, marginTop: 4 }}>last renewal ↑</div>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: PALETTE.muted, marginTop: 4 }}>duration: how long the claim is good for</div>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: PALETTE.muted, marginTop: 4 }}>resourceVersion: the conditional-write key</div>
          </div>
        </div>

        {/* the candidates */}
        <div style={{ position: 'absolute', left: 120, top: 130, display: 'flex', flexDirection: 'column', gap: 22, opacity: candIn }}>
          {CANDIDATES.map((c, i) => {
            const isHolder = !expired && i === 0;
            const won = attempt > 0.5 && expired && i === holder;
            const conflict = attempt > 0.5 && expired && i !== holder;
            let status: React.ReactNode = null;
            if (won) status = <span style={{ color: PALETTE.good, fontWeight: 900 }}>wins ✓</span>;
            else if (conflict) status = <span style={{ color: PALETTE.amber, fontWeight: 900 }}>conflict — observing</span>;
            else if (isHolder) status = <span style={{ color: PALETTE.good, fontWeight: 900 }}>holder · renewing</span>;
            return (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${isHolder || won ? PALETTE.good : PALETTE.line}`, borderRadius: 10, padding: '9px 14px', background: isHolder || won ? `${PALETTE.good}0a` : '#0d1522' }}>
                  {c}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.muted }}>{status}</span>
              </div>
            );
          })}
        </div>

        {/* the event line */}
        <div style={{ position: 'absolute', left: 120, top: 470, width: 1460, textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, opacity: renewIn, lineHeight: 1.5 }}>
            the holder renews on schedule — then stops.
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.amber, marginTop: 10, opacity: expiry, lineHeight: 1.5 }}>
            the duration elapses → the claim expires → a takeover is permitted
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.good, marginTop: 10, opacity: winner, lineHeight: 1.5 }}>
            conditional update wins once — the rest observe a conflict, and that is normal
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a conflict is a normal outcome of arbitration — not an error to be alarmed by</Label>
        </div>
      </div>
    </div>
  );
};
