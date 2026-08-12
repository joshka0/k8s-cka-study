import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 21 beat 2 — permissions are additive. Effective permission is the
 * union of every applicable grant, so inspecting one Role proves nothing. One
 * subject, several grants arriving from different bindings and group
 * memberships, combining into a single effective set visibly larger than any
 * individual grant. The mistake — reading one Role and concluding safety —
 * sits struck through beside it.
 */

const GRANTS = [
  { via: 'RoleBinding · ns-app', rule: 'get pods · logs in ns-app', color: PALETTE.blue },
  { via: 'ClusterRoleBinding · system:masters-like', rule: 'nodes · * across', color: PALETTE.good },
  { via: 'group memberships', rule: 'dev-group → deploy *', color: PALETTE.violet },
  { via: 'impersonate / bind holders', rule: 'borrow another identity', color: PALETTE.amber },
];

const UNION = ['get pods · logs', 'nodes · cluster-wide', 'deploy *', 'impersonate + bind'];

export const PermissionUnion: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const grantOn = GRANTS.map((_, i) => appear(t, 0.1 + i * 0.07, 0.17 + i * 0.07));
  const unionIn = appear(t, 0.42, 0.54);
  const combine = seg(t, 0.42, 0.6);
  const mistake = appear(t, 0.68, 0.78);
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
          <Label color={PALETTE.cyan} size={13}>effective permission is the union of every applicable grant — not one object</Label>
        </div>

        {/* the subject */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 84,
            width: 260,
            borderRadius: 16,
            border: `2px solid ${PALETTE.cyan}`,
            background: `${PALETTE.cyan}0a`,
            padding: 18,
            textAlign: 'center',
            opacity: appear(t, 0.08, 0.16),
          }}
        >
          <Label color={PALETTE.cyan} size={11}>the subject</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900, marginTop: 8 }}>app-sa</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6 }}>
            ServiceAccount · groups: app, dev-group
          </div>
        </div>

        {/* the grants arriving */}
        <div style={{ position: 'absolute', left: 360, top: 60, width: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {GRANTS.map((g, i) => (
            <div
              key={g.via}
              style={{
                borderRadius: 12,
                border: `2px solid ${g.color}55`,
                background: '#0d1522',
                padding: '12px 16px',
                opacity: grantOn[i],
                transform: `translate(${(1 - grantOn[i]) * -14}px, 0)`,
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: g.color }}>{g.via}</div>
              <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, marginTop: 4 }}>→ {g.rule}</div>
            </div>
          ))}
        </div>

        {/* combine arrow into the effective union */}
        <div style={{ position: 'absolute', left: 942, top: 300, color: PALETTE.amber, fontSize: 30, fontWeight: 900, opacity: combine }}>
          ⇉
        </div>

        {/* effective set */}
        <div
          style={{
            position: 'absolute',
            left: 1000,
            top: 84,
            width: 620,
            borderRadius: 18,
            border: `2px solid ${PALETTE.good}`,
            background: `${PALETTE.good}0c`,
            padding: 20,
            boxShadow: `0 0 30px ${PALETTE.good}20`,
            opacity: unionIn,
          }}
        >
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 12 }}>effective permission — the union</Label>
          {UNION.map((u) => (
            <div
              key={u}
              style={{
                fontFamily: MONO,
                fontSize: 17,
                fontWeight: 900,
                color: PALETTE.ink,
                border: `1px solid ${PALETTE.good}66`,
                borderRadius: 10,
                background: '#0c1522',
                padding: '10px 16px',
                marginBottom: 8,
              }}
            >
              ✓ {u}
            </div>
          ))}
          <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.muted, marginTop: 8, textAlign: 'center' }}>
            larger than any single grant
          </div>
        </div>

        {/* the mistake */}
        <div
          style={{
            position: 'absolute',
            left: 360,
            top: 500,
            width: 640,
            borderRadius: 14,
            border: `2px dashed ${PALETTE.bad}`,
            background: `${PALETTE.bad}0a`,
            padding: '16px 20px',
            opacity: mistake,
          }}
        >
          <Label color={PALETTE.bad} size={12} style={{ marginBottom: 8 }}>the mistake</Label>
          <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink, textDecoration: 'line-through', textDecorationThickness: 3 }}>
            “I read this Role — this ServiceAccount is safe”
          </div>
        </div>

        <div style={{ position: 'absolute', left: 1000, top: 540, width: 620, opacity: mistake }}>
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 800, color: PALETTE.amber, lineHeight: 1.5 }}>
            you have to trace every RoleBinding and ClusterRoleBinding that reaches it, the groups it belongs to, and anything that can impersonate it
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>least privilege is a property of the whole graph — not of one object</Label>
        </div>
      </div>
    </div>
  );
};
