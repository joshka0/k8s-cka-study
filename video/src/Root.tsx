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
