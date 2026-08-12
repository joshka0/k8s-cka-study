import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 24 beat 1 — one object, or the whole namespace. A single Pod passes
 * through a LimitRange that fills in and bounds its fields, then the
 * namespace total is checked against a ResourceQuota. Two stages, two scales:
 * shaping versus budgeting.
 */

export const LimitRangeVsQuota: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const podIn = appear(t, 0.06, 0.12);
  const shape = seg(t, 0.16, 0.34);
  const quotaIn = seg(t, 0.42, 0.58);
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
      <div style={{ width: 1680, height: 740, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: appear(t, 0.02, 0.08) }}>
          <Label color={PALETTE.cyan} size={13}>one shapes what you submitted · the other decides whether there is room for it</Label>
        </div>

        {/* the pod */}
        <div style={{ position: 'absolute', left: 200, top: 54, opacity: podIn }}>
          <Box pad={14} borderColor={PALETTE.cyan} style={{ width: 240, textAlign: 'center' }}>
            <Label color={PALETTE.cyan} size={11}>a Pod is submitted</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 800, marginTop: 6 }}>no requests · no limits</div>
          </Box>
        </div>

        {/* stage one: limitrange shapes it */}
        <div style={{ position: 'absolute', left: 480, top: 44, width: 560, opacity: shape > 0 ? 1 : 0.4 }}>
          <Box pad={14} borderColor={PALETTE.amber} style={{ textAlign: 'center' }}>
            <Label color={PALETTE.amber} size={11}>stage one · LimitRange — shaping</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, marginTop: 10 }}>
              fills in and bounds this Pod’s fields
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.muted, marginTop: 8, textAlign: 'left', lineHeight: 1.6 }}>
              {shape > 0.3 && <>+ default request: 100m / 64Mi</>}{shape > 0.5 && <><br/>+ default limit: 200m / 128Mi</>}{shape > 0.7 && <><br/>+ max container compute</>}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.amber, marginTop: 10 }}>
              edits what you submitted — one object at a time
            </div>
          </Box>
        </div>

        <div style={{ position: 'absolute', left: 1060, top: 150, color: PALETTE.good, fontSize: 28, fontWeight: 900, opacity: quotaIn > 0 ? quotaIn : 0 }}>
          →
        </div>

        {/* stage two: quota budgets the namespace */}
        <div style={{ position: 'absolute', left: 1120, top: 44, width: 460, opacity: quotaIn > 0 ? quotaIn : 0.4 }}>
          <Box pad={14} borderColor={PALETTE.good} style={{ textAlign: 'center' }}>
            <Label color={PALETTE.good} size={11}>stage two · ResourceQuota — budgeting</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 15, fontWeight: 900, marginTop: 10 }}>
              checks the namespace total
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.muted, marginTop: 8, textAlign: 'left', lineHeight: 1.6 }}>
              {quotaIn > 0.3 && <>aggregate requests across the namespace</>}{quotaIn > 0.6 && <><br/>object counts · total consumption</>}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.good, marginTop: 10 }}>
              decides whether there is room — the whole namespace
            </div>
          </Box>
        </div>

        {/* the distinction */}
        <div style={{ position: 'absolute', left: 200, top: 330, width: 1380, display: 'flex', gap: 24, opacity: appear(t, 0.5, 0.6) }}>
          <div style={{ flex: 1, borderRadius: 14, border: `2px solid ${PALETTE.amber}66`, background: `${PALETTE.amber}06`, padding: '14px 18px' }}>
            <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.amber }}>LimitRange · single object</div>
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.muted, marginTop: 6, lineHeight: 1.4 }}>defaults and bounds container/Pod compute, and PVC storage requests</div>
          </div>
          <div style={{ flex: 1, borderRadius: 14, border: `2px solid ${PALETTE.good}66`, background: `${PALETTE.good}06`, padding: '14px 18px' }}>
            <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.good }}>ResourceQuota · the namespace</div>
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: PALETTE.muted, marginTop: 6, lineHeight: 1.4 }}>caps total consumption and object counts</div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 656, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>one edits what you submitted, the other decides there is room — shaping, then budgeting</Label>
        </div>
      </div>
    </div>
  );
};
