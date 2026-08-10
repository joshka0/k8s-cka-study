import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 09 beat 6 — the endpoint is itself a Service. The resolver's query
 * goes to a ClusterIP, and that ClusterIP resolves through the same data
 * plane taught in module 08 before it ever reaches a CoreDNS Pod. The
 * data-plane hop breaks: the query never arrives, CoreDNS stays visibly
 * healthy, and the application reports a DNS failure. The direct-to-Pod test
 * bypasses the Service and succeeds — that is what isolates the fault.
 */

export const DnsIsAService: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const sceneIn = appear(t, 0.06, 0.14);
  const hopIn = seg(t, 0.14, 0.24);
  const breakHop = seg(t, 0.3, 0.42);
  const corednsHealthy = seg(t, 0.38, 0.48);
  const appBroken = seg(t, 0.44, 0.54);
  const directIn = seg(t, 0.56, 0.7);
  const footer = appear(t, 0.8, 0.88);

  const pulse = 0.55 + 0.45 * Math.sin(frame / 8);

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
      <div style={{ width: 1620, height: 690, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>the endpoint the resolver asks is normally the ClusterIP of the DNS Service — resolving anything depends on Service routing working</Label>
        </div>

        {/* the flow: app → kube-dns Service (ClusterIP) → data plane → CoreDNS Pod */}
        <div style={{ position: 'absolute', left: 40, top: 88, width: 1540, display: 'flex', alignItems: 'flex-start', gap: 16, opacity: sceneIn }}>
          {/* app */}
          <div style={{ width: 220, textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900, border: `2px solid ${PALETTE.cyan}`, borderRadius: 14, background: `${PALETTE.cyan}0c`, padding: '14px 10px' }}>
              application
            </div>
            <div
              style={{
                marginTop: 14,
                fontFamily: MONO,
                fontSize: 14.5,
                fontWeight: 800,
                color: appBroken > 0.5 ? PALETTE.bad : PALETTE.muted,
                border: `1px solid ${appBroken > 0.5 ? PALETTE.bad : PALETTE.line}66`,
                borderRadius: 10,
                background: appBroken > 0.5 ? `${PALETTE.bad}0c` : '#0c111c',
                padding: '10px 8px',
                minHeight: 76,
              }}
            >
              {appBroken > 0.5 ? '✕ DNS failure — “unknown host”' : 'query: payments.prod.svc…'}
            </div>
          </div>

          <span style={{ alignSelf: 'center', color: PALETTE.line, fontSize: 26, fontWeight: 900, marginTop: -40 }}>→</span>

          {/* kube-dns Service — a ClusterIP */}
          <div style={{ width: 300, textAlign: 'center', marginTop: -60 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900, border: `2px solid ${PALETTE.blue}`, borderRadius: 14, background: `${PALETTE.blue}0c`, padding: '12px 10px' }}>
              DNS Service
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.blue, fontSize: 14, fontWeight: 800, marginTop: 6 }}>
              ClusterIP 10.96.0.10
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>
              kube-dns · itself a Service
            </div>
          </div>

          <span style={{ alignSelf: 'center', color: PALETTE.line, fontSize: 26, fontWeight: 900, marginTop: -60 }}>→</span>

          {/* the data plane — module 08's territory */}
          <div style={{ width: 360, textAlign: 'center', marginTop: -60 }}>
            <div
              style={{
                fontFamily: MONO,
                color: breakHop > 0.5 ? PALETTE.bad : PALETTE.ink,
                fontSize: 18,
                fontWeight: 900,
                border: `2px solid ${breakHop > 0.5 ? PALETTE.bad : PALETTE.violet}`,
                borderRadius: 14,
                background: breakHop > 0.5 ? `${PALETTE.bad}0c` : `${PALETTE.violet}0c`,
                padding: '12px 10px',
              }}
            >
              Service data plane
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 6, lineHeight: 1.35 }}>
              module 08's path — the ClusterIP has to route before any DNS happens
            </div>
            {breakHop > 0.5 && (
              <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 15, fontWeight: 900, marginTop: 8, opacity: 0.6 + 0.4 * pulse }}>
                ✕ the hop breaks — rules not programmed
              </div>
            )}
          </div>

          <span style={{ alignSelf: 'center', color: PALETTE.line, fontSize: 26, fontWeight: 900, marginTop: -60 }}>→</span>

          {/* CoreDNS Pod — healthy but unreachable */}
          <div style={{ width: 300, textAlign: 'center', marginTop: -60 }}>
            <div
              style={{
                fontFamily: MONO,
                color: PALETTE.good,
                fontSize: 18,
                fontWeight: 900,
                border: `2px solid ${PALETTE.good}`,
                borderRadius: 14,
                background: `${PALETTE.good}0c`,
                padding: '12px 10px',
                boxShadow: `0 0 22px ${PALETTE.good}33`,
              }}
            >
              CoreDNS Pod
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 13.5, fontWeight: 800, marginTop: 6, opacity: corednsHealthy > 0.5 ? 1 : 0.4 }}>
              healthy — never saw the query
            </div>
          </div>
        </div>

        {/* the verdict */}
        <div
          style={{
            position: 'absolute',
            left: 240,
            top: 440,
            width: 1140,
            borderRadius: 16,
            border: `1px solid ${PALETTE.amber}66`,
            background: `${PALETTE.amber}08`,
            padding: '16px 22px',
            textAlign: 'center',
            opacity: appear(t, 0.46, 0.56),
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>
            DNS appears broken — and every symptom points at CoreDNS. <span style={{ color: PALETTE.amber }}>CoreDNS is fine.</span>{' '}
            <span style={{ color: PALETTE.bad }}>The route to it is not.</span>
          </div>
        </div>

        {/* the direct test */}
        <div
          style={{
            position: 'absolute',
            left: 240,
            top: 520,
            width: 1140,
            borderRadius: 16,
            border: `2px solid ${PALETTE.good}77`,
            background: `${PALETTE.good}08`,
            padding: '18px 24px',
            opacity: directIn,
            display: 'flex',
            alignItems: 'center',
            gap: 26,
          }}
        >
          <div style={{ flex: 1 }}>
            <Label color={PALETTE.good} size={11} style={{ marginBottom: 6 }}>the isolating test — bypass the Service</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 800 }}>
              dig @&lt;coreDNS-Pod-IP&gt; payments.prod.svc.cluster.local
            </div>
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 19, fontWeight: 900, border: `1px solid ${PALETTE.good}`, borderRadius: 999, background: `${PALETTE.good}10`, padding: '10px 18px' }}>
            succeeds ✓ → the fault is Service routing
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 626, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>testing a CoreDNS Pod address directly separates the two in one command — healthy-but-unreachable is the image to remember</Label>
        </div>
      </div>
    </div>
  );
};
