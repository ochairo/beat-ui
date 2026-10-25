import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it, vi } from "vitest";

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
  it("keeps the end date's month visible and still follows later external updates", () => {
    const target = document.createElement("div");
    const value = pulse<DateRangeValue>({ start: "2025-05-20", end: "" });
    const cleanup = render(target, <DateRangePicker value={value} />);

    try {
      const next = target.querySelector<HTMLButtonElement>(
        "button[aria-label='Next month']",
      );
      if (!next) throw new Error("Missing next-month control");
      next.click();
      const end = findCurrentMonthDayButton(target, 10);
      if (!end) throw new Error("Missing June 10");
      end.click();
      expect(value.get()).toEqual({ start: "2025-05-20", end: "2025-06-10" });
      expect(getMonthLabel(target)).toBe("June");
      expect(
        findCurrentMonthDayButton(target, 10)?.getAttribute("data-range-edge"),
      ).toBe("end");

      value.set({ start: "2026-01-02", end: "2026-01-04" });
      expect(getMonthLabel(target)).toBe("January");
      expect(getYearLabel(target)).toBe("2026");
    } finally {
      cleanup();
    }
  });

  it("navigates to an outside day when completing a range", () => {
    const target = document.createElement("div");
    const value = pulse<DateRangeValue>({ start: "2025-05-20", end: "" });
    const cleanup = render(target, <DateRangePicker value={value} />);

    try {
      const outside = Array.from(
        target.querySelectorAll<HTMLButtonElement>(
          "button[data-outside]:not([data-outside='false'])",
        ),
      ).find((button) => button.textContent === "1");
      if (!outside) throw new Error("Missing June 1 outside day");
      outside.click();
      expect(value.get()).toEqual({ start: "2025-05-20", end: "2025-06-01" });
      expect(getMonthLabel(target)).toBe("June");
    } finally {
      cleanup();
    }
  });

  it("follows a caller's normalized range after local selection", () => {
    const target = document.createElement("div");
    const value = pulse<DateRangeValue>({ start: "2025-05-20", end: "" });
    const cleanup = render(
      target,
      <DateRangePicker
        value={value}
        onValueChange={() => {
          value.set({ start: "2025-07-01", end: "2025-07-02" });
        }}
      />,
    );

    try {
      const day = findCurrentMonthDayButton(target, 21);
      if (!day) throw new Error("Missing May 21");
      day.click();
      expect(getMonthLabel(target)).toBe("July");
      expect(value.get()).toEqual({ start: "2025-07-01", end: "2025-07-02" });
    } finally {
      cleanup();
    }
  });

  it("groups weekday headers and all six weeks into grid rows", () => {
    const target = document.createElement("div");
    const cleanup = render(
      target,
      <DateRangePicker defaultValue={{ start: "2025-05-20", end: "" }} />,
    );

    try {
      const grid = target.querySelector("[role='grid']");
      if (!grid) throw new Error("Missing calendar grid");
      const rows = Array.from(grid.children);
      expect(rows).toHaveLength(7);
      for (const [index, row] of rows.entries()) {
        expect(row.getAttribute("role")).toBe("row");
        expect(row.children).toHaveLength(7);
        for (const cell of Array.from(row.children)) {
          expect(cell.getAttribute("role")).toBe(
            index === 0 ? "columnheader" : "gridcell",
          );
        }
      }
    } finally {
      cleanup();
    }
  });

  it("disables selection and every calendar navigation control", () => {
    const target = document.createElement("div");
    const initial = { start: "2025-05-20", end: "" };
    const value = pulse<DateRangeValue>(initial);
    const onValueChange = vi.fn();
    const cleanup = render(
      target,
      <DateRangePicker value={value} disabled onValueChange={onValueChange} />,
    );

    try {
      const controls = target.querySelectorAll<HTMLButtonElement>("button");
      expect(controls).toHaveLength(46);
      for (const control of controls) {
        expect.soft(control.disabled).toBe(true);
        control.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
      expect(value.get()).toEqual(initial);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(getMonthLabel(target)).toBe("May");
      expect(getYearLabel(target)).toBe("2025");
      expect(target.querySelectorAll("[role='option']")).toHaveLength(0);
    } finally {
      cleanup();
    }
  });

  it("releases controlled subscriptions and stops updating detached day buttons", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const value = pulse<DateRangeValue>({ start: "2025-05-20", end: "" });
    let subscriptions = 0;
    const trackedValue = Object.create(value, {
      on: {
        value: (callback: Parameters<typeof value.on>[0]) => {
          subscriptions += 1;
          const unsubscribe = value.on(callback);
          return () => {
            subscriptions -= 1;
            unsubscribe();
          };
        },
      },
    }) as typeof value;

    try {
      for (let mount = 0; mount < 2; mount += 1) {
        const cleanup = render(target, <DateRangePicker value={trackedValue} />);
        const day = findCurrentMonthDayButton(target, 20);
        if (!day) {
          cleanup();
          throw new Error("Missing May 20");
        }
        const attributeSpy = vi.spyOn(day, "setAttribute");
        expect(subscriptions).toBeGreaterThan(0);
        cleanup();
        expect(day.isConnected).toBe(false);
        expect.soft(subscriptions).toBe(0);
        attributeSpy.mockClear();
        value.set({ start: "2025-05-20", end: "2025-05-22" });
        expect.soft(attributeSpy).not.toHaveBeenCalled();
        attributeSpy.mockRestore();
      }
    } finally {
      target.remove();
    }
  });

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
