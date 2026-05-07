import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { DateInput, ThemeRoot } from "../../src";

describe("DateInput", () => {
  it("renders a date input", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput id="test-date" name="test-date" />
      </ThemeRoot>,
    );

    const input = target.querySelector("input[type='text']");
    expect(input).not.toBeNull();
    expect(input?.getAttribute("id")).toBe("test-date");
    expect(input?.getAttribute("name")).toBe("test-date");

    cleanup();
  });

  it("tracks value changes through a Pulse node", () => {
    const target = document.createElement("div");
    const value = pulse("");
    const seen: string[] = [];

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput value={value} onValueChange={(v) => seen.push(v)} />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(input, "2025-06-15");
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(value.get()).toBe("2025-06-15");
    expect(seen).toEqual(["2025-06-15"]);

    cleanup();
  });

  it("renders as disabled", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput disabled={true} />
      </ThemeRoot>,
    );

    const input = target.querySelector("input[type='text']");
    expect(input?.getAttribute("disabled")).not.toBeNull();

    cleanup();
  });

  it("renders a calendar icon button", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput />
      </ThemeRoot>,
    );

    const button = target.querySelector("button[aria-label='Toggle calendar']");
    expect(button).not.toBeNull();

    const svg = button?.querySelector("svg");
    expect(svg).not.toBeNull();

    cleanup();
  });

  it("toggles calendar popup on icon button click", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput />
      </ThemeRoot>,
    );

    const dialog = target.querySelector("[role='dialog']") as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.style.display).toBe("none");

    const button = target.querySelector(
      "button[aria-label='Toggle calendar']",
    ) as HTMLButtonElement;
    button.click();
    expect(dialog.style.display).toBe("");

    button.click();
    expect(dialog.style.display).toBe("none");

    document.body.removeChild(target);
    cleanup();
  });

  it("syncs typed value to calendar view (uncontrolled)", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(input, "20250615");
    input.dispatchEvent(new Event("input", { bubbles: true }));

    const titleEl = target.querySelector("[role='dialog'] span") as HTMLElement;
    expect(titleEl?.textContent).toBe("June 2025");

    document.body.removeChild(target);
    cleanup();
  });

  it("auto-pads single-digit month when typing 2–9", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const value = pulse("");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput value={value} onValueChange={(v) => value.set(v)} />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    function pressKey(key: string): void {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    }

    // Type year
    pressKey("2");
    pressKey("0");
    pressKey("2");
    pressKey("5");
    // Type month as single digit "6" — should auto-pad to "06"
    pressKey("6");
    expect(input.value).toContain("06");

    // Type day
    pressKey("1");
    pressKey("5");
    expect(value.get()).toBe("2025-06-15");

    document.body.removeChild(target);
    cleanup();
  });

  it("auto-pads single-digit day when typing 4–9", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const value = pulse("");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput value={value} onValueChange={(v) => value.set(v)} />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    function pressKey(key: string): void {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    }

    // Type year + month
    pressKey("2");
    pressKey("0");
    pressKey("2");
    pressKey("5");
    pressKey("0");
    pressKey("6");
    // Type day as single digit "7" — should auto-pad to "07"
    pressKey("7");
    expect(value.get()).toBe("2025-06-07");

    document.body.removeChild(target);
    cleanup();
  });

  it("syncs input field when calendar selects a date", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput defaultValue="1111-11-11" />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    expect(input.value).toBe("1111-11-11");

    // Click a day cell in the calendar (index 10 is reliably inside the current month)
    const dayCells = target.querySelectorAll("button[role='gridcell']");
    (dayCells[10] as HTMLButtonElement)?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );

    expect(input.value).not.toBe("1111-11-11");
    expect(input.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    document.body.removeChild(target);
    cleanup();
  });

  it("calendar reflects day selection when input value changes", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const value = pulse("2025-06-10");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput value={value} onValueChange={(v) => value.set(v)} />
      </ThemeRoot>,
    );

    const getSelected = (): string | null | undefined =>
      target.querySelector("button[role='gridcell'][aria-selected='true']")
        ?.textContent;

    expect(getSelected()).toBe("10");

    value.set("2025-06-20");

    expect(getSelected()).toBe("20");

    document.body.removeChild(target);
    cleanup();
  });

  it("calendar highlights day after typing a complete date", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const value = pulse("");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput value={value} onValueChange={(v) => value.set(v)} />
      </ThemeRoot>,
    );

    const input = target.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;

    function pressKey(key: string): void {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    }

    pressKey("2");
    pressKey("0");
    pressKey("2");
    pressKey("5");
    pressKey("0");
    pressKey("6");
    pressKey("1");
    pressKey("5");

    expect(value.get()).toBe("2025-06-15");

    const selected = target.querySelector(
      "button[role='gridcell'][aria-selected='true']",
    );
    expect(selected?.textContent).toBe("15");

    document.body.removeChild(target);
    cleanup();
  });
});
