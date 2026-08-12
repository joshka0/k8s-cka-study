// Shared palette and lane colors. Mirrors the course's dark visual language.
export const PALETTE = {
  ink: '#e9eef9',
  muted: '#a6b2c8',
  bg: '#0b111d',
  panel: '#151e2e',
  line: '#2c3a50',
  blue: '#326ce5',
  // Kubernetes blue is a structural colour here: borders, lane dots, fills.
  // As *text* on the background it measures 3.97:1, under the 4.5:1 floor, and
  // it was the least legible mark in every frame. Same hue, lifted lightness:
  // 5.46:1 on the background, 4.83:1 on a panel. Use `blue` for structure and
  // `blueInk` for anything a viewer has to read.
  blueInk: '#5887ea',
  cyan: '#22d3ee',
  good: '#22c55e',
  amber: '#f59e0b',
  bad: '#ef4444',
  violet: '#a78bfa',
} as const;

export const LANES: Record<string, { label: string; color: string }> = {
  // Lane colours are rendered as label text in the caption chrome, so this one
  // takes the readable blue rather than the structural one.
  control: { label: 'Control plane', color: PALETTE.blueInk },
  node: { label: 'Node', color: PALETTE.violet },
  pod: { label: 'Pod', color: PALETTE.cyan },
};

export function laneColor(laneId: string | null): string {
  if (laneId && LANES[laneId]) return LANES[laneId].color;
  return PALETTE.ink;
}

export function laneLabel(laneId: string | null): string {
  if (laneId && LANES[laneId]) return LANES[laneId].label;
  return '';
}
