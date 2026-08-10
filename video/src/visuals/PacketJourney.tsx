import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { Beat } from '../script';
import { appear, seg } from '../motion';

// One continuous left-to-right journey for a single packet.
const STATIONS = [
  { x: 240, label: 'DNS', color: PALETTE.good, detail: 'search domains · ndots · CoreDNS', w: 150 },
  { x: 560, label: 'client pod', color: PALETTE.cyan, detail: 'connection to cluster IP', w: 150 },
  { x: 900, label: 'data plane', color: PALETTE.violet, detail: 'dst → ready pod IP', w: 170 },
  { x: 1220, label: 'veth', color: PALETTE.amber, detail: 'interface CNI created', w: 130 },
  { x: 1500, label: 'app', color: PALETTE.good, detail: 'listening since stage 11', w: 170 },
];

export const PacketJourney: React.FC<{ beat: Beat }> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  // packet travels across the full span once
  const prog = seg(t, 0.12, 0.9);
  const left = 120;
  const right = 1760;
  const x = left + (right - left) * prog;
  const y = 470;

  const nearIndex = () => {
    let best = 0;
    let bd = Infinity;
    STATIONS.forEach((s, i) => {
      const d = Math.abs(x - s.x);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  };
  const near = nearIndex();

  // destination rewrite moment: as packet passes the data plane station
  const rewriteActive = x > 820 && x < 1000;
  const rewrite = appear(t, 0.42, 0.5);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Label color={PALETTE.muted} size={12} style={{ textAlign: 'center', marginTop: 30 }}>
        one continuous journey — no cuts
      </Label>

      {/* the path */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: y - 2,
          width: 1800,
          height: 5,
          borderRadius: 999,
          background: 'linear-gradient(90deg, #22c55e, #22d3ee, #a78bfa, #f59e0b, #22c55e)',
          opacity: 0.5,
        }}
      />
      {/* path glow */}
      <div
        style={{
          position: 'absolute',
          left: 100,
          top: y - 20,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${rewriteActive ? PALETTE.violet : PALETTE.cyan}66, transparent 70%)`,
          opacity: 0.55,
          transform: `translateX(${x - 100}px)`,
        }}
      />

      {/* the packet */}
      <div
        style={{
          position: 'absolute',
          left: x - 26,
          top: y - 26,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: rewriteActive ? PALETTE.violet : PALETTE.cyan,
          boxShadow: `0 0 30px ${rewriteActive ? PALETTE.violet : PALETTE.cyan}`,
          color: '#04111f',
          fontFamily: MONO,
          fontSize: 22,
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {rewriteActive ? '→' : 'p'}
      </div>

      {/* destination label changes as it rewrites */}
      <div
        style={{
          position: 'absolute',
          left: x - 90,
          top: y - 84,
          width: 180,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 15,
          fontWeight: 900,
          color: rewriteActive ? PALETTE.violet : PALETTE.muted,
          opacity: rewriteActive ? rewrite : 0.85,
        }}
      >
        {rewriteActive ? 'dst: 10.0.0.16:8080 ✓' : 'dst: 10.96.0.1'}
      </div>

      {/* stations */}
      {STATIONS.map((s, i) => {
        const hot = i === near && !rewriteActive;
        const isDNS = i === 0;
        return (
          <div key={s.label} style={{ position: 'absolute', left: s.x - s.w / 2, top: y + 40, width: s.w, textAlign: 'center' }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: s.color,
                margin: '0 auto 8px',
                boxShadow: hot ? `0 0 14px ${s.color}` : 'none',
              }}
            />
            <div
              style={{
                fontFamily: MONO,
                color: hot ? s.color : PALETTE.muted,
                fontSize: 18,
                fontWeight: 900,
                transition: 'color 40ms linear',
              }}
            >
              {s.label}
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, opacity: hot ? 1 : 0.55, width: s.w + 60, marginLeft: -30 }}>
              {s.detail}
            </div>
          </div>
        );
      })}

      {/* DNS answered banner at the start */}
      {t < 0.2 && (
        <div
          style={{
            position: 'absolute',
            left: 190,
            top: y + 120,
            fontFamily: MONO,
            color: PALETTE.good,
            fontSize: 15,
            opacity: appear(t, 0.02, 0.1),
          }}
        >
          DNS query → CoreDNS answers from Service/EndpointSlice state ✓
        </div>
      )}
    </div>
  );
};
