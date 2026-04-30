import { For, component } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiControlledValueProps,
} from "../../../foundations";

export interface TimePickerStyles {
  readonly root?: string;
  readonly columns?: string;
  readonly column?: string;
  readonly columnLabel?: string;
  readonly option?: (selected: boolean) => string;
}

export interface TimePickerProps
  extends BeatUiAccessibilityProps, BeatUiControlledValueProps<string> {
  readonly minuteStep?: number;
  readonly styles?: TimePickerStyles;
}

function buildHours(): readonly string[] {
  const result: string[] = [];
  for (let h = 0; h < 24; h++) {
    result.push(String(h).padStart(2, "0"));
  }
  return result;
}

function buildMinutes(step: number): readonly string[] {
  const result: string[] = [];
  for (let m = 0; m < 60; m += step) {
    result.push(String(m).padStart(2, "0"));
  }
  return result;
}

function parseTime(value: string): { hour: string; minute: string } {
  const parts = value.split(":");
  if (parts.length >= 2) {
    return { hour: parts[0] ?? "", minute: parts[1] ?? "" };
  }
  return { hour: "", minute: "" };
}

export const TimePicker = component<TimePickerProps>((props) => {
  const state = createControllableState<string>({
    defaultValue: props.defaultValue ?? "",
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  const step = props.minuteStep ?? 5;
  const hours = pulse(buildHours());
  const minutes = pulse(buildMinutes(step));

  const parsed = parseTime(state.state.get());
  const selectedHour = pulse(parsed.hour);
  const selectedMinute = pulse(parsed.minute);

  function selectHour(h: string): void {
    selectedHour.set(h);
    const m = selectedMinute.get() || "00";
    state.setValue(`${h}:${m}`);
  }

  function selectMinute(m: string): void {
    selectedMinute.set(m);
    const h = selectedHour.get() || "00";
    state.setValue(`${h}:${m}`);
  }

  return (
    <div
      id={props.id}
      class={props.class}
      role="group"
      aria-label={props.ariaLabel ?? "Time picker"}
      style={props.styles?.root}
    >
      <div data-part="columns" style={props.styles?.columns}>
        <div data-part="column" style={props.styles?.column}>
          <span data-part="column-label" style={props.styles?.columnLabel}>
            Hr
          </span>
          <For each={hours}>
            {(hPulse) => {
              const h = hPulse.get();
              const isSelected = h === selectedHour.get();
              return (
                <button
                  type="button"
                  data-part="option"
                  role="option"
                  aria-selected={isSelected ? "true" : "false"}
                  style={props.styles?.option?.(isSelected)}
                  ref={(el) => {
                    selectedHour.on(({ currentValue }) => {
                      const sel = h === currentValue;
                      (el as HTMLButtonElement).setAttribute(
                        "aria-selected",
                        String(sel),
                      );
                      if (props.styles?.option) {
                        (el as HTMLElement).style.cssText =
                          props.styles.option(sel);
                      }
                    });
                  }}
                  onClick={() => selectHour(h)}
                >
                  {h}
                </button>
              );
            }}
          </For>
        </div>
        <div data-part="column" style={props.styles?.column}>
          <span data-part="column-label" style={props.styles?.columnLabel}>
            Min
          </span>
          <For each={minutes}>
            {(mPulse) => {
              const m = mPulse.get();
              const isSelected = m === selectedMinute.get();
              return (
                <button
                  type="button"
                  data-part="option"
                  role="option"
                  aria-selected={isSelected ? "true" : "false"}
                  style={props.styles?.option?.(isSelected)}
                  ref={(el) => {
                    selectedMinute.on(({ currentValue }) => {
                      const sel = m === currentValue;
                      (el as HTMLButtonElement).setAttribute(
                        "aria-selected",
                        String(sel),
                      );
                      if (props.styles?.option) {
                        (el as HTMLElement).style.cssText =
                          props.styles.option(sel);
                      }
                    });
                  }}
                  onClick={() => selectMinute(m)}
                >
                  {m}
                </button>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
});
