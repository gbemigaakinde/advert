import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, interpolate, Easing } from "remotion";
import { theme } from "../theme";
import "@fontsource/dm-serif-display/latin-400.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";

// Same typefaces as the real portal (DM Serif Display + DM Sans).
export const fontStack = "'DM Serif Display', Georgia, serif";
export const sansStack = "'DM Sans', 'Helvetica Neue', Arial, sans-serif";
import { ScenePlan, FPS, SCHOOL } from "./plan";

export const S = (sec: number) => Math.round(sec * FPS);
export const ease = Easing.bezier(0.4, 0, 0.2, 1);
export const portal = (f: string) => staticFile(`portal/${f}`);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Piecewise eased animation through [frame, value] points. */
export function tw(frame: number, pts: [number, number][]): number {
  if (frame <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (frame <= pts[i][0]) {
      const [f0, v0] = pts[i - 1], [f1, v1] = pts[i];
      return interpolate(frame, [f0, f1], [v0, v1], { ...cl, easing: ease });
    }
  }
  return pts[pts.length - 1][1];
}
export const fade = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], cl);

export const Ctx = React.createContext<{ sfx: boolean }>({ sfx: false });

export const Sfx: React.FC<{ at: number; name: "tap" | "chime" | "swish"; volume?: number }> = ({ at, name, volume = 0.22 }) => {
  const { sfx } = React.useContext(Ctx);
  if (!sfx) return null;
  return <Sequence from={Math.max(0, at)} durationInFrames={40}><Audio src={staticFile(`audio/${name}.mp3`)} volume={volume} /></Sequence>;
};

/* ───────────────────────── Background + branding ───────────────────────── */
export const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const d = Math.sin(f / 240) * 30;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg,#FFFFFF 0%,#F2F6FD 55%,#E6EEFB 100%)" }}>
      <div style={{ position: "absolute", right: -200 + d, top: -260, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle,#D5E2FA 0%,rgba(213,226,250,0) 68%)" }} />
      <div style={{ position: "absolute", left: -260, bottom: -320 - d, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle,#EAF0FD 0%,rgba(234,240,253,0) 68%)" }} />
    </AbsoluteFill>
  );
};

export const Brand: React.FC = () => (
  <div style={{ position: "absolute", left: 100, bottom: 56, display: "flex", alignItems: "center", gap: 14, opacity: 0.9 }}>
    <Img src={staticFile("logo.png")} style={{ width: 46, height: 46, objectFit: "contain" }} />
    <div style={{ fontFamily: sansStack, fontSize: 21, color: theme.accent, fontWeight: 600, letterSpacing: 0.2 }}>{SCHOOL}</div>
  </div>
);

/** Section chip: "01 — LOGIN" with blue accent line. */
export const Chip: React.FC<{ n: string; label: string }> = ({ n, label }) => {
  const f = useCurrentFrame();
  const o = fade(f, 4, 20);
  return (
    <div style={{ position: "absolute", left: 100, top: 84, opacity: o, transform: `translateY(${(1 - o) * -10}px)`, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 46, height: 4, borderRadius: 2, background: theme.accentMid }} />
      <div style={{ fontFamily: sansStack, fontSize: 24, letterSpacing: 4, fontWeight: 700, color: theme.accentMid }}>{n} — {label}</div>
    </div>
  );
};

/* ─────────────── Captions (left column): short instruction text ─────────────── */
export type Cap = { from: number; to: number; step?: string; title: string; sub?: string };
export const Captions: React.FC<{ caps: Cap[]; left?: number; top?: number; width?: number; center?: boolean }> = ({ caps, left = 100, top = 330, width = 700, center }) => {
  const f = useCurrentFrame();
  return (
    <>
      {caps.map((c, i) => {
        const o = Math.min(fade(f, c.from, c.from + 14), 1 - fade(f, c.to - 12, c.to));
        if (o <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: center ? 0 : left, right: center ? 0 : undefined, top, width: center ? undefined : width, textAlign: center ? "center" : "left", opacity: o, transform: `translateY(${(1 - o) * 18}px)` }}>
            {c.step && <div style={{ fontFamily: sansStack, fontSize: 24, fontWeight: 700, letterSpacing: 2, color: theme.gold, marginBottom: 14, textTransform: "uppercase" }}>{c.step}</div>}
            <div style={{ fontFamily: fontStack, fontSize: 62, lineHeight: 1.12, color: theme.accent, fontWeight: 700 }}>{c.title}</div>
            {c.sub && <div style={{ fontFamily: sansStack, fontSize: 31, lineHeight: 1.4, color: "#42506B", marginTop: 20 }}>{c.sub}</div>}
          </div>
        );
      })}
    </>
  );
};

/* ───────────── Overlays in screen space (CSS px of the real page) ───────────── */
export type Rect = { x: number; y: number; w: number; h: number };

export const Hl: React.FC<{ r: Rect; from: number; to: number; pad?: number; radius?: number }> = ({ r, from, to, pad = 5, radius = 14 }) => {
  const f = useCurrentFrame();
  const o = Math.min(fade(f, from, from + 12), 1 - fade(f, to - 10, to));
  if (o <= 0) return null;
  const pulse = 0.5 + 0.5 * Math.sin((f - from) / 9);
  return (
    <div style={{
      position: "absolute", left: r.x - pad, top: r.y - pad, width: r.w + pad * 2, height: r.h + pad * 2, borderRadius: radius,
      border: `3px solid ${theme.accentLight}`, boxShadow: `0 0 0 ${3 + pulse * 5}px rgba(58,104,200,${0.16 + pulse * 0.1}), 0 0 22px rgba(58,104,200,.35)`,
      opacity: o, pointerEvents: "none",
    }} />
  );
};

export type Tap = { f: number; x: number; y: number; silent?: boolean };

/** Fingertip that glides between points and presses at each one. */
export const Finger: React.FC<{ taps: Tap[]; fromEdge?: { x: number; y: number } }> = ({ taps, fromEdge = { x: 300, y: 900 } }) => {
  const f = useCurrentFrame();
  if (!taps.length) return null;
  const first = taps[0].f, last = taps[taps.length - 1].f;
  const o = Math.min(fade(f, first - 26, first - 10), 1 - fade(f, last + 22, last + 38));
  const px: [number, number][] = [[first - 26, fromEdge.x]], py: [number, number][] = [[first - 26, fromEdge.y]];
  taps.forEach((t, i) => { px.push([t.f - 4, t.x]); py.push([t.f - 4, t.y]); const nx = taps[i + 1]; if (nx) { px.push([t.f + 10, t.x]); py.push([t.f + 10, t.y]); } });
  const x = tw(f, px), y = tw(f, py);
  const press = Math.max(0, ...taps.map((t) => 1 - Math.min(1, Math.abs(f - t.f) / 7)));
  const ripple = taps.map((t) => ({ t, k: (f - t.f) / 16 })).filter((r) => r.k >= 0 && r.k <= 1);
  return (
    <>
      {taps.filter((t) => !t.silent).map((t, i) => <Sfx key={i} at={t.f} name="tap" />)}
      {ripple.map((r, i) => (
        <div key={i} style={{ position: "absolute", left: r.t.x - 34, top: r.t.y - 34, width: 68, height: 68, borderRadius: "50%", border: "3px solid rgba(36,81,168,.55)", transform: `scale(${0.4 + r.k * 0.9})`, opacity: 1 - r.k }} />
      ))}
      <div style={{ position: "absolute", left: x - 24, top: y - 24, width: 48, height: 48, borderRadius: "50%", opacity: o, transform: `scale(${1 - press * 0.18})`,
        background: "radial-gradient(circle at 40% 35%,rgba(255,255,255,.95),rgba(190,205,235,.78))", border: "2px solid rgba(27,58,122,.45)", boxShadow: "0 8px 20px rgba(15,23,42,.30)" }} />
    </>
  );
};

/* ───────────────────────── Phone + camera ───────────────────────── */
export const PHONE_W = 418, PHONE_H = 902, SCREEN_W = 390, CONTENT_H = 844;

export type Cam = { zoom: number; fx: number; fy: number };

/** Camera: scales around the phone's centre and slides so the focus point (screen px) approaches the middle. */
export function camStyle(c: Cam, natW = PHONE_W, natH = PHONE_H, offY = 30, stageW = 1920, stageH = 1080, cxScreen = 195, cyScreen = 422 + 30): React.CSSProperties {
  const dx0 = -(c.fx - cxScreen) * c.zoom, dy0 = -(c.fy + offY - cyScreen) * c.zoom;
  const limX = Math.max(0, (natW * c.zoom - Math.min(natW * c.zoom, 760)) / 2) + 40;
  const limY = Math.max(0, (natH * c.zoom - stageH) / 2 + 30);
  const dx = Math.max(-limX, Math.min(limX, dx0)), dy = Math.max(-limY, Math.min(limY, dy0));
  return { transform: `translate(${dx}px,${dy}px) scale(${c.zoom})`, transformOrigin: "50% 50%" };
}

export const StatusBar: React.FC = () => (
  <div style={{ height: 30, background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px", fontFamily: sansStack, fontSize: 13, fontWeight: 700, color: "#111", position: "relative" }}>
    <span>9:41</span>
    <div style={{ position: "absolute", left: "50%", top: 7, width: 92, height: 22, marginLeft: -46, borderRadius: 12, background: "#0b0f1a" }} />
    <span style={{ letterSpacing: 1 }}>●●● ▮</span>
  </div>
);

export const Phone: React.FC<{ children: React.ReactNode; cam?: Cam; x?: number; y?: number; scale?: number; tilt?: number; opacity?: number }> = ({ children, cam, x = 1330, y = 540, scale = 1, tilt = 0, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x - PHONE_W / 2, top: y - PHONE_H / 2, width: PHONE_W, height: PHONE_H, opacity, transform: `scale(${scale}) rotate(${tilt}deg)`, transformOrigin: "50% 50%" }}>
    <div style={{ width: PHONE_W, height: PHONE_H, ...(cam ? camStyle(cam) : {}) }}>
      <div style={{ width: PHONE_W, height: PHONE_H, borderRadius: 62, padding: 14, boxSizing: "border-box", background: "linear-gradient(145deg,#2b3446,#0b1020 45%,#1c2436)", boxShadow: "0 50px 90px rgba(15,23,42,.34), 0 12px 26px rgba(15,23,42,.22), inset 0 0 0 2px rgba(255,255,255,.10)", position: "relative" }}>
        <div style={{ position: "absolute", right: -3, top: 190, width: 4, height: 90, borderRadius: 2, background: "#1b2336" }} />
        <div style={{ position: "absolute", left: -3, top: 150, width: 4, height: 54, borderRadius: 2, background: "#1b2336" }} />
        <div style={{ width: SCREEN_W, height: PHONE_H - 28, borderRadius: 48, overflow: "hidden", background: "#fff", position: "relative" }}>
          <StatusBar />
          <div style={{ position: "relative", width: SCREEN_W, height: CONTENT_H, overflow: "hidden" }}>{children}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, borderRadius: 48, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)", pointerEvents: "none",
            background: "linear-gradient(115deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,0) 30%)" }} />
        </div>
      </div>
    </div>
  </div>
);

/** Generic wide browser window (used for the report card, tablet and desktop views). */
export const Win: React.FC<{ children: React.ReactNode; w: number; h: number; url?: string; cam?: Cam; x?: number; y?: number; scale?: number; opacity?: number; radius?: number }> = ({ children, w, h, url = "", cam, x = 1230, y = 540, scale = 1, opacity = 1, radius = 16 }) => {
  const barH = 44, W = w, H = h + barH;
  const st: React.CSSProperties = cam ? (() => {
    const dx0 = -(cam.fx - w / 2) * cam.zoom, dy0 = -(cam.fy + barH - H / 2) * cam.zoom;
    const lx = Math.max(0, (W * cam.zoom - 1100) / 2), ly = Math.max(0, (H * cam.zoom - 1000) / 2);
    return { transform: `translate(${Math.max(-lx, Math.min(lx, dx0))}px,${Math.max(-ly, Math.min(ly, dy0))}px) scale(${cam.zoom})`, transformOrigin: "50% 50%" };
  })() : {};
  return (
    <div style={{ position: "absolute", left: x - W / 2, top: y - H / 2, width: W, height: H, opacity, transform: `scale(${scale})`, transformOrigin: "50% 50%" }}>
      <div style={{ width: W, height: H, ...st }}>
        <div style={{ width: W, height: H, borderRadius: radius, overflow: "hidden", background: "#fff", boxShadow: "0 40px 80px rgba(15,23,42,.26), 0 0 0 1px rgba(15,23,42,.12)" }}>
          <div style={{ height: barH, background: "#E9EDF5", display: "flex", alignItems: "center", padding: "0 16px", gap: 8 }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
            <div style={{ marginLeft: 18, flex: 1, height: 26, borderRadius: 13, background: "#fff", fontFamily: sansStack, fontSize: 14, color: "#334155", display: "flex", alignItems: "center", padding: "0 14px" }}>🔒&nbsp;{url}</div>
          </div>
          <div style={{ position: "relative", width: W, height: h, overflow: "hidden" }}>{children}</div>
        </div>
      </div>
    </div>
  );
};

/* Real portal images */
export const Shot: React.FC<{ src: string; width?: number; top?: number; opacity?: number }> = ({ src, width = SCREEN_W, top = 0, opacity = 1 }) => (
  <Img src={portal(src)} style={{ position: "absolute", left: 0, top, width, display: "block", opacity }} />
);

/* ───────────────────────── Scene shell ───────────────────────── */
export const SceneShell: React.FC<{ sc: ScenePlan; narration: boolean; chip?: [string, string]; children: React.ReactNode; swish?: boolean }> = ({ sc, narration, chip, children, swish = true }) => {
  const f = useCurrentFrame();
  const o = Math.min(fade(f, 0, 10), 1 - fade(f, sc.dur - 10, sc.dur));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {chip && <Chip n={chip[0]} label={chip[1]} />}
      {/* Drawn BEFORE the scene content, so the phone and windows sit on top of it */}
      <div style={{ position: "absolute", right: 60, bottom: 40, fontFamily: sansStack, fontSize: 17, color: "#6B7A99", letterSpacing: 0.3 }}>Demonstration screens · fictional pupil data</div>
      {children}
      <Brand />
      {swish && <Sfx at={0} name="swish" volume={0.12} />}
      {narration && sc.lines.map((st, k) => (
        <Sequence key={k} from={st} durationInFrames={sc.lineDurs[k] + 6}><Audio src={staticFile(`audio/narr/${sc.id}_${k}.mp3`)} volume={1} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
