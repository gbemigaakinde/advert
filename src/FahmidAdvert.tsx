import React from "react";
import { Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import {
  LogoReveal,
  LocationEst,
  Tagline,
  Stats,
  Values,
  Testimonial,
  Programs,
  CallToAction,
} from "./Scenes";

// Durations below the scenes (before transitions eat into them) sum to
// 1005 frames; 7 transitions x 15 frames of overlap = 105 frames removed,
// giving a final composition length of 900 frames (30s at 30fps) - this
// MUST match the durationInFrames set in Root.tsx.
const TRANSITION_FRAMES = 15;

export const FahmidAdvert: React.FC = () => {
  return (
    <>
      {/*
        VOICEOVER: once you have a recording, save it as
        public/voiceover.mp3 and uncomment the line below. See
        VOICEOVER_SCRIPT.md for a script timed to match each scene.
      */}
      <Audio src={staticFile("voiceover.mp3")} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={100}>
          <LogoReveal />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        <TransitionSeries.Sequence durationInFrames={90}>
          <LocationEst />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        <TransitionSeries.Sequence durationInFrames={130}>
          <Tagline />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-top" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Stats />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        <TransitionSeries.Sequence durationInFrames={120}>
          <Values />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        <TransitionSeries.Sequence durationInFrames={130}>
          <Testimonial />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        <TransitionSeries.Sequence durationInFrames={110}>
          <Programs />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        <TransitionSeries.Sequence durationInFrames={175}>
          <CallToAction />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
