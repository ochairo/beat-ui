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
  it("honors readOnly in both field editing handlers", () => {
    const target = document.createElement("div");
    const value = pulse<DateRangeValue>({
      start: "2025-06-15",
      end: "2025-06-18",
    });
    const seen: DateRangeValue[] = [];
    const cleanup = render(
      target,
      <DateRangeInput
        value={value}
        readOnly
        onValueChange={(next) => seen.push(next)}
      />,
    );

    try {
      const inputs = target.querySelectorAll("input");
      expect(inputs).toHaveLength(2);
      for (const input of inputs) {
        const original = input.value;
        for (const key of ["6", "Backspace", "Delete"]) {
          input.setSelectionRange(3, 4);
          input.dispatchEvent(
            new KeyboardEvent("keydown", { key, bubbles: true }),
          );
          expect(input.value).toBe(original);
        }
        input.value = "20300615";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        expect(input.value).toBe(original);
      }
      expect(value.get()).toEqual({ start: "2025-06-15", end: "2025-06-18" });
      expect(seen).toEqual([]);
      value.set({ start: "2025-07-20", end: "2025-07-22" });
      expect(Array.from(inputs, (input) => input.value)).toEqual([
        "2025-07-20",
        "2025-07-22",
      ]);
    } finally {
      cleanup();
    }
  });

  it("associates the range group with external labels and instructions", () => {
    const target = document.createElement("div");
    const cleanup = render(
      target,
      <DateRangeInput
        ariaLabel="Trip"
        ariaLabelledby="trip-label"
        ariaDescribedby="trip-help"
      />,
    );
    try {
      const group = target.querySelector("[role='group']");
      expect(group?.getAttribute("aria-label")).toBe("Trip");
      expect(group?.getAttribute("aria-labelledby")).toBe("trip-label");
      expect(group?.getAttribute("aria-describedby")).toBe("trip-help");
      expect(
        target.querySelector("input[aria-label='Trip start']"),
      ).not.toBeNull();
      expect(target.querySelector("input[aria-label='Trip end']")).not.toBeNull();
    } finally {
      cleanup();
    }
  });

  it.each([false, true])("reports one blur only on leaving the composite (popup relocated: %s)", async (relocated) => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const blurred: FocusEvent[] = [];
    const cleanup = render(
      target,
      <ThemeRoot>
        <DateRangeInput
          defaultValue={{ start: "2025-05-20", end: "" }}
          onBlur={(event) => blurred.push(event)}
        />
        <button data-after="true">After</button>
      </ThemeRoot>,
    );
    let disposed = false;
    try {
      if (relocated) await Promise.resolve();
      const start = target.querySelector<HTMLInputElement>(
        "input[aria-label='Start date']",
      );
      const end = target.querySelector<HTMLInputElement>(
        "input[aria-label='End date']",
      );
      const toggle = target.querySelector<HTMLButtonElement>(
        "button[aria-label='Toggle date range calendar']",
      );
      const after = target.querySelector<HTMLButtonElement>("[data-after]");
      const day = target.querySelector<HTMLButtonElement>("button[role='gridcell']");
      if (!start || !end || !toggle || !after || !day) {
        throw new Error("Missing range controls");
      }
      start.focus();
      end.focus();
      toggle.focus();
      expect(blurred).toEqual([]);
      after.focus();
      expect(blurred).toHaveLength(1);

      start.focus();
      // Native focus events also exercise deduplication before queued popup relocation.
      day.focus();
      toggle.focus();
      expect(blurred).toHaveLength(1);
      day.focus();
      after.focus();
      expect(blurred).toHaveLength(2);

      cleanup();
      disposed = true;
      day.dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: after }),
      );
      expect(blurred).toHaveLength(2);
    } finally {
      if (!disposed) cleanup();
      target.remove();
    }
  });

  it("returns completed range selection focus to the toggle and preserves outside dismissal focus", async () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const blurred: FocusEvent[] = [];
    const cleanup = render(
      target,
      <ThemeRoot>
        <DateRangeInput
          defaultValue={{ start: "2025-05-20", end: "" }}
          onBlur={(event) => blurred.push(event)}
        />
        <button data-after="true">After</button>
      </ThemeRoot>,
    );
    try {
      await Promise.resolve();
      const toggle = target.querySelector<HTMLButtonElement>(
        "button[aria-label='Toggle date range calendar']",
      );
      const day = findCurrentMonthDayButton(target, 22);
      const after = target.querySelector<HTMLButtonElement>("[data-after]");
      const dialog = target.querySelector<HTMLElement>("[role='dialog']");
      if (!toggle || !day || !after || !dialog) {
        throw new Error("Missing range controls");
      }
      toggle.focus();
      toggle.click();
      day.focus();
      day.click();
      expect(document.activeElement).toBe(toggle);
      expect(dialog.style.display).toBe("none");
      expect(blurred).toEqual([]);
      after.focus();
      expect(blurred).toHaveLength(1);

      toggle.focus();
      toggle.click();
      after.focus();
      after.click();
      expect(document.activeElement).toBe(after);
      expect(blurred).toHaveLength(2);
    } finally {
      cleanup();
      target.remove();
    }
  });

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
