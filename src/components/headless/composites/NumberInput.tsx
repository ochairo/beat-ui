import { component } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";

import type {
  BeatUiAccessibilityProps,
  BeatUiControlledValueProps,
  BeatUiFocusHandlers,
} from "../../../foundations";
import type { BeatUiRenderable } from "../../../runtime";
import { Input } from "../primitives/Input";

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

export const NumberInput = component<NumberInputProps>((props) => {
  const internalValue = pulse(props.defaultValue ?? "");

  function handleValueChange(v: string, event: Event | undefined): void {
    internalValue.set(v);
    props.onValueChange?.(v, event);
  }

  function clamp(n: number): number {
    let result = n;
    if (props.min !== undefined && result < props.min) result = props.min;
    if (props.max !== undefined && result > props.max) result = props.max;
    return result;
  }

  function step(direction: 1 | -1): void {
    if (props.disabled || props.readOnly) return;
    const raw =
      props.value !== undefined ? props.value.get() : internalValue.get();
    const current = parseFloat(raw);
    const base = Number.isNaN(current) ? 0 : current;
    const stepSize = props.step ?? 1;
    const next = clamp(base + direction * stepSize);
    const nextStr = String(next);
    internalValue.set(nextStr);
    props.onValueChange?.(nextStr, undefined);
  }

  return (
    <div
      class={props.class}
      data-invalid={props.invalid}
      style={props.styles?.root}
    >
      <Input
        type="text"
        inputMode="decimal"
        id={props.id}
        name={props.name}
        value={props.value}
        defaultValue={props.defaultValue}
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
          onClick={() => step(1)}
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
          onClick={() => step(-1)}
        >
          {props.decrementIcon}
        </button>
      </div>
    </div>
  );
});
