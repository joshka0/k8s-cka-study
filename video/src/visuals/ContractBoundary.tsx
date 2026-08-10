import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

const SEVEN = [
  'identity',
  'authorisation',
  'defaulting',
  'schema validation',
  'versioned conversion',
  'audit',
  'supported watch semantics',
];

export const ContractBoundary: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const directPair = appear(t, 0.08, 0.2);      // phase 1: two outer components
  const bypass = appear(t, 0.3, 0.44);          // phase 2: controller -> etcd
  const items = seg(t, 0.5, 0.82);              // seven items stack up
  const strike = appear(t, 0.84, 0.94);         // both arrows struck

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 18 }}>
        one contract — nothing talks to etcd except the API server
      </Label>

      {/* Phase 1: direct arrow between two outer components, refused */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 30,
          opacity: directPair,
          transform: `translateY(${(1 - directPair) * 20}px)`,
        }}
      >
        <Box pad={12} borderColor={PALETTE.violet}>
          <div style={{ fontFamily: MONO, color: PALETTE.violet, fontSize: 20, fontWeight: 900 }}>scheduler</div>
        </Box>
        <ArrowStruck opacity={directPair * strike} label="" />
        <Box pad={12} borderColor={PALETTE.cyan}>
          <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 20, fontWeight: 900 }}>kubelet</div>
        </Box>
        <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 15, fontWeight: 800, opacity: strike }}>
          ✕ they never talk to each other
        </span>
      </div>

      {/* Phase 2: controller -> etcd bypassing the API server */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, gap: 40, alignItems: 'center', opacity: bypass }}>
        {/* controller column */}
        <VerticalBox>
          <Box pad={14} borderColor={PALETTE.blue}>
            <Label color={PALETTE.blue} size={11}>control plane</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 26, fontWeight: 900 }}>controller</div>
          </Box>
        </VerticalBox>

        {/* bypass arrow (low, straddles the API server) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'relative', width: 420, height: 150 }}>
            <div
              style={{
                position: 'absolute',
                top: 70,
                left: 0,
                right: 0,
                borderTop: `3px dashed ${PALETTE.bad}`,
                opacity: 0.85,
              }}
            />
            {strike > 0 && (
              <div style={{ position: 'absolute', top: 22, left: 0, right: 0, textAlign: 'center' }}>
                <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 44, fontWeight: 900, opacity: strike }}>✕</span>
              </div>
            )}
            {/* API server sits above, on the contract path */}
            <div style={{ position: 'absolute', top: 0, left: 130, textAlign: 'center' }}>
              <Box pad={10} borderColor={PALETTE.blue}>
                <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>API server</div>
              </Box>
            </div>
          </div>
          <Label color={PALETTE.bad} size={11} style={{ textAlign: 'center' }}>
            reads etcd directly — bypasses the contract
          </Label>
        </div>

        <VerticalBox>
          <Box pad={14} borderColor={PALETTE.amber}>
            <Label color={PALETTE.amber} size={11}>storage</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 26, fontWeight: 900 }}>etcd</div>
          </Box>
        </VerticalBox>

        {/* the seven things it skips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 320 }}>
          <Label color={PALETTE.bad} size={11} style={{ marginBottom: 2 }}>skips all seven on every write</Label>
          {SEVEN.map((s, i) => {
            const on = items > i / SEVEN.length;
            return (
              <div
                key={s}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: on ? 1 : 0.15,
                  fontFamily: MONO,
                  fontSize: 15,
                  fontWeight: 700,
                  color: PALETTE.muted,
                }}
              >
                <span style={{ color: PALETTE.bad }}>✕</span>
                {s}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: appear(t, 0.88, 1) }}>
        <Label color={PALETTE.amber} size={13}>a controller that reads etcd directly also couples to a storage layout that is not a public contract</Label>
      </div>
    </div>
  );
};

function ArrowStruck({ opacity }: { opacity: number; label: string }) {
  return (
    <div style={{ position: 'relative', width: 120, height: 30, opacity }}>
      <div style={{ position: 'absolute', top: 14, left: 0, right: 0, borderTop: `3px dashed ${PALETTE.bad}` }} />
      <div style={{ position: 'absolute', top: 4, left: 44 }}><span style={{ color: PALETTE.bad, fontSize: 30, fontWeight: 900 }}>✕</span></div>
    </div>
  );
}

function VerticalBox({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
