import { component, onCleanup } from "@ochairo/beat";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiControlledValueProps,
  type BeatUiFocusHandlers,
} from "../../../foundations";

export interface SliderStyles {
  readonly root?: string | undefined;
}

export interface SliderProps
  extends
    BeatUiAccessibilityProps,
    BeatUiControlledValueProps<number>,
    BeatUiFocusHandlers {
  readonly min?: number | undefined;
  readonly max?: number | undefined;
  readonly step?: number | undefined;
  readonly styles?: SliderStyles | undefined;
}

export const HlSlider = component<SliderProps>((props) => {
  const state = createControllableState<number>({
    defaultValue: props.defaultValue ?? props.min ?? 0,
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  const handleInput = (event: Event): void => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) return;
    state.setValue(target.valueAsNumber, event);
  };

  return (
    <input
      type="range"
      id={props.id}
      name={props.name}
      class={props.class}
      min={props.min}
      max={props.max}
      step={props.step}
      disabled={props.disabled}
      aria-label={props.ariaLabel}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
      aria-valuemin={props.min}
      aria-valuemax={props.max}
      aria-valuenow={state.state}
      style={props.styles?.root}
      ref={(el) => {
        const input = el as HTMLInputElement;
        // Set initial value after min/max attributes are applied to avoid clamping
        input.valueAsNumber = state.state.get();
        onCleanup(
          state.state.on(({ currentValue }) => {
            input.valueAsNumber = currentValue;
          }),
        );
      }}
      onInput={handleInput}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  );
});
