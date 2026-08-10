import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 07 beat 5 — the kubelet never calls runc. A vertical stack with one
 * emphasised horizontal line: kubelet — [CRI: runtime service + image
 * service, gRPC] — containerd — [OCI] — runc — namespaces and cgroups. A
 * call descends from the kubelet and stops at the CRI line. The kubelet→runc
 * arrow people imagine is drawn alongside, then struck through.
 */

const STACK_X = 340;
const STACK_W = 500;
const STACK_CX = STACK_X + STACK_W / 2;

export const CriVsOci: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.07);
  const kubeBox = appear(t, 0.08, 0.13);
  const criBar = appear(t, 0.13, 0.19);
  const containerdBox = appear(t, 0.19, 0.24);
  const ociBar = appear(t, 0.24, 0.29);
  const runcBox = appear(t, 0.29, 0.34);
  const groundBox = appear(t, 0.34, 0.39);
  const packetDrop = appear(t, 0.42, 0.52);
  const stopTag = appear(t, 0.5, 0.58);
  const imagine = appear(t, 0.62, 0.72);
  const strike = appear(t, 0.72, 0.8);
  const strikeLabel = appear(t, 0.74, 0.82);
  const footer = appear(t, 0.88, 0.95);

  const packetPulse = 0.6 + 0.4 * Math.sin(frame / 7);

  // The call packet: descends from the kubelet to the CRI line, then holds.
  const packetY = 140 + (162 - 140) * packetDrop;

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
      <div style={{ width: 1640, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>the kubelet speaks CRI and only CRI — a runtime service and an image service, both gRPC</Label>
        </div>

        {/* ---- the stack ---- */}
        {/* kubelet */}
        <div style={{ opacity: kubeBox }}>
          <StackBox x={STACK_X} y={50} w={STACK_W} h={90} color={PALETTE.violet}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 26, fontWeight: 900 }}>kubelet</div>
          </StackBox>
        </div>

        {/* CRI — the emphasised boundary */}
        <div
          style={{
            opacity: criBar,
            position: 'absolute',
            left: STACK_X - 14,
            top: 152,
            width: STACK_W + 28,
            height: 46,
            border: `3px solid ${PALETTE.cyan}`,
            borderRadius: 12,
            background: `${PALETTE.cyan}22`,
            boxShadow: `0 0 24px ${PALETTE.cyan}55`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 10px',
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 18, fontWeight: 900, lineHeight: 1.15 }}>
            CRI · runtime service + image service · gRPC
          </div>
        </div>

        {/* containerd */}
        <div style={{ opacity: containerdBox }}>
          <StackBox x={STACK_X} y={230} w={STACK_W} h={90} color={PALETTE.amber}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 24, fontWeight: 900 }}>containerd</div>
          </StackBox>
        </div>

        {/* OCI */}
        <div
          style={{
            opacity: ociBar,
            position: 'absolute',
            left: STACK_X,
            top: 332,
            width: STACK_W,
            height: 38,
            border: `2px solid ${PALETTE.amber}`,
            borderRadius: 10,
            background: `${PALETTE.amber}16`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 16, fontWeight: 900 }}>OCI · image + runtime primitives</div>
        </div>

        {/* runc */}
        <div style={{ opacity: runcBox }}>
          <StackBox x={STACK_X} y={404} w={STACK_W} h={90} color={PALETTE.amber}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 24, fontWeight: 900 }}>runc</div>
          </StackBox>
        </div>

        {/* namespaces + cgroups */}
        <div style={{ opacity: groundBox }}>
          <StackBox x={STACK_X} y={528} w={STACK_W} h={68} color={PALETTE.good}>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 19, fontWeight: 900 }}>namespaces · cgroups</div>
          </StackBox>
        </div>

        {/* the call packet — stops at the CRI line */}
        <div
          style={{
            position: 'absolute',
            left: STACK_CX - 12,
            top: packetY - 12,
            width: 24,
            height: 24,
            borderRadius: 12,
            background: PALETTE.cyan,
            boxShadow: `0 0 16px ${PALETTE.cyan}`,
            opacity: packetDrop,
            zIndex: 3,
          }}
        >
          {packetDrop >= 1 && (
            <div
              style={{
                position: 'absolute',
                left: -6,
                top: 14,
                fontFamily: MONO,
                color: PALETTE.cyan,
                fontSize: 16,
                fontWeight: 900,
                opacity: packetPulse,
                whiteSpace: 'nowrap',
              }}
            >
              ▼
            </div>
          )}
        </div>
        {stopTag > 0 && (
          <div
            style={{
              position: 'absolute',
              left: STACK_CX - 190,
              top: 208,
              width: 380,
              textAlign: 'center',
              opacity: stopTag,
            }}
          >
            <Label color={PALETTE.amber} size={12} style={{ textTransform: 'none', letterSpacing: 0.02 }}>
              stop — the kubelet's reach ends at the CRI boundary
            </Label>
          </div>
        )}

        {/* the imagined kubelet → runc arrow, struck through */}
        <div style={{ opacity: imagine }}>
          <div
            style={{
              position: 'absolute',
              left: 906,
              top: 95,
              width: 3,
              height: 390,
              borderLeft: `3px dashed ${PALETTE.bad}`,
              opacity: 0.75,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 897,
              top: 482,
              fontFamily: MONO,
              color: PALETTE.bad,
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            ▼
          </div>
        </div>
        {strike > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 906 - 22,
              top: 262,
              fontFamily: MONO,
              fontSize: 44,
              fontWeight: 900,
              color: PALETTE.bad,
              opacity: strike,
              textShadow: `0 0 18px ${PALETTE.bad}66`,
              zIndex: 2,
            }}
          >
            ✕
          </div>
        )}
        {strikeLabel > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 950,
              top: 236,
              width: 280,
              opacity: strikeLabel,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                color: PALETTE.bad,
                fontSize: 15,
                fontWeight: 900,
                background: '#0c111c',
                border: `1px solid ${PALETTE.bad}66`,
                borderRadius: 10,
                padding: '10px 14px',
                lineHeight: 1.35,
              }}
            >
              ✕ the kubelet never calls runc
            </div>
          </div>
        )}

        {/* footer */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>below that boundary, containerd invokes a runtime that creates the namespaces and cgroups — that lower layer is OCI</Label>
        </div>
      </div>
    </div>
  );
};

function StackBox({
  x,
  y,
  w,
  h,
  color,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        border: `2px solid ${color}`,
        borderRadius: 14,
        background: `${color}10`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
}
