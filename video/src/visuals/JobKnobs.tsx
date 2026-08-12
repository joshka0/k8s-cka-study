import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 26 beat 5 — independent knobs. A Job’s result protocol is several
 * independent settings, not one. Each knob answers its own question and acts
 * alone — changing one leaves the others untouched. Treating them as one retry
 * setting is the mistake.
 */

const KNOBS = [
  {
    name: 'indexed completion',
    question: 'does each unit of work have a stable index?',
    color: PALETTE.blue,
  },
  {
    name: 'backoffLimitPerIndex',
    question: 'how many retries does each index get, separately?',
    color: PALETTE.cyan,
  },
  {
    name: 'podFailurePolicy',
    question: 'which outcomes are permanent, so never retried?',
    color: PALETTE.violet,
  },
  {
    name: 'successPolicy',
    question: 'can success be declared before every index finishes?',
    color: PALETTE.good,
  },
  {
    name: 'activeDeadlineSeconds',
    question: 'a total cap on active time, regardless of the rest?',
    color: PALETTE.amber,
  },
];

export const JobKnobs: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const jobIn = appear(t, 0.06, 0.12);
  const knobOn = KNOBS.map((_, i) => appear(t, 0.14 + i * 0.09, 0.21 + i * 0.09));
  const footnote = appear(t, 0.6, 0.7);
  const independence = appear(t, 0.74, 0.82);
  const footer = appear(t, 0.9, 0.96);

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
      <div style={{ width: 1680, height: 760, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>a Job’s result protocol is several independent settings, not one retry knob</Label>
        </div>

        {/* the job object */}
        <div style={{ position: 'absolute', left: 120, top: 44, width: 980, borderRadius: 18, border: `2px solid ${PALETTE.blue}66`, background: `${PALETTE.blue}06`, padding: '18px 22px', opacity: jobIn }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Label color={PALETTE.blueInk} size={11.5}>Job · one result protocol, many dials</Label>
            <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.muted }}>restartPolicy: Never (required)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ flex: '0 0 230px' }}>
              <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.muted, marginTop: 26 }}>each dial answers its own question →</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {KNOBS.map((k, i) => (
                <div
                  key={k.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    borderRadius: 10,
                    border: `1px solid ${k.color}55`,
                    background: `${k.color}06`,
                    padding: '10px 14px',
                    opacity: knobOn[i],
                    transform: `translateX(${(1 - knobOn[i]) * -12}px)`,
                  }}
                >
                  <span
                    style={{
                      flex: '0 0 auto',
                      fontFamily: MONO,
                      fontSize: 15,
                      fontWeight: 900,
                      color: k.color,
                      border: `1px solid ${k.color}`,
                      borderRadius: 999,
                      width: 34,
                      height: 34,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: knobOn[i],  // little "dial" indicator
                    }}
                  >
                    {knobOn[i] > 0.5 ? '✳' : '·'}
                  </span>
                  <div style={{ flex: '0 0 260px' }}>
                    <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.ink }}>{k.name}</div>
                  </div>
                  <div style={{ flex: 1, fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, lineHeight: 1.35 }}>{k.question}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* independence note */}
        <div style={{ position: 'absolute', left: 1140, top: 60, width: 460, opacity: independence }}>
          <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.amber, lineHeight: 1.5 }}>
            each acts independently — changing one leaves the others untouched
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.muted, marginTop: 10, lineHeight: 1.5 }}>
            treating them as a single retry setting is the mistake
          </div>
        </div>

        <div style={{ position: 'absolute', left: 1140, top: 230, width: 460, opacity: footnote }}>
          <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, lineHeight: 1.5 }}>
            per-index backoff and failure classification need restartPolicy: Never on the template
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>five dials, one Job — read each against its own question</Label>
        </div>
      </div>
    </div>
  );
};
