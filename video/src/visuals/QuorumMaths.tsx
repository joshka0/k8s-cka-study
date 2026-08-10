import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 11 beat 3 — quorum maths. Three-member and five-member clusters
 * side by side, each showing its majority threshold as a real count. Members
 * fail one at a time and the threshold is met, then missed. The tolerance
 * under each — three tolerates one, five tolerates two — is derived on
 * screen from the formula, not asserted.
 */

export const QuorumMaths: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const panelIn = appear(t, 0.1, 0.2);
  const footer = appear(t, 0.86, 0.94);

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
      <div style={{ width: 1620, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>quorum is a real count, not a vibe — ⌊n/2⌋ + 1 members must agree on every write</Label>
        </div>

        {/* the formula */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center', opacity: appear(t, 0.04, 0.1) }}>
          <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 26, fontWeight: 900, border: `1px solid ${PALETTE.cyan}66`, borderRadius: 12, background: `${PALETTE.cyan}0a`, padding: '10px 22px' }}>
            majority = ⌊n/2⌋ + 1
          </span>
        </div>

        {/* 3-member cluster: failures at 0.20 and 0.38 */}
        <MemberCluster
          title="three members"
          n={3}
          x={60}
          in={panelIn}
          failAt={[0.2, 0.38]}
        />

        {/* 5-member cluster: failures at 0.36, 0.54, 0.68 */}
        <MemberCluster
          title="five members"
          n={5}
          x={880}
          in={panelIn}
          failAt={[0.36, 0.54, 0.68]}
        />

        <div style={{ position: 'absolute', left: 0, right: 0, top: 644, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>three tolerates one, five tolerates two — derive it, never quote it</Label>
        </div>
      </div>
    </div>
  );
};

function MemberCluster({
  title, n, x, in: outer, failAt,
}: {
  title: string;
  n: number;
  x: number;
  in: number;
  failAt: number[];
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const majority = Math.floor(n / 2) + 1;
  const tolerance = n - majority;

  const failMask = failAt.map((at) => (t >= at + 0.06 ? 1 : 0));
  const fails = failMask.reduce<number>((a, b) => a + b, 0);
  const alive = n - fails;
  const lost = alive < majority;

  const deadIndexes = new Set<number>();
  failMask.forEach((f, i) => {
    if (f) deadIndexes.add(n - 1 - i);
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 120,
        width: 680,
        borderRadius: 18,
        border: `2px solid ${PALETTE.violet}55`,
        background: `${PALETTE.violet}04`,
        padding: '16px 20px',
        opacity: Math.max(0.3, outer),
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Label color={PALETTE.violet} size={13}>{title}</Label>
        <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900 }}>
          majority ⌊{n}/2⌋+1 = <span style={{ color: PALETTE.violet }}>{majority}</span> · tolerates <span style={{ color: PALETTE.good }}>{tolerance}</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {Array.from({ length: n }).map((_, i) => {
          const isDead = deadIndexes.has(i);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 900,
                color: PALETTE.ink,
                border: `2px solid ${isDead ? PALETTE.bad : PALETTE.violet}`,
                borderRadius: 10,
                background: isDead ? `${PALETTE.bad}0c` : `${PALETTE.violet}0c`,
                padding: '12px 6px',
                textAlign: 'center',
                opacity: isDead ? 0.4 : 1,
              }}
            >
              member {i + 1}
              {isDead && <div style={{ fontSize: 12, color: PALETTE.bad, marginTop: 3 }}>✕ failed</div>}
            </div>
          );
        })}
      </div>

      {/* the verdict */}
      <div
        style={{
          marginTop: 12,
          borderRadius: 10,
          border: `1px solid ${lost ? PALETTE.bad : PALETTE.good}66`,
          background: lost ? `${PALETTE.bad}0a` : `${PALETTE.good}0a`,
          padding: '10px 14px',
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 15,
          fontWeight: 900,
          color: lost ? PALETTE.bad : PALETTE.good,
        }}
      >
        {lost
          ? `✕ quorum lost — ${alive} healthy < ${majority} needed`
          : `${alive} healthy ≥ ${majority} — quorum stands`}
      </div>
    </div>
  );
}
