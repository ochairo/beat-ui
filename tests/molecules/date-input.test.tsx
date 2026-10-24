import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { DateInput, Dialog, ThemeRoot } from "../../src";

function findCalendarDayButton(target: HTMLElement): HTMLButtonElement | null {
  return target.querySelector("button[role='gridcell']");
}

function getCalendarMonthLabel(target: HTMLElement): string | null | undefined {
  return target.querySelector(
    "button[aria-label='Choose month'] [data-part='trigger-label']",
  )?.textContent;
}

function getCalendarYearLabel(target: HTMLElement): string | null | undefined {
  return target.querySelector(
    "button[aria-label='Choose year'] [data-part='trigger-label']",
  )?.textContent;
}

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

  it("closes the calendar popup after selecting a date", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput />
      </ThemeRoot>,
    );

    const dialog = target.querySelector("[role='dialog']") as HTMLElement;
    const button = target.querySelector(
      "button[aria-label='Toggle calendar']",
    ) as HTMLButtonElement;

    button.click();
    expect(dialog.style.display).toBe("");

    findCalendarDayButton(target)?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );

    expect(dialog.style.display).toBe("none");

    document.body.removeChild(target);
    cleanup();
  });

  it("keeps input focus when pressing the calendar icon", () => {
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
    const button = target.querySelector(
      "button[aria-label='Toggle calendar']",
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

  it("positions the calendar as a floating viewport layer when open", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput />
      </ThemeRoot>,
    );

    const dialog = target.querySelector(
      "[data-part='calendar-wrapper']",
    ) as HTMLElement;
    const root = dialog.parentElement as HTMLElement;
    const button = target.querySelector(
      "button[aria-label='Toggle calendar']",
    ) as HTMLButtonElement;

    Object.defineProperty(root, "getBoundingClientRect", {
      configurable: true,
      value: () =>
        ({
          x: 80,
          y: 100,
          width: 120,
          height: 44,
          top: 100,
          right: 200,
          bottom: 144,
          left: 80,
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
          height: 180,
          top: 0,
          right: 160,
          bottom: 180,
          left: 0,
          toJSON: () => ({}),
        }) as DOMRect,
    });

    button.click();

    expect(dialog.style.position).toBe("fixed");
    expect(dialog.style.top).toBe("148px");
    expect(dialog.style.left).toBe("80px");

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

    expect(getCalendarMonthLabel(target)).toBe("June");
    expect(getCalendarYearLabel(target)).toBe("2025");

    document.body.removeChild(target);
    cleanup();
  });

  it("opens the year options inside the calendar popup", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateInput defaultValue="2026-05-12" />
      </ThemeRoot>,
    );

    const toggleButton = target.querySelector(
      "button[aria-label='Toggle calendar']",
    ) as HTMLButtonElement;
    toggleButton.click();

    const yearButton = target.querySelector("button[aria-label='Choose year']");
    yearButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const options = target.querySelectorAll("button[role='option']");

    expect(options.length).toBe(11);
    expect(options[0]?.textContent).toContain("2021");
    expect(options[10]?.textContent).toContain("2031");

    document.body.removeChild(target);
    cleanup();
  });

  it("opens the year options when DateInput is inside a dialog", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <ThemeRoot>
        <Dialog open={pulse(true)} title="Task details">
          <DateInput defaultValue="2026-05-12" />
        </Dialog>
      </ThemeRoot>,
    );

    const toggleButton = target.querySelector(
      "button[aria-label='Toggle calendar']",
    ) as HTMLButtonElement;
    toggleButton.click();

    const yearButton = document.body.querySelector(
      "button[aria-label='Choose year']",
    );
    yearButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const options = document.body.querySelectorAll("button[role='option']");

    expect(options.length).toBe(11);
    expect(options[0]?.textContent).toContain("2021");
    expect(options[10]?.textContent).toContain("2031");

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
