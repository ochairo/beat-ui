import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { DateRangeInput, ThemeRoot, type DateRangeValue } from "../../src";

function findCurrentMonthDayButton(
  target: HTMLElement,
  day: number,
): HTMLButtonElement | undefined {
  return Array.from(
    target.querySelectorAll<HTMLButtonElement>("button[role='gridcell']"),
  ).find((button) => button.textContent === String(day));
}

describe("DateRangeInput", () => {
  it("reconciles the active field when a completed edit reorders the range", () => {
    const target = document.createElement("div");
    const value = pulse<DateRangeValue>({
      start: "2025-06-15",
      end: "2025-06-18",
    });
    const cleanup = render(target, <DateRangeInput value={value} />);

    try {
      const start = target.querySelector<HTMLInputElement>(
        "input[aria-label='Start date']",
      );
      const end = target.querySelector<HTMLInputElement>(
        "input[aria-label='End date']",
      );
      if (!start || !end) throw new Error("Missing range inputs");

      start.setSelectionRange(3, 4);
      start.dispatchEvent(
        new KeyboardEvent("keydown", { key: "6", bubbles: true }),
      );

      expect(value.get()).toEqual({ start: "2025-06-18", end: "2026-06-15" });
      expect(start.value).toBe("2025-06-18");
      expect(end.value).toBe("2026-06-15");

      // A subsequent edit must use the reconciled slots as well as the display.
      start.setSelectionRange(9, 10);
      start.dispatchEvent(
        new KeyboardEvent("keydown", { key: "9", bubbles: true }),
      );
      expect(value.get()).toEqual({ start: "2025-06-19", end: "2026-06-15" });
      expect(start.value).toBe("2025-06-19");
    } finally {
      cleanup();
    }
  });

  it("keeps the calendar toggle in the native tab order", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const cleanup = render(target, <DateRangeInput />);

    try {
      const toggle = target.querySelector<HTMLButtonElement>(
        "button[aria-label='Toggle date range calendar']",
      );
      const dialog = target.querySelector<HTMLElement>("[role='dialog']");
      if (!toggle || !dialog) throw new Error("Missing range calendar controls");

      expect(toggle.disabled).toBe(false);
      expect(toggle.tabIndex).toBe(0);
      toggle.focus();
      expect(document.activeElement).toBe(toggle);
      toggle.click();
      expect(dialog.style.display).toBe("");
    } finally {
      cleanup();
      target.remove();
    }
  });

  it("renders start and end inputs with derived ids and names", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateRangeInput id="travel" name="travel" />
      </ThemeRoot>,
    );

    const inputs =
      target.querySelectorAll<HTMLInputElement>("input[type='text']");
    expect(inputs).toHaveLength(2);
    expect(inputs[0]?.getAttribute("id")).toBe("travel-start");
    expect(inputs[0]?.getAttribute("name")).toBe("travel-start");
    expect(inputs[1]?.getAttribute("id")).toBe("travel-end");
    expect(inputs[1]?.getAttribute("name")).toBe("travel-end");

    cleanup();
  });

  it("updates both inputs when a date range is chosen from the popup", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const value = pulse<DateRangeValue>({
      start: "2026-05-12",
      end: "2026-05-12",
    });

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateRangeInput value={value} />
      </ThemeRoot>,
    );

    const toggleButton = target.querySelector(
      "button[aria-label='Toggle date range calendar']",
    ) as HTMLButtonElement;
    const dialog = target.querySelector("[role='dialog']") as HTMLElement;
    toggleButton.click();
    expect(dialog.style.display).toBe("");

    findCurrentMonthDayButton(target, 14)?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    expect(dialog.style.display).toBe("");

    findCurrentMonthDayButton(target, 18)?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );

    const inputs =
      target.querySelectorAll<HTMLInputElement>("input[type='text']");

    expect(value.get()).toEqual({
      start: "2026-05-14",
      end: "2026-05-18",
    });
    expect(dialog.style.display).toBe("none");
    expect(inputs[0]?.value).toBe("2026-05-14");
    expect(inputs[1]?.value).toBe("2026-05-18");

    document.body.removeChild(target);
    cleanup();
  });

  it("tracks typed values for the start and end fields", () => {
    const target = document.createElement("div");
    const value = pulse<DateRangeValue>({ start: "", end: "" });

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateRangeInput value={value} />
      </ThemeRoot>,
    );

    const inputs =
      target.querySelectorAll<HTMLInputElement>("input[type='text']");

    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(inputs[0], "2025-06-15");
    inputs[0]?.dispatchEvent(new Event("input", { bubbles: true }));

    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(inputs[1], "2025-06-18");
    inputs[1]?.dispatchEvent(new Event("input", { bubbles: true }));

    expect(value.get()).toEqual({
      start: "2025-06-15",
      end: "2025-06-18",
    });

    cleanup();
  });
});
