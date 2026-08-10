import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

export const AutoscalerConflict: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const intro = appear(t, 0.1, 0.22);
  const footer = appear(t, 0.9, 0.97);

  // oscillation: utilisation swings low/high as requests and pods fight
  const P = Math.sin(t * Math.PI * 2 * 1.6);   // -1..1, ~1.6 cycles
  const requests = 100 + P * 38;               // VPA moves requests
  const usage = 40;                            // real usage unchanged
  const util = Math.round((usage / requests) * 100);
  const pods = Math.round(6 - P * 3);          // HPA scales on utilisation
  const loadPerPod = Math.round((100 * 6) / pods); // load per pod

  const bar = (v: number) => `${Math.max(4, Math.min(100, v))}%`;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 26, paddingLeft: 140, paddingRight: 140 }}>
      <Label color={PALETTE.cyan} size={12} style={{ textAlign: 'center', marginBottom: 26 }}>
        HPA and VPA both key on CPU or memory — against the same utilisation number
      </Label>

      <div style={{ opacity: intro, display: 'flex', justifyContent: 'center', gap: 70 }}>
        {/* utilisation gauge */}
        <div style={{ textAlign: 'center', width: 360 }}>
          <Label color={PALETTE.cyan} size={12}>utilisation = usage / requests</Label>
          <Box pad={18} borderColor={PALETTE.cyan} style={{ marginTop: 14 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 72, fontWeight: 900, lineHeight: 1 }}>{util}%</div>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 13, color: PALETTE.muted, fontWeight: 700 }}>
                <span>usage (const)</span><span>requests (VPA)</span>
              </div>
              <div style={{ marginTop: 4 }}>
                <BarRow label="usage" v={40} color={PALETTE.ink} />
                <BarRow label="requests" v={requests} color={PALETTE.violet} />
              </div>
            </div>
          </Box>
        </div>

        {/* the fight */}
        <div style={{ width: 520 }}>
          <Label color={PALETTE.bad} size={13} style={{ marginBottom: 18 }}>the oscillation</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Step icon="↗" color={PALETTE.violet} text="VPA raises requests → utilisation falls, usage unchanged" />
            <Step icon="⇣" color={PALETTE.cyan} text={`HPA sees low utilisation → scales down to ${pods} pods`} />
            <Step icon="↗" color={PALETTE.bad} text={`load per pod rises to ${loadPerPod}% → utilisation climbs again`} />
          </div>
          <div style={{ marginTop: 20, textAlign: 'center', opacity: appear(t, 0.7, 0.8) }}>
            <Box pad={12} borderColor={PALETTE.amber} style={{ display: 'inline-block' }}>
              <span style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 17, fontWeight: 900 }}>
                neither is broken — they are sharing a variable
              </span>
            </Box>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 30, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>the gauge keeps swinging — VPA redefines the denominator HPA scales on</Label>
      </div>
    </div>
  );
};

function BarRow({ label, v, color }: { label: string; v: number; color: string }) {
  const pct = `${Math.max(4, Math.min(100, v))}%`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
      <span style={{ fontFamily: MONO, fontSize: 12, color: PALETTE.muted, width: 70, fontWeight: 700 }}>{label}</span>
      <div style={{ flex: 1, height: 14, background: '#0c111c', borderRadius: 999 }}>
        <div style={{ width: pct, height: '100%', background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function Step({ icon, color, text }: { icon: string; color: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ fontSize: 24, color }}>{icon}</span>
      <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 800 }}>{text}</span>
    </div>
  );
}
