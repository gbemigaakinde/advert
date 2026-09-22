import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * Shared animated background used behind every scene so the whole video
 * feels like one connected motion system instead of separate static
 * slides. Three layers, each drifting at a different speed for parallax:
 *  1. Two soft blurred "blob" shapes slowly floating
 *  2. A faint dot grid drifting diagonally
 *  3. A diagonal light sweep that glides through periodically
 */
export const SceneBackground: React.FC<{
  base: string;
  blobColorA: string;
  blobColorB: string;
  dotColor?: string;
}> = ({ base, blobColorA, blobColorB, dotColor = "rgba(255,255,255,0.06)" }) => {
  const frame = useCurrentFrame();

  const blobAX = 120 + Math.sin(frame / 55) * 60;
  const blobAY = 260 + Math.cos(frame / 70) * 50;
  const blobBX = 900 + Math.cos(frame / 60) * 70;
  const blobBY = 1500 + Math.sin(frame / 65) * 60;

  const gridShiftX = (frame * 0.4) % 90;
  const gridShiftY = (frame * 0.25) % 90;

  const sweepX = ((frame * 6) % 2600) - 800;

  const dots: React.ReactNode[] = [];
  for (let row = -1; row < 24; row++) {
    for (let col = -1; col < 14; col++) {
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={col * 90 + gridShiftX}
          cy={row * 90 + gridShiftY}
          r={2.5}
          fill={dotColor}
        />
      );
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: base, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 620,
          height: 620,
          borderRadius: "50%",
          left: blobAX - 310,
          top: blobAY - 310,
          background: blobColorA,
          filter: "blur(90px)",
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          left: blobBX - 350,
          top: blobBY - 350,
          background: blobColorB,
          filter: "blur(100px)",
          opacity: 0.45,
        }}
      />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {dots}
      </svg>
      <div
        style={{
          position: "absolute",
          top: -200,
          left: sweepX,
          width: 260,
          height: 2320,
          background:
            "linear-gradient(100deg, transparent, rgba(255,255,255,0.10), transparent)",
          transform: "rotate(18deg)",
        }}
      />
    </AbsoluteFill>
  );
};
