import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE, LANES } from '../theme';
import { Box, Horizontal, Label, SANS, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const Handoff: React.FC<VisualProps> = ({ module }) => {
  if (module) return <ModuleHandoff />;
  return <PilotHandoff />;
};

/**
 * Module 01 — kubelet-owns. Same pull model as the pilot; extended only at the
 * end: the watch line goes dark and the API server's copy of the pod status
 * freezes, greyed, holding the last-reported timestamp.
 */
const ModuleHandoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const slide = seg(t, 0.3, 0.52);
  const freeze = seg(t, 0.62, 0.74);
  const watchPulse = Math.sin(t * 26) * 0.5 + 0.5;

  const controlY = 40;
  const nodeY = 540;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <LaneBand y={controlY} color={LANES.control.color} label="Control plane">
        <Box pad={14} borderColor={LANES.control.color} style={{ width: 200, textAlign: 'center' }}>
          <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>API server</div>
        </Box>
      </LaneBand>

      <LaneBand y={nodeY} color={LANES.node.color} label="Node">
        <Horizontal center gap={14}>
          <KubeletChip pulse={freeze > 0 ? 0 : watchPulse} />
        </Horizontal>
      </LaneBand>

      {/* the watch line (pull) — goes dark on freeze */}
      <div
        style={{
          position: 'absolute',
          left: 880,
          top: controlY + 60,
          height: nodeY - controlY - 60,
          width: 3,
          background: freeze > 0 ? PALETTE.line : PALETTE.violet,
          opacity: freeze > 0 ? 0.3 : 0.4 + watchPulse * 0.6,
          boxShadow: freeze > 0 ? 'none' : `0 0 12px ${PALETTE.violet}`,
          transformOrigin: 'top',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 880,
          top: controlY + 60,
          fontFamily: MONO,
          color: freeze > 0 ? PALETTE.line : PALETTE.violet,
          fontSize: 16,
          fontWeight: 800,
          opacity: appear(t, 0.12, 0.2),
          textDecoration: freeze > 0 ? 'line-through' : 'none',
        }}
      >
        ▲ kubelet's watch (pulling){freeze > 0 ? ' · down' : ''}
      </div>

      <Dashto fromY={controlY + 150} toY={nodeY + 20} at={slide}>
        <span style={{ fontFamily: MONO, color: PALETTE.cyan, fontWeight: 900 }}>Pod</span>
      </Dashto>

      {/* frozen status — API server's copy holds the last thing it heard */}
      {freeze > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, opacity: freeze }}>
          <Box pad={12} borderColor={PALETTE.line} bg="#0a0f18" style={{ display: 'inline-block', textAlign: 'center' }}>
            <Label color={PALETTE.muted} size={11}>API server's copy of pod status</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 18, fontWeight: 900, marginTop: 4 }}>
              frozen · holds last-reported timestamp
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.line, fontSize: 15, fontWeight: 800, marginTop: 6 }}>14:32:08 · not renewed</div>
          </Box>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 16, opacity: appear(t, 0.6, 0.7) }}>
        <Label color={PALETTE.muted} size={12}>
          {freeze > 0 ? 'the kubelet has stopped reporting — renewals have stopped' : 'pull, not push — the kubelet syncs on pods with its own name'}
        </Label>
      </div>
    </div>
  );
};

const PilotHandoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const slide = seg(t, 0.34, 0.6);
  const watchPulse = Math.sin(t * 26) * 0.5 + 0.5;

  const controlY = 40;
  const nodeY = 560;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* control plane lane */}
      <LaneBand y={controlY} color={LANES.control.color} label="Control plane">
        <Box pad={14} borderColor={LANES.control.color} style={{ width: 200, textAlign: 'center' }}>
          <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>API server</div>
        </Box>
      </LaneBand>

      {/* node lane */}
      <LaneBand y={nodeY} color={LANES.node.color} label="Node">
        <Horizontal center gap={14}>
          <KubeletChip pulse={watchPulse} />
        </Horizontal>
      </LaneBand>

      {/* the watch line (kubelet reaching up — pull, not push) */}
      <div
        style={{
          position: 'absolute',
          left: 880,
          top: controlY + 60,
          height: nodeY - controlY - 60,
          width: 3,
          background: `${PALETTE.violet}`,
          opacity: 0.4 + watchPulse * 0.6,
          boxShadow: `0 0 12px ${PALETTE.violet}`,
          transformOrigin: 'top',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 880,
          top: controlY + 60,
          fontFamily: MONO,
          color: PALETTE.violet,
          fontSize: 16,
          fontWeight: 800,
          opacity: appear(t, 0.12, 0.2),
        }}
      >
        ▲ kubelet's watch (pulling)
      </div>

      {/* pod sliding down the line */}
      <Dashto
        fromY={controlY + 150}
        toY={nodeY + 20}
        at={slide}
      >
        <span style={{ fontFamily: MONO, color: PALETTE.cyan, fontWeight: 900 }}>Pod</span>
      </Dashto>

      <div style={{ textAlign: 'center', marginTop: 20, opacity: appear(t, 0.6, 0.7) }}>
        <Label color={PALETTE.muted} size={12}>pull, not push — the kubelet syncs on pods with its own name</Label>
      </div>
    </div>
  );
};

function LaneBand({ y, color, label, children }: { y: number; color: string; label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        top: y,
        minHeight: 150,
        border: `2px solid ${color}66`,
        borderRadius: 22,
        background: `${color}0d`,
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
      }}
    >
      <Label color={color} size={13} style={{ width: 120, flex: '0 0 auto' }}>{label}</Label>
      {children}
    </div>
  );
}

function KubeletChip({ pulse }: { pulse: number }) {
  return (
    <Box
      pad={14}
      borderColor={PALETTE.violet}
      style={{
        width: 200,
        textAlign: 'center',
        boxShadow: `0 0 16px ${PALETTE.violet}${Math.round(pulse * 60)}`,
      }}
    >
      <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900, opacity: 0.7 + pulse * 0.3 }}>
        kubelet
      </div>
    </Box>
  );
}

function Dashto({ fromY, toY, at, children }: { fromY: number; toY: number; at: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 860,
        top: fromY + (toY - fromY) * at,
        transform: 'translateX(20px)',
        fontFamily: 'inherit',
        opacity: at > 0.05 ? 1 : 0,
        border: '1px solid #22d3ee',
        borderRadius: 8,
        background: '#0d1a26',
        padding: '6px 12px',
        fontSize: 18,
        color: PALETTE.cyan,
      }}
    >
      {children}
    </div>
  );
}
