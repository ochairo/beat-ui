import { component } from "@ochairo/beat";

import {
  CardWrapper as HeadlessCardWrapper,
  type CardWrapperProps,
} from "../../headless/atoms/CardWrapper";

export type { CardWrapperProps };

const RADIUS: Record<NonNullable<CardWrapperProps["radius"]>, string> = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
};

const PADDING: Record<NonNullable<CardWrapperProps["padding"]>, string> = {
  none: "0",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1.25rem",
};

function buildStyle(props: CardWrapperProps): string {
  const radius = RADIUS[props.radius ?? "md"];
  const padding = PADDING[props.padding ?? "md"];
  const shadow =
    props.elevation === "flat" ? "none" : "0 1px 3px rgba(0,0,0,0.2)";

  const parts = [
    `padding:${padding}`,
    "background:var(--beat-ui-color-background-elevated)",
    "border:1px solid var(--beat-ui-color-border)",
    `border-radius:${radius}`,
    `box-shadow:${shadow}`,
    "transition:box-shadow 0.15s",
  ];

  if (props.onPress !== undefined) parts.push("cursor:pointer");
  if (props.style !== undefined) parts.push(props.style);

  return parts.join(";");
}

export const CardWrapper = component<CardWrapperProps>((props) => {
  return (
    <HeadlessCardWrapper {...props} styles={{ root: buildStyle(props) }} />
  );
});
