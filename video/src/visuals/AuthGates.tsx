import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const RBAC = ['allow get pods', 'allow create deployments', 'allow watch services'];

export const AuthGates: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const g1Pass = seg(t, 0.12, 0.3);
  const ident = appear(t, 0.3, 0.4);
  const g2Pass = seg(t, 0.44, 0.6);
  const rules = seg(t, 0.5, 0.72);
  const bounce1 = appear(t, 0.74, 0.8);   // 401 at gate one
  const bounce2 = appear(t, 0.84, 0.9);   // 403 at gate two
  const footer = appear(t, 0.9, 0.97);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 140, paddingRight: 140 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        gate one establishes who you are · gate two decides whether they may
      </Label>

      {/* the pass flow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34, position: 'relative' }}>
        {/* input token with cert */}
        <Box pad={12} borderColor={PALETTE.cyan} style={{ width: 220, textAlign: 'center' }}>
          <Label color={PALETTE.cyan} size={11}>request token</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800, marginTop: 4 }}>🔐 cert</div>
        </Box>

        <GateBox title="gate one" sub="authn" color={PALETTE.blue} label="who?" bounce={bounce1} code="401" />
        <GateBox title="gate two" sub="authz · RBAC" color={PALETTE.violet} label="may they?" bounce={bounce2} code="403" />
      </div>

      {/* output after gate one: identity */}
      <div style={{ textAlign: 'center', marginTop: 24, opacity: ident }}>
        <Box pad={12} borderColor={PALETTE.good} style={{ display: 'inline-block' }}>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 19, fontWeight: 900 }}>
            user: joshka · groups: [dev, sre]
          </div>
        </Box>
        <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, marginTop: 6 }}>that is all authentication does — it never decides anything</div>
      </div>

      {/* RBAC rule stack beside gate two */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 26 }}>
        <Box pad={14} borderColor={PALETTE.violet} bg={`${PALETTE.violet}0d`} style={{ width: 460 }}>
          <Label color={PALETTE.violet} size={11}>RBAC rules — they only grant, there is no deny rule</Label>
          {RBAC.map((r, i) => (
            <div key={r} style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 16, fontWeight: 700, marginTop: 10, opacity: rules > i / RBAC.length ? 1 : 0.15 }}>
              ✓ {r}
            </div>
          ))}
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, marginTop: 10, opacity: rules }}>
            refused → look for a missing grant, not a blocking rule
          </div>
        </Box>
      </div>

      {/* failure modes */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 60, marginTop: 26 }}>
        <div style={{ opacity: bounce1, fontFamily: MONO, color: PALETTE.bad, fontSize: 17, fontWeight: 900 }}>
          401 — bad token, identity fails
        </div>
        <div style={{ opacity: bounce2, fontFamily: MONO, color: PALETTE.bad, fontSize: 17, fontWeight: 900 }}>
          403 — good token, no grant
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>two gates fail differently — 401 vs 403 tells you which one</Label>
      </div>
    </div>
  );
};

function GateBox({ title, sub, color, label, bounce, code }: {
  title: string; sub: string; color: string; label: string; bounce: number; code: string;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <Box pad={16} borderColor={bounce > 0 ? PALETTE.bad : color} bg={bounce > 0 ? `${PALETTE.bad}10` : `${color}0e`}
        style={{ width: 230, textAlign: 'center', boxShadow: bounce > 0 ? `0 0 22px ${PALETTE.bad}66` : 'none' }}>
        <div style={{ fontFamily: SANS, color: bounce > 0 ? PALETTE.bad : color, fontSize: 26, fontWeight: 900 }}>{label}</div>
        <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, marginTop: 4, fontWeight: 700 }}>{title} · {sub}</div>
        {bounce > 0 && (
          <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 26, fontWeight: 900, marginTop: 6 }}>✕ {code}</div>
        )}
      </Box>
    </div>
  );
}
