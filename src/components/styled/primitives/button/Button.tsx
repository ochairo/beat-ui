import { component } from "@ochairo/beat";

import {
  Button as HeadlessButton,
  type ButtonAppearance,
  type ButtonProps,
  type ButtonTone,
} from "../../../headless/primitives/Button";
import css from "./Button.module.css";

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

function getButtonVars(tone: ButtonTone, appearance: ButtonAppearance): string {
  const colors = colorMap[tone];
  const bg =
    appearance === "ghost"
      ? "transparent"
      : appearance === "soft"
        ? "var(--beat-ui-color-background-accent-soft)"
        : colors.base;
  const borderColor = appearance === "ghost" ? "transparent" : colors.base;
  const textColor = appearance === "solid" ? colors.text : colors.base;

  return `--btn-bg:${bg};--btn-border:${borderColor};--btn-color:${textColor}`;
}

export const Button = component<ButtonProps>((props) => {
  return (
    <HeadlessButton
      {...props}
      class={css["root"]!}
      styles={{
        root: getButtonVars(
          props.tone ?? "primary",
          props.appearance ?? "solid",
        ),
      }}
    />
  );
});
