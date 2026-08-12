import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 27 beat 7 — choosing between them. A decision card comparing
 * RuntimeClass, user namespaces, and both together, with what each provides
 * and what each costs. They are drawn as composable rather than mutually
 * exclusive.
 */

const ROWS = [
  {
    name: 'RuntimeClass',
    provides: 'selects a node-configured runtime and isolation implementation',
    costs: 'handler placement + overhead; nothing if the handler is absent',
    color: PALETTE.blue,
  },
  {
    name: 'User namespaces',
    provides: 'remaps container identities within a supported runtime, when the Pod opts in',
    costs: 'node support + volume limits',
    color: PALETTE.good,
  },
  {
    name: 'Both together',
    provides: 'a node runtime handler and a remapped identity — the two compose',
    costs: 'you pay both feature costs, and they must both be supported',
    color: PALETTE.violet,
  },
];

export const ChooseBoundary: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const cardIn = appear(t, 0.08, 0.16);
  const rowOn = ROWS.map((_, i) => appear(t, 0.16 + i * 0.12, 0.24 + i * 0.12));
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
          <Label color={PALETTE.cyan} size={13}>the isolation decision — composable, not either-or</Label>
        </div>

        {/* the decision card */}
        <Box pad={20} borderColor={PALETTE.line} style={{ position: 'absolute', left: 120, top: 44, width: 1440, opacity: cardIn }}>
          <div style={{ display: 'flex', gap: 18 }}>
            {/* labels column */}
            <div style={{ flex: '0 0 180px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: 2, color: PALETTE.muted, height: 70, display: 'flex', alignItems: 'flex-end', paddingBottom: 12 }}>OPTION</div>
              {ROWS.map((r) => (
                <div key={r.name} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: r.color }}>{r.name}</span>
                </div>
              ))}
            </div>

            {/* provides column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Label color={PALETTE.good} size={11} style={{ height: 70, display: 'flex', alignItems: 'flex-end', paddingBottom: 12 }}>what it provides</Label>
              {ROWS.map((r, i) => (
                <div key={r.name} style={{ flex: 1, borderRadius: 10, border: `1px solid ${r.color}44`, background: `${r.color}06`, padding: '12px 14px', opacity: rowOn[i] }}>
                  <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.4 }}>{r.provides}</div>
                </div>
              ))}
            </div>

            {/* costs column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Label color={PALETTE.amber} size={11} style={{ height: 70, display: 'flex', alignItems: 'flex-end', paddingBottom: 12 }}>what it costs</Label>
              {ROWS.map((r, i) => (
                <div key={r.name} style={{ flex: 1, borderRadius: 10, border: `1px solid ${PALETTE.amber}44`, background: `${PALETTE.amber}06`, padding: '12px 14px', opacity: rowOn[i] }}>
                  <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.4 }}>{r.costs}</div>
                </div>
              ))}
            </div>
          </div>
        </Box>

          {/* The narration already speaks the cost sentence and the caption band
              renders it; repeating it here showed the same words twice and left a
              dead band between the card and the takeaway. */}

        <div style={{ position: 'absolute', left: 0, right: 0, top: 540, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>composable, not mutually exclusive — pick by what each boundary needs, and pay for both when you need both</Label>
        </div>
      </div>
    </div>
  );
};
