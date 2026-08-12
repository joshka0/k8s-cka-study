import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 06 beat 5 — requests are the currency. One node drawn twice, same
 * width: left is what the scheduler sees (request blocks nearly filling
 * allocatable, a new Pod bounced off), right is what the dashboard sees (the
 * same Pods at real usage, the node ~15% full). Both pictures stay on
 * screen together — the contradiction is the point.
 */

const ALLOC = 8;

// Same four Pods on both sides. Requests sum to 7.5/8; usage sums to 1.2/8 (15%).
const PODS = [
  { name: 'pod-a', req: 2.0, usage: 0.3 },
  { name: 'pod-b', req: 2.0, usage: 0.3 },
  { name: 'pod-c', req: 2.0, usage: 0.3 },
  { name: 'pod-d', req: 1.5, usage: 0.3 },
];
const REQ_TOTAL = PODS.reduce((s, p) => s + p.req, 0);
const NEW_POD_REQ = 1.0;

const COL_H = 560;
const COL_W = 296;

export const RequestsVsUsage: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const in1 = appear(t, 0.05, 0.16);
  // New Pod falls toward the column, bounces off, and hovers there, refused.
  const dropU = seg(t, 0.26, 0.4);
  const bounceU = seg(t, 0.4, 0.62);
  const chipTop = dropU < 1 ? 10 + 52 * dropU : 62 - Math.sin(bounceU * Math.PI) * 52;
  const chipIn = appear(t, 0.24, 0.26);
  const refusedMsg = appear(t, 0.44, 0.5);
  const footer = appear(t, 0.55, 0.65);

  const reqBlockH = (req: number) => Math.round((req / ALLOC) * (COL_H - 60) * 0.92);
  const usageBlockH = (usage: number) => Math.max(18, Math.round((usage / ALLOC) * (COL_H - 60)));

  return (
    <div style={{ position: 'absolute', inset: 0, paddingTop: 20 }}>
      <div style={{ textAlign: 'center', opacity: in1, marginBottom: 22 }}>
        <Label color={PALETTE.cyan} size={13}>requests are the currency — the scheduler never looks at usage</Label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 56, opacity: in1 }}>
        {/* left — what the scheduler sees */}
        <div style={{ width: 760, textAlign: 'center' }}>
          <div style={{ marginBottom: 10 }}>
            <Label color={PALETTE.blueInk} size={12}>what the scheduler sees</Label>
          </div>
          <div style={{ position: 'relative', width: COL_W, margin: '0 auto' }}>
            {/* chip lane above the column — the bounced-off new Pod */}
            <div style={{ position: 'relative', height: 110 }}>
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: `translateX(-50%) translateY(${chipTop}px)`,
                  top: 0,
                  zIndex: 3,
                  opacity: chipIn,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    color: PALETTE.ink,
                    background: `${PALETTE.bad}22`,
                    border: `2px solid ${PALETTE.bad}`,
                    borderRadius: 10,
                    padding: '7px 14px',
                    fontSize: 16,
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    boxShadow: `0 0 18px ${PALETTE.bad}44`,
                  }}
                >
                  new Pod · {NEW_POD_REQ} CPU
                </div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: 74,
                  opacity: refusedMsg,
                }}
              >
                <span style={{ fontFamily: MONO, color: PALETTE.bad, fontSize: 16, fontWeight: 900, whiteSpace: 'nowrap' }}>
                  ✕ cannot schedule — {REQ_TOTAL.toFixed(1)}/{ALLOC} requested, needs {REQ_TOTAL + NEW_POD_REQ}
                </span>
              </div>
            </div>

            <NodeColumn
              label="allocatable"
              blocks={PODS.map((p) => ({
                h: reqBlockH(p.req),
                text: `${p.name} · req ${p.req.toFixed(1)}`,
                color: PALETTE.blue,
              }))}
              fillNote={`${((REQ_TOTAL / ALLOC) * 100).toFixed(0)}% of allocatable claimed`}
              emptyLabel={null}
            />
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.blue, fontSize: 15, fontWeight: 800, marginTop: 12 }}>
            fills on declared requests
          </div>
        </div>

        {/* right — what the dashboard sees */}
        <div style={{ width: 760, textAlign: 'center' }}>
          <div style={{ marginBottom: 10 }}>
            <Label color={PALETTE.good} size={12}>what the dashboard sees</Label>
          </div>
          <div style={{ width: COL_W, margin: '0 auto' }}>
            {/* same lane height as the left panel, so the two columns align */}
            <div style={{ height: 110 }} />
            <NodeColumn
              label="allocatable"
              blocks={PODS.map((p) => ({
                h: usageBlockH(p.usage),
                text: `${p.name} · using ${p.usage.toFixed(1)}`,
                color: PALETTE.good,
              }))}
              fillNote="the same Pods, drawn at real usage"
              emptyLabel={(
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 34, fontWeight: 900 }}>
                    ~15% full
                  </div>
                  <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, marginTop: 4, fontWeight: 700 }}>
                    the node is almost empty
                  </div>
                </div>
              )}
            />
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 15, fontWeight: 800, marginTop: 12 }}>
            measures what the Pods actually consume
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>the idle dashboard and the insufficient-cpu scheduler are both correct — they are measuring different things</Label>
      </div>
    </div>
  );
};

function NodeColumn({
  label,
  blocks,
  fillNote,
  emptyLabel,
}: {
  label: string;
  blocks: { h: number; text: string; color: string }[];
  fillNote: string;
  emptyLabel: React.ReactNode;
}) {
  const innerH = COL_H - 60;
  const used = blocks.reduce((s, b) => s + b.h, 0) + (blocks.length - 1) * 6;
  return (
    <div
      style={{
        width: COL_W,
        height: COL_H,
        borderRadius: 16,
        border: `2px solid ${PALETTE.line}`,
        background: PALETTE.panel,
        padding: 12,
        position: 'relative',
      }}
    >
      {/* allocatable cap */}
      <div
        style={{
          fontFamily: MONO,
          color: PALETTE.muted,
          fontSize: 13,
          fontWeight: 800,
          textAlign: 'center',
          borderBottom: `1px solid ${PALETTE.line}`,
          paddingBottom: 6,
          marginBottom: 10,
        }}
      >
        {label} · {ALLOC} CPU
      </div>

      {/* stack of blocks */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 6,
          height: innerH,
          position: 'relative',
        }}
      >
        {blocks.map((b, i) => (
          <div
            key={i}
            style={{
              height: b.h,
              borderRadius: 8,
              background: `${b.color}2b`,
              border: `1px solid ${b.color}66`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontFamily: MONO, color: b.color, fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap' }}>
              {b.text}
            </span>
          </div>
        ))}
        {/* the empty remainder */}
        {used < innerH && emptyLabel !== null ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {emptyLabel}
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 12, fontWeight: 700 }}>{fillNote}</span>
          </div>
        )}
      </div>
    </div>
  );
}
