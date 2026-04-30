import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { RadioGroup } from "../../src";

const OPTIONS = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
  { label: "Option C", value: "c" },
] as const;

describe("RadioGroup", () => {
  it("renders all options as radio buttons", () => {
    const target = document.createElement("div");
    const value = pulse("");

    const cleanup = render(
      target,
      <RadioGroup name="test" options={OPTIONS} value={value} />,
    );

    const inputs = target.querySelectorAll("input[type='radio']");
    expect(inputs.length).toBe(3);

    const labels = target.querySelectorAll("span");
    expect(labels[0]?.textContent).toBe("Option A");
    expect(labels[1]?.textContent).toBe("Option B");
    expect(labels[2]?.textContent).toBe("Option C");

    cleanup();
  });

  it("checks the radio matching the initial value", () => {
    const target = document.createElement("div");
    const value = pulse("b");

    const cleanup = render(
      target,
      <RadioGroup name="test" options={OPTIONS} value={value} />,
    );

    const inputs = target.querySelectorAll("input[type='radio']");
    expect((inputs[0] as HTMLInputElement).checked).toBe(false);
    expect((inputs[1] as HTMLInputElement).checked).toBe(true);
    expect((inputs[2] as HTMLInputElement).checked).toBe(false);

    cleanup();
  });

  it("updates value when a radio is selected", () => {
    const target = document.createElement("div");
    const value = pulse("");

    const cleanup = render(
      target,
      <RadioGroup name="test" options={OPTIONS} value={value} />,
    );

    const inputs = target.querySelectorAll("input[type='radio']");
    const second = inputs[1] as HTMLInputElement;

    second.checked = true;
    second.dispatchEvent(new Event("change", { bubbles: true }));

    expect(value.get()).toBe("b");

    cleanup();
  });

  it("fires onValueChange callback", () => {
    const target = document.createElement("div");
    const value = pulse("");
    const changes: string[] = [];

    const cleanup = render(
      target,
      <RadioGroup
        name="test"
        options={OPTIONS}
        value={value}
        onValueChange={(v) => changes.push(v)}
      />,
    );

    const inputs = target.querySelectorAll("input[type='radio']");
    const third = inputs[2] as HTMLInputElement;

    third.checked = true;
    third.dispatchEvent(new Event("change", { bubbles: true }));

    expect(changes).toEqual(["c"]);

    cleanup();
  });

  it("disables all radios when disabled is set", () => {
    const target = document.createElement("div");
    const value = pulse("");

    const cleanup = render(
      target,
      <RadioGroup name="test" options={OPTIONS} value={value} disabled />,
    );

    const inputs = target.querySelectorAll("input[type='radio']");
    for (const input of inputs) {
      expect((input as HTMLInputElement).disabled).toBe(true);
    }

    cleanup();
  });

  it("disables individual options", () => {
    const target = document.createElement("div");
    const value = pulse("");
    const options = [
      { label: "A", value: "a" },
      { label: "B", value: "b", disabled: true },
      { label: "C", value: "c" },
    ];

    const cleanup = render(
      target,
      <RadioGroup name="test" options={options} value={value} />,
    );

    const inputs = target.querySelectorAll("input[type='radio']");
    expect((inputs[0] as HTMLInputElement).disabled).toBe(false);
    expect((inputs[1] as HTMLInputElement).disabled).toBe(true);
    expect((inputs[2] as HTMLInputElement).disabled).toBe(false);

    cleanup();
  });

  it("renders with role radiogroup", () => {
    const target = document.createElement("div");
    const value = pulse("");

    const cleanup = render(
      target,
      <RadioGroup name="test" options={OPTIONS} value={value} />,
    );

    const group = target.querySelector("[role='radiogroup']");
    expect(group).not.toBeNull();

    cleanup();
  });
});
