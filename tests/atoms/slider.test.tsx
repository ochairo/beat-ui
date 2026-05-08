import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { Slider, ThemeRoot } from "../../src";

describe("Slider", () => {
  it("binds a controlled Pulse value to the range input", () => {
    const target = document.createElement("div");
    const value = pulse(500);
    const seen: number[] = [];

    const cleanup = render(
      target,
      <ThemeRoot>
        <Slider
          min={0}
          max={2000}
          step={50}
          value={value}
          onValueChange={(nextValue) => seen.push(nextValue)}
        />
      </ThemeRoot>,
    );

    const input = target.querySelector("input");

    expect(input instanceof HTMLInputElement).toBe(true);

    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Expected an input element.");
    }

    expect(input.type).toBe("range");
    expect(Number(input.value)).toBe(500);

    value.set(1000);

    expect(Number(input.value)).toBe(1000);

    input.valueAsNumber = 250;
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(value.get()).toBe(250);
    expect(seen).toContain(250);

    cleanup();
  });

  it("supports uncontrolled default values", () => {
    const target = document.createElement("div");
    const seen: number[] = [];

    const cleanup = render(
      target,
      <ThemeRoot>
        <Slider
          min={0}
          max={100}
          defaultValue={40}
          onValueChange={(nextValue) => seen.push(nextValue)}
        />
      </ThemeRoot>,
    );

    const input = target.querySelector("input");

    expect(input instanceof HTMLInputElement).toBe(true);

    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Expected an input element.");
    }

    expect(Number(input.value)).toBe(40);

    input.valueAsNumber = 80;
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(seen).toContain(80);

    cleanup();
  });

  it("renders with correct min, max and step attributes", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <Slider min={10} max={500} step={10} defaultValue={100} />
      </ThemeRoot>,
    );

    const input = target.querySelector("input") as HTMLInputElement;

    expect(input.min).toBe("10");
    expect(input.max).toBe("500");
    expect(input.step).toBe("10");

    cleanup();
  });
});
