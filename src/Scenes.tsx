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

// ---------- Scene 1: Logo reveal ----------
export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const nameOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nameY = interpolate(frame, [35, 55], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.surface,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 340,
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }}
      />
      <div
        style={{
          marginTop: 40,
          opacity: nameOpacity,
          transform: `translateY(${nameY}px)`,
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        <div
          style={{
            fontFamily: fontStack,
            fontSize: 64,
            fontWeight: 700,
            color: theme.accent,
            lineHeight: 1.1,
          }}
        >
          Fahmid Nursery
          <br />& Primary School
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 2: Est. / Location ----------
export const LocationEst: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 14 } });
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.accent,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
          padding: "0 70px",
        }}
      >
        <div
          style={{
            fontFamily: sansStack,
            fontSize: 34,
            letterSpacing: 4,
            color: theme.gold,
            marginBottom: 24,
          }}
        >
          ESTABLISHED 2007
        </div>
        <div
          style={{
            fontFamily: fontStack,
            fontSize: 52,
            color: "#FFFFFF",
            lineHeight: 1.3,
          }}
        >
          Alagbado, Ifako-Ijaiye
          <br />
          Lagos State
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 3: Tagline ----------
export const Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  const words = ["Where", "Every", "Child", "Discovers", "Their", "Best"];
  const perWord = 8;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.surface,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: fontStack,
          fontSize: 66,
          fontWeight: 700,
          color: theme.accent,
          textAlign: "center",
          padding: "0 80px",
          lineHeight: 1.25,
        }}
      >
        {words.map((word, i) => {
          const start = i * perWord;
          const opacity = interpolate(frame, [start, start + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(frame, [start, start + 12], [15, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span
              key={word}
              style={{
                display: "inline-block",
                opacity,
                transform: `translateY(${y}px)`,
                marginRight: 16,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 4: Stats ----------
const StatCard: React.FC<{
  value: number;
  suffix: string;
  label: string;
  delay: number;
}> = ({ value, suffix, label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);
  const scale = spring({ frame: localFrame, fps, config: { damping: 12 } });
  const count = Math.round(
    interpolate(localFrame, [0, 25], [0, value], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        backgroundColor: theme.accentPale,
        borderRadius: 24,
        padding: "36px 50px",
        marginBottom: 28,
        width: 620,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: fontStack,
          fontSize: 72,
          fontWeight: 700,
          color: theme.accent,
        }}
      >
        {count}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: sansStack,
          fontSize: 30,
          color: theme.text,
          marginTop: 6,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const Stats: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.surfaceWarm,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <StatCard value={18} suffix="+" label="Years of Excellence" delay={0} />
      <StatCard value={150} suffix="+" label="Pupils Enrolled" delay={15} />
      <StatCard value={98} suffix="%" label="Exam Pass Rate" delay={30} />
    </AbsoluteFill>
  );
};

// ---------- Scene 5: Core values ----------
const ValueChip: React.FC<{ label: string; delay: number }> = ({
  label,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);
  const scale = spring({ frame: localFrame, fps, config: { damping: 13 } });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        backgroundColor: theme.accent,
        color: "#FFFFFF",
        fontFamily: sansStack,
        fontSize: 36,
        fontWeight: 600,
        padding: "22px 48px",
        borderRadius: 60,
        marginBottom: 22,
      }}
    >
      {label}
    </div>
  );
};

export const Values: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.surface,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontFamily: fontStack,
          fontSize: 40,
          color: theme.goldDark,
          marginBottom: 40,
          letterSpacing: 1,
        }}
      >
        What We Stand For
      </div>
      <ValueChip label="Love & Care" delay={0} />
      <ValueChip label="Respect for Each Child" delay={10} />
      <ValueChip label="Integrity" delay={20} />
      <ValueChip label="Discipline" delay={30} />
    </AbsoluteFill>
  );
};

// ---------- Scene 6: Testimonial ----------
export const Testimonial: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [0, 20], [25, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.accent,
        alignItems: "center",
        justifyContent: "center",
        padding: "0 90px",
      }}
    >
      <div style={{ opacity, transform: `translateY(${y}px)` }}>
        <div
          style={{
            fontFamily: fontStack,
            fontSize: 46,
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
            fontSize: 28,
            color: theme.gold,
            textAlign: "center",
            marginTop: 34,
          }}
        >
          — Mr. Mohammed, Parent
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 7: Programs ----------
export const Programs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const leftScale = spring({ frame, fps, config: { damping: 13 } });
  const rightScale = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { damping: 13 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.surfaceWarm,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontFamily: fontStack,
          fontSize: 40,
          color: theme.accent,
          marginBottom: 40,
        }}
      >
        Our Academic Programs
      </div>
      <div
        style={{
          transform: `scale(${leftScale})`,
          width: 700,
          backgroundColor: theme.surface,
          borderLeft: `10px solid ${theme.gold}`,
          borderRadius: 16,
          padding: "30px 40px",
          marginBottom: 24,
        }}
      >
        <div
          style={{ fontFamily: sansStack, fontSize: 26, color: theme.goldDark }}
        >
          AGES 2 – 5
        </div>
        <div
          style={{
            fontFamily: fontStack,
            fontSize: 42,
            color: theme.text,
            fontWeight: 700,
          }}
        >
          Nursery Program
        </div>
      </div>
      <div
        style={{
          transform: `scale(${rightScale})`,
          width: 700,
          backgroundColor: theme.surface,
          borderLeft: `10px solid ${theme.accent}`,
          borderRadius: 16,
          padding: "30px 40px",
        }}
      >
        <div
          style={{ fontFamily: sansStack, fontSize: 26, color: theme.accentMid }}
        >
          PRIMARY 1 – 6
        </div>
        <div
          style={{
            fontFamily: fontStack,
            fontSize: 42,
            color: theme.text,
            fontWeight: 700,
          }}
        >
          Primary Program
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 8: Call to action ----------
export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const detailsOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.accent,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 60px",
      }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{ width: 200, transform: `scale(${logoScale})` }}
      />
      <div
        style={{
          fontFamily: fontStack,
          fontSize: 46,
          color: theme.gold,
          textAlign: "center",
          marginTop: 26,
          fontWeight: 700,
        }}
      >
        Admissions Now Open
      </div>
      <div
        style={{
          opacity: detailsOpacity,
          marginTop: 40,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: sansStack,
            fontSize: 32,
            color: "#FFFFFF",
            marginBottom: 10,
          }}
        >
          fahmidschool.com.ng
        </div>
        <div
          style={{
            fontFamily: sansStack,
            fontSize: 32,
            color: "#FFFFFF",
            marginBottom: 30,
          }}
        >
          +234 806 142 7297
        </div>
        <div
          style={{
            fontFamily: sansStack,
            fontSize: 22,
            color: theme.goldLight,
            letterSpacing: 2,
          }}
        >
          ACADEMIC EXCELLENCE: OUR DUTY, OUR RIGHT
        </div>
      </div>
    </AbsoluteFill>
  );
};
