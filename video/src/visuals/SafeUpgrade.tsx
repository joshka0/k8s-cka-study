import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 13 beat 8 — safe, not merely successful. A checklist builds as each
 * item is named, each paired with the failure it prevents. 'Between every
 * step' is emphasised: a sequence that only checks at the end discovers the
 * breakage too late to unwind.
 */

const CHECKS = [
  { name: 'version-skew check', prevents: 'prevents: starting on an unsupported mix', cmd: 'kubeadm upgrade plan', color: PALETTE.cyan },
  { name: 'health between every step', prevents: 'prevents: compounding a failed step into quorum loss', cmd: 'etcd + API health, not just at the end', color: PALETTE.good },
  { name: 'one failure domain at a time', prevents: 'prevents: a bad step taking the whole quorum', cmd: 'one control-plane node at a time', color: PALETTE.blue },
  { name: 'drain where it applies', prevents: 'prevents: disruption to running workloads', cmd: 'drain the node', color: PALETTE.violet },
  { name: 'verified rollback', prevents: 'prevents: assuming a rollback will work', cmd: 'material you have actually tested', color: PALETTE.amber },
];

export const SafeUpgrade: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const checkOn = CHECKS.map((_, i) => appear(t, 0.06 + i * 0.07, 0.13 + i * 0.07));
  const betweenIn = seg(t, 0.5, 0.6);
  const lateIn = appear(t, 0.64, 0.74);
  const footer = appear(t, 0.9, 0.97);

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
          <Label color={PALETTE.cyan} size={13}>what makes a control-plane upgrade safe rather than merely successful</Label>
        </div>

        {/* the checklist */}
        <div style={{ position: 'absolute', left: 40, top: 64, width: 920, display: 'flex', flexDirection: 'column', gap: 13 }}>
          {CHECKS.map((c, i) => {
            const on = checkOn[i];
            return (
              <div
                key={c.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  borderRadius: 12,
                  border: `1px solid ${on > 0.5 ? c.color : PALETTE.line}55`,
                  background: on > 0.5 ? `${c.color}08` : '#101826',
                  padding: '11px 16px',
                  opacity: Math.max(0.3, on),
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: on > 0.5 ? PALETTE.good : PALETTE.line }}>
                  {on > 0.5 ? '✓' : '○'}
                </span>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900, width: 300, flex: '0 0 300px', textTransform: 'capitalize' }}>
                  {c.name}
                </div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, flex: 1, lineHeight: 1.35 }}>
                  {c.cmd}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.good, flex: '0 0 280px', textAlign: 'right', lineHeight: 1.3 }}>
                  {c.prevents}
                </div>
              </div>
            );
          })}
        </div>

        {/* between every step vs only at the end */}
        <div style={{ position: 'absolute', left: 1020, top: 64, width: 620, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              borderRadius: 16,
              border: `2px solid ${PALETTE.good}`,
              background: `${PALETTE.good}08`,
              padding: '16px 18px',
              opacity: betweenIn,
            }}
          >
            <Label color={PALETTE.good} size={12} style={{ marginBottom: 10 }}>the safe way</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
              {['step', 'check', 'step', 'check', 'step'].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: PALETTE.line, fontWeight: 900 }}>→</span>}
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 12.5,
                      fontWeight: 900,
                      color: s === 'check' ? PALETTE.good : PALETTE.ink,
                      border: `1px solid ${s === 'check' ? PALETTE.good : PALETTE.line}`,
                      borderRadius: 8,
                      padding: '5px 8px',
                      background: s === 'check' ? `${PALETTE.good}0c` : '#0d1522',
                    }}
                  >
                    {s}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12.5, fontWeight: 700, marginTop: 10 }}>
              a bad step is caught while it can still be unwound
            </div>
          </div>

          <div
            style={{
              borderRadius: 16,
              border: `2px solid ${PALETTE.bad}77`,
              background: `${PALETTE.bad}06`,
              padding: '16px 18px',
              opacity: lateIn,
            }}
          >
            <Label color={PALETTE.bad} size={12} style={{ marginBottom: 10 }}>checking only at the end</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
              {['step', 'step', 'step', 'check'].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: PALETTE.line, fontWeight: 900 }}>→</span>}
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 12.5,
                      fontWeight: 900,
                      color: s === 'check' ? PALETTE.bad : PALETTE.ink,
                      border: `1px solid ${s === 'check' ? PALETTE.bad : PALETTE.line}`,
                      borderRadius: 8,
                      padding: '5px 8px',
                      background: s === 'check' ? `${PALETTE.bad}0c` : '#0d1522',
                    }}
                  >
                    {s}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 12.5, fontWeight: 800, marginTop: 10 }}>
              the breakage is discovered too late to unwind — a merely 'successful' upgrade
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>then kubeadm upgrade apply, upgrade node, the kubelet packages — and a rollback you have verified, not assumed</Label>
        </div>
      </div>
    </div>
  );
};
