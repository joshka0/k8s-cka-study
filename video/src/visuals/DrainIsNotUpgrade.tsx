import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 13 beat 5 — drain protects, it does not upgrade. A node being drained:
 * Pods leaving, node cordoned, while the node's version label sits unchanged
 * throughout. Then a separate step that actually changes the node's
 * configuration and binaries. Two actions, drawn as two actions.
 */

export const DrainIsNotUpgrade: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const nodeIn = appear(t, 0.08, 0.16);
  const podsLeave = appear(t, 0.2, 0.34);
  const versionHold = appear(t, 0.34, 0.44);
  const changeIn = appear(t, 0.5, 0.62);
  const footer = appear(t, 0.88, 0.95);

  const version = 'v1.28.3'; // unchanged across the whole drain

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
      <div style={{ width: 1640, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>draining evacuates the workload and cordons the node — it changes nothing about the node itself</Label>
        </div>

        {/* the drained node */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 110,
            width: 700,
            borderRadius: 22,
            border: `2px solid ${PALETTE.violet}`,
            background: `${PALETTE.violet}0c`,
            padding: '22px 24px',
            opacity: nodeIn,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>worker-node-1</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 14,
                  fontWeight: 900,
                  color: PALETTE.ink,
                  border: `2px solid ${PALETTE.good}`,
                  borderRadius: 999,
                  background: `${PALETTE.good}0c`,
                  padding: '5px 12px',
                  opacity: versionHold,
                }}
              >
                {version} <span style={{ color: PALETTE.good }}>— unchanged</span>
              </span>
            </span>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 15, fontWeight: 900, marginBottom: 14 }}>
            cordoned — the scheduler will not place new Pods here
          </div>
          {/* pods leaving */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: podsLeave }}>
            {['app-a', 'app-b', 'app-c'].map((p, i) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink, border: `1px solid ${PALETTE.line}`, borderRadius: 10, padding: '8px 12px', background: '#0d1522' }}>
                <span style={{ flex: 1 }}>{p}</span>
                <span style={{ color: PALETTE.cyan, fontWeight: 900 }}>evacuating →</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 880, top: 240, fontFamily: MONO, fontSize: 34, fontWeight: 900, color: PALETTE.line, opacity: podsLeave }}>
          →
        </div>

        {/* the separate change step */}
        <div
          style={{
            position: 'absolute',
            left: 980,
            top: 110,
            width: 540,
            borderRadius: 22,
            border: `2px solid ${PALETTE.amber}`,
            background: `${PALETTE.amber}0c`,
            padding: '22px 24px',
            textAlign: 'center',
            opacity: changeIn,
          }}
        >
          <Label color={PALETTE.amber} size={12} style={{ marginBottom: 12 }}>the actual upgrade — a separate step</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, lineHeight: 1.5 }}>
            change the node's configuration<br />and binaries yourself
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 12 }}>
            drain does none of this
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', opacity: changeIn }}>
          <Label color={PALETTE.amber} size={13}>two actions — evacuate the workload, then change the node. Draining does not upgrade anything</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>drain protects the workloads on the node; the version change is the part you still have to do</Label>
        </div>
      </div>
    </div>
  );
};
