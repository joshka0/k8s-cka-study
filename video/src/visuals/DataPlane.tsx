import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Horizontal, Label, SANS, MONO } from '../ui';
import type { Beat } from '../script';
import { appear, seg } from '../motion';

export const DataPlane: React.FC<{ beat: Beat }> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const left = appear(t, 0.08, 0.4);
  const right = appear(t, 0.42, 0.7);
  const banner = appear(t, 0.5, 0.6);

  const packetU = seg(t, 0.18, 0.38);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* shared banner */}
      <div style={{ textAlign: 'center', marginBottom: 24, opacity: banner }}>
        <span
          style={{
            fontFamily: MONO,
            color: PALETTE.cyan,
            border: `1px solid ${PALETTE.blue}`,
            borderRadius: 999,
            padding: '8px 22px',
            fontSize: 20,
            fontWeight: 900,
            background: `${PALETTE.blue}18`,
          }}
        >
          same Service API — implementations, not APIs
        </span>
      </div>

      <div style={{ display: 'flex', gap: 30, justifyContent: 'center' }}>
        {/* LEFT: kube-proxy + iptables/ipvs/nftables */}
        <Box pad={16} style={{ width: 720, opacity: left }}>
          <Label color={PALETTE.violet} size={12} style={{ marginBottom: 10 }}>kube-proxy · iptables / IPVS / nftables</Label>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div
              style={{
                fontFamily: MONO,
                color: PALETTE.ink,
                fontSize: 15,
                fontWeight: 800,
                border: '1px solid #33415e',
                borderRadius: 8,
                padding: '10px 12px',
                background: '#0d1522',
                whiteSpace: 'nowrap',
                opacity: packetU > 0 ? 1 : 0.4,
              }}
            >
              pkt → dst 10.96.0.1
            </div>
            <span style={{ color: PALETTE.good, fontSize: 22, fontWeight: 900 }}>{packetU > 0.35 ? 'DNAT →' : '→'}</span>
            <div
              style={{
                fontFamily: MONO,
                color: PALETTE.good,
                fontSize: 15,
                border: `1px solid ${PALETTE.good}`,
                borderRadius: 8,
                padding: '10px 12px',
                background: `${PALETTE.good}12`,
                opacity: packetU > 0.5 ? 1 : 0.4,
              }}
            >
              pod IP 10.0.0.16
            </div>
          </div>
          <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 16, lineHeight: 1.8 }}>
            <div style={{ color: PALETTE.muted }}># rules your proxy writes</div>
            <div style={{ color: PALETTE.ink }}>{'-A KUBE-SVC -d 10.96.0.1 -j DNAT --to 10.0.0.16:8080'}</div>
          </div>
        </Box>

        {/* RIGHT: eBPF */}
        <Box pad={16} style={{ width: 720, opacity: right }}>
          <Label color={PALETTE.cyan} size={12} style={{ marginBottom: 10 }}>eBPF data plane</Label>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14 }}>socket layer</div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 16,
                  fontWeight: 800,
                  border: `1px solid ${PALETTE.cyan}`,
                  borderRadius: 8,
                  padding: '10px',
                  background: `${PALETTE.cyan}10`,
                  marginTop: 6,
                }}
              >
                translate before the packet is built
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, marginTop: 10 }}>conntrack lives in BPF maps, not netfilter</div>
            </div>
            <div style={{ width: 250 }}>
              <Label color={PALETTE.good} size={11}>BPF map · conntrack</Label>
              {['10.96.0.1 → 10.0.0.16', '10.96.0.1:443 → …', '10.96.0.1:80 → …'].map((r) => (
                <div key={r} style={{ fontFamily: MONO, fontSize: 13, color: PALETTE.good, borderBottom: '1px solid #223', padding: '6px 4px' }}>
                  {r}
                </div>
              ))}
            </div>
          </div>
        </Box>
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, opacity: appear(t, 0.72, 0.82) }}>
        <Label color={PALETTE.muted} size={13}>eBPF moves where the state lives; it does not remove connection tracking</Label>
      </div>
    </div>
  );
};
