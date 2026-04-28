import { component } from "@ochairo/beat";

import {
  Button as HeadlessButton,
  type ButtonAppearance,
  type ButtonProps,
  type ButtonTone,
} from "../../headless/atoms/Button";

export type { ButtonProps };

const colorMap: Record<
  ButtonTone,
  { base: string; hover: string; text: string }
> = {
  primary: {
    base: "var(--beat-ui-color-primary)",
    hover: "var(--beat-ui-color-primary-hover)",
    text: "var(--beat-ui-color-primary-text)",
  },
  secondary: {
    base: "var(--beat-ui-color-secondary)",
    hover: "var(--beat-ui-color-secondary-hover)",
    text: "var(--beat-ui-color-secondary-text)",
  },
  danger: {
    base: "var(--beat-ui-color-danger)",
    hover: "var(--beat-ui-color-danger)",
    text: "var(--beat-ui-color-danger-text)",
  },
};

function getButtonStyle(
  tone: ButtonTone,
  appearance: ButtonAppearance,
  disabled: boolean | undefined,
): string {
  if (disabled) {
    return [
      "display:inline-flex",
      "align-items:center",
      "justify-content:center",
      "gap:0.5rem",
      "min-height:2.5rem",
      "padding:0.625rem 1rem",
      "border-radius:0.75rem",
      "border:1px solid var(--beat-ui-color-border)",
      "background:var(--beat-ui-color-background-elevated)",
      "color:var(--beat-ui-color-text-muted)",
      "cursor:not-allowed",
      "opacity:0.7",
      "font:inherit",
    ].join(";");
  }

  const colors = colorMap[tone];
  const background =
    appearance === "ghost"
      ? "transparent"
      : appearance === "soft"
        ? "var(--beat-ui-color-background-accent-soft)"
        : colors.base;
  const borderColor = appearance === "ghost" ? "transparent" : colors.base;
  const textColor = appearance === "solid" ? colors.text : colors.base;

  return [
    "display:inline-flex",
    "align-items:center",
    "justify-content:center",
    "gap:0.5rem",
    "min-height:2.5rem",
    "padding:0.625rem 1rem",
    "border-radius:0.75rem",
    `border:1px solid ${borderColor}`,
    `background:${background}`,
    `color:${textColor}`,
    "cursor:pointer",
    "font:inherit",
    "font-weight:600",
    "transition:background-color 160ms ease,border-color 160ms ease,color 160ms ease,transform 160ms ease",
  ].join(";");
}

export const Button = component<ButtonProps>((props) => {
  return (
    <HeadlessButton
      {...props}
      styles={{
        root: getButtonStyle(
          props.tone ?? "primary",
          props.appearance ?? "solid",
          props.disabled,
        ),
      }}
    />
  );
});
