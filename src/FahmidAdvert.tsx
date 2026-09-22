import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
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

// Each entry: [Component, durationInFrames]
// Total must add up to the Root.tsx duration (900 frames / 30s at 30fps)
const scenes: Array<{ Component: React.FC; duration: number }> = [
  { Component: LogoReveal, duration: 90 }, // 0:00 - 0:03
  { Component: LocationEst, duration: 90 }, // 0:03 - 0:06
  { Component: Tagline, duration: 120 }, // 0:06 - 0:10
  { Component: Stats, duration: 150 }, // 0:10 - 0:15
  { Component: Values, duration: 120 }, // 0:15 - 0:19
  { Component: Testimonial, duration: 120 }, // 0:19 - 0:23
  { Component: Programs, duration: 90 }, // 0:23 - 0:26
  { Component: CallToAction, duration: 120 }, // 0:26 - 0:30
];

// Wraps a scene with a quick fade-in / fade-out so cuts aren't jarring
const FadeWrap: React.FC<{ duration: number; children: React.ReactNode }> = ({
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const fadeFrames = 10;
  const opacity = interpolate(
    frame,
    [0, fadeFrames, duration - fadeFrames, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const FahmidAdvert: React.FC = () => {
  let cursor = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      {scenes.map(({ Component, duration }, i) => {
        const from = cursor;
        cursor += duration;
        return (
          <Sequence key={i} from={from} durationInFrames={duration}>
            <FadeWrap duration={duration}>
              <Component />
            </FadeWrap>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
