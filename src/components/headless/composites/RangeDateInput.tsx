import { component, onCleanup } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiControlledValueProps,
  type BeatUiFocusHandlers,
} from "../../../foundations";
import type { BeatUiRenderable } from "../../../runtime";
import {
  isWithinFloatingLayer,
  moveFloatingLayerToHost,
  positionFloatingLayer,
  resolveFloatingHorizontalAlign,
  resolveFloatingLayerZIndex,
  scheduleFloatingLayerMount,
} from "./floating-layer";
import { HlDateInput, type DateInputStyles } from "./DateInput";
import type { DateRangeValue } from "./RangeDatePicker";

export interface DateRangeInputStyles {
  readonly root?: string;
  readonly inputWrapper?: string;
  readonly fields?: string;
  readonly field?: string;
  readonly separator?: string;
  readonly iconButton?: string;
  readonly calendarWrapper?: string;
  readonly startField?: DateInputStyles;
  readonly endField?: DateInputStyles;
}

export interface DateRangeInputProps
  extends
    BeatUiAccessibilityProps,
    BeatUiControlledValueProps<DateRangeValue>,
    BeatUiFocusHandlers {
  readonly calendar?: BeatUiRenderable;
  readonly icon?: BeatUiRenderable;
  readonly invalid?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly separator?: BeatUiRenderable;
  readonly startAriaLabel?: string;
  readonly startId?: string;
  readonly startName?: string;
  readonly endAriaLabel?: string;
  readonly endId?: string;
  readonly endName?: string;
  readonly styles?: DateRangeInputStyles;
}

const DEFAULT_FIELD_STYLES: DateInputStyles = {
  root: "display:block;width:100%;height:100%;",
  inputWrapper:
    "display:flex;align-items:center;height:100%;border:none;border-radius:0;background:transparent;overflow:visible;",
  input:
    "width:100%;box-sizing:border-box;height:100%;min-height:0;padding:0.6875rem 0.625rem 0.8125rem;border:none;background:transparent;color:transparent;caret-color:var(--beat-ui-color-text);font:inherit;font-variant-numeric:tabular-nums;line-height:1;outline:none;",
  inputOverlay:
    "position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;padding:0.6875rem 0.625rem 0.8125rem;pointer-events:none;font:inherit;font-variant-numeric:tabular-nums;line-height:1;color:var(--beat-ui-color-text);",
  digitChar: "color:var(--beat-ui-color-text);",
  placeholderChar: "color:var(--beat-ui-color-text);opacity:0.4;",
};

function mergeDateInputStyles(
  defaults: DateInputStyles,
  overrides: DateInputStyles | undefined,
): DateInputStyles {
  return {
    ...defaults,
    ...overrides,
  };
}

const DEFAULT_START_FIELD_STYLES: DateInputStyles = {
  ...DEFAULT_FIELD_STYLES,
  input:
    "width:100%;box-sizing:border-box;height:100%;min-height:0;padding:0.6875rem 0.25rem 0.8125rem 0.625rem;border:none;background:transparent;color:transparent;caret-color:var(--beat-ui-color-text);font:inherit;font-variant-numeric:tabular-nums;line-height:1;text-align:right;outline:none;",
  inputOverlay:
    "position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:flex-end;padding:0.6875rem 0.25rem 0.8125rem 0.625rem;pointer-events:none;font:inherit;font-variant-numeric:tabular-nums;line-height:1;color:var(--beat-ui-color-text);",
};

const DEFAULT_END_FIELD_STYLES: DateInputStyles = {
  ...DEFAULT_FIELD_STYLES,
  input:
    "width:100%;box-sizing:border-box;height:100%;min-height:0;padding:0.6875rem 0.625rem 0.8125rem 0.25rem;border:none;background:transparent;color:transparent;caret-color:var(--beat-ui-color-text);font:inherit;font-variant-numeric:tabular-nums;line-height:1;outline:none;",
  inputOverlay:
    "position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;padding:0.6875rem 0.625rem 0.8125rem 0.25rem;pointer-events:none;font:inherit;font-variant-numeric:tabular-nums;line-height:1;color:var(--beat-ui-color-text);",
};

function normalizeRange(value: DateRangeValue | undefined): DateRangeValue {
  return {
    start: value?.start ?? "",
    end: value?.end ?? "",
  };
}

function isCompleteIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeOrderedRange(value: DateRangeValue): DateRangeValue {
  if (
    isCompleteIsoDate(value.start) &&
    isCompleteIsoDate(value.end) &&
    value.start.localeCompare(value.end) > 0
  ) {
    return {
      start: value.end,
      end: value.start,
    };
  }

  return value;
}

function isCalendarDayCellTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest("button[role='gridcell']") !== null
  );
}

export const HlDateRangeInput = component<DateRangeInputProps>((props) => {
  const calendarAlign = resolveFloatingHorizontalAlign(
    props.styles?.calendarWrapper,
  );
  const supportsCalendar = props.calendar != null;
  const showsCalendarButton = props.icon != null || supportsCalendar;
  const state = createControllableState<DateRangeValue>({
    defaultValue: normalizeRange(props.defaultValue),
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  const startValue = pulse(state.state.get().start);
  const endValue = pulse(state.state.get().end);
  const isOpen = pulse(false);
  let rootEl: HTMLDivElement | null = null;
  let calendarWrapperEl: HTMLElement | null = null;
  let cleanupCalendarTracking: (() => void) | null = null;

  const startId = props.startId ?? (props.id ? `${props.id}-start` : undefined);
  const endId = props.endId ?? (props.id ? `${props.id}-end` : undefined);
  const startName =
    props.startName ?? (props.name ? `${props.name}-start` : undefined);
  const endName =
    props.endName ?? (props.name ? `${props.name}-end` : undefined);
  const startAriaLabel =
    props.startAriaLabel ??
    (props.ariaLabel ? `${props.ariaLabel} start` : "Start date");
  const endAriaLabel =
    props.endAriaLabel ??
    (props.ariaLabel ? `${props.ariaLabel} end` : "End date");

  function syncFieldValues(nextRange: DateRangeValue): void {
    startValue.set(nextRange.start);
    endValue.set(nextRange.end);
  }

  function updateCalendarPosition(): void {
    if (!rootEl || !calendarWrapperEl) return;
    positionFloatingLayer({
      anchor: rootEl,
      layer: calendarWrapperEl,
      align: calendarAlign,
    });
  }

  function stopCalendarTracking(): void {
    cleanupCalendarTracking?.();
    cleanupCalendarTracking = null;
  }

  function startCalendarTracking(): void {
    if (cleanupCalendarTracking !== null) return;
    const handleViewportChange = (): void => {
      if (!isOpen.get()) return;
      updateCalendarPosition();
    };
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    cleanupCalendarTracking = () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }

  function setRangeValue(
    nextRange: DateRangeValue,
    event: Event | undefined,
  ): void {
    const normalized = normalizeOrderedRange(normalizeRange(nextRange));
    state.setValue(normalized, event);
  }

  onCleanup(
    state.state.on(({ currentValue }) => {
      syncFieldValues(normalizeRange(currentValue));
    }),
  );

  function toggleCalendar(): void {
    if (!supportsCalendar || props.disabled || props.readOnly) return;
    isOpen.set(!isOpen.get());
  }

  function handleDocumentClick(event: MouseEvent): void {
    if (!supportsCalendar) {
      return;
    }

    if (
      !isWithinFloatingLayer(
        event.target as Node | null,
        rootEl,
        calendarWrapperEl,
      )
    ) {
      isOpen.set(false);
    }
  }

  function handleFieldBlur(event: FocusEvent): void {
    const rel = (event as FocusEvent & { relatedTarget: Node | null })
      .relatedTarget;
    if (!isWithinFloatingLayer(rel, rootEl, calendarWrapperEl)) {
      props.onBlur?.(event);
    }
  }

  return (
    <div
      class={props.class}
      style={props.styles?.root}
      ref={(el) => {
        rootEl = el as HTMLDivElement;
        if (supportsCalendar) {
          document.addEventListener("click", handleDocumentClick, true);
        }
        onCleanup(() => {
          stopCalendarTracking();
          if (supportsCalendar) {
            document.removeEventListener("click", handleDocumentClick, true);
          }
        });
      }}
    >
      <div
        data-part="input-wrapper"
        data-invalid={props.invalid}
        style={props.styles?.inputWrapper}
      >
        <div data-part="fields" style={props.styles?.fields}>
          <div
            data-part="field"
            data-range-part="start"
            style={props.styles?.field}
          >
            <HlDateInput
              id={startId}
              name={startName}
              ariaLabel={startAriaLabel}
              disabled={props.disabled}
              {...(props.invalid !== undefined
                ? { invalid: props.invalid }
                : {})}
              {...(props.readOnly !== undefined
                ? { readOnly: props.readOnly }
                : {})}
              {...(props.required !== undefined
                ? { required: props.required }
                : {})}
              value={startValue}
              styles={mergeDateInputStyles(
                DEFAULT_START_FIELD_STYLES,
                props.styles?.startField,
              )}
              onValueChange={(value, event) =>
                setRangeValue(
                  { start: value, end: state.state.get().end },
                  event,
                )
              }
              onFocus={props.onFocus}
              onBlur={handleFieldBlur}
            />
          </div>
          <span data-part="separator" style={props.styles?.separator}>
            {props.separator ?? "–"}
          </span>
          <div
            data-part="field"
            data-range-part="end"
            style={props.styles?.field}
          >
            <HlDateInput
              id={endId}
              name={endName}
              ariaLabel={endAriaLabel}
              disabled={props.disabled}
              {...(props.invalid !== undefined
                ? { invalid: props.invalid }
                : {})}
              {...(props.readOnly !== undefined
                ? { readOnly: props.readOnly }
                : {})}
              {...(props.required !== undefined
                ? { required: props.required }
                : {})}
              value={endValue}
              styles={mergeDateInputStyles(
                DEFAULT_END_FIELD_STYLES,
                props.styles?.endField,
              )}
              onValueChange={(value, event) =>
                setRangeValue(
                  { start: state.state.get().start, end: value },
                  event,
                )
              }
              onFocus={props.onFocus}
              onBlur={handleFieldBlur}
            />
          </div>
        </div>
        {showsCalendarButton ? (
          <button
            type="button"
            data-part="icon-button"
            tabIndex={-1}
            disabled={props.disabled}
            aria-label="Toggle date range calendar"
            style={props.styles?.iconButton}
            onMouseDown={(event: MouseEvent) => event.preventDefault()}
            onClick={toggleCalendar}
          >
            {props.icon}
          </button>
        ) : null}
      </div>
      {supportsCalendar ? (
        <div
          data-part="calendar-wrapper"
          data-beat-ui-date-input-popup="true"
          role="dialog"
          style={props.styles?.calendarWrapper}
          onClick={(event: MouseEvent) => {
            if (!isCalendarDayCellTarget(event.target)) {
              return;
            }

            const value = state.state.get();
            if (
              isCompleteIsoDate(value.start) &&
              isCompleteIsoDate(value.end)
            ) {
              isOpen.set(false);
            }
          }}
          ref={(el) => {
            const htmlEl = el as HTMLElement;
            calendarWrapperEl = htmlEl;
            htmlEl.style.display = "none";
            if (htmlEl.style.zIndex === "") {
              htmlEl.style.zIndex = resolveFloatingLayerZIndex(rootEl);
            }
            onCleanup(() => {
              if (calendarWrapperEl === htmlEl) {
                calendarWrapperEl = null;
              }
            });
            onCleanup(scheduleFloatingLayerMount(htmlEl));
            onCleanup(
              isOpen.on(({ currentValue }) => {
                htmlEl.style.display = currentValue ? "" : "none";
                if (currentValue) {
                  htmlEl.style.zIndex = resolveFloatingLayerZIndex(rootEl);
                  moveFloatingLayerToHost(htmlEl);
                  startCalendarTracking();
                  updateCalendarPosition();
                  requestAnimationFrame(() => {
                    if (isOpen.get()) updateCalendarPosition();
                  });
                  return;
                }
                stopCalendarTracking();
              }),
            );
          }}
        >
          {props.calendar}
        </div>
      ) : null}
    </div>
  );
});
