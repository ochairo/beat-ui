import { component } from "@ochairo/beat";

import type {
  BeatUiAccessibilityProps,
  BeatUiContentProps,
} from "../../../foundations";

export type BadgeTone =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger";

export interface BadgeStyles {
  readonly root?: string;
}

export interface BadgeProps
  extends BeatUiAccessibilityProps, BeatUiContentProps {
  readonly color?: string;
  readonly size?: "sm" | "md";
  readonly styles?: BadgeStyles;
  readonly tone?: BadgeTone;
}

export const HlBadge = component<BadgeProps>((props) => {
  return (
    <span
      id={props.id}
      class={props.class}
      aria-label={props.ariaLabel}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
      style={props.styles?.root}
    >
      {props.children}
    </span>
  );
});
