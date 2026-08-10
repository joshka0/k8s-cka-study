import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 10 beat 2 — immediate versus WaitForFirstConsumer. Two zones with
 * different spare capacity. Immediate binding creates the volume in zone A,
 * then the Pod cannot schedule there — a volume and a Pod in different
 * places, both valid, together useless. WaitForFirstConsumer makes the claim
 * visibly wait, schedules the Pod to zone B, and only then creates the volume
 * there. The waiting state is labelled designed, not failed.
 */

export const WaitForFirstConsumer: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const immediateIn = appear(t, 0.08, 0.18);
  const immVolume = seg(t, 0.14, 0.26);
  const immStuck = seg(t, 0.24, 0.38);
  const divider = appear(t, 0.4, 0.46);
  const wffcIn = appear(t, 0.46, 0.56);
  const wffcWait = seg(t, 0.5, 0.62);
  const wffcSched = seg(t, 0.58, 0.7);
  const wffcVolume = seg(t, 0.66, 0.78);
  const footer = appear(t, 0.86, 0.94);

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
      <div style={{ width: 1620, height: 720, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>when, not whether, the volume is created — the binding mode decides</Label>
        </div>

        {/* IMMEDIATE */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 56,
            width: 1500,
            borderRadius: 16,
            border: `1px solid ${PALETTE.bad}44`,
            background: `${PALETTE.bad}03`,
            padding: '14px 20px 16px',
            opacity: immediateIn,
          }}
        >
          <Label color={PALETTE.bad} size={12} style={{ marginBottom: 10 }}>Immediate — bind now, sort out placement later</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 190, fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900, border: `1px solid ${PALETTE.line}`, borderRadius: 12, background: '#0d1522', padding: '12px 14px', textAlign: 'center' }}>
              PVC
            </div>
            <span style={{ color: PALETTE.line, fontSize: 22, fontWeight: 900 }}>→</span>
            <div style={{ flex: 1, display: 'flex', gap: 12 }}>
              {/* zone A */}
              <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${PALETTE.line}`, padding: 12, position: 'relative' }}>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800 }}>zone-a</div>
                <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>no capacity for the Pod</div>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14.5, fontWeight: 800, marginTop: 10 }}>▣▣▣▣ nodes</div>
                <div
                  style={{
                    position: 'absolute',
                    left: 14,
                    right: 14,
                    bottom: 10,
                    fontFamily: MONO,
                    fontSize: 13.5,
                    fontWeight: 900,
                    color: PALETTE.good,
                    opacity: immVolume,
                    boxShadow: `0 0 16px ${PALETTE.good}44`,
                  }}
                >
                  <div style={{ border: `2px solid ${PALETTE.good}`, borderRadius: 8, background: `${PALETTE.good}0c`, padding: '8px 10px' }}>
                    📦 volume created here
                  </div>
                </div>
              </div>
              {/* zone B */}
              <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${PALETTE.line}`, padding: 12 }}>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800 }}>zone-b</div>
                <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>capacity for the Pod</div>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14.5, fontWeight: 800, marginTop: 10 }}>▣▣▣▣▣ nodes</div>
                <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.muted, marginTop: 8, opacity: immStuck }}>
                  Pod wants zone-a → cannot schedule
                </div>
              </div>
            </div>
            <div
              style={{
                width: 240,
                fontFamily: MONO,
                fontSize: 14.5,
                fontWeight: 900,
                color: PALETTE.bad,
                textAlign: 'center',
                opacity: immStuck,
                background: `${PALETTE.bad}0a`,
                border: `1px solid ${PALETTE.bad}55`,
                borderRadius: 12,
                padding: '12px 10px',
              }}
            >
              Pod Pending — a volume and a Pod in different places, both valid, together useless
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 60, top: 242, width: 1500, textAlign: 'center', color: PALETTE.line, fontSize: 20, fontWeight: 900, opacity: divider }}>
          ▼
        </div>

        {/* WaitForFirstConsumer */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 268,
            width: 1500,
            borderRadius: 16,
            border: `2px solid ${PALETTE.good}55`,
            background: `${PALETTE.good}03`,
            padding: '14px 20px 16px',
            opacity: wffcIn,
          }}
        >
          <Label color={PALETTE.good} size={12} style={{ marginBottom: 10 }}>WaitForFirstConsumer — wait until a Pod asks, then bind where that Pod can run</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 190, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 17, fontWeight: 900, border: `1px solid ${PALETTE.line}`, borderRadius: 12, background: '#0d1522', padding: '12px 14px' }}>
                PVC
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 12.5, fontWeight: 800, marginTop: 8, opacity: wffcWait }}>
                ⏳ waiting for a consumer
              </div>
              <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 11.5, fontWeight: 700, marginTop: 2, opacity: wffcWait }}>
                designed, not failed
              </div>
            </div>
            <span style={{ color: PALETTE.line, fontSize: 22, fontWeight: 900 }}>→</span>
            <div style={{ flex: 1, display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${PALETTE.line}`, padding: 12, position: 'relative' }}>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800 }}>zone-a</div>
                <div style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>no capacity</div>
                <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: PALETTE.muted, marginTop: 10, opacity: wffcSched }}>
                  no Pod lands here
                </div>
              </div>
              <div style={{ flex: 1, borderRadius: 12, border: `2px solid ${PALETTE.good}66`, padding: 12, position: 'relative' }}>
                <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800 }}>zone-b</div>
                <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>capacity</div>
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 14.5, fontWeight: 800, marginTop: 8, opacity: wffcSched }}>
                  ✓ Pod scheduled here
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: 14,
                    right: 14,
                    bottom: 10,
                    fontFamily: MONO,
                    fontSize: 13.5,
                    fontWeight: 900,
                    color: PALETTE.good,
                    opacity: wffcVolume,
                  }}
                >
                  <div style={{ border: `2px solid ${PALETTE.good}`, borderRadius: 8, background: `${PALETTE.good}0c`, padding: '8px 10px' }}>
                    📦 volume created here, for this consumer
                  </div>
                </div>
              </div>
            </div>
            <div style={{ width: 240, fontFamily: MONO, fontSize: 13.5, fontWeight: 800, color: PALETTE.good, textAlign: 'center', opacity: wffcVolume }}>
              a volume where the Pod can actually run
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>a Pending claim is not automatically a failure — check the binding mode before assuming a fault</Label>
        </div>
      </div>
    </div>
  );
};
