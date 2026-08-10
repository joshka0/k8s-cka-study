import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Horizontal, Label, MONO, SANS, ArrowGlyph } from '../ui';
import type { Beat } from '../script';
import { appear, seg } from '../motion';

const STACK = [
  { name: 'kubelet', contract: '— CRI —', contractColor: PALETTE.cyan, color: PALETTE.violet },
  { name: 'containerd', contract: '— OCI —', contractColor: PALETTE.amber, color: PALETTE.violet },
  { name: 'runc', contract: '↓', contractColor: PALETTE.muted, color: PALETTE.amber },
  { name: 'Linux', contract: '', contractColor: PALETTE.muted, color: PALETTE.good, sub: 'namespaces · cgroups' },
];

export const Layers: React.FC<{ beat: Beat }> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const stackBuild = appear(t, 0.06, 0.4);
  const layersIn = seg(t, 0.42, 0.62);
  const appIn = seg(t, 0.64, 0.84);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: 80, alignItems: 'center', justifyContent: 'center' }}>
      {/* vertical contract stack */}
      <div style={{ opacity: stackBuild }}>
        {STACK.map((s, i) => (
          <React.Fragment key={s.name}>
            <Box
              pad={12}
              borderColor={s.color}
              style={{
                width: 300,
                textAlign: 'center',
                background: `${s.color}12`,
              }}
            >
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>{s.name}</div>
              {s.sub && <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13 }}>{s.sub}</div>}
            </Box>
            {i < STACK.length - 1 && (
              <div style={{ textAlign: 'center', color: s.contractColor, fontFamily: MONO, fontSize: 16, fontWeight: 900, margin: '6px 0' }}>
                {s.contract}
              </div>
            )}
          </React.Fragment>
        ))}
        <div style={{ textAlign: 'center', marginTop: 8, opacity: appear(t, 0.4, 0.5) }}>
          <Label color={PALETTE.muted} size={11}>CRI down · OCI lower · CNI attached the network — three places to look</Label>
        </div>
      </div>

      {/* image layers from registry */}
      <div>
        <Box pad={14} borderColor={PALETTE.muted} style={{ width: 260, textAlign: 'center' }}>
          <Label color={PALETTE.muted} size={11}>registry</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800 }}>app:v1</div>
        </Box>
        <div style={{ marginTop: 16, minHeight: 150, position: 'relative' }}>
          {['base', 'deps', '+ app'].map((l, i) => (
            <div
              key={l}
              style={{
                fontFamily: MONO,
                color: PALETTE.ink,
                background: `${PALETTE.blue}${35 - i * 8}`,
                border: '1px solid #33415e',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 6,
                translate: `${(1 - layersIn) * 60}px 0`,
                opacity: layersIn > (i + 1) / 4 ? layersIn : 0,
              }}
            >
              {l}
            </div>
          ))}
          <ArrowGlyph color={PALETTE.cyan} size={24} style={{ position: 'absolute', left: -30, top: 60, opacity: layersIn }} />
        </div>
      </div>

      {/* sandbox with app + pause */}
      <div
        style={{
          border: `2px solid ${PALETTE.cyan}`,
          borderRadius: 20,
          padding: '18px 22px',
          background: `${PALETTE.cyan}0c`,
          textAlign: 'center',
          opacity: appear(t, 0.3, 0.42),
        }}
      >
        <Label color={PALETTE.cyan} size={11}>sandbox</Label>
        <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 16 }}>pause</span>
          <span
            style={{
              fontFamily: MONO,
              color: PALETTE.ink,
              fontSize: 16,
              border: `1px solid ${PALETTE.good}`,
              borderRadius: 8,
              padding: '6px 12px',
              background: `${PALETTE.good}14`,
              opacity: appIn,
              translate: `${(1 - appIn) * 40}px 0`,
            }}
          >
            app
          </span>
        </div>
      </div>
    </div>
  );
};
