import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { NumberInput, ThemeRoot } from "../../src";

describe("NumberInput", () => {
  it("renders a number input with stepper buttons", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <NumberInput id="test-num" name="test-num" />
      </ThemeRoot>,
    );

    const input = target.querySelector("input");
    expect(input).not.toBeNull();
    expect(input?.getAttribute("id")).toBe("test-num");

    const buttons = target.querySelectorAll("button");
    expect(buttons.length).toBe(2);
    expect(buttons[0]?.getAttribute("aria-label")).toBe("Increment");
    expect(buttons[1]?.getAttribute("aria-label")).toBe("Decrement");

    cleanup();
  });

  it("increments and decrements the value", () => {
    const target = document.createElement("div");
    const value = pulse("5");

    const cleanup = render(
      target,
      <ThemeRoot>
        <NumberInput value={value} onValueChange={(v) => value.set(v)} />
      </ThemeRoot>,
    );

    const increment = target.querySelector(
      "button[aria-label='Increment']",
    ) as HTMLButtonElement;
    const decrement = target.querySelector(
      "button[aria-label='Decrement']",
    ) as HTMLButtonElement;

    increment.click();
    expect(value.get()).toBe("6");

    decrement.click();
    expect(value.get()).toBe("5");

    cleanup();
  });

  it("respects min and max bounds", () => {
    const target = document.createElement("div");
    const value = pulse("10");

    const cleanup = render(
      target,
      <ThemeRoot>
        <NumberInput
          value={value}
          onValueChange={(v) => value.set(v)}
          min={0}
          max={10}
        />
      </ThemeRoot>,
    );

    const increment = target.querySelector(
      "button[aria-label='Increment']",
    ) as HTMLButtonElement;
    const decrement = target.querySelector(
      "button[aria-label='Decrement']",
    ) as HTMLButtonElement;

    increment.click();
    expect(value.get()).toBe("10");

    value.set("0");
    decrement.click();
    expect(value.get()).toBe("0");

    cleanup();
  });

  it("uses custom step size", () => {
    const target = document.createElement("div");
    const value = pulse("0");

    const cleanup = render(
      target,
      <ThemeRoot>
        <NumberInput
          value={value}
          onValueChange={(v) => value.set(v)}
          step={5}
        />
      </ThemeRoot>,
    );

    const increment = target.querySelector(
      "button[aria-label='Increment']",
    ) as HTMLButtonElement;

    increment.click();
    expect(value.get()).toBe("5");

    increment.click();
    expect(value.get()).toBe("10");

    cleanup();
  });

  it("renders as disabled", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <NumberInput disabled={true} />
      </ThemeRoot>,
    );

    const input = target.querySelector("input");
    expect(input?.getAttribute("disabled")).not.toBeNull();

    const buttons = target.querySelectorAll("button");
    for (const btn of buttons) {
      expect(btn.getAttribute("disabled")).not.toBeNull();
    }

    cleanup();
  });
});
