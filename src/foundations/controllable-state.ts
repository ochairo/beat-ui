import { pulse } from "@ochairo/pulse";

import type { BeatUiState } from "../runtime";
import type { BeatUiValueChangeHandler } from "./conventions";

export interface CreateControllableStateOptions<
  TValue,
  TEvent extends Event = Event,
> {
  readonly value?: BeatUiState<TValue>;
  readonly defaultValue: TValue;
  readonly onChange?: BeatUiValueChangeHandler<TValue, TEvent>;
}

export interface BeatUiControllableState<TValue, TEvent extends Event = Event> {
  readonly controlled: boolean;
  readonly state: BeatUiState<TValue>;
  setValue(nextValue: TValue, event?: TEvent): void;
}

export function createControllableState<TValue, TEvent extends Event = Event>(
  options: CreateControllableStateOptions<TValue, TEvent>,
): BeatUiControllableState<TValue, TEvent> {
  const state = options.value ?? pulse(options.defaultValue);

  return {
    controlled: options.value !== undefined,
    state,
    setValue(nextValue, event) {
      if (Object.is(state.get(), nextValue)) {
        return;
      }

      state.set(nextValue);
      options.onChange?.(nextValue, event);
    },
  };
}
