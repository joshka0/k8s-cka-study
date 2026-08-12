import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 27 beat 6 — remapping the identity. The same UID 0 inside a
 * container maps to an unprivileged host UID across the container-host
 * boundary, contrasted with the non-remapped case where container root is
 * host root. The mapping table is the image.
 */

export const UserNamespaces: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const plainIn = seg(t, 0.08, 0.24);
  const remapIn = seg(t, 0.4, 0.56);
  const footer = appear(t, 0.86, 0.94);

  const Mapping = ({ containerUid, hostUid, label }: { containerUid: string; hostUid: string; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, textAlign: 'center', fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.cyan, border: `1px solid ${PALETTE.cyan}55`, borderRadius: 8, background: '#0d1522', padding: '10px 12px' }}>
        container uid {containerUid}
      </div>
      <span style={{ flex: '0 0 auto', fontSize: 18, fontWeight: 900, color: PALETTE.line }}>→</span>
      <div style={{ flex: 1, textAlign: 'center', fontFamily: MONO, fontSize: 16, fontWeight: 900, color: label === 'host root' ? PALETTE.bad : PALETTE.good, border: `1px solid ${label === 'host root' ? PALETTE.bad : PALETTE.good}55`, borderRadius: 8, background: '#0d1522', padding: '10px 12px' }}>
        host uid {hostUid} · {label}
      </div>
    </div>
  );

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
          <Label color={PALETTE.cyan} size={13}>user namespaces remap container UIDs — root inside is not root on the host</Label>
        </div>

        {/* non-remapped */}
        <div style={{ position: 'absolute', left: 120, top: 44, width: 700, borderRadius: 18, border: `2px solid ${PALETTE.bad}55`, background: `${PALETTE.bad}04`, padding: '18px 22px', opacity: plainIn }}>
          <Label color={PALETTE.bad} size={11.5} style={{ marginBottom: 12 }}>no user namespace — container root is host root</Label>
          <Mapping containerUid="0" hostUid="0" label="host root" />
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted, marginTop: 12, textAlign: 'center' }}>
            nothing remapped — the kernel sees the same identity on both sides
          </div>
        </div>

        {/* remapped */}
        <div style={{ position: 'absolute', left: 860, top: 44, width: 700, borderRadius: 18, border: `2px solid ${PALETTE.good}66`, background: `${PALETTE.good}06`, padding: '18px 22px', opacity: remapIn }}>
          <Label color={PALETTE.good} size={11.5} style={{ marginBottom: 12 }}>user namespaces — remapped across the boundary</Label>
          <Mapping containerUid="0" hostUid="100000" label="unprivileged" />
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.muted, marginTop: 12, textAlign: 'center' }}>
            root inside maps to an unprivileged identity on the host — the kernel changes the mapping at the container boundary
          </div>
        </div>

        {/* the boundary line */}
        <div style={{ position: 'absolute', left: 120, top: 250, right: 120, textAlign: 'center' }}>
          <Label color={PALETTE.amber} size={11.5} style={{ marginBottom: 6 }}>the container / host boundary</Label>
          <div style={{ height: 3, background: `${PALETTE.amber}88` }} />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 330,
            width: 1280,
            borderRadius: 14,
            border: `2px solid ${PALETTE.violet}66`,
            background: `${PALETTE.violet}06`,
            padding: '14px 20px',
            textAlign: 'center',
            opacity: remapIn,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink }}>
            a stronger property than any spec field — because it does not depend on the workload behaving
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>the mapping table is the image — read the host identity, not the container identity</Label>
        </div>
      </div>
    </div>
  );
};
