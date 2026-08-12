import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 13 beat 7 — packaging is not reconciling. Helm and Kustomize sit side
 * by side producing manifests; both funnel into the same single API request
 * path taught in module 02. Everything downstream of the API is drawn
 * identically for both. The convergence is the point: packaging changes what
 * you send, not what happens next.
 */

export const PackagingNotReconciling: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const toolsIn = appear(t, 0.08, 0.16);
  const apiIn = appear(t, 0.2, 0.3);
  const downstreamIn = appear(t, 0.34, 0.46);
  const converge = appear(t, 0.5, 0.62);
  const footer = appear(t, 0.88, 0.95);

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
      <div style={{ width: 1660, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>two tools solve different problems — and neither one is a reconciler</Label>
        </div>

        {/* the two tools */}
        <div style={{ position: 'absolute', left: 120, top: 130, display: 'flex', flexDirection: 'column', gap: 44, opacity: toolsIn }}>
          {[
            { name: 'Helm', role: 'packages · templates a release' },
            { name: 'Kustomize', role: 'overlays · patches plain manifests' },
          ].map((tool) => (
            <div
              key={tool.name}
              style={{
                width: 380,
                borderRadius: 18,
                border: `2px solid ${PALETTE.blue}`,
                background: `${PALETTE.blue}0c`,
                padding: '18px 20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 24, fontWeight: 900 }}>{tool.name}</div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 6 }}>{tool.role}</div>
            </div>
          ))}
        </div>

        {/* converged manifests and api path */}
        <div style={{ position: 'absolute', left: 560, top: 150, color: PALETTE.line, fontSize: 28, fontWeight: 900, opacity: toolsIn }}>→</div>

        <div
          style={{
            position: 'absolute',
            left: 640,
            top: 120,
            width: 320,
            borderRadius: 16,
            border: `1px solid ${PALETTE.line}`,
            background: PALETTE.panel,
            padding: '14px 16px',
            textAlign: 'center',
            opacity: converge,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 800 }}>ordinary YAML output</div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, marginTop: 6 }}>manifests</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700, marginTop: 6 }}>— the exact thing both produce</div>
        </div>

        <div style={{ position: 'absolute', left: 1010, top: 150, color: PALETTE.line, fontSize: 28, fontWeight: 900, opacity: converge }}>→</div>

        {/* the single API request path */}
        <div
          style={{
            position: 'absolute',
            left: 1090,
            top: 96,
            width: 420,
            borderRadius: 18,
            border: `2px solid ${PALETTE.good}`,
            background: `${PALETTE.good}0c`,
            padding: '18px 20px',
            textAlign: 'center',
            opacity: apiIn,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>the API request path</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
            the same gates from module 02 — admission, storage, watch — for both tools
          </div>
        </div>

        {/* identical downstream */}
        <div
          style={{
            position: 'absolute',
            left: 1090,
            top: 280,
            width: 420,
            borderRadius: 18,
            border: `2px solid ${PALETTE.violet}55`,
            background: `${PALETTE.violet}0c`,
            padding: '18px 20px',
            textAlign: 'center',
            opacity: downstreamIn,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>ordinary controller loops</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
            Deployments reconcile exactly the same<br />whether Helm or Kustomize produced the YAML
          </div>
        </div>

        <div style={{ position: 'absolute', left: 1290, top: 252, color: PALETTE.violet, fontSize: 28, fontWeight: 900, opacity: downstreamIn }}>↓</div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: converge }}>
          <Label color={PALETTE.amber} size={13}>both funnel into one requirement: the write. Nothing after the write changes</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>packaging changes what you send, not what happens next — neither tool reconciles anything</Label>
        </div>
      </div>
    </div>
  );
};
