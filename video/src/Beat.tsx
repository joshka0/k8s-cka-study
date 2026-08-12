import React from 'react';
import { AbsoluteFill, Audio, useVideoConfig } from 'remotion';
import { PALETTE } from './theme';
import { CaptionTrack } from './Caption';
import type { Beat } from './script';
import type { VisualProps, VisualModule } from './module';

export const STAGE_SCALE = 1.1;

export const VISUAL_TOP = 64;
export const VISUAL_LEFT = 76;
export const VISUAL_RIGHT = 76;
export const VISUAL_BOTTOM = 196;

/** Centring stage handed to every visual component. */
export function VisualStage({ children }: { children: React.ReactNode }) {
  // AbsoluteFill supplies its own `bottom: 0` AND `width: 100%`, so neither
  // `bottom` nor `right` constrains this box. Passing them left the stage
  // running past the frame on both axes: content sat in the top third, and was
  // centred 76px right of true centre. Both dimensions are explicit for that
  // reason — do not replace them with insets.
  const { width: frameWidth, height: frameHeight } = useVideoConfig();
  return (
    <AbsoluteFill
      className="visual-stage"
      style={{
        top: VISUAL_TOP,
        left: VISUAL_LEFT,
        width: frameWidth - VISUAL_LEFT - VISUAL_RIGHT,
        height: frameHeight - VISUAL_TOP - VISUAL_BOTTOM,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // Measured across module 01: the visuals covered 1.4%–8% of the frame
        // in ink, and their bounding box filled 4%–76% of this stage, with the
        // widest case reaching ~87% of the stage in each dimension. The design
        // was authored at web sizes and left roughly a third of the frame
        // height permanently empty. A uniform lift uses some of that space and
        // enlarges every component's text with it, without touching sixty-odd
        // components' internal geometry. Keep the factor below the headroom
        // the widest beat leaves: 1.10 takes that case to ~96%.
        transform: `scale(${STAGE_SCALE})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Visual components root themselves at `position: absolute; inset: 0`,
       * which fills this stage but escapes its flex centring — their content
       * then stacks from the top and leaves the bottom third of the frame
       * empty. Centring the stage's direct child puts that content back in
       * the middle without editing sixty-odd components.
       *
       * Removing this rule was tried and measured: it fixes the components
       * that mix a flow header with an absolutely-positioned diagram, because
       * centring a lone flow header parks it in the middle of that diagram —
       * but it sends every flow-only component back to the top of the frame,
       * which is the exact defect this rule exists to prevent. Content in
       * module 01 moved from y304–687 to y64–495. The rule stays; a mixed
       * component fixes its own header by positioning it, as ComponentMap
       * now does. */}
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
