import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

// The narration names these three as things that "bypass the budget", and the
// discriminator it teaches is the *path taken*, not who caused it. The frame
// disagreed with its own script twice: it said "kubelet — OOM kill", a
// different mechanism from the narrated node-pressure eviction, and it
// coloured `kubectl delete` exactly like power loss — teaching that a
// deliberate human deletion is an involuntary disruption. It is voluntary; it
// just takes DELETE instead of the Eviction API, which is why the PDB never
// sees it. Each row now carries its own cause.
const EVENTS = [
  { label: 'electricity — power loss', cause: 'involuntary', color: PALETTE.bad },
  { label: 'kubelet — node-pressure eviction', cause: 'involuntary', color: PALETTE.bad },
  { label: 'kubectl delete', cause: 'voluntary · direct DELETE', color: PALETTE.amber },
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
        {/* The rows below span 120 → 1280, so their centre is 700. The gate sat
          * at 560–690, centred on 625: every dashed line crossed it 75px left
          * of centre and the frame read as lopsided. */}
        <div style={{ position: 'absolute', left: 635, top: 20, bottom: 20, width: 130, border: `2px solid ${PALETTE.cyan}`, borderRadius: 16, background: `${PALETTE.cyan}12`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 30 }}>🔒</span>
          <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 16, fontWeight: 900 }}>PDB</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 11, fontWeight: 700, padding: '0 8px', textAlign: 'center' }}>Eviction API only</div>
        </div>

        {/* drain request — held.
         * `top: -40` put this label 40px above the container, straight through
         * the header caption above it: two different sentences overlapped in
         * one line of the frame. It belongs with the row it describes. */}
        <div style={{ position: 'absolute', left: 150, top: 4, width: 240, textAlign: 'center' }}>
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
            <Box pad={10} borderColor={e.color} style={{ width: 300, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>{e.label}</div>
              <Label color={e.color} size={10} style={{ marginTop: 4 }}>{e.cause}</Label>
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

      {/* This line used to repeat the burned-in caption below it word for word:
        * the viewer read the same sentence twice, in two typefaces, at once.
        * The caption owns that sentence; the frame adds what it cannot say. */}
      <div style={{ textAlign: 'center', marginTop: 20, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>preemption respects a PDB only as a best effort</Label>
      </div>
    </div>
  );
};
