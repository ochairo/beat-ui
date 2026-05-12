import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { DatePicker, ThemeRoot } from "../../src";

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

function getOpenOptions(target: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    target.querySelectorAll<HTMLButtonElement>("button[role='option']"),
  );
}

describe("DatePicker", () => {
  it("renders with current month header and day grid", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DatePicker />
      </ThemeRoot>,
    );

    const buttons = target.querySelectorAll("button[role='gridcell']");
    expect(buttons.length).toBe(42);

    const headers = target.querySelectorAll("[role='columnheader']");
    expect(headers.length).toBe(7);
    expect(headers[0]?.textContent).toBe("Su");

    cleanup();
  });

  it("selects a date on click", () => {
    const target = document.createElement("div");
    const selected = pulse("");
    const seen: string[] = [];

    const cleanup = render(
      target,
      <ThemeRoot>
        <DatePicker value={selected} onValueChange={(v) => seen.push(v)} />
      </ThemeRoot>,
    );

    const days = target.querySelectorAll("button[role='gridcell']");

    days[10]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(selected.get()).not.toBe("");
    expect(seen.length).toBe(1);

    cleanup();
  });

  it("navigates to previous month", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DatePicker />
      </ThemeRoot>,
    );

    const prevButton = target.querySelector(
      "button[aria-label='Previous month']",
    );
    const initialTitle = getMonthLabel(target) ?? "";

    prevButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(getMonthLabel(target)).not.toBe(initialTitle);

    cleanup();
  });

  it("navigates to next month", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DatePicker />
      </ThemeRoot>,
    );

    const nextButton = target.querySelector("button[aria-label='Next month']");
    const initialTitle = getMonthLabel(target) ?? "";

    nextButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(getMonthLabel(target)).not.toBe(initialTitle);

    cleanup();
  });

  it("uses defaultValue for uncontrolled mode", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DatePicker defaultValue="2025-06-15" />
      </ThemeRoot>,
    );

    const selected = target.querySelector(
      "button[role='gridcell'][aria-selected='true']",
    );
    expect(selected).not.toBeNull();
    expect(selected?.textContent).toBe("15");

    cleanup();
  });

  it("updates the calendar view when the controlled value changes", () => {
    const target = document.createElement("div");
    const value = pulse("2025-01-10");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DatePicker value={value} />
      </ThemeRoot>,
    );

    expect(getMonthLabel(target)).toBe("January");
    expect(getYearLabel(target)).toBe("2025");

    value.set("2025-06-20");

    expect(getMonthLabel(target)).toBe("June");
    expect(getYearLabel(target)).toBe("2025");

    cleanup();
  });

  it("opens a year select with the default range around the viewed year", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DatePicker defaultValue="2026-05-12" />
      </ThemeRoot>,
    );

    const yearButton = target.querySelector("button[aria-label='Choose year']");

    yearButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const options = getOpenOptions(target);

    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBe(11);
    expect(options[0]?.textContent).toContain("2021");
    expect(options[10]?.textContent).toContain("2031");

    cleanup();
  });

  it("opens a month select with all months", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DatePicker defaultValue="2026-05-12" />
      </ThemeRoot>,
    );

    const monthButton = target.querySelector(
      "button[aria-label='Choose month']",
    );

    monthButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const options = getOpenOptions(target);

    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBe(12);
    expect(options[0]?.textContent).toContain("January");
    expect(options[11]?.textContent).toContain("December");

    cleanup();
  });

  it("uses a customized year select range", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DatePicker
          defaultValue="2026-05-12"
          yearSelectRange={{ previous: 2, next: 3 }}
        />
      </ThemeRoot>,
    );

    const yearButton = target.querySelector("button[aria-label='Choose year']");

    yearButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const options = getOpenOptions(target);

    expect(options.length).toBe(6);
    expect(options[0]?.textContent).toContain("2024");
    expect(options[5]?.textContent).toContain("2029");

    cleanup();
  });

  it("changes the viewed year when a year is selected", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DatePicker defaultValue="2026-05-12" />
      </ThemeRoot>,
    );

    const yearButton = target.querySelector("button[aria-label='Choose year']");

    yearButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const option2028 = getOpenOptions(target).find((option) =>
      option.textContent?.includes("2028"),
    );

    option2028?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(getMonthLabel(target)).toBe("May");
    expect(getYearLabel(target)).toBe("2028");

    cleanup();
  });

  it("changes the viewed month when a month is selected", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DatePicker defaultValue="2026-05-12" />
      </ThemeRoot>,
    );

    const monthButton = target.querySelector(
      "button[aria-label='Choose month']",
    );

    monthButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const optionAugust = getOpenOptions(target).find((option) =>
      option.textContent?.includes("August"),
    );

    optionAugust?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(getMonthLabel(target)).toBe("August");
    expect(getYearLabel(target)).toBe("2026");

    cleanup();
  });

  it("updates aria-selected when controlled value changes within same month", () => {
    const target = document.createElement("div");
    const value = pulse("2025-06-10");

    const cleanup = render(
      target,
      <ThemeRoot>
        <DatePicker value={value} />
      </ThemeRoot>,
    );

    const getSelected = (): string | null | undefined =>
      target.querySelector("button[role='gridcell'][aria-selected='true']")
        ?.textContent;

    expect(getSelected()).toBe("10");

    value.set("2025-06-20");

    expect(getSelected()).toBe("20");

    cleanup();
  });
});
