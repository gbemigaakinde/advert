import React from "react";
import { Composition } from "remotion";
import { FahmidAdvert } from "./FahmidAdvert";
import { PortalGuide } from "./guide/PortalGuide";
import { buildPlan, FPS as GUIDE_FPS, GuidePlan } from "./guide/plan";

const FPS = 30;
const DURATION_IN_SECONDS = 30;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="FahmidAdvert"
        component={FahmidAdvert}
        durationInFrames={FPS * DURATION_IN_SECONDS}
        fps={FPS}
        width={1080}
        height={1920}
      />
      {/* Parent Portal Guide: 16:9 explainer. Length follows the narration automatically. */}
      <Composition
        id="ParentPortalGuide"
        component={PortalGuide as any}
        durationInFrames={GUIDE_FPS * 300}
        fps={GUIDE_FPS}
        width={1920}
        height={1080}
        defaultProps={{ plan: { scenes: [], total: 1, narration: false, music: false, sfx: false } as GuidePlan }}
        calculateMetadata={async () => {
          const plan = await buildPlan();
          return { durationInFrames: plan.total, props: { plan } };
        }}
      />
    </>
  );
};
