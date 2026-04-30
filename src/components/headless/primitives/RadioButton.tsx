import { component } from "@ochairo/beat";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiContentProps,
  type BeatUiControlledCheckedProps,
  type BeatUiFocusHandlers,
} from "../../../foundations";

export interface RadioButtonStyles {
  readonly root?: string;
  readonly input?: string;
}

export interface RadioButtonProps
  extends
    BeatUiAccessibilityProps,
    BeatUiContentProps,
    BeatUiControlledCheckedProps,
    BeatUiFocusHandlers {
  readonly styles?: RadioButtonStyles;
  readonly value?: string;
}

export const RadioButton = component<RadioButtonProps>((props) => {
  const state = createControllableState<boolean>({
    defaultValue: props.defaultChecked ?? false,
    ...(props.checked !== undefined ? { value: props.checked } : {}),
    ...(props.onCheckedChange !== undefined
      ? { onChange: props.onCheckedChange }
      : {}),
  });

  const handleChange = (event: Event): void => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) return;
    state.setValue(target.checked, event);
  };

  return (
    <label class={props.class} style={props.styles?.root}>
      <input
        type="radio"
        id={props.id}
        name={props.name}
        value={props.value}
        checked={state.state}
        disabled={props.disabled}
        aria-label={props.ariaLabel}
        aria-labelledby={props.ariaLabelledby}
        aria-describedby={props.ariaDescribedby}
        style={props.styles?.input}
        onChange={handleChange}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
      />
      <span>{props.children}</span>
    </label>
  );
});
