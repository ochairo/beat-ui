import { component } from "@ochairo/beat";

import {
  TextArea as HeadlessTextArea,
  type TextAreaProps,
} from "../../headless/atoms/TextArea";

export type { TextAreaProps };

function getTextAreaStyle(invalid: boolean | undefined): string {
  return [
    "width:100%",
    "box-sizing:border-box",
    "min-height:5rem",
    "padding:0.75rem 0.875rem",
    "border-radius:0.875rem",
    `border:1px solid ${invalid === true ? "var(--beat-ui-color-danger)" : "var(--beat-ui-color-border)"}`,
    "background:var(--beat-ui-color-input)",
    "color:var(--beat-ui-color-text)",
    "font:inherit",
    "resize:vertical",
    "outline:none",
    "transition:border-color 160ms ease,background-color 160ms ease",
  ].join(";");
}

export const TextArea = component<TextAreaProps>((props) => {
  return (
    <HeadlessTextArea
      {...props}
      styles={{ root: getTextAreaStyle(props.invalid) }}
    />
  );
});
