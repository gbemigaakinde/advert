import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "@fontsource/dm-serif-display/latin-400.css";
import "@fontsource/dm-serif-display/latin-400-italic.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-700.css";
import { theme } from "../theme";
import { Mascot } from "./Mascots";
import data from "../../narration/grammar.json";

export const GFPS = 30;
export const GTOTAL = Math.round(data.total * GFPS);
const SERIF = "'DM Serif Display', Georgia, serif";
const SANS = "'DM Sans', Arial, sans-serif";
const RED = "#C8341F";

export type Timing = { voiced: boolean; lines: Record<string, { at: number; dur: number; who: string }> };

export const fallbackTiming = (): Timing => {
  const lines: Timing["lines"] = {};
  data.scenes.forEach((sc) => sc.say.forEach((s, k) => {
    lines[`${sc.id}_${k}`] = { at: sc.start + s.at, dur: Math.max(1, s.text.split(/\s+/).length / 2.6), who: s.who };
  }));
  return { voiced: false, lines };
};

const MISTAKES = [
  { wrongSentence: ["", "Your", " welcome!"], right: "You're", rule: ["You're = you are.", "Say it in full. If it fits, keep the apostrophe."], chip: "your / you're" },
  { wrongSentence: ["I could ", "of", " gone."], right: "have", rule: ["Could have. Would have. Should have.", "\u2019ve sounds like \u201cof\u201d. It isn\u2019t."], chip: "could of" },
  { wrongSentence: ["Taller ", "then", " me."], right: "than", rule: ["Than compares.", "Then is time: first this, then that."], chip: "then / than" },
  { wrongSentence: ["Don\u2019t ", "loose", " your phone."], right: "lose", rule: ["Lose has lost an O.", "Loose is the one with the extra O, like a loose tie."], chip: "lose / loose" },
];

const pop = (frame: number, delay: number, fps: number) =>
  spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 150, mass: 0.7 } });

const Bg: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <AbsoluteFill style={{ background: dark ? theme.accent : theme.surfaceWarm }}>
    <div style={{ position: "absolute", top: -260, right: -220, width: 700, height: 700, borderRadius: "50%", background: dark ? theme.accentMid : theme.accentPale, opacity: 0.9 }} />
    <div style={{ position: "absolute", top: 1040, left: -300, width: 640, height: 640, borderRadius: "50%", background: dark ? "rgba(200,159,77,0.16)" : theme.goldLight, opacity: 0.55 }} />
  </AbsoluteFill>
);

const Stage: React.FC<{ start: number; timing: Timing; amina?: any; tobi?: any }> = ({ start, timing, amina, tobi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (start + f) / fps;
  const talker = Object.values(timing.lines).find((l) => t >= l.at && t <= l.at + l.dur)?.who;
  const enter = (d: number) => interpolate(spring({ frame: f - d, fps, config: { damping: 16 } }), [0, 1], [380, 0]);
  return (
    <>
      <div style={{ position: "absolute", left: -10, bottom: -80, width: 560, height: 728, transform: `translateY(${enter(2) + Math.sin(f * 0.07) * 5}px)` }}>
        <Mascot kind="tobi" frame={f} talking={talker === "tobi"} {...tobi} />
      </div>
      <div style={{ position: "absolute", right: -10, bottom: -80, width: 560, height: 728, transform: `translateY(${enter(8) + Math.sin(f * 0.07 + 2) * 5}px)` }}>
        <Mascot kind="amina" frame={f} talking={talker === "amina"} {...amina} />
      </div>
    </>
  );
};

const Hook: React.FC<{ timing: Timing }> = ({ timing }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = pop(f, 6, fps), b = pop(f, 30, fps);
  const chips = ["Your welcome!", "I could of gone.", "Taller then me.", "Don\u2019t loose it."];
  return (
    <AbsoluteFill>
      <Bg />
      <div style={{ position: "absolute", top: 210, left: 70, right: 70, textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: 190, color: theme.accent, lineHeight: 1, transform: `scale(${0.6 + 0.4 * a})`, opacity: a }}>Be honest.</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 70, color: theme.text, marginTop: 40, lineHeight: 1.2, opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>
          How many of these did you type this week?
        </div>
      </div>
      <div style={{ position: "absolute", top: 760, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 26 }}>
        {chips.map((c, i) => {
          const p = pop(f, 66 + i * 15, fps);
          return (
            <div key={c} style={{ alignSelf: i % 2 ? "flex-end" : "flex-start", background: i % 2 ? theme.goldLight : "#fff", border: `3px solid ${theme.accentPale}`, borderRadius: 34, padding: "20px 40px", fontFamily: SANS, fontWeight: 700, fontSize: 56, color: theme.text, boxShadow: "0 12px 30px rgba(27,58,122,0.12)", transform: `scale(${p}) rotate(${(i % 2 ? 1 : -1) * 1.5}deg)`, opacity: p }}>
              {c}
            </div>
          );
        })}
      </div>
      <Stage start={0} timing={timing} tobi={{ mood: "oops" }} amina={{ mood: "smug" }} />
    </AbsoluteFill>
  );
};

const Mistake: React.FC<{ idx: number; start: number; timing: Timing }> = ({ idx, start, timing }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const m = MISTAKES[idx];
  const chipP = pop(f, 3, fps), bubble = pop(f, 45, fps);
  const strike = interpolate(f, [100, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fix = pop(f, 104, fps), rule = pop(f, 132, fps);
  const [pre, wrong, post] = m.wrongSentence;
  return (
    <AbsoluteFill>
      <Bg />
      <div style={{ position: "absolute", top: 120, left: 70, right: 70, display: "flex", alignItems: "center", gap: 18, opacity: chipP, transform: `translateY(${(1 - chipP) * -30}px)` }}>
        <div style={{ background: theme.accent, color: "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 38, letterSpacing: 3, padding: "14px 30px", borderRadius: 60 }}>MISTAKE {idx + 1} OF 4</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[0, 1, 2, 3].map((i) => (<div key={i} style={{ width: 20, height: 20, borderRadius: 10, background: i <= idx ? theme.gold : "#D9DEE9" }} />))}
        </div>
      </div>

      <div style={{ position: "absolute", top: 300, left: 60, width: 880, transform: `scale(${bubble}) translateY(${(1 - bubble) * 40}px)`, transformOrigin: "left bottom", opacity: bubble }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: theme.goldDark, marginBottom: 12, marginLeft: 20 }}>Tobi</div>
        <div style={{ background: "#fff", borderRadius: "36px 36px 36px 8px", padding: "150px 50px 56px", boxShadow: "0 18px 50px rgba(27,58,122,0.16)", border: `3px solid ${theme.accentPale}`, position: "relative" }}>
          <div style={{ fontFamily: SERIF, fontSize: 104, color: theme.text, lineHeight: 1.2, textAlign: "left" }}>
            {pre}
            <span style={{ position: "relative", display: "inline-block", color: f > 100 ? "#A0392A" : theme.text }}>
              {wrong}
              <span style={{ position: "absolute", left: -6, right: -6, top: "54%", height: 9, background: RED, borderRadius: 5, transformOrigin: "left", transform: `scaleX(${strike})` }} />
              <span style={{ position: "absolute", left: "50%", bottom: "108%", transform: `translateX(-50%) scale(${fix}) rotate(-4deg)`, fontStyle: "italic", color: theme.green, whiteSpace: "nowrap", opacity: fix, background: "#E6F5EE", borderRadius: 20, padding: "0 22px", fontSize: 96, lineHeight: 1.15 }}>{m.right}</span>
            </span>
            {post}
          </div>
          <div style={{ position: "absolute", right: 36, bottom: 14, fontFamily: SANS, fontSize: 28, color: "#8A93A8" }}>14:02 &#10003;&#10003;</div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 880, right: 60, width: 800, transform: `scale(${rule}) translateY(${(1 - rule) * 40}px)`, transformOrigin: "right top", opacity: rule }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: theme.accent, marginBottom: 12, marginRight: 20, textAlign: "right" }}>Amina</div>
        <div style={{ background: theme.accent, borderRadius: "36px 36px 8px 36px", padding: "44px 52px", boxShadow: "0 18px 50px rgba(27,58,122,0.28)" }}>
          <div style={{ fontFamily: SERIF, fontSize: 68, color: "#fff", lineHeight: 1.15 }}>{m.rule[0]}</div>
          <div style={{ fontFamily: SANS, fontSize: 44, color: theme.goldLight, marginTop: 18, lineHeight: 1.3 }}>{m.rule[1]}</div>
        </div>
      </div>
      <Stage start={start} timing={timing} tobi={{ mood: f > 100 ? "oops" : "smile" }} amina={{ mood: f > 100 ? "smile" : "smug" }} />
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ start: number; timing: Timing }> = ({ start, timing }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = pop(f, 6, fps), b = pop(f, 60, fps), c = pop(f, 110, fps);
  return (
    <AbsoluteFill>
      <Bg dark />
      <div style={{ position: "absolute", top: 170, left: 70, right: 70, textAlign: "center" }}>
        <div style={{ opacity: a, transform: `scale(${0.7 + 0.3 * a})` }}>
          <div style={{ display: "inline-block", background: "#fff", borderRadius: 40, padding: 24 }}><Img src={staticFile("logo.png")} style={{ height: 170, display: "block" }} /></div>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 104, color: "#fff", lineHeight: 1.08, marginTop: 44, opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>
          Good grammar<br />starts young.
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, color: theme.goldLight, marginTop: 30, opacity: b }}>Fahmid Nursery &amp; Primary School</div>
      </div>
      <div style={{ position: "absolute", top: 930, left: 90, right: 90, textAlign: "center", opacity: c, transform: `translateY(${(1 - c) * 30}px)` }}>
        <div style={{ display: "inline-block", background: theme.gold, color: "#1A1A1A", fontFamily: SANS, fontWeight: 700, fontSize: 46, padding: "20px 48px", borderRadius: 60 }}>Admissions now open</div>
        <div style={{ fontFamily: SANS, fontSize: 46, color: "#fff", marginTop: 30 }}>fahmidschool.com.ng</div>
        <div style={{ fontFamily: SANS, fontSize: 46, color: "#fff", marginTop: 8 }}>+234 806 142 7297</div>
      </div>
      <Stage start={start} timing={timing} tobi={{ wave: true }} amina={{ wave: true }} />
    </AbsoluteFill>
  );
};

export const GrammarShort: React.FC<{ timing: Timing }> = ({ timing }) => {
  const S = data.scenes;
  const fr = (s: number) => Math.round(s * GFPS);
  return (
    <AbsoluteFill>
      {timing.voiced && <Audio src={staticFile("grammar/voice.mp3")} />}
      {!timing.voiced && <Audio src={staticFile("grammar/voice.mp3")} volume={0.6} />}
      <Sequence from={fr(S[0].start)} durationInFrames={fr(S[0].dur)}><Hook timing={timing} /></Sequence>
      {[1, 2, 3, 4].map((i) => (
        <Sequence key={i} from={fr(S[i].start)} durationInFrames={fr(S[i].dur)}><Mistake idx={i - 1} start={fr(S[i].start)} timing={timing} /></Sequence>
      ))}
      <Sequence from={fr(S[5].start)} durationInFrames={GTOTAL - fr(S[5].start)}><Outro start={fr(S[5].start)} timing={timing} /></Sequence>
    </AbsoluteFill>
  );
};
