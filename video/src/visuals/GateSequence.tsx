import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Horizontal, Label, SANS, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const GATES = [
  { label: 'who?', sub: 'authn' },
  { label: 'may they?', sub: 'authz · RBAC' },
  { label: 'mutate', sub: 'admission' },
  { label: 'validate', sub: 'admission' },
  { label: 'persist', sub: 'etcd + watchers' },
];

export const GateSequence: React.FC<VisualProps> = ({ module }) => {
  if (module) return <ModuleGateSequence />;
  return <PilotGateSequence />;
};

/**
 * Module 02 — gates three and four, and why mutation must be idempotent.
 * The mutation gate is run twice: an idempotent mutation stays stable, a
 * non-idempotent one appends a second sidecar (flagged red).
 */
const ModuleGateSequence: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const gates = appear(t, 0.14, 0.24);
  const run = (i: number) => seg(t, 0.3 + i * 0.16, 0.42 + i * 0.16);
  const verdict = (i: number) => appear(t, 0.44 + i * 0.16, 0.52 + i * 0.16);
  const footer = appear(t, 0.86, 0.94);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 26, paddingLeft: 120, paddingRight: 120 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        gates three and four are admission — mutation first, then validation of the final object
      </Label>

      {/* the two gates */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, opacity: gates }}>
        <SmallGate label="mutate" sub="may change the object" color={PALETTE.amber} />
        <SmallGate label="validate" sub="may only accept or reject" color={PALETTE.good} />
      </div>

      {/* two runs: idempotent vs non-idempotent */}
      <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center', gap: 60 }}>
        <Box pad={16} borderColor={PALETTE.good} style={{ width: 620, textAlign: 'center', opacity: appear(t, 0.24, 0.32) }}>
          <Label color={PALETTE.good} size={13} style={{ marginBottom: 12 }}>idempotent mutation — runs twice, stays stable</Label>
          <ObjectChips pass={run(0)} dup={false} />
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 16, fontWeight: 800, marginTop: 10, opacity: verdict(0) }}>
            ✓ second run: no change
          </div>
        </Box>

        <Box pad={16} borderColor={PALETTE.bad} style={{ width: 620, textAlign: 'center', opacity: appear(t, 0.56, 0.66) }}>
          <Label color={PALETTE.bad} size={13} style={{ marginBottom: 12 }}>non-idempotent mutation — second sidecar appended</Label>
          <ObjectChips pass={run(1)} dup />
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 16, fontWeight: 800, marginTop: 10, opacity: verdict(1) }}>
            ✕ injected the same sidecar twice
          </div>
        </Box>
      </div>

      <div style={{ textAlign: 'center', marginTop: 28, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>a mutation can run more than once — other webhooks edit the object too</Label>
      </div>
    </div>
  );
};

function SmallGate({ label, sub, color }: { label: string; sub: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <Box pad={12} borderColor={color} style={{ width: 260, textAlign: 'center', background: `${color}0e` }}>
        <div style={{ fontFamily: MONO, color, fontSize: 24, fontWeight: 900 }}>{label}</div>
        <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, marginTop: 4, fontWeight: 700 }}>{sub}</div>
      </Box>
    </div>
  );
}

function ObjectChips({ pass, dup }: { pass: number; dup: boolean }) {
  const sidecars = dup && pass > 0.2 ? 2 : 1;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, minHeight: 60 }}>
      <Box pad={10} borderColor={PALETTE.cyan}>
        <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900 }}>Pod</div>
      </Box>
      {pass > 0.1 && (
        <>
          {Array.from({ length: sidecars }).map((_, i) => (
            <Box key={i} pad={10} borderColor={dup ? PALETTE.bad : PALETTE.good}
              style={{ background: dup ? `${PALETTE.bad}14` : `${PALETTE.good}14` }}>
              <div style={{ fontFamily: MONO, color: dup ? PALETTE.bad : PALETTE.good, fontSize: 15, fontWeight: 900 }}>
                + sidecar {i + 1}
              </div>
            </Box>
          ))}
        </>
      )}
    </div>
  );
}

const PilotGateSequence: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const gateW = 168;
  const gap = 34;
  const totalW = GATES.length * gateW + (GATES.length - 1) * gap;
  const startX = (1768 - totalW) / 2 + gateW / 2;

  const fwd = seg(t, 0.1, 0.58); // forward pass 0..1
  const replay = seg(t, 0.68, 0.9); // replay 0..1 up to gate 3 (validate)
  const bounced = seg(t, 0.9, 0.98);
  const useReplay = t >= 0.68;

  const path0 = startX - 130;
  const path1 = startX + (GATES.length - 1) * (gateW + gap) + 130;
  const u = useReplay ? replay : fwd;
  const tokenTarget = (gIdx: number) => startX + gIdx * (gateW + gap);
  const tokenX = useReplay
    ? lerp(path0, tokenTarget(3), u)
    : lerp(path0, path1, u);

  const shake = bounced > 0 ? Math.sin(bounced * 40) * 24 * bounced : 0;
  const tokenRejected = useReplay && bounced > 0;

  // gate pass detection
  const isPassing = (gIdx: number) => {
    const passU = gIdx / (GATES.length - 1);
    if (useReplay) return false;
    return Math.abs(u - passU) < 0.07;
  };
  const mutateActive = useReplay ? false : u > 1 / 4 && u < 2 / 4;

  return (
    <div style={{ position: 'absolute', inset: 0, paddingTop: 120 }}>
      {/* object above, gains a container at the mutate gate */}
      <div style={{ position: 'absolute', top: 30, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Box pad={14}>
          <Label color={PALETTE.muted} size={11} style={{ marginBottom: 6 }}>object</Label>
          <Horizontal gap={8} center>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 700 }}>Pod</span>
            <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 16, fontWeight: 700 }}>app</span>
            {mutateActive && (
              <span style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 16, fontWeight: 700, opacity: appear(t, 0.28, 0.34) }}>
                + sidecar
              </span>
            )}
          </Horizontal>
        </Box>
      </div>

      {/* token */}
      <div
        style={{
          position: 'absolute',
          top: 128,
          left: tokenX - 40 + shake,
          width: 80,
          height: 34,
          borderRadius: 8,
          background: tokenRejected ? PALETTE.bad : PALETTE.cyan,
          color: '#051022',
          fontFamily: MONO,
          fontSize: 15,
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: tokenRejected ? `0 0 26px ${PALETTE.bad}` : `0 0 18px ${PALETTE.cyan}55`,
          opacity: useReplay && u === 0 ? 0.3 : 1,
        }}
      >
        { tokenRejected ? '⛔' : 'req' }
      </div>

      {/* gates row */}
      <Horizontal center style={{ marginTop: 60 }}>
        {GATES.map((g, i) => {
          const passing = isPassing(i) && !useReplay;
          const rejected = useReplay && i === 3 && bounced > 0;
          const flash = passing ? `0 0 0 4px ${PALETTE.good}aa` : 'none';
          const color = rejected ? PALETTE.bad : passing ? PALETTE.good : i === 3 ? PALETTE.amber : PALETTE.blue;
          return (
            <div key={g.label} style={{ textAlign: 'center' }}>
              <Box
                border={2}
                borderColor={rejected ? PALETTE.bad : passing ? PALETTE.good : PALETTE.line}
                pad={12}
                style={{
                  width: gateW,
                  height: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: flash,
                  background: rejected ? `${PALETTE.bad}22` : `${color}14`,
                }}
              >
                <div style={{ fontFamily: SANS, color, fontSize: 22, fontWeight: 900 }}>{g.label}</div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, marginTop: 6, fontWeight: 700 }}>{g.sub}</div>
                {i === 3 && rejected && (
                  <Label color={PALETTE.bad} size={10} style={{ marginTop: 8 }}>webhook timeout</Label>
                )}
              </Box>
            </div>
          );
        })}
      </Horizontal>

      <div style={{ textAlign: 'center', marginTop: 30, opacity: appear(t, 0.6, 0.66) }}>
        <Label color={PALETTE.muted} size={13}>order matters — mutation first, then validation of the final object</Label>
      </div>

      {useReplay && (
        <div style={{ textAlign: 'center', marginTop: 8, opacity: appear(t, 0.72, 0.8) }}>
          <Label color={PALETTE.bad} size={13}>RBAC allows it · still rejected → think admission webhooks, schema, quota, immutable fields</Label>
        </div>
      )}
    </div>
  );
};

function lerp(a: number, b: number, u: number) {
  return a + (b - a) * u;
}
