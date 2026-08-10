import React from 'react';
import { AbsoluteFill, Audio, useVideoConfig } from 'remotion';
import { PALETTE } from './theme';
import { CaptionTrack } from './Caption';
import type { Beat } from './script';
import type { VisualProps, VisualModule } from './module';

export const VISUAL_TOP = 64;
export const VISUAL_LEFT = 76;
export const VISUAL_RIGHT = 76;
export const VISUAL_BOTTOM = 196;

/** Centring stage handed to every visual component. */
export function VisualStage({ children }: { children: React.ReactNode }) {
  // AbsoluteFill supplies its own `bottom: 0`, so passing `bottom` here does not
  // shorten the box — the stage ran to the frame edge and past it. An explicit
  // height is unambiguous, and it is what the centring below depends on.
  const { height: frameHeight } = useVideoConfig();
  return (
    <AbsoluteFill
      className="visual-stage"
      style={{
        top: VISUAL_TOP,
        left: VISUAL_LEFT,
        right: VISUAL_RIGHT,
        height: frameHeight - VISUAL_TOP - VISUAL_BOTTOM,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Visual components root themselves at `position: absolute; inset: 0`,
       * which fills this stage but escapes its flex centring — their content
       * then stacks from the top and leaves the bottom third of the frame
       * empty. Centring the stage's direct child puts that content back in
       * the middle without editing sixty-odd components. */}
      <style>{`.visual-stage > :not(style) {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }`}</style>
      {children}
    </AbsoluteFill>
  );
}

export function Beat({
  beat,
  audioSrc,
  showCaptions,
  Visual,
  module,
}: {
  beat: Beat;
  audioSrc?: string;
  showCaptions: boolean;
  Visual: React.ComponentType<VisualProps>;
  module?: VisualModule;
}) {
  const { fps } = useVideoConfig();
  const estimatedFrames = Math.round(beat.estSeconds * fps);

  // When the beat has no narration there is nothing to display during the
  // tail; pad the stage so it doesn't look empty — but the visual itself is
  // responsible for holding its own final state.
  return (
    <AbsoluteFill style={{ background: PALETTE.bg, overflow: 'hidden' }}>
      <style>{`* { box-sizing: border-box; }`}</style>
      <VisualStage>
        <Visual beat={beat} module={module} />
      </VisualStage>
      {showCaptions && <CaptionTrack beat={beat} />}
      {audioSrc !== undefined ? (
        <Audio src={audioSrc} />
      ) : (
        <FallbackAudioNote frames={estimatedFrames} />
      )}
    </AbsoluteFill>
  );
}

// No narration audio mounted yet — timing is driven by estSeconds. This is a
// silent placeholder so the structure is explicit.
function FallbackAudioNote({ frames }: { frames: number }) {
  void frames;
  return null;
}
