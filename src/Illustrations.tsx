import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "./theme";

// Deterministic pseudo-random (no Math.random - Remotion renders must be
// reproducible frame-by-frame) used only for confetti particle spread.
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- Illustration 1: Playground seesaw ----------
export const PlaygroundIllustration: React.FC<{ entrance: number }> = ({
  entrance,
}) => {
  const frame = useCurrentFrame();
  const tilt = Math.sin(frame / 20) * 12;
  const cloud1X = (frame * 0.6) % 500;
  const cloud2X = (frame * 0.4) % 500;

  return (
    <svg
      viewBox="0 0 700 500"
      width={620}
      style={{ opacity: entrance, transform: `scale(${entrance})` }}
    >
      {/* sun */}
      <circle cx="590" cy="80" r="46" fill={theme.gold} opacity={0.9} />
      {/* clouds */}
      <g opacity={0.8} transform={`translate(${cloud1X - 100},60)`}>
        <ellipse cx="0" cy="0" rx="40" ry="20" fill="#FFFFFF" />
        <ellipse cx="28" cy="-6" rx="26" ry="16" fill="#FFFFFF" />
      </g>
      <g opacity={0.6} transform={`translate(${cloud2X - 60},130)`}>
        <ellipse cx="0" cy="0" rx="30" ry="15" fill="#FFFFFF" />
      </g>
      {/* ground */}
      <rect x="0" y="430" width="700" height="70" fill={theme.accentPale} />
      {/* seesaw pivot */}
      <polygon points="330,430 370,430 350,390" fill={theme.accentMid} />
      {/* seesaw plank + riders, rotating around pivot */}
      <g transform={`rotate(${tilt} 350 400)`}>
        <rect x="180" y="392" width="340" height="16" rx="8" fill={theme.gold} />
        {/* left child */}
        <g transform="translate(210,340)">
          <circle cx="0" cy="0" r="26" fill="#F3C89A" />
          <rect x="-20" y="20" width="40" height="46" rx="14" fill={theme.accent} />
          <circle cx="-10" cy="-4" r="3" fill="#1A1A1A" />
          <circle cx="10" cy="-4" r="3" fill="#1A1A1A" />
          <path d="M -8 8 Q 0 14 8 8" stroke="#1A1A1A" strokeWidth="2" fill="none" />
        </g>
        {/* right child */}
        <g transform="translate(490,340)">
          <circle cx="0" cy="0" r="26" fill="#C98A5E" />
          <rect x="-20" y="20" width="40" height="46" rx="14" fill={theme.green} />
          <circle cx="-10" cy="-4" r="3" fill="#1A1A1A" />
          <circle cx="10" cy="-4" r="3" fill="#1A1A1A" />
          <path d="M -8 8 Q 0 14 8 8" stroke="#1A1A1A" strokeWidth="2" fill="none" />
        </g>
      </g>
    </svg>
  );
};

// ---------- Illustration 2: Reading under a tree ----------
export const ReadingIllustration: React.FC<{ entrance: number }> = ({
  entrance,
}) => {
  const frame = useCurrentFrame();
  const pageFlip = Math.sin(frame / 12);
  const birdX = (frame * 2.4) % 800;

  return (
    <svg
      viewBox="0 0 700 500"
      width={600}
      style={{ opacity: entrance, transform: `scale(${entrance})` }}
    >
      {/* birds */}
      <g transform={`translate(${birdX - 100},70)`} stroke="#FFFFFF" strokeWidth="3" fill="none">
        <path d="M0 0 Q 10 -10 20 0 Q 30 -10 40 0" />
      </g>
      <g transform={`translate(${birdX - 220},110)`} stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity={0.8}>
        <path d="M0 0 Q 8 -8 16 0 Q 24 -8 32 0" />
      </g>
      {/* tree */}
      <rect x="90" y="230" width="30" height="180" rx="8" fill="#8A5A3C" />
      <circle cx="105" cy="200" r="80" fill={theme.green} />
      <circle cx="60" cy="230" r="55" fill={theme.green} opacity={0.9} />
      <circle cx="150" cy="230" r="55" fill={theme.green} opacity={0.9} />
      {/* ground */}
      <rect x="0" y="410" width="700" height="90" fill={theme.accentPale} />
      {/* child sitting reading */}
      <g transform="translate(320,330)">
        <circle cx="0" cy="-40" r="30" fill="#E8B285" />
        <path d="M -30 -46 Q 0 -80 30 -46 L 26 -50 Q 0 -66 -26 -50 Z" fill={theme.accent} />
        <rect x="-38" y="-8" width="76" height="70" rx="22" fill={theme.accent} />
        {/* book */}
        <g transform="translate(0,20)">
          <path
            d={`M -34 0 Q 0 ${10 + pageFlip * 4} 34 0 L 34 26 Q 0 ${36 + pageFlip * 4} -34 26 Z`}
            fill="#FFFFFF"
          />
          <line x1="0" y1="2" x2="0" y2="28" stroke="#D8D8D8" strokeWidth="2" />
        </g>
      </g>
      {/* small flowers */}
      <g transform="translate(520,420)">
        <circle cx="0" cy="0" r="6" fill={theme.gold} />
        <circle cx="14" cy="4" r="5" fill="#E8546A" />
        <circle cx="-14" cy="6" r="5" fill={theme.gold} />
      </g>
    </svg>
  );
};

// ---------- Illustration 3: Classroom / chalkboard ----------
export const ClassroomIllustration: React.FC<{ entrance: number }> = ({
  entrance,
}) => {
  const frame = useCurrentFrame();
  const writeProgress = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pointerBob = Math.sin(frame / 10) * 4;

  return (
    <svg
      viewBox="0 0 700 500"
      width={640}
      style={{ opacity: entrance, transform: `scale(${entrance})` }}
    >
      {/* chalkboard */}
      <rect x="120" y="40" width="460" height="230" rx="14" fill={theme.green} />
      <rect x="120" y="40" width="460" height="230" rx="14" fill="none" stroke="#8A5A3C" strokeWidth="14" />
      <text
        x="160"
        y="150"
        fontSize="58"
        fontFamily="Georgia, serif"
        fill="#FFFFFF"
        opacity={writeProgress}
      >
        ABC · 123
      </text>
      <rect x="140" y="250" width="420" height="10" rx="4" fill="#8A5A3C" />
      {/* teacher */}
      <g transform={`translate(160,${340 + pointerBob})`}>
        <circle cx="0" cy="0" r="26" fill="#7A4B32" />
        <rect x="-22" y="24" width="44" height="60" rx="16" fill={theme.gold} />
        <rect x="-4" y="60" width="8" height="80" fill="#5A5A5A" transform="rotate(30 0 60)" />
      </g>
      {/* desks with pupils */}
      {[0, 1, 2].map((i) => {
        const bob = Math.sin(frame / 14 + i * 2) * 5;
        return (
          <g key={i} transform={`translate(${340 + i * 110},${360 + bob})`}>
            <circle cx="0" cy="0" r="20" fill={["#E8B285", "#C98A5E", "#F3C89A"][i]} />
            <rect x="-28" y="18" width="56" height="14" rx="4" fill={theme.accentMid} />
          </g>
        );
      })}
      {/* ground */}
      <rect x="0" y="420" width="700" height="80" fill={theme.accentPale} />
    </svg>
  );
};

// ---------- Illustration 4: Graduation pop ----------
export const GraduationIllustration: React.FC<{ entrance: number }> = ({
  entrance,
}) => {
  const frame = useCurrentFrame();
  const bounce = Math.sin(frame / 15) * 10;
  const capRotate = Math.sin(frame / 18) * 14;

  return (
    <svg
      viewBox="0 0 400 400"
      width={340}
      style={{ opacity: entrance, transform: `scale(${entrance})` }}
    >
      {/* stars */}
      {[0, 1, 2, 3].map((i) => {
        const twinkle = 0.4 + Math.abs(Math.sin(frame / 10 + i * 3)) * 0.6;
        const positions = [
          [50, 60],
          [340, 50],
          [30, 220],
          [360, 240],
        ];
        const [sx, sy] = positions[i];
        return (
          <text
            key={i}
            x={sx}
            y={sy}
            fontSize="30"
            fill={theme.gold}
            opacity={twinkle}
          >
            ★
          </text>
        );
      })}
      {/* child body */}
      <g transform={`translate(200,${230 + bounce})`}>
        <rect x="-34" y="0" width="68" height="80" rx="24" fill={theme.accent} />
        <circle cx="0" cy="-30" r="34" fill="#E8B285" />
        {/* graduation cap */}
        <g transform={`translate(0,-60) rotate(${capRotate})`}>
          <rect x="-6" y="0" width="12" height="16" fill="#2A2A2A" />
          <polygon points="-40,-6 40,-6 0,-26" fill="#2A2A2A" />
          <circle cx="0" cy="-26" r="5" fill={theme.gold} />
          <line x1="0" y1="-26" x2="30" y2="4" stroke={theme.gold} strokeWidth="2" />
          <circle cx="30" cy="6" r="5" fill={theme.gold} />
        </g>
      </g>
    </svg>
  );
};

// ---------- Confetti burst (deterministic, safe for re-rendering) ----------
export const ConfettiBurst: React.FC<{ startFrame: number; count?: number }> = ({
  startFrame,
  count = 26,
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  if (local < 0) return null;

  const colors = [theme.gold, theme.accentLight, "#FFFFFF", theme.green];
  const pieces = new Array(count).fill(0).map((_, i) => {
    const angle = (pseudoRandom(i) * 2 - 1) * Math.PI * 0.9 - Math.PI / 2;
    const speed = 6 + pseudoRandom(i + 50) * 7;
    const x = 540 + Math.cos(angle) * speed * local * 1.4;
    const y = 900 + Math.sin(angle) * speed * local * 1.4 + local * local * 0.12;
    const rotate = local * (6 + pseudoRandom(i + 100) * 10);
    const opacity = interpolate(local, [0, 10, 70, 95], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const size = 10 + pseudoRandom(i + 150) * 10;
    const color = colors[i % colors.length];

    return (
      <rect
        key={i}
        x={x}
        y={y}
        width={size}
        height={size * 0.5}
        fill={color}
        opacity={opacity}
        transform={`rotate(${rotate} ${x} ${y})`}
      />
    );
  });

  return (
    <svg
      viewBox="0 0 1080 1920"
      width={1080}
      height={1920}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {pieces}
    </svg>
  );
};
