import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Horizontal, Label, SANS, MONO, ArrowGlyph } from '../ui';
import type { Beat } from '../script';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Shared pilot component; module 07 beat 3 extends it. The pilot beat has no
 * `module` prop and renders exactly as before; the module beat renders the
 * extended version — two containers in the Pod reaching each other over
 * localhost through the shared netns, then the failure case: sandbox present
 * and healthy, attachment absent, containers running with no route out.
 */
export const Sandbox: React.FC<VisualProps> = ({ module }) => {
  if (module) return <ModuleSandbox />;
  return <PilotSandbox />;
};

/** The pilot beat 9 — unchanged. */
const PilotSandbox: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const flow = appear(t, 0.06, 0.22);
  const sandboxGrow = seg(t, 0.3, 0.5);
  const pauseIn = appear(t, 0.5, 0.6);
  const appWait = seg(t, 0.55, 0.75);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* top flow */}
      <Horizontal center gap={14} style={{ opacity: flow }}>
        <Box pad={14} borderColor={PALETTE.violet} style={{ width: 160, textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>kubelet</div>
        </Box>
        <ArrowGlyph color={PALETTE.cyan} size={26} />
        <Box pad={14} borderColor={PALETTE.cyan} style={{ width: 170, textAlign: 'center' }}>
          <Label color={PALETTE.cyan} size={11}>CRI</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700 }}>gRPC</div>
        </Box>
        <ArrowGlyph color={PALETTE.muted} size={26} />
        <Box pad={14} borderColor={PALETTE.amber} style={{ width: 170, textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>containerd</div>
        </Box>
      </Horizontal>

      {/* sandbox being created */}
      <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <div
          style={{
            border: `2px solid ${PALETTE.cyan}`,
            borderRadius: 22,
            background: `${PALETTE.cyan}10`,
            padding: 22,
            width: lerp(120, 620, sandboxGrow),
            minHeight: lerp(40, 220, sandboxGrow),
            opacity: appear(t, 0.3, 0.4),
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <Label color={PALETTE.cyan} size={12} style={{ marginBottom: 8 }}>pod sandbox</Label>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
            <Box pad={14} style={{ width: 200, textAlign: 'center' }} borderColor={PALETTE.line}>
              <Label color={PALETTE.muted} size={11}>shared namespaces</Label>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, marginTop: 4 }}>net · ipc · uts</div>
            </Box>
            <Box pad={14} style={{ textAlign: 'center', opacity: pauseIn }} borderColor={PALETTE.cyan}>
              <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 18, fontWeight: 900 }}>pause</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13 }}>PID 1 · no app code</div>
            </Box>
          </div>
        </div>
      </div>

      {/* app containers waiting, greyed */}
      <div style={{ marginTop: 30, display: 'flex', gap: 14, justifyContent: 'center', opacity: 0.4 * appear(t, 0.5, 0.6) }}>
        <Box pad={12} style={{ filter: 'grayscale(1)', textAlign: 'center' }} borderColor={PALETTE.line}>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 16, fontWeight: 800 }}>app container</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12 }}>not created yet</div>
        </Box>
        <Box pad={12} style={{ filter: 'grayscale(1)', textAlign: 'center' }} borderColor={PALETTE.line}>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 16, fontWeight: 800 }}>sidecar</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12 }}>waiting outside</div>
        </Box>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16, opacity: appear(t, 0.62, 0.72) }}>
        <Label color={PALETTE.muted} size={12}>network belongs to the sandbox before a container can join it</Label>
      </div>
    </div>
  );
};

/**
 * Module 07 beat 3. The same sandbox, extended: two containers reach each
 * other over localhost through the shared netns, then the failure case —
 * sandbox present and healthy, attachment absent, containers running with no
 * route out. The namespace labels stay at the same type scale as the rest;
 * they are the point of the beat.
 */
const ModuleSandbox: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const flow = appear(t, 0.06, 0.16);
  const sandboxIn = appear(t, 0.14, 0.26);
  const nsIn = appear(t, 0.2, 0.3);
  const pairIn = appear(t, 0.32, 0.42);
  const localhostPulse = seg(t, 0.38, 0.56);
  const failure = seg(t, 0.56, 0.68);
  const footer = appear(t, 0.85, 0.93);

  const pulseOpacity = 0.45 + 0.55 * Math.abs(Math.sin(frame / 9));

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
          <Label color={PALETTE.cyan} size={13}>the sandbox is the thing that holds a Pod together — and a Pod can have a healthy runtime with no network at all</Label>
        </div>

        {/* top flow — same grammar as the pilot */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center', opacity: flow }}>
          <Horizontal center gap={14}>
            <Box pad={12} borderColor={PALETTE.violet} style={{ width: 150, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>kubelet</div>
            </Box>
            <ArrowGlyph color={PALETTE.cyan} size={24} />
            <Box pad={12} borderColor={PALETTE.cyan} style={{ width: 160, textAlign: 'center' }}>
              <Label color={PALETTE.cyan} size={11}>CRI</Label>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700 }}>gRPC</div>
            </Box>
            <ArrowGlyph color={PALETTE.muted} size={24} />
            <Box pad={12} borderColor={PALETTE.amber} style={{ width: 160, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>containerd</div>
            </Box>
          </Horizontal>
        </div>

        {/* the sandbox */}
        <div
          style={{
            position: 'absolute',
            left: 320,
            top: 160,
            width: 1000,
            height: 320,
            border: `2px solid ${PALETTE.cyan}`,
            borderRadius: 24,
            background: `${PALETTE.cyan}0c`,
            opacity: sandboxIn,
          }}
        >
          <Label color={PALETTE.cyan} size={12} style={{ position: 'absolute', left: 24, top: 14 }}>pod sandbox</Label>

          {/* namespaces — the point of the beat, full type scale */}
          <div style={{ position: 'absolute', left: 50, top: 96, opacity: nsIn }}>
            <div
              style={{
                border: `2px solid ${PALETTE.violet}`,
                borderRadius: 14,
                background: `${PALETTE.violet}14`,
                padding: '16px 26px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 26, fontWeight: 900, letterSpacing: '0.02em' }}>
                net · ipc · uts
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 14, fontWeight: 800, marginTop: 6 }}>
                shared namespaces — held by the sandbox
              </div>
            </div>
            <div
              style={{
                marginTop: 18,
                textAlign: 'center',
                fontFamily: MONO,
                color: PALETTE.cyan,
                fontSize: 17,
                fontWeight: 900,
                border: `1px solid ${PALETTE.cyan}66`,
                borderRadius: 10,
                background: `${PALETTE.cyan}0d`,
                padding: '9px 14px',
                display: 'inline-block',
                width: '100%',
              }}
            >
              pause · PID 1 · no app code
            </div>
          </div>

          {/* two containers reaching each other over localhost */}
          <div
            style={{
              position: 'absolute',
              left: 520,
              top: 96,
              width: 450,
              opacity: pairIn,
            }}
          >
            <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 10, textTransform: 'none', letterSpacing: 0 }}>
              two containers, one Pod — the shared netns makes localhost work
            </Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <ContainerChip label="app A" />
              <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', borderTop: `2px solid ${PALETTE.cyan}`, position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: -9,
                      fontFamily: MONO,
                      color: PALETTE.cyan,
                      fontSize: 18,
                      fontWeight: 900,
                      opacity: pulseOpacity * localhostPulse,
                    }}
                  >
                    ●
                  </div>
                </div>
                <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 16, fontWeight: 800, marginTop: 8 }}>
                  localhost — through the netns
                </div>
              </div>
              <ContainerChip label="app B" />
            </div>

            {/* failure case overlays in place */}
            <div style={{ marginTop: 22, textAlign: 'center', minHeight: 44 }}>
              {failure > 0.5 ? (
                <Label color={PALETTE.bad} size={12.5} style={{ textTransform: 'none', letterSpacing: 0 }}>
                  containers still running — but no route out ✕
                </Label>
              ) : (
                <Label color={PALETTE.muted} size={12.5} style={{ textTransform: 'none', letterSpacing: 0 }}>
                  reach each other on localhost…
                </Label>
              )}
            </div>
          </div>

          {/* attachment absent — the failure case */}
          <div style={{ opacity: failure }}>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 12,
                transform: 'translateX(-50%)',
                fontFamily: MONO,
                color: PALETTE.bad,
                fontSize: 15,
                fontWeight: 900,
                background: `${PALETTE.bad}12`,
                border: `1px solid ${PALETTE.bad}66`,
                borderRadius: 10,
                padding: '8px 14px',
                whiteSpace: 'nowrap',
              }}
            >
              ✕ network attachment — absent
            </div>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 14,
                textAlign: 'center',
              }}
            >
              <Label color={PALETTE.amber} size={12} style={{ textTransform: 'none', letterSpacing: 0.02 }}>
                sandbox came up · the attachment did not — runtime healthy, networking never configured
              </Label>
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a Pod can have a perfectly healthy runtime and no network at all</Label>
        </div>
      </div>
    </div>
  );
};

function ContainerChip({ label }: { label: string }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        color: PALETTE.ink,
        fontSize: 17,
        fontWeight: 900,
        border: `2px solid ${PALETTE.cyan}88`,
        borderRadius: 12,
        background: `${PALETTE.cyan}0f`,
        padding: '12px 16px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  );
}

function lerp(a: number, b: number, u: number) {
  return a + (b - a) * u;
}
