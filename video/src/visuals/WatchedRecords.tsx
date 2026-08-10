import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 09 beat 8 — answers from a watch. The kubernetes plugin holds a
 * local view fed by a watch and answers from that view, not from the API.
 * The watch stalls: the API's state moves on, the view freezes, and queries
 * keep being answered — confidently and wrongly. A resolved name points at
 * something that is already gone: green, and wrong, at the same time.
 */

export const WatchedRecords: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const sceneIn = appear(t, 0.06, 0.14);
  const watchFlow = seg(t, 0.12, 0.24);
  const answerGood = seg(t, 0.2, 0.3);
  const stall = seg(t, 0.34, 0.46);
  const apiMoves = seg(t, 0.4, 0.5);
  const viewFrozen = seg(t, 0.46, 0.56);
  const queryStale = seg(t, 0.54, 0.68);
  const footer = appear(t, 0.82, 0.9);

  const pulse = 0.55 + 0.45 * Math.sin(frame / 8);

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
      <div style={{ width: 1620, height: 660, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>the kubernetes plugin does not query the API per request — it synthesises records from a watched view</Label>
        </div>

        {/* the whole scene */}
        <div style={{ position: 'absolute', left: 60, top: 84, width: 1500, display: 'flex', gap: 40, alignItems: 'flex-start', opacity: sceneIn }}>
          {/* API server state */}
          <div style={{ width: 360 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, textAlign: 'center', border: `2px solid ${PALETTE.blue}`, borderRadius: 14, background: `${PALETTE.blue}0c`, padding: '12px 10px' }}>
              API server
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, border: `1px solid ${PALETTE.line}`, borderRadius: 8, background: '#0d1522', padding: '9px 12px', marginBottom: 6 }}>
                pay-svc · 10.0.0.16 ✓
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 14.5,
                  fontWeight: 800,
                  color: apiMoves > 0.5 ? PALETTE.bad : PALETTE.ink,
                  border: `1px solid ${apiMoves > 0.5 ? PALETTE.bad : PALETTE.line}`,
                  borderRadius: 8,
                  background: apiMoves > 0.5 ? `${PALETTE.bad}0a` : '#0d1522',
                  padding: '9px 12px',
                  textDecoration: apiMoves > 0.5 ? 'line-through' : 'none',
                  textDecorationThickness: 2,
                }}
              >
                old-pay · deleted just now
              </div>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginTop: 8, textAlign: 'center', opacity: apiMoves }}>
              the API's state moves on
            </div>
          </div>

          {/* the watch */}
          <div style={{ width: 170, alignSelf: 'center', textAlign: 'center', marginTop: 40 }}>
            <div
              style={{
                width: 3,
                height: 220,
                margin: '0 auto',
                background: stall > 0.5 ? PALETTE.bad : PALETTE.good,
                opacity: stall > 0.5 ? 0.55 : 0.3 + 0.7 * Math.abs(Math.sin(frame / 8)),
                boxShadow: stall > 0.5 ? `0 0 14px ${PALETTE.bad}` : `0 0 12px ${PALETTE.good}`,
              }}
            />
            {stall > 0.5 && (
              <div style={{ position: 'absolute', left: 78, top: 150, fontFamily: MONO, color: PALETTE.bad, fontSize: 36, fontWeight: 900, opacity: 0.6 + 0.4 * pulse }}>
                ✕
              </div>
            )}
            <Label color={stall > 0.5 ? PALETTE.bad : PALETTE.good} size={11} style={{ marginTop: 6 }}>
              {stall > 0.5 ? 'watch stalled' : 'watch'}
            </Label>
          </div>

          {/* the plugin and its local view */}
          <div style={{ width: 480 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, textAlign: 'center', border: `2px solid ${PALETTE.violet}`, borderRadius: 14, background: `${PALETTE.violet}0c`, padding: '12px 10px' }}>
              kubernetes plugin — local view
            </div>
            <div
              style={{
                marginTop: 12,
                border: `1px solid ${PALETTE.violet}55`,
                borderRadius: 12,
                background: '#0c111c',
                padding: '12px 14px',
                opacity: viewFrozen > 0.5 ? 0.75 : 1,
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, borderBottom: `1px solid ${PALETTE.line}`, padding: '8px 6px' }}>
                pay-svc → 10.0.0.16
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 14.5,
                  fontWeight: 800,
                  color: viewFrozen > 0.5 ? PALETTE.amber : PALETTE.ink,
                  padding: '8px 6px',
                }}
              >
                old-pay → 10.0.0.99
                {viewFrozen > 0.5 && <span style={{ color: PALETTE.amber, fontWeight: 900 }}>  ← frozen here</span>}
              </div>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 13, fontWeight: 800, textAlign: 'center', marginTop: 8, opacity: viewFrozen }}>
              the view freezes — it never saw the delete
            </div>
          </div>

          {/* the query and the answer */}
          <div style={{ width: 400, marginTop: 40 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900, border: `1px solid ${PALETTE.cyan}66`, borderRadius: 10, background: `${PALETTE.cyan}0a`, padding: '10px 14px', textAlign: 'center', opacity: watchFlow > 0 ? 1 : 0.4 }}>
              query: dig old-pay
            </div>
            <div
              style={{
                marginTop: 14,
                borderRadius: 12,
                border: `2px solid ${queryStale > 0.5 ? PALETTE.good : PALETTE.line}`,
                background: queryStale > 0.5 ? `${PALETTE.good}0c` : PALETTE.panel,
                padding: '14px 16px',
                textAlign: 'center',
                opacity: queryStale > 0.5 ? 1 : 0.5,
              }}
            >
              <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 20, fontWeight: 900 }}>
                {queryStale > 0.5 ? '10.0.0.99 ✓' : '…'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8 }}>
                <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 14, fontWeight: 900 }}>answered</span>
                {queryStale > 0.5 && (
                  <span style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 14, fontWeight: 900, opacity: 0.6 + 0.4 * pulse }}>
                    but stale — the Service is gone
                  </span>
                )}
              </div>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 13, fontWeight: 800, textAlign: 'center', marginTop: 10, opacity: queryStale }}>
              green, and wrong, at the same time
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 580, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a stalled watch does not look like a DNS outage — it looks like stale records, answering confidently and wrongly</Label>
        </div>
      </div>
    </div>
  );
};
