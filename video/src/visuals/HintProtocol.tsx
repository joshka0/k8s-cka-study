import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 16 beat 2 — three managers, one protocol. CPU Manager, Memory Manager
 * and Device Manager each emit a hint about their own resource; Topology
 * Manager merges them under a policy. One round where the hints intersect into
 * an agreed affinity; one where they do not and placement is refused. The
 * merge is drawn as a real intersection, not a queue.
 */

const MANAGERS = [
  { name: 'CPU Manager', resource: 'cpuset hint', color: PALETTE.cyan },
  { name: 'Memory Manager', resource: 'memory hint', color: PALETTE.violet },
  { name: 'Device Manager', resource: 'device hint', color: PALETTE.amber },
];

export const HintProtocol: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const mgrIn = appear(t, 0.08, 0.16);
  const hintOn = MANAGERS.map((_, i) => appear(t, 0.12 + i * 0.06, 0.18 + i * 0.06));
  const mergeIn = appear(t, 0.26, 0.34);
  const intersect = seg(t, 0.36, 0.5);
  const missRound = seg(t, 0.64, 0.78);
  const footer = appear(t, 0.9, 0.97);

  const agree = intersect > 0.5 && missRound < 0.5;

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
      <div style={{ width: 1680, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>three managers, each knows one resource — Topology Manager merges their hints</Label>
        </div>

        {/* the managers */}
        <div style={{ position: 'absolute', left: 60, top: 90, display: 'flex', flexDirection: 'column', gap: 22, opacity: mgrIn }}>
          {MANAGERS.map((m, i) => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 250, borderRadius: 12, border: `2px solid ${m.color}`, background: `${m.color}08`, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>{m.name}</div>
              </div>
              <span style={{ color: m.color, fontSize: 22, fontWeight: 900, opacity: hintOn[i] }}>→</span>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 13.5,
                  fontWeight: 800,
                  color: m.color,
                  border: `1px solid ${m.color}55`,
                  borderRadius: 999,
                  background: '#0d1522',
                  padding: '6px 12px',
                  opacity: hintOn[i],
                }}
              >
                {m.resource}
              </div>
            </div>
          ))}
        </div>

        {/* the merge */}
        <div
          style={{
            position: 'absolute',
            left: 560,
            top: 140,
            width: 440,
            borderRadius: 20,
            border: `2px solid ${PALETTE.good}`,
            background: `${PALETTE.good}08`,
            padding: '20px 22px',
            textAlign: 'center',
            opacity: mergeIn,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>Topology Manager</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6 }}>
            merges the hints under a configured policy
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: MONO,
              fontSize: 15,
              fontWeight: 900,
              color: agree ? PALETTE.good : missRound > 0.5 ? PALETTE.bad : PALETTE.muted,
              border: `2px solid ${agree ? PALETTE.good : missRound > 0.5 ? PALETTE.bad : PALETTE.line}`,
              borderRadius: 12,
              background: agree ? `${PALETTE.good}0c` : missRound > 0.5 ? `${PALETTE.bad}0c` : '#0d1522',
              padding: '12px 14px',
            }}
          >
            {missRound > 0.5
              ? '✕ hints do not intersect — no agreed affinity'
              : agree
                ? '✓ the hints intersect — one agreed affinity'
                : 'intersecting the hints…'}
          </div>
        </div>

        {/* two outcomes */}
        <div style={{ position: 'absolute', left: 1060, top: 120, width: 520, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              borderRadius: 14,
              border: `2px solid ${PALETTE.blue}55`,
              background: `${PALETTE.blue}06`,
              padding: '14px 16px',
              opacity: Math.min(1, intersect),
            }}
          >
            <Label color={PALETTE.blueInk} size={11.5} style={{ marginBottom: 6 }}>policy: restricted</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, lineHeight: 1.4 }}>
              a missing coherent placement <span style={{ color: PALETTE.bad }}>fails admission</span> on the node
            </div>
          </div>
          <div
            style={{
              borderRadius: 14,
              border: `2px solid ${PALETTE.cyan}55`,
              background: `${PALETTE.cyan}06`,
              padding: '14px 16px',
            }}
          >
            <Label color={PALETTE.cyan} size={11.5} style={{ marginBottom: 6 }}>policy: best-effort</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, lineHeight: 1.4 }}>
              admits anyway, without the preferred alignment
            </div>
          </div>
          <div
            style={{
              borderRadius: 14,
              border: `2px solid ${PALETTE.line}55`,
              background: '#0d1522',
              padding: '14px 16px',
            }}
          >
            <Label color={PALETTE.muted} size={11.5} style={{ marginBottom: 6 }}>policy: none</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, lineHeight: 1.4 }}>
              no alignment step at all
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: mergeIn }}>
          <Label color={PALETTE.amber} size={13}>the merge is a real intersection of hints — not a queue of independent decisions</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>each manager knows only its own resource — agreement is produced by the merge, and it can fail</Label>
        </div>
      </div>
    </div>
  );
};
