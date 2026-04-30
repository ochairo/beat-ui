import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { DatePicker, ThemeRoot } from "../../src";

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
    const titleEl = target.querySelector("span");

    const initialTitle = titleEl?.textContent ?? "";

    prevButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(titleEl?.textContent).not.toBe(initialTitle);

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
    const titleEl = target.querySelector("span");

    const initialTitle = titleEl?.textContent ?? "";

    nextButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(titleEl?.textContent).not.toBe(initialTitle);

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
});
