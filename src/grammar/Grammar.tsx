import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "@fontsource/dm-serif-display/latin-400.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-700.css";
import { theme } from "../theme";
import { Mascot, Mood } from "./Mascots";
import data from "../../narration/grammar.json";

export const GFPS = 30;
export const GTOTAL = Math.round(data.total * GFPS);
const SERIF = "'DM Serif Display', Georgia, serif";
const SANS = "'DM Sans', Arial, sans-serif";
const RED = "#D63B3B";
const INK = "#16213E";
const GREEN = theme.green;

export type Timing = { built?: boolean; voiced: boolean; lines: Record<string, { at: number; dur: number; who: string }> };

export const fallbackTiming = (): Timing => {
  const lines: Timing["lines"] = {};
  data.scenes.forEach((sc) => sc.say.forEach((s, k) => {
    lines[`${sc.id}_${k}`] = { at: sc.start + s.at, dur: Math.max(1, s.text.split(/\s+/).length / 2.6), who: s.who };
  }));
  return { voiced: false, lines };
};

type Part = { t: string; bad?: boolean; hl?: boolean };
const MISTAKES: { id: string; wrong: Part[]; right: Part[]; rows: [string, string][]; tag: string; bubble: string }[] = [
  { id: "m1",
    wrong: [{ t: "Your", bad: true }, { t: " welcome!" }],
    right: [{ t: "You’re", hl: true }, { t: " welcome!" }],
    rows: [["Your", "belongs to you"], ["You’re", "= you are"]],
    tag: "“You are welcome” works, so write You’re.",
    bubble: "A welcome that belongs to you? Cute." },
  { id: "m2",
    wrong: [{ t: "I could " }, { t: "of", bad: true }, { t: " gone." }],
    right: [{ t: "I could " }, { t: "have", hl: true }, { t: " gone." }],
    rows: [["could’ve", "= could have"], ["could of", "isn’t a thing"]],
    tag: "could have · would have · should have",
    bubble: "Could’ve sounds like “could of”. Our ears are lying." },
  { id: "m3",
    wrong: [{ t: "Less", bad: true }, { t: " students came today." }],
    right: [{ t: "Fewer", hl: true }, { t: " students came today." }],
    rows: [["Fewer", "things you can count"], ["Less", "things you can’t count"]],
    tag: "fewer students · less noise",
    bubble: "You can count students. Don’t call them “less”." },
  { id: "m4",
    wrong: [{ t: "Me", bad: true }, { t: " and Tola went home." }],
    right: [{ t: "Tola", hl: true }, { t: " " }, { t: "and", hl: true }, { t: " " }, { t: "I", hl: true }, { t: " went home." }],
    rows: [["Test", "drop the other person"], ["“Me went home”", "doesn’t work"]],
    tag: "Friend first, then I.",
    bubble: "Manners count in grammar too." },
];

const pop = (frame: number, at: number, fps: number) =>
  spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 160, mass: 0.7 } });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Frames (relative to this scene) of line k, read from the real voice timing.
const lineAt = (timing: Timing, id: string, k: number, sceneStart: number) => {
  const l = timing.lines[`${id}_${k}`];
  return l ? Math.round((l.at - sceneStart / GFPS) * GFPS) : 0;
};
const lineDur = (timing: Timing, id: string, k: number) => Math.round((timing.lines[`${id}_${k}`]?.dur ?? 3) * GFPS);

const Bg: React.FC = () => <AbsoluteFill style={{ background: theme.surfaceWarm }} />;

const Header: React.FC<{ idx?: number }> = ({ idx }) => (
  <div style={{ position: "absolute", top: 80, left: 60, right: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <Img src={staticFile("logo.png")} style={{ height: 84, display: "block" }} />
      <div style={{ fontFamily: SANS, lineHeight: 1.2 }}>
        <div style={{ fontWeight: 700, fontSize: 38, color: theme.accent }}>Fahmid</div>
        <div style={{ fontSize: 30, color: "#5B6785" }}>Nursery &amp; Primary School</div>
      </div>
    </div>
    {idx !== undefined && (
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ height: 16, width: i === idx ? 56 : 16, borderRadius: 8, background: i === idx ? theme.gold : i < idx ? theme.accent : "#D5DAE6" }} />
        ))}
      </div>
    )}
  </div>
);

const Stage: React.FC<{ bubble?: string; bubbleAt?: number; mood: Mood; talking: boolean; point?: boolean }> = ({ bubble, bubbleAt = 0, mood, talking, point }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const enter = interpolate(spring({ frame: f - 3, fps, config: { damping: 18 } }), [0, 1], [320, 0]);
  const b = pop(f, bubbleAt, fps);
  return (
    <>
      <div style={{ position: "absolute", left: -260, top: 1340, width: 820, height: 820, borderRadius: "50%", background: theme.accentPale }} />
      <div style={{ position: "absolute", left: 30, bottom: 0, width: 440, height: 572, transform: `translateY(${enter}px)` }}>
        <Mascot frame={f} talking={talking} mood={mood} point={point} />
      </div>
      {bubble && (
        <div style={{ position: "absolute", left: 500, top: 1420, width: 520, background: theme.accent, borderRadius: 32, padding: "30px 38px", color: "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 42, lineHeight: 1.28, opacity: b, transform: `translateY(${(1 - b) * 24}px) scale(${0.92 + 0.08 * b})`, transformOrigin: "left center", boxShadow: "0 14px 34px rgba(27,58,122,0.22)" }}>
          {bubble}
        </div>
      )}
    </>
  );
};

const Fade: React.FC<{ out?: boolean; children: React.ReactNode }> = ({ out = true, children }) => {
  const f = useCurrentFrame(); const { durationInFrames } = useVideoConfig();
  const o = interpolate(f, [0, 5, durationInFrames - 6, durationInFrames], [0, 1, 1, out ? 0 : 1], clamp);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const talkingNow = (timing: Timing, sceneStart: number, f: number) => {
  const t = (sceneStart + f) / GFPS;
  return Object.values(timing.lines).some((l) => t >= l.at && t <= l.at + l.dur);
};

const Phone: React.FC<{ f: number; fps: number; recvAt: number; sendAt: number }> = ({ f, fps, recvAt, sendAt }) => {
  const enter = pop(f, 6, fps), r = pop(f, recvAt, fps), s = pop(f, sendAt, fps);
  const pulse = f > sendAt + 20 ? 1 + 0.08 * Math.sin((f - sendAt) * 0.35) : 1;
  return (
    <div style={{ position: "absolute", left: 250, top: 640, width: 600, height: 760, background: "#fff", border: `8px solid ${INK}`, borderRadius: 54, overflow: "hidden", boxShadow: "0 30px 60px rgba(22,33,62,0.18)", opacity: enter, transform: `translateY(${(1 - enter) * 60}px)` }}>
      <div style={{ background: "#ECF1FD", padding: "28px 30px", display: "flex", alignItems: "center", gap: 18, fontFamily: SANS, fontWeight: 700, fontSize: 32, color: INK }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: theme.gold }} />Class group
      </div>
      <div style={{ padding: "34px 30px", display: "flex", flexDirection: "column", gap: 26, fontFamily: SANS, fontSize: 32 }}>
        <div style={{ alignSelf: "flex-start", background: "#ECF1FD", color: INK, padding: "20px 28px", borderRadius: 26, opacity: r, transform: `scale(${0.9 + 0.1 * r})`, transformOrigin: "left bottom" }}>Thanks for the notes!</div>
        <div style={{ alignSelf: "flex-end", background: GREEN, color: "#fff", fontWeight: 700, padding: "20px 28px", borderRadius: 26, opacity: s, transform: `scale(${0.9 + 0.1 * s})`, transformOrigin: "right bottom" }}>Your welcome!</div>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, height: 76, borderRadius: 38, background: "#ECF1FD", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px" }}>
        <div style={{ width: 54, height: 54, borderRadius: 27, background: theme.accent, color: "#fff", fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pulse})` }}>&#8593;</div>
      </div>
    </div>
  );
};

const Hook: React.FC<{ timing: Timing }> = ({ timing }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = pop(f, 4, fps);
  const honest = lineAt(timing, "hook", 0, 0) + 48;
  const recv = 20, send = Math.max(recv + 20, honest - 30);
  return (
    <Fade out={true}>
      <Bg />
      <div style={{ position: "absolute", top: 220, left: 70, fontFamily: SERIF, fontSize: 150, lineHeight: 1.02, color: INK, opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
        Would you<br />hit <span style={{ color: theme.gold }}>send?</span>
      </div>
      <Phone f={f} fps={fps} recvAt={recv} sendAt={send} />
      <Stage bubble="Be honest." bubbleAt={honest} mood={f < honest ? "oops" : "calm"} talking={talkingNow(timing, 0, f)} />
    </Fade>
  );
};

const Tag: React.FC<{ label: string; ok?: boolean }> = ({ label, ok }) => (
  <div style={{ position: "absolute", top: -26, left: 34, display: "flex", alignItems: "center", gap: 10, background: ok ? GREEN : RED, color: "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 2.5, padding: "9px 24px", borderRadius: 30 }}>
    {ok ? "✓" : "×"} {label}
  </div>
);

const Sentence: React.FC<{ parts: Part[]; bad?: boolean; strike?: number }> = ({ parts, bad, strike = 0 }) => {
  const len = parts.reduce((n, p) => n + p.t.length, 0);
  const fs = Math.min(104, Math.floor(860 / (len * 0.5)));
  return (
    <div style={{ fontFamily: SERIF, fontSize: fs, color: INK, whiteSpace: "nowrap", lineHeight: 1.15 }}>
      {parts.map((p, i) => {
        if (p.bad) return (
          <span key={i} style={{ position: "relative", display: "inline-block", padding: "0 12px", margin: "0 -12px", borderRadius: 12, background: `rgba(214,59,59,${0.14 * Math.min(1, strike * 4)})`, color: strike > 0.5 ? RED : INK }}>
            {p.t}
            <span style={{ position: "absolute", left: 0, right: 0, top: "56%", height: 7, borderRadius: 4, background: RED, transformOrigin: "left", transform: `scaleX(${strike})` }} />
          </span>
        );
        if (p.hl) return (
          <span key={i} style={{ display: "inline-block", padding: "0 12px", margin: "0 -12px", borderRadius: 12, background: "#DDF3E8", color: GREEN, borderBottom: `6px solid ${GREEN}` }}>{p.t}</span>
        );
        return <span key={i} style={{ whiteSpace: "pre" }}>{p.t}</span>;
      })}
    </div>
  );
};

const Mistake: React.FC<{ idx: number; start: number; dur: number; timing: Timing }> = ({ idx, start, dur, timing }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const m = MISTAKES[idx];
  const fixAt = Math.max(24, lineAt(timing, m.id, 1, start) - 8);
  const strike = interpolate(f, [fixAt - 14, fixAt], [0, 1], clamp);
  const d1 = lineDur(timing, m.id, 1);
  const r1 = fixAt + Math.round(d1 * 0.25), r2 = fixAt + Math.round(d1 * 0.55);
  const tagAt = Math.min(fixAt + Math.round(d1 * 0.85), dur - 40);
  const p0 = pop(f, 4, fps), pf = pop(f, fixAt, fps), p1 = pop(f, r1, fps), p2 = pop(f, r2, fps), pt = pop(f, tagAt, fps);
  const row = (k: number, p: number) => (
    <div key={k} style={{ display: "flex", alignItems: "baseline", gap: 18, background: "#E8EFFD", borderRadius: 22, padding: "22px 34px", opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
      <span style={{ fontFamily: SERIF, fontSize: 52, color: INK }}>{m.rows[k][0]}</span>
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: "#3A4668" }}>{m.rows[k][1]}</span>
    </div>
  );
  return (
    <Fade out={true}>
      <Bg />
      <Header idx={idx} />
      <div style={{ position: "absolute", top: 262, left: 60, fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: theme.goldDark, opacity: p0 }}>MISTAKE {idx + 1} OF 4</div>
      <div style={{ position: "absolute", top: 360, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 56 }}>
        <div style={{ position: "relative", background: "#fff", border: "3px solid #F4C9C9", borderRadius: 30, padding: "62px 40px 40px", boxShadow: "0 8px 0 rgba(214,59,59,0.07)", opacity: p0, transform: `translateY(${(1 - p0) * 30}px)` }}>
          <Tag label="DON'T WRITE" />
          <Sentence parts={m.wrong} strike={strike} />
        </div>
        <div style={{ position: "relative", background: "#fff", border: "3px solid #BFE3D0", borderRadius: 30, padding: "62px 40px 40px", boxShadow: "0 8px 0 rgba(14,122,79,0.07)", opacity: pf, transform: `translateY(${(1 - pf) * 30}px)` }}>
          <Tag label="WRITE" ok />
          <Sentence parts={m.right} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: -16 }}>
          {row(0, p1)}
          {row(1, p2)}
          <div style={{ alignSelf: "flex-start", background: theme.goldLight, color: theme.goldDark, fontFamily: SANS, fontWeight: 700, fontSize: 32, padding: "14px 30px", borderRadius: 30, opacity: pt, transform: `translateY(${(1 - pt) * 16}px)` }}>{m.tag}</div>
        </div>
      </div>
      <Stage bubble={m.bubble} bubbleAt={fixAt + 6} mood={f < fixAt ? "oops" : "smile"} talking={talkingNow(timing, start, f)} />
    </Fade>
  );
};

const Outro: React.FC<{ start: number; timing: Timing }> = ({ start, timing }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = pop(f, 6, fps);
  const share = pop(f, lineAt(timing, "outro", 1, start), fps);
  const last = lineAt(timing, "outro", 2, start);
  const chips = ["You’re welcome", "could have", "fewer students", "Tola and I"];
  return (
    <Fade out={false}>
      <Bg />
      <div style={{ position: "absolute", top: 90, left: 60, display: "flex", alignItems: "center", gap: 24, opacity: a }}>
        <Img src={staticFile("logo.png")} style={{ height: 100, display: "block" }} />
        <div style={{ fontFamily: SERIF, fontSize: 48, color: theme.accent, lineHeight: 1.15 }}>Fahmid Nursery &amp;<br />Primary School</div>
      </div>
      <div style={{ position: "absolute", top: 380, left: 60, fontFamily: SERIF, fontSize: 200, lineHeight: 1, color: INK, opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>Four fixed<span style={{ color: theme.gold }}>.</span></div>
      <div style={{ position: "absolute", top: 650, left: 60, right: 60, display: "flex", flexWrap: "wrap", gap: 20 }}>
        {chips.map((c, i) => {
          const p = pop(f, 22 + i * 8, fps);
          return <div key={c} style={{ background: "#DDF3E8", color: GREEN, fontFamily: SANS, fontWeight: 700, fontSize: 40, padding: "16px 34px", borderRadius: 40, opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>{"✓"} {c}</div>;
        })}
      </div>
      <div style={{ position: "absolute", top: 930, left: 60, width: 880, fontFamily: SANS, fontWeight: 700, fontSize: 46, lineHeight: 1.3, color: "#2B3D73", opacity: share, transform: `translateY(${(1 - share) * 20}px)` }}>
        Share this with a friend who still writes &ldquo;your welcome&rdquo;.
      </div>
      <div style={{ position: "absolute", right: 60, bottom: 70, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: theme.accent }}>www.fahmidschool.com.ng</div>
      <Stage bubble={"You’re welcome."} bubbleAt={last} mood="smile" talking={talkingNow(timing, start, f)} />
    </Fade>
  );
};

export const GrammarShort: React.FC<{ timing: Timing }> = ({ timing }) => {
  const S = data.scenes;
  const fr = (s: number) => Math.round(s * GFPS);
  return (
    <AbsoluteFill style={{ background: theme.surfaceWarm }}>
      {timing.built && <Audio src={staticFile("grammar/voice.mp3")} volume={1} />}
      <Sequence from={fr(S[0].start)} durationInFrames={fr(S[0].dur)}><Hook timing={timing} /></Sequence>
      {[1, 2, 3, 4].map((i) => (
        <Sequence key={i} from={fr(S[i].start)} durationInFrames={fr(S[i].dur)}><Mistake idx={i - 1} start={fr(S[i].start)} dur={fr(S[i].dur)} timing={timing} /></Sequence>
      ))}
      <Sequence from={fr(S[5].start)} durationInFrames={GTOTAL - fr(S[5].start)}><Outro start={fr(S[5].start)} timing={timing} /></Sequence>
    </AbsoluteFill>
  );
};
