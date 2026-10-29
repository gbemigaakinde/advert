import React from "react";
import { Composition, registerRoot, staticFile } from "remotion";
import { GrammarShort, GFPS, GTOTAL, fallbackTiming } from "./Grammar";

// Stand-alone entry for the Grammar Short, so it renders without the portal screenshots
// that the Parent Portal Guide needs.
const GrammarRoot: React.FC = () =>
  React.createElement(Composition, {
    id: "GrammarShort",
    component: GrammarShort as any,
    durationInFrames: GTOTAL,
    fps: GFPS,
    width: 1080,
    height: 1920,
    defaultProps: { timing: fallbackTiming() },
    calculateMetadata: async () => {
      let timing = fallbackTiming();
      try {
        const r = await fetch(staticFile("grammar/timing.json"));
        if (r.ok) timing = await r.json();
      } catch (e) { /* not built yet: estimated timing */ }
      return { props: { timing } };
    },
  } as any);

registerRoot(GrammarRoot);
