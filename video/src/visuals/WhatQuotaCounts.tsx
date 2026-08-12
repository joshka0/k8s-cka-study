import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 24 beat 3 — what quota can actually count. Declared values feed the
 * quota accounting on one side; actual runtime usage lives on the other,
 * visibly disconnected. A namespace can sit at 100% of its quota while its
 * Pods are idle — both claims are accurate at once.
 */

const DECLARED = ['requests', 'limits', 'object counts (how many of a kind)'];

export const WhatQuotaCounts: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const leftIn = appear(t, 0.08, 0.16);
  const rightIn = appear(t, 0.4, 0.5);
  const disconnect = appear(t, 0.56, 0.66);
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
          <Label color={PALETTE.cyan} size={13}>quota accounts what you declared, not what your containers are really using</Label>
        </div>

        {/* declared side */}
        <div style={{ position: 'absolute', left: 130, top: 56, width: 640, opacity: leftIn }}>
          <Label color={PALETTE.amber} size={11.5} style={{ marginBottom: 12 }}>what quota can count — declared API resources</Label>
          <div style={{ borderRadius: 16, border: `2px solid ${PALETTE.amber}66`, background: `${PALETTE.amber}06`, padding: '16px 20px' }}>
            {DECLARED.map((d) => (
              <div key={d} style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: PALETTE.ink, marginBottom: 8 }}>
                <span style={{ color: PALETTE.amber, fontWeight: 900, marginRight: 8 }}>→</span>{d}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, borderRadius: 12, background: '#0d1522', border: `1px solid ${PALETTE.line}`, padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label color={PALETTE.muted} size={11}>namespace at quota</Label>
              <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.amber }}>100%</span>
            </div>
            <div style={{ marginTop: 8, height: 14, borderRadius: 999, background: '#0b111d', overflow: 'hidden', border: `1px solid ${PALETTE.line}` }}>
              <div style={{ width: '100%', height: '100%', background: PALETTE.amber }} />
            </div>
          </div>
        </div>

        {/* runtime side */}
        <div style={{ position: 'absolute', left: 900, top: 56, width: 650, opacity: rightIn }}>
          <Label color={PALETTE.cyan} size={11.5} style={{ marginBottom: 12 }}>what it cannot see — actual runtime usage</Label>
          <div style={{ borderRadius: 16, border: `2px solid ${PALETTE.cyan}66`, background: `${PALETTE.cyan}06`, padding: '16px 20px' }}>
            <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 800, color: PALETTE.ink, lineHeight: 1.5 }}>
              real CPU · real memory in the cgroups — a metrics and cgroup concern, and admission has no access to it
            </div>
            <div style={{ marginTop: 14, borderRadius: 12, background: '#0d1522', border: `1px solid ${PALETTE.line}`, padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Label color={PALETTE.muted} size={11}>measured utilisation right now</Label>
                <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.good }}>low — Pods idle</span>
              </div>
            </div>
          </div>
        </div>

        {/* the disconnection */}
        <div
          style={{
            position: 'absolute',
            left: 130,
            top: 400,
            width: 1420,
            borderRadius: 16,
            border: `2px dashed ${PALETTE.bad}66`,
            background: `${PALETTE.bad}04`,
            padding: '16px 20px',
            textAlign: 'center',
            opacity: disconnect,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: PALETTE.ink }}>
            100% of quota <span style={{ color: PALETTE.line }}>⇄</span> low measured utilisation — both are accurate
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.bad, marginTop: 8, lineHeight: 1.4 }}>
            the two are disconnected: declared consumption drives admission, measured usage does not
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 656, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a namespace can be at its quota while its Pods sit idle — and that is not a contradiction</Label>
        </div>
      </div>
    </div>
  );
};
