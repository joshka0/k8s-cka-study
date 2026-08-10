import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 09 beat 1 — the query that actually leaves. The typed name on the
 * left, the real /etc/resolv.conf in the centre (nameserver, search list,
 * options ndots — full type scale, a real file block), and on the right the
 * actual queries generated from it, in order. The difference between the
 * typed name and the emitted queries is the image.
 */

const EMITTED = [
  'api.default.svc.cluster.local.',
  'api.svc.cluster.local.',
  'api.cluster.local.',
  'api.',
];

export const ResolvConf: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const typedIn = appear(t, 0.06, 0.14);
  const fileIn = appear(t, 0.12, 0.22);
  const queriesIn = seg(t, 0.22, 0.5);
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
      <div style={{ width: 1620, height: 660, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>the query that leaves the Pod is not the name you typed — the file decides</Label>
        </div>

        {/* LEFT — the typed name */}
        <div style={{ position: 'absolute', left: 60, top: 120, width: 360, opacity: typedIn }}>
          <Label color={PALETTE.muted} size={11} style={{ marginBottom: 10 }}>you type</Label>
          <div
            style={{
              fontFamily: MONO,
              color: PALETTE.ink,
              fontSize: 34,
              fontWeight: 900,
              border: `2px solid ${PALETTE.cyan}`,
              borderRadius: 14,
              background: `${PALETTE.cyan}0c`,
              padding: '18px 22px',
              boxShadow: `0 0 22px ${PALETTE.cyan}33`,
            }}
          >
            api
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 10, lineHeight: 1.4 }}>
            partially qualified — ndots decides how it is expanded
          </div>
        </div>

        {/* CENTRE — the real resolv.conf */}
        <div style={{ position: 'absolute', left: 480, top: 84, width: 660, opacity: fileIn }}>
          <Label color={PALETTE.muted} size={11} style={{ marginBottom: 8 }}>the file inside the Pod — written by the kubelet</Label>
          <div
            style={{
              background: '#0a1019',
              border: `2px solid ${PALETTE.blue}`,
              borderRadius: 16,
              padding: '20px 24px',
              fontFamily: MONO,
              boxShadow: `0 0 26px ${PALETTE.blue}33`,
            }}
          >
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ marginLeft: 10, color: PALETTE.muted, fontSize: 13 }}>etc/resolv.conf</span>
            </div>
            <div style={{ fontSize: 19, lineHeight: 2, color: PALETTE.ink, fontWeight: 700 }}>
              <div><span style={{ color: PALETTE.cyan, fontWeight: 900 }}>nameserver</span> 10.96.0.10</div>
              <div><span style={{ color: PALETTE.violet, fontWeight: 900 }}>search</span> default.svc.cluster.local svc.cluster.local cluster.local</div>
              <div><span style={{ color: PALETTE.amber, fontWeight: 900 }}>options</span> ndots:5</div>
            </div>
          </div>
        </div>

        {/* RIGHT — the queries actually emitted */}
        <div style={{ position: 'absolute', left: 1200, top: 84, width: 380, opacity: queriesIn > 0 ? 1 : 0.4 }}>
          <Label color={PALETTE.good} size={11} style={{ marginBottom: 8 }}>queries actually emitted, in order</Label>
          <div style={{ border: `1px solid ${PALETTE.line}`, borderRadius: 14, background: '#0c111c', padding: '10px 14px' }}>
            {EMITTED.map((q, i) => (
              <div
                key={q}
                style={{
                  fontFamily: MONO,
                  fontSize: 14.5,
                  fontWeight: 800,
                  color: i === EMITTED.length - 1 ? PALETTE.good : PALETTE.ink,
                  padding: '9px 4px',
                  borderBottom: i < EMITTED.length - 1 ? `1px solid ${PALETTE.line}` : 'none',
                  opacity: queriesIn > 0.15 + i * 0.12 ? 1 : 0.3,
                  lineHeight: 1.4,
                }}
              >
                <span style={{ color: PALETTE.muted }}>{i + 1}.</span> {q}
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 13.5, fontWeight: 800, marginTop: 10, lineHeight: 1.4 }}>
            ndots:5 — 'api' has no dots, so every search domain is tried first
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>first move in a DNS investigation — read the actual resolv.conf inside the Pod, not the Service, not CoreDNS</Label>
        </div>
      </div>
    </div>
  );
};
