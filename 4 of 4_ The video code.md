# Part 4 of 4: The video itself (`src/guide/` folder)

Create a new folder `src/guide` and add all four files inside it. These animate the real screenshots inside a phone frame: finger taps, highlights, captions, camera zoom and section labels.

---

## `src/guide/plan.ts`

**ADD (new file)** this file in your `advert` repository. Timeline builder. **The web address shown in the browser scene is the `GUIDE_URL` line at the top.**

```ts
import { staticFile } from "remotion";
import script from "../../narration/script.json";

export const FPS = 30;
export const GUIDE_URL = "www.fahmidschool.com.ng/login"; // the address shown in the browser scene
export const SCHOOL = "Fahmid Nursery & Primary School";

export type ScenePlan = { id: string; start: number; dur: number; lines: number[]; lineDurs: number[] };
export type GuidePlan = {
  scenes: ScenePlan[]; total: number;
  narration: boolean; music: boolean; sfx: boolean;
};

const LEAD = 0.7, GAP = 0.5, TAIL = 1.1;

/** Builds the timeline from the narration lengths (real audio if available, else a reading-speed estimate). */
export async function buildPlan(): Promise<GuidePlan> {
  let meta: any = null;
  try {
    const r = await fetch(staticFile("audio/durations.json"));
    if (r.ok) meta = await r.json();
  } catch (e) { /* no audio built yet: use estimates */ }

  let cursor = 0;
  const scenes: ScenePlan[] = (script as any[]).map((sc) => {
    let t = LEAD;
    const lines: number[] = [], lineDurs: number[] = [];
    sc.lines.forEach((text: string, k: number) => {
      const real = meta?.narration ? meta.lines?.[`${sc.id}_${k}`] : undefined;
      const secs = real ?? Math.max(1.5, text.split(/\s+/).length / 2.3);
      lines.push(Math.round(t * FPS)); lineDurs.push(Math.round(secs * FPS));
      t += secs + GAP;
    });
    const dur = Math.max(Math.round(sc.min * FPS), Math.round((t - GAP + TAIL) * FPS));
    const out = { id: sc.id, start: cursor, dur, lines, lineDurs };
    cursor += dur;
    return out;
  });
  return { scenes, total: cursor, narration: !!meta?.narration, music: !!meta?.music, sfx: !!meta?.sfx };
}
```

---

## `src/guide/ui.tsx`

**ADD (new file)** this file in your `advert` repository. Phone frame, finger, highlight, captions, camera.

```tsx
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
      {children}
      <Brand />
      {swish && <Sfx at={0} name="swish" volume={0.12} />}
      <div style={{ position: "absolute", right: 60, bottom: 40, fontFamily: sansStack, fontSize: 17, color: "#6B7A99", letterSpacing: 0.3 }}>Demonstration screens · fictional pupil data</div>
      {narration && sc.lines.map((st, k) => (
        <Sequence key={k} from={st} durationInFrames={sc.lineDurs[k] + 6}><Audio src={staticFile(`audio/narr/${sc.id}_${k}.mp3`)} volume={1} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
```

---

## `src/guide/scenes.tsx`

**ADD (new file)** this file in your `advert` repository. All 17 scenes, in the order of your storyboard.

```tsx
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { theme } from "../theme";
import { ScenePlan, GUIDE_URL, SCHOOL } from "./plan";
import {
  S, tw, fade, portal, Phone, Win, Shot, Hl, Finger, Captions, Cap, SceneShell, Sfx, Backdrop, Rect, Tap,
  fontStack, sansStack, SCREEN_W, CONTENT_H,
} from "./ui";
import manifest from "../../public/portal/manifest.json";

const M: any = (manifest as any).screens;
const PM = M.pupilMobile, LM = M.loginMobile;
const NAV = PM.navLinks, EL = PM.el;
const FULL_H = PM.fullHeight;
const cx = (r: Rect) => r.x + r.w / 2, cy = (r: Rect) => r.y + r.h / 2;
const navPt = (k: string) => ({ x: cx(NAV[k]), y: cy(NAV[k]) });

// Where each section sits when scrolled into view
const SCROLL: Record<string, number> = { profile: 0, tests: EL.tests.y - 66, results: EL.results.y - 66, fees: EL.fees.y - 66 };

type P = { sc: ScenePlan; narration: boolean };
const rel = (r: Rect, scroll: number): Rect => ({ ...r, y: r.y - scroll });

/* A scroll track: jumps to target a little after each tap */
function scrollTrack(f: number, start: number, moves: [number, number][], dur = 26) {
  const pts: [number, number][] = [[0, start]];
  let prev = start;
  moves.forEach(([t, target]) => { pts.push([t + 3, prev]); pts.push([t + 3 + dur, target]); prev = target; });
  return tw(f, pts);
}

const PupilView: React.FC<{ scroll: number; active: string; children?: React.ReactNode }> = ({ scroll, active, children }) => (
  <>
    <Shot src="pupil_m_full.png" top={-scroll} />
    {scroll > 2 && <div style={{ position: "absolute", left: 0, top: 0, width: 390, height: 61, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,.10)" }}><Img src={portal("pupil_m_topbar.png")} style={{ width: 390, height: 61, display: "block" }} /></div>}
    <div style={{ position: "absolute", left: 0, top: PM.nav.y, width: 390, height: PM.nav.h, background: "#fff", boxShadow: "0 -2px 10px rgba(0,0,0,.08)" }}>
      <Img src={portal(`pupil_m_bottomnav_${active}.png`)} style={{ width: 390, height: PM.nav.h, display: "block" }} />
    </div>
    {children}
  </>
);

const activeAt = (f: number, taps: { f: number; k: string }[], start = "profile") => taps.reduce((a, t) => (f >= t.f + 6 ? t.k : a), start);

const camT = (f: number, pts: [number, number, number, number][]) => ({
  zoom: tw(f, pts.map(([t, z]) => [t, z] as [number, number])),
  fx: tw(f, pts.map(([t, , x]) => [t, x] as [number, number])),
  fy: tw(f, pts.map(([t, , , y]) => [t, y] as [number, number])),
});

/* ─────────────────────────────── 1. INTRO ─────────────────────────────── */
export const Intro: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const logoIn = tw(f, [[0, 0], [24, 1]]);
  const phoneIn = tw(f, [[L[1] - 20, 0], [L[1] + 26, 1]]);
  return (
    <SceneShell sc={sc} narration={narration} swish={false}>
      <div style={{ position: "absolute", left: 100, top: 250, width: 800 }}>
        <Img src={staticFile("logo.png")} style={{ width: 150, height: 150, objectFit: "contain", opacity: logoIn, transform: `scale(${0.85 + logoIn * 0.15})` }} />
        <div style={{ fontFamily: sansStack, fontSize: 26, fontWeight: 700, color: theme.gold, letterSpacing: 3, marginTop: 34, opacity: fade(f, 20, 36) }}>FAHMID NURSERY & PRIMARY SCHOOL</div>
        <div style={{ fontFamily: fontStack, fontSize: 96, lineHeight: 1.04, color: theme.accent, marginTop: 14, opacity: fade(f, 28, 48), transform: `translateY(${(1 - fade(f, 28, 48)) * 22}px)` }}>Parent Portal</div>
        <div style={{ width: tw(f, [[44, 0], [74, 120]]), height: 5, borderRadius: 3, background: theme.accentMid, margin: "26px 0" }} />
        <div style={{ fontFamily: sansStack, fontSize: 33, lineHeight: 1.4, color: "#42506B", width: 640, opacity: fade(f, 60, 84) }}>A simple guide to accessing your child's school information online</div>
      </div>
      <Phone x={1330} y={540 + (1 - phoneIn) * 120} opacity={phoneIn} tilt={(1 - phoneIn) * 4} scale={0.98}>
        <Shot src="login_m_empty.png" />
      </Phone>
    </SceneShell>
  );
};

/* ─────────────────────── 2. ACCESS THE PORTAL (browser) ─────────────────────── */
export const Access: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const tapBar = L[0] + S(3.6), typeStart = tapBar + 18, typeEnd = typeStart + S(2.8), go = typeEnd + 14, loadEnd = go + S(1.7);
  const n = Math.round(tw(f, [[typeStart, 0], [typeEnd, GUIDE_URL.length]]));
  const typing = f >= typeStart && f < go;
  const loaded = f >= loadEnd - 6;
  const bar: Rect = { x: 14, y: 8, w: 362, h: 40 };
  const cam = camT(f, [[0, 1, 195, 422], [tapBar - 10, 1, 195, 422], [tapBar + 10, 1.22, 195, 150], [go + 60, 1.22, 195, 150], [loadEnd + 10, 1, 195, 422]]);
  return (
    <SceneShell sc={sc} narration={narration} chip={["00", "OPEN THE PORTAL"]}>
      <Captions caps={[
        { from: 8, to: tapBar + 20, step: "Step 1", title: "Open the School Portal", sub: "Use any browser on your phone, tablet or computer." },
        { from: tapBar + 30, to: sc.dur - 10, step: "Step 1", title: "Open the School Portal", sub: GUIDE_URL },
      ]} />
      <Phone cam={cam}>
        <div style={{ position: "absolute", inset: 0, background: "#fff" }}>
          {!loaded && <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: sansStack, color: "#94A3B8", fontSize: 15 }}>New tab</div>}
          {loaded && <Shot src="login_m_empty.png" top={56} opacity={fade(f, loadEnd - 6, loadEnd + 8)} />}
          <div style={{ position: "absolute", left: 0, top: 0, width: 390, height: 56, background: "#F3F5F9", borderBottom: "1px solid #E2E8F0" }}>
            <div style={{ position: "absolute", left: bar.x, top: bar.y, width: bar.w, height: bar.h, borderRadius: 14, background: "#fff", border: f > tapBar && f < loadEnd ? "2px solid #3A68C8" : "1px solid #D5DCE8", fontFamily: sansStack, fontSize: 15, color: "#1E293B", display: "flex", alignItems: "center", padding: "0 12px", boxSizing: "border-box" }}>
              {f < tapBar + 18 ? <span style={{ color: "#94A3B8" }}>Search or type website address</span>
                : <span>{loaded || f >= go ? GUIDE_URL : GUIDE_URL.slice(0, n)}{typing && Math.floor(f / 10) % 2 === 0 ? "|" : ""}</span>}
            </div>
            {f >= go && f < loadEnd && <div style={{ position: "absolute", left: 0, bottom: 0, height: 3, width: `${tw(f, [[go, 0], [loadEnd - 4, 100]])}%`, background: theme.accentLight }} />}
          </div>
          <Hl r={bar} from={tapBar - 18} to={go} />
          <Finger taps={[{ f: tapBar, x: 120, y: 28 }, { f: go, x: 340, y: 28 }]} fromEdge={{ x: 300, y: 600 }} />
        </div>
      </Phone>
    </SceneShell>
  );
};

/* ─────────────────────────────── 3. LOGIN ─────────────────────────────── */
const pad2 = (n: number) => String(n).padStart(2, "0");
export const Login: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const idTap = L[1] + S(2.2), idType0 = L[2] + S(1.2), idType1 = idType0 + S(2.4);
  const pwTap = L[3] + S(1.6), pwType0 = pwTap + 22, pwType1 = pwType0 + S(1.5);
  const subTap = L[4] + S(1.3);
  const idN = Math.round(tw(f, [[idType0, 0], [idType1, LM.idChars]]));
  const pwN = Math.round(tw(f, [[pwType0, 0], [pwType1, LM.pwChars]]));
  const submitting = f >= subTap + 8;
  const src = submitting ? "login_m_submitting.png" : pwN > 0 || f > pwTap ? `login_m_pw_${pad2(pwN)}.png` : `login_m_id_${pad2(idN)}.png`;
  const R = (k: string) => LM[k] as Rect;
  const cam = camT(f, [[0, 1, 195, 422], [idTap - 22, 1, 195, 422], [idTap - 4, 1.5, 195, R("identifier").y + 20], [pwTap - 26, 1.5, 195, R("identifier").y + 20], [pwTap - 8, 1.5, 195, R("password").y + 20], [subTap - 30, 1.5, 195, R("password").y + 20], [subTap - 10, 1.4, 195, R("submit").y], [subTap + 40, 1.4, 195, R("submit").y], [subTap + 70, 1, 195, 422]]);
  const caps: Cap[] = [
    { from: 6, to: idTap - 6, step: "The login screen", title: "Welcome Back", sub: "Two details are all you need." },
    { from: idTap - 4, to: pwTap - 8, step: "Step 2", title: "Enter your email or admission number", sub: "Example: ADM-2026-001 (demonstration only)" },
    { from: pwTap - 6, to: subTap - 8, step: "Step 3", title: "Enter your password", sub: "The password given to you by the school." },
    { from: subTap - 6, to: sc.dur - 6, step: "Step 4", title: "Tap Sign In" },
  ];
  return (
    <SceneShell sc={sc} narration={narration} chip={["01", "LOGIN"]}>
      <Captions caps={caps} />
      <Phone cam={cam}>
        <Shot src={src} />
        <Hl r={R("identifier")} from={idTap - 20} to={pwTap - 8} />
        <Hl r={R("password")} from={pwTap - 20} to={subTap - 8} />
        <Hl r={R("submit")} from={subTap - 24} to={subTap + 30} radius={30} />
        <Finger taps={[{ f: idTap, x: 120, y: cy(R("identifier")) }, { f: pwTap, x: 120, y: cy(R("password")) }, { f: subTap, x: 195, y: cy(R("submit")) }]} fromEdge={{ x: 300, y: 760 }} />
      </Phone>
    </SceneShell>
  );
};

/* ─────────────────────────────── 4. LOADING ─────────────────────────────── */
export const Loading: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const a = L[0] + 10, b = a + S(2.4), c = b + S(2.4);
  const idx = f < b ? 1 : f < c ? 2 : 3;
  const msg = ["Checking your access…", "Opening your portal…", "Your portal is ready"][idx - 1];
  return (
    <SceneShell sc={sc} narration={narration} chip={["01", "LOGIN"]}>
      <Captions caps={[{ from: 6, to: sc.dur - 8, step: "After Sign In", title: msg, sub: "This only takes a moment." }]} />
      <Phone>
        <Shot src="login_m_submitting.png" opacity={f < a ? 1 : 0} />
        {[1, 2, 3].map((k) => <Shot key={k} src={`loading_m_${k}.png`} opacity={idx === k && f >= a ? 1 : 0} />)}
      </Phone>
      <Sfx at={c} name="chime" />
    </SceneShell>
  );
};

/* ─────────────────────────────── 5. OVERVIEW ─────────────────────────────── */
export const Overview: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const t = L[0];
  const top: Rect = { x: 0, y: 0, w: 390, h: 61 }, hero: Rect = { x: 12, y: 80, w: 366, h: 230 };
  const nav: Rect = { x: 6, y: PM.nav.y + 2, w: 378, h: PM.nav.h - 4 };
  const cam = camT(f, [[0, 1, 195, 422], [t + 40, 1.45, 195, 40], [t + 150, 1.45, 195, 40], [t + 190, 1.3, 195, 190], [t + 320, 1.3, 195, 190], [t + 360, 1.4, 195, 760]]);
  return (
    <SceneShell sc={sc} narration={narration} chip={["02", "YOUR CHILD'S PORTAL"]}>
      <Captions caps={[
        { from: 6, to: t + 160, title: "Your Child's Portal", sub: "Everything is one tap away." },
        { from: t + 170, to: t + 330, step: "Pupil Portal", title: "Your child's name, class and session", sub: "Shown at the top of every visit." },
        { from: t + 340, to: sc.dur - 8, step: "Pupil Portal", title: "Four sections", sub: "Profile · Tests/Exams · Results · Fees" },
      ]} />
      <Phone cam={cam}>
        <PupilView scroll={0} active="profile">
          <Hl r={top} from={t + 30} to={t + 160} pad={0} radius={0} />
          <Hl r={hero} from={t + 180} to={t + 330} radius={22} />
          <Hl r={nav} from={t + 350} to={sc.dur - 10} pad={0} radius={10} />
        </PupilView>
      </Phone>
    </SceneShell>
  );
};

/* ─────────────────────────────── 6. PROFILE ─────────────────────────────── */
export const Profile: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const scroll = tw(f, [[L[0] + 30, 0], [L[0] + 200, 230], [L[1] + 150, 330]]);
  const fields: Rect[] = [{ x: 32, y: 428, w: 326, h: 44 }, { x: 32, y: 506, w: 326, h: 44 }];
  const badges: Rect = { x: 80, y: 130, w: 215, h: 78 };
  const cam = camT(f, [[0, 1.15, 195, 300], [L[0] + 60, 1.3, 195, 300], [sc.dur - 20, 1.3, 195, 380]]);
  return (
    <SceneShell sc={sc} narration={narration} chip={["02", "YOUR CHILD'S PORTAL"]}>
      <Captions caps={[
        { from: 6, to: L[1] - 6, step: "Profile", title: "Your child's school information" },
        { from: L[1] - 4, to: sc.dur - 8, step: "Profile", title: "Name, admission number, class and teacher" },
      ]} />
      <Phone cam={cam}>
        <PupilView scroll={scroll} active="profile">
          <Hl r={rel(badges, scroll)} from={L[0] + 20} to={L[0] + 150} />
          <Hl r={rel(fields[0], scroll)} from={L[1] + 10} to={L[1] + 90} />
          <Hl r={rel(fields[1], scroll)} from={L[1] + 60} to={L[1] + 140} />
        </PupilView>
      </Phone>
    </SceneShell>
  );
};

/* ─────────────────────────────── 7. NAVIGATION ─────────────────────────────── */
export const Nav: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const base = L[0] + S(3.4), gap = S(1.9);
  const taps = [{ f: base, k: "tests" }, { f: base + gap, k: "results" }, { f: base + gap * 2, k: "fees" }, { f: base + gap * 3, k: "profile" }];
  const scroll = scrollTrack(f, 0, taps.map((t) => [t.f, SCROLL[t.k]] as [number, number]));
  const active = activeAt(f, taps);
  const bar: Rect = { x: 6, y: PM.nav.y + 2, w: 378, h: PM.nav.h - 4 };
  const cam = camT(f, [[0, 1, 195, 422], [base - 30, 1.35, 195, 740], [base + gap * 3 + 40, 1.35, 195, 740], [sc.dur - 6, 1, 195, 422]]);
  return (
    <SceneShell sc={sc} narration={narration} chip={["02", "YOUR CHILD'S PORTAL"]}>
      <Captions caps={[{ from: 6, to: sc.dur - 8, step: "On a phone", title: "Use the navigation bar to move between sections", sub: "Profile · Tests/Exams · Results · Fees" }]} />
      <Phone cam={cam}>
        <PupilView scroll={scroll} active={active}>
          <Hl r={bar} from={base - 40} to={base + gap * 3 + 30} pad={0} radius={10} />
          <Finger taps={taps.map((t) => ({ f: t.f, ...navPt(t.k) }))} fromEdge={{ x: 330, y: 700 }} />
        </PupilView>
      </Phone>
    </SceneShell>
  );
};

/* ─────────────────────────────── 8. TESTS ─────────────────────────────── */
export const Tests: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const tapT = L[0] + S(0.5);
  const cards = PM.testCards.filter((c: any) => c.cls.startsWith("cbt-test-card ")) as Rect[];
  const open = cards[0], done = cards[1];
  const btn = PM.testButtons[0] as Rect;
  const startTap = L[2] + S(3.6);
  const scroll = scrollTrack(f, 0, [[tapT, SCROLL.tests]]);
  const cam = camT(f, [[0, 1, 195, 422], [tapT + 30, 1.0, 195, 422], [L[1] + 10, 1.4, 195, 360], [L[2] + 10, 1.4, 195, 470], [L[3] + 10, 1.4, 195, 520], [sc.dur - 6, 1.4, 195, 520]]);
  const caps: Cap[] = [
    { from: 6, to: L[1] - 6, step: "Tests/Exams", title: "Tap Tests/Exams", sub: "Check online tests and exams." },
    { from: L[1] - 4, to: L[2] - 6, step: "Tests/Exams", title: "Subject, type, time allowed and status" },
    { from: L[2] - 4, to: L[3] - 6, step: "Tests/Exams", title: "Tap Start Test when a test is open" },
    { from: L[3] - 4, to: sc.dur - 8, step: "Tests/Exams", title: "Completed tests are marked Completed" },
  ];
  const taps: Tap[] = [{ f: tapT, ...navPt("tests") }];
  const active = activeAt(f, [{ f: tapT, k: "tests" }]);
  return (
    <SceneShell sc={sc} narration={narration} chip={["03", "TESTS & EXAMS"]}>
      <Captions caps={caps} />
      <Phone cam={cam}>
        <PupilView scroll={scroll} active={active}>
          <Hl r={rel(open, SCROLL.tests)} from={L[1] + 6} to={L[2] - 6} radius={16} />
          <Hl r={rel(btn, SCROLL.tests)} from={L[2] + 10} to={L[3] - 8} radius={24} />
          <Hl r={rel(done, SCROLL.tests)} from={L[3] + 8} to={sc.dur - 10} radius={16} />
          <Finger taps={[...taps, { f: startTap, x: cx(btn), y: cy(rel(btn, SCROLL.tests)), silent: true }].filter((t, i) => i === 0 || t.f < L[3])} fromEdge={{ x: 330, y: 700 }} />
        </PupilView>
      </Phone>
    </SceneShell>
  );
};

/* ─────────────────────────────── 9. RESULTS ─────────────────────────────── */
const histH = M.pupilMobile.resultsHist;
export const Results: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const tapR = L[0] + S(1.6), selTap = L[1] + S(2.0), pick = selTap + S(1.6), tblStart = L[2] + 6;
  const hist = f >= pick + 8;
  const sel = EL.session as Rect, table = EL.resultsTable as Rect;
  const open = f >= selTap + 6 && f < pick + 6;
  let scroll = scrollTrack(f, 0, [[tapR, SCROLL.results]]);
  if (f > tblStart) scroll = tw(f, [[0, 0], [tblStart, SCROLL.results], [tblStart + 60, SCROLL.results + 150], [sc.dur - 30, SCROLL.results + 330]]);
  const histScroll = tw(f, [[pick + 10, 40], [sc.dur - 10, 360]]);
  const cam = camT(f, [[0, 1, 195, 422], [tapR + 30, 1, 195, 422], [selTap - 24, 1.5, 195, 330], [pick + 30, 1.5, 195, 330], [tblStart + 20, 1.4, 195, 430], [sc.dur - 10, 1.4, 195, 430]]);
  const showTable = !hist ? f > L[2] - 4 : f > L[2] - 4;
  const caps: Cap[] = [
    { from: 6, to: L[1] - 6, step: "Results", title: "Tap Results", sub: "View academic results." },
    { from: L[1] - 4, to: L[2] - 6, step: "Results", title: "Select an academic session" },
    { from: L[2] - 4, to: sc.dur - 8, step: "Results", title: "Results by term", sub: "Subject · CA · Exam · Total · Grade" },
  ];
  const dd = { x: sel.x, y: sel.y + sel.h + 4 - scroll, w: sel.w };
  return (
    <SceneShell sc={sc} narration={narration} chip={["04", "RESULTS"]}>
      <Captions caps={caps} />
      <Phone cam={cam}>
        {!hist ? (
          <PupilView scroll={scroll} active={activeAt(f, [{ f: tapR, k: "results" }])}>
            <Hl r={rel(sel, scroll)} from={selTap - 30} to={pick + 4} />
            {showTable && <Hl r={rel(table, scroll)} from={L[2] + 4} to={sc.dur - 6} radius={10} />}
            {open && (
              <div style={{ position: "absolute", left: dd.x, top: dd.y, width: dd.w, background: "#fff", borderRadius: 12, boxShadow: "0 12px 30px rgba(15,23,42,.28)", border: "1px solid #D5DCE8", fontFamily: sansStack, fontSize: 15, overflow: "hidden" }}>
                {PM.sessionOptions.map((o: string, i: number) => <div key={i} style={{ padding: "12px 14px", background: i === (f >= pick - 12 ? 1 : 0) ? "#EAF0FD" : "#fff", color: "#1E293B" }}>{o}</div>)}
              </div>
            )}
            <Finger taps={[{ f: tapR, ...navPt("results") }, { f: selTap, x: cx(sel), y: cy(rel(sel, SCROLL.results)) }, { f: pick, x: cx(sel), y: cy(rel(sel, SCROLL.results)) + 74 }]} fromEdge={{ x: 330, y: 700 }} />
          </PupilView>
        ) : (
          <>
            <Img src={portal("pupil_m_results_hist.png")} style={{ position: "absolute", left: 0, top: 70 - histScroll, width: 390, opacity: fade(f, pick + 8, pick + 22) }} />
            <div style={{ position: "absolute", left: 0, top: 0, width: 390, height: 61, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,.10)" }}><Img src={portal("pupil_m_topbar.png")} style={{ width: 390, height: 61 }} /></div>
            <div style={{ position: "absolute", left: 0, top: PM.nav.y, width: 390, height: PM.nav.h, background: "#fff" }}><Img src={portal("pupil_m_bottomnav_results.png")} style={{ width: 390, height: PM.nav.h }} /></div>
          </>
        )}
      </Phone>
    </SceneShell>
  );
};

/* ─────────────────────────────── 10. REPORT CARD ─────────────────────────────── */
const Pill: React.FC<{ from: number; to: number; text: string }> = ({ from, to, text }) => {
  const f = useCurrentFrame();
  const o = Math.min(fade(f, from, from + 14), 1 - fade(f, to - 12, to));
  if (o <= 0) return null;
  return <div style={{ position: "absolute", left: 0, right: 0, bottom: 110, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
    <div style={{ background: theme.accent, color: "#fff", fontFamily: sansStack, fontWeight: 700, fontSize: 34, padding: "18px 40px", borderRadius: 46, boxShadow: "0 16px 40px rgba(27,58,122,.35)" }}>{text}</div>
  </div>;
};
export const Report: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const btn = EL.printReport as Rect;
  const tap = L[0] + S(3.2), swap = tap + 24;
  const showWin = f >= swap;
  const base = SCROLL.results + 330;
  const scroll = tw(f, [[0, SCROLL.results + 150], [L[0] + 10, base]]);
  const phoneCam = camT(f, [[0, 1, 195, 422], [tap - 40, 1.4, 195, 700], [swap, 1.4, 195, 700]]);
  const winH = M.report_d.fullHeight;
  const winCam = camT(f, [[swap, 1.0, 550, 480], [swap + 40, 1.7, 550, 120], [L[1] + 20, 1.7, 550, 330], [sc.dur - 20, 1.7, 550, 700]]);
  const winIn = fade(f, swap, swap + 16);
  return (
    <SceneShell sc={sc} narration={narration} chip={["05", "REPORT CARD"]}>
      {!showWin && <Captions width={620} caps={[{ from: 6, to: swap, step: "Report card", title: "Open your complete report card", sub: "Tap View & Print Report Card." }]} />}
      {!showWin ? (
        <Phone cam={phoneCam}>
          <PupilView scroll={scroll} active="results">
            <Hl r={rel(btn, scroll)} from={L[0] + 20} to={tap + 14} radius={22} />
            <Finger taps={[{ f: tap, x: cx(btn), y: cy(rel(btn, scroll)) }]} fromEdge={{ x: 330, y: 760 }} />
          </PupilView>
        </Phone>
      ) : (
        <>
          <Win w={1100} h={winH} url="www.fahmidschool.com.ng/print-results" x={960} y={560} scale={0.92} cam={winCam} opacity={winIn}>
            <Img src={portal("report_d_full.png")} style={{ width: 1100, display: "block" }} />
          </Win>
          <Pill from={swap + 10} to={L[1] - 4} text="Your child's report card" />
          <Pill from={L[1] + 6} to={sc.dur - 8} text="View it, then print or save it" />
        </>
      )}
    </SceneShell>
  );
};

/* ─────────────────────────────── 11. FEES ─────────────────────────────── */
const FY = EL.fees.y; // section top on the full page
const feeRects = { current: { x: 32, y: FY + 102, w: 156, h: 105 } as Rect, paid: { x: 201, y: FY + 102, w: 156, h: 105 } as Rect, out: { x: 32, y: FY + 219, w: 156, h: 82 } as Rect, history: { x: 32, y: FY + 330, w: 326, h: 440 } as Rect };
export const Fees: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const tapF = L[0] + S(1.2);
  const scroll = tw(f, [[0, SCROLL.results + 330], [tapF + 3, SCROLL.results + 330], [tapF + 30, SCROLL.fees], [L[2] + 10, SCROLL.fees], [sc.dur - 20, SCROLL.fees + 300]]);
  const cam = camT(f, [[0, 1, 195, 422], [tapF + 30, 1.0, 195, 422], [L[1] + 10, 1.4, 195, 230], [L[2] + 10, 1.4, 195, 480], [sc.dur - 10, 1.4, 195, 520]]);
  const fs = scroll;
  return (
    <SceneShell sc={sc} narration={narration} chip={["06", "FEES"]}>
      <Captions caps={[
        { from: 6, to: L[1] - 6, step: "Fees", title: "Tap Fees", sub: "Check fees and payment history." },
        { from: L[1] - 4, to: L[2] - 6, step: "Fees", title: "Fee, amount paid and balance", sub: "Demonstration amounts shown." },
        { from: L[2] - 4, to: sc.dur - 8, step: "Fees", title: "Your payment history" },
      ]} />
      <Phone cam={cam}>
        <PupilView scroll={scroll} active={activeAt(f, [{ f: tapF, k: "fees" }], "results")}>
          <Hl r={rel(feeRects.current, fs)} from={L[1] + 10} to={L[1] + 70} /><Hl r={rel(feeRects.paid, fs)} from={L[1] + 50} to={L[1] + 110} /><Hl r={rel(feeRects.out, fs)} from={L[1] + 90} to={L[2] - 8} />
          <Hl r={rel(feeRects.history, fs)} from={L[2] + 10} to={sc.dur - 10} radius={16} />
          <Finger taps={[{ f: tapF, ...navPt("fees") }]} fromEdge={{ x: 330, y: 700 }} />
        </PupilView>
      </Phone>
    </SceneShell>
  );
};

/* ─────────────────────────────── 12. PAYMENT + RECEIPT ─────────────────────────────── */
export const Receipt: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const rb = PM.feeButtons[0] as Rect;
  const tap = L[0] + S(4.2), swap = tap + 22;
  const base = SCROLL.fees + 300;
  const scroll = tw(f, [[0, base], [L[0] + 40, FY + 300 - 120]]);
  const txn: Rect = { x: 48, y: FY + 425, w: 294, h: 150 };
  const sh = FY + 300 - 120;
  const cam = camT(f, [[0, 1.25, 195, 420], [tap - 30, 1.4, 270, 420], [swap + 10, 1.0, 195, 422], [L[1] + 20, 1.0, 195, 422], [sc.dur - 20, 1.3, 195, 250]]);
  const showR = f >= swap;
  return (
    <SceneShell sc={sc} narration={narration} chip={["06", "FEES"]}>
      <Captions caps={[
        { from: 6, to: swap, step: "Payment history", title: "Date, term and payment method", sub: "Tap View Receipt." },
        { from: swap + 6, to: sc.dur - 8, step: "Receipt", title: "Keep a record of a payment", sub: "Demonstration receipt." },
      ]} />
      <Phone cam={cam}>
        {!showR ? (
          <PupilView scroll={scroll} active="fees">
            <Hl r={rel(txn, sh)} from={L[0] + 40} to={tap - 10} radius={14} />
            <Hl r={rel(rb, sh)} from={tap - 28} to={tap + 14} radius={14} />
            <Finger taps={[{ f: tap, x: cx(rb), y: cy(rel(rb, sh)) }]} fromEdge={{ x: 330, y: 700 }} />
          </PupilView>
        ) : (
          <Shot src="receipt_m_full.png" opacity={fade(f, swap, swap + 14)} />
        )}
      </Phone>
    </SceneShell>
  );
};

/* ─────────────────────────────── 13. FORGOT PASSWORD ─────────────────────────────── */
export const Forgot: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const fg = LM.forgot as Rect, em = LM.forgotEmail as Rect, sub = LM.forgotSubmit as Rect;
  const tapF = L[0] + S(3.2), t0 = L[1] + S(0.8), t1 = t0 + S(1.7), sendTap = L[1] + S(4.0), done = sendTap + S(1.2);
  const k = Math.min(LM.forgotSteps - 1, Math.round(tw(f, [[t0, 0], [t1, LM.forgotSteps - 1]])));
  const src = f < tapF + 10 ? "login_m_empty.png" : f >= done ? "login_m_forgot_success.png" : f >= t1 ? "login_m_forgot_full.png" : f >= t0 ? `login_m_forgot_${pad2(k)}.png` : "login_m_forgot.png";
  const cam = camT(f, [[0, 1, 195, 422], [tapF - 30, 1.5, 100, 680], [tapF + 14, 1.4, 195, 520], [sendTap - 24, 1.4, 195, 560], [done + 20, 1.2, 195, 440]]);
  return (
    <SceneShell sc={sc} narration={narration} chip={["07", "PASSWORD HELP"]}>
      <Captions caps={[
        { from: 6, to: t0 - 4, step: "Password help", title: "Forgot your password?", sub: "Tap it on the login screen." },
        { from: t0 - 2, to: done, step: "Password help", title: "Enter your email, then tap Send Reset Link" },
        { from: done + 4, to: sc.dur - 8, step: "Password help", title: "Check your inbox", sub: "Follow the reset link in the email." },
      ]} />
      <Phone cam={cam}>
        <Shot src={src} />
        {f < tapF + 10 && <Hl r={fg} from={tapF - 40} to={tapF + 8} pad={6} radius={8} />}
        {f >= tapF + 10 && f < done && <Hl r={f < sendTap - 20 ? em : sub} from={tapF + 12} to={done} radius={f < sendTap - 20 ? 12 : 30} />}
        <Finger taps={[{ f: tapF, x: cx(fg), y: cy(fg) }, { f: sendTap, x: cx(sub), y: cy(sub) }]} fromEdge={{ x: 300, y: 740 }} />
      </Phone>
      <Sfx at={done} name="chime" />
    </SceneShell>
  );
};

/* ─────────────────────────────── 14. REGISTRATION ─────────────────────────────── */
export const Register: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const tab = LM.tabRegister as Rect, tapF = L[0] + S(1.2);
  const reg = f >= tapF + 8;
  const lock: Rect = { x: 20, y: 380, w: 350, h: 330 };
  return (
    <SceneShell sc={sc} narration={narration} chip={["07", "ACCOUNT HELP"]}>
      <Captions caps={[{ from: 6, to: sc.dur - 8, step: "Account help", title: "Accounts are set up by the school", sub: "Need an account, or a correction? Please contact the school." }]} />
      <Phone cam={camT(f, [[0, 1, 195, 422], [tapF + 20, 1.2, 195, 480]])}>
        <Shot src="login_m_empty.png" opacity={reg ? 0 : 1} /><Shot src="login_m_register.png" opacity={reg ? fade(f, tapF + 8, tapF + 20) : 0} />
        {!reg && <Hl r={tab} from={tapF - 24} to={tapF + 8} radius={20} />}
        {reg && <Hl r={lock} from={tapF + 30} to={sc.dur - 8} radius={22} />}
        <Finger taps={[{ f: tapF, x: cx(tab), y: cy(tab) }]} fromEdge={{ x: 300, y: 740 }} />
      </Phone>
    </SceneShell>
  );
};

/* ─────────────────────────────── 15. LOGOUT ─────────────────────────────── */
export const Logout: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const lo = EL.logout as Rect, tapF = L[0] + S(3.6), out = f >= tapF + 10;
  return (
    <SceneShell sc={sc} narration={narration} chip={["08", "LOG OUT"]}>
      <Captions caps={[{ from: 6, to: sc.dur - 8, step: "When you are finished", title: "Tap Logout", sub: "Always log out on a shared device." }]} />
      <Phone cam={camT(f, [[0, 1, 195, 422], [tapF - 30, 1.5, 270, 40], [tapF + 40, 1.5, 270, 40], [sc.dur - 8, 1, 195, 422]])}>
        {!out ? <PupilView scroll={0} active="profile"><Hl r={lo} from={L[0] + 40} to={tapF + 8} radius={22} /></PupilView> : <Shot src="login_m_empty.png" opacity={fade(f, tapF + 10, tapF + 26)} />}
        {!out && <Finger taps={[{ f: tapF, x: cx(lo), y: cy(lo) }]} fromEdge={{ x: 300, y: 300 }} />}
      </Phone>
    </SceneShell>
  );
};

/* ─────────────────────────────── 16. DEVICES ─────────────────────────────── */
export const Devices: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame();
  const a = tw(f, [[10, 0], [34, 1]]), b = tw(f, [[S(2.2), 0], [S(2.2) + 24, 1]]), c = tw(f, [[S(4.2), 0], [S(4.2) + 24, 1]]);
  return (
    <SceneShell sc={sc} narration={narration} chip={["09", "ANY DEVICE"]}>
      <Captions center top={150} caps={[{ from: 6, to: sc.dur - 8, title: "Use the portal on your phone, tablet or computer" }]} />
      <Phone x={330} y={640} scale={0.62} opacity={a}><Shot src="pupil_m_full.png" /></Phone>
      <div style={{ position: "absolute", left: 560, top: 360, width: 380, height: 540, opacity: b, transform: `translateY(${(1 - b) * 30}px)`, borderRadius: 34, background: "#0b1020", padding: 12, boxSizing: "border-box", boxShadow: "0 40px 80px rgba(15,23,42,.30)" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 24, overflow: "hidden", background: "#fff", position: "relative" }}><Img src={portal("pupil_t_view.png")} style={{ width: "100%", display: "block" }} /></div>
      </div>
      <Win w={1440} h={900} url="www.fahmidschool.com.ng" x={1440} y={640} scale={0.46} opacity={c} radius={22}><Img src={portal("pupil_d_view.png")} style={{ width: 1440, display: "block" }} /></Win>
    </SceneShell>
  );
};

/* ─────────────────────────────── 17. SUMMARY ─────────────────────────────── */
export const Summary: React.FC<P> = ({ sc, narration }) => {
  const f = useCurrentFrame(); const L = sc.lines;
  const endAt = sc.dur - S(6.2);
  const p1 = 1 - fade(f, endAt - 14, endAt);
  const p2 = fade(f, endAt, endAt + 22);
  const chips = [["Profile", -440, -140], ["Tests/Exams", 440, -140], ["Results", -440, 140], ["Fees", 440, 140]] as const;
  return (
    <SceneShell sc={sc} narration={narration} swish={false}>
      <div style={{ position: "absolute", inset: 0, opacity: p1 }}>
        <Phone x={960} y={540} scale={0.86}><Shot src="pupil_m_full.png" /></Phone>
        {chips.map(([label, dx, dy], i) => {
          const o = tw(f, [[L[0] + 20 + i * 22, 0], [L[0] + 44 + i * 22, 1]]);
          return <div key={label} style={{ position: "absolute", left: 960 + dx - 150 + (1 - o) * (dx < 0 ? -40 : 40), top: 540 + dy - 40, width: 300, height: 80, opacity: o, borderRadius: 40, background: "#fff", boxShadow: "0 16px 40px rgba(27,58,122,.18)", border: `2px solid ${theme.accentPale}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sansStack, fontWeight: 700, fontSize: 32, color: theme.accent }}>{label}</div>;
        })}
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: p2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <Img src={staticFile("logo.png")} style={{ width: 170, height: 170, objectFit: "contain" }} />
        <div style={{ fontFamily: fontStack, fontSize: 84, color: theme.accent, marginTop: 30 }}>Everything you need, in one place.</div>
        <div style={{ width: 120, height: 5, background: theme.accentMid, borderRadius: 3, margin: "34px 0" }} />
        <div style={{ fontFamily: sansStack, fontSize: 34, fontWeight: 700, color: theme.gold, letterSpacing: 3 }}>{SCHOOL.toUpperCase()}</div>
        <div style={{ fontFamily: sansStack, fontSize: 30, color: "#42506B", marginTop: 10 }}>School Portal</div>
      </div>
    </SceneShell>
  );
};
```

---

## `src/guide/PortalGuide.tsx`

**ADD (new file)** this file in your `advert` repository. Puts the scenes, narration and music together.

```tsx
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { GuidePlan } from "./plan";
import { Backdrop, Ctx } from "./ui";
import * as Sc from "./scenes";

const MAP: Record<string, React.FC<any>> = {
  intro: Sc.Intro, access: Sc.Access, login: Sc.Login, loading: Sc.Loading, overview: Sc.Overview, profile: Sc.Profile,
  nav: Sc.Nav, tests: Sc.Tests, results: Sc.Results, report: Sc.Report, fees: Sc.Fees, receipt: Sc.Receipt,
  forgot: Sc.Forgot, register: Sc.Register, logout: Sc.Logout, devices: Sc.Devices, summary: Sc.Summary,
};

export const PortalGuide: React.FC<{ plan: GuidePlan }> = ({ plan }) => (
  <Ctx.Provider value={{ sfx: plan.sfx }}>
    <AbsoluteFill>
      <Backdrop />
      {plan.music && <Audio src={staticFile("audio/music.mp3")} loop volume={(f) => 0.1 * Math.min(1, (plan.total - f) / 60) * Math.min(1, f / 30)} />}
      {plan.scenes.map((sc) => {
        const C = MAP[sc.id];
        return <Sequence key={sc.id} from={sc.start} durationInFrames={sc.dur}><C sc={sc} narration={plan.narration} /></Sequence>;
      })}
    </AbsoluteFill>
  </Ctx.Provider>
);
```

---