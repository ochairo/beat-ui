import { component } from "@ochairo/beat";

import {
  CheckBox as HeadlessCheckBox,
  type CheckBoxProps,
} from "../../headless/atoms/CheckBox";

export type { CheckBoxProps };

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

export const CheckBox = component<CheckBoxProps>((props) => {
  return (
    <HeadlessCheckBox
      {...props}
      styles={{ root: labelStyle, input: inputStyle }}
    />
  );
});

export const Checkbox = CheckBox;
