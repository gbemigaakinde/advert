import React from "react";

export type Mood = "calm" | "oops" | "smile";
type Props = { frame: number; talking: boolean; mood?: Mood; point?: boolean };

const SKIN = "#8A5233";
const HAIR = "#15110F";
const NAVY = "#1B3A7A";
const GOLD = "#C89F4D";

// Amina: one reusable mascot. Hair in two buns, navy school sweater, gold crest, red pencil.
export const Mascot: React.FC<Props> = ({ frame, talking, mood = "calm", point = false }) => {
  const blink = frame % 120 < 5 ? 0.1 : 1;
  const open = talking ? 4 + Math.abs(Math.sin(frame * 0.8)) * 11 : 0;
  const mouth =
    open > 0 ? (
      <ellipse cx="200" cy="306" rx="14" ry={open} fill="#3A1410" />
    ) : mood === "oops" ? (
      <ellipse cx="200" cy="308" rx="8" ry="11" fill="#3A1410" />
    ) : (
      <path d="M178 300 Q200 322 222 300" stroke="#3A1410" strokeWidth="6" fill="none" strokeLinecap="round" />
    );
  const brow = mood === "oops" ? -10 : 0;
  const bob = Math.sin(frame * 0.08) * 3;
  return (
    <svg viewBox="0 0 400 520" width="100%" height="100%" style={{ overflow: "visible" }}>
      {/* body */}
      <path d="M20 520 C20 420 100 380 200 380 C300 380 380 420 380 520Z" fill={NAVY} />
      <path d="M168 380 Q200 410 232 380" stroke="#fff" strokeWidth="6" fill="none" opacity="0.9" />
      <circle cx="262" cy="448" r="17" fill={GOLD} /><text x="262" y="455" textAnchor="middle" fontSize="20" fontWeight="700" fill={NAVY} fontFamily="Georgia, serif">F</text>
      {/* pencil hand (left side, held upright) */}
      <g transform={point ? `rotate(-52 330 450)` : ""}>
        <path d="M352 420 L372 420 L372 500 L362 520 L352 500Z" fill="#D8432F" transform="translate(-6 -40)" />
        <path d="M352 380 L372 380 L372 420 L352 420Z" fill="#F0C9A4" transform="translate(-6 0)" />
        <path d="M352 380 L362 362 L372 380Z" fill="#2B2B2B" transform="translate(-6 0)" />
        <path d="M300 520 C300 470 330 440 350 430 L366 470 C348 480 340 500 342 520Z" fill={NAVY} />
        <circle cx="352" cy="436" r="19" fill={SKIN} />
      </g>
      {/* neck + head */}
      <rect x="176" y="326" width="48" height="62" rx="18" fill={SKIN} />
      <g transform={`translate(0 ${bob})`}>
        <circle cx="128" cy="116" r="44" fill={HAIR} /><circle cx="272" cy="116" r="44" fill={HAIR} />
        <ellipse cx="200" cy="244" rx="92" ry="100" fill={SKIN} />
        <path d="M108 232 C106 128 294 128 292 232 C268 180 240 168 200 170 C160 168 132 180 108 232Z" fill={HAIR} />
        <g transform={`translate(0 ${brow})`}>
          <path d="M146 214 Q164 204 184 212" stroke={HAIR} strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M216 212 Q236 204 254 214" stroke={HAIR} strokeWidth="7" fill="none" strokeLinecap="round" />
        </g>
        <g style={{ transformOrigin: "200px 250px", transform: `scaleY(${blink})` }}>
          <ellipse cx="164" cy="250" rx="16" ry="20" fill="#fff" /><circle cx="166" cy="252" r="9" fill={HAIR} /><circle cx="170" cy="247" r="3" fill="#fff" />
          <ellipse cx="236" cy="250" rx="16" ry="20" fill="#fff" /><circle cx="238" cy="252" r="9" fill={HAIR} /><circle cx="242" cy="247" r="3" fill="#fff" />
        </g>
        <circle cx="138" cy="288" r="14" fill="#E0735A" opacity="0.3" /><circle cx="262" cy="288" r="14" fill="#E0735A" opacity="0.3" />
        {mouth}
      </g>
    </svg>
  );
};
