import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 24 beat 5 — accepted is not applied. Desired and actuated resources
 * are two distinct fields on one Pod, updated at different times by different
 * actors. The accepted patch lands immediately; the applied value lags. In a
 * deferred outcome it never catches up. An accepted patch is not proof the
 * cgroup changed.
 */

const DESIRED = 'desired (spec.containers[].resources) → updated by the API at patch time';
const APPLIED = 'applied (status.containerStatuses[].resources) → updated by the kubelet when it actuates';

export const ResizeDesiredApplied: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const podIn = appear(t, 0.06, 0.12);
  const accepted = seg(t, 0.2, 0.3);
  const applied = seg(t, 0.36, 0.5);
  const deferred = seg(t, 0.6, 0.72);
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
          <Label color={PALETTE.cyan} size={13}>accepted is not applied — two fields on one Pod, updated at different times by different actors</Label>
        </div>

        {/* the pod with two fields */}
        <div style={{ position: 'absolute', left: 130, top: 52, borderRadius: 16, border: `2px solid ${PALETTE.blue}66`, background: `${PALETTE.blue}06`, padding: '18px 22px', width: 500, opacity: podIn }}>
          <Label color={PALETTE.blueInk} size={11} style={{ marginBottom: 12 }}>the Pod object</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ borderRadius: 10, border: `1px solid ${PALETTE.good}55`, background: '#0d1522', padding: '12px 14px' }}>
              <Label color={PALETTE.good} size={10.5}>spec · the desired value</Label>
              <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, marginTop: 4 }}>{DESIRED}</div>
            </div>
            <div style={{ borderRadius: 10, border: `1px solid ${PALETTE.amber}55`, background: '#0d1522', padding: '12px 14px' }}>
              <Label color={PALETTE.amber} size={10.5}>status · the applied value</Label>
              <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.ink, marginTop: 4 }}>{APPLIED}</div>
            </div>
          </div>
        </div>

        {/* the timeline of the two updates */}
        <div style={{ position: 'absolute', left: 700, top: 44, width: 850 }}>
          <Label color={PALETTE.muted} size={11.5} style={{ marginBottom: 12 }}>the timeline of a live resize</Label>

          {/* accepted patch, immediate */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, opacity: accepted }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: PALETTE.good, flex: '0 0 auto' }} />
            <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${PALETTE.good}66`, background: `${PALETTE.good}08`, padding: '12px 16px' }}>
              <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.good }}>patch accepted — lands immediately (t₀)</div>
              <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 3 }}>
                the API stores the desired value at once
              </div>
            </div>
          </div>

          {/* applied lags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, opacity: applied }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: PALETTE.amber, flex: '0 0 auto' }} />
            <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${PALETTE.amber}66`, background: `${PALETTE.amber}08`, padding: '12px 16px' }}>
              <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.amber }}>applied lags — the kubelet actuates later (t₁)</div>
              <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 3 }}>
                Pod status reports what was actually allocated — the cgroup changes only when the kubelet applies it
              </div>
            </div>
          </div>

          {/* deferred */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: deferred }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: PALETTE.bad, flex: '0 0 auto' }} />
            <div style={{ flex: 1, borderRadius: 12, border: `2px solid ${PALETTE.bad}66`, background: `${PALETTE.bad}06`, padding: '12px 16px', boxShadow: deferred > 0.5 ? `0 0 20px ${PALETTE.bad}1a` : 'none' }}>
              <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.bad }}>deferred — applied never catches up</div>
              <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: PALETTE.muted, marginTop: 3 }}>
                policy or node state means the cgroup never changes — desired says new, status says old
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: appear(t, 0.66, 0.74) }}>
          <Label color={PALETTE.amber} size={13}>an accepted patch stores your desired value — it does not prove the cgroup changed</Label>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 686, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>read the applied status and the resize condition, not just the 200 OK</Label>
        </div>
      </div>
    </div>
  );
};
