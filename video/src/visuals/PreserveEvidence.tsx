import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 22 beat 4 — preserve the perishable first. An evidence ladder ordered
 * by how quickly each item disappears, cheapest and most perishable first. A
 * restart happening early greys out the evidence it destroys — reaching for a
 * restart is costly precisely because it erases the context.
 */

const LADDER = [
  {
    n: '01',
    name: 'status · conditions · events',
    note: 'the object’s own record — cheapest to collect',
    life: 'lives in the API, cheap to read',
    color: PALETTE.good,
  },
  {
    n: '02',
    name: 'current & previous container logs · termination state',
    note: 'read lastState, exit code, OOMKilled',
    life: 'previous logs can be garbage-collected',
    color: PALETTE.good,
  },
  {
    n: '03',
    name: 'exec / ephemeral debug container',
    note: 'tools inside or an attached debug container',
    life: 'needs a running (or startable) container',
    color: PALETTE.cyan,
  },
  {
    n: '04',
    name: 'node journals · crictl',
    note: 'only when the kubelet or API path is unavailable',
    life: 'node-local, below the API boundary',
    color: PALETTE.violet,
  },
];

export const PreserveEvidence: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const rungOn = LADDER.map((_, i) => appear(t, 0.08 + i * 0.08, 0.15 + i * 0.08));
  const restart = seg(t, 0.46, 0.54);
  const erase = seg(t, 0.54, 0.7);
  const footer = appear(t, 0.86, 0.93);

  // the restart greys out rungs it destroys; later rungs survive
  const restarting = restart > 0.5;
  const faded = (i: number) => (restarting && i < 2) ? erase : restarting ? erase : 0;

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
      <div style={{ width: 1680, height: 740, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>order the investigation by perishability — collect the context before a restart destroys it</Label>
        </div>

        {/* the ladder */}
        <div style={{ position: 'absolute', left: 110, top: 52, width: 980, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {LADDER.map((r, i) => {
            const on = rungOn[i];
            const fade = faded(i);
            return (
              <div
                key={r.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  borderRadius: 14,
                  border: `2px solid ${r.color}55`,
                  background: '#0d1522',
                  padding: '13px 16px',
                  opacity: Math.max(0.3, on) * (1 - fade * 0.75),
                  filter: fade > 0.5 ? 'grayscale(1)' : 'none',
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: r.color, border: `1px solid ${r.color}`, borderRadius: 10, padding: '5px 9px' }}>
                  {r.n}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: MONO, fontSize: 16.5, fontWeight: 900, color: PALETTE.ink }}>{r.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 3 }}>{r.note}</div>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.amber, textAlign: 'right', maxWidth: 200 }}>
                  {fade > 0.5 ? 'destroyed by restart' : r.life}
                </span>
              </div>
            );
          })}
        </div>

        {/* the restart side */}
        <div style={{ position: 'absolute', left: 1130, top: 120, width: 460 }}>
          <div
            style={{
              borderRadius: 18,
              border: `2px solid ${PALETTE.bad}`,
              background: `${PALETTE.bad}0a`,
              padding: 18,
              textAlign: 'center',
              opacity: appear(t, 0.3, 0.4),
              boxShadow: restart > 0.5 ? `0 0 30px ${PALETTE.bad}33` : 'none',
            }}
          >
            <Label color={PALETTE.bad} size={12}>the impatient move</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900, marginTop: 10 }}>restart the container</div>
          </div>
          {restarting && (
            <div
              style={{
                marginTop: 12,
                borderRadius: 12,
                border: `1px solid ${PALETTE.bad}66`,
                background: `${PALETTE.bad}0a`,
                padding: '12px 14px',
                textAlign: 'center',
                opacity: erase,
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.bad, lineHeight: 1.4 }}>
                erases the running context that held the answer
              </div>
            </div>
          )}
          {faded(0) > 0.5 && (
            <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.amber, opacity: erase }}>
              the previous log — the thing you’d have read — greyed out and gone
            </div>
          )}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>restarting early is not a step in the investigation — it erases the evidence the investigation needed</Label>
        </div>
      </div>
    </div>
  );
};
