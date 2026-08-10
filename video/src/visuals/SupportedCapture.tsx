import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 11 beat 10 — capture methods with honest verdicts. etcdctl snapshot
 * is supported and consistent; a live filesystem copy is not consistent (a
 * write lands mid-copy); kubectl export is a useful supplement that misses
 * ordering, ownership and unenumerated objects. Not presented as equally
 * valid options.
 */

export const SupportedCapture: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const cardOn = [0, 1, 2].map((_, i) => appear(t, 0.1 + i * 0.12, 0.2 + i * 0.12));
  const midCopy = seg(t, 0.46, 0.58);
  const footer = appear(t, 0.86, 0.94);

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
          <Label color={PALETTE.cyan} size={13}>three ways to capture etcd — and they are not equally valid</Label>
        </div>

        <div style={{ position: 'absolute', left: 60, top: 70, width: 1500, display: 'flex', gap: 20 }}>
          {/* 1 — etcdctl snapshot */}
          <div
            style={{
              flex: 1,
              borderRadius: 18,
              border: `2px solid ${cardOn[0] > 0.5 ? PALETTE.good : PALETTE.line}`,
              background: cardOn[0] > 0.5 ? `${PALETTE.good}06` : PALETTE.panel,
              padding: '18px 20px',
              opacity: Math.max(0.3, cardOn[0]),
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>etcdctl snapshot save</span>
              <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 900, color: PALETTE.good, border: `1px solid ${PALETTE.good}66`, borderRadius: 999, padding: '4px 12px', background: `${PALETTE.good}0c` }}>
                supported · consistent
              </span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 700, color: PALETTE.muted, lineHeight: 1.5 }}>
              a consistent point-in-time snapshot through the raft protocol — the API that exists for this
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 16, fontWeight: 900, marginTop: 'auto', paddingTop: 12 }}>
              ✓ the one to build every restore on
            </div>
          </div>

          {/* 2 — live filesystem copy */}
          <div
            style={{
              flex: 1,
              borderRadius: 18,
              border: `2px solid ${cardOn[1] > 0.5 ? PALETTE.bad : PALETTE.line}`,
              background: cardOn[1] > 0.5 ? `${PALETTE.bad}06` : PALETTE.panel,
              padding: '18px 20px',
              opacity: Math.max(0.3, cardOn[1]),
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>live filesystem copy</span>
              <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 900, color: PALETTE.bad, border: `1px solid ${PALETTE.bad}66`, borderRadius: 999, padding: '4px 12px', background: `${PALETTE.bad}0c` }}>
                not consistent
              </span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 700, color: PALETTE.muted, lineHeight: 1.5 }}>
              copying the data directory while etcd writes — a write can land mid-copy:
            </div>
            <div style={{ position: 'relative', height: 46, marginTop: 10, borderRadius: 8, border: `1px solid ${PALETTE.line}`, background: '#0c111c', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '58%', background: `${PALETTE.blue}33` }} />
              <div
                style={{
                  position: 'absolute',
                  left: '-20%',
                  top: 0,
                  bottom: 0,
                  width: 60,
                  background: `${PALETTE.amber}88`,
                  opacity: midCopy > 0.5 ? 0.8 + 0.2 * Math.sin(frame / 5) : 0,
                  transform: `translateX(${Math.min(100, midCopy * 260)}%)`,
                }}
              />
              <span style={{ position: 'absolute', left: 10, top: 14, fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.muted }}>
                snapshot cut here
              </span>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 13.5, fontWeight: 800, marginTop: 10, lineHeight: 1.4 }}>
              ✕ the resulting copy can mix states — a restore from it is a gamble
            </div>
          </div>

          {/* 3 — kubectl export */}
          <div
            style={{
              flex: 1,
              borderRadius: 18,
              border: `2px solid ${cardOn[2] > 0.5 ? PALETTE.amber : PALETTE.line}`,
              background: cardOn[2] > 0.5 ? `${PALETTE.amber}06` : PALETTE.panel,
              padding: '18px 20px',
              opacity: Math.max(0.3, cardOn[2]),
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>kubectl export</span>
              <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 900, color: PALETTE.amber, border: `1px solid ${PALETTE.amber}66`, borderRadius: 999, padding: '4px 12px', background: `${PALETTE.amber}0c` }}>
                useful supplement
              </span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 700, color: PALETTE.muted, lineHeight: 1.5 }}>
              what it misses:
              <span style={{ color: PALETTE.amber, fontWeight: 900 }}> ordering · ownership · unenumerated objects</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.ink, marginTop: 'auto', paddingTop: 12 }}>
              `kubectl get all` is not all — most object kinds are not in `all`
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 540, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>one consistent method, one inconsistent gamble, one supplement — the anchor for recovery is the snapshot, not the file copy</Label>
        </div>
      </div>
    </div>
  );
};
