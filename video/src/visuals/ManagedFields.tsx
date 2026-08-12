import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const FIELDS = [
  { path: 'spec.template', owner: 'Deployment' },
  { path: 'metadata.annotations', owner: 'service-mesh' },
  { path: 'spec.replicas', owner: 'HPA' },
];

/**
 * Shared visual with one additive extension. Module 02 renders exactly as
 * before. Module 23 renders the same conflict, then inserts the deliberate
 * step the module teaches: read managedFields as the object-level record of
 * who owns each field, decide deliberately whether to force. That step lands
 * between the conflict and the decision, so the earlier module is unchanged.
 */
export const ManagedFields: React.FC<VisualProps> = ({ module }) => {
  if (module?.module.number === 23) return <ModuleManagedFields />;
  return <PilotManagedFields />;
};

const PilotManagedFields: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const t = frame / durationInFrames;

  const rowsIn = (i: number) => appear(t, 0.1 + i * 0.08, 0.16 + i * 0.08);
  const conflict = appear(t, 0.42, 0.5);
  const fighting = seg(t, 0.58, 0.9);
  const footer = appear(t, 0.9, 0.97);

  const tick = Math.floor((frame / fps) * 6);
  const replicasOwner = fighting > 0 ? (tick % 2 === 0 ? 'HPA' : 'applier') : 'HPA';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 150, paddingRight: 150 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        server-side apply tracks ownership per field path — managed fields
      </Label>

      <Box pad={20} borderColor={PALETTE.blue} style={{ width: 980, margin: '0 auto' }}>
        <Label color={PALETTE.muted} size={11} style={{ marginBottom: 12 }}>object · managed fields</Label>
        {FIELDS.map((f, i) => {
          const isReplicas = f.path === 'spec.replicas';
          const on = rowsIn(i);
          const owner = isReplicas ? replicasOwner : f.owner;
          const contested = isReplicas && fighting > 0;
          return (
            <div
              key={f.path}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderTop: `1px solid ${PALETTE.line}`,
                borderRadius: 10,
                opacity: on,
                background: contested ? `${PALETTE.amber}14` : 'transparent',
              }}
            >
              <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 800 }}>{f.path}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {contested && <span style={{ color: PALETTE.bad, fontSize: 22 }}>⚔</span>}
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 17,
                    fontWeight: 900,
                    color: contested ? PALETTE.amber : PALETTE.cyan,
                    border: `1px solid ${contested ? PALETTE.amber : PALETTE.cyan}`,
                    borderRadius: 999,
                    padding: '4px 14px',
                    background: contested ? `${PALETTE.amber}18` : 'transparent',
                  }}
                >
                  {owner}
                </span>
              </div>
            </div>
          );
        })}
      </Box>

      {conflict > 0 && (
        <div style={{ textAlign: 'center', marginTop: 18, opacity: conflict }}>
          <Box pad={12} borderColor={PALETTE.bad} bg={`${PALETTE.bad}12`} style={{ display: 'inline-block' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 20, fontWeight: 900 }}>
              apply claims spec.replicas — already owned by the HPA → conflict
            </span>
          </Box>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 22, opacity: appear(t, 0.6, 0.68) }}>
        <Label color={PALETTE.amber} size={12}>forcing the apply takes the field — the previous owner sets it back on its next reconcile</Label>
      </div>

      <div style={{ textAlign: 'center', marginTop: 14, opacity: footer }}>
        <Label color={PALETTE.amber} size={14}>you have built a fight, not a fix</Label>
      </div>
    </div>
  );
};

/**
 * Module 23 beat 6 — the conflict is information, not a retry problem.
 * Reuses the module 02 layout and inserts the deliberate step between the
 * conflict and the decision: read managedFields, which names the other owner,
 * then decide whether forcing is right. Forcing is right when ownership is
 * genuinely moving, and wrong when a controller will simply set the value
 * back.
 */
const ModuleManagedFields: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const t = frame / durationInFrames;

  const rowsIn = (i: number) => appear(t, 0.1 + i * 0.08, 0.16 + i * 0.08);
  const conflict = appear(t, 0.34, 0.4);
  const readMf = seg(t, 0.46, 0.58);
  const decision = appear(t, 0.62, 0.7);
  const wrongForce = appear(t, 0.76, 0.84);
  const footer = appear(t, 0.9, 0.97);

  const tick = Math.floor((frame / fps) * 6);
  const replicasOwner = readMf > 0.5 ? 'HPA' : (tick % 2 === 0 ? 'HPA' : 'applier');
  const contested = readMf <= 0.5;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 110, paddingRight: 110 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 22 }}>
        server-side apply records ownership per field — a conflict names the owner
      </Label>

      <Box pad={20} borderColor={PALETTE.blue} style={{ width: 900, margin: '0 auto' }}>
        <Label color={PALETTE.muted} size={11} style={{ marginBottom: 12 }}>object · managed fields</Label>
        {FIELDS.map((f, i) => {
          const isReplicas = f.path === 'spec.replicas';
          const on = rowsIn(i);
          const owner = isReplicas ? replicasOwner : f.owner;
          return (
            <div
              key={f.path}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderTop: `1px solid ${PALETTE.line}`,
                borderRadius: 10,
                opacity: on,
                background: contested && isReplicas ? `${PALETTE.amber}14` : 'transparent',
              }}
            >
              <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 800 }}>{f.path}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {contested && isReplicas && <span style={{ color: PALETTE.bad, fontSize: 22 }}>⚔</span>}
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 17,
                    fontWeight: 900,
                    color: contested && isReplicas ? PALETTE.amber : PALETTE.cyan,
                    border: `1px solid ${(contested && isReplicas) ? PALETTE.amber : PALETTE.cyan}`,
                    borderRadius: 999,
                    padding: '4px 14px',
                    background: (contested && isReplicas) ? `${PALETTE.amber}18` : 'transparent',
                  }}
                >
                  {owner}
                </span>
              </div>
            </div>
          );
        })}
      </Box>

      {conflict > 0 && (
        <div style={{ textAlign: 'center', marginTop: 14, opacity: conflict }}>
          <Box pad={10} borderColor={PALETTE.bad} bg={`${PALETTE.bad}12`} style={{ display: 'inline-block' }}>
            <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 18, fontWeight: 900 }}>
              apply claims spec.replicas — owned by someone else → conflict
            </span>
          </Box>
        </div>
      )}

      {/* the deliberate step this module adds */}
      <div
        style={{
          width: 900,
          margin: '20px auto 0',
          borderRadius: 16,
          border: `2px solid ${PALETTE.good}`,
          background: `${PALETTE.good}06`,
          padding: '16px 20px',
          opacity: readMf,
        }}
      >
        <Label color={PALETTE.good} size={12} style={{ marginBottom: 8 }}>a conflict is information — read managedFields</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.ink }}>read managedFields</span>
          <span style={{ color: PALETTE.good, fontSize: 18, fontWeight: 900 }}>→</span>
          <span style={{ flex: 1, fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.muted }}>
            the API tells you who owns the field — decide deliberately
          </span>
          <span style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 900, color: PALETTE.cyan, border: `1px solid ${PALETTE.cyan}66`, borderRadius: 999, padding: '5px 12px', whiteSpace: 'nowrap' }}>
            owner: HPA
          </span>
        </div>
      </div>

      {/* the decision */}
      <div style={{ width: 900, margin: '14px auto 0', opacity: decision }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${PALETTE.good}66`, background: `${PALETTE.good}08`, padding: '12px 16px' }}>
            <Label color={PALETTE.good} size={11}>force — right when</Label>
            <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, marginTop: 6, lineHeight: 1.4 }}>
              ownership is genuinely moving to the new manager
            </div>
          </div>
          <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${PALETTE.bad}66`, background: `${PALETTE.bad}06`, padding: '12px 16px', opacity: wrongForce }}>
            <Label color={PALETTE.bad} size={11}>force — wrong when</Label>
            <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, marginTop: 6, lineHeight: 1.4 }}>
              the owner is a controller that will simply set the value back
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>read the owner, then decide — a conflict is the API telling you who, not a retry problem</Label>
      </div>
    </div>
  );
};
