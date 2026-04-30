import type { BeatUiRenderable, BeatUiState } from "../runtime";

export type BeatUiValueChangeHandler<TValue, TEvent extends Event = Event> = (
  value: TValue,
  event: TEvent | undefined,
) => void;

export interface BeatUiAccessibilityProps {
  readonly id?: string | undefined;
  readonly name?: string | undefined;
  readonly class?: string | undefined;
  readonly disabled?: boolean | undefined;
  readonly ariaLabel?: string | undefined;
  readonly ariaLabelledby?: string | undefined;
  readonly ariaDescribedby?: string | undefined;
}

export interface BeatUiFocusHandlers {
  readonly onFocus?: ((event: FocusEvent) => void) | undefined;
  readonly onBlur?: ((event: FocusEvent) => void) | undefined;
}

export interface BeatUiPressProps {
  readonly onPress?: ((event: MouseEvent) => void) | undefined;
}

export interface BeatUiContentProps {
  readonly children?: BeatUiRenderable | undefined;
}

export interface BeatUiControlledValueProps<TValue> {
  readonly value?: BeatUiState<TValue> | undefined;
  readonly defaultValue?: TValue | undefined;
  readonly onValueChange?: BeatUiValueChangeHandler<TValue> | undefined;
}

export interface BeatUiControlledCheckedProps {
  readonly checked?: BeatUiState<boolean> | undefined;
  readonly defaultChecked?: boolean | undefined;
  readonly onCheckedChange?: BeatUiValueChangeHandler<boolean> | undefined;
}

export interface BeatUiControlledOpenProps {
  readonly open?: BeatUiState<boolean> | undefined;
  readonly defaultOpen?: boolean | undefined;
  readonly onOpenChange?: BeatUiValueChangeHandler<boolean> | undefined;
}

export const BEAT_UI_CONVENTIONS = {
  controlledState:
    "Use Pulse state through semantic props like value and checked when the caller owns state.",
  uncontrolledState:
    "Use defaultValue or defaultChecked when the component should create internal Pulse state.",
  accessibility:
    "Prefer native semantic elements first and add ARIA only where native semantics are insufficient.",
  eventProps: [
    "onPress",
    "onValueChange",
    "onCheckedChange",
    "onFocus",
    "onBlur",
  ],
} as const;
