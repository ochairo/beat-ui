import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { TimeInput, ThemeRoot } from "../../src";

describe("TimeInput", () => {
  it("renders a time input with icon button", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput id="test-time" name="test-time" />
      </ThemeRoot>,
    );

    const input = target.querySelector("input[type='text']");
    expect(input).not.toBeNull();
    expect(input?.getAttribute("id")).toBe("test-time");
    expect(input?.getAttribute("name")).toBe("test-time");

    const button = target.querySelector(
      "button[aria-label='Toggle time picker']",
    );
    expect(button).not.toBeNull();

    cleanup();
  });

  it("toggles time picker popup on icon button click", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput />
      </ThemeRoot>,
    );

    const dialog = target.querySelector("[role='dialog']") as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.style.display).toBe("none");

    const button = target.querySelector(
      "button[aria-label='Toggle time picker']",
    ) as HTMLButtonElement;
    button.click();
    expect(dialog.style.display).toBe("");

    button.click();
    expect(dialog.style.display).toBe("none");

    document.body.removeChild(target);
    cleanup();
  });

  it("keeps input focus when pressing the time picker icon", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;
    const button = target.querySelector(
      "button[aria-label='Toggle time picker']",
    ) as HTMLButtonElement;
    const dialog = target.querySelector("[role='dialog']") as HTMLElement;

    input.focus();

    const mouseDown = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
    });
    button.dispatchEvent(mouseDown);

    expect(mouseDown.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(input);

    button.click();
    expect(dialog.style.display).toBe("");

    document.body.removeChild(target);
    cleanup();
  });

  it("positions the time picker as a floating viewport layer and honors end alignment", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput styles={{ pickerWrapper: "right:0" }} />
      </ThemeRoot>,
    );

    const dialog = target.querySelector(
      "[data-part='picker-wrapper']",
    ) as HTMLElement;
    const root = dialog.parentElement as HTMLElement;
    const button = target.querySelector(
      "button[aria-label='Toggle time picker']",
    ) as HTMLButtonElement;

    Object.defineProperty(root, "getBoundingClientRect", {
      configurable: true,
      value: () =>
        ({
          x: 300,
          y: 156,
          width: 120,
          height: 44,
          top: 156,
          right: 420,
          bottom: 200,
          left: 300,
          toJSON: () => ({}),
        }) as DOMRect,
    });
    Object.defineProperty(dialog, "getBoundingClientRect", {
      configurable: true,
      value: () =>
        ({
          x: 0,
          y: 0,
          width: 160,
          height: 200,
          top: 0,
          right: 160,
          bottom: 200,
          left: 0,
          toJSON: () => ({}),
        }) as DOMRect,
    });

    button.click();

    expect(dialog.style.position).toBe("fixed");
    expect(dialog.style.top).toBe("204px");
    expect(dialog.style.left).toBe("260px");

    document.body.removeChild(target);
    cleanup();
  });

  it("formats digits as HH:MM while typing", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const value = pulse("");

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput value={value} onValueChange={(v) => value.set(v)} />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    function pressKey(key: string): void {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    }

    pressKey("1");
    expect(input.value).toBe("1H:MM");
    expect(value.get()).toBe("");

    pressKey("4");
    expect(input.value).toBe("14:MM");
    expect(value.get()).toBe("");

    pressKey("3");
    expect(input.value).toBe("14:3M");
    expect(value.get()).toBe("");

    pressKey("0");
    expect(input.value).toBe("14:30");
    expect(value.get()).toBe("14:30");

    document.body.removeChild(target);
    cleanup();
  });

  it("handles backspace while typing", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const value = pulse("");

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput value={value} onValueChange={(v) => value.set(v)} />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    function pressKey(key: string): void {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    }

    pressKey("1");
    pressKey("4");
    expect(input.value).toBe("14:MM");

    pressKey("Backspace");
    expect(input.value).toBe("1H:MM");

    pressKey("Backspace");
    expect(input.value).toBe("");

    document.body.removeChild(target);
    cleanup();
  });

  it("rejects non-digit keys", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "a", bubbles: true }),
    );
    expect(input.value).toBe("");

    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "1", bubbles: true }),
    );
    expect(input.value).toBe("1H:MM");

    document.body.removeChild(target);
    cleanup();
  });

  it("deletes digit at cursor position without shifting others", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const value = pulse("");

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput value={value} onValueChange={(v) => value.set(v)} />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    function pressKey(key: string): void {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    }

    // Type 1234 → 12:34
    pressKey("1");
    pressKey("2");
    pressKey("3");
    pressKey("4");
    expect(input.value).toBe("12:34");
    expect(value.get()).toBe("12:34");

    // Place cursor after '3' (position 4) and backspace → clears slot 2
    input.setSelectionRange(4, 4);
    pressKey("Backspace");
    expect(input.value).toBe("12:M4");

    // Place cursor after '2' (position 2) and backspace → clears slot 1
    input.setSelectionRange(2, 2);
    pressKey("Backspace");
    expect(input.value).toBe("1H:M4");

    document.body.removeChild(target);
    cleanup();
  });

  it("renders as disabled", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput disabled={true} />
      </ThemeRoot>,
    );

    const input = target.querySelector("input[type='text']");
    expect(input?.getAttribute("disabled")).not.toBeNull();

    const button = target.querySelector("button");
    expect(button?.getAttribute("disabled")).not.toBeNull();

    cleanup();
  });

  it("syncs typed value to time picker selection (uncontrolled)", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    function pressKey(key: string): void {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    }

    pressKey("1");
    pressKey("4");
    pressKey("3");
    pressKey("0");

    const selectedHour = target.querySelector(
      "button[role='option'][aria-selected='true'][data-part='option']",
    );
    expect(selectedHour?.textContent).toBe("14");

    document.body.removeChild(target);
    cleanup();
  });

  it("picker selection updates input display (uncontrolled)", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    // Open picker
    const toggleBtn = target.querySelector(
      "button[aria-label='Toggle time picker']",
    ) as HTMLButtonElement;
    toggleBtn.click();

    // Click hour "09"
    const hourButtons = Array.from(
      target.querySelectorAll("button[role='option'][data-part='option']"),
    ) as HTMLButtonElement[];
    const hourBtn = hourButtons.find((b) => b.textContent === "09");
    expect(hourBtn).not.toBeNull();
    hourBtn!.click();

    // Click minute "30"
    const minuteBtn = hourButtons.find((b) => b.textContent === "30");
    expect(minuteBtn).not.toBeNull();
    minuteBtn!.click();

    expect(input.value).toBe("09:30");

    document.body.removeChild(target);
    cleanup();
  });

  it("picker selection updates input display (controlled)", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const value = pulse("");

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput value={value} onValueChange={(v) => value.set(v)} />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    // Open picker
    const toggleBtn = target.querySelector(
      "button[aria-label='Toggle time picker']",
    ) as HTMLButtonElement;
    toggleBtn.click();

    const columns = target.querySelectorAll("[data-part='column']");
    const hourColumn = columns[0] as HTMLElement;
    const minuteColumn = columns[1] as HTMLElement;

    // Click hour "10"
    const hourBtn = Array.from(
      hourColumn.querySelectorAll("button[role='option']"),
    ).find((b) => b.textContent === "10") as HTMLButtonElement;
    expect(hourBtn).not.toBeUndefined();
    hourBtn.click();

    // Click minute "15"
    const minuteBtn = Array.from(
      minuteColumn.querySelectorAll("button[role='option']"),
    ).find((b) => b.textContent === "15") as HTMLButtonElement;
    expect(minuteBtn).not.toBeUndefined();
    minuteBtn.click();

    expect(value.get()).toBe("10:15");
    expect(input.value).toBe("10:15");

    document.body.removeChild(target);
    cleanup();
  });

  it("rejects invalid hour digits (H1 > 2, H2 > 4 when H1=2, M1 > 5)", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    function pressKey(key: string): void {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    }

    // H1 can only be 0-2; typing 9 should be rejected
    pressKey("9");
    expect(input.value).toBe("");

    // H1=2, H2 can only be 0-4; typing 5 should be rejected
    pressKey("2");
    pressKey("5");
    expect(input.value).toBe("2H:MM");

    // H2=4 accepted
    pressKey("4");
    expect(input.value).toBe("24:MM");

    // M1 when hour=24 can only be 0; typing 1 should be rejected
    pressKey("1");
    expect(input.value).toBe("24:MM");

    // M1=0 accepted
    pressKey("0");
    expect(input.value).toBe("24:0M");

    // M2 when hour=24 can only be 0; typing 5 should be rejected
    pressKey("5");
    expect(input.value).toBe("24:0M");

    // M2=0 accepted → 24:00
    pressKey("0");
    expect(input.value).toBe("24:00");

    document.body.removeChild(target);
    cleanup();
  });

  it("rejects invalid minute digit M1 > 5 for normal hours", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    function pressKey(key: string): void {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    }

    pressKey("1");
    pressKey("4");
    // M1 > 5 rejected
    pressKey("6");
    expect(input.value).toBe("14:MM");

    // M1=3 accepted
    pressKey("3");
    expect(input.value).toBe("14:3M");

    document.body.removeChild(target);
    cleanup();
  });

  it("disabledHours prevents setting a disabled hour via typing", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const value = pulse("");

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput
          value={value}
          onValueChange={(v) => value.set(v)}
          disabledHours={["22", "23"]}
        />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    function pressKey(key: string): void {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    }

    pressKey("2");
    pressKey("2");
    pressKey("3");
    pressKey("0");

    // Value should NOT be set because hour 22 is disabled
    expect(value.get()).toBe("");

    document.body.removeChild(target);
    cleanup();
  });

  it("disabledMinutes prevents setting a disabled minute via typing", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const value = pulse("");

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput
          value={value}
          onValueChange={(v) => value.set(v)}
          disabledMinutes={["30"]}
        />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    function pressKey(key: string): void {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    }

    pressKey("1");
    pressKey("4");
    pressKey("3");
    pressKey("0");

    // Value should NOT be set because minute 30 is disabled
    expect(value.get()).toBe("");

    document.body.removeChild(target);
    cleanup();
  });

  it("picker includes hour 24 and selecting 24 forces minute 00", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const value = pulse("");

    const cleanup = render(
      target,
      <ThemeRoot>
        <TimeInput value={value} onValueChange={(v) => value.set(v)} />
      </ThemeRoot>,
    );

    const toggleBtn = target.querySelector(
      "button[aria-label='Toggle time picker']",
    ) as HTMLButtonElement;
    toggleBtn.click();

    const columns = target.querySelectorAll("[data-part='column']");
    const hourColumn = columns[0] as HTMLElement;
    const minuteColumn = columns[1] as HTMLElement;

    const hourBtn = Array.from(
      hourColumn.querySelectorAll("button[role='option']"),
    ).find((b) => b.textContent === "24") as HTMLButtonElement;
    expect(hourBtn).not.toBeUndefined();
    hourBtn.click();

    expect(value.get()).toBe("24:00");

    // All non-00 minute options should be disabled
    const minuteBtns = Array.from(
      minuteColumn.querySelectorAll("button[role='option']"),
    ) as HTMLButtonElement[];
    const nonZeroDisabled = minuteBtns
      .filter((b) => b.textContent !== "00")
      .every((b) => b.disabled);
    expect(nonZeroDisabled).toBe(true);

    document.body.removeChild(target);
    cleanup();
  });
});
