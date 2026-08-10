import { interpolate, Easing } from 'remotion';

export const ease = Easing.inOut(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);

/** Normalised 0..1 progress of `f` across [a, b], clamped. */
export function seg(f: number, a: number, b: number): number {
  if (f <= a) return 0;
  if (f >= b) return 1;
  return (f - a) / (b - a);
}

/** 0..1 rising across [a,b] with cubic easing, clamped. */
export function appear(f: number, a: number, b: number): number {
  return interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
}
