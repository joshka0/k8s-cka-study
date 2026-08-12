import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Horizontal, Label, SANS, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Reused from the pilot — the scheduler emits a Binding into the API server,
 * nodeName fills in, and the deliberate absence of an arrow to the node.
 * Module 06 extends it additively (gated on the module so the pilot and
 * module 01 render unchanged): a muted panel beside the field it does write,
 * listing what the scheduler does NOT do.
 */

export const Binding: React.FC<VisualProps> = ({ module }) => {
  if (module?.module.number === 6) return <ModuleBinding />;
  return <PilotBinding />;
};

/**
 * Module 06 — the output is a name. The pilot's scene, plus a panel beside
 * the nodeName field: no image pull, no container start, no node contact.
 * Same type scale as the primary labels — not 14px grey.
 */
const ModuleBinding: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.04, 0.1);
  const flight = seg(t, 0.16, 0.38);
  const nodeNameFilled = seg(t, 0.38, 0.52);
  const panelIn = appear(t, 0.46, 0.56);
  const kubeletIn = appear(t, 0.58, 0.66);
  const footer = appear(t, 0.78, 0.86);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ textAlign: 'center', opacity: header, marginBottom: 22 }}>
        <Label color={PALETTE.cyan} size={13}>the output of all that work is a name — one field written, nothing started</Label>
      </div>

      {/* scheduler → binding → API server */}
      <Horizontal center gap={40}>
        <Box pad={16} borderColor={PALETTE.blue} style={{ width: 190, textAlign: 'center' }}>
          <Label color={PALETTE.blueInk} size={12}>control plane</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>scheduler</div>
        </Box>

        <div style={{ position: 'relative', width: 340, height: 70 }}>
          <div
            style={{
              position: 'absolute',
              left: lerp(0, 250, flight) + 140,
              top: 14,
              fontFamily: MONO,
              color: PALETTE.violet,
              background: `${PALETTE.violet}1c`,
              border: `1px solid ${PALETTE.violet}`,
              borderRadius: 8,
              padding: '5px 10px',
              fontSize: 15,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              opacity: flight > 0.02 && flight < 0.98 ? 1 : flight >= 0.98 ? 0.6 : 0,
            }}
          >
            Binding
          </div>
          <div style={{ position: 'absolute', left: 150, top: 27, color: PALETTE.blue, fontSize: 26, opacity: 0.6 }}>→</div>
        </div>

        <Box pad={16} borderColor={PALETTE.blue} style={{ width: 200, textAlign: 'center' }}>
          <Label color={PALETTE.blueInk} size={12}>control plane</Label>
          <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 24, fontWeight: 900 }}>API server</div>
        </Box>
      </Horizontal>

      {/* the field it writes, and the things it does not do */}
      <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 60, alignItems: 'flex-start' }}>
        <Box pad={16} style={{ width: 320, textAlign: 'center' }}>
          <Label color={PALETTE.cyan} size={11}>Pod object (in etcd)</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, marginTop: 8, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: PALETTE.muted }}>name</span>
              <span>app-abc</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 4,
                padding: '6px 8px',
                borderRadius: 8,
                background: nodeNameFilled > 0 ? `${PALETTE.good}22` : 'transparent',
                border: `1px solid ${nodeNameFilled > 0 ? PALETTE.good : PALETTE.line}`,
              }}
            >
              <span style={{ color: PALETTE.muted }}>nodeName</span>
              <span style={{ color: nodeNameFilled > 0 ? PALETTE.good : PALETTE.muted, fontWeight: 900 }}>
                {nodeNameFilled > 0 ? 'node-4' : '—'}
              </span>
            </div>
          </div>
        </Box>

        {/* what the scheduler does NOT do — same type scale as the field above */}
        <div
          style={{
            width: 360,
            borderRadius: 16,
            border: `1px solid ${PALETTE.line}`,
            background: `${PALETTE.panel}99`,
            padding: '14px 18px',
            opacity: panelIn,
            transform: `translateY(${(1 - panelIn) * 12}px)`,
          }}
        >
          <Label color={PALETTE.muted} size={11} style={{ marginBottom: 10 }}>the scheduler does NOT</Label>
          <NotItem text="pull an image" done={panelIn} />
          <NotItem text="start a container" done={panelIn} />
          <NotItem text="contact the node" done={panelIn} />
        </div>
      </div>

      {/* node box + the kubelet that takes over */}
      <div style={{ marginTop: 30, textAlign: 'center', opacity: kubeletIn }}>
        <Box pad={16} borderColor={PALETTE.violet} style={{ width: 200, margin: '0 auto' }}>
          <Label color={PALETTE.violet} size={12}>node</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>node-4</div>
        </Box>
        <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15, fontWeight: 700, marginTop: 12 }}>
          the kubelet there was watching — it sees the name is its problem and takes over
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, opacity: footer }}>
        <Label color={PALETTE.amber} size={13}>two loops that fail independently — the scheduler writes a name; the kubelet makes it run</Label>
      </div>
    </div>
  );
};

function NotItem({ text, done }: { text: string; done: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}>
      <span
        style={{
          fontFamily: MONO,
          color: PALETTE.bad,
          fontSize: 20,
          fontWeight: 900,
          lineHeight: 1,
          opacity: 0.3 + done * 0.7,
        }}
      >
        ✕
      </span>
      <span
        style={{
          fontFamily: MONO,
          color: PALETTE.muted,
          fontSize: 17,
          fontWeight: 800,
          opacity: 0.25 + done * 0.75,
        }}
      >
        {text}
      </span>
    </div>
  );
}

/** The pilot's Binding, byte-identical: scheduler emits a binding, nodeName
 * fills in, and there is deliberately no arrow from scheduler to node. */
const PilotBinding: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const flight = seg(t, 0.2, 0.42);
  const nodeNameFilled = seg(t, 0.42, 0.56);
  const moveOn = seg(t, 0.58, 0.75);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Horizontal center gap={40} style={{ marginTop: 60 }}>
        {/* scheduler + its next pod */}
        <div style={{ position: 'relative' }}>
          <Box pad={16} borderColor={PALETTE.blue} style={{ width: 190, textAlign: 'center' }}>
            <Label color={PALETTE.blueInk} size={12}>control plane</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>scheduler</div>
          </Box>
          {/* next pod, scheduler turns to it */}
          <div
            style={{
              position: 'absolute',
              left: -90,
              top: 110,
              fontFamily: MONO,
              color: PALETTE.muted,
              fontSize: 15,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              opacity: moveOn,
            }}
          >
            ↳ next queued pod…
          </div>
        </div>

        <div style={{ position: 'relative', width: 340, height: 90 }}>
          {/* binding flight */}
          <div
            style={{
              position: 'absolute',
              left: lerp(0, 250, flight) + 140,
              top: 20,
              fontFamily: MONO,
              color: PALETTE.violet,
              background: `${PALETTE.violet}1c`,
              border: `1px solid ${PALETTE.violet}`,
              borderRadius: 8,
              padding: '5px 10px',
              fontSize: 15,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              opacity: flight > 0.02 && flight < 0.98 ? 1 : flight >= 0.98 ? 0.6 : 0,
            }}
          >
            Binding
          </div>
          <div
            style={{
              position: 'absolute',
              left: 150,
              top: 40,
              color: PALETTE.blue,
              fontSize: 26,
              opacity: 0.6,
            }}
          >
            →
          </div>
        </div>

        <Box pad={16} borderColor={PALETTE.blue} style={{ width: 200, textAlign: 'center' }}>
          <Label color={PALETTE.blueInk} size={12}>control plane</Label>
          <div style={{ fontFamily: SANS, color: PALETTE.ink, fontSize: 24, fontWeight: 900 }}>API server</div>
        </Box>
      </Horizontal>

      {/* node + pod object */}
      <div style={{ marginTop: 70, display: 'flex', justifyContent: 'center', gap: 90, alignItems: 'flex-start' }}>
        <Box pad={16} style={{ width: 320, textAlign: 'center' }}>
          <Label color={PALETTE.cyan} size={11}>Pod object (in etcd)</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, marginTop: 8, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: PALETTE.muted }}>name</span>
              <span>app-abc</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 4,
                padding: '6px 8px',
                borderRadius: 8,
                background: nodeNameFilled > 0 ? `${PALETTE.good}22` : 'transparent',
                border: `1px solid ${nodeNameFilled > 0 ? PALETTE.good : PALETTE.line}`,
              }}
            >
              <span style={{ color: PALETTE.muted }}>nodeName</span>
              <span style={{ color: nodeNameFilled > 0 ? PALETTE.good : PALETTE.muted, fontWeight: 900 }}>
                {nodeNameFilled > 0 ? 'node-4' : '—'}
              </span>
            </div>
          </div>
        </Box>

        <div style={{ paddingTop: 40, textAlign: 'center' }}>
          <Box pad={16} borderColor={PALETTE.violet} style={{ width: 200 }}>
            <Label color={PALETTE.violet} size={12}>node</Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 22, fontWeight: 900 }}>node-4</div>
          </Box>
          <div style={{ marginTop: 18, color: PALETTE.muted, fontSize: 13, fontFamily: MONO }}>
            {nodeNameFilled > 0 ? '· decision written to the DB ·' : ''}
          </div>
        </div>
      </div>

      {/* the deliberate absence: no arrow from scheduler to node */}
      <div style={{ textAlign: 'center', marginTop: 26, opacity: appear(t, 0.5, 0.6) }}>
        <span style={{ fontFamily: MONO, color: PALETTE.bad, fontWeight: 800 }}>
          ✕ no arrow here — the scheduler never contacts the node
        </span>
      </div>
    </div>
  );
};

function lerp(a: number, b: number, u: number) {
  return a + (b - a) * u;
}
