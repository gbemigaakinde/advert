import React from "react";
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

const TRANSITION_FRAMES = 15;

/**
 * 30-second advert.
 *
 * Scene durations total 1005 frames.
 * 7 transitions x 15 frames overlap = 105 frames.
 * 1005 - 105 = 900 frames = 30 seconds at 30fps.
 *
 * The existing composition dimensions and timing architecture are
 * intentionally preserved.
 */
export const FahmidAdvert: React.FC = () => {
  return (
    <TransitionSeries>
      {/* 0 — Brand hook */}
      <TransitionSeries.Sequence durationInFrames={100}>
        <LogoReveal />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-left" })}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      {/* 1 — Establish the school */}
      <TransitionSeries.Sequence durationInFrames={90}>
        <LocationEst />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      {/* 2 — Emotional promise */}
      <TransitionSeries.Sequence durationInFrames={130}>
        <Tagline />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-top" })}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      {/* 3 — Proof */}
      <TransitionSeries.Sequence durationInFrames={150}>
        <Stats />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-left" })}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      {/* 4 — What makes the school different */}
      <TransitionSeries.Sequence durationInFrames={120}>
        <Values />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      {/* 5 — Parent trust */}
      <TransitionSeries.Sequence durationInFrames={130}>
        <Testimonial />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      {/* 6 — The actual school experience */}
      <TransitionSeries.Sequence durationInFrames={110}>
        <Programs />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      {/* 7 — Conversion */}
      <TransitionSeries.Sequence durationInFrames={175}>
        <CallToAction />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
