import { component } from "@ochairo/beat";

import {
  HlBadge as HeadlessBadge,
  type BadgeProps,
  type BadgeTone,
} from "../../../headless/primitives/Badge";
import css from "./Badge.module.css";

export type { BadgeProps };

const TONE_CLASS: Record<BadgeTone, string | undefined> = {
  default: undefined,
  primary: css["primary"]!,
  success: css["success"]!,
  warning: css["warning"]!,
  danger: css["danger"]!,
};

export const Badge = component<BadgeProps>((props) => {
  const tone = props.tone ?? "default";
  const size = props.size ?? "md";
  const cls = [
    css["root"]!,
    TONE_CLASS[tone],
    size === "sm" ? css["sm"]! : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  const colorStyle =
    props.color !== undefined
      ? `--badge-bg:${props.color}22;--badge-color:${props.color}`
      : undefined;

  return (
    <HeadlessBadge
      {...props}
      class={cls}
      {...(colorStyle !== undefined ? { styles: { root: colorStyle } } : {})}
    />
  );
});
