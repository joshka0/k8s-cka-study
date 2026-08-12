import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 14 beat 2 — what actually triggers a rollout. A Deployment watches its
 * own Pod template. Editing a referenced ConfigMap leaves the template
 * untouched, so nothing rolls. Changing an annotation that carries a hash of
 * that config makes the template differ — and the rollout starts. The
 * template, not the data, is the trigger.
 */

export const RolloutTrigger: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const depIn = appear(t, 0.06, 0.14);
  const cmIn = appear(t, 0.14, 0.22);
  const noOp = appear(t, 0.28, 0.4);
  const hashIn = appear(t, 0.5, 0.62);
  const rolls = seg(t, 0.66, 0.82);
  const footer = appear(t, 0.9, 0.97);

  const templateDirty = hashIn > 0.5 && rolls > 0.3;

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
          <Label color={PALETTE.cyan} size={13}>the Deployment reacts to its Pod template — the template is the only trigger</Label>
        </div>

        {/* the deployment + its template */}
        <div
          style={{
            position: 'absolute',
            left: 340,
            top: 80,
            width: 1000,
            borderRadius: 20,
            border: `2px solid ${PALETTE.blue}`,
            background: `${PALETTE.blue}08`,
            padding: '22px 26px',
            opacity: depIn,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>Deployment</span>
            <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700 }}>ReplicaSet → Pods</span>
          </div>
          <div style={{ marginTop: 16, borderRadius: 14, border: `2px solid ${templateDirty ? PALETTE.amber : PALETTE.line}`, background: templateDirty ? `${PALETTE.amber}08` : '#0d1522', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>spec.template</span>
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: templateDirty ? PALETTE.amber : PALETTE.muted }}>
                {templateDirty ? '· template differs — rollout starts →' : '· controller compares template hash'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'nowrap', alignItems: 'center' }}>
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.ink, border: `1px solid ${PALETTE.line}`, borderRadius: 8, padding: '6px 10px', background: '#101826' }}>
                image v1
              </span>
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.ink, border: `1px solid ${PALETTE.line}`, borderRadius: 8, padding: '6px 10px', background: '#101826' }}>
                envFrom: cm
              </span>
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: templateDirty ? PALETTE.amber : PALETTE.ink, border: `1px solid ${templateDirty ? PALETTE.amber : PALETTE.line}`, borderRadius: 8, padding: '6px 10px', background: templateDirty ? `${PALETTE.amber}0c` : '#101826' }}>
                annotation: config-hash=abc
              </span>
            </div>
          </div>
        </div>

        {/* ConfigMap referenced by the deployment */}
        <div style={{ position: 'absolute', left: 160, top: 240, width: 320, borderRadius: 14, border: `2px solid ${PALETTE.good}`, background: `${PALETTE.good}0c`, padding: '14px 18px', opacity: cmIn }}>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>ConfigMap</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.good, marginTop: 6 }}>edited — but not a template field</div>
        </div>

        {/* arrow from configmap to deployment (ignored) */}
        <div style={{ position: 'absolute', left: 486, top: 255, color: PALETTE.line, fontSize: 22, fontWeight: 900, opacity: cmIn }}>→</div>
        <div style={{ position: 'absolute', left: 486, top: 288, color: PALETTE.bad, fontSize: 20, fontWeight: 900, opacity: noOp }}>✕</div>

        <div
          style={{
            position: 'absolute',
            left: 160,
            top: 400,
            width: 1360,
            borderRadius: 16,
            border: `2px solid ${PALETTE.bad}66`,
            background: `${PALETTE.bad}06`,
            padding: '16px 22px',
            textAlign: 'center',
            opacity: noOp,
          }}
        >
          <Label color={PALETTE.bad} size={12.5}>① editing the ConfigMap — the template is untouched, nothing rolls</Label>
        </div>

        {/* hash annotation change */}
        <div
          style={{
            position: 'absolute',
            left: 160,
            top: 480,
            width: 1360,
            borderRadius: 16,
            border: `${rolls > 0.7 ? `2px solid ${PALETTE.good}` : `2px solid ${PALETTE.amber}66`}`,
            background: rolls > 0.7 ? `${PALETTE.good}08` : `${PALETTE.amber}06`,
            padding: '16px 22px',
            textAlign: 'center',
            opacity: hashIn,
          }}
        >
          <Label color={rolls > 0.7 ? PALETTE.good : PALETTE.amber} size={12.5}>② bumping the config-hash annotation — the template differs, and the rollout starts</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>hashing config into an annotation turns a data change into a template change — and the template is what the controller reacts to</Label>
        </div>
      </div>
    </div>
  );
};
