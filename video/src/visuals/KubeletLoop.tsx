import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Label, MONO, SANS } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Module 07 beat 1 — a loop, not an inbox. Nobody tells the kubelet to start
 * a Pod. The push model (scheduler → kubelet) is drawn first and struck
 * through; the pull is a watch line up to the API. Six spokes out to the
 * things the kubelet coordinates — runtime, network, storage, secrets,
 * probes, status — drawn as legible labels on one bus below the node.
 */

const SPOKES = [
  { label: 'runtime', sub: 'runs the containers', color: PALETTE.amber },
  { label: 'network', sub: 'attaches the sandbox', color: PALETTE.cyan },
  { label: 'storage', sub: 'mounts the volumes', color: PALETTE.good },
  { label: 'secrets', sub: 'delivers them in', color: PALETTE.blue },
  { label: 'probes', sub: 'startup · liveness · readiness', color: PALETTE.cyan },
  { label: 'status', sub: 'reports back to the API', color: PALETTE.violet },
];

// Geometry of the inner stage (1640×700, centred by the shared stage rule).
const BUS_Y = 540;
const CHIP_TOP = 556;
const CHIP_W = 200;
const CHIP_H = 88;
const CHIP_GAP = 24;
const SPOKE_X0 = 170;
const KUBE_CX = 940;

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

export const KubeletLoop: React.FC<VisualProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const scene = appear(t, 0.05, 0.13);
  const push = appear(t, 0.15, 0.23);
  const strike = appear(t, 0.23, 0.3);
  const pushLabel = appear(t, 0.26, 0.34);
  const watch = appear(t, 0.32, 0.42);
  const kubeBox = appear(t, 0.36, 0.46);
  const spokes = SPOKES.map((_, i) => appear(t, 0.47 + i * 0.05, 0.53 + i * 0.05));
  const footer = appear(t, 0.86, 0.93);

  const watchPulse = 0.4 + 0.6 * Math.abs(Math.sin(frame / 14));
  const ringPulse = 0.5 + 0.5 * Math.abs(Math.sin(frame / 9));

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
      <div style={{ width: 1640, height: 700, position: 'relative' }}>
        {/* header */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>a loop, not an inbox — nobody tells the kubelet to start a Pod</Label>
        </div>

        {/* control plane band */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 40,
            width: 1520,
            height: 150,
            border: `2px solid ${PALETTE.blue}55`,
            borderRadius: 22,
            background: `${PALETTE.blue}0a`,
            opacity: scene,
          }}
        >
          <Label color={PALETTE.blueInk} size={12} style={{ position: 'absolute', left: 20, top: 12 }}>control plane</Label>
        </div>

        {/* scheduler — the imagined dispatch source */}
        <div
          style={{
            position: 'absolute',
            left: 90,
            top: 90,
            width: 240,
            height: 90,
            border: `2px solid ${PALETTE.blue}`,
            borderRadius: 16,
            background: `${PALETTE.blue}14`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: scene,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>scheduler</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>writes a name, then stops</div>
        </div>

        {/* API server */}
        <div
          style={{
            position: 'absolute',
            left: 790,
            top: 90,
            width: 300,
            height: 90,
            border: `2px solid ${PALETTE.blue}`,
            borderRadius: 16,
            background: `${PALETTE.blue}14`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: scene,
          }}
        >
          <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>API server</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700, marginTop: 4 }}>holds the Pod objects</div>
        </div>

        {/* node band */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 300,
            width: 1520,
            height: 350,
            border: `2px solid ${PALETTE.violet}55`,
            borderRadius: 22,
            background: `${PALETTE.violet}0a`,
            opacity: scene,
          }}
        >
          <Label color={PALETTE.violet} size={12} style={{ position: 'absolute', left: 20, top: 12 }}>node</Label>
        </div>

        {/* struck push model: scheduler → kubelet, no such dispatch */}
        <div style={{ opacity: push }}>
          <div
            style={{
              position: 'absolute',
              left: 199,
              top: 255,
              width: 551,
              height: 0,
              borderTop: `3px dashed ${PALETTE.bad}`,
              transform: 'rotate(15.8deg)',
              transformOrigin: 'center',
              opacity: 0.85,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 475 - 20,
              top: 255 - 22,
              width: 40,
              height: 44,
              fontFamily: MONO,
              fontSize: 40,
              fontWeight: 900,
              color: PALETTE.bad,
              lineHeight: 1,
              textAlign: 'center',
              opacity: strike,
              textShadow: `0 0 16px ${PALETTE.bad}66`,
            }}
          >
            ✕
          </div>
          <div
            style={{
              position: 'absolute',
              left: 400,
              top: 348,
              width: 340,
              textAlign: 'center',
              fontFamily: MONO,
              color: PALETTE.bad,
              fontSize: 15,
              fontWeight: 900,
              background: '#0c111c',
              border: `1px solid ${PALETTE.bad}66`,
              borderRadius: 999,
              padding: '9px 12px',
              opacity: pushLabel,
              whiteSpace: 'nowrap',
            }}
          >
            ✕ no command · no dispatch · no push
          </div>
        </div>

        {/* the watch line — pull, not push */}
        <div style={{ opacity: watch }}>
          <div
            style={{
              position: 'absolute',
              left: KUBE_CX - 1.5,
              top: 180,
              width: 3,
              height: 150,
              background: PALETTE.violet,
              opacity: watchPulse,
              boxShadow: `0 0 12px ${PALETTE.violet}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 962,
              top: 200,
              width: 360,
              fontFamily: MONO,
              color: PALETTE.violet,
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            ▲ watch — pulls Pods assigned to this node
          </div>
        </div>

        {/* kubelet with its reconcile-loop ring */}
        <div
          style={{
            position: 'absolute',
            left: 740,
            top: 330,
            width: 400,
            height: 140,
            border: `2px solid ${PALETTE.violet}`,
            borderRadius: 18,
            background: `${PALETTE.violet}1c`,
            boxShadow: `0 0 24px ${PALETTE.violet}33`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: kubeBox,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 30, fontWeight: 900 }}>kubelet</div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 14, fontWeight: 700, marginTop: 6 }}>
            reconcile loop — drives Pods toward their described state
          </div>
        </div>
        {/* the loop ring; opacity lives on the ring, not the box */}
        <div
          style={{
            position: 'absolute',
            left: 726,
            top: 316,
            width: 428,
            height: 168,
            borderRadius: 96,
            border: `3px dashed ${PALETTE.violet}`,
            opacity: kubeBox * ringPulse,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: -16,
              transform: 'translateX(-50%)',
              fontFamily: MONO,
              color: PALETTE.violet,
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            ⟳
          </div>
        </div>

        {/* spoke bus + spokes */}
        <div
          style={{
            position: 'absolute',
            left: 180,
            top: BUS_Y,
            width: 1300,
            height: 0,
            borderTop: `2px solid ${PALETTE.violet}55`,
            opacity: scene,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: KUBE_CX - 1.5,
            top: 470,
            width: 3,
            height: BUS_Y - 470,
            background: `${PALETTE.violet}66`,
            opacity: kubeBox,
          }}
        />
        {SPOKES.map((s, i) => {
          const cx = SPOKE_X0 + i * (CHIP_W + CHIP_GAP) + CHIP_W / 2;
          const on = spokes[i];
          return (
            <div key={s.label} style={{ opacity: on }}>
              <div
                style={{
                  position: 'absolute',
                  left: cx - 1.5,
                  top: BUS_Y,
                  width: 3,
                  height: CHIP_TOP - BUS_Y,
                  background: `${s.color}66`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: cx - CHIP_W / 2,
                  top: CHIP_TOP,
                  width: CHIP_W,
                  height: CHIP_H,
                  border: `2px solid ${s.color}88`,
                  borderRadius: 14,
                  background: `${s.color}12`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '0 10px',
                }}
              >
                <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 20, fontWeight: 900 }}>
                  {s.label === 'status' ? '↑ status' : s.label}
                </div>
                <div style={{ fontFamily: MONO, color: s.color, fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>{s.sub}</div>
              </div>
            </div>
          );
        })}

        {/* footer */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 665, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>same loop shape as every controller — running on the node instead of the control plane</Label>
        </div>
      </div>
    </div>
  );
};
