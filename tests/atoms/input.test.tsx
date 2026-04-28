import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { Input, ThemeRoot } from "../../src";

describe("Input", () => {
  it("binds a controlled Pulse value to the input element", () => {
    const target = document.createElement("div");
    const value = pulse("Ada");
    const seen: string[] = [];

    const cleanup = render(
      target,
      <ThemeRoot>
        <Input
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

    expect(input.value).toBe("Ada");

    value.set("Grace");

    expect(input.value).toBe("Grace");

    input.value = "Lin";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(value.get()).toBe("Lin");
    expect(seen).toEqual(["Lin"]);

    cleanup();
  });

  it("supports uncontrolled default values", () => {
    const target = document.createElement("div");
    const seen: string[] = [];

    const cleanup = render(
      target,
      <ThemeRoot>
        <Input
          defaultValue="Seed"
          onValueChange={(nextValue) => seen.push(nextValue)}
        />
      </ThemeRoot>,
    );

    const input = target.querySelector("input");

    expect(input instanceof HTMLInputElement).toBe(true);

    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Expected an input element.");
    }

    expect(input.value).toBe("Seed");

    input.value = "Sprout";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(input.value).toBe("Sprout");
    expect(seen).toEqual(["Sprout"]);

    cleanup();
  });
});
