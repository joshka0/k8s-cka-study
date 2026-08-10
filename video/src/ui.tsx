import React from 'react';
import { PALETTE } from './theme';

export const SANS =
  "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const MONO =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

type BoxProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  bg?: string;
  border?: number | string;
  borderColor?: string;
  radius?: number;
  pad?: number;
  mono?: boolean;
  color?: string;
};

/** A rounded "unit" panel — the course's `.unit` look. */
export function Box({
  children,
  style,
  bg = PALETTE.panel,
  border = 1,
  borderColor,
  radius = 18,
  pad = 14,
  mono = false,
  color,
}: BoxProps) {
  return (
    <div
      style={{
        // Without this, `width: '100%'` on a Box overflows its parent by
        // padding + border — which pushed whole lane bars off the frame.
        boxSizing: 'border-box',
        background: bg,
        border: border ? `${typeof border === 'number' ? border : 1}px solid ${borderColor ?? PALETTE.line}` : 'none',
        borderRadius: radius,
        padding: pad,
        color: color ?? PALETTE.ink,
        fontFamily: mono ? MONO : SANS,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Horizontal({
  children,
  gap = 14,
  center = false,
  wrap = false,
  style,
}: {
  children?: React.ReactNode;
  gap?: number;
  center?: boolean;
  wrap?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap,
        alignItems: center ? 'center' : 'flex-start',
        justifyContent: center ? 'center' : 'flex-start',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Vertical({
  children,
  gap = 10,
  center = false,
  style,
}: {
  children?: React.ReactNode;
  gap?: number;
  center?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        alignItems: center ? 'center' : 'flex-start',
        justifyContent: center ? 'center' : 'flex-start',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Label({
  children,
  color = PALETTE.muted,
  size = 13,
  letter = 0.12,
  style,
  weight = 800,
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  letter?: number;
  style?: React.CSSProperties;
  weight?: number;
}) {
  return (
    <div
      style={{
        color,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: letter,
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function ArrowGlyph({
  color = PALETTE.blue,
  deg = 0,
  size = 22,
  style,
}: {
  color?: string;
  deg?: number;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        color,
        fontSize: size,
        lineHeight: 1,
        transform: `rotate(${deg}deg)`,
        display: 'inline-block',
        ...style,
      }}
    >
      →
    </span>
  );
}

export function Dot({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        flex: '0 0 auto',
      }}
    />
  );
}

export function PulseDot({ color, on, size = 12 }: { color: string; on: boolean; size?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        opacity: on ? 1 : 0.2,
        boxShadow: on ? `0 0 12px ${color}` : 'none',
        flex: '0 0 auto',
        transition: 'opacity 80ms linear',
      }}
    />
  );
}
