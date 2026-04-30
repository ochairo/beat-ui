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
});
