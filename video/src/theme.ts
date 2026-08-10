// Shared palette and lane colors. Mirrors the course's dark visual language.
export const PALETTE = {
  ink: '#e9eef9',
  muted: '#a6b2c8',
  bg: '#0b111d',
  panel: '#151e2e',
  line: '#2c3a50',
  blue: '#326ce5',
  cyan: '#22d3ee',
  good: '#22c55e',
  amber: '#f59e0b',
  bad: '#ef4444',
  violet: '#a78bfa',
} as const;

export const LANES: Record<string, { label: string; color: string }> = {
  control: { label: 'Control plane', color: PALETTE.blue },
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
