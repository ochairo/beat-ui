import { component, onCleanup } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiControlledValueProps,
  type BeatUiFocusHandlers,
} from "../../../foundations";
import type { BeatUiRenderable } from "../../../runtime";

export interface TimeInputStyles {
  readonly root?: string;
  readonly inputWrapper?: string;
  readonly input?: string;
  readonly inputOverlay?: string;
  readonly digitChar?: string;
  readonly placeholderChar?: string;
  readonly iconButton?: string;
  readonly pickerWrapper?: string;
}

export interface TimeInputProps
  extends
    BeatUiAccessibilityProps,
    BeatUiControlledValueProps<string>,
    BeatUiFocusHandlers {
  readonly containerClass?: string | undefined;
  readonly disabledHours?: readonly string[] | undefined;
  readonly disabledMinutes?: readonly string[] | undefined;
  readonly icon?: BeatUiRenderable;
  readonly invalid?: boolean;
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly maxHour?: number;
  readonly minuteStep?: number;
  readonly styles?: TimeInputStyles;
  readonly timePicker?: BeatUiRenderable;
}

function getHourDigits(maxHour: number | undefined): number {
  if (maxHour === undefined) return 2;
  return Math.max(2, String(maxHour).length);
}

function makeTemplate(hourDigits: number): string {
  return "H".repeat(hourDigits) + ":MM";
}

// N slots: [H0, ..., H(hd-1), M0, M1] where hd = hourDigits
type Slots = (string | null)[];

function makeEmptySlots(hourDigits: number): Slots {
  return Array<string | null>(hourDigits + 2).fill(null);
}

function slotsToDisplay(slots: Slots, hourDigits: number): string {
  if (slots.every((s) => s === null)) return "";
  const h = slots
    .slice(0, hourDigits)
    .map((s) => s ?? "H")
    .join("");
  const m = slots
    .slice(hourDigits)
    .map((s) => s ?? "M")
    .join("");
  return `${h}:${m}`;
}

function slotsComplete(slots: Slots, hourDigits: number): boolean {
  return slots.slice(0, hourDigits + 2).every((s) => s !== null);
}

function slotsToValue(slots: Slots, hourDigits: number): string {
  const h = slots.slice(0, hourDigits).join("");
  const m = slots.slice(hourDigits).join("");
  return `${h}:${m}`;
}

function parseSlots(value: string, hourDigits: number): Slots {
  if (!value) return makeEmptySlots(hourDigits);
  const colonIdx = value.indexOf(":");
  let hourPart: string;
  let minutePart: string;
  if (colonIdx >= 0) {
    hourPart = value.slice(0, colonIdx).replace(/\D/g, "");
    minutePart = value.slice(colonIdx + 1).replace(/\D/g, "");
  } else {
    const digits = value.replace(/\D/g, "");
    hourPart = digits.slice(0, hourDigits);
    minutePart = digits.slice(hourDigits, hourDigits + 2);
  }
  const h = hourPart.padStart(hourDigits, "0").slice(-hourDigits);
  const combined = h + minutePart.padStart(2, "0").slice(0, 2);
  return Array.from({ length: hourDigits + 2 }, (_, i) => combined[i] ?? null);
}

// Backspace deletes the char BEFORE the cursor
function cursorToBackspaceSlot(
  cursor: number,
  hourDigits: number,
): number | null {
  if (cursor <= 0) return null;
  if (cursor <= hourDigits) return cursor - 1;
  if (cursor === hourDigits + 1) return hourDigits - 1; // just past colon → last hour digit
  return cursor - 2; // minute slots
}

// After clearing a slot, where should cursor go
function cursorAfterClear(slot: number, hourDigits: number): number {
  if (slot < hourDigits) return slot;
  return slot + 1; // add 1 for the colon
}

// Map cursor position to the slot to fill when typing a digit
function cursorToTypeSlot(cursor: number, hourDigits: number): number | null {
  if (cursor < hourDigits) return cursor;
  if (cursor <= hourDigits + 1) return hourDigits; // at/after colon → first minute slot
  if (cursor === hourDigits + 2) return hourDigits + 1;
  return null;
}

// After filling a slot, where should cursor go
function cursorAfterFill(slot: number, hourDigits: number): number {
  if (slot < hourDigits - 1) return slot + 1;
  if (slot === hourDigits - 1) return hourDigits + 1; // last hour → skip colon
  if (slot === hourDigits) return hourDigits + 2;
  return hourDigits + 3;
}

function snapMinute(minuteStr: string, step: number): string {
  const m = Number(minuteStr);
  const snapped = Math.round(m / step) * step;
  const clamped = Math.min(snapped, 60 - step);
  return String(clamped).padStart(2, "0");
}

/**
 * Returns the digit if it is valid for the given slot, null otherwise.
 * When maxHour is undefined: default 24-hour clock (00-23 + 24:00 end-of-day).
 * When maxHour is set: hours 00-maxHour, all minutes 00-59.
 */
function validateSlotDigit(
  slot: number,
  digit: string,
  currentSlots: Slots,
  hourDigits: number,
  maxHour: number | undefined,
): string | null {
  const d = Number(digit);
  if (slot < hourDigits) {
    if (maxHour !== undefined) {
      // Reject if the smallest possible completion exceeds maxHour
      const prevStr = currentSlots
        .slice(0, slot)
        .map((s) => s ?? "0")
        .join("");
      const partial = prevStr + digit;
      const remaining = hourDigits - slot - 1;
      const minPossible = Number(partial) * Math.pow(10, remaining);
      return minPossible > maxHour ? null : digit;
    }
    // Default: 2-digit 00-23 + 24
    if (slot === 0) return d <= 2 ? digit : null;
    if (slot === 1) {
      const h1 = Number(currentSlots[0] ?? 0);
      return h1 === 2 && d > 4 ? null : digit;
    }
    return digit;
  }
  // Minute slots
  const minuteSlot = slot - hourDigits; // 0 or 1
  const isHour24 =
    maxHour === undefined &&
    hourDigits === 2 &&
    currentSlots[0] === "2" &&
    currentSlots[1] === "4";
  if (minuteSlot === 0) {
    return isHour24 ? (d === 0 ? digit : null) : d <= 5 ? digit : null;
  }
  return isHour24 ? (d === 0 ? digit : null) : digit;
}

export const TimeInput = component<TimeInputProps>((props) => {
  const isOpen = pulse(false);
  let rootEl: HTMLDivElement | null = null;
  const hourDigits = getHourDigits(props.maxHour);
  const template = makeTemplate(hourDigits);
  const slots: Slots = makeEmptySlots(hourDigits);

  const state = createControllableState<string>({
    defaultValue: props.defaultValue ?? "",
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  const display = pulse(state.state.get());

  // Initialize slots from current value
  const initial = parseSlots(state.state.get(), hourDigits);
  for (let i = 0; i < hourDigits + 2; i++) {
    slots[i] = initial[i] ?? null;
  }

  let syncingFromSlots = false;

  function syncFromSlots(event?: Event): void {
    syncingFromSlots = true;
    display.set(slotsToDisplay(slots, hourDigits));
    if (slotsComplete(slots, hourDigits)) {
      const step = props.minuteStep;
      const isHour24 =
        props.maxHour === undefined &&
        hourDigits === 2 &&
        slots[0] === "2" &&
        slots[1] === "4";
      if (step && step > 1 && !isHour24) {
        const m0 = hourDigits;
        const m1 = hourDigits + 1;
        const snapped = snapMinute(`${slots[m0]}${slots[m1]}`, step);
        slots[m0] = snapped[0] ?? null;
        slots[m1] = snapped[1] ?? null;
      }
      // Skip if hour is disabled
      const hourStr = slots.slice(0, hourDigits).join("");
      if (props.disabledHours?.includes(hourStr)) {
        syncingFromSlots = false;
        return;
      }
      // Skip if minute is disabled
      const minuteStr = slots.slice(hourDigits).join("");
      if (props.disabledMinutes?.includes(minuteStr)) {
        syncingFromSlots = false;
        return;
      }
      display.set(slotsToDisplay(slots, hourDigits));
      state.setValue(slotsToValue(slots, hourDigits), event);
    } else if (slots.every((s) => s === null)) {
      state.setValue("", event);
    }
    syncingFromSlots = false;
  }

  // When the value changes externally (e.g. picker selection), sync back to display and slots.
  onCleanup(
    state.state.on(({ currentValue }) => {
      if (syncingFromSlots) return;
      const parsed = parseSlots(currentValue, hourDigits);
      for (let i = 0; i < hourDigits + 2; i++) {
        slots[i] = parsed[i] ?? null;
      }
      display.set(slotsToDisplay(slots, hourDigits));
    }),
  );

  function togglePicker(): void {
    if (props.disabled || props.readOnly) return;
    isOpen.set(!isOpen.get());
  }

  function handleDocumentClick(event: MouseEvent): void {
    if (rootEl && !rootEl.contains(event.target as Node)) {
      isOpen.set(false);
    }
  }

  function handleInput(event: Event): void {
    // Handles paste and autocomplete — fill slots L→R with validation
    const input = event.currentTarget as HTMLInputElement;
    const incoming = parseSlots(input.value, hourDigits);
    const validated: Slots = makeEmptySlots(hourDigits);
    const totalSlots = hourDigits + 2;
    for (let i = 0; i < totalSlots; i++) {
      const d = incoming[i];
      if (d === null || d === undefined) break;
      const v = validateSlotDigit(i, d, validated, hourDigits, props.maxHour);
      if (v === null) break;
      validated[i] = v;
    }
    for (let i = 0; i < totalSlots; i++) {
      slots[i] = validated[i] ?? null;
    }
    syncFromSlots(event);
    input.value = display.get();
    const filledCount = validated.filter((s) => s !== null).length;
    if (filledCount > 0) {
      const cursorPos =
        filledCount < hourDigits ? filledCount : filledCount + 1;
      input.setSelectionRange(cursorPos, cursorPos);
    }
  }

  function handleKeyDown(event: KeyboardEvent): void {
    const input = event.currentTarget as HTMLInputElement;
    const cursor = input.selectionStart ?? 0;

    if (event.key === "Backspace") {
      event.preventDefault();
      const slot = cursorToBackspaceSlot(cursor, hourDigits);
      if (slot === null) return;
      if (slots[slot] === null) return;
      slots[slot] = null;
      syncFromSlots(event);
      input.value = display.get();
      const newCursor = cursorAfterClear(slot, hourDigits);
      if (display.get().length > 0) {
        input.setSelectionRange(newCursor, newCursor);
      }
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      // Delete key clears the char AT the cursor (same slot as typing)
      const slot = cursorToTypeSlot(cursor, hourDigits);
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
      const slot = cursorToTypeSlot(cursor, hourDigits);
      if (slot === null) return;
      const validated = validateSlotDigit(
        slot,
        event.key,
        slots,
        hourDigits,
        props.maxHour,
      );
      if (validated === null) return;
      slots[slot] = validated;
      syncFromSlots(event);
      input.value = display.get();
      const newCursor = cursorAfterFill(slot, hourDigits);
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
            maxLength={hourDigits + 3}
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
                const text = value === "" ? template : value;
                for (const ch of text) {
                  const span = document.createElement("span");
                  span.textContent = ch;
                  if (ch === "H" || ch === "M") {
                    span.style.cssText = phStyle;
                  } else if (ch !== ":" && value !== "") {
                    span.style.cssText = dgStyle;
                  } else if (ch === ":" && value === "") {
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
          aria-label="Toggle time picker"
          style={props.styles?.iconButton}
          onClick={togglePicker}
        >
          {props.icon}
        </button>
      </div>
      <div
        data-part="picker-wrapper"
        role="dialog"
        style={props.styles?.pickerWrapper}
        ref={(el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.display = "none";
          isOpen.on(({ currentValue }) => {
            htmlEl.style.display = currentValue ? "" : "none";
            if (currentValue) {
              requestAnimationFrame(() => {
                htmlEl
                  .querySelectorAll<HTMLElement>('[aria-selected="true"]')
                  .forEach((btn) => btn.scrollIntoView({ block: "nearest" }));
              });
            }
          });
        }}
      >
        {props.timePicker}
      </div>
    </div>
  );
});
