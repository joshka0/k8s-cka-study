import React from 'react';
import { PALETTE, LANES } from './theme';
import { Label, SANS } from './ui';
import type { Beat } from './script';

/**
 * Top chrome: the video title on the left for the whole run, and a thin
 * lane legend on the right. Rendered once by Root, not per beat.
 */
export function TitleBar({ stage, total, title, subtitle }: {
  stage: { n: number; title: string } | null;
  total: number;
  title?: string;
  subtitle?: string;
}) {
  const brand = title ?? 'Intent to Packet';
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 96,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 90px',
        borderBottom: `1px solid ${PALETTE.line}`,
        background: 'linear-gradient(180deg, rgba(11,17,29,0.9), rgba(11,17,29,0.55))',
      }}
    >
      <div>
        <Label color={PALETTE.cyan} size={12} style={{ marginBottom: 2 }}>
          {subtitle ?? 'Kubernetes Beyond YAML'}
        </Label>
        <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em' }}>
          {brand}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 22 }}>
        {Object.values(LANES).map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 4,
                background: l.color,
                display: 'inline-block',
              }}
            />
            <Label color={PALETTE.muted} size={11} style={{ textTransform: 'none', letterSpacing: 0.04, fontWeight: 700 }}>
              {l.label}
            </Label>
          </div>
        ))}
        {stage && (
          <span
            style={{
              fontFamily: SANS,
              color: PALETTE.ink,
              background: PALETTE.panel,
              border: `1px solid ${PALETTE.line}`,
              borderRadius: 999,
              padding: '6px 16px',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {stage.title}
          </span>
        )}
      </div>
    </div>
  );
}
