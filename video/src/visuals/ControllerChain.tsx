import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Horizontal, Label, SANS, MONO, ArrowGlyph } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const ControllerChain: React.FC<VisualProps> = ({ module }) => {
  if (module?.module.number === 1) return <ModuleChain01 />;
  if (module?.module.number === 3) return <ModuleLoop03 />;
  return <PilotControllerChain />;
};

/**
 * Module 01 — the-chain. The Deployment chain extended all the way down to
 * containers: Deployment → ReplicaSet → Pods → binding → kubelet → containers.
 * Each hop shows the object that triggered it; no single arrow spans the chain.
 */
const ModuleChain01: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const hop = (i: number) => appear(t, 0.1 + i * 0.1, 0.16 + i * 0.1);
  const done = appear(t, 0.78, 0.88);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 30, paddingLeft: 60, paddingRight: 60 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 34 }}>
        four independent loops, each triggered by an API object the previous one wrote
      </Label>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <ChainObj name="Deployment" color={PALETTE.blue} op={hop(0)} />
        <ChainCtrl name="Deployment ctrl" color={PALETTE.blue} op={hop(1)} />
        <ArrowGlyph color={PALETTE.muted} size={24} style={{ opacity: hop(1) }} />
        <ChainObj name="ReplicaSet" color={PALETTE.violet} op={hop(2)} />
        <ChainCtrl name="ReplicaSet ctrl" color={PALETTE.violet} op={hop(3)} />
        <ArrowGlyph color={PALETTE.muted} size={24} style={{ opacity: hop(3) }} />
        <ChainObj name="Pods" color={PALETTE.cyan} op={hop(4)} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 30, flexWrap: 'wrap' }}>
        <ChainCtrl name="scheduler" color={PALETTE.amber} op={hop(5)} />
        <ArrowGlyph color={PALETTE.muted} size={24} style={{ opacity: hop(5) }} />
        <ChainObj name="binding (nodeName)" color={PALETTE.blue} op={hop(6)} />
        <ArrowGlyph color={PALETTE.muted} size={24} style={{ opacity: hop(6) }} />
        <ChainCtrl name="kubelet" color={PALETTE.violet} op={hop(7)} />
        <ArrowGlyph color={PALETTE.muted} size={24} style={{ opacity: hop(7) }} />
        <ChainObj name="containers" color={PALETTE.good} op={hop(8)} />
      </div>

      <div style={{ textAlign: 'center', marginTop: 40, opacity: done }}>
        <Label color={PALETTE.amber} size={13}>no single arrow spans the chain — none of the loops is aware of the others</Label>
      </div>
    </div>
  );
};

function ChainObj({ name, color, op }: { name: string; color: string; op: number }) {
  return (
    <Box pad={12} borderColor={color} style={{ opacity: op, textAlign: 'center', minWidth: 150, transform: `translateY(${(1 - op) * 12}px)` }}>
      <div style={{ fontFamily: MONO, color, fontSize: 18, fontWeight: 900 }}>{name}</div>
    </Box>
  );
}

function ChainCtrl({ name, color, op }: { name: string; color: string; op: number }) {
  return (
    <Box pad={10} borderColor={color} style={{ opacity: op, textAlign: 'center', display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 20, color }}>↻</span>
      <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14, fontWeight: 800 }}>{name}</div>
    </Box>
  );
}

/**
 * Module 03 — the-loop. Hold on observe / compare / act: the controller is
 * killed mid-cycle and restarted, and the next pass reaches the same result.
 */
const ModuleLoop03: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const intro = appear(t, 0.1, 0.2);
  const cycleA = seg(t, 0.2, 0.5);
  const kill = seg(t, 0.52, 0.62);
  const restart = seg(t, 0.68, 0.76);
  const cycleB = seg(t, 0.78, 0.94);
  const footer = appear(t, 0.88, 0.96);

  const stepOf = (c: number) => Math.floor(c * 3);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 40, paddingLeft: 100, paddingRight: 100 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 36 }}>
        a controller does three things forever — observe, compare, act
      </Label>

      {/* the cycle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 22, opacity: intro }}>
        {['observe', 'compare', 'act'].map((s, i) => {
          const active = (cycleA > 0 && stepOf(cycleA) === i) || (cycleB > 0 && stepOf(cycleB) === i);
          const dead = kill > 0 && restart === 0;
          return (
            <div key={s} style={{ textAlign: 'center' }}>
              <Box
                pad={18}
                borderColor={dead ? PALETTE.bad : active ? PALETTE.good : PALETTE.line}
                style={{
                  width: 250,
                  textAlign: 'center',
                  background: dead ? `${PALETTE.bad}0e` : active ? `${PALETTE.good}14` : `${PALETTE.panel}`,
                  boxShadow: dead ? `0 0 20px ${PALETTE.bad}44` : active ? `0 0 18px ${PALETTE.good}44` : 'none',
                }}
              >
                <div style={{ fontFamily: MONO, color: dead ? PALETTE.bad : active ? PALETTE.good : PALETTE.ink, fontSize: 30, fontWeight: 900 }}>{s}</div>
              </Box>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 30, minHeight: 56 }}>
        {cycleA > 0 && restart === 0 && (
          <Box pad={12} borderColor={kill > 0 ? PALETTE.bad : PALETTE.line} style={{ display: 'inline-block', opacity: 0.4 + cycleA * 0.6 }}>
            <span style={{ fontFamily: MONO, color: kill > 0 ? PALETTE.bad : PALETTE.muted, fontSize: 18, fontWeight: 800 }}>
              pass one — recomputes from current state
            </span>
          </Box>
        )}
        {kill > 0 && restart === 0 && (
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 20, fontWeight: 900, marginTop: 10 }}>✕ killed mid-work</div>
        )}
        {restart > 0 && (
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 18, fontWeight: 900, marginTop: 6 }}>
            ↻ restarted — no recovery logic, next pass reaches the same result
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>no state machine, no progress counter — each pass recomputes the answer from scratch</Label>
      </div>
    </div>
  );
};

const PilotControllerChain: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const build = t < 0.5;
  const cycle = seg(t, 0.5, 0.66);
  const drop = seg(t, 0.68, 0.8);
  const resync = seg(t, 0.82, 0.95);

  const dObj = appear(t, 0.06, 0.12);
  const dCtrl = appear(t, 0.14, 0.2);
  const rsObj = appear(t, 0.22, 0.28);
  const rsCtrl = appear(t, 0.3, 0.36);
  const pod = appear(t, 0.38, 0.46);

  const pods = ['pod', 'pod', 'pod'];

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* horizontal chain */}
      <Horizontal center gap={14} style={{ marginTop: 60 }}>
        <Obj label="Deployment" color={PALETTE.blue} op={dObj} />
        <ControllerLoop label="Deployment controller" color={PALETTE.blue} cycle={cycle} op={dCtrl} />
        <ArrowGlyph color={PALETTE.muted} size={26} />
        <Obj label="ReplicaSet" color={PALETTE.violet} op={rsObj} />
        <ControllerLoop label="ReplicaSet controller" color={PALETTE.violet} cycle={cycle} op={rsCtrl} />
        <ArrowGlyph color={PALETTE.muted} size={26} />
        <Horizontal gap={8}>
          {pods.map((p, i) => (
            <Box key={i} pad={12} borderColor={PALETTE.cyan} style={{ opacity: appear(t, 0.38 + i * 0.03, 0.46 + i * 0.03) }}>
              <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 18, fontWeight: 800 }}>{p}</div>
            </Box>
          ))}
        </Horizontal>
      </Horizontal>

      {/* observe / compare / act cycle */}
      <Horizontal center gap={16} style={{ marginTop: 60, justifyContent: 'center' }}>
        {['observe', 'compare', 'act'].map((step, i) => {
          const on = cycle > 0 && Math.floor(cycle * 3) === i;
          return (
            <Box
              key={step}
              pad={14}
              borderColor={on ? PALETTE.good : PALETTE.line}
              style={{
                width: 190,
                textAlign: 'center',
                opacity: appear(t, 0.5 + i * 0.03, 0.54 + i * 0.03),
                background: on ? `${PALETTE.good}1f` : PALETTE.panel,
              }}
            >
              <div style={{ fontFamily: MONO, color: on ? PALETTE.good : PALETTE.ink, fontSize: 24, fontWeight: 900 }}>{step}</div>
              {i < 2 && <ArrowGlyph color={PALETTE.muted} deg={90} style={{ margin: '4px 0' }} />}
            </Box>
          );
        })}
        <ArrowGlyph color={PALETTE.good} size={26} style={{ opacity: cycle }} />
      </Horizontal>
      <div style={{ textAlign: 'center', marginTop: 10, opacity: cycle }}>
        <Label color={PALETTE.muted} size={12}>level-based · asks what should be true now, not a history of events</Label>
      </div>

      {/* watch drop / resync */}
      <div style={{ marginTop: 46, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <Horizontal center gap={14}>
          <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 16, fontWeight: 800 }}>API watch</span>
          <div style={{ width: 220, position: 'relative', height: 26 }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 12,
                borderTop: `2px solid ${PALETTE.cyan}`,
                opacity: t > 0.62 && t < 0.8 ? 1 - drop : 0.3,
                borderTopStyle: 'dashed',
              }}
            />
            {drop > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: lerp(0, 220, Math.min(drop * 2, 0.6)) - 14,
                  top: 0,
                  fontSize: 18,
                  color: PALETTE.bad,
                  opacity: drop > 0.2 ? 1 : 0,
                }}
              >
                ✕
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                left: len(resync, 0, 1),
                top: 12,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: PALETTE.good,
                boxShadow: `0 0 10px ${PALETTE.good}`,
                opacity: resync > 0.05 ? 1 : 0,
              }}
            />
          </div>
          <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 14, fontWeight: 800, opacity: resync }}>
            resync → same answer ✓
          </span>
        </Horizontal>
        <div style={{ opacity: appear(t, 0.78, 0.88) }}>
          <Label color={PALETTE.muted} size={12}>a dropped watch event costs latency, never correctness</Label>
        </div>
      </div>
    </div>
  );
};

function Obj({ label, color, op }: { label: string; color: string; op: number }) {
  return (
    <Box pad={14} borderColor={color} style={{ opacity: op, textAlign: 'center', minWidth: 150 }}>
      <div style={{ fontFamily: MONO, color, fontSize: 22, fontWeight: 900 }}>{label}</div>
    </Box>
  );
}

function ControllerLoop({ label, color, cycle, op }: { label: string; color: string; cycle: number; op: number }) {
  const spinning = Math.floor(cycle * 3) % 3;
  return (
    <Box pad={14} style={{ opacity: op, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span
        style={{
          display: 'inline-block',
          fontSize: 30,
          color,
          transform: `rotate(${cycle * 180}deg)`,
        }}
      >
        ↻
      </span>
      <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800 }}>{label}</div>
      <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12 }}>#{spinning + 1}</div>
    </Box>
  );
}

function lerp(a: number, b: number, u: number) {
  return a + (b - a) * u;
}
function len(v: number, a: number, b: number) {
  return a + (b - a) * v;
}
