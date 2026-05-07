import { For, component, onCleanup } from "@ochairo/beat";
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
  readonly disabledHours?: readonly string[] | undefined;
  readonly disabledMinutes?: readonly string[] | undefined;
  readonly maxHour?: number;
  readonly minuteStep?: number;
  readonly styles?: TimePickerStyles;
}

function buildHours(maxHour: number | undefined): readonly string[] {
  const max = maxHour ?? 24;
  const digits = Math.max(2, String(max).length);
  const result: string[] = [];
  for (let h = 0; h <= max; h++) {
    result.push(String(h).padStart(digits, "0"));
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
  const hours = pulse(buildHours(props.maxHour));
  const minutes = pulse(buildMinutes(step));

  const parsed = parseTime(state.state.get());
  const selectedHour = pulse(parsed.hour);
  const selectedMinute = pulse(parsed.minute);

  onCleanup(
    state.state.on(({ currentValue }) => {
      const p = parseTime(currentValue);
      if (p.hour) selectedHour.set(p.hour);
      if (p.minute) selectedMinute.set(p.minute);
    }),
  );

  function selectHour(h: string): void {
    selectedHour.set(h);
    // 24:00 end-of-day: only valid when maxHour is not set (default behavior)
    const forceZeroMin = props.maxHour === undefined && h === "24";
    const m = forceZeroMin ? "00" : selectedMinute.get() || "00";
    selectedMinute.set(m);
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
              const isDisabled = props.disabledHours?.includes(h) ?? false;
              return (
                <button
                  type="button"
                  data-part="option"
                  role="option"
                  aria-selected={isSelected ? "true" : "false"}
                  disabled={isDisabled}
                  style={props.styles?.option?.(isSelected)}
                  ref={(el) => {
                    selectedHour.on(({ currentValue }) => {
                      const sel = h === currentValue;
                      (el as HTMLButtonElement).setAttribute(
                        "aria-selected",
                        String(sel),
                      );
                      if (sel) {
                        (el as HTMLElement).scrollIntoView({
                          block: "nearest",
                        });
                      }
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
              const isDisabledByProp =
                props.disabledMinutes?.includes(m) ?? false;
              const isDisabled =
                isDisabledByProp ||
                (props.maxHour === undefined &&
                  selectedHour.get() === "24" &&
                  m !== "00");
              return (
                <button
                  type="button"
                  data-part="option"
                  role="option"
                  aria-selected={isSelected ? "true" : "false"}
                  disabled={isDisabled}
                  style={props.styles?.option?.(isSelected)}
                  ref={(el) => {
                    selectedMinute.on(({ currentValue }) => {
                      const sel = m === currentValue;
                      (el as HTMLButtonElement).setAttribute(
                        "aria-selected",
                        String(sel),
                      );
                      if (sel) {
                        (el as HTMLElement).scrollIntoView({
                          block: "nearest",
                        });
                      }
                      if (props.styles?.option) {
                        (el as HTMLElement).style.cssText =
                          props.styles.option(sel);
                      }
                    });
                    selectedHour.on(({ currentValue }) => {
                      const dis =
                        isDisabledByProp ||
                        (props.maxHour === undefined &&
                          currentValue === "24" &&
                          m !== "00");
                      (el as HTMLButtonElement).disabled = dis;
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
