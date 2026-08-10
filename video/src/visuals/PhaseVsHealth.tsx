import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 07 beat 6 — phase is not health. One Pod, two independent
 * indicators side by side and clearly not linked: phase (Running) and ready
 * (false). Each has its own mechanism input drawn separately; the clock runs
 * forward while both values hold. The whole beat fails if the two read as
 * one status, so there is no connector between them at all.
 */

export const PhaseVsHealth: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const pod = appear(t, 0.06, 0.12);
  const mechL = appear(t, 0.14, 0.2);
  const mechR = appear(t, 0.24, 0.3);
  const panelL = appear(t, 0.2, 0.28);
  const panelR = appear(t, 0.3, 0.38);
  const divider = appear(t, 0.36, 0.44);
  const clockIn = appear(t, 0.4, 0.48);
  const footer = appear(t, 0.88, 0.95);

  // The clock runs forward; the two indicators hold.
  const elapsed = seg(t, 0.42, 0.86);
  const hours = elapsed * 6;
  const clockText = `${Math.floor(hours)}:${String(Math.round((hours % 1) * 60)).padStart(2, '0')}`;

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
      <div style={{ width: 1640, height: 660, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>Running is a phase — ready is a separate signal, set by a different mechanism</Label>
        </div>

        {/* the one Pod */}
        <div
          style={{
            position: 'absolute',
            left: 690,
            top: 44,
            width: 260,
            height: 66,
            border: `2px solid ${PALETTE.cyan}`,
            borderRadius: 14,
            background: `${PALETTE.cyan}10`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pod,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>one Pod · container app</div>
        </div>

        {/* mechanism inputs — separate, unconnected */}
        <div style={{ opacity: mechL }}>
          <MechanismChip x={140} w={420} top={150} color={PALETTE.good} text="mechanism: the process is alive" />
        </div>
        <div style={{ opacity: mechR }}>
          <MechanismChip x={1080} w={420} top={150} color={PALETTE.cyan} text="mechanism: readiness probe" />
        </div>

        {/* input arrows */}
        <div style={{ opacity: mechL }}>
          <div style={{ position: 'absolute', left: 350 - 1.5, top: 208, width: 3, height: 62, background: `${PALETTE.good}77` }} />
          <div style={{ position: 'absolute', left: 350 - 6, top: 262, fontFamily: MONO, color: PALETTE.good, fontSize: 14 }}>▼</div>
        </div>
        <div style={{ opacity: mechR }}>
          <div style={{ position: 'absolute', left: 1290 - 1.5, top: 208, width: 3, height: 62, background: `${PALETTE.cyan}77` }} />
          <div style={{ position: 'absolute', left: 1290 - 6, top: 262, fontFamily: MONO, color: PALETTE.cyan, fontSize: 14 }}>▼</div>
        </div>

        {/* the two indicator panels */}
        <div style={{ opacity: Math.max(panelL, panelR) }}>
          <div
            style={{
              position: 'absolute',
              left: 140,
              top: 280,
              width: 520,
              height: 220,
              border: `2px solid ${PALETTE.good}88`,
              borderRadius: 18,
              background: `${PALETTE.good}0d`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: panelL,
            }}
          >
            <Label color={PALETTE.good} size={12}>phase</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 54, fontWeight: 900, marginTop: 6 }}>Running</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 700, marginTop: 6 }}>the process is alive</div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 1080,
            top: 280,
            width: 520,
            height: 220,
            border: `2px solid ${PALETTE.bad}88`,
            borderRadius: 18,
            background: `${PALETTE.bad}0d`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: panelR,
          }}
        >
          <Label color={PALETTE.bad} size={12}>ready</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 54, fontWeight: 900, marginTop: 6 }}>false</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 700, marginTop: 6 }}>will not accept traffic</div>
        </div>

        {/* the gap between them — deliberately empty, labelled not linked */}
        <div style={{ opacity: divider }}>
          <div
            style={{
              position: 'absolute',
              left: 872,
              top: 300,
              bottom: 200,
              width: 0,
              borderLeft: `2px dashed ${PALETTE.line}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 772,
              top: 372,
              width: 200,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                color: PALETTE.muted,
                fontSize: 16,
                fontWeight: 900,
                lineHeight: 1.4,
                border: `1px solid ${PALETTE.line}`,
                borderRadius: 12,
                background: '#0c111c',
                padding: '10px 12px',
                textAlign: 'center',
              }}
            >
              not linked
              <div style={{ fontSize: 12, fontWeight: 700, color: PALETTE.muted, marginTop: 4, opacity: 0.8 }}>two mechanisms · two answers</div>
            </div>
          </div>
        </div>

        {/* the clock running forward */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 536, textAlign: 'center', opacity: clockIn }}>
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 26, fontWeight: 900 }}>
            ⏱ t+{clockText}
          </div>
          <div
            style={{
              width: 420,
              height: 10,
              borderRadius: 999,
              background: '#0c111c',
              border: `1px solid ${PALETTE.line}`,
              margin: '10px auto 0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${Math.max(2, elapsed * 100)}%`,
                background: PALETTE.amber,
                opacity: 0.9,
              }}
            />
          </div>
        </div>

        {/* footer */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 612, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the Pod's phase keeps saying Running the whole time — alive for hours, ready never</Label>
        </div>
      </div>
    </div>
  );
};

function MechanismChip({ x, w, top, color, text }: { x: number; w: number; top: number; color: string; text: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top,
        width: w,
        height: 58,
        border: `2px solid ${color}88`,
        borderRadius: 12,
        background: `${color}10`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        color: PALETTE.ink,
        fontSize: 15,
        fontWeight: 800,
      }}
    >
      {text}
    </div>
  );
}
