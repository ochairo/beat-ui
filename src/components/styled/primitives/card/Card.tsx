import { component } from "@ochairo/beat";

import {
  Card as HeadlessCard,
  type CardProps,
} from "../../../headless/primitives/Card";
import css from "./Card.module.css";

export type { CardProps };

const RADIUS_CLASS: Record<NonNullable<CardProps["radius"]>, string> = {
  sm: css["radiusSm"]!,
  md: css["radiusMd"]!,
  lg: css["radiusLg"]!,
  xl: css["radiusXl"]!,
};

const PADDING_CLASS: Record<NonNullable<CardProps["padding"]>, string> = {
  none: css["paddingNone"]!,
  sm: css["paddingSm"]!,
  md: css["paddingMd"]!,
  lg: css["paddingLg"]!,
};

export const Card = component<CardProps>((props) => {
  const cls = [
    css["root"]!,
    RADIUS_CLASS[props.radius ?? "md"],
    PADDING_CLASS[props.padding ?? "md"],
    props.elevation === "flat" ? css["flat"]! : undefined,
    props.onPress !== undefined ? css["pressable"]! : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <HeadlessCard
      {...props}
      class={cls}
      {...(props.style !== undefined ? { styles: { root: props.style } } : {})}
    />
  );
});
