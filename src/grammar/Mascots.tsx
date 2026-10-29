import React from "react";

type Mood = "smile" | "oops" | "smug";
type Props = { kind: "amina" | "tobi"; frame: number; talking: boolean; mood?: Mood; wave?: boolean };

const SKIN = { amina: "#8D5A3B", tobi: "#6B4228" };

export const Mascot: React.FC<Props> = ({ kind, frame, talking, mood = "smile", wave = false }) => {
  const skin = SKIN[kind];
  const blink = (frame + (kind === "tobi" ? 40 : 0)) % 110 < 5 ? 0.1 : 1;
  const mouthOpen = talking ? 5 + Math.abs(Math.sin(frame * 0.85)) * 15 : 0;
  const browLift = mood === "oops" ? -12 : 0;
  const mouth =
    mouthOpen > 0 ? (
      <ellipse cx="200" cy="302" rx="22" ry={mouthOpen} fill="#3A1410" />
    ) : mood === "oops" ? (
      <path d="M176 306 Q188 296 200 306 T224 306" stroke="#3A1410" strokeWidth="6" fill="none" strokeLinecap="round" />
    ) : mood === "smug" ? (
      <path d="M178 300 Q205 318 228 296" stroke="#3A1410" strokeWidth="6" fill="none" strokeLinecap="round" />
    ) : (
      <path d="M176 298 Q200 322 224 298" stroke="#3A1410" strokeWidth="6" fill="none" strokeLinecap="round" />
    );

  return (
    <svg viewBox="0 0 400 520" width="100%" height="100%" style={{ overflow: "visible" }}>
      {kind === "amina" ? (
        <>
          <path d="M200 80 C105 80 78 170 82 250 C85 330 55 370 30 440 L370 440 C345 370 315 330 318 250 C322 170 295 80 200 80Z" fill="#1B3A7A" />
          <path d="M30 520 C30 420 110 372 200 372 C290 372 370 420 370 520Z" fill="#0E7A4F" />
          <path d="M120 380 Q200 440 280 380 L300 400 Q200 470 100 400Z" fill="#1B3A7A" />
        </>
      ) : (
        <>
          <path d="M30 520 C30 420 110 372 200 372 C290 372 370 420 370 520Z" fill="#2451A8" />
          <path d="M165 372 L200 440 L235 372Z" fill="#FFFFFF" />
          <path d="M192 410 L208 410 L214 470 L200 486 L186 470Z" fill="#C89F4D" />
        </>
      )}
      <rect x="172" y="320" width="56" height="66" rx="20" fill={skin} />
      {kind === "tobi" && (<><circle cx="113" cy="262" r="17" fill={skin} /><circle cx="287" cy="262" r="17" fill={skin} /></>)}
      <ellipse cx="200" cy="248" rx="88" ry="98" fill={skin} />
      {kind === "amina" ? (
        <>
          <path d="M108 235 C110 140 290 140 292 235 C262 188 138 188 108 235Z" fill="#1B3A7A" />
          <path d="M112 232 C118 160 282 160 288 232" stroke="#C89F4D" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <path d="M110 232 C104 128 296 128 290 232 C276 186 242 176 200 186 C158 176 124 186 110 232Z" fill="#17120F" />
      )}
      <g transform={`translate(0 ${browLift})`}>
        <path d="M148 218 Q166 208 184 216" stroke="#17120F" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d={mood === "smug" ? "M216 204 Q236 196 254 212" : "M216 216 Q234 208 252 218"} stroke="#17120F" strokeWidth="7" fill="none" strokeLinecap="round" />
      </g>
      <g style={{ transformOrigin: "200px 252px", transform: `scaleY(${blink})` }}>
        <ellipse cx="166" cy="252" rx="15" ry="19" fill="#fff" /><circle cx="168" cy="254" r="9" fill="#17120F" /><circle cx="171" cy="250" r="3" fill="#fff" />
        <ellipse cx="234" cy="252" rx="15" ry="19" fill="#fff" /><circle cx="236" cy="254" r="9" fill="#17120F" /><circle cx="239" cy="250" r="3" fill="#fff" />
      </g>
      <circle cx="140" cy="290" r="14" fill="#E0735A" opacity="0.28" />
      <circle cx="260" cy="290" r="14" fill="#E0735A" opacity="0.28" />
      {mouth}
      {mood === "oops" && <path d="M290 190 q12 22 0 34 q-14 -12 0 -34Z" fill="#8EC5FF" opacity={0.5 + 0.4 * Math.sin(frame * 0.2)} />}
      {wave && (
        <g style={{ transformOrigin: "345px 470px", transform: `rotate(${Math.sin(frame * 0.35) * 18}deg)` }}>
          <rect x="330" y="360" width="34" height="120" rx="17" fill={kind === "amina" ? "#0E7A4F" : "#2451A8"} />
          <circle cx="347" cy="352" r="26" fill={skin} />
        </g>
      )}
    </svg>
  );
};
