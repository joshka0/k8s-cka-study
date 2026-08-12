import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 26 beat 3 — OOMKilled, and still the same Pod. A container is OOM
 * killed and comes back with the same Pod UID: restarted by the kubelet, no
 * controller involved. The Deployment above is visibly untouched — no new
 * ReplicaSet, no new Pod, no event. The absence upstream is the point.
 */

export const OomkilledWho: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const deployIn = appear(t, 0.06, 0.12);
  const oom = seg(t, 0.2, 0.32);
  const restart = seg(t, 0.42, 0.54);
  const absence = appear(t, 0.62, 0.72);
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
          <Label color={PALETTE.cyan} size={13}>OOMKilled, and the Pod comes back with the same UID — restarted by the kubelet, no controller involved</Label>
        </div>

        {/* the deployment above — untouched */}
        <div style={{ position: 'absolute', left: 160, top: 48, width: 680, opacity: deployIn }}>
          <Box pad={16} borderColor={PALETTE.blue} style={{ textAlign: 'center' }}>
            <Label color={PALETTE.blueInk} size={11.5} style={{ marginBottom: 10 }}>the Deployment — visibly untouched</Label>
            <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.ink }}>
              no new ReplicaSet · no new Pod · no event
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: PALETTE.muted, marginTop: 6 }}>
              nothing at that level ever happened
            </div>
          </Box>
        </div>

        {/* the absence marker */}
        <div style={{ position: 'absolute', left: 870, top: 70, width: 620, opacity: absence }}>
          <div style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.bad, textAlign: 'center', border: `2px dashed ${PALETTE.bad}66`, borderRadius: 12, padding: '12px 16px' }}>
            ✕ looking here for an explanation finds nothing — the absence is the answer
          </div>
        </div>

        <div style={{ position: 'absolute', left: 500, top: 200, color: PALETTE.line, fontSize: 22, fontWeight: 900, opacity: deployIn }}>
          ↓ <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.muted }}>no event travels upward</span>
        </div>

        {/* the pod with the oom */}
        <div style={{ position: 'absolute', left: 160, top: 250, width: 1360 }}>
          <Box pad={16} borderColor={PALETTE.violet} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Label color={PALETTE.violet} size={11.5}>the Pod — same UID across the restart</Label>
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: PALETTE.muted }}>uid: a3f2-…-91de (unchanged)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 18 }}>
              <div style={{ flex: 1, fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.ink }}>
                container → <span style={{ color: PALETTE.bad, opacity: oom > 0 ? 1 : 0.4 }}>OOMKilled</span>
              </div>
              <span style={{ color: PALETTE.line, fontSize: 20, fontWeight: 900 }}>→</span>
              <div style={{ flex: 1, fontFamily: MONO, fontSize: 15.5, fontWeight: 900, color: PALETTE.violet }}>
                kubelet restarts the container <span style={{ color: PALETTE.violet, opacity: restart }}>· restartCount++</span>
              </div>
            </div>
          </Box>
        </div>

        <div style={{ position: 'absolute', left: 160, top: 460, width: 1360, opacity: restart }}>
          <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 800, color: PALETTE.amber, lineHeight: 1.5 }}>
            the Pod object never changed — so the Deployment, the ReplicaSet and the controller were all uninvolved by definition
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>same UID means the owner was the kubelet — the absence upstream is the evidence</Label>
        </div>
      </div>
    </div>
  );
};
