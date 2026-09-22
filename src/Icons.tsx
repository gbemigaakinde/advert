import React from "react";

// Hand-drawn line icons, matching the flat-vector style of the rest of
// the video, used instead of emoji (which read as generic/AI-made).

export const TrophyIcon: React.FC<{ size?: number; color: string }> = ({
  size = 54,
  color,
}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path
      d="M14 8h20v10a10 10 0 0 1-20 0V8Z"
      stroke={color}
      strokeWidth={2.6}
      strokeLinejoin="round"
    />
    <path
      d="M14 10H7a2 2 0 0 0-2 2v2a7 7 0 0 0 7 7"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
    />
    <path
      d="M34 10h7a2 2 0 0 1 2 2v2a7 7 0 0 1-7 7"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
    />
    <path d="M24 28v8" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
    <path
      d="M16 40h16"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
    />
    <path
      d="M18 40c0-3 2.5-4 6-4s6 1 6 4"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const GraduationCapIcon: React.FC<{ size?: number; color: string }> = ({
  size = 54,
  color,
}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path
      d="M4 18 24 9l20 9-20 9-20-9Z"
      stroke={color}
      strokeWidth={2.6}
      strokeLinejoin="round"
    />
    <path
      d="M13 22.5V32c0 2.8 4.9 5 11 5s11-2.2 11-5v-9.5"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M40 19v10"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
    />
  </svg>
);

export const ChartIcon: React.FC<{ size?: number; color: string }> = ({
  size = 54,
  color,
}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path
      d="M6 40h36"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
    />
    <path
      d="M6 32 17 21l8 8 17-17"
      stroke={color}
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M34 12h8v8"
      stroke={color}
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
