import { component } from "@ochairo/beat";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiControlledValueProps,
  type BeatUiFocusHandlers,
} from "../../../foundations";

export interface InputStyles {
  readonly root?: string;
}

export interface InputProps
  extends
    BeatUiAccessibilityProps,
    BeatUiControlledValueProps<string>,
    BeatUiFocusHandlers {
  readonly autoComplete?: string;
  readonly inputMode?: HTMLInputElement["inputMode"];
  readonly invalid?: boolean;
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly styles?: InputStyles;
  readonly type?:
    | "text"
    | "email"
    | "number"
    | "password"
    | "search"
    | "tel"
    | "url";
}

export const Input = component<InputProps>((props) => {
  const state = createControllableState<string>({
    defaultValue: props.defaultValue ?? "",
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  const handleInput = (event: Event): void => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) return;
    state.setValue(target.value, event);
  };

  return (
    <input
      type={props.type ?? "text"}
      id={props.id}
      name={props.name}
      class={props.class}
      value={state.state}
      disabled={props.disabled}
      required={props.required}
      readOnly={props.readOnly}
      placeholder={props.placeholder}
      autoComplete={props.autoComplete}
      inputMode={props.inputMode}
      aria-label={props.ariaLabel}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
      aria-invalid={props.invalid}
      style={props.styles?.root}
      onInput={handleInput}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  );
});
