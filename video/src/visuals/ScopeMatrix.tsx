import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 21 beat 1 — scope is half the grant. A two-by-two of the bound kind
 * (Role / ClusterRole) against the binding (RoleBinding / ClusterRoleBinding),
 * with the resulting effective scope in each cell. RBAC has no deny rule, so
 * the same ClusterRole means two different things depending on the binding.
 * The ClusterRole-plus-RoleBinding cell is the highlighted combo people
 * misread — reusable rules, one namespace.
 */

const HEADER = 'effective scope = what you bind × how you bind it — RBAC has no deny rule';

const COLS = [
  { name: 'RoleBinding', sub: 'binds one kind to one namespace' },
  { name: 'ClusterRoleBinding', sub: 'binds a cluster kind cluster-wide' },
];

const ROWS = [
  {
    name: 'Role',
    sub: 'the bound kind is namespaced',
    cells: [
      { out: 'that one namespace', note: 'scope is the binding’s namespace', color: PALETTE.blue },
      { out: 'not valid', note: 'cannot bind a Role this way', color: PALETTE.bad, dead: true },
    ],
  },
  {
    name: 'ClusterRole',
    sub: 'the bound kind is cluster-scoped',
    cells: [
      { out: 'one namespace', note: 'rules reused where bound — the combo people misread', color: PALETTE.amber, hot: true },
      { out: 'everywhere', note: 'cluster-wide, no confinement', color: PALETTE.good },
    ],
  },
];

export const ScopeMatrix: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const body = appear(t, 0.1, 0.2);
  const hotTag = appear(t, 0.55, 0.68);
  const footer = appear(t, 0.82, 0.9);

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
      <div style={{ width: 1680, height: 760, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>{HEADER}</Label>
        </div>

        <div style={{ position: 'absolute', left: 340, top: 46, width: 1240, display: 'flex', gap: 26, opacity: body }}>
          {COLS.map((c, i) => (
            <div key={c.name} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>
                {i === 0 ? '⇓ to one namespace' : '⇓ across the cluster'}
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', left: 60, top: 46, display: 'flex', flexDirection: 'column', gap: 10, opacity: body }}>
          {ROWS.map((r) => (
            <div
              key={r.name}
              style={{
                width: 240,
                flex: 1,
                minHeight: 260,
                borderRadius: 14,
                border: `2px solid ${PALETTE.violet}55`,
                background: `${PALETTE.violet}08`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 18,
              }}
            >
              <div style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 22, fontWeight: 900 }}>{r.name}</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8, textAlign: 'center', lineHeight: 1.4 }}>{r.sub}</div>
            </div>
          ))}
        </div>

        {/* the grid of cells */}
        <div style={{ position: 'absolute', left: 340, top: 110, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, opacity: body }}>
          {ROWS.flatMap((r, ri) => r.cells.map((c, ci) => {
            const key = `${ri}-${ci}`;
            const hot = (c as { hot?: boolean }).hot;
            const dead = (c as { dead?: boolean }).dead;
            const color = dead ? PALETTE.bad : hot ? PALETTE.amber : c.color;
            return (
              <div
                key={key}
                style={{
                  width: 600,
                  minHeight: 260,
                  borderRadius: 18,
                  border: `2px solid ${dead ? PALETTE.bad : color}${hot ? 'FF' : '88'}`,
                  background: hot ? `${PALETTE.amber}12` : `${color}0a`,
                  boxShadow: hot ? `0 0 30px ${PALETTE.amber}33` : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 22,
                  textAlign: 'center',
                  position: 'relative',
                  opacity: dead ? 0.55 : 1,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 26,
                    fontWeight: 900,
                    color: dead ? PALETTE.bad : color,
                    textDecoration: dead ? 'line-through' : 'none',
                    textDecorationThickness: 3,
                  }}
                >
                  {c.out}
                </div>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 700, marginTop: 10, lineHeight: 1.4 }}>
                  {c.note}
                </div>
                {hot && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -16,
                      fontFamily: MONO,
                      fontSize: 14,
                      fontWeight: 900,
                      color: PALETTE.amber,
                      border: `2px solid ${PALETTE.amber}`,
                      borderRadius: 999,
                      background: '#0b111d',
                      padding: '5px 14px',
                      opacity: hotTag,
                    }}
                  >
                    the combo people misread
                  </div>
                )}
              </div>
            );
          }))}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 712, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a ClusterRole is not automatically cluster-wide — its binding decides the scope</Label>
        </div>
      </div>
    </div>
  );
};
