import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 25 beat 1 — Service types are layers, not alternatives. ClusterIP is
 * the base, NodePort wraps it, LoadBalancer sits outside. A request traverses
 * inward through every layer. Break the innermost one and the outer layers
 * still look healthy.
 */

export const TypesAreLayers: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const layerIn = appear(t, 0.08, 0.18);
  const request = seg(t, 0.24, 0.44);
  const breakInner = seg(t, 0.56, 0.68);
  const footer = appear(t, 0.86, 0.93);

  const brokenInner = breakInner > 0.5;

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
          <Label color={PALETTE.cyan} size={13}>Service types are layers, not alternatives — every layer below can still be broken</Label>
        </div>

        {/* concentric layers */}
        <div
          style={{
            position: 'absolute',
            left: 460,
            top: 40,
            width: 720,
            height: 560,
            borderRadius: 30,
            border: `3px solid ${brokenInner ? PALETTE.good : PALETTE.amber}`,
            background: `${PALETTE.amber}08`,
            padding: 40,
            opacity: layerIn,
          }}
        >
          <Label color={PALETTE.amber} size={13} style={{ textAlign: 'center' }}>LoadBalancer — asks an implementation for external reachability</Label>

          <div style={{ marginTop: 20, height: 430, borderRadius: 24, border: `3px solid ${PALETTE.cyan}`, background: `${PALETTE.cyan}08`, padding: 36 }}>
            <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center' }}>NodePort — allocates a port on nodes on top of ClusterIP</Label>

            <div
              style={{
                marginTop: 20,
                height: 300,
                borderRadius: 20,
                border: `3px solid ${brokenInner ? PALETTE.bad : PALETTE.blue}`,
                background: `${brokenInner ? PALETTE.bad : PALETTE.blue}10`,
                padding: 30,
                textAlign: 'center',
                boxShadow: brokenInner ? `0 0 38px ${PALETTE.bad}33` : `0 0 26px ${PALETTE.blue}22`,
              }}
            >
              <Label color={brokenInner ? PALETTE.bad : PALETTE.blue} size={12} style={{ textAlign: 'center' }}>ClusterIP — the base</Label>
              <div style={{ fontFamily: MONO, fontSize: 30, fontWeight: 900, color: brokenInner ? PALETTE.bad : PALETTE.ink, marginTop: 40 }}>
                {brokenInner ? '✕ broken' : 'applying Service semantics'}
              </div>
              {brokenInner && (
                <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 800, color: PALETTE.bad, marginTop: 26 }}>
                  the innermost layer has failed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* the request traversing inward */}
        <div style={{ position: 'absolute', left: 60, top: 250, textAlign: 'center', opacity: request > 0 ? 1 : 0 }}>
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink }}>client</div>
          <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 900, color: PALETTE.cyan, marginTop: 8 }}>{brokenInner ? '⛔' : '⟶⟶⟶'}</div>
          {brokenInner && (
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.bad, marginTop: 6 }}>does not reach</div>
          )}
        </div>

        {/* outer layers still healthy */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 470,
            width: 1560,
            borderRadius: 14,
            border: `2px solid ${PALETTE.good}55`,
            background: `${PALETTE.good}06`,
            padding: '14px 20px',
            textAlign: 'center',
            opacity: breakInner > 0 ? breakInner : 0,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink }}>
            the outer layers still look healthy —<span style={{ color: PALETTE.good }}> LoadBalancer provisioned, NodePort allocated</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.muted, marginTop: 6 }}>
            every layer below can still be the thing that is broken
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a LoadBalancer Service is a ClusterIP Service with more in front of it</Label>
        </div>
      </div>
    </div>
  );
};
