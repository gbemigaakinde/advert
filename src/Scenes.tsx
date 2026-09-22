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
  KineticLine,
  SweepUnderline,
} from "./KineticType";

import {
  TrophyIcon,
  GraduationCapIcon,
  ChartIcon,
} from "./Icons";

import {
  ConfettiBurst,
} from "./Illustrations";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const clamp = (value: number) =>
  Math.max(0, Math.min(1, value));

const FadeUp: React.FC<{
  delay?: number;
  distance?: number;
  children: React.ReactNode;
}> = ({
  delay = 0,
  distance = 30,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const local = Math.max(0, frame - delay);

  const progress = spring({
    frame: local,
    fps,
    config: {
      damping: 15,
      stiffness: 130,
      mass: 0.7,
    },
  });

  return (
    <div
      style={{
        opacity: clamp(progress),
        transform: `translateY(${interpolate(
          progress,
          [0, 1],
          [distance, 0]
        )}px)`,
      }}
    >
      {children}
    </div>
  );
};

const FloatingOrb: React.FC<{
  size: number;
  x: number;
  y: number;
  color: string;
  delay?: number;
}> = ({
  size,
  x,
  y,
  color,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  const float =
    Math.sin((frame + delay) / 18) * 14;

  const rotate =
    Math.sin((frame + delay) / 27) * 5;

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        left: x,
        top: y + float,
        borderRadius: "50%",
        background: color,
        opacity: 0.7,
        transform: `rotate(${rotate}deg)`,
        filter: "blur(1px)",
      }}
    />
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 1 — Brand reveal                                                     */
/* -------------------------------------------------------------------------- */

export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: {
      damping: 11,
      stiffness: 150,
      mass: 0.65,
    },
  });

  const logoOpacity = interpolate(
    frame,
    [0, 10],
    [0, 1],
    {
      extrapolateRight: "clamp",
    }
  );

  const ringProgress = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: {
      damping: 13,
      stiffness: 110,
    },
  });

  const lineWidth = interpolate(
    frame,
    [30, 55],
    [0, 720],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill>
      <SceneBackground
        base={theme.surface}
        blobColorA={theme.accentPale}
        blobColorB={theme.goldLight}
        dotColor="rgba(27,58,122,0.055)"
      />

      <FloatingOrb
        size={180}
        x={60}
        y={250}
        color={theme.goldLight}
      />

      <FloatingOrb
        size={120}
        x={850}
        y={1380}
        color={theme.accentPale}
        delay={20}
      />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 360,
            height: 360,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              border: `2px solid ${theme.gold}`,
              opacity:
                0.55 *
                (1 -
                  interpolate(
                    frame,
                    [38, 70],
                    [0, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }
                  )),
              transform: `scale(${
                0.7 + ringProgress * 0.55
              })`,
            }}
          />

          <div
            style={{
              position: "absolute",
              width: 360,
              height: 360,
              borderRadius: "50%",
              border: `1px solid ${theme.accentLight}`,
              opacity: 0.12,
              transform: `scale(${
                0.55 + ringProgress * 0.55
              })`,
            }}
          />

          <Img
            src={staticFile("logo.png")}
            style={{
              width: 330,
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 35,
            textAlign: "center",
          }}
        >
          <FadeUp delay={35}>
            <div
              style={{
                fontFamily: fontStack,
                fontSize: 67,
                fontWeight: 700,
                color: theme.accent,
                lineHeight: 1.02,
              }}
            >
              Fahmid
            </div>
          </FadeUp>

          <FadeUp delay={44}>
            <div
              style={{
                fontFamily: fontStack,
                fontSize: 58,
                color: theme.goldDark,
                lineHeight: 1.08,
              }}
            >
              Nursery & Primary
            </div>
          </FadeUp>

          <div
            style={{
              height: 7,
              width: lineWidth,
              maxWidth: 720,
              marginTop: 24,
              borderRadius: 99,
              background: theme.gold,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 2 — Establishment + location                                         */
/* -------------------------------------------------------------------------- */

export const LocationEst: React.FC = () => {
  const frame = useCurrentFrame();

  const numberScale = spring({
    frame,
    fps: 30,
    config: {
      damping: 12,
      stiffness: 120,
    },
  });

  const mapPulse =
    1 + Math.sin(frame / 9) * 0.05;

  return (
    <AbsoluteFill>
      <SceneBackground
        base={theme.accent}
        blobColorA={theme.accentLight}
        blobColorB={theme.gold}
        dotColor="rgba(255,255,255,0.045)"
      />

      {/* Decorative map-like lines */}
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
        }}
      >
        <path
          d="M-100 450 C220 300 390 650 650 510 S960 300 1200 460"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
        />

        <path
          d="M-100 1420 C180 1300 350 1580 610 1450 S940 1270 1200 1420"
          fill="none"
          stroke={theme.gold}
          strokeWidth="4"
        />

        <circle
          cx="540"
          cy="970"
          r={150 * mapPulse}
          fill="none"
          stroke={theme.gold}
          strokeWidth="2"
        />

        <circle
          cx="540"
          cy="970"
          r={32 * mapPulse}
          fill={theme.gold}
        />
      </svg>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "0 70px",
        }}
      >
        <FadeUp>
          <div
            style={{
              fontFamily: sansStack,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 6,
              color: theme.gold,
            }}
          >
            ESTABLISHED
          </div>
        </FadeUp>

        <div
          style={{
            fontFamily: fontStack,
            fontSize: 132,
            lineHeight: 1,
            fontWeight: 700,
            color: "#FFFFFF",
            transform: `scale(${numberScale})`,
            marginTop: 12,
          }}
        >
          2007
        </div>

        <SweepUnderline
          width={230}
          color={theme.gold}
          startFrame={20}
          height={7}
        />

        <FadeUp delay={25} distance={45}>
          <div
            style={{
              marginTop: 60,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: fontStack,
                fontSize: 54,
                color: "#FFFFFF",
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              Alagbado,
            </div>

            <div
              style={{
                fontFamily: fontStack,
                fontSize: 54,
                color: theme.gold,
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              Ifako-Ijaiye
            </div>

            <div
              style={{
                fontFamily: sansStack,
                fontSize: 30,
                color: "rgba(255,255,255,0.75)",
                marginTop: 14,
              }}
            >
              Lagos State
            </div>
          </div>
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 3 — The emotional hook                                               */
/* -------------------------------------------------------------------------- */

export const Tagline: React.FC = () => {
  const frame = useCurrentFrame();

  const cardScale = spring({
    frame,
    fps: 30,
    config: {
      damping: 14,
      stiffness: 120,
    },
  });

  const cardY =
    Math.sin(frame / 18) * 8;

  const lineOpacity = interpolate(
    frame,
    [68, 88],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill>
      <SceneBackground
        base={theme.surfaceWarm}
        blobColorA={theme.accentPale}
        blobColorB={theme.goldLight}
        dotColor="rgba(27,58,122,0.045)"
      />

      {/* Floating visual language */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 230,
          width: 120,
          height: 120,
          borderRadius: 28,
          background: theme.goldLight,
          transform: `rotate(-14deg) translateY(${cardY}px)`,
          opacity: 0.75,
        }}
      />

      <div
        style={{
          position: "absolute",
          right: 70,
          top: 480,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: theme.accentPale,
          transform: `translateY(${-cardY}px)`,
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "0 60px",
        }}
      >
        {/* Main advert object */}
        <div
          style={{
            width: 780,
            padding: "58px 48px 62px",
            borderRadius: 38,
            background:
              "rgba(255,255,255,0.88)",
            border:
              "1px solid rgba(27,58,122,0.08)",
            boxShadow:
              "0 40px 100px rgba(27,58,122,0.13)",
            transform: `
              translateY(${cardY}px)
              rotate(${Math.sin(frame / 30) * 0.7}deg)
              scale(${cardScale})
            `,
          }}
        >
          <div
            style={{
              fontFamily: sansStack,
              fontSize: 24,
              letterSpacing: 4,
              color: theme.goldDark,
              fontWeight: 700,
              marginBottom: 28,
            }}
          >
            MORE THAN A CLASSROOM
          </div>

          <KineticLine
            text="Where Every Child"
            fontSize={61}
            color={theme.accent}
            fontFamily={fontStack}
            startFrame={8}
            perWordDelay={4}
          />

          <KineticLine
            text="Discovers Their Best"
            fontSize={61}
            color={theme.accent}
            fontFamily={fontStack}
            startFrame={25}
            perWordDelay={4}
          />

          <div
            style={{
              marginTop: 28,
              height: 5,
              width: interpolate(
                frame,
                [48, 72],
                [0, 540],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }
              ),
              background: theme.gold,
              borderRadius: 99,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 34,
            fontFamily: sansStack,
            fontSize: 28,
            color: theme.text,
            opacity: lineOpacity,
            textAlign: "center",
          }}
        >
          Learning. Character. Confidence.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 4 — Proof / numbers                                                   */
/* -------------------------------------------------------------------------- */

const ProofCard: React.FC<{
  value: number;
  suffix: string;
  label: string;
  delay: number;
  icon: React.ReactNode;
  width: number;
}> = ({
  value,
  suffix,
  label,
  delay,
  icon,
  width,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const local =
    Math.max(0, frame - delay);

  const entrance = spring({
    frame: local,
    fps,
    config: {
      damping: 13,
      stiffness: 120,
      mass: 0.65,
    },
  });

  const count = Math.round(
    interpolate(
      local,
      [0, 32],
      [0, value],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    )
  );

  const rotate =
    interpolate(
      entrance,
      [0, 1],
      [-3, 0]
    );

  return (
    <div
      style={{
        width,
        minHeight: 190,
        borderRadius: 28,
        background: "#FFFFFF",
        boxShadow:
          "0 25px 70px rgba(27,58,122,0.10)",
        border:
          "1px solid rgba(27,58,122,0.06)",
        transform: `
          translateX(${interpolate(
            entrance,
            [0, 1],
            [160, 0]
          )}px)
          rotate(${rotate}deg)
          scale(${entrance})
        `,
        opacity: entrance,
        padding: "26px 30px",
        display: "flex",
        alignItems: "center",
        gap: 25,
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 24,
          background: theme.accentPale,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontFamily: fontStack,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1,
            color: theme.accent,
          }}
        >
          {count}
          {suffix}
        </div>

        <div
          style={{
            fontFamily: sansStack,
            fontSize: 25,
            color: theme.text,
            marginTop: 8,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export const Stats: React.FC = () => {
  const frame = useCurrentFrame();

  const headingOpacity = interpolate(
    frame,
    [0, 18],
    [0, 1],
    {
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill>
      <SceneBackground
        base={theme.surface}
        blobColorA={theme.accentPale}
        blobColorB={theme.goldLight}
        dotColor="rgba(27,58,122,0.04)"
      />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            opacity: headingOpacity,
            fontFamily: fontStack,
            fontSize: 46,
            color: theme.accent,
            marginBottom: 42,
          }}
        >
          A track record parents can see.
        </div>

        <ProofCard
          value={18}
          suffix="+"
          label="Years of Excellence"
          delay={12}
          width={760}
          icon={
            <TrophyIcon
              size={52}
              color={theme.gold}
            />
          }
        />

        <div style={{ height: 22 }} />

        <ProofCard
          value={150}
          suffix="+"
          label="Pupils Enrolled"
          delay={27}
          width={760}
          icon={
            <GraduationCapIcon
              size={52}
              color={theme.gold}
            />
          }
        />

        <div style={{ height: 22 }} />

        <ProofCard
          value={98}
          suffix="%"
          label="Exam Pass Rate"
          delay={42}
          width={760}
          icon={
            <ChartIcon
              size={52}
              color={theme.gold}
            />
          }
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 5 — Values as moving cards                                           */
/* -------------------------------------------------------------------------- */

const ValueCard: React.FC<{
  number: string;
  title: string;
  description: string;
  delay: number;
  side: "left" | "right";
}> = ({
  number,
  title,
  description,
  delay,
  side,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const local =
    Math.max(0, frame - delay);

  const entrance = spring({
    frame: local,
    fps,
    config: {
      damping: 15,
      stiffness: 110,
    },
  });

  const direction =
    side === "left" ? -1 : 1;

  return (
    <div
      style={{
        width: 760,
        minHeight: 145,
        background: theme.accent,
        borderRadius: 28,
        padding: "25px 35px",
        display: "flex",
        alignItems: "center",
        gap: 26,
        color: "#FFFFFF",
        opacity: entrance,
        transform: `
          translateX(${interpolate(
            entrance,
            [0, 1],
            [direction * 450, 0]
          )}px)
          rotate(${interpolate(
            entrance,
            [0, 1],
            [direction * 3, 0]
          )}deg)
        `,
        boxShadow:
          "0 22px 60px rgba(27,58,122,0.18)",
      }}
    >
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: 22,
          background: theme.gold,
          color: theme.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontStack,
          fontSize: 34,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {number}
      </div>

      <div>
        <div
          style={{
            fontFamily: fontStack,
            fontSize: 35,
            fontWeight: 700,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontFamily: sansStack,
            fontSize: 21,
            opacity: 0.78,
            marginTop: 4,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};

export const Values: React.FC = () => {
  return (
    <AbsoluteFill>
      <SceneBackground
        base={theme.surfaceWarm}
        blobColorA={theme.accentPale}
        blobColorB={theme.goldLight}
        dotColor="rgba(27,58,122,0.045)"
      />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <FadeUp delay={0}>
          <div
            style={{
              fontFamily: fontStack,
              fontSize: 51,
              color: theme.accent,
              textAlign: "center",
              marginBottom: 48,
            }}
          >
            What children carry
            <br />
            beyond the classroom.
          </div>
        </FadeUp>

        <ValueCard
          number="01"
          title="Love & Care"
          description="A safe environment where children feel seen."
          delay={15}
          side="left"
        />

        <div style={{ height: 20 }} />

        <ValueCard
          number="02"
          title="Character"
          description="Respect, integrity and responsibility."
          delay={28}
          side="right"
        />

        <div style={{ height: 20 }} />

        <ValueCard
          number="03"
          title="Discipline"
          description="The habits that turn potential into progress."
          delay={41}
          side="left"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 6 — Parent testimonial                                                */
/* -------------------------------------------------------------------------- */

export const Testimonial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardEntrance = spring({
    frame,
    fps,
    config: {
      damping: 15,
      stiffness: 110,
      mass: 0.8,
    },
  });

  const quoteReveal = interpolate(
    frame,
    [18, 42],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const quoteY = interpolate(
    frame,
    [18, 42],
    [50, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const orbit =
    Math.sin(frame / 20) * 12;

  return (
    <AbsoluteFill>
      <SceneBackground
        base={theme.accent}
        blobColorA={theme.accentLight}
        blobColorB={theme.gold}
        dotColor="rgba(255,255,255,0.035)"
      />

      {/* Orbiting quotation marks */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 320 + orbit,
          fontFamily: fontStack,
          fontSize: 190,
          lineHeight: 1,
          color: theme.gold,
          opacity: 0.3,
        }}
      >
        “
      </div>

      <div
        style={{
          position: "absolute",
          right: 100,
          bottom: 320 - orbit,
          fontFamily: fontStack,
          fontSize: 190,
          lineHeight: 1,
          color: theme.gold,
          opacity: 0.25,
        }}
      >
        ”
      </div>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "0 65px",
        }}
      >
        <div
          style={{
            width: 820,
            padding: "62px 58px",
            borderRadius: 40,
            background:
              "rgba(255,255,255,0.97)",
            boxShadow:
              "0 35px 100px rgba(0,0,0,0.18)",
            transform: `
              scale(${cardEntrance})
              rotate(${interpolate(
                cardEntrance,
                [0, 1],
                [-2, 0]
              )}deg)
            `,
          }}
        >
          <div
            style={{
              fontFamily: sansStack,
              fontSize: 23,
              letterSpacing: 4,
              fontWeight: 700,
              color: theme.goldDark,
              marginBottom: 30,
            }}
          >
            A PARENT'S EXPERIENCE
          </div>

          <div
            style={{
              fontFamily: fontStack,
              fontSize: 39,
              lineHeight: 1.45,
              color: theme.accent,
              fontStyle: "italic",
              opacity: quoteReveal,
              transform: `translateY(${quoteY}px)`,
            }}
          >
            “I saw an improvement in my child since she began to attend the
            school. Her character and behaviour began to change greatly too.”
          </div>

          <div
            style={{
              marginTop: 34,
              paddingTop: 25,
              borderTop:
                "1px solid rgba(27,58,122,0.12)",
              fontFamily: sansStack,
              fontSize: 23,
              color: theme.text,
              opacity: quoteReveal,
            }}
          >
            Mr. Mohammed
            <span
              style={{
                color: theme.goldDark,
                marginLeft: 10,
              }}
            >
              · Parent, Primary 3
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 7 — Program experience                                               */
/* -------------------------------------------------------------------------- */

const ProgramPanel: React.FC<{
  age: string;
  title: string;
  accent: string;
  delay: number;
  direction: number;
}> = ({
  age,
  title,
  accent,
  delay,
  direction,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const local =
    Math.max(0, frame - delay);

  const entrance = spring({
    frame: local,
    fps,
    config: {
      damping: 14,
      stiffness: 120,
    },
  });

  return (
    <div
      style={{
        width: 820,
        height: 205,
        borderRadius: 34,
        background: "#FFFFFF",
        boxShadow:
          "0 25px 80px rgba(27,58,122,0.11)",
        display: "flex",
        overflow: "hidden",
        opacity: entrance,
        transform: `
          translateX(${interpolate(
            entrance,
            [0, 1],
            [direction * 500, 0]
          )}px)
          scale(${interpolate(
            entrance,
            [0, 1],
            [0.92, 1]
          )})
        `,
      }}
    >
      <div
        style={{
          width: 22,
          height: "100%",
          background: accent,
        }}
      />

      <div
        style={{
          flex: 1,
          padding: "34px 38px",
        }}
      >
        <div
          style={{
            fontFamily: sansStack,
            fontSize: 21,
            letterSpacing: 3,
            color: accent,
            fontWeight: 700,
          }}
        >
          {age}
        </div>

        <div
          style={{
            fontFamily: fontStack,
            fontSize: 46,
            color: theme.accent,
            fontWeight: 700,
            marginTop: 12,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 17,
            width: interpolate(
              entrance,
              [0, 1],
              [0, 350]
            ),
            height: 5,
            background: accent,
            borderRadius: 99,
          }}
        />
      </div>

      <div
        style={{
          width: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, rgba(234,240,253,0.8), rgba(245,233,204,0.65))",
          fontFamily: fontStack,
          fontSize: 70,
          color: accent,
        }}
      >
        {age.startsWith("AGES") ? "✦" : "↗"}
      </div>
    </div>
  );
};

export const Programs: React.FC = () => {
  const frame = useCurrentFrame();

  const centerScale =
    1 +
    Math.sin(frame / 17) * 0.018;

  return (
    <AbsoluteFill>
      <SceneBackground
        base={theme.surface}
        blobColorA={theme.accentPale}
        blobColorB={theme.goldLight}
        dotColor="rgba(27,58,122,0.04)"
      />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontFamily: fontStack,
            fontSize: 49,
            color: theme.accent,
            marginBottom: 44,
            textAlign: "center",
            transform: `scale(${centerScale})`,
          }}
        >
          A place to grow,
          <br />
          year after year.
        </div>

        <ProgramPanel
          age="AGES 2 – 5"
          title="Nursery Program"
          accent={theme.gold}
          delay={8}
          direction={-1}
        />

        <div style={{ height: 24 }} />

        <ProgramPanel
          age="PRIMARY 1 – 6"
          title="Primary Program"
          accent={theme.accent}
          delay={20}
          direction={1}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 8 — Conversion / final advert frame                                  */
/* -------------------------------------------------------------------------- */

export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoEntrance = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 120,
      mass: 0.7,
    },
  });

  const detailsOpacity = interpolate(
    frame,
    [42, 65],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const buttonProgress = spring({
    frame: Math.max(0, frame - 32),
    fps,
    config: {
      damping: 14,
      stiffness: 120,
    },
  });

  const pulse =
    1 + Math.sin(frame / 9) * 0.025;

  return (
    <AbsoluteFill>
      <SceneBackground
        base={theme.accent}
        blobColorA={theme.accentLight}
        blobColorB={theme.gold}
        dotColor="rgba(255,255,255,0.035)"
      />

      <ConfettiBurst
        startFrame={20}
        count={30}
      />

      {/* Large final glow */}
      <div
        style={{
          position: "absolute",
          width: 650,
          height: 650,
          borderRadius: "50%",
          left: 215,
          top: 180,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.11), transparent 68%)",
          transform: `scale(${pulse})`,
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "0 55px",
        }}
      >
        <Img
          src={staticFile("logo.png")}
          style={{
            width: 280,
            opacity: logoEntrance,
            transform: `scale(${logoEntrance})`,
          }}
        />

        <div
          style={{
            marginTop: 34,
            textAlign: "center",
          }}
        >
          <KineticLine
            text="Admissions Now Open"
            fontSize={54}
            color={theme.gold}
            fontFamily={fontStack}
            startFrame={14}
            perWordDelay={5}
          />
        </div>

        {/* CTA pill */}
        <div
          style={{
            marginTop: 44,
            padding: "20px 42px",
            borderRadius: 999,
            background: "#FFFFFF",
            color: theme.accent,
            fontFamily: sansStack,
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: 0.5,
            transform: `
              scale(${buttonProgress})
              translateY(${interpolate(
                buttonProgress,
                [0, 1],
                [25, 0]
              )}px)
            `,
            boxShadow:
              "0 18px 60px rgba(0,0,0,0.16)",
          }}
        >
          Enquire About Admission
        </div>

        <div
          style={{
            opacity: detailsOpacity,
            marginTop: 42,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: sansStack,
              fontSize: 31,
              color: "#FFFFFF",
              marginBottom: 12,
            }}
          >
            fahmidschool.com.ng
          </div>

          <div
            style={{
              fontFamily: sansStack,
              fontSize: 31,
              color: "#FFFFFF",
              marginBottom: 34,
            }}
          >
            +234 806 142 7297
          </div>

          <div
            style={{
              display: "inline-block",
              padding: "13px 24px",
              borderRadius: 999,
              border:
                "1px solid rgba(255,255,255,0.25)",
              fontFamily: sansStack,
              fontSize: 18,
              color: theme.goldLight,
              letterSpacing: 2.2,
            }}
          >
            ACADEMIC EXCELLENCE: OUR DUTY, OUR RIGHT
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
