import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear } from '../motion';

/**
 * Module 10 beat 1 — claim, class, volume. Three objects side by side, each
 * labelled with its scope — the distinction people get wrong. The PVC sits
 * visibly inside a namespace boundary; the PV and StorageClass sit visibly
 * outside it, cluster-scoped. Under each, one line on its job.
 */

export const ClaimClassVolume: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const nsIn = appear(t, 0.08, 0.18);
  const pvcIn = appear(t, 0.12, 0.22);
  const pvIn = appear(t, 0.22, 0.32);
  const scIn = appear(t, 0.3, 0.4);
  const footer = appear(t, 0.8, 0.88);

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
      <div style={{ width: 1620, height: 700, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>three objects, three different jobs — the scope is the distinction people get wrong</Label>
        </div>

        {/* PV — cluster-scoped, outside the namespace */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 130,
            width: 420,
            borderRadius: 18,
            border: `2px solid ${PALETTE.violet}`,
            background: `${PALETTE.violet}0c`,
            padding: '20px 22px',
            opacity: pvIn,
          }}
        >
          <Label color={PALETTE.violet} size={11} style={{ marginBottom: 6 }}>cluster-scoped — outside the namespace</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 30, fontWeight: 900 }}>PV</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 700, marginTop: 6 }}>
            PersistentVolume — cluster capacity
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800, marginTop: 16, lineHeight: 1.5 }}>
            its job: <span style={{ color: PALETTE.violet }}>hold capacity — with a reclaim policy</span>
          </div>
        </div>

        {/* the namespace boundary with the PVC inside */}
        <div
          style={{
            position: 'absolute',
            left: 560,
            top: 96,
            width: 500,
            height: 470,
            borderRadius: 24,
            border: `3px dashed ${PALETTE.cyan}`,
            opacity: nsIn,
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 24,
              top: -12,
              fontFamily: MONO,
              color: PALETTE.cyan,
              fontSize: 15,
              fontWeight: 900,
              background: PALETTE.bg,
              padding: '0 10px',
            }}
          >
            namespace: payments
          </span>

          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 360,
              borderRadius: 18,
              border: `2px solid ${PALETTE.cyan}`,
              background: `${PALETTE.cyan}0c`,
              padding: '22px 24px',
              textAlign: 'center',
              opacity: pvcIn,
              boxShadow: `0 0 26px ${PALETTE.cyan}33`,
            }}
          >
            <Label color={PALETTE.cyan} size={11} style={{ marginBottom: 6 }}>namespaced — inside the boundary</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 30, fontWeight: 900 }}>PVC</div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 700, marginTop: 6 }}>
              PersistentVolumeClaim — a request
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800, marginTop: 16, lineHeight: 1.5 }}>
              its job: <span style={{ color: PALETTE.cyan }}>name size · access mode · class</span>
            </div>
          </div>
          <Label color={PALETTE.muted} size={11} style={{ position: 'absolute', left: 24, bottom: 14 }}>
            scope is the distinction — namespaced vs cluster
          </Label>
        </div>

        {/* StorageClass — cluster-scoped, outside */}
        <div
          style={{
            position: 'absolute',
            right: 60,
            top: 130,
            width: 420,
            borderRadius: 18,
            border: `2px solid ${PALETTE.amber}`,
            background: `${PALETTE.amber}0c`,
            padding: '20px 22px',
            opacity: scIn,
          }}
        >
          <Label color={PALETTE.amber} size={11} style={{ marginBottom: 6 }}>cluster-scoped — outside the namespace</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 30, fontWeight: 900 }}>StorageClass</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 700, marginTop: 6 }}>
            the recipe for storage
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 800, marginTop: 16, lineHeight: 1.5 }}>
            its job: <span style={{ color: PALETTE.amber }}>how to provision · when to bind</span>
          </div>
        </div>

        {/* claim-visibility note */}
        <div style={{ position: 'absolute', left: 560, top: 590, width: 500, textAlign: 'center' }}>
          <Label color={PALETTE.amber} size={13}>a claim is scoped to its namespace — a volume and a class are not</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 650, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>access mode and reclaim policy are part of that contract, not optional detail</Label>
        </div>
      </div>
    </div>
  );
};
