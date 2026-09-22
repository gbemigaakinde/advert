import React from "react";
import { Composition } from "remotion";
import { FahmidAdvert } from "./FahmidAdvert";

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
    </>
  );
};
