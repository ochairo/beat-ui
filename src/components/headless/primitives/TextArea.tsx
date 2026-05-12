import { component } from "@ochairo/beat";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiControlledValueProps,
  type BeatUiFocusHandlers,
} from "../../../foundations";

export interface TextAreaStyles {
  readonly root?: string;
}

export interface TextAreaProps
  extends
    BeatUiAccessibilityProps,
    BeatUiControlledValueProps<string>,
    BeatUiFocusHandlers {
  readonly invalid?: boolean;
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly rows?: number;
  readonly styles?: TextAreaStyles;
}

export const HlTextArea = component<TextAreaProps>((props) => {
  const state = createControllableState<string>({
    defaultValue: props.defaultValue ?? "",
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  const handleInput = (event: Event): void => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLTextAreaElement)) return;
    state.setValue(target.value, event);
  };

  return (
    <textarea
      id={props.id}
      name={props.name}
      class={props.class}
      value={state.state}
      disabled={props.disabled}
      required={props.required}
      readOnly={props.readOnly}
      placeholder={props.placeholder}
      rows={props.rows}
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
