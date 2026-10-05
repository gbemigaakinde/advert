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
