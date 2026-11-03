import React from "react";

export type Mood = "calm" | "oops" | "smile";
// mouth: driven by the real narration audio (see narration/build_grammar_audio.py).
//   open: 0 = lips shut .. 1 = fully open     wide: 0 = round "oo/oh" shape .. 1 = wide "ee/s" shape
// When it is not given (voice not built yet), the mouth falls back to a soft syllable rhythm.
export type Mouth = { open: number; wide: number };
type Props = { frame: number; talking: boolean; mood?: Mood; point?: boolean; mouth?: Mouth };

const SKIN = "#8A5233";
const HAIR = "#15110F";
const NAVY = "#1B3A7A";
const GOLD = "#C89F4D";

const MOUTH = "#3A1410";

// One continuous mouth shape: shut = the smile line, opening = the lips part and the corners come in or out.
const TalkingMouth: React.FC<{ open: number; wide: number; mood: Mood }> = ({ open, wide, mood }) => {
  const cx = 200, cy = 300;
  const hw = 22 - open * (1 - wide) * 12;                       // half-width: round sounds pull the corners in
  const yc = cy + open * 6;                                      // corners drop a little as the jaw opens
  const closedMid = mood === "oops" ? 305 : mood === "smile" ? 313 : 311;
  const topMid = closedMid - open * 9;
  const botMid = closedMid + open * 22;
  const topCtl = 2 * topMid - yc, botCtl = 2 * botMid - yc;      // quadratic curves pass halfway to their control point
  const x1 = cx - hw, x2 = cx + hw;
  const d = `M${x1} ${yc} Q${cx} ${topCtl} ${x2} ${yc} Q${cx} ${botCtl} ${x1} ${yc}Z`;
  return (
    <g>
      <defs><clipPath id="mouthClip"><path d={d} /></clipPath></defs>
      <path d={d} fill={MOUTH} stroke={MOUTH} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
      <g clipPath="url(#mouthClip)">
        {open > 0.25 && <rect x={cx - 30} y={topMid - 2} width={60} height={4 + open * 5} rx={3} fill="#fff" opacity={0.92} />}
        {open > 0.2 && <ellipse cx={cx} cy={botMid + 1} rx={hw * 0.6} ry={4 + open * 7} fill="#C9585A" />}
      </g>
    </g>
  );
};

// Amina: one reusable mascot. Hair in two buns, navy school sweater, gold crest, red pencil.
export const Mascot: React.FC<Props> = ({ frame, talking, mood = "calm", point = false, mouth: m }) => {
  const blink = frame % 120 < 5 ? 0.1 : 1;
  let mo: Mouth | null = null;
  if (talking) {
    // Real audio values when we have them. Otherwise a gentle fallback (about 4 syllables a second).
    mo = m ?? { open: Math.abs(Math.sin((frame * Math.PI) / 6.5)) * (0.55 + 0.45 * Math.sin(frame * 0.13) ** 2), wide: 0.5 };
  }
  const mouth =
    mo ? (
      <TalkingMouth open={mo.open} wide={mo.wide} mood={mood} />
    ) : mood === "oops" ? (
      <ellipse cx="200" cy="308" rx="8" ry="11" fill={MOUTH} />
    ) : (
      <path d="M178 300 Q200 322 222 300" stroke={MOUTH} strokeWidth="6" fill="none" strokeLinecap="round" />
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
