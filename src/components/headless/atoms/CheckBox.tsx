import { component } from "@ochairo/beat";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiContentProps,
  type BeatUiControlledCheckedProps,
  type BeatUiFocusHandlers,
} from "../../../foundations";

export interface CheckBoxStyles {
  readonly root?: string;
  readonly input?: string;
}

export interface CheckBoxProps
  extends
    BeatUiAccessibilityProps,
    BeatUiContentProps,
    BeatUiControlledCheckedProps,
    BeatUiFocusHandlers {
  readonly styles?: CheckBoxStyles;
}

export const CheckBox = component<CheckBoxProps>((props) => {
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
    <label style={props.styles?.root}>
      <input
        type="checkbox"
        id={props.id}
        name={props.name}
        class={props.class}
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

export const Checkbox = CheckBox;
