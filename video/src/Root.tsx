import React from 'react';
import { Composition } from 'remotion';
import { Beat as BeatComp } from './Beat';
import { TitleBar } from './TitleBar';
import {
  BEATS, META, beatOffsets, beatAudioSrc, beatHasAudio, totalDurationFrames,
} from './script';
import { PALETTE } from './theme';
import { resolveVisual } from './visuals';
import { makeModuleVideo } from './ModuleRoot';
import { moduleBeatDurationSeconds } from './module';
import { AbsoluteFill, Sequence } from 'remotion';

import u01 from '../modules/u01-control-plane/script.json';
import u02 from '../modules/u02-api-path/script.json';
import u03 from '../modules/u03-reconciliation/script.json';
import u04 from '../modules/u04-workloads/script.json';
import u05 from '../modules/u05-crds/script.json';
import u06 from '../modules/u06-scheduling/script.json';
import u07 from '../modules/u07-kubelet/script.json';
import u08 from '../modules/u08-networking/script.json';
import u09 from '../modules/u09-dns/script.json';
import u10 from '../modules/u10-storage/script.json';
import u11 from '../modules/u11-etcd-ha/script.json';
import u12 from '../modules/u12-scale-evidence/script.json';
import u13 from '../modules/u13-bootstrap/script.json';
import u14 from '../modules/u14-config-qos/script.json';
import u15 from '../modules/u15-ingress-gateway/script.json';
import u16 from '../modules/u16-numa/script.json';
import u17 from '../modules/u17-devices-dra/script.json';
import u18 from '../modules/u18-api-machinery/script.json';
import u19 from '../modules/u19-coordination/script.json';
import u20 from '../modules/u20-troubleshooting/script.json';
import u21 from '../modules/u21-identity-rbac/script.json';
import u22 from '../modules/u22-metrics-debug/script.json';
import u23 from '../modules/u23-declarative-delivery/script.json';
import u24 from '../modules/u24-namespace-governance/script.json';
import u25 from '../modules/u25-service-exposure/script.json';
import u26 from '../modules/u26-restart-ownership/script.json';
import u27 from '../modules/u27-pod-security/script.json';

const Pilot: React.FC<{ showCaptions: boolean }> = ({ showCaptions }) => {
  return (
    <AbsoluteFill style={{ background: PALETTE.bg }}>
      <TitleBar stage={null} total={BEATS.length} />
      {beatOffsets().map(({ beat, from, duration }) => {
        const Visual = resolveVisual(beat.visual.type);
        const audio: string | undefined = beatHasAudio(beat)
          ? beatAudioSrc(beat)
          : undefined;
        return (
          <Sequence
            key={beat.id}
            name={`${beat.n} ${beat.id}`}
            from={from}
            durationInFrames={duration}
          >
            <BeatComp beat={beat} audioSrc={audio} showCaptions={showCaptions} Visual={Visual} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const MODULES = [
  { id: 'Module01', name: 'u01-control-plane', script: u01 },
  { id: 'Module02', name: 'u02-api-path', script: u02 },
  { id: 'Module03', name: 'u03-reconciliation', script: u03 },
  { id: 'Module04', name: 'u04-workloads', script: u04 },
  { id: 'Module05', name: 'u05-crds', script: u05 },
  { id: 'Module06', name: 'u06-scheduling', script: u06 },
  { id: 'Module07', name: 'u07-kubelet', script: u07 },
  { id: 'Module08', name: 'u08-networking', script: u08 },
  { id: 'Module09', name: 'u09-dns', script: u09 },
  { id: 'Module10', name: 'u10-storage', script: u10 },
  { id: 'Module11', name: 'u11-etcd-ha', script: u11 },
  { id: 'Module12', name: 'u12-scale-evidence', script: u12 },
  { id: 'Module13', name: 'u13-bootstrap', script: u13 },
  { id: 'Module14', name: 'u14-config-qos', script: u14 },
  { id: 'Module15', name: 'u15-ingress-gateway', script: u15 },
  { id: 'Module16', name: 'u16-numa', script: u16 },
  { id: 'Module17', name: 'u17-devices-dra', script: u17 },
  { id: 'Module18', name: 'u18-api-machinery', script: u18 },
  { id: 'Module19', name: 'u19-coordination', script: u19 },
  { id: 'Module20', name: 'u20-troubleshooting', script: u20 },
  { id: 'Module21', name: 'u21-identity-rbac', script: u21 },
  { id: 'Module22', name: 'u22-metrics-debug', script: u22 },
  { id: 'Module23', name: 'u23-declarative-delivery', script: u23 },
  { id: 'Module24', name: 'u24-namespace-governance', script: u24 },
  { id: 'Module25', name: 'u25-service-exposure', script: u25 },
  { id: 'Module26', name: 'u26-restart-ownership', script: u26 },
  { id: 'Module27', name: 'u27-pod-security', script: u27 },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="IntentToPacket"
        component={Pilot}
        durationInFrames={totalDurationFrames()}
        fps={META.fps}
        width={META.width}
        height={META.height}
        defaultProps={{ showCaptions: true }}
      />
      {MODULES.map((m) => (
        <Composition
          key={m.id}
          id={m.id}
          component={makeModuleVideo(m.script as never, m.name)}
          durationInFrames={moduleFrames(m)}
          fps={(m.script as any).meta.fps}
          width={(m.script as any).meta.width}
          height={(m.script as any).meta.height}
          defaultProps={{ showCaptions: true }}
        />
      ))}
    </>
  );
};

function moduleFrames(m: { name: string; script: any }): number {
  let acc = 0;
  const fps = m.script.meta.fps || 30;
  for (const beat of (m.script as never as { beats: typeof BEATS }).beats) {
    acc += Math.round(moduleBeatDurationSeconds(m.name, beat) * fps);
  }
  return acc;
}
