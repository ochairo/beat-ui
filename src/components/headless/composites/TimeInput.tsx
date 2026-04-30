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
  readonly icon?: BeatUiRenderable;
  readonly invalid?: boolean;
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly styles?: TimeInputStyles;
  readonly timePicker?: BeatUiRenderable;
}

const TEMPLATE = "HH:MM";

// 4 slots: [H1, H2, M1, M2]
type Slots = [string | null, string | null, string | null, string | null];

function slotsToDisplay(slots: Slots): string {
  if (
    slots[0] === null &&
    slots[1] === null &&
    slots[2] === null &&
    slots[3] === null
  ) {
    return "";
  }
  return `${slots[0] ?? "H"}${slots[1] ?? "H"}:${slots[2] ?? "M"}${slots[3] ?? "M"}`;
}

function slotsComplete(slots: Slots): boolean {
  return (
    slots[0] !== null &&
    slots[1] !== null &&
    slots[2] !== null &&
    slots[3] !== null
  );
}

function slotsToValue(slots: Slots): string {
  return `${slots[0]}${slots[1]}:${slots[2]}${slots[3]}`;
}

function parseSlots(value: string): Slots {
  const digits = value.replace(/\D/g, "");
  return [
    digits[0] ?? null,
    digits[1] ?? null,
    digits[2] ?? null,
    digits[3] ?? null,
  ];
}

// Map cursor position (0-5 in "HH:MM") to slot index (0-3)
// Backspace deletes the char BEFORE the cursor
function cursorToBackspaceSlot(cursor: number): number | null {
  if (cursor <= 0) return null;
  if (cursor <= 2) return cursor - 1; // 1→0, 2→1
  if (cursor === 3) return 1; // skip colon, delete slot 1
  return cursor - 2; // 4→2, 5→3
}

// After clearing a slot, where should cursor go
function cursorAfterClear(slot: number): number {
  if (slot <= 1) return slot; // 0→0, 1→1
  return slot + 1; // 2→3, 3→4
}

// Map cursor position to the slot to fill when typing a digit
function cursorToTypeSlot(cursor: number): number | null {
  if (cursor === 0) return 0;
  if (cursor === 1) return 1;
  if (cursor <= 3) return 2; // 2 or 3 → slot 2
  if (cursor === 4) return 3;
  return null; // cursor 5 = end
}

// After filling a slot, where should cursor go
function cursorAfterFill(slot: number): number {
  if (slot === 0) return 1;
  if (slot === 1) return 3; // skip colon
  if (slot === 2) return 4;
  return 5;
}

export const TimeInput = component<TimeInputProps>((props) => {
  const isOpen = pulse(false);
  let rootEl: HTMLDivElement | null = null;
  const slots: Slots = [null, null, null, null];

  const state = createControllableState<string>({
    defaultValue: props.defaultValue ?? "",
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  const display = pulse(state.state.get());

  // Initialize slots from current value
  const initial = parseSlots(state.state.get());
  slots[0] = initial[0];
  slots[1] = initial[1];
  slots[2] = initial[2];
  slots[3] = initial[3];

  function syncFromSlots(event?: Event): void {
    const text = slotsToDisplay(slots);
    display.set(text);
    if (slotsComplete(slots)) {
      state.setValue(slotsToValue(slots), event);
    } else if (
      slots[0] === null &&
      slots[1] === null &&
      slots[2] === null &&
      slots[3] === null
    ) {
      state.setValue("", event);
    }
  }

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
    // Handles paste and autocomplete — extract digits, fill slots L→R
    const input = event.currentTarget as HTMLInputElement;
    const digits = input.value.replace(/\D/g, "").slice(0, 4);
    const parsed = parseSlots(digits);
    slots[0] = parsed[0];
    slots[1] = parsed[1];
    slots[2] = parsed[2];
    slots[3] = parsed[3];
    syncFromSlots(event);
    input.value = display.get();
    if (digits.length > 0) {
      const cursorPos = digits.length < 3 ? digits.length : digits.length + 1;
      input.setSelectionRange(cursorPos, cursorPos);
    }
  }

  function handleKeyDown(event: KeyboardEvent): void {
    const input = event.currentTarget as HTMLInputElement;
    const cursor = input.selectionStart ?? 0;

    if (event.key === "Backspace") {
      event.preventDefault();
      const slot = cursorToBackspaceSlot(cursor);
      if (slot === null) return;
      if (slots[slot] === null) return;
      slots[slot] = null;
      syncFromSlots(event);
      input.value = display.get();
      const newCursor = cursorAfterClear(slot);
      if (display.get().length > 0) {
        input.setSelectionRange(newCursor, newCursor);
      }
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      // Delete key clears the char AT the cursor (same slot as typing)
      const slot = cursorToTypeSlot(cursor);
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
      const slot = cursorToTypeSlot(cursor);
      if (slot === null) return;
      slots[slot] = event.key;
      syncFromSlots(event);
      input.value = display.get();
      const newCursor = cursorAfterFill(slot);
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
            maxLength={5}
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
                const text = value === "" ? TEMPLATE : value;
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
          });
        }}
      >
        {props.timePicker}
      </div>
    </div>
  );
});
