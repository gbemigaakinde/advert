import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";

export const SceneBackground: React.FC<{
  base: string;
  blobColorA: string;
  blobColorB: string;
  dotColor?: string;
}> = ({
  base,
  blobColorA,
  blobColorB,
  dotColor = "rgba(255,255,255,0.06)",
}) => {
  const frame = useCurrentFrame();

  const driftA = Math.sin(frame / 48);
  const driftB = Math.cos(frame / 64);

  const blobAX = 120 + driftA * 90;
  const blobAY = 280 + driftB * 70;

  const blobBX = 930 + driftB * 100;
  const blobBY = 1510 + driftA * 90;

  const gridShiftX = (frame * 0.7) % 110;
  const gridShiftY = (frame * 0.42) % 110;

  const sweepProgress = (frame % 210) / 210;
  const sweepX = interpolate(
    sweepProgress,
    [0, 1],
    [-900, 2100]
  );

  const dots: React.ReactNode[] = [];

  for (let row = -2; row < 20; row++) {
    for (let col = -2; col < 13; col++) {
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={col * 110 + gridShiftX}
          cy={row * 110 + gridShiftY}
          r={2.2}
          fill={dotColor}
        />
      );
    }
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: base,
        overflow: "hidden",
      }}
    >
      {/* Large atmospheric glow */}
      <div
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          borderRadius: "50%",
          left: blobAX - 380,
          top: blobAY - 380,
          background: blobColorA,
          filter: "blur(115px)",
          opacity: 0.48,
          transform: `scale(${1 + driftA * 0.04})`,
        }}
      />

      {/* Secondary glow */}
      <div
        style={{
          position: "absolute",
          width: 820,
          height: 820,
          borderRadius: "50%",
          left: blobBX - 410,
          top: blobBY - 410,
          background: blobColorB,
          filter: "blur(125px)",
          opacity: 0.42,
          transform: `scale(${1 + driftB * 0.05})`,
        }}
      />

      {/* Moving dot field */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.75,
        }}
      >
        {dots}
      </svg>

      {/* Slow diagonal light sweep */}
      <div
        style={{
          position: "absolute",
          top: -300,
          left: sweepX,
          width: 320,
          height: 2500,
          background:
            "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.03) 60%, transparent 100%)",
          transform: "rotate(17deg)",
          opacity: 0.7,
        }}
      />

      {/* Soft vignette gives the composition more depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.08) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
