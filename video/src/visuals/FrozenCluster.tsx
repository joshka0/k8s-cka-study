import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE, LANES } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const FrozenCluster: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const fail1 = seg(t, 0.42, 0.5);
  const fail2 = seg(t, 0.6, 0.68);
  const footer = appear(t, 0.82, 0.9);

  // live replicas: 4 -> 3 -> 2
  const replicas = fail2 > 0 ? 2 : fail1 > 0 ? 3 : 4;

  // Pod failure markers
  const pods = [
    { fail: fail1, label: 'pod A' },
    { fail: 0, label: 'pod B' },
    { fail: fail2, label: 'pod C' },
    { fail: 0, label: 'pod D' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 150, paddingRight: 150 }}>
      {/* dark control-plane lane behind it all */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <Box pad={10} borderColor={PALETTE.line} style={{ width: 620, textAlign: 'center', background: '#0a0f18', opacity: 0.6 }}>
          <Label color={PALETTE.muted} size={11}>control plane — dark</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 16, fontWeight: 800 }}>frozen · cannot change, repair, or tell the truth about itself</div>
        </Box>
      </div>

      {/* the dashboard that still reads healthy */}
      <Box pad={20} borderColor={PALETTE.good} bg={`${PALETTE.good}0a`} style={{ width: 1000, margin: '0 auto', borderRadius: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottom: `1px solid ${PALETTE.line}` }}>
          <Label color={PALETTE.good} size={14}>STATUS: ALL HEALTHY</Label>
          <span style={{ fontFamily: MONO, color: PALETTE.good, fontWeight: 900 }}>traffic flowing ✓</span>
        </div>

        {/* replica counter + pods */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 18 }}>
          <div style={{ textAlign: 'center' }}>
            <Label color={PALETTE.muted} size={11}>replicas</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 64, fontWeight: 900, lineHeight: 1 }}>{replicas}</div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            {pods.map((p, i) => {
              const failed = p.fail > 0;
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <Box
                    pad={10}
                    borderColor={failed ? PALETTE.bad : PALETTE.cyan}
                    style={{
                      width: 110,
                      textAlign: 'center',
                      opacity: failed ? 0.35 : 1,
                      background: failed ? `${PALETTE.bad}14` : `${PALETTE.cyan}10`,
                    }}
                  >
                    <div style={{ fontFamily: MONO, color: failed ? PALETTE.bad : PALETTE.cyan, fontSize: 16, fontWeight: 900 }}>{p.label}</div>
                    <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, marginTop: 3 }}>
                      {failed ? '✕ nothing replaces' : 'running'}
                    </div>
                  </Box>
                </div>
              );
            })}
          </div>
        </div>

        {/* flat green traffic line */}
        <div style={{ marginTop: 18 }}>
          <Label color={PALETTE.muted} size={10} style={{ marginBottom: 6 }}>traffic</Label>
          <svg width="100%" height="60" viewBox="0 0 960 60" preserveAspectRatio="none">
            <polyline
              points="0,30 480,30 960,26"
              fill="none"
              stroke={PALETTE.good}
              strokeWidth="3"
              opacity="0.9"
            />
            {/* dashed x marks where pods died but the line stays flat */}
            <line x1={230} y1={12} x2={248} y2={44} stroke={PALETTE.bad} strokeWidth="2" opacity={0.5 + fail1} />
            <line x1={248} y1={12} x2={230} y2={44} stroke={PALETTE.bad} strokeWidth="2" opacity={0.5 + fail1} />
            <line x1={460} y1={12} x2={478} y2={44} stroke={PALETTE.bad} strokeWidth="2" opacity={0.5 + fail2} />
            <line x1={478} y1={12} x2={460} y2={44} stroke={PALETTE.bad} strokeWidth="2" opacity={0.5 + fail2} />
          </svg>
        </div>
      </Box>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: footer }}>
        <Label color={PALETTE.amber} size={15}>frozen, not healthy</Label>
      </div>
    </div>
  );
};
