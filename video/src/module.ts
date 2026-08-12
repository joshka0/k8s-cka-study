import type { Beat } from './script';
import { moduleAudioSources, moduleDurations } from './generated/module-narration';

export interface SeriesBlock {
  module: number;
  unit: string;
  spineSegment: string;
  assumes: string;
}

export interface ModuleScript {
  title: string;
  subtitle: string;
  series: SeriesBlock;
  meta: {
    narrationSpeed?: number;
    fps: number;
    width: number;
    height: number;
    note?: string;
    sharedProject?: string;
  };
  beats: Beat[];
}

/**
 * The fourteen spine segments in course order, matching the pilot's recap rows.
 * `spineOrdinal` resolves a module's `series.spineSegment` to its position so
 * spineLocator can light the right one (and its successor when previewing the
 * next module on the closing beat).
 */
const SPINE_ORDER = [
  'desired object',
  'admission / storage',
  'watch + cache',
  'controller queue',
  'scheduler queue + binding',
  'kubelet',
  'CRI',
  'CNI',
  'CSI',
  'EndpointSlice',
  'service',
  'DNS',
  'data plane',
  'application',
];

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

export function spineOrdinal(name: string): number {
  const target = norm(name);
  const idx = SPINE_ORDER.findIndex((s) => norm(s) === target);
  return idx >= 0 ? idx + 1 : 1;
}

export function spineName(ordinal: number): string {
  const i = ordinal - 1;
  return i >= 0 && i < SPINE_ORDER.length ? SPINE_ORDER[i] : SPINE_ORDER[0];
}

// ---- Timing ----------------------------------------------------------------
// Identical contract to the pilot (src/script.ts): narration audio is the
// timing authority when a measured file exists for the beat, otherwise the
// module script's estSeconds.
export function moduleBeatDurationSeconds(moduleName: string, beat: Beat): number {
  const measured = moduleDurations[moduleName]?.[beat.id];
  if (typeof measured === 'number' && measured > 0) return measured;
  return beat.estSeconds;
}

export function moduleBeatAudioSrc(moduleName: string, beat: Beat): string | undefined {
  return moduleAudioSources[moduleName]?.[beat.id];
}

// ---- Module context handed to visuals ---------------------------------------
// Passed alongside `beat` so module-aware components (spineLocator) can light
// the correct spine segment. Pilot visuals ignore it.
export interface ModuleContext {
  name: string;
  number: number;
  title: string;
  subtitle: string;
  spineSegment: string;
  spineOrdinal: number;
  /** The layer this module descends into beneath its segment, if any. Declared
   *  by the module so the locator needs no per-module knowledge. */
  beneath?: string;
}

export interface VisualModule {
  module: ModuleContext;
  /** Spine ordinal (1..14) the module locator should magnify this beat. */
  light: number;
  /** True on the closing "back to the spine" beat, which holds the whole path. */
  close: boolean;
}

export type VisualProps = { beat: Beat; module?: VisualModule };
