import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { RadioButton } from "../../src";

describe("RadioButton", () => {
  it("updates checked state when selected", () => {
    const target = document.createElement("div");
    const checked = pulse(false);

    const cleanup = render(
      target,
      <RadioButton checked={checked}>Email</RadioButton>,
    );

    const input = target.querySelector("input");

    expect(input?.checked).toBe(false);

    input?.dispatchEvent(new Event("change", { bubbles: true }));
    input!.checked = true;
    input?.dispatchEvent(new Event("change", { bubbles: true }));

    expect(checked.get()).toBe(true);

    cleanup();
  });
});
