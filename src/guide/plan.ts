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
