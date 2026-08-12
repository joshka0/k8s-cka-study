import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 18 beat 2 — when aggregation earns its cost. A checklist of what a
 * CRD already provides, ticked off; beside it the short list of things only an
 * extension server can do. The CRD column is obviously larger — aggregation is
 * the exception, chosen deliberately.
 */

const CRD_PROVIDES = [
  'CRUD',
  'watch',
  'schema',
  'status subresource (opt-in)',
  'scale subresource (opt-in)',
];

const AGG_ONLY = [
  'custom storage',
  'unusual subresources',
  'responses computed, not stored',
];

export const WhenAggregation: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const crdIn = appear(t, 0.08, 0.16);
  const aggIn = appear(t, 0.24, 0.34);
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
          <Label color={PALETTE.cyan} size={13}>aggregation rarely earns its cost — a CRD already gives you most of it on the generic server</Label>
        </div>

        {/* the CRD column - larger */}
        <div style={{ position: 'absolute', left: 120, top: 70, width: 820, borderRadius: 20, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}08`, padding: '22px 26px', opacity: crdIn }}>
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 14 }}>what a CRD already provides — the default</Label>
          {CRD_PROVIDES.map((c) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.good}44`, borderRadius: 10, background: '#0d1522', padding: '11px 14px', marginBottom: 10 }}>
              <span style={{ color: PALETTE.good, fontWeight: 900 }}>✓</span>
              {c}
            </div>
          ))}
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 13.5, fontWeight: 800, marginTop: 6 }}>
            CRUD, watch and schema, on the generic server
          </div>
        </div>

        <div style={{ position: 'absolute', left: 970, top: 260, color: PALETTE.line, fontSize: 40, fontWeight: 900, opacity: aggIn }}>→</div>

        {/* the aggregation-only column - smaller */}
        <div style={{ position: 'absolute', right: 100, top: 70, width: 600, borderRadius: 20, border: `2px solid ${PALETTE.amber}`, background: `${PALETTE.amber}06`, padding: '22px 26px', opacity: aggIn }}>
          <Label color={PALETTE.amber} size={12} style={{ marginBottom: 14 }}>only an extension server can do these</Label>
          {AGG_ONLY.map((a) => (
            <div key={a} style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink, border: `1px solid ${PALETTE.amber}44`, borderRadius: 10, background: '#0d1522', padding: '13px 16px', marginBottom: 12 }}>
              {a}
            </div>
          ))}
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 13.5, fontWeight: 800, marginTop: 6 }}>
            behaviour the generic server simply cannot supply
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: aggIn }}>
          <Label color={PALETTE.amber} size={13}>the CRD column is the default; aggregation is the deliberate exception</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>choose aggregation only for what CRD + generic storage cannot give you</Label>
        </div>
      </div>
    </div>
  );
};
