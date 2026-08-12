import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 21 beat 6 — joined, and still NotReady. A node with a failed
 * credential tries to report status; the request is rejected at
 * authentication and the Node object stays stale. The join command returns
 * success earlier in the timeline, so the gap between "join returned success"
 * and "working credentials" is visible — this is an identity problem, not a
 * scheduling one.
 */

export const CertErrors: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const joinIn = appear(t, 0.08, 0.16);
  const attempt = seg(t, 0.3, 0.42);
  const rejected = appear(t, 0.46, 0.56);
  const stale = appear(t, 0.58, 0.66);
  const gapTag = appear(t, 0.7, 0.8);
  const footer = appear(t, 0.86, 0.93);

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
      <div style={{ width: 1680, height: 730, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>joint and still NotReady, cert errors in the kubelet log — an identity problem, not a scheduling one</Label>
        </div>

        {/* the successful-looking join earlier in the timeline */}
        <div style={{ position: 'absolute', left: 120, top: 56, width: 1440, opacity: joinIn }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderRadius: 14, border: `2px solid ${PALETTE.good}88`, background: `${PALETTE.good}0a`, padding: '14px 18px' }}>
            <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: PALETTE.good }}>kubeadm join</span>
            <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: PALETTE.good }}>✓ returned success</span>
            <span style={{ flex: 1, fontFamily: MONO, fontSize: 14.5, fontWeight: 700, color: PALETTE.muted }}>
              the join command completed — that alone does not prove the certificate handoff finished
            </span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 120, top: 130, width: 1440 }}>
          <div style={{ borderTop: `1px dashed ${PALETTE.line}`, position: 'relative' }}>
            <span style={{ position: 'absolute', top: -24, left: 20, fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.muted }}>… later, at steady state …</span>
          </div>
        </div>

        {/* node + failed credential attempting to report */}
        <div style={{ position: 'absolute', left: 120, top: 210, width: 1440, display: 'flex', alignItems: 'flex-start', gap: 40 }}>
          <div
            style={{
              width: 300,
              borderRadius: 16,
              border: `2px solid ${PALETTE.amber}`,
              background: `${PALETTE.amber}0a`,
              padding: 18,
              textAlign: 'center',
              opacity: appear(t, 0.24, 0.32),
            }}
          >
            <Label color={PALETTE.amber} size={11}>the node</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900, marginTop: 8 }}>node-3</div>
            <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.amber, marginTop: 10 }}>
              NotReady
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                borderRadius: 12,
                border: `2px solid ${PALETTE.good}66`,
                background: `${PALETTE.good}08`,
                padding: '12px 16px',
                opacity: attempt,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: PALETTE.ink }}>kubelet → update Node status</span>
                <span style={{ color: PALETTE.good, fontSize: 16, fontWeight: 900, opacity: attempt > 0.3 && rejected === 0 ? 1 : 0.4 }}>…</span>
              </div>
            </div>
            <div
              style={{
                borderRadius: 12,
                border: `2px solid ${PALETTE.bad}`,
                background: `${PALETTE.bad}0c`,
                padding: '12px 16px',
                textAlign: 'center',
                opacity: rejected,
                boxShadow: `0 0 24px ${PALETTE.bad}22`,
              }}
            >
              <Label color={PALETTE.bad} size={11}>rejected at authentication</Label>
              <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, marginTop: 6 }}>
                kubelet certificate invalid / unsigned → 401
              </div>
              <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 4 }}>
                cannot update status · cannot renew its lease
              </div>
            </div>
            <div
              style={{
                borderRadius: 12,
                border: `2px solid ${PALETTE.violet}66`,
                background: `${PALETTE.violet}06`,
                padding: '12px 16px',
                textAlign: 'center',
                opacity: stale,
              }}
            >
              <Label color={PALETTE.violet} size={11}>result</Label>
              <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: PALETTE.ink, marginTop: 6 }}>
                Node object stays stale — last heartbeat ages out, condition goes stale
              </div>
            </div>
          </div>
        </div>

        {/* the gap tag */}
        <div
          style={{
            position: 'absolute',
            left: 480,
            top: 500,
            width: 720,
            borderRadius: 14,
            border: `2px solid ${PALETTE.amber}`,
            background: `${PALETTE.amber}0a`,
            padding: '14px 18px',
            textAlign: 'center',
            opacity: gapTag,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 900, color: PALETTE.ink, textDecoration: 'line-through', textDecorationThickness: 3 }}>
            “join succeeded, so the certificate handoff worked”
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.amber, marginTop: 8, lineHeight: 1.4 }}>
            the gap: join returned success is not working credentials — only a valid cert lets the kubelet report
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 686, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>identity fails before scheduling is ever asked — look at the credential, not the join exit code</Label>
        </div>
      </div>
    </div>
  );
};
