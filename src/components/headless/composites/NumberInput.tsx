import { component } from "@ochairo/beat";

import type {
  BeatUiAccessibilityProps,
  BeatUiControlledValueProps,
  BeatUiFocusHandlers,
} from "../../../foundations";
import { createControllableState } from "../../../foundations";
import type { BeatUiRenderable } from "../../../runtime";
import { HlInput } from "../primitives/Input";

export interface NumberInputStyles {
  readonly root?: string;
  readonly input?: string;
  readonly stepperWrapper?: string;
  readonly stepButton?: string;
}

export interface NumberInputProps
  extends
    BeatUiAccessibilityProps,
    BeatUiControlledValueProps<string>,
    BeatUiFocusHandlers {
  readonly incrementIcon?: BeatUiRenderable;
  readonly decrementIcon?: BeatUiRenderable;
  readonly invalid?: boolean;
  readonly max?: number;
  readonly min?: number;
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly step?: number;
  readonly styles?: NumberInputStyles;
}

export const HlNumberInput = component<NumberInputProps>((props) => {
  const state = createControllableState<string>({
    defaultValue: props.defaultValue ?? "",
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  function handleValueChange(v: string, event: Event | undefined): void {
    state.setValue(v, event);
  }

  function clamp(n: number): number {
    let result = n;
    if (props.min !== undefined && result < props.min) result = props.min;
    if (props.max !== undefined && result > props.max) result = props.max;
    return result;
  }

  function step(direction: 1 | -1): void {
    if (props.disabled || props.readOnly) return;
    const raw = state.state.get();
    const current = parseFloat(raw);
    const base = Number.isNaN(current) ? 0 : current;
    const stepSize = props.step ?? 1;
    const next = clamp(base + direction * stepSize);
    const nextStr = String(next);
    state.setValue(nextStr);
  }

  function handleStepMouseDown(direction: 1 | -1, event: MouseEvent): void {
    event.preventDefault();
    step(direction);
  }

  function handleStepClick(direction: 1 | -1, event: MouseEvent): void {
    if (event.detail !== 0) {
      return;
    }

    step(direction);
  }

  return (
    <div
      class={props.class}
      data-invalid={props.invalid}
      style={props.styles?.root}
    >
      <HlInput
        type="text"
        inputMode="decimal"
        id={props.id}
        name={props.name}
        value={state.state}
        onValueChange={handleValueChange}
        disabled={props.disabled}
        required={props.required}
        readOnly={props.readOnly}
        placeholder={props.placeholder}
        invalid={props.invalid}
        ariaLabel={props.ariaLabel}
        ariaLabelledby={props.ariaLabelledby}
        ariaDescribedby={props.ariaDescribedby}
        styles={{ root: props.styles?.input }}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
      />
      <div
        data-part="stepper-wrapper"
        data-invalid={props.invalid}
        style={props.styles?.stepperWrapper}
      >
        <button
          type="button"
          data-part="step-button"
          tabIndex={-1}
          disabled={props.disabled}
          aria-label="Increment"
          style={props.styles?.stepButton}
          onMouseDown={(event: MouseEvent) => handleStepMouseDown(1, event)}
          onClick={(event: MouseEvent) => handleStepClick(1, event)}
        >
          {props.incrementIcon}
        </button>
        <button
          type="button"
          data-part="step-button"
          tabIndex={-1}
          disabled={props.disabled}
          aria-label="Decrement"
          style={props.styles?.stepButton}
          onMouseDown={(event: MouseEvent) => handleStepMouseDown(-1, event)}
          onClick={(event: MouseEvent) => handleStepClick(-1, event)}
        >
          {props.decrementIcon}
        </button>
      </div>
    </div>
  );
});
