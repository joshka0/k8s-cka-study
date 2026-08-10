import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

type Phase = { title: string; flow: number; queue: number; color: string; note: string };

const PHASES: Phase[] = [
  { title: 'narrow rule', flow: 0.3, queue: 0, color: PALETTE.good, note: 'scoped to one CRD · one namespace' },
  { title: 'wildcard rule', flow: 1, queue: 0, color: PALETTE.amber, note: 'every matching request now waits on it' },
  { title: 'webhook down', flow: 1, queue: 8, color: PALETTE.bad, note: 'burst radius = every pod in the cluster' },
];

export const WebhookBlast: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const panIn = (i: number) => appear(t, 0.1 + i * 0.24, 0.2 + i * 0.24);
  const footer = appear(t, 0.88, 0.96);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 20, paddingLeft: 90, paddingRight: 90 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 30 }}>
        registering a webhook puts your Service, its DNS, its TLS trust and its response deadline on the API path
      </Label>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
        {PHASES.map((p, i) => (
          <div key={p.title} style={{ opacity: panIn(i), width: 460 }}>
            <div style={{ border: `1px solid ${p.color}55`, borderRadius: 20, padding: 16, background: `${p.color}0a` }}>
              <Label color={p.color} size={12} style={{ textAlign: 'center', marginBottom: 16 }}>{p.title}</Label>

              {/* API server */}
              <Box pad={10} borderColor={PALETTE.blue} style={{ width: 220, textAlign: 'center', margin: '0 auto' }}>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16, fontWeight: 900 }}>API server</div>
              </Box>

              {/* request stream */}
              <div style={{ marginTop: 16, position: 'relative', height: 26 }}>
                <div style={{ position: 'absolute', top: 12, left: 8, right: 8, borderTop: `1px solid ${PALETTE.line}` }} />
                {Array.from({ length: 8 }).map((_, k) => {
                  const detours = k < Math.round(8 * p.flow);
                  return (
                    <span
                      key={k}
                      style={{
                        position: 'absolute',
                        left: 12 + k * 26,
                        top: detours ? 22 : 4,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: detours ? p.color : PALETTE.cyan,
                        opacity: detours ? 0.9 : 0.7,
                      }}
                    />
                  );
                })}
              </div>

              {/* webhook Service */}
              <Box
                pad={10}
                borderColor={p.color}
                style={{
                  width: 260,
                  textAlign: 'center',
                  margin: '10px auto 0',
                  background: `${p.color}12`,
                }}
              >
                <div style={{ fontFamily: MONO, color: p.color, fontSize: 16, fontWeight: 900 }}>
                  webhook Service {p.queue > 0 ? '· down' : ''}
                </div>
              </Box>

              {/* queue backing up */}
              {p.queue > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 10 }}>
                  {Array.from({ length: p.queue }).map((_, k) => (
                    <span key={k} style={{ width: 12, height: 20, background: PALETTE.bad, borderRadius: 3, opacity: 0.4 + (k / p.queue) * 0.6 }} />
                  ))}
                </div>
              )}

              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, textAlign: 'center', marginTop: 10, fontWeight: 700 }}>
                {p.note}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 28, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>the width of your rule is the breadth of your blast radius</Label>
      </div>
    </div>
  );
};
