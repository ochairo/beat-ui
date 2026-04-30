import { component } from "@ochairo/beat";

import type {
  BeatUiAccessibilityProps,
  BeatUiContentProps,
  BeatUiFocusHandlers,
  BeatUiPressProps,
} from "../../../foundations";

export type ButtonTone = "primary" | "secondary" | "danger";
export type ButtonAppearance = "solid" | "soft" | "ghost";

export interface ButtonStyles {
  readonly root?: string;
}

export interface ButtonProps
  extends
    BeatUiAccessibilityProps,
    BeatUiContentProps,
    BeatUiFocusHandlers,
    BeatUiPressProps {
  readonly appearance?: ButtonAppearance;
  readonly pressed?: boolean;
  readonly styles?: ButtonStyles;
  readonly tone?: ButtonTone;
  readonly type?: "button" | "submit" | "reset";
}

export const Button = component<ButtonProps>((props) => {
  const handleClick = (event: MouseEvent): void => {
    if (props.disabled) {
      event.preventDefault();
      return;
    }
    props.onPress?.(event);
  };

  return (
    <button
      type={props.type ?? "button"}
      id={props.id}
      name={props.name}
      class={props.class}
      disabled={props.disabled}
      aria-label={props.ariaLabel}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
      aria-pressed={props.pressed}
      style={props.styles?.root}
      onClick={handleClick}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    >
      {props.children}
    </button>
  );
});
