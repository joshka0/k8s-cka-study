import scriptData from '../script.json';
import { audioSources, durations } from './generated/narration';

export interface Beat {
  id: string;
  n: number;
  /** Narration stage number. Null on the four framing beats, which are not stages. */
  stage: number | null;
  title: string;
  lane: string | null;
  estSeconds: number;
  narration: string;
  visual: { type: string; spec: string };
}

const data = scriptData as {
  title: string;
  subtitle: string;
  meta: {
    targetWpm: number;
    fps: number;
    width: number;
    height: number;
    palette: Record<string, string>;
    lanes: { id: string; label: string; color: string }[];
  };
  beats: Beat[];
};

export const SCRIPT = data;
export const BEATS: Beat[] = data.beats;
export const META = data.meta;
export const FPS = data.meta.fps;

// ---- Timing ---------------------------------------------------------------
// Narration audio is the timing authority. If a beat's audio was measured
// (present in narration/durations.json and wired into generated/narration.ts),
// its real duration wins. Otherwise we fall back to the planning estSeconds.
export function beatDurationSeconds(beat: Beat): number {
  const measured = durations[beat.id];
  if (typeof measured === 'number' && measured > 0) return measured;
  return beat.estSeconds;
}

export function beatHasAudio(beat: Beat): boolean {
  return Boolean(audioSources[beat.id]);
}

export function beatAudioSrc(beat: Beat): string | undefined {
  return audioSources[beat.id];
}

export const HAS_AUDIO = Object.keys(audioSources).length > 0;

// Map beats to cumulative from-frame offsets.
export function beatOffsets(): { beat: Beat; from: number; duration: number }[] {
  let acc = 0;
  return BEATS.map((beat) => {
    const duration = Math.round(beatDurationSeconds(beat) * FPS);
    const out = { beat, from: acc, duration };
    acc += duration;
    return out;
  });
}

export function totalDurationFrames(): number {
  return beatOffsets().reduce((s, b) => s + b.duration, 0);
}
