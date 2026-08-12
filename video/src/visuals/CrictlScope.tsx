import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 22 beat 6 — when crictl earns its place. The API path is broken and
 * kubectl can’t answer; crictl talks to the container runtime directly
 * through the CRI socket, below the API boundary drawn in the troubleshooting
 * module. It is node and runtime evidence — not a replacement for kubectl.
 */

export const CrictlScope: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const apiIn = appear(t, 0.06, 0.12);
  const kubectlFail = seg(t, 0.16, 0.26);
  const boundary = appear(t, 0.28, 0.36);
  const crictlIn = seg(t, 0.42, 0.56);
  const footer = appear(t, 0.86, 0.93);

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
          <Label color={PALETTE.cyan} size={13}>API path broken and kubectl can’t answer — crictl reaches the runtime directly, below the boundary</Label>
        </div>

        {/* above the boundary: API + kubectl */}
        <div style={{ position: 'absolute', left: 200, top: 52, width: 380, textAlign: 'center', opacity: apiIn }}>
          <Box pad={14} borderColor={PALETTE.bad} style={{ textAlign: 'center', filter: 'grayscale(0.6)' }}>
            <Label color={PALETTE.bad} size={11}>API server</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 4 }}>unreachable / unhealthy</div>
          </Box>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 620,
            top: 52,
            width: 300,
            borderRadius: 12,
            border: `2px solid ${PALETTE.bad}66`,
            background: `${PALETTE.bad}06`,
            padding: '12px 16px',
            textAlign: 'center',
            opacity: kubectlFail,
            filter: 'grayscale(1)',
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.bad }}>kubectl</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 4 }}>cannot reach the API — tells you nothing</div>
        </div>

        {/* the boundary line */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            right: 120,
            top: 176,
            height: 3,
            background: `${PALETTE.amber}AA`,
            opacity: boundary,
          }}
        >
          <span style={{ position: 'absolute', left: 0, right: 0, top: -26, textAlign: 'center', fontFamily: MONO, letterSpacing: 3, fontSize: 14, fontWeight: 900, color: PALETTE.amber }}>
            —— THE API BOUNDARY · below it, node and runtime evidence ——
          </span>
        </div>

        {/* the node below */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 240,
            width: 1280,
            borderRadius: 18,
            border: `2px solid ${PALETTE.violet}55`,
            background: `${PALETTE.violet}06`,
            padding: 20,
          }}
        >
          <Label color={PALETTE.violet} size={11.5} style={{ marginBottom: 16 }}>the node — below the API boundary</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* kubelet / runtime stack */}
            <Box pad={12} borderColor={PALETTE.line} style={{ width: 320, textAlign: 'center', opacity: appear(t, 0.34, 0.42) }}>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 800 }}>kubelet</div>
              <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: PALETTE.muted, marginTop: 3 }}>broken / silent</div>
            </Box>
            <span style={{ color: PALETTE.line, fontSize: 18, fontWeight: 900 }}>↓</span>
            <Box pad={12} borderColor={PALETTE.violet} style={{ width: 320, textAlign: 'center', opacity: appear(t, 0.38, 0.46) }}>
              <div style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 15, fontWeight: 900 }}>CRI socket</div>
              <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: PALETTE.muted, marginTop: 3 }}>/run/containerd/…</div>
            </Box>
            <span style={{ color: PALETTE.line, fontSize: 18, fontWeight: 900 }}>↓</span>
            <Box pad={12} borderColor={PALETTE.violet} style={{ width: 320, textAlign: 'center', opacity: appear(t, 0.42, 0.5) }}>
              <div style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 15, fontWeight: 900 }}>container runtime</div>
              <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: PALETTE.muted, marginTop: 3 }}>containerd / CRI-O</div>
            </Box>
          </div>

          {/* crictl reaching straight in */}
          <div
            style={{
              marginTop: 20,
              borderRadius: 14,
              border: `2px solid ${crictlIn > 0.5 ? PALETTE.violet : PALETTE.line}`,
              background: `${PALETTE.violet}0c`,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              opacity: crictlIn,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 900, color: PALETTE.violet }}>crictl</div>
            <div style={{ flex: 1, fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.4 }}>
              talks to the runtime directly through the CRI socket — bypassing kubelet and the API path entirely
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 900, color: PALETTE.amber, border: `1px solid ${PALETTE.amber}66`, borderRadius: 10, background: '#0c111c', padding: '8px 12px', whiteSpace: 'nowrap' }}>
              node & runtime evidence
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: appear(t, 0.66, 0.74) }}>
          <Label color={PALETTE.amber} size={13}>it is the right tool only when the kubelet or API path is unavailable — reaching for it while the API is healthy usually means looking in the wrong place</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>crictl below the line, kubectl above it — the boundary decides which one can answer</Label>
        </div>
      </div>
    </div>
  );
};
