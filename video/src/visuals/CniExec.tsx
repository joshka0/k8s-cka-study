import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from '../theme';
import { Box, Label, MONO } from '../ui';
import type { VisualProps } from '../module';
import { appear, seg } from '../motion';

/**
 * Shared pilot component; module 08 beat 8 extends it. The pilot beat has no
 * `module` prop and renders exactly as before; module 08 renders the extended
 * version — the plugin as a short-lived process (starts, is handed
 * CNI_COMMAND plus stdin config, returns JSON on stdout, exits) beside a
 * long-running node agent the short-lived binary talks to. The distinction
 * between the two is the beat; they are never merged.
 */
export const CniExec: React.FC<VisualProps> = ({ module }) => {
  if (module?.module.number === 8) return <ModuleCniExec />;
  return <PilotCniExec />;
};

/** The pilot beat 10 — unchanged. */
const PilotCniExec: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const envIn = appear(t, 0.06, 0.18);
  const stdinIn = appear(t, 0.14, 0.26);
  const run = seg(t, 0.28, 0.45);
  const runExit = seg(t, 0.45, 0.52);
  const stdoutIn = seg(t, 0.5, 0.68);
  const ipamIn = seg(t, 0.58, 0.72);
  const vethIn = seg(t, 0.78, 0.95);

  const ipamOffset = appear(t, 0.58, 0.7);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
      <Box mono pad={18} style={{ width: 1440, background: '#0a1019' }}>
        {/* window chrome */}
        <div style={{ display: 'flex', gap: 8, paddingBottom: 10, borderBottom: `1px solid ${PALETTE.line}` }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ marginLeft: 12, color: PALETTE.muted, fontSize: 14, fontFamily: MONO }}>runtime → cni exec</span>
        </div>

        {/* env vars */}
        <div style={{ marginTop: 14, opacity: envIn }}>
          <Label color={PALETTE.muted} size={11}>environment</Label>
          {['CNI_COMMAND=ADD', 'CNI_NETNS=<sandbox ns>', 'CNI_IFNAME=eth0'].map((e) => (
            <div key={e} style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 19, fontWeight: 700 }}>{e}</div>
          ))}
        </div>

        {/* stdin */}
        <div style={{ marginTop: 12, opacity: stdinIn }}>
          <Label color={PALETTE.muted} size={11}>stdin (JSON config)</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 17 }}>
            {"$ echo '{ \"cniVersion\": \"1.0\", \"type\": \"cilium|calico|…\" }' |"}
          </div>
        </div>

        {/* plugin binary */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Assignee on={envIn > 0.7} />
          <div
            style={{
              fontFamily: MONO,
              color: PALETTE.ink,
              fontSize: 18,
              fontWeight: 800,
              border: `1px solid ${run > 0 ? PALETTE.violet : PALETTE.line}`,
              borderRadius: 8,
              padding: '10px 16px',
              background: run > 0 ? `${PALETTE.violet}18` : '#0d1522',
              opacity: appear(t, 0.26, 0.34),
            }}
          >
            CNI plugin — a binary, not a daemon
          </div>
          <span
            style={{
              fontFamily: MONO,
              color: runExit > 0.3 ? PALETTE.good : PALETTE.muted,
              fontSize: 17,
              fontWeight: 800,
            }}
          >
            {runExit > 0.3 ? '→ exit 0' : run > 0.02 ? 'running…' : ''}
          </span>
        </div>

        {/* The delegation is the point of this beat, so give it its own nested
            exec block rather than a caption squeezed against the right edge. */}
        <div
          style={{
            marginLeft: 74,
            marginTop: 12,
            borderLeft: `2px solid ${PALETTE.good}55`,
            paddingLeft: 18,
            opacity: ipamIn,
            transform: `translateY(${(1 - ipamOffset) * 14}px)`,
          }}
        >
          <div
            style={{
              border: `1px solid ${PALETTE.good}77`,
              borderRadius: 10,
              background: `${PALETTE.good}12`,
              padding: '12px 18px',
              display: 'inline-block',
            }}
          >
            <Label color={PALETTE.good} size={11}>
              delegated exec · same contract, one level down
            </Label>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 800, marginTop: 4 }}>
              ipam plugin <span style={{ color: PALETTE.muted, fontWeight: 600 }}>(host-local)</span>
            </div>
            <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 17, marginTop: 6 }}>
              ↳ returns {ipamIn > 0.45 ? '{ ip: 10.0.0.16, gateway, routes }' : '…'}
            </div>
          </div>
        </div>

        {/* stdout result */}
        <div style={{ marginTop: 16, opacity: stdoutIn }}>
          <Label color={PALETTE.muted} size={11}>stdout (JSON result)</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 18, lineHeight: 1.7 }}>
            {stdoutIn > 0.15 && <>{"{ \"ips\": [\"10.0.0.16\"], \"routes\": […], \"dns\": {…} }"}</>}
          </div>
        </div>
      </Box>

      {/* veth appears inside sandbox */}
      <div style={{ display: 'flex', justifyContent: 'center', opacity: vethIn }}>
        <div
          style={{
            border: `2px solid ${PALETTE.cyan}`,
            borderRadius: 18,
            background: `${PALETTE.cyan}0f`,
            padding: '18px 60px',
            textAlign: 'center',
          }}
        >
          <Label color={PALETTE.cyan} size={12}>pod namespace</Label>
          <div style={{ fontFamily: MONO, color: PALETTE.good, fontSize: 30, fontWeight: 900, margin: '6px 0 2px' }}>
            veth0 · 10.0.0.16
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 15 }}>
            whose IP? an IPAM plugin ← invoked by a CNI plugin ← invoked by the runtime
          </div>
        </div>
      </div>
    </div>
  );
};

function Assignee({ on }: { on: boolean }) {
  return (
    <span style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 16, fontWeight: 700, opacity: on ? 1 : 0.3 }}>
      $ run
    </span>
  );
}

/**
 * Module 08 beat 8 — a program, not a service. The exec contract on the left,
 * and beside it the long-running node agent as a separate process the
 * short-lived binary talks to. The plugin starts, is handed CNI_COMMAND plus
 * stdin config, returns JSON on stdout, and exits; the agent keeps running.
 */
const ModuleCniExec: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const header = appear(t, 0.02, 0.08);
  const runtimeIn = appear(t, 0.05, 0.12);
  const pluginIn = appear(t, 0.1, 0.18);
  const starts = seg(t, 0.14, 0.24);
  const handed = seg(t, 0.24, 0.36);
  const returnsJson = seg(t, 0.36, 0.5);
  const exits = seg(t, 0.5, 0.58);
  const agentIn = appear(t, 0.42, 0.5);
  const talk = seg(t, 0.58, 0.72);
  const footer = appear(t, 0.84, 0.92);

  const lifeStages: { label: string; on: number; color: string }[] = [
    { label: 'starts', on: starts, color: PALETTE.cyan },
    { label: 'CNI_COMMAND + stdin config', on: handed, color: PALETTE.cyan },
    { label: 'JSON on stdout', on: returnsJson, color: PALETTE.good },
    { label: 'exits', on: exits, color: PALETTE.good },
  ];

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
      <div style={{ width: 1620, height: 660, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: header }}>
          <Label color={PALETTE.cyan} size={13}>a CNI plugin is a program, not a service — and the node agent is a different process entirely</Label>
        </div>

        {/* LEFT — the exec contract, short-lived */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 60,
            width: 880,
            borderRadius: 18,
            border: `2px solid ${PALETTE.violet}77`,
            background: '#0a1019',
            padding: '22px 26px',
            opacity: runtimeIn,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>
              runtime
            </div>
            <Label color={PALETTE.violet} size={11}>exec contract — in the host network domain, not inside the container</Label>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 800, color: PALETTE.ink, opacity: pluginIn, marginBottom: 18 }}>
            $ run <span style={{ color: PALETTE.violet }}>CNI plugin</span>
            <span style={{ color: PALETTE.good }}>{exits > 0.5 ? ' — exit 0' : starts > 0.02 ? ' — running…' : ''}</span>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {lifeStages.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <span style={{ alignSelf: 'center', color: PALETTE.line, fontSize: 18, fontWeight: 900 }}>→</span>}
                <div
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    border: `2px solid ${s.on > 0.5 ? s.color : PALETTE.line}`,
                    background: s.on > 0.5 ? `${s.color}12` : '#0d1522',
                    padding: '14px 12px',
                    textAlign: 'center',
                    minHeight: 96,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    opacity: Math.max(0.3, s.on),
                  }}
                >
                  <div style={{ fontFamily: MONO, color: s.on > 0.5 ? s.color : PALETTE.muted, fontSize: 15, fontWeight: 900, lineHeight: 1.3 }}>
                    {s.label}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div style={{ marginTop: 14, fontFamily: MONO, color: PALETTE.muted, fontSize: 13, fontWeight: 700 }}>
            runs in the host network domain · reads config from stdin · writes the result to stdout · then gone
          </div>
        </div>

        {/* RIGHT — the node agent, long-running */}
        <div
          style={{
            position: 'absolute',
            right: 60,
            top: 60,
            width: 620,
            borderRadius: 18,
            border: `2px solid ${PALETTE.cyan}88`,
            background: `${PALETTE.cyan}08`,
            padding: '22px 26px',
            opacity: agentIn,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.ink, fontSize: 19, fontWeight: 900 }}>node agent</div>
          <div style={{ fontFamily: MONO, color: PALETTE.cyan, fontSize: 14, fontWeight: 800, marginTop: 6 }}>
            e.g. calico/node · cilium-agent
          </div>
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: MONO,
              fontSize: 15,
              fontWeight: 900,
              color: PALETTE.good,
              border: `1px solid ${PALETTE.good}55`,
              borderRadius: 12,
              background: `${PALETTE.good}0c`,
              padding: '12px 16px',
            }}
          >
            <span style={{ opacity: 0.5 + 0.5 * Math.abs(Math.sin(frame / 9)) }}>●</span>
            long-running — started with the node, does not exit
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.muted, fontSize: 13.5, fontWeight: 700, marginTop: 14, lineHeight: 1.5 }}>
            the short-lived plugin talks to this daemon for state the exec contract cannot carry
          </div>
        </div>

        {/* the talking arrow between plugin and agent */}
        <div
          style={{
            position: 'absolute',
            left: 940,
            top: 250,
            opacity: talk,
          }}
        >
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 34, fontWeight: 900, textAlign: 'center', transform: 'rotate(180deg)' }}>
            ←
          </div>
          <div style={{ fontFamily: MONO, color: PALETTE.amber, fontSize: 13, fontWeight: 800, marginTop: 4 }}>
            talks to
          </div>
        </div>

        <div style={{ position: 'absolute', left: 60, top: 430, width: 1500, fontFamily: MONO, color: PALETTE.ink, fontSize: 18, fontWeight: 800, textAlign: 'center', opacity: appear(t, 0.6, 0.68) }}>
          the plugin is a process — the agent is a daemon: <span style={{ color: PALETTE.amber }}>the binary exits, the agent does not</span>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 580, textAlign: 'center', opacity: footer }}>
          <Label color={PALETTE.amber} size={13}>when a node issue is reported, name which one you mean — the exec contract and the agent fail in different places and different logs</Label>
        </div>
      </div>
    </div>
  );
};
