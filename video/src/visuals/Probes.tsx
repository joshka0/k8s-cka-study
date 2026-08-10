import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Horizontal, Label, SANS, MONO, ArrowGlyph, Dot } from '../ui';
import type { Beat } from '../script';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Shared pilot component; module 07 beat 7 extends it. The pilot beat has no
 * `module` prop and renders exactly as before; the module beat renders the
 * extended version — a consequence column (startup gates the others, liveness
 * restarts the container, readiness leaves endpoints), then the trap: a
 * liveness probe pointed at a slow dependency, restarting on a timer, with
 * the restart count climbing and the dependency no healthier.
 */
export const Probes: React.FC<VisualProps> = ({ module }) => {
  if (module) return <ModuleProbes />;
  return <PilotProbes />;
};

/** The pilot beat 12 — unchanged. */
const PilotProbes: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const phaseRunning = appear(t, 0.05, 0.16);
  const notReady = appear(t, 0.18, 0.26);
  const startupPhase = seg(t, 0.28, 0.44);
  const startupLift = seg(t, 0.44, 0.52);
  const livenessPhase = seg(t, 0.5, 0.64);
  const readinessPhase = seg(t, 0.64, 0.82);
  const contrast = seg(t, 0.84, 1);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* pod running ≠ ready */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22 }}>
        <Box pad={14} borderColor={PALETTE.good} style={{ position: 'relative', textAlign: 'center', width: 250 }}>
          <Horizontal center gap={8}>
            <Dot color={PALETTE.good} />
            <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 24, fontWeight: 900 }}>Running</span>
          </Horizontal>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, marginTop: 4 }}>process started</div>
        </Box>
        <span
          style={{
            fontFamily: SANS,
            color: PALETTE.amber,
            fontSize: 46,
            fontWeight: 900,
            opacity: notReady,
            transform: `rotate(-6deg)`,
            textShadow: `0 0 20px ${PALETTE.amber}55`,
          }}
        >
          ≠ Ready
        </span>
      </div>

      {/* three probe rows */}
      <ProbeRow
        name="startup"
        color={PALETTE.amber}
        prog={startupPhase}
        lift={startupLift}
        state={startupPhase}
        during="gating the others — barrier"
        effect={
          startupLift > 0.5 ? (
            <span style={{ color: PALETTE.good }}>barrier lifts → liveness & readiness may run</span>
          ) : (
            <span style={{ color: PALETTE.amber }}>holds liveness + readiness back while booting</span>
          )
        }
        kind="barrier"
      />
      <ProbeRow
        name="liveness"
        color={PALETTE.bad}
        prog={livenessPhase}
        lift={0}
        state={livenessPhase}
        during="process wedges →"
        effect={
          livenessPhase > 0.6 ? (
            <Horizontal center gap={8}>
              <span style={{ color: PALETTE.bad }}>restart container</span>
              <span style={{ color: PALETTE.good, fontSize: 20 }}>↻</span>
            </Horizontal>
          ) : (
            <span style={{ color: PALETTE.muted }}>failing →</span>
          )
        }
        kind="restart"
      />
      <ProbeRow
        name="readiness"
        color={PALETTE.cyan}
        prog={readinessPhase}
        lift={0}
        state={readinessPhase}
        during="failing →"
        effect={
          readinessPhase > 0.7 ? (
            <span style={{ color: PALETTE.cyan }}>
              <span style={{ color: PALETTE.amber }}>no restart</span> — pod stays up · traffic arrow cut ⤬
            </span>
          ) : (
            <span style={{ color: PALETTE.muted }}>failing →</span>
          )
        }
        kind="cut"
      />

      <div style={{ textAlign: 'center', opacity: contrast }}>
        <Label color={PALETTE.amber} size={13}>
          liveness restarts · readiness does not — it only controls traffic
        </Label>
      </div>
      <div style={{ textAlign: 'center', opacity: appear(t, 0.8, 0.9) }}>
        <Label color={PALETTE.muted} size={12}>a slow dependency becomes an endless restart loop when the two are confused</Label>
      </div>
    </div>
  );
};

function ProbeRow({
  name, color, prog, state, during, effect, kind, lift,
}: {
  name: string; color: string; prog: number; state: number; during: React.ReactNode; effect: React.ReactNode;
  kind: 'barrier' | 'restart' | 'cut'; lift: number;
}) {
  const active = state > 0.1;
  const run = kind === 'barrier' ? lift > 0.5 || name === 'liveness' || name === 'readiness' : active;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '12px 18px',
        border: `1px solid ${active ? color : PALETTE.line}`,
        borderRadius: 16,
        background: active ? `${color}10` : '#0e1522',
        opacity: active ? 1 : 0.55,
        width: 1500,
        margin: '0 auto',
      }}
    >
      <span style={{ fontFamily: MONO, color, fontSize: 20, fontWeight: 900, width: 120 }}>{name}</span>
      <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, width: 170 }}>{during}</span>
      <div style={{ flex: 1, textAlign: 'left', fontFamily: MONO, fontSize: 16, fontWeight: 700 }}>{effect}</div>
      <span
        style={{
          fontFamily: SANS,
          color: run ? PALETTE.good : PALETTE.muted,
          fontSize: 18,
          fontWeight: 900,
          border: `1px solid ${run ? PALETTE.good : PALETTE.line}`,
          borderRadius: 999,
          padding: '6px 14px',
        }}
      >
        {name === 'liveness' ? (active ? 'restart' : 'run') : name === 'readiness' ? (active ? 'no restart' : 'run') : run ? 'running' : 'holding'}
      </span>
    </div>
  );
}

/**
 * Module 07 beat 7. The three probes with a consequence column, then the
 * trap: a liveness probe pointed at a slow dependency, restarting on a
 * timer, restart count climbing, dependency no healthier.
 */

const ROWS = [
  {
    name: 'startup',
    color: PALETTE.amber,
    during: 'slow app initialising →',
    effect: 'holds liveness + readiness back as a barrier; passes → they may run',
    consequence: 'gates the others — nothing else runs until it passes',
  },
  {
    name: 'liveness',
    color: PALETTE.bad,
    during: 'process wedges →',
    effect: 'restarts the container ↻',
    consequence: 'restarts the container',
  },
  {
    name: 'readiness',
    color: PALETTE.cyan,
    during: 'failing →',
    effect: 'removes the Pod from endpoints — no restart, traffic cut ⤬',
    consequence: 'leaves endpoints',
  },
];

const ModuleProbes: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const podRow = appear(t, 0.05, 0.12);
  const rowOn = ROWS.map((_, i) => appear(t, 0.14 + i * 0.09, 0.22 + i * 0.09));
  const trapTitle = appear(t, 0.5, 0.56);
  const trapIn = appear(t, 0.52, 0.6);
  const footer = appear(t, 0.88, 0.94);

  // The restart loop: two full cycles of 1..4 with the dependency never
  // getting healthier.
  const loop = seg(t, 0.5, 0.95);
  const cycle = (loop * 8) % 4;
  const restartNo = 1 + Math.floor(cycle);
  const spin = frame % 40;
  const health = 0.18 + 0.02 * Math.sin(frame / 11);

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
      <div style={{ width: 1640, height: 760, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>three probes, three jobs — choosing the wrong one is the classic mistake</Label>
        </div>

        {/* running ≠ ready, compact */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 36,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20,
            opacity: podRow,
          }}
        >
          <Box pad={10} borderColor={PALETTE.good} style={{ textAlign: 'center', width: 210 }}>
            <Horizontal center gap={8}>
              <Dot color={PALETTE.good} />
              <span style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 20, fontWeight: 900 }}>Running</span>
            </Horizontal>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, marginTop: 2 }}>process started</div>
          </Box>
          <span style={{ fontFamily: SANS, color: PALETTE.amber, fontSize: 36, fontWeight: 900, transform: 'rotate(-6deg)' }}>≠ Ready</span>
          <Box pad={10} borderColor={PALETTE.line} style={{ textAlign: 'center', width: 260 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700 }}>three probes answer “will it accept traffic” — not “is it alive”</div>
          </Box>
        </div>

        {/* the three rows with their own consequence labels */}
        {ROWS.map((r, i) => {
          const on = rowOn[i];
          return (
            <div
              key={r.name}
              style={{
                position: 'absolute',
                left: 70,
                top: 118 + i * 88,
                width: 1500,
                height: 76,
                borderRadius: 14,
                border: `2px solid ${on > 0.5 ? r.color : PALETTE.line}`,
                background: on > 0.5 ? `${r.color}10` : '#0e1522',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '0 18px',
                opacity: Math.max(0.4, on),
                boxShadow: on > 0.5 ? `0 0 14px ${r.color}33` : 'none',
              }}
            >
              <span style={{ fontFamily: MONO, color: r.color, fontSize: 18, fontWeight: 900, width: 110, flex: '0 0 auto' }}>{r.name}</span>
              <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, width: 210, flex: '0 0 auto' }}>{r.during}</span>
              <span style={{ flex: 1, fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: PALETTE.ink }}>{r.effect}</span>
              <span
                style={{
                  flex: '0 0 auto',
                  fontFamily: MONO,
                  fontSize: 15,
                  fontWeight: 900,
                  color: r.color,
                  border: `1px solid ${r.color}77`,
                  background: `${r.color}12`,
                  borderRadius: 999,
                  padding: '8px 16px',
                  lineHeight: 1.3,
                  textAlign: 'center',
                }}
              >
                {r.consequence}
              </span>
            </div>
          );
        })}

        {/* the trap */}
        <div style={{ position: 'absolute', left: 70, top: 400, opacity: trapTitle }}>
          <Label color={PALETTE.bad} size={12.5}>the trap — a liveness probe pointed at a slow dependency</Label>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 70,
            top: 426,
            width: 1500,
            height: 200,
            borderRadius: 18,
            border: `2px solid ${PALETTE.bad}55`,
            background: `${PALETTE.bad}08`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 60,
            opacity: trapIn,
          }}
        >
          {/* liveness probe */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: MONO,
                color: PALETTE.bad,
                fontSize: 19,
                fontWeight: 900,
                border: `2px solid ${PALETTE.bad}`,
                borderRadius: 12,
                background: `${PALETTE.bad}10`,
                padding: '12px 18px',
                whiteSpace: 'nowrap',
              }}
            >
              liveness probe
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8 }}>
              probes the dependency on a timer
            </div>
          </div>

          <ArrowGlyph color={PALETTE.bad} size={30} />

          {/* slow dependency */}
          <div style={{ textAlign: 'center', width: 300 }}>
            <div
              style={{
                fontFamily: MONO,
                color: PALETTE.ink,
                fontSize: 18,
                fontWeight: 900,
                border: `2px solid ${PALETTE.violet}`,
                borderRadius: 12,
                background: `${PALETTE.violet}10`,
                padding: '12px 18px',
              }}
            >
              slow dependency
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 800, marginBottom: 4 }}>health</div>
              <div
                style={{
                  width: 240,
                  height: 14,
                  borderRadius: 999,
                  background: '#0c111c',
                  border: `1px solid ${PALETTE.line}`,
                  margin: '0 auto',
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
                    width: `${health * 100}%`,
                    background: PALETTE.bad,
                    opacity: 0.85,
                  }}
                />
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                ~{Math.round(health * 100)}% — no healthier
              </div>
            </div>
          </div>

          {/* the restart counter */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: MONO,
                color: PALETTE.bad,
                fontSize: 21,
                fontWeight: 900,
                border: `2px solid ${PALETTE.bad}`,
                borderRadius: 12,
                background: `${PALETTE.bad}14`,
                padding: '12px 22px',
                whiteSpace: 'nowrap',
              }}
            >
              restart #{restartNo} <span style={{ display: 'inline-block', transform: `rotate(${spin}deg)` }}>↻</span>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8 }}>
              the restarts make it worse
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a liveness probe pointed at a slow dependency turns that dependency into a restart loop — and the restarts make it worse</Label>
        </div>
      </div>
    </div>
  );
};
