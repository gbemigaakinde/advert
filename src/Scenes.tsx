import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme, sansStack, fontStack } from "./theme";
import { SceneBackground } from "./Background";
import {
  PlaygroundIllustration,
  ReadingIllustration,
  ClassroomIllustration,
  GraduationIllustration,
  ConfettiBurst,
} from "./Illustrations";
import { KineticLine, SweepUnderline } from "./KineticType";
import { TrophyIcon, GraduationCapIcon, ChartIcon } from "./Icons";

// ---------- Scene 1: Logo reveal ----------
export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ringScale = spring({ frame, fps, config: { damping: 9, mass: 0.7 } });
  const ringOpacity = interpolate(frame, [0, 12, 26], [0, 0.5, 0], {
    extrapolateRight: "clamp",
  });
  const logoScale = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 11 },
  });
  const logoOpacity = interpolate(frame, [4, 18], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <SceneBackground
        base={theme.surface}
        blobColorA={theme.accentPale}
        blobColorB={theme.goldLight}
        dotColor="rgba(27,58,122,0.06)"
      />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}
      >
        <div style={{ position: "relative", width: 340, height: 340 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `4px solid ${theme.gold}`,
              transform: `scale(${1 + ringScale * 0.6})`,
              opacity: ringOpacity,
            }}
          />
          <Img
            src={staticFile("logo.png")}
            style={{
              width: 340,
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
            }}
          />
        </div>
        <div style={{ marginTop: 36, padding: "0 60px" }}>
          <KineticLine
            text="Fahmid Nursery"
            fontSize={62}
            color={theme.accent}
            fontFamily={fontStack}
            startFrame={40}
          />
          <KineticLine
            text="& Primary School"
            fontSize={62}
            color={theme.accent}
            fontFamily={fontStack}
            startFrame={52}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Scene 2: Est. / Location ----------
export const LocationEst: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <SceneBackground
        base={theme.accent}
        blobColorA={theme.accentLight}
        blobColorB={theme.gold}
      />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "0 70px" }}
      >
        <div
          style={{
            fontFamily: sansStack,
            fontSize: 32,
            letterSpacing: 5,
            color: theme.gold,
            marginBottom: 8,
            opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          EST. 2007
        </div>
        <div style={{ marginBottom: 14 }}>
          <SweepUnderline width={220} color={theme.gold} startFrame={8} />
        </div>
        <KineticLine
          text="Alagbado, Ifako-Ijaiye"
          fontSize={50}
          color="#FFFFFF"
          fontFamily={fontStack}
          startFrame={18}
        />
        <KineticLine
          text="Lagos State"
          fontSize={50}
          color="#FFFFFF"
          fontFamily={fontStack}
          startFrame={30}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Scene 3: Tagline + playground illustration ----------
export const Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const illustrationEntrance = spring({
    frame,
    fps,
    config: { damping: 12 },
  });
  const subOpacity = interpolate(frame, [65, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <SceneBackground
        base={theme.surface}
        blobColorA={theme.accentPale}
        blobColorB={theme.goldLight}
        dotColor="rgba(27,58,122,0.06)"
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <PlaygroundIllustration entrance={Math.min(illustrationEntrance, 1)} />
        <div style={{ marginTop: 20, padding: "0 70px" }}>
          <KineticLine
            text="Where Every Child"
            fontSize={58}
            color={theme.accent}
            fontFamily={fontStack}
            startFrame={10}
            perWordDelay={5}
          />
          <KineticLine
            text="Discovers Their Best"
            fontSize={58}
            color={theme.accent}
            fontFamily={fontStack}
            startFrame={26}
            perWordDelay={5}
          />
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: sansStack,
            fontSize: 26,
            color: theme.text,
            opacity: subOpacity,
            textAlign: "center",
            padding: "0 90px",
          }}
        >
          Since 2007, a place Lagos parents trust.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Scene 4: Stats ----------
const StatCard: React.FC<{
  value: number;
  suffix: string;
  label: string;
  delay: number;
  icon: React.ReactNode;
}> = ({ value, suffix, label, delay, icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);
  const scale = spring({ frame: localFrame, fps, config: { damping: 10, mass: 0.6 } });
  const rotate = interpolate(scale, [0, 1], [-6, 0]);
  const count = Math.round(
    interpolate(localFrame, [0, 25], [0, value], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div
      style={{
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderLeft: `10px solid ${theme.gold}`,
        borderRadius: 20,
        padding: "30px 50px",
        marginBottom: 26,
        width: 640,
        display: "flex",
        alignItems: "center",
        gap: 28,
      }}
    >
      <div>{icon}</div>
      <div>
        <div style={{ fontFamily: fontStack, fontSize: 66, fontWeight: 700, color: theme.accent }}>
          {count}
          {suffix}
        </div>
        <div style={{ fontFamily: sansStack, fontSize: 26, color: theme.text }}>{label}</div>
      </div>
    </div>
  );
};

export const Stats: React.FC = () => {
  return (
    <AbsoluteFill>
      <SceneBackground base={theme.surfaceWarm} blobColorA={theme.accentPale} blobColorB={theme.goldLight} dotColor="rgba(27,58,122,0.05)" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <StatCard
          value={18}
          suffix="+"
          label="Years of Excellence"
          delay={0}
          icon={<TrophyIcon size={54} color={theme.gold} />}
        />
        <StatCard
          value={150}
          suffix="+"
          label="Pupils Enrolled"
          delay={14}
          icon={<GraduationCapIcon size={54} color={theme.gold} />}
        />
        <StatCard
          value={98}
          suffix="%"
          label="Exam Pass Rate"
          delay={28}
          icon={<ChartIcon size={54} color={theme.gold} />}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Scene 5: Core values ----------
const ValueChip: React.FC<{ label: string; delay: number }> = ({ label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);
  const x = interpolate(
    spring({ frame: localFrame, fps, config: { damping: 14 } }),
    [0, 1],
    [-500, 0]
  );
  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `translateX(${x}px)`,
        opacity,
        backgroundColor: theme.accent,
        color: "#FFFFFF",
        fontFamily: sansStack,
        fontSize: 36,
        fontWeight: 600,
        padding: "22px 48px",
        borderRadius: 60,
        marginBottom: 22,
        width: 560,
      }}
    >
      {label}
    </div>
  );
};

export const Values: React.FC = () => {
  return (
    <AbsoluteFill>
      <SceneBackground base={theme.surface} blobColorA={theme.accentPale} blobColorB={theme.goldLight} dotColor="rgba(27,58,122,0.06)" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ fontFamily: fontStack, fontSize: 40, color: theme.goldDark, marginBottom: 36 }}>
          What We Stand For
        </div>
        <ValueChip label="Love & Care" delay={0} />
        <ValueChip label="Respect for Each Child" delay={8} />
        <ValueChip label="Integrity" delay={16} />
        <ValueChip label="Discipline" delay={24} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Scene 6: Testimonial + reading illustration ----------
export const Testimonial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const illustrationEntrance = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [15, 35], [25, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <SceneBackground base={theme.accent} blobColorA={theme.accentLight} blobColorB={theme.gold} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "0 70px" }}>
        <ReadingIllustration entrance={Math.min(illustrationEntrance, 1)} />
        <div style={{ opacity, transform: `translateY(${y}px)`, marginTop: 10 }}>
          <div
            style={{
              fontFamily: fontStack,
              fontSize: 40,
              color: "#FFFFFF",
              lineHeight: 1.4,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            &ldquo;I saw an improvement in my child since she began to attend
            the school. Her character and behaviour began to change greatly
            too.&rdquo;
          </div>
          <div
            style={{
              fontFamily: sansStack,
              fontSize: 26,
              color: theme.gold,
              textAlign: "center",
              marginTop: 24,
            }}
          >
            — Mr. Mohammed, Parent, Primary 3
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Scene 7: Programs + classroom illustration ----------
export const Programs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const illustrationEntrance = spring({ frame, fps, config: { damping: 12 } });
  const leftX = interpolate(
    spring({ frame, fps, config: { damping: 14 } }),
    [0, 1],
    [-400, 0]
  );
  const rightX = interpolate(
    spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 14 } }),
    [0, 1],
    [400, 0]
  );

  return (
    <AbsoluteFill>
      <SceneBackground base={theme.surfaceWarm} blobColorA={theme.accentPale} blobColorB={theme.goldLight} dotColor="rgba(27,58,122,0.05)" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <ClassroomIllustration entrance={Math.min(illustrationEntrance, 1)} />
        <div
          style={{
            transform: `translateX(${leftX}px)`,
            width: 660,
            backgroundColor: theme.surface,
            borderLeft: `10px solid ${theme.gold}`,
            borderRadius: 16,
            padding: "24px 36px",
            marginTop: 18,
            marginBottom: 18,
          }}
        >
          <div style={{ fontFamily: sansStack, fontSize: 24, color: theme.goldDark }}>AGES 2 – 5</div>
          <div style={{ fontFamily: fontStack, fontSize: 38, color: theme.text, fontWeight: 700 }}>
            Nursery Program
          </div>
        </div>
        <div
          style={{
            transform: `translateX(${rightX}px)`,
            width: 660,
            backgroundColor: theme.surface,
            borderLeft: `10px solid ${theme.accent}`,
            borderRadius: 16,
            padding: "24px 36px",
          }}
        >
          <div style={{ fontFamily: sansStack, fontSize: 24, color: theme.accentMid }}>PRIMARY 1 – 6</div>
          <div style={{ fontFamily: fontStack, fontSize: 38, color: theme.text, fontWeight: 700 }}>
            Primary Program
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Scene 8: Call to action ----------
export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const illustrationEntrance = spring({ frame, fps, config: { damping: 9, mass: 0.7 } });
  const detailsOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <SceneBackground base={theme.accent} blobColorA={theme.accentLight} blobColorB={theme.gold} />
      <ConfettiBurst startFrame={5} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "0 60px" }}>
        <GraduationIllustration entrance={Math.min(illustrationEntrance, 1)} />
        <div style={{ marginTop: 6 }}>
          <KineticLine
            text="Admissions Now Open"
            fontSize={44}
            color={theme.gold}
            fontFamily={fontStack}
            startFrame={16}
            perWordDelay={5}
          />
        </div>
        <div style={{ opacity: detailsOpacity, marginTop: 34, textAlign: "center" }}>
          <div style={{ fontFamily: sansStack, fontSize: 32, color: "#FFFFFF", marginBottom: 10 }}>
            fahmidschool.com.ng
          </div>
          <div style={{ fontFamily: sansStack, fontSize: 32, color: "#FFFFFF", marginBottom: 26 }}>
            +234 806 142 7297
          </div>
          <div
            style={{
              fontFamily: sansStack,
              fontSize: 20,
              color: theme.goldLight,
              letterSpacing: 2,
            }}
          >
            ACADEMIC EXCELLENCE: OUR DUTY, OUR RIGHT
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
