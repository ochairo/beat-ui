import { component } from "@ochairo/beat";

import type {
  BeatUiAccessibilityProps,
  BeatUiContentProps,
  BeatUiPressProps,
} from "../../../foundations";

export interface CardStyles {
  readonly root?: string;
}

export interface CardProps
  extends BeatUiAccessibilityProps, BeatUiContentProps, BeatUiPressProps {
  readonly as?: "div" | "article" | "section" | "li";
  readonly elevation?: "flat" | "raised";
  readonly padding?: "none" | "sm" | "md" | "lg";
  readonly radius?: "sm" | "md" | "lg" | "xl";
  readonly ref?: (el: HTMLElement) => void;
  readonly style?: string;
  readonly styles?: CardStyles;
}

export const HlCard = component<CardProps>((props) => {
  const tag = props.as ?? "div";

  const attrs: Record<string, unknown> = {
    id: props.id,
    class: props.class,
    style: props.styles?.root,
    ref: props.ref,
    "aria-label": props.ariaLabel,
    "aria-labelledby": props.ariaLabelledby,
    "aria-describedby": props.ariaDescribedby,
    onClick: props.onPress,
  };

  if (tag === "article") return <article {...attrs}>{props.children}</article>;
  if (tag === "section") return <section {...attrs}>{props.children}</section>;
  if (tag === "li") return <li {...attrs}>{props.children}</li>;
  return <div {...attrs}>{props.children}</div>;
});
