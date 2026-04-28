import { component } from "@ochairo/beat";

import {
  Badge as HeadlessBadge,
  type BadgeProps,
  type BadgeTone,
} from "../../headless/atoms/Badge";

export type { BadgeProps };

const TONE_STYLES: Record<BadgeTone, { bg: string; text: string }> = {
  default: {
    bg: "var(--beat-ui-color-background-subtle)",
    text: "var(--beat-ui-color-text-muted)",
  },
  primary: {
    bg: "var(--beat-ui-color-background-accent-soft)",
    text: "var(--beat-ui-color-primary)",
  },
  success: { bg: "rgba(34,197,94,0.12)", text: "#22c55e" },
  warning: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
  danger: { bg: "rgba(248,113,113,0.12)", text: "#f87171" },
};

function getBadgeStyle(
  tone: BadgeTone,
  size: "sm" | "md",
  color: string | undefined,
): string {
  const { bg, text } = color
    ? { bg: `${color}22`, text: color }
    : TONE_STYLES[tone];

  return [
    "display:inline-flex",
    "align-items:center",
    "justify-content:center",
    "font-weight:700",
    "border-radius:999px",
    "white-space:nowrap",
    `font-size:${size === "sm" ? "0.65rem" : "0.75rem"}`,
    `padding:${size === "sm" ? "0.15rem 0.5rem" : "0.2rem 0.6rem"}`,
    `background:${bg}`,
    `color:${text}`,
  ].join(";");
}

export const Badge = component<BadgeProps>((props) => {
  return (
    <HeadlessBadge
      {...props}
      styles={{
        root: getBadgeStyle(
          props.tone ?? "default",
          props.size ?? "md",
          props.color,
        ),
      }}
    />
  );
});
