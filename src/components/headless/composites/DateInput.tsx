import { component, onCleanup } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiControlledValueProps,
  type BeatUiFocusHandlers,
} from "../../../foundations";
import type { BeatUiRenderable } from "../../../runtime";

export interface DateInputStyles {
  readonly root?: string;
  readonly inputWrapper?: string;
  readonly input?: string;
  readonly inputOverlay?: string;
  readonly digitChar?: string;
  readonly placeholderChar?: string;
  readonly iconButton?: string;
  readonly calendarWrapper?: string;
}

export interface DateInputProps
  extends
    BeatUiAccessibilityProps,
    BeatUiControlledValueProps<string>,
    BeatUiFocusHandlers {
  readonly calendar?: BeatUiRenderable;
  readonly containerClass?: string | undefined;
  readonly format?: string;
  readonly icon?: BeatUiRenderable;
  readonly invalid?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly styles?: DateInputStyles;
}

const DEFAULT_FORMAT = "YYYY-MM-DD";
const SLOT_CHARS = new Set(["Y", "M", "D"]);

interface SlotMeta {
  readonly group: string;
  readonly groupIndex: number;
}

function buildSlotPositions(format: string): number[] {
  const positions: number[] = [];
  for (let i = 0; i < format.length; i++) {
    const ch = format[i];
    if (ch !== undefined && SLOT_CHARS.has(ch)) positions.push(i);
  }
  return positions;
}

function buildSlotMeta(format: string, slotPositions: number[]): SlotMeta[] {
  const counts: Record<string, number> = {};
  return slotPositions.map((pos) => {
    const group = format[pos]!;
    const groupIndex = counts[group] ?? 0;
    counts[group] = groupIndex + 1;
    return { group, groupIndex };
  });
}

function getGroupValue(
  group: string,
  slots: (string | null)[],
  meta: SlotMeta[],
): number | null {
  const digits: string[] = [];
  for (let i = 0; i < meta.length; i++) {
    if (meta[i]!.group === group) {
      if (slots[i] === null) return null;
      digits.push(slots[i]!);
    }
  }
  return digits.length > 0 ? Number(digits.join("")) : null;
}

function daysInMonth(month: number, year: number | null): number {
  if (month === 2) {
    if (year === null) return 29;
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return leap ? 29 : 28;
  }
  if (month === 4 || month === 6 || month === 9 || month === 11) return 30;
  return 31;
}

function isDigitValid(
  digit: string,
  slot: number,
  slots: (string | null)[],
  meta: SlotMeta[],
): boolean {
  const { group, groupIndex } = meta[slot]!;
  const d = Number(digit);

  if (group === "M") {
    if (groupIndex === 0) return d <= 1;
    if (groupIndex === 1) {
      const first = slots[slot - 1];
      if (first === "0") return d >= 1;
      if (first === "1") return d <= 2;
      return d <= 9;
    }
  }

  if (group === "D") {
    const month = getGroupValue("M", slots, meta);
    const year = getGroupValue("Y", slots, meta);
    const maxDay = month !== null ? daysInMonth(month, year) : 31;

    if (groupIndex === 0) {
      const maxFirstDigit = Math.floor(maxDay / 10);
      return d <= maxFirstDigit;
    }
    if (groupIndex === 1) {
      const first = slots[slot - 1];
      if (first === null) return true;
      const candidate = Number(first) * 10 + d;
      return candidate >= 1 && candidate <= maxDay;
    }
  }

  return true;
}

function buildDisplay(
  slots: (string | null)[],
  format: string,
  slotPositions: number[],
): string {
  if (slots.every((s) => s === null)) return "";
  let result = "";
  let si = 0;
  for (let i = 0; i < format.length; i++) {
    if (si < slotPositions.length && slotPositions[si] === i) {
      result += slots[si] ?? format[i];
      si++;
    } else {
      result += format[i];
    }
  }
  return result;
}

function buildValue(
  slots: (string | null)[],
  format: string,
  slotPositions: number[],
): string {
  let result = "";
  let si = 0;
  for (let i = 0; i < format.length; i++) {
    if (si < slotPositions.length && slotPositions[si] === i) {
      result += slots[si];
      si++;
    } else {
      result += format[i];
    }
  }
  return result;
}

function parseDigits(value: string, count: number): (string | null)[] {
  const digits = value.replace(/\D/g, "");
  const slots: (string | null)[] = [];
  for (let i = 0; i < count; i++) slots.push(digits[i] ?? null);
  return slots;
}

function cursorToBackspaceSlot(
  cursor: number,
  slotPositions: number[],
): number | null {
  for (let i = slotPositions.length - 1; i >= 0; i--) {
    if (slotPositions[i]! < cursor) return i;
  }
  return null;
}

function cursorAfterClear(slot: number, slotPositions: number[]): number {
  return slotPositions[slot]!;
}

function cursorToTypeSlot(
  cursor: number,
  slotPositions: number[],
): number | null {
  for (let i = 0; i < slotPositions.length; i++) {
    if (slotPositions[i]! >= cursor) return i;
  }
  return null;
}

function cursorAfterFill(
  slot: number,
  slotPositions: number[],
  formatLength: number,
): number {
  if (slot + 1 < slotPositions.length) return slotPositions[slot + 1]!;
  return formatLength;
}

export const DateInput = component<DateInputProps>((props) => {
  const format = props.format ?? DEFAULT_FORMAT;
  const slotPositions = buildSlotPositions(format);
  const slotCount = slotPositions.length;
  const meta = buildSlotMeta(format, slotPositions);

  const isOpen = pulse(false);
  let rootEl: HTMLDivElement | null = null;
  const slots: (string | null)[] = Array.from<string | null>({
    length: slotCount,
  }).fill(null);

  const state = createControllableState<string>({
    defaultValue: props.defaultValue ?? "",
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  const display = pulse(state.state.get());

  const initial = parseDigits(state.state.get(), slotCount);
  for (let i = 0; i < slotCount; i++) slots[i] = initial[i]!;

  function syncFromSlots(event?: Event): void {
    const text = buildDisplay(slots, format, slotPositions);
    display.set(text);
    if (slots.every((s) => s !== null)) {
      state.setValue(buildValue(slots, format, slotPositions), event);
    } else if (slots.every((s) => s === null)) {
      state.setValue("", event);
    }
  }

  function toggleCalendar(): void {
    if (props.disabled || props.readOnly) return;
    isOpen.set(!isOpen.get());
  }

  function handleDocumentClick(event: MouseEvent): void {
    if (rootEl && !rootEl.contains(event.target as Node)) {
      isOpen.set(false);
    }
  }

  function handleInput(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const digits = input.value.replace(/\D/g, "").slice(0, slotCount);
    const parsed = parseDigits(digits, slotCount);
    for (let i = 0; i < slotCount; i++) {
      const d = parsed[i]!;
      if (d !== null && !isDigitValid(d, i, slots, meta)) {
        slots[i] = null;
      } else {
        slots[i] = d;
      }
    }
    syncFromSlots(event);
    input.value = display.get();
    if (digits.length > 0) {
      const lastSlot = digits.length - 1;
      const cursorPos = cursorAfterFill(lastSlot, slotPositions, format.length);
      input.setSelectionRange(cursorPos, cursorPos);
    }
  }

  function handleKeyDown(event: KeyboardEvent): void {
    const input = event.currentTarget as HTMLInputElement;
    const cursor = input.selectionStart ?? 0;

    if (event.key === "Backspace") {
      event.preventDefault();
      const slot = cursorToBackspaceSlot(cursor, slotPositions);
      if (slot === null) return;
      if (slots[slot] === null) return;
      slots[slot] = null;
      syncFromSlots(event);
      input.value = display.get();
      const newCursor = cursorAfterClear(slot, slotPositions);
      if (display.get().length > 0) {
        input.setSelectionRange(newCursor, newCursor);
      }
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      const slot = cursorToTypeSlot(cursor, slotPositions);
      if (slot === null) return;
      if (slots[slot] === null) return;
      slots[slot] = null;
      syncFromSlots(event);
      input.value = display.get();
      if (display.get().length > 0) {
        input.setSelectionRange(cursor, cursor);
      }
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      const slot = cursorToTypeSlot(cursor, slotPositions);
      if (slot === null) return;
      if (!isDigitValid(event.key, slot, slots, meta)) return;
      slots[slot] = event.key;
      syncFromSlots(event);
      input.value = display.get();
      const newCursor = cursorAfterFill(slot, slotPositions, format.length);
      input.setSelectionRange(newCursor, newCursor);
      return;
    }

    if (
      !event.ctrlKey &&
      !event.metaKey &&
      event.key !== "Tab" &&
      event.key !== "Escape" &&
      event.key !== "Enter"
    ) {
      event.preventDefault();
    }
  }

  return (
    <div
      class={props.containerClass}
      style={props.styles?.root}
      ref={(el) => {
        rootEl = el as HTMLDivElement;
        document.addEventListener("click", handleDocumentClick, true);
        onCleanup(() => {
          document.removeEventListener("click", handleDocumentClick, true);
        });
      }}
    >
      <div
        data-part="input-wrapper"
        data-invalid={props.invalid}
        style={props.styles?.inputWrapper}
      >
        <div style="position:relative;flex:1;min-width:0">
          <input
            type="text"
            data-part="input"
            id={props.id}
            name={props.name}
            class={props.class}
            value={display}
            disabled={props.disabled}
            required={props.required}
            readOnly={props.readOnly}
            placeholder=""
            inputMode="numeric"
            maxLength={format.length}
            aria-label={props.ariaLabel}
            aria-labelledby={props.ariaLabelledby}
            aria-describedby={props.ariaDescribedby}
            aria-invalid={props.invalid}
            style={props.styles?.input}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
          />
          <div
            data-part="input-overlay"
            aria-hidden="true"
            style={props.styles?.inputOverlay}
            ref={(el) => {
              const overlay = el as HTMLDivElement;
              const phStyle = props.styles?.placeholderChar ?? "";
              const dgStyle = props.styles?.digitChar ?? "";
              function render(value: string): void {
                overlay.innerHTML = "";
                const text = value === "" ? format : value;
                for (const ch of text) {
                  const span = document.createElement("span");
                  span.textContent = ch;
                  if (SLOT_CHARS.has(ch)) {
                    span.style.cssText = phStyle;
                  } else if (/\d/.test(ch)) {
                    span.style.cssText = dgStyle;
                  } else if (value === "") {
                    span.style.cssText = phStyle;
                  }
                  overlay.appendChild(span);
                }
              }
              render(display.get());
              display.on(({ currentValue }) => {
                render(currentValue);
              });
            }}
          />
        </div>
        <button
          type="button"
          data-part="icon-button"
          tabIndex={-1}
          disabled={props.disabled}
          aria-label="Toggle calendar"
          style={props.styles?.iconButton}
          onClick={toggleCalendar}
        >
          {props.icon}
        </button>
      </div>
      <div
        data-part="calendar-wrapper"
        role="dialog"
        style={props.styles?.calendarWrapper}
        ref={(el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.display = "none";
          isOpen.on(({ currentValue }) => {
            htmlEl.style.display = currentValue ? "" : "none";
          });
        }}
      >
        {props.calendar}
      </div>
    </div>
  );
});
