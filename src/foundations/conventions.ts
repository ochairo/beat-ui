import type { BeatUiRenderable, BeatUiState } from "../runtime";

export type BeatUiValueChangeHandler<TValue, TEvent extends Event = Event> = (
  value: TValue,
  event: TEvent | undefined,
) => void;

export interface BeatUiAccessibilityProps {
  readonly id?: string;
  readonly name?: string;
  readonly class?: string;
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly ariaLabelledby?: string;
  readonly ariaDescribedby?: string;
}

export interface BeatUiFocusHandlers {
  readonly onFocus?: (event: FocusEvent) => void;
  readonly onBlur?: (event: FocusEvent) => void;
}

export interface BeatUiPressProps {
  readonly onPress?: (event: MouseEvent) => void;
}

export interface BeatUiContentProps {
  readonly children?: BeatUiRenderable;
}

export interface BeatUiControlledValueProps<TValue> {
  readonly value?: BeatUiState<TValue>;
  readonly defaultValue?: TValue;
  readonly onValueChange?: BeatUiValueChangeHandler<TValue>;
}

export interface BeatUiControlledCheckedProps {
  readonly checked?: BeatUiState<boolean>;
  readonly defaultChecked?: boolean;
  readonly onCheckedChange?: BeatUiValueChangeHandler<boolean>;
}

export interface BeatUiControlledOpenProps {
  readonly open?: BeatUiState<boolean>;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: BeatUiValueChangeHandler<boolean>;
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
