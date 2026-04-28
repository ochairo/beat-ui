import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { CheckBox } from "../../src";

describe("CheckBox", () => {
  it("updates checked state when toggled", () => {
    const target = document.createElement("div");
    const checked = pulse(false);

    const cleanup = render(
      target,
      <CheckBox checked={checked}>Accept</CheckBox>,
    );

    const input = target.querySelector("input");

    input!.checked = true;
    input?.dispatchEvent(new Event("change", { bubbles: true }));

    expect(checked.get()).toBe(true);

    cleanup();
  });
});
