import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 09 beat 5 — one name, end to end. A four-step horizontal journey
 * with the name carried along it. CORRECTION applied: payments.prod.svc
 * .cluster.local has four dots, so with ndots:5 the search list runs FIRST —
 * the expansion is shown happening, then the trailing dot stops it. Each step
 * is tagged with its distinct failure. The journey fills the stage width.
 */

const STEPS = [
  {
    name: 'search expansion',
    title: '4 dots < ndots:5 — the search list runs first',
    sub: 'then a trailing dot stops it: one absolute query leaves',
    failsWhen: 'wrong name or ndots — read resolv.conf',
    color: PALETTE.amber,
  },
  {
    name: 'resolver → endpoint',
    title: 'one absolute query to the configured DNS endpoint',
    sub: 'that endpoint may be the node-local cache',
    failsWhen: 'endpoint unreachable — DNS Service routing',
    color: PALETTE.cyan,
  },
  {
    name: 'CoreDNS kubernetes plugin',
    title: 'answers from watched Service and EndpointSlice state',
    sub: 'no API query per request',
    failsWhen: 'record missing or a stale watch',
    color: PALETTE.violet,
  },
  {
    name: 'reply travels back',
    title: 'back over the node network path to the Pod',
    sub: 'the same path module 08 taught',
    failsWhen: 'packets dropped — route · MTU · policy',
    color: PALETTE.good,
  },
];

const CARD_W = 372;
const GAP = 24;

export const ResolveTrace: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const nameIn = appear(t, 0.05, 0.12);
  const expand = seg(t, 0.1, 0.22);
  const dotStop = seg(t, 0.2, 0.3);
  const stepOn = STEPS.map((_, i) => appear(t, 0.16 + i * 0.11, 0.24 + i * 0.11));
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
      <div style={{ width: 1620, height: 680, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>payments.prod.svc.cluster.local — it looks complete, but with ndots:5 the search list runs first</Label>
        </div>

        {/* the name banner */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 46, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, opacity: nameIn }}>
          <span
            style={{
              fontFamily: MONO,
              color: PALETTE.ink,
              fontSize: 26,
              fontWeight: 900,
              border: `2px solid ${PALETTE.blue}`,
              borderRadius: 14,
              background: `${PALETTE.blue}0c`,
              padding: '12px 22px',
            }}
          >
            payments.prod.svc.cluster.local<span style={{ color: PALETTE.amber }}>{dotStop > 0.5 ? '.' : ''}</span>
          </span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: MONO, color: expand > 0.5 ? PALETTE.amber : PALETTE.muted, fontSize: 14, fontWeight: 800, opacity: expand > 0.5 ? 1 : 0.5 }}>
                {'4 dots < ndots:5 → search list runs first'}
              </span>
              {expand > 0.1 && dotStop < 0.5 && (
                <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 14, fontWeight: 900 }}>… NXDOMAIN ×3</span>
              )}
            </div>
            <div style={{ fontFamily: MONO, color: dotStop > 0.5 ? PALETTE.good : PALETTE.muted, fontSize: 14, fontWeight: 800, marginTop: 4, opacity: dotStop > 0.5 ? 1 : 0.4 }}>
              {dotStop > 0.5 ? '✓ append a trailing dot — the search list stops, one absolute query' : 'append a trailing dot — expansion stops'}
            </div>
          </div>
        </div>

        {/* the four steps — in flow, arrows between them */}
        <div style={{ position: 'absolute', left: 40, top: 196, width: 1580, display: 'flex', gap: 10, alignItems: 'stretch' }}>
          {STEPS.map((s, i) => {
            const on = stepOn[i];
            return (
              <React.Fragment key={s.name}>
                {i > 0 && (
                  <span
                    style={{
                      alignSelf: 'center',
                      flex: '0 0 20px',
                      textAlign: 'center',
                      fontSize: 26,
                      fontWeight: 900,
                      color: stepOn[i] > 0.5 ? PALETTE.line : PALETTE.line,
                      opacity: Math.max(0.3, stepOn[i]),
                    }}
                  >
                    →
                  </span>
                )}
                <div
                  style={{
                    flex: 1,
                    minHeight: 300,
                    borderRadius: 18,
                    border: `2px solid ${on > 0.5 ? s.color : PALETTE.line}`,
                    background: on > 0.5 ? `${s.color}0d` : PALETTE.panel,
                    boxShadow: on > 0.5 ? `0 0 24px ${s.color}33` : 'none',
                    padding: '18px 20px',
                    opacity: Math.max(0.3, on),
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: MONO, color: s.color, fontSize: 17, fontWeight: 900 }}>{s.name}</span>
                    <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 800 }}>{i + 1}</span>
                  </div>
                  <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 16.5, fontWeight: 900, marginTop: 16, lineHeight: 1.35 }}>
                    {s.title}
                  </div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
                    {s.sub}
                  </div>
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 14,
                      fontFamily: MONO,
                      fontSize: 13.5,
                      fontWeight: 800,
                      color: PALETTE.bad,
                      lineHeight: 1.35,
                    }}
                  >
                    <Label color={PALETTE.bad} size={9.5} style={{ marginBottom: 4 }}>fails when</Label>
                    {s.failsWhen}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 570, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>four steps, four distinct failure points — name the step and you have named the log to open</Label>
        </div>
      </div>
    </div>
  );
};
