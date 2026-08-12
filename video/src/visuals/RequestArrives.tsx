import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Horizontal, Label, SANS, MONO, ArrowGlyph } from '../ui';
import type { Beat } from '../script';
import { appear, seg } from '../motion';

export const RequestArrives: React.FC<{ beat: Beat }> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const yamlIn = appear(t, 0.06, 0.2);
  const packet = seg(t, 0.28, 0.46);
  const othersIn = appear(t, 0.52, 0.7);

  const others = [
    'scheduler',
    'controller',
    'kubelet',
    'kube-proxy',
  ];

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Horizontal center gap={30} style={{ marginTop: 70 }}>
        {/* YAML */}
        <div
          style={{
            opacity: yamlIn,
            transform: `translateX(${(1 - yamlIn) * -240}px)`,
          }}
        >
          <YamlDoc />
        </div>
        <ArrowGlyph color={PALETTE.muted} size={30} style={{ opacity: yamlIn * (1 - packet) }} />

        {/* kubectl */}
        <Box bg="#0f2038" border={2} pad={16} style={{ width: 150, textAlign: 'center' }}>
          <Label color={PALETTE.blueInk} size={12}>client</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 800 }}>kubectl</div>
        </Box>

        {/* packet */}
        <div style={{ position: 'relative', width: 150, height: 70 }}>
          <div
            style={{
              position: 'absolute',
              left: interpolateLen(packet, 0, 1),
              top: 22,
              opacity: packet > 0.02 && packet < 0.98 ? 1 : packet >= 0.98 ? 0.6 : 0,
              fontFamily: MONO,
              color: PALETTE.cyan,
              background: `${PALETTE.cyan}1a`,
              border: `1px solid ${PALETTE.cyan}`,
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 15,
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            HTTP POST · TLS
          </div>
        </div>

        {/* API server */}
        <Box
          bg={`${PALETTE.blue}18`}
          border={2}
          borderColor={PALETTE.blue}
          pad={16}
          style={{ width: 190, textAlign: 'center' }}
        >
          <Label color={PALETTE.blueInk} size={12}>control plane</Label>
          <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 24, fontWeight: 900 }}>API server</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, marginTop: 4 }}>the only writer to etcd</div>
        </Box>
        <ArrowGlyph color={PALETTE.muted} size={28} />
        <Box pad={14} style={{ width: 150, textAlign: 'center' }}>
          <Label color={PALETTE.muted} size={12}>storage</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 800 }}>etcd</div>
        </Box>
      </Horizontal>

      {/* other components drawing arrows to API server */}
      <div style={{ marginTop: 40 }}>
        {others.map((c, i) => {
          const on = appear(t, 0.5 + i * 0.05, 0.58 + i * 0.05);
          const isController = c === 'controller';
          return (
            <Horizontal key={c} center gap={12} style={{ marginTop: 10, opacity: on }}>
              <div style={{ width: 150, textAlign: 'right', fontFamily: MONO, color: PALETTE.muted, fontSize: 18, fontWeight: 700 }}>
                {c}
              </div>
              <div style={{ width: 120, position: 'relative' }}>
                {isController ? (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 26 }}>
                    <div style={{ flex: 1, borderTop: `2px dashed ${PALETTE.bad}`, position: 'relative' }} />
                    <span style={{ color: PALETTE.bad, fontSize: 22, marginLeft: 6, fontWeight: 900 }}>✕</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 26 }}>
                    <ArrowGlyph color={PALETTE.blue} deg={-90} />
                  </div>
                )}
              </div>
              <div
                style={{
                  width: 190,
                  fontFamily: MONO,
                  color: isController ? PALETTE.bad : PALETTE.muted,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {isController ? 'reads etcd directly (skips authn / authz / admission)' : `→ API server · watches`}
              </div>
            </Horizontal>
          );
        })}
      </div>

      <div style={{ marginTop: 36, textAlign: 'center', opacity: appear(t, 0.72, 0.85) }}>
        <Label color={PALETTE.amber} size={13}>
          every write — authn · authz · admission · validate · convert · audit
        </Label>
      </div>
    </div>
  );
};

function interpolateLen(p: number, a: number, b: number) {
  return a + (b - a) * p;
}

function YamlDoc() {
  return (
    <Box mono pad={14} style={{ width: 260 }}>
      <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 14, marginBottom: 6 }}>
        # desired state — declaration, not instructions
      </div>
      <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, lineHeight: 1.6 }}>
        <span style={{ color: PALETTE.blue }}>kind:</span> Deployment
        <br />
        <span style={{ color: PALETTE.blue }}>spec:</span>
        <br />
        &nbsp;&nbsp;<span style={{ color: PALETTE.good }}>replicas:</span> 3
        <br />
        &nbsp;&nbsp;<span style={{ color: PALETTE.good }}>image:</span> app:v1
      </div>
    </Box>
  );
}
