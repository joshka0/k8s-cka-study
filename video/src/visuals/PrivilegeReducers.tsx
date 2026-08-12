import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 27 beat 4 — what actually reduces privilege at runtime. Each setting
 * removes a specific capability or syscall surface, drawn as the boundary
 * shrinking. Beside them, things that look like security but change nothing
 * at runtime — labels, annotations, revisions — are set aside.
 */

const REDUCERS = [
  { name: 'run as non-root', removes: 'a root process on the host identity', color: PALETTE.good },
  { name: 'drop capabilities', removes: 'the capabilities you did not add', color: PALETTE.good },
  { name: 'seccomp profile', removes: 'syscalls outside the allowed set', color: PALETTE.good },
  { name: 'read-only root filesystem', removes: 'the writable rootfs', color: PALETTE.good },
  { name: 'no privilege escalation', removes: 'setuid / the ability to gain more privilege', color: PALETTE.good },
];

const SET_ASIDE = ['a controller revision', 'a security label', 'a nice annotation'];

export const PrivilegeReducers: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const redOn = REDUCERS.map((_, i) => appear(t, 0.08 + i * 0.09, 0.15 + i * 0.09));
  const aside = seg(t, 0.6, 0.74);
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
      <div style={{ width: 1680, height: 740, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>what actually reduces privilege is specific — each removes a concrete surface</Label>
        </div>

        {/* the reducers — boundary shrinking */}
        <div style={{ position: 'absolute', left: 120, top: 44, width: 880, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 4 }}>the boundary shrinks</Label>
          {REDUCERS.map((r, i) => {
            const on = redOn[i];
            return (
              <div
                key={r.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  borderRadius: 12,
                  border: `2px solid ${on > 0.5 ? r.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${r.color}08` : '#101826',
                  padding: '12px 16px',
                  opacity: Math.max(0.3, on),
                  transform: `translateX(${(1 - on) * -14}px)`,
                }}
              >
                <span
                  style={{
                    flex: '0 0 auto',
                    fontFamily: MONO,
                    fontSize: 15,
                    fontWeight: 900,
                    color: r.color,
                    border: `1px solid ${r.color}`,
                    borderRadius: 999,
                    width: 42,
                    height: 42,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {on > 0.5 ? '⬇' : '·'}
                </span>
                <div style={{ flex: '0 0 300px', fontFamily: MONO, fontSize: 16.5, fontWeight: 900, color: PALETTE.ink }}>{r.name}</div>
                <div style={{ flex: 1, fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.muted }}>{r.removes}</div>
              </div>
            );
          })}
        </div>

        {/* set aside */}
        <div style={{ position: 'absolute', left: 1040, top: 90, width: 540, opacity: aside < 0.1 ? 0.3 : aside }}>
          <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 12 }}>set aside — carry no isolation property at all</Label>
          <div style={{ borderRadius: 14, border: `2px solid ${PALETTE.line}`, background: '#0d1522', padding: '14px 18px' }}>
            {SET_ASIDE.map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: PALETTE.muted, fontWeight: 900 }}>✕</span>
                <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, color: PALETTE.ink }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.bad, marginTop: 10 }}>
            none of these changes what the process may do at runtime
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>security that matters lives in the process and runtime boundary — not in a label on the object</Label>
        </div>
      </div>
    </div>
  );
};
