import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 08 beat 4 — a permission is not a path. A NetworkPolicy object drawn
 * as a permit stamp, never a pipe: the destination-side ingress rule permits
 * the flow, and a separate source-side egress policy must permit it too —
 * policies combine additively. No policy creates a route, so traffic still
 * fails. Then the worse case: a plugin with no NetworkPolicy support — the
 * API stores the object with no enforcement status, and the cluster looks
 * protected while being open.
 * CORRECTION applied: core NetworkPolicy has no enforcement status — no green
 * "enforced" state anywhere.
 */

const STAMP_W = 430;

export const PolicyNotPath: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const podsIn = appear(t, 0.06, 0.14);
  const ingressStamp = seg(t, 0.14, 0.24);
  const egressStamp = seg(t, 0.24, 0.36);
  const stillFails = appear(t, 0.34, 0.42);
  const defaultDeny = appear(t, 0.44, 0.52);
  const worseIn = appear(t, 0.56, 0.64);
  const storedIn = appear(t, 0.64, 0.74);
  const openNote = appear(t, 0.74, 0.82);
  const footer = appear(t, 0.84, 0.92);

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
      <div style={{ width: 1620, height: 750, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>a matching ingress rule permits the flow at the destination — and an isolating egress policy at the source must permit it too</Label>
        </div>

        {/* source and destination pods with the route between them */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 56, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 0, opacity: podsIn }}>
          {/* source side */}
          <div style={{ width: 560, textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                fontFamily: MONO,
                color: PALETTE.ink,
                fontSize: 20,
                fontWeight: 900,
                border: `2px solid ${PALETTE.cyan}`,
                borderRadius: 14,
                background: `${PALETTE.cyan}0d`,
                padding: '12px 20px',
              }}
            >
              source pod
            </div>
          </div>

          {/* the path — broken */}
          <div style={{ width: 460, textAlign: 'center', paddingTop: 40 }}>
            <div style={{ position: 'relative', width: '100%', height: 26 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 11, borderTop: `2px dashed ${PALETTE.bad}` }} />
              <div style={{ position: 'absolute', left: '50%', top: -4, transform: 'translateX(-50%)', fontFamily: MONO, color: PALETTE.bad, fontSize: 30, fontWeight: 900 }}>
                ✕
              </div>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 10, opacity: stillFails }}>
              the route underneath is missing — traffic still fails
            </div>
          </div>

          {/* destination side */}
          <div style={{ width: 560, textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                fontFamily: MONO,
                color: PALETTE.ink,
                fontSize: 20,
                fontWeight: 900,
                border: `2px solid ${PALETTE.cyan}`,
                borderRadius: 14,
                background: `${PALETTE.cyan}0d`,
                padding: '12px 20px',
              }}
            >
              destination pod
            </div>
          </div>
        </div>

        {/* egress stamp over the source */}
        <div style={{ position: 'absolute', left: 60, top: 176, width: STAMP_W, opacity: egressStamp }}>
          <div
            style={{
              transform: 'rotate(-2deg)',
              border: `3px solid ${PALETTE.cyan}`,
              borderRadius: 16,
              background: `${PALETTE.cyan}0e`,
              padding: '18px 22px',
              textAlign: 'center',
              boxShadow: `0 0 26px ${PALETTE.cyan}44`,
            }}
          >
            <Label color={PALETTE.cyan} size={12} style={{ letterSpacing: 0.3 }}>PERMIT — egress · at the source</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 800, marginTop: 10, lineHeight: 1.35 }}>
              an isolating egress policy must allow the flow too — policies combine additively
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8 }}>
              a permission, not a pipe
            </div>
          </div>
        </div>

        {/* ingress stamp over the destination */}
        <div style={{ position: 'absolute', right: 60, top: 176, width: STAMP_W, opacity: ingressStamp }}>
          <div
            style={{
              transform: 'rotate(2deg)',
              border: `3px solid ${PALETTE.cyan}`,
              borderRadius: 16,
              background: `${PALETTE.cyan}0e`,
              padding: '18px 22px',
              textAlign: 'center',
              boxShadow: `0 0 26px ${PALETTE.cyan}44`,
            }}
          >
            <Label color={PALETTE.cyan} size={12} style={{ letterSpacing: 0.3 }}>PERMIT — ingress · at the destination</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 800, marginTop: 10, lineHeight: 1.35 }}>
              a matching ingress rule permits the flow at the destination
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 8 }}>
              no route is created — none at all
            </div>
          </div>
        </div>

        {/* default-deny note */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 356, textAlign: 'center', opacity: defaultDeny }}>
          <Label color={PALETTE.muted} size={12.5}>
            an empty podSelector with no ingress rules = default-deny ingress
          </Label>
        </div>

        {/* the worse case — accepted but ignored */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 400,
            width: 1380,
            borderRadius: 18,
            border: `2px solid ${PALETTE.amber}77`,
            background: `${PALETTE.amber}08`,
            padding: '20px 26px',
            opacity: worseIn,
          }}
        >
          <Label color={PALETTE.amber} size={12.5} style={{ marginBottom: 14 }}>the worse case — an implementation with no NetworkPolicy support</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>API server</div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: MONO,
                  fontSize: 15,
                  fontWeight: 800,
                  color: PALETTE.ink,
                  border: `1px solid ${PALETTE.blue}77`,
                  borderRadius: 10,
                  background: `${PALETTE.blue}0c`,
                  padding: '10px 14px',
                  opacity: storedIn,
                  textAlign: 'left',
                }}
              >
                <div style={{ color: PALETTE.muted, fontSize: 12.5 }}>NetworkPolicy (Accepted)</div>
                <div style={{ color: PALETTE.ink }}>status: — </div>
                <div style={{ color: PALETTE.muted, fontSize: 12.5 }}>no enforcement status — core NetworkPolicy has none</div>
              </div>
            </div>
            <span style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 30, fontWeight: 900 }}>→</span>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>network plugin</div>
              <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 14, fontWeight: 800, marginTop: 8 }}>
                no NetworkPolicy support
              </div>
              <div style={{ display: 'inline-block', fontFamily: MONO, color: PALETTE.bad, fontSize: 15, fontWeight: 900, border: `1px solid ${PALETTE.bad}66`, borderRadius: 10, background: `${PALETTE.bad}0c`, padding: '8px 14px', marginTop: 8 }}>
                nothing enforces it — traffic is open
              </div>
            </div>
            <span style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 30, fontWeight: 900 }}>→</span>
            <div style={{ flex: 1, textAlign: 'center', opacity: openNote }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 900 }}>the cluster</div>
              <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 15, fontWeight: 800, marginTop: 8, lineHeight: 1.4 }}>
                looks protected —{' '}
                <span style={{ color: PALETTE.bad, fontWeight: 900 }}>is open</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 638, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a stored policy is a permission — enforcement is the implementation's job, and an unsupported one stores it silently</Label>
        </div>
      </div>
    </div>
  );
};
