import { component } from "@ochairo/beat";

import {
  Input as HeadlessInput,
  type InputProps,
} from "../../headless/atoms/Input";

export type { InputProps };

function getInputStyle(invalid: boolean | undefined): string {
  return [
    "width:100%",
    "box-sizing:border-box",
    "min-height:2.75rem",
    "padding:0.75rem 0.875rem",
    "border-radius:0.875rem",
    `border:1px solid ${invalid === true ? "var(--beat-ui-color-danger)" : "var(--beat-ui-color-border)"}`,
    "background:var(--beat-ui-color-input)",
    "color:var(--beat-ui-color-text)",
    "font:inherit",
    "outline:none",
    "transition:border-color 160ms ease,background-color 160ms ease,box-shadow 160ms ease",
  ].join(";");
}

export const Input = component<InputProps>((props) => {
  return (
    <HeadlessInput {...props} styles={{ root: getInputStyle(props.invalid) }} />
  );
});
