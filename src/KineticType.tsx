import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Animates each word of a line in with a scale + rotate "pop" (spring
 * overshoot) staggered word by word - the kinetic-typography technique
 * used in most modern brand/ad motion design, instead of a flat fade.
 */
export const KineticLine: React.FC<{
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight?: number;
  perWordDelay?: number;
  startFrame?: number;
  align?: "center" | "left";
}> = ({
  text,
  fontSize,
  color,
  fontFamily,
  fontWeight = 700,
  perWordDelay = 6,
  startFrame = 0,
  align = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        textAlign: align,
      }}
    >
      {words.map((word, i) => {
        const localFrame = Math.max(
          0,
          frame - startFrame - i * perWordDelay
        );
        const scale = spring({
          frame: localFrame,
          fps,
          config: { damping: 10, mass: 0.6, stiffness: 140 },
        });
        const rotate = interpolate(scale, [0, 1], [8, 0]);
        const opacity = interpolate(localFrame, [0, 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily,
              fontSize,
              fontWeight,
              color,
              opacity,
              transform: `scale(${scale}) rotate(${rotate}deg)`,
              marginRight: fontSize * 0.24,
              lineHeight: 1.2,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/** A gold bar that sweeps in from the left to underline/highlight text */
export const SweepUnderline: React.FC<{
  width: number;
  color: string;
  startFrame?: number;
  height?: number;
}> = ({ width, color, startFrame = 0, height = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - startFrame);
  const progress = spring({
    frame: local,
    fps,
    config: { damping: 16, mass: 0.7 },
  });

  return (
    <div
      style={{
        width: width * Math.min(progress, 1),
        height,
        borderRadius: height / 2,
        backgroundColor: color,
      }}
    />
  );
};
