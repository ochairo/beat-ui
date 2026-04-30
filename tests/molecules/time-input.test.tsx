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
});
