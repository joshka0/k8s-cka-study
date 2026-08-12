import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 21 beat 3 — what actually escalates. Three routes turn a modest
 * starting subject into broad authority: binding creation, impersonation,
 * aggregation. Each is drawn as a path through the graph — not a property of
 * one object — and all three end in the same elevated state.
 */

const PATHS = [
  {
    name: 'binding creation',
    from: '“can create bindings”',
    mechanism: 'create a RoleBinding/ClusterRoleBinding that grants a ClusterRole — bind verb or holding the permissions',
    to: 'grants yourself cluster-admin',
    color: PALETTE.good,
  },
  {
    name: 'impersonation',
    from: '“can impersonate”',
    mechanism: 'borrow another identity outright — act as a user or group that already holds the authority',
    to: 'acts as a privileged principal',
    color: PALETTE.violet,
  },
  {
    name: 'aggregation',
    from: '“owns an aggregating ClusterRole”',
    mechanism: 'labels change → the aggregated ClusterRole absorbs rules from other ClusterRoles dynamically',
    to: 'gains new rules as labels move',
    color: PALETTE.amber,
  },
];

export const EscalationPaths: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const start = appear(t, 0.04, 0.1);
  const pathOn = PATHS.map((_, i) => appear(t, 0.12 + i * 0.12, 0.2 + i * 0.12));
  const elevated = appear(t, 0.62, 0.72);
  const footer = appear(t, 0.86, 0.93);

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
          <Label color={PALETTE.cyan} size={13}>three indirect routes turn modest authority into real privilege — audit the reachable graph</Label>
        </div>

        {/* starting subject */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 170,
            width: 230,
            borderRadius: 16,
            border: `2px solid ${PALETTE.blue}`,
            background: `${PALETTE.blue}0a`,
            padding: 18,
            textAlign: 'center',
            opacity: start,
          }}
        >
          <Label color={PALETTE.blueInk} size={11}>start</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, marginTop: 8 }}>a modest subject</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6, lineHeight: 1.4 }}>
            small grants, nothing that looks privileged
          </div>
        </div>

        {/* three paths */}
        <div style={{ position: 'absolute', left: 330, top: 60, width: 920, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {PATHS.map((p, i) => (
            <div
              key={p.name}
              style={{
                borderRadius: 14,
                border: `2px solid ${p.color}55`,
                background: `${p.color}06`,
                padding: '14px 18px',
                opacity: pathOn[i],
                transform: `translateX(${(1 - pathOn[i]) * -14}px)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: p.color, border: `1px solid ${p.color}`, borderRadius: 8, padding: '4px 10px' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 900, color: PALETTE.ink }}>{p.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.muted, background: '#0c111c', borderRadius: 8, padding: '7px 12px' }}>
                  {p.from}
                </span>
                <span style={{ color: p.color, fontSize: 18, fontWeight: 900, alignSelf: 'center' }}>→</span>
                <span style={{ flex: 1, fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.4, minWidth: 420 }}>
                  {p.mechanism}
                </span>
                <span style={{ color: p.color, fontSize: 18, fontWeight: 900, alignSelf: 'center' }}>→</span>
                <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color: p.color, border: `1px solid ${p.color}88`, borderRadius: 10, background: '#0c111c', padding: '8px 12px', whiteSpace: 'nowrap' }}>
                  {p.to}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* shared elevated end state */}
        <div
          style={{
            position: 'absolute',
            left: 1290,
            top: 250,
            width: 330,
            borderRadius: 18,
            border: `2px solid ${PALETTE.bad}`,
            background: `${PALETTE.bad}0c`,
            boxShadow: `0 0 30px ${PALETTE.bad}22`,
            padding: 22,
            textAlign: 'center',
            opacity: elevated,
          }}
        >
          <Label color={PALETTE.bad} size={11}>all three land here</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 21, fontWeight: 900, marginTop: 10, lineHeight: 1.35 }}>
            elevated authority
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 10, lineHeight: 1.4 }}>
            broad, and none of it visible in the Role you were shown
          </div>
        </div>

        <div style={{ position: 'absolute', left: 60, top: 640, width: 1160, opacity: elevated }}>
          <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: PALETTE.amber, lineHeight: 1.5 }}>
            audit reachable authority, not objects: who can bind, who can impersonate, which aggregating Roles exist and how their labels can change
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 704, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>each path ends in the same place, so each one is worth naming when you audit</Label>
        </div>
      </div>
    </div>
  );
};
