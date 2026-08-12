import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 22 beat 5 — no shell in the image. A distroless container cannot be
 * exec’d into usefully. Exec fails early, then the sequence of evidence that
 * does not require one runs, ending in an ephemeral debug container attached
 * to the running Pod. The alternatives are the actual path, not a fallback.
 */

const NO_SHELL_EVIDENCE = [
  { name: 'describe it · read its events', detail: 'kubectl describe · kubectl get events', color: PALETTE.good },
  { name: 'read current & previous logs', detail: 'kubectl logs [-p]', color: PALETTE.good },
  { name: 'read termination reason & exit code', detail: 'lastState · terminated reason', color: PALETTE.good },
];

export const DistrolessDebug: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const contIn = appear(t, 0.06, 0.12);
  const execFail = seg(t, 0.16, 0.26);
  const evOn = NO_SHELL_EVIDENCE.map((_, i) => appear(t, 0.3 + i * 0.08, 0.37 + i * 0.08));
  const debugIn = seg(t, 0.62, 0.74);
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
          <Label color={PALETTE.cyan} size={13}>a distroless container has no shell — that is not a dead end, it is a different path</Label>
        </div>

        {/* the container + exec failing */}
        <div style={{ position: 'absolute', left: 140, top: 52, width: 560 }}>
          <Box pad={16} borderColor={PALETTE.cyan} style={{ textAlign: 'center', opacity: contIn }}>
            <Label color={PALETTE.cyan} size={11}>the container</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900, marginTop: 8 }}>distroless image</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>no shell · no /bin/sh · no package manager</div>
          </Box>
          <div
            style={{
              marginTop: 12,
              borderRadius: 12,
              border: `2px solid ${PALETTE.bad}`,
              background: `${PALETTE.bad}0c`,
              padding: '12px 16px',
              textAlign: 'center',
              opacity: execFail > 0 ? execFail : 0,
              boxShadow: execFail > 0 ? `0 0 20px ${PALETTE.bad}26` : 'none',
            }}
          >
            <Label color={PALETTE.bad} size={11}>kubectl exec</Label>
            <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, marginTop: 6 }}>
              ✕ error: unable to start a process — no shell in the image
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 4 }}>
              a dead end for interactive debugging, not for evidence
            </div>
          </div>
        </div>

        {/* the evidence that needs no shell */}
        <div style={{ position: 'absolute', left: 140, top: 320, width: 900 }}>
          <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 12 }}>evidence that needs no shell</Label>
          {NO_SHELL_EVIDENCE.map((e, i) => (
            <div
              key={e.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                borderRadius: 12,
                border: `2px solid ${e.color}55`,
                background: `${e.color}06`,
                padding: '12px 16px',
                marginBottom: 10,
                opacity: evOn[i],
                transform: `translateX(${(1 - evOn[i]) * -14}px)`,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: e.color }}>✓</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: MONO, fontSize: 16.5, fontWeight: 900, color: PALETTE.ink }}>{e.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 3 }}>{e.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* debug container outcome */}
        <div
          style={{
            position: 'absolute',
            left: 1080,
            top: 320,
            width: 500,
            borderRadius: 16,
            border: `2px solid ${PALETTE.violet}`,
            background: `${PALETTE.violet}0a`,
            padding: 18,
            opacity: debugIn,
            boxShadow: debugIn > 0.5 ? `0 0 26px ${PALETTE.violet}2a` : 'none',
          }}
        >
          <Label color={PALETTE.violet} size={11.5} style={{ marginBottom: 10 }}>then get a shell the right way</Label>
          <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink, lineHeight: 1.4 }}>
            attach an ephemeral debug container to the running Pod
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.muted, marginTop: 12, lineHeight: 1.4 }}>
            kubectl debug — or run a debug copy of the image with the tools you need
          </div>
          <div
            style={{
              marginTop: 14,
              borderTop: `1px solid ${PALETTE.violet}44`,
              paddingTop: 10,
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 800,
              color: PALETTE.amber,
            }}
          >
            the alternatives are the path — not a fallback from a failed exec
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>no shell means exec can’t help — describe, logs and exit reason more than can</Label>
        </div>
      </div>
    </div>
  );
};
