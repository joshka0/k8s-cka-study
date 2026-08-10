import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 08 beat 6 — past the O(1) slogan. Opens on the two-row naive
 * comparison ("IPVS is O(1), iptables is O(N)"), then expands it into the
 * multi-axis table the slogan omits: lookup cost, rule update cost under
 * churn, locality, kernel support, Service semantics. The naive comparison
 * shrinks into one column of the wider table, and the added axes carry the
 * beat. Cell values stay honest: only what the narration supports is filled
 * in, the rest read as "compare here" — the axes are the correction.
 */

const ROWS = ['iptables', 'IPVS', 'nftables', 'eBPF'];

// Column header → cell hints. Lookup carries the narration's two facts; the
// other axes are the comparison surface itself.
const AXES: { label: string; cells: string[] }[] = [
  { label: 'lookup cost', cells: ['O(N) · rules scanned', 'O(1) · hash table', '— compare here', '— compare here'] },
  { label: 'rule update cost under churn', cells: ['— compare here', '— compare here', '— compare here', '— compare here'] },
  { label: 'locality', cells: ['— compare here', '— compare here', '— compare here', '— compare here'] },
  { label: 'kernel support', cells: ['— compare here', 'deprecated in 1.35 · warns at startup in 1.36', 'recommended Linux replacement', '— compare here'] },
  { label: 'semantics', cells: ['— compare here', '— compare here', '— compare here', '— compare here'] },
];

const COL_W = 252;
const IMPL_W = 230;

export const BeyondBigO: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const slogan = appear(t, 0.06, 0.16);
  const verdict = appear(t, 0.18, 0.26);
  const tableIn = appear(t, 0.3, 0.42);
  const axisIn = AXES.map((_, i) => appear(t, 0.34 + i * 0.06, 0.42 + i * 0.06));
  const sloganMark = seg(t, 0.42, 0.5);
  const callout = appear(t, 0.72, 0.8);
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
      <div style={{ width: 1620, height: 730, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>“IPVS is order one, iptables is order N” — the slogan is right about lookup and incomplete as a recommendation</Label>
        </div>

        {/* phase 1 — the naive two-row comparison */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 48,
            display: 'flex',
            justifyContent: 'center',
            gap: 60,
            opacity: slogan,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 26, fontWeight: 900, border: `2px solid ${PALETTE.violet}`, borderRadius: 14, background: `${PALETTE.violet}10`, padding: '16px 28px' }}>
              iptables — O(N)
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 6 }}>rules scanned in order</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 26, fontWeight: 900, border: `2px solid ${PALETTE.good}`, borderRadius: 14, background: `${PALETTE.good}10`, padding: '16px 28px' }}>
              IPVS — O(1)
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 6 }}>hash lookup</div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: verdict }}>
          <Label color={PALETTE.amber} size={12.5}>that is one axis of the decision — lookup — and the slogan stops there</Label>
        </div>

        {/* phase 2 — the expanded table */}
        <div
          style={{
            position: 'absolute',
            left: 30,
            top: 194,
            width: 1560,
            borderRadius: 18,
            border: `2px solid ${PALETTE.line}`,
            background: `${PALETTE.panel}55`,
            padding: '16px 18px',
            opacity: tableIn,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14 }}>
            <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 800, width: IMPL_W }}>implementation</span>
            {AXES.map((a, i) => (
              <div key={a.label} style={{ width: COL_W, opacity: axisIn[i] }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 14.5,
                    fontWeight: 900,
                    color: i === 0 ? PALETTE.amber : PALETTE.cyan,
                    lineHeight: 1.25,
                  }}
                >
                  {a.label}
                </div>
              </div>
            ))}
          </div>

          {ROWS.map((r, ri) => (
            <div key={r} style={{ display: 'flex', alignItems: 'stretch', gap: 18, marginBottom: 10 }}>
              <div
                style={{
                  width: IMPL_W,
                  fontFamily: MONO,
                  fontSize: 18,
                  fontWeight: 900,
                  color: PALETTE.ink,
                  border: `1px solid ${ri === 1 ? PALETTE.good : PALETTE.line}`,
                  borderRadius: 10,
                  background: ri === 1 ? `${PALETTE.good}0c` : '#0d1522',
                  padding: '11px 14px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {r}
              </div>
              {AXES.map((a, ci) => {
                const cell = a.cells[ri];
                const isLookup = ci === 0;
                const filled = !cell.startsWith('—');
                return (
                  <div
                    key={a.label}
                    style={{
                      width: COL_W,
                      fontFamily: MONO,
                      fontSize: filled ? 13 : 13,
                      fontWeight: filled ? 800 : 700,
                      color: filled && ri === 1 ? PALETTE.good : filled ? PALETTE.ink : PALETTE.muted,
                      border: `1px solid ${isLookup ? PALETTE.amber : PALETTE.line}`,
                      borderRadius: 10,
                      background: isLookup ? `${PALETTE.amber}08` : '#0a1019',
                      padding: '11px 14px',
                      lineHeight: 1.3,
                      display: 'flex',
                      alignItems: 'center',
                      opacity: axisIn[ci],
                    }}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>
          ))}

          {/* the slogan's one column is the first column of the table */}
          {sloganMark > 0 && (
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: IMPL_W }} />
              <div style={{ width: COL_W, fontFamily: MONO, fontSize: 13, fontWeight: 900, color: PALETTE.amber }}>
                ▸ the naive comparison — one column of the decision
              </div>
              <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: PALETTE.muted }}>
                the axes the slogan omits are the correction
              </span>
            </div>
          )}
        </div>

        {/* the deprecation callout */}
        <div
          style={{
            position: 'absolute',
            left: 30,
            top: 600,
            width: 1560,
            borderRadius: 14,
            border: `1px solid ${PALETTE.good}66`,
            background: `${PALETTE.good}08`,
            padding: '12px 20px',
            textAlign: 'center',
            opacity: callout,
          }}
        >
          <span style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 800 }}>
            kube-proxy's IPVS mode: <span style={{ color: PALETTE.amber }}>deprecated in 1.35</span> · still runs in 1.36 with a startup warning ·{' '}
            <span style={{ color: PALETTE.good }}>nftables is the recommended Linux replacement</span>
          </span>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 668, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>compare on all five axes — a data plane choice that ends at O(1) has skipped the axes that actually differ</Label>
        </div>
      </div>
    </div>
  );
};
