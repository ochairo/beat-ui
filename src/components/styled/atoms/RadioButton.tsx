import { component } from "@ochairo/beat";

import {
  RadioButton as HeadlessRadioButton,
  type RadioButtonProps,
} from "../../headless/atoms/RadioButton";

export type { RadioButtonProps };

const labelStyle = [
  "display:inline-flex",
  "align-items:center",
  "gap:0.625rem",
  "color:var(--beat-ui-color-text)",
  "font:inherit",
  "cursor:pointer",
].join(";");

const inputStyle = [
  "width:1rem",
  "height:1rem",
  "accent-color:var(--beat-ui-color-primary)",
].join(";");

export const RadioButton = component<RadioButtonProps>((props) => {
  return (
    <HeadlessRadioButton
      {...props}
      styles={{ root: labelStyle, input: inputStyle }}
    />
  );
});
