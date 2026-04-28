import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { Dropdown } from "../../src";

describe("Dropdown", () => {
  it("updates controlled value when an option is clicked", () => {
    const target = document.createElement("div");
    const value = pulse("a");

    const cleanup = render(
      target,
      <Dropdown
        value={value}
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
      />,
    );

    // Open the dropdown
    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    // Click the "Beta" option
    const options = target.querySelectorAll('[role="option"]');
    (options[1] as HTMLButtonElement).click();

    expect(value.get()).toBe("b");

    cleanup();
  });

  it("shows the selected option label in the trigger", () => {
    const target = document.createElement("div");
    const value = pulse("b");

    const cleanup = render(
      target,
      <Dropdown
        value={value}
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
      />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    expect(trigger.textContent).toContain("Beta");

    cleanup();
  });

  it("does not select disabled options", () => {
    const target = document.createElement("div");
    const value = pulse("a");

    const cleanup = render(
      target,
      <Dropdown
        value={value}
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta", disabled: true },
        ]}
      />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    const options = target.querySelectorAll('[role="option"]');
    (options[1] as HTMLButtonElement).click();

    expect(value.get()).toBe("a");

    cleanup();
  });
});
