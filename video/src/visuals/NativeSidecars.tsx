import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 26 beat 4 — why a Job with a sidecar can finish. Native sidecars are
 * init containers with restartPolicy Always: they start before the main
 * containers, keep running alongside them, and the kubelet stops them once
 * the main containers finish. That lets the Job complete. The old shape — a
 * plain sidecar that keeps running — is shown beside it as the problem this
 * was designed to remove.
 */

export const NativeSidecars: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const nativeIn = appear(t, 0.08, 0.18);
  const nativeFlow = seg(t, 0.22, 0.5);
  const oldIn = appear(t, 0.56, 0.66);
  const footer = appear(t, 0.88, 0.94);

  const nativeStage = Math.min(3, Math.floor(nativeFlow * 4));

  const stages = [
    'sidecar starts first',
    'main container runs and exits',
    'sidecar is stopped by the kubelet',
    'Job completes',
  ];

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
          <Label color={PALETTE.cyan} size={13}>native sidecars let a Job finish — the old shape never does</Label>
        </div>

        {/* native sidecar outcome */}
        <div style={{ position: 'absolute', left: 100, top: 48, width: 760, borderRadius: 18, border: `2px solid ${PALETTE.good}66`, background: `${PALETTE.good}06`, padding: '18px 22px', opacity: nativeIn }}>
          <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 10 }}>native sidecar · init + restartPolicy: Always</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stages.map((s, i) => (
              <div
                key={s}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  borderRadius: 10,
                  border: `1px solid ${i === nativeStage ? PALETTE.good : PALETTE.line}`,
                  background: i <= nativeStage ? `${PALETTE.good}0c` : '#0d1522',
                  padding: '10px 14px',
                  opacity: i <= nativeStage ? 1 : 0.35,
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 900, color: i < nativeStage ? PALETTE.good : PALETTE.amber }}>{i < nativeStage ? '✓' : '•'}</span>
                <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 900, color: PALETTE.good, marginTop: 12 }}>
            the kubelet stops the sidecar once the main containers finish
          </div>
        </div>

        {/* the old shape */}
        <div style={{ position: 'absolute', left: 900, top: 48, width: 680, borderRadius: 18, border: `2px solid ${PALETTE.bad}66`, background: `${PALETTE.bad}06`, padding: '18px 22px', opacity: oldIn }}>
          <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 10 }}>the old shape · a plain sidecar</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderRadius: 10, border: `1px solid ${PALETTE.bad}66`, background: '#0d1522', padding: '12px 14px' }}>
            <div style={{ flex: 1, fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.4 }}>
              the proxy keeps running after the main container exits
            </div>
          </div>
          <div style={{ marginTop: 12, borderRadius: 10, border: `1px solid ${PALETTE.bad}66`, background: '#0c111c', padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 900, color: PALETTE.bad }}>⟳ Job never finishes</div>
            <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 6 }}>
              the never-exiting sidecar kept a Job running forever
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 100, top: 486, width: 1480, opacity: appear(t, 0.72, 0.8) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1, fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.amber, textAlign: 'center', lineHeight: 1.5 }}>
              the only difference is how the sidecar is declared — and that is the difference between finishing and never finishing
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 656, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>two outcomes from one difference — native sidecars were designed exactly to remove this class of hang</Label>
        </div>
      </div>
    </div>
  );
};
