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
