import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Horizontal, Label, SANS, MONO, Dot } from '../ui';
import type { Beat } from '../script';
import { appear, seg } from '../motion';

export const Quorum: React.FC<{ beat: Beat }> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const entry = seg(t, 0.08, 0.24);
  const replicate = seg(t, 0.22, 0.4);
  const ack = seg(t, 0.4, 0.52);
  const committed = seg(t, 0.52, 0.6);
  const fourthIn = seg(t, 0.62, 0.74);
  const greyEnd = seg(t, 0.78, 0.95);

  // follower ack lights: two of three ack
  const followerAck = (i: number) => {
    if (i < 2) return ack > 0 ? 1 : ack > 0.4 ? 1 : 0;
    return 0;
  };
  const ackOn = (i: number) => (i < 2 ? ack > 0.25 : false);

  const members = [
    { x: 560, y: 180, role: 'leader' },
    { x: 330, y: 430, role: 'follower' },
    { x: 790, y: 430, role: 'follower' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* member triangle */}
      {members.map((m, i) => (
        <MemberBox
          key={i}
          x={m.x + fourthIn * 0}
          y={m.y}
          role={m.role}
          index={i}
          ackOn={i < 2 ? ackOn(i) : ack > 0.6}
          committed={committed}
        />
      ))}

      {/* fourth member */}
      <MemberBox
        x={960}
        y={430}
        role="follower"
        index={3}
        ackOn={false}
        committed={0}
        opacity={fourthIn * (1 - greyEnd)}
      />

      {/* replication arrows update */}
      {[1, 2].map((fi) => {
        const from = members[0];
        const to = members[fi];
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const go = replicate * (fi === 1 ? 1 : 1);
        return (
          <div
            key={fi}
            style={{
              position: 'absolute',
              left: lerp(from.x + 60, to.x - 110, go) - 30,
              top: lerp(from.y + 40, to.y - 30, go),
              fontSize: 22,
              color: PALETTE.cyan,
              opacity: replicate > 0.05 ? replicate : 0,
            }}
          >
            {go < 1 ? '›' : '✓'}
          </div>
        );
      })}

      {/* committed + response */}
      {committed > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 560,
            top: 250,
            fontFamily: MONO,
            color: PALETTE.good,
            fontSize: 22,
            fontWeight: 900,
            opacity: committed,
            textShadow: `0 0 22px ${PALETTE.good}`,
          }}
        >
          committed ✓
        </div>
      )}

      {/* quorum counter */}
      <Horizontal center gap={20} style={{ position: 'absolute', left: 300, right: 300, top: 620, justifyContent: 'center' }}>
        <Dot color={PALETTE.cyan} />
        <Box pad={14} style={{ textAlign: 'center' }}>
          <Label color={PALETTE.muted} size={12}>quorum</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 34, fontWeight: 900 }}>
            {Math.round(2 + fourthIn)} / {Math.round(3 + fourthIn)}
          </div>
        </Box>
        <Box pad={14} style={{ textAlign: 'center' }}>
          <Label color={PALETTE.muted} size={12}>tolerates</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 34, fontWeight: 900 }}>1</div>
        </Box>
        <Box pad={14} style={{ textAlign: 'center' }}>
          <Label color={PALETTE.muted} size={12}>add a 4th</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 22, fontWeight: 900 }}>no help</div>
        </Box>
      </Horizontal>

      {/* end state: object alone in db */}
      <div style={{ textAlign: 'center', marginTop: 40, opacity: greyEnd }}>
        <Box pad={16} style={{ background: '#0d1420', filter: 'grayscale(1)', display: 'inline-block' }}>
          <Label color={PALETTE.muted} size={11}>etcd</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 20, fontWeight: 800, marginTop: 4 }}>{"Pod{ ... }"}</div>
        </Box>
        <div style={{ fontFamily: SANS, color: PALETTE.muted, fontSize: 20, fontWeight: 700, marginTop: 12 }}>
          desired state — nothing is running
        </div>
      </div>
    </div>
  );
};

function MemberBox({
  x, y, role, index, ackOn, committed, opacity = 1,
}: {
  x: number; y: number; role: string; index: number;
  ackOn: boolean; committed: number; opacity?: number;
}) {
  const arrive = (index === 3 ? 1 : 1);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: arrive * opacity,
        transition: 'none',
      }}
    >
      <Box
        pad={12}
        border={2}
        borderColor={ackOn ? PALETTE.good : PALETTE.line}
        style={{
          width: 150,
          textAlign: 'center',
          background: ackOn ? `${PALETTE.good}1f` : PALETTE.panel,
          boxShadow: committed > 0 ? '0 0 20px 0 #22c55e33' : 'none',
        }}
      >
        <Label color={ackOn ? PALETTE.good : PALETTE.muted} size={11}>{role}</Label>
        <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 800 }}>etcd-{index + 1}</div>
        {ackOn && <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 13, fontWeight: 800 }}>ack ✓</div>}
      </Box>
    </div>
  );
}

function lerp(a: number, b: number, u: number) {
  return a + (b - a) * u;
}
