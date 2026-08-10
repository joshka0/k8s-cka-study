import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const EVENTS = [
  { label: 'electricity — power loss', held: false, color: PALETTE.bad },
  { label: 'kubelet — OOM kill', held: false, color: PALETTE.bad },
  { label: 'kubectl delete', held: false, color: PALETTE.bad },
];

export const PdbScope: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const gateIn = appear(t, 0.1, 0.2);
  const drain = appear(t, 0.3, 0.42);
  const held = seg(t, 0.44, 0.54);
  const bypass = (i: number) => appear(t, 0.62 + i * 0.1, 0.68 + i * 0.1);
  const footer = appear(t, 0.92, 0.98);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 24, paddingLeft: 120, paddingRight: 120 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 30 }}>
        a PDB constrains voluntary disruption through the Eviction API — nothing else
      </Label>

      <div style={{ position: 'relative', opacity: gateIn, width: 1400, margin: '0 auto', height: 560 }}>
        {/* the PDB gate */}
        <div style={{ position: 'absolute', left: 560, top: 20, bottom: 20, width: 130, border: `2px solid ${PALETTE.cyan}`, borderRadius: 16, background: `${PALETTE.cyan}12`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 30 }}>🔒</span>
          <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 16, fontWeight: 900 }}>PDB</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 11, fontWeight: 700, padding: '0 8px', textAlign: 'center' }}>Eviction API only</div>
        </div>

        {/* drain request — held */}
        <div style={{ position: 'absolute', right: 360, top: -40 }}>
          <Label color={PALETTE.amber} size={11}>node drain · voluntary</Label>
        </div>
        <div style={{ position: 'absolute', left: 150, top: 40, textAlign: 'center', opacity: drain }}>
          <Box pad={10} borderColor={PALETTE.amber} style={{ width: 240 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 16, fontWeight: 900 }}>drain request</div>
          </Box>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, marginTop: 6 }}>→ approaches the gate</div>
        </div>
        {held > 0 && (
          <div style={{ position: 'absolute', right: 340, top: 60, textAlign: 'center', opacity: held }}>
            <Box pad={10} borderColor={PALETTE.good} bg={`${PALETTE.good}12`}>
              <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 16, fontWeight: 900 }}>held · budget respected</div>
            </Box>
          </div>
        )}

        {/* three events bypass */}
        {EVENTS.map((e, i) => (
          <div key={e.label} style={{ position: 'absolute', left: 120, top: 170 + i * 130, display: 'flex', alignItems: 'center', width: 1160, opacity: bypass(i) }}>
            <Box pad={10} borderColor={e.color} style={{ width: 260, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>{e.label}</div>
            </Box>
            <div style={{ flex: 1, height: 0, borderTop: `2px dashed ${e.color}`, opacity: 0.5, position: 'relative' }}>
              <span style={{ position: 'absolute', right: -8, top: -10, color: e.color, fontSize: 20 }}>→</span>
            </div>
            <Box pad={8} borderColor={e.color} style={{ width: 200, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: e.color, fontSize: 14, fontWeight: 900 }}>✕ passes straight through</div>
            </Box>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>a PDB is a safety rail for planned maintenance — not an availability guarantee</Label>
      </div>
    </div>
  );
};
