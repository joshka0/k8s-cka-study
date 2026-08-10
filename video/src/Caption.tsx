import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETTE } from './theme';
import { Label, SANS } from './ui';
import { laneColor, laneLabel } from './theme';
import type { Beat } from './script';

/** Longest chunk we will ever show at once, in words. Two lines at 26px. */
const MAX_CHUNK_WORDS = 20;

/**
 * Split narration into caption-sized chunks: sentence first, then at clause
 * boundaries if a sentence is too long to sit on two lines. Each chunk carries
 * the word offset it starts at, so highlighting stays aligned to the beat's
 * overall word-clock.
 */
function chunkNarration(text: string): { words: string[]; start: number }[] {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text];
  const chunks: { words: string[]; start: number }[] = [];
  let offset = 0;

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    if (!words.length) continue;

    if (words.length <= MAX_CHUNK_WORDS) {
      chunks.push({ words, start: offset });
      offset += words.length;
      continue;
    }

    // Too long for two lines — break at commas, then hard-wrap the remainder.
    let current: string[] = [];
    let currentStart = offset;
    let consumed = 0;
    for (const w of words) {
      current.push(w);
      consumed++;
      const atClause = /[,;:—]$/.test(w);
      if ((atClause && current.length >= 8) || current.length >= MAX_CHUNK_WORDS) {
        chunks.push({ words: current, start: currentStart });
        currentStart = offset + consumed;
        current = [];
      }
    }
    if (current.length) chunks.push({ words: current, start: currentStart });
    offset += words.length;
  }
  return chunks;
}

export function CaptionTrack({ beat }: { beat: Beat }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const allWords = beat.narration.split(/\s+/).filter(Boolean);
  const chunks = React.useMemo(() => chunkNarration(beat.narration), [beat.narration]);

  // Where the narrator is now, on the beat's word-clock.
  const spoken = (frame / Math.max(1, durationInFrames)) * allWords.length;

  // The chunk containing the current word; hold the last one through the tail.
  let index = chunks.findIndex(
    (c, i) => spoken < c.start + c.words.length || i === chunks.length - 1
  );
  if (index < 0) index = chunks.length - 1;
  const chunk = chunks[index];

  const stage = beat.stage;
  const lane = beat.lane;

  return (
    <div
      style={{
        position: 'absolute',
        left: 140,
        right: 140,
        bottom: 46,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {(stage !== null || lane) && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          {stage !== null && (
            <Label color={laneColor(lane)} size={12}>
              Stage {stage}
              {lane ? ` · ${laneLabel(lane)}` : ''}
            </Label>
          )}
          {stage === null && lane && (
            <Label color={laneColor(lane)} size={12}>
              {laneLabel(lane)}
            </Label>
          )}
        </div>
      )}

      <div
        style={{
          fontFamily: SANS,
          fontSize: 26,
          lineHeight: 1.4,
          fontWeight: 500,
          textAlign: 'center',
          textWrap: 'balance',
          maxWidth: 1400,
          textShadow: '0 2px 18px rgba(11,17,29,0.95)',
        }}
      >
        {chunk.words.map((w, i) => {
          const spokenHere = chunk.start + i < spoken;
          return (
            <span
              key={i}
              style={{
                color: spokenHere ? PALETTE.ink : PALETTE.muted,
                opacity: spokenHere ? 1 : 0.5,
                transition: 'none',
              }}
            >
              {w}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
}
