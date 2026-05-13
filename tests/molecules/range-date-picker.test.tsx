import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { DateRangePicker, ThemeRoot, type DateRangeValue } from "../../src";

function getMonthLabel(target: HTMLElement): string | null | undefined {
  return target.querySelector(
    "button[aria-label='Choose month'] [data-part='trigger-label']",
  )?.textContent;
}

function getYearLabel(target: HTMLElement): string | null | undefined {
  return target.querySelector(
    "button[aria-label='Choose year'] [data-part='trigger-label']",
  )?.textContent;
}

function findCurrentMonthDayButton(
  target: HTMLElement,
  day: number,
): HTMLButtonElement | undefined {
  return Array.from(
    target.querySelectorAll<HTMLButtonElement>("button[role='gridcell']"),
  ).find((button) => button.textContent === String(day));
}

describe("DateRangePicker", () => {
  it("selects a sorted date range and highlights the in-between days", () => {
    const target = document.createElement("div");
    const value = pulse<DateRangeValue>({
      start: "2026-05-12",
      end: "2026-05-12",
    });

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateRangePicker value={value} />
      </ThemeRoot>,
    );

    findCurrentMonthDayButton(target, 16)?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    findCurrentMonthDayButton(target, 12)?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );

    expect(value.get()).toEqual({
      start: "2026-05-12",
      end: "2026-05-16",
    });
    expect(target.querySelectorAll("button[data-in-range='true']").length).toBe(
      3,
    );

    cleanup();
  });

  it("updates the calendar view when the controlled range changes", () => {
    const target = document.createElement("div");
    const value = pulse<DateRangeValue>({
      start: "2025-01-10",
      end: "2025-01-14",
    });

    const cleanup = render(
      target,
      <ThemeRoot>
        <DateRangePicker value={value} />
      </ThemeRoot>,
    );

    expect(getMonthLabel(target)).toBe("January");
    expect(getYearLabel(target)).toBe("2025");

    value.set({
      start: "2025-06-20",
      end: "2025-06-24",
    });

    expect(getMonthLabel(target)).toBe("June");
    expect(getYearLabel(target)).toBe("2025");

    cleanup();
  });
});
