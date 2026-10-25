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
  ).find(
    (button) =>
      button.textContent === String(day) &&
      (!button.hasAttribute("data-outside") ||
        button.getAttribute("data-outside") === "false"),
  );
}

function getActiveDay(target: HTMLElement): HTMLButtonElement {
  const days = target.querySelectorAll<HTMLButtonElement>(
    "button[role='gridcell'][tabindex='0']",
  );
  expect(days).toHaveLength(1);
  const day = days[0];
  if (!day) throw new Error("Missing active day");
  return day;
}

function pressKey(
  target: HTMLElement,
  key: string,
  shiftKey = false,
): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key,
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

describe("DateRangePicker", () => {
  it("forwards group label and description references", () => {
    const target = document.createElement("div");
    const cleanup = render(
      target,
      <DateRangePicker ariaLabelledby="range-label" ariaDescribedby="range-help" />,
    );
    try {
      const group = target.querySelector("[role='group']");
      expect(group?.getAttribute("aria-labelledby")).toBe("range-label");
      expect(group?.getAttribute("aria-describedby")).toBe("range-help");
    } finally {
      cleanup();
    }
  });

  it.each([
    ["2025-05-31", "ArrowRight", false, "June", "2025", "1"],
    ["2025-01-01", "ArrowLeft", false, "December", "2024", "31"],
    ["2025-05-03", "ArrowUp", false, "April", "2025", "26"],
    ["2025-05-29", "ArrowDown", false, "June", "2025", "5"],
    ["2025-05-01", "Home", false, "April", "2025", "27"],
    ["2025-05-31", "End", false, "May", "2025", "31"],
    ["2025-05-20", "End", false, "May", "2025", "24"],
    ["2025-03-31", "PageUp", false, "February", "2025", "28"],
    ["2024-01-31", "PageDown", false, "February", "2024", "29"],
    ["2025-12-31", "PageDown", false, "January", "2026", "31"],
    ["2024-02-29", "PageUp", true, "February", "2023", "28"],
    ["2024-02-29", "PageDown", true, "February", "2025", "28"],
  ])(
    "moves %s with %s (shift=%s) without selecting a date",
    (start, key, shiftKey, month, year, day) => {
      const target = document.createElement("div");
      document.body.appendChild(target);
      const value = pulse<DateRangeValue>({ start, end: "" });
      const onValueChange = vi.fn();
      const cleanup = render(
        target,
        <DateRangePicker value={value} onValueChange={onValueChange} />,
      );
      try {
        const initial = getActiveDay(target);
        expect(initial.textContent).toBe(String(Number(start.slice(-2))));
        initial.focus();
        expect(pressKey(initial, key, shiftKey).defaultPrevented).toBe(true);
        const active = getActiveDay(target);
        expect(document.activeElement).toBe(active);
        expect(active.textContent).toBe(day);
        expect(active.getAttribute("data-outside")).toBe("false");
        expect(getMonthLabel(target)).toBe(month);
        expect(getYearLabel(target)).toBe(year);
        expect(value.get()).toEqual({ start, end: "" });
        expect(onValueChange).not.toHaveBeenCalled();
        expect(
          target.querySelectorAll("[role='gridcell'][tabindex='-1']"),
        ).toHaveLength(41);
      } finally {
        cleanup();
        target.remove();
      }
    },
  );

  it("starts on today without a selection and on a current-month day when today is not visible", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 4, 20));
    const target = document.createElement("div");
    let cleanup = render(target, <DateRangePicker />);
    try {
      expect(getActiveDay(target).getAttribute("aria-current")).toBe("date");
      cleanup();
      cleanup = render(
        target,
        <DateRangePicker defaultValue={{ start: "", end: "2025-01-10" }} />,
      );
      expect(getActiveDay(target)).toBe(findCurrentMonthDayButton(target, 1));
    } finally {
      cleanup();
      vi.useRealTimers();
    }
  });

  it("keeps focus outside the grid during external and header changes", () => {
    const target = document.createElement("div");
    const outside = document.createElement("button");
    document.body.append(target, outside);
    const value = pulse<DateRangeValue>({ start: "2025-05-20", end: "" });
    const cleanup = render(target, <DateRangePicker value={value} />);
    try {
      outside.focus();
      value.set({ start: "2026-01-02", end: "" });
      expect(document.activeElement).toBe(outside);
      getActiveDay(target);
      const next = target.querySelector<HTMLButtonElement>(
        "button[aria-label='Next month']",
      );
      if (!next) throw new Error("Missing next-month control");
      next.focus();
      next.click();
      expect(document.activeElement).toBe(next);
      getActiveDay(target);
      expect(getMonthLabel(target)).toBe("February");
      for (const [label, optionText] of [
        ["Choose month", "April"],
        ["Choose year", "2027"],
      ]) {
        const trigger = target.querySelector<HTMLButtonElement>(
          `button[aria-label='${label}']`,
        );
        if (!trigger) throw new Error(`Missing ${label} control`);
        trigger.focus();
        trigger.click();
        const option = Array.from(
          target.querySelectorAll<HTMLElement>("[role='option']"),
        ).find((element) => element.textContent === optionText);
        if (!option) throw new Error(`Missing ${optionText} option`);
        option.click();
        expect(document.activeElement).toBe(trigger);
        getActiveDay(target);
      }
      expect(getMonthLabel(target)).toBe("April");
      expect(getYearLabel(target)).toBe("2027");
    } finally {
      cleanup();
      target.remove();
      outside.remove();
    }
  });

  it("keeps meaningful date focus when external updates reuse the focused button", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const value = pulse<DateRangeValue>({ start: "2025-05-20", end: "" });
    const cleanup = render(target, <DateRangePicker value={value} />);
    try {
      getActiveDay(target).focus();
      value.set({ start: "2026-01-02", end: "" });
      expect(document.activeElement).toBe(getActiveDay(target));
      expect(getActiveDay(target).textContent).toBe("20");
      expect(getActiveDay(target).getAttribute("data-outside")).toBe("false");
      expect(getMonthLabel(target)).toBe("January");
    } finally {
      cleanup();
      target.remove();
    }
  });

  it("retains the selected spillover date for first-endpoint and standalone completion", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const value = pulse<DateRangeValue>({ start: "2025-05-20", end: "2025-05-22" });
    const onValueChange = vi.fn();
    const cleanup = render(
      target,
      <DateRangePicker value={value} onValueChange={onValueChange} />,
    );
    try {
      const outside = Array.from(
        target.querySelectorAll<HTMLButtonElement>(
          "button[role='gridcell'][data-outside]:not([data-outside='false'])",
        ),
      ).find((button) => button.textContent === "1");
      if (!outside) throw new Error("Missing June 1 spillover date");
      outside.focus();
      outside.click();
      expect(value.get()).toEqual({ start: "2025-06-01", end: "" });
      expect(document.activeElement).toBe(getActiveDay(target));
      expect(getActiveDay(target).textContent).toBe("1");
      expect(getActiveDay(target).getAttribute("data-outside")).toBe("false");
      pressKey(getActiveDay(target), "ArrowRight");
      expect(getActiveDay(target).textContent).toBe("2");
      expect(onValueChange).toHaveBeenCalledTimes(1);
      getActiveDay(target).click();
      expect(value.get()).toEqual({ start: "2025-06-01", end: "2025-06-02" });
      expect(document.activeElement).toBe(getActiveDay(target));
      expect(getActiveDay(target).textContent).toBe("2");
    } finally {
      cleanup();
      target.remove();
    }
  });

  it("preserves a caller's focus transfer on completed selection", () => {
    const target = document.createElement("div");
    const toggle = document.createElement("button");
    document.body.append(target, toggle);
    const cleanup = render(
      target,
      <DateRangePicker
        defaultValue={{ start: "2025-05-20", end: "" }}
        onValueChange={() => toggle.focus()}
      />,
    );
    try {
      getActiveDay(target).focus();
      getActiveDay(target).click();
      expect(document.activeElement).toBe(toggle);
      getActiveDay(target);
    } finally {
      cleanup();
      target.remove();
      toggle.remove();
    }
  });

  it("leaves native activation and Tab unhandled", () => {
    const target = document.createElement("div");
    const onValueChange = vi.fn();
    const cleanup = render(
      target,
      <DateRangePicker onValueChange={onValueChange} />,
    );
    try {
      const day = getActiveDay(target);
      for (const key of ["Enter", " ", "Tab"]) {
        expect(pressKey(day, key).defaultPrevented).toBe(false);
      }
      expect(onValueChange).not.toHaveBeenCalled();
    } finally {
      cleanup();
    }
  });

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
        expect(pressKey(control, "ArrowRight").defaultPrevented).toBe(false);
        expect(pressKey(control, "PageDown", true).defaultPrevented).toBe(false);
      }
      expect(
        target.querySelectorAll("[role='gridcell'][tabindex='-1']"),
      ).toHaveLength(42);
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
