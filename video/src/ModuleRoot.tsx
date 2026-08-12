import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Beat as BeatComp } from './Beat';
import { TitleBar } from './TitleBar';
import { PALETTE } from './theme';
import { resolveVisual } from './visuals';
import {
  ModuleScript,
  ModuleContext,
  moduleBeatAudioSrc,
  moduleBeatDurationSeconds,
  spineOrdinal,
} from './module';

/**
 * A module composition. Each returns an independent <Video> component driven
 * only by its own script — adding a beat to one module's script.json changes
 * only that module's video.
 */
export function makeModuleVideo(script: ModuleScript, moduleName: string) {
  const ctx: ModuleContext = {
    name: moduleName,
    number: script.series.module,
    title: script.title,
    subtitle: script.subtitle,
    spineSegment: script.series.spineSegment,
    spineOrdinal: spineOrdinal(script.series.spineSegment),
    beneath: (script.series as any).beneath,
  };

  const Video: React.FC<{ showCaptions: boolean }> = ({ showCaptions }) => {
    let acc = 0;
    const offsets = script.beats.map((beat) => {
      const duration = Math.round(
        moduleBeatDurationSeconds(moduleName, beat) * (script.meta.fps || 30)
      );
      const out = { beat, from: acc, duration };
      acc += duration;
      return out;
    });
    const totalFrames = acc;

    return (
      <AbsoluteFill style={{ background: PALETTE.bg }}>
        <TitleBar
          stage={null}
          total={script.beats.length}
          title={script.title}
          subtitle={`Module ${script.series.module} · ${script.subtitle}`}
        />
        {offsets.map(({ beat, from, duration }) => {
          const Visual = resolveVisual(beat.visual.type);
          const audio = moduleBeatAudioSrc(moduleName, beat);
          const isClose = beat.id === 'close';
          const light = isClose ? ctx.spineOrdinal + 1 : ctx.spineOrdinal;
          return (
            <Sequence
              key={beat.id}
              name={`${beat.n} ${beat.id}`}
              from={from}
              durationInFrames={duration}
            >
              <BeatComp
                beat={beat}
                audioSrc={audio}
                showCaptions={showCaptions}
                Visual={Visual}
                module={{ module: ctx, light, close: isClose }}
              />
            </Sequence>
          );
        })}
      </AbsoluteFill>
    );
  };

  return Video;
}
