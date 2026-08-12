import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 20 beat 6 — the log you actually need. A container restarting
 * repeatedly, with the previous instance's log and its lastState retained as
 * evidence — but only until the runtime garbage-collects them. Four terminal
 * causes map to what each leaves behind: exit code, signal, OOM flag, probe
 * failure event.
 *
 * CORRECTION honouring: the previous container's log is NOT always available —
 * it survives only until the runtime GCs it. And probe-driven restarts often
 * look like a signal in lastState, so events are what separates them.
 */

const CAUSES = [
  { cause: 'process exit', leaves: 'a non-zero exit code', color: PALETTE.blue },
  { cause: 'a signal', leaves: 'the signal number in lastState', color: PALETTE.cyan },
  { cause: 'out-of-memory kill', leaves: 'the OOMKilled flag', color: PALETTE.amber },
  { cause: 'a probe-driven restart', leaves: 'a probe failure event — lastState only looks like a signal', color: PALETTE.violet },
];

export const PreviousLogs: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const restartIn = appear(t, 0.08, 0.16);
  const retainedIn = appear(t, 0.2, 0.3);
  const gcIn = seg(t, 0.34, 0.46);
  const causeOn = CAUSES.map((_, i) => appear(t, 0.4 + i * 0.07, 0.48 + i * 0.07));
  const footer = appear(t, 0.9, 0.97);

  const startGC = gcIn > 0.5;

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
          <Label color={PALETTE.cyan} size={13}>when a container restarts too fast to inspect, use the same Pod identity — but quickly</Label>
        </div>

        {/* the restarting container */}
        <div style={{ position: 'absolute', left: 120, top: 64, width: 700, borderRadius: 18, border: `2px solid ${PALETTE.line}55`, background: '#0d1522', padding: '18px 22px', opacity: restartIn }}>
          <Label color={PALETTE.ink} size={12} style={{ marginBottom: 10 }}>a container restarting repeatedly</Label>
          <div style={{ display: 'flex', gap: 10 }}>
            {['1', '2', '3', '…', '6'].map((n, i) => {
              const gone = startGC && i < 2; // the oldest instances have already been GC'd
              return (
                <div key={n} style={{ flex: 1, textAlign: 'center', borderRadius: 10, border: `1px solid ${gone ? PALETTE.line : PALETTE.amber}55`, background: gone ? 'transparent' : `${PALETTE.amber}08`, padding: '10px 6px' }}>
                  <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 800, color: gone ? PALETTE.line : PALETTE.amber }}>
                    restarted #{n}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: PALETTE.muted, marginTop: 6, textDecoration: gone ? 'line-through' : 'none', textDecorationColor: PALETTE.bad }}>
                    {gone ? 'log gone' : 'log retained'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* lastState */}
          <div style={{ marginTop: 14, borderRadius: 10, border: `1px solid ${PALETTE.cyan}55`, background: `${PALETTE.cyan}05`, padding: '11px 14px' }}>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.cyan }}>lastState (previous instance)</div>
            <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, marginTop: 6, lineHeight: 1.5 }}>
              exit code · signal · OOMKilled <span style={{ color: PALETTE.amber, fontWeight: 800 }}>— the retained evidence</span>
            </div>
          </div>
        </div>

        {/* GC note */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 380,
            width: 700,
            borderRadius: 14,
            border: `2px dashed ${PALETTE.bad}55`,
            background: `${PALETTE.bad}05`,
            padding: '14px 18px',
            opacity: gcIn,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.bad, lineHeight: 1.4 }}>
            but the previous log survives only until the runtime garbage-collects it — it is not always available
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 8, lineHeight: 1.4 }}>
            read it early, or the only trace you have is lastState — which is ambiguous
          </div>
        </div>

        {/* the four causes */}
        <div style={{ position: 'absolute', right: 60, top: 64, width: 860 }}>
          <Label color={PALETTE.amber} size={12} style={{ marginBottom: 12 }}>map the terminal cause to what it leaves behind</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {CAUSES.map((c, i) => {
              const on = causeOn[i];
              return (
                <div key={c.cause} style={{ display: 'flex', alignItems: 'center', gap: 14, borderRadius: 13, border: `2px solid ${on > 0.5 ? c.color : PALETTE.line}55`, background: on > 0.5 ? `${c.color}06` : '#101826', padding: '12px 16px', opacity: Math.max(0.3, on) }}>
                  <div style={{ flex: '0 0 200px', fontFamily: MONO, color: PALETTE.ink, fontSize: 15.5, fontWeight: 900 }}>{c.cause}</div>
                  <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: on > 0.5 ? PALETTE.muted : PALETTE.muted, lineHeight: 1.35 }}>
                    ← <span style={{ color: on > 0.5 ? c.color : PALETTE.ink }}>{c.leaves}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted, lineHeight: 1.4 }}>
            a process exit, a signal, an OOM kill and a probe-driven restart each leave a <span style={{ color: PALETTE.good }}>different</span> trace — events separate them
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>read lastState for exit code, signal and OOMKilled; then read events for probe failures — they separate the causes</Label>
        </div>
      </div>
    </div>
  );
};
