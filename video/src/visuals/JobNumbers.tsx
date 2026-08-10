import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const JobNumbers: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const left = appear(t, 0.2, 0.32);
  const right = appear(t, 0.5, 0.62);
  const backoff = seg(t, 0.6, 0.86);
  const footer = appear(t, 0.9, 0.97);

  const completions = 5;
  const parallelism = Math.max(1, Math.round(seg(t, 0.28, 0.44) * 4)); // 1..4
  const retries = Math.floor(backoff * 6); // 0..6 past backoffLimit=6

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 24, paddingLeft: 100, paddingRight: 100 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 30 }}>
        completions = how many successes you need · parallelism = how many Pods at once
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 60 }}>
        {/* dials + fan out */}
        <div style={{ width: 700, border: `1px solid ${PALETTE.blue}55`, borderRadius: 22, padding: 20, opacity: left }}>
          <div style={{ display: 'flex', gap: 40, marginBottom: 16 }}>
            <Dial label="completions" v={completions} />
            <Dial label="parallelism" v={parallelism} />
          </div>
          <Label color={PALETTE.muted} size={10} style={{ marginBottom: 8 }}>pods running now — fan out with parallelism</Label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Array.from({ length: Math.max(1, parallelism * 2) }).map((_, i) => (
              <div key={i} style={{ width: 52, height: 40, borderRadius: 8, border: `1px solid ${PALETTE.blue}`, background: `${PALETTE.blue}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 12, color: PALETTE.blue, fontWeight: 900 }}>
                pod
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, marginTop: 10 }}>
            set parallelism higher → it fans out
          </div>
        </div>

        {/* backoff */}
        <div style={{ width: 560, border: `1px solid ${PALETTE.amber}55`, borderRadius: 22, padding: 20, opacity: right }}>
          <Label color={PALETTE.amber} size={13} style={{ marginBottom: 12 }}>backoffLimit — retries before giving up</Label>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 80 }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const done = i < retries || (retries >= 6 && i === 6);
              const color = done ? PALETTE.bad : PALETTE.line;
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: 40, height: 34 + i * 6, borderRadius: 6, background: color, opacity: done ? 0.85 : 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 11, fontWeight: 900, color: done ? '#fff' : PALETTE.line }}>
                    ✕
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.muted, marginTop: 4 }}>r{i + 1}</div>
                </div>
              );
            })}
          </div>
          {retries >= 6 && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 20, fontWeight: 900, border: `2px solid ${PALETTE.bad}`, borderRadius: 6, padding: '2px 16px', transform: 'rotate(-4deg)', display: 'inline-block' }}>
                ✕ Job FAILED
              </span>
            </div>
          )}
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, marginTop: 12 }}>
            get backoffLimit wrong and a Job that should have alerted you retries quietly
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>find the balance — and track the bill</Label>
      </div>
    </div>
  );
};

function Dial({ label, v }: { label: string; v: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <Label color={PALETTE.muted} size={11}>{label}</Label>
      <div style={{ fontFamily: MONO, color: PALETTE.blue, fontSize: 52, fontWeight: 900, lineHeight: 1, marginTop: 6 }}>{v}</div>
    </div>
  );
}
