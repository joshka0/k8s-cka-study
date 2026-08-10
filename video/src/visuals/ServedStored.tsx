import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const ServedStored: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const crd = appear(t, 0.1, 0.2);
  const flip = seg(t, 0.42, 0.52);
  const newObj = appear(t, 0.56, 0.64);
  const removed = seg(t, 0.74, 0.84);
  const footer = appear(t, 0.9, 0.97);

  const storageV2 = flip > 0;

  // store rows: two old (v1) + one new (v2 after flip)
  const rows = [
    { name: 'obj-a', ver: 'v1' },
    { name: 'obj-b', ver: 'v1' },
    { name: 'obj-c', ver: storageV2 ? 'v2' : 'v1', isNew: true },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 150, paddingRight: 150 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 24 }}>
        a CRD can serve several versions at once — exactly one is the storage version
      </Label>

      {/* the CRD */}
      <div style={{ display: 'flex', justifyContent: 'center', opacity: crd }}>
        <Box pad={12} borderColor={PALETTE.blue} bg={`${PALETTE.blue}0c`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900 }}>widgets.example.io</span>
            <VerTag label="served · v1 v2" color={PALETTE.blue} />
            <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.amber }}>
              storage: {storageV2 ? 'v2' : 'v1'}
            </span>
          </div>
        </Box>
      </div>

      {/* the store */}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
        <Box pad={16} borderColor={PALETTE.line} style={{ width: 760 }}>
          <Label color={PALETTE.muted} size={11} style={{ marginBottom: 10 }}>the store — what is actually persisted</Label>
          {rows.map((r, i) => {
            const visible = !r.isNew || newObj > 0;
            const unreadable = removed > 0 && r.ver === 'v1';
            const onRead = removed > 0 && r.ver === 'v1';
            return (
              <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: MONO, fontSize: 16, fontWeight: 800, padding: '9px 12px', borderTop: `1px solid ${PALETTE.line}`, opacity: visible ? 1 : 0 }}>
                <span style={{ color: unreadable ? PALETTE.bad : PALETTE.ink }}>{r.name}</span>
                <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span style={{ color: PALETTE.muted }}>stored: {r.ver}</span>
                  {unreadable ? (
                    <span style={{ color: PALETTE.bad, fontWeight: 900 }}>✕ unreadable — v1 removed</span>
                  ) : r.isNew ? (
                    <span style={{ color: PALETTE.good }}>stored as v2 after flip</span>
                  ) : onRead ? (
                    <span style={{ color: PALETTE.amber }}>old · converts on read</span>
                  ) : (
                    <span style={{ color: PALETTE.muted }}>·</span>
                  )}
                </span>
              </div>
            );
          })}
        </Box>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, opacity: newObj || 1 }}>
        <Label color={PALETTE.muted} size={12}>
          {flip > 0 ? 'flipping the marker migrates nothing — old objects keep their encoding and convert on read' : 'changing the storage marker does not migrate what is already stored'}
        </Label>
      </div>

      <div style={{ textAlign: 'center', marginTop: 14, opacity: footer }}>
        <Label color={PALETTE.bad} size={13}>remove an old version before migrating → objects nobody can read</Label>
      </div>
    </div>
  );
};

function VerTag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color, border: `1px solid ${color}`, borderRadius: 999, padding: '3px 12px' }}>{label}</span>
  );
}
