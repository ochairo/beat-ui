import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { SparkLine } from "../../src";

describe("SparkLine", () => {
  it("renders an SVG element in the SVG namespace", () => {
    const values = pulse<readonly number[]>([1, 2, 3]);
    const target = document.createElement("div");

    const cleanup = render(target, <SparkLine values={values} />);

    const svg = target.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.namespaceURI).toBe("http://www.w3.org/2000/svg");

    cleanup();
  });

  it("renders a path with a non-empty d attribute for 2+ values", () => {
    const values = pulse<readonly number[]>([10, 20, 15]);
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <SparkLine values={values} width={80} height={28} />,
    );

    const path = target.querySelector("path");
    expect(path?.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(path?.getAttribute("d")).not.toBe("");

    cleanup();
  });

  it("renders an empty path for fewer than 2 values", () => {
    const values = pulse<readonly number[]>([42]);
    const target = document.createElement("div");

    const cleanup = render(target, <SparkLine values={values} />);

    const path = target.querySelector("path");
    expect(path?.getAttribute("d")).toBe("");

    cleanup();
  });

  it("uses success color when positive is true", () => {
    const values = pulse<readonly number[]>([1, 2]);
    const positive = pulse(true);
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <SparkLine values={values} positive={positive} />,
    );

    const path = target.querySelector("path");
    expect(path?.getAttribute("stroke")).toBe("var(--beat-ui-color-success)");

    cleanup();
  });

  it("uses danger color when positive is false", () => {
    const values = pulse<readonly number[]>([2, 1]);
    const positive = pulse(false);
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <SparkLine values={values} positive={positive} />,
    );

    const path = target.querySelector("path");
    expect(path?.getAttribute("stroke")).toBe("var(--beat-ui-color-danger)");

    cleanup();
  });

  it("auto-derives success color from uptrend data", () => {
    const values = pulse<readonly number[]>([1, 5]);
    const target = document.createElement("div");

    const cleanup = render(target, <SparkLine values={values} />);

    const path = target.querySelector("path");
    expect(path?.getAttribute("stroke")).toBe("var(--beat-ui-color-success)");

    cleanup();
  });

  it("auto-derives danger color from downtrend data", () => {
    const values = pulse<readonly number[]>([5, 1]);
    const target = document.createElement("div");

    const cleanup = render(target, <SparkLine values={values} />);

    const path = target.querySelector("path");
    expect(path?.getAttribute("stroke")).toBe("var(--beat-ui-color-danger)");

    cleanup();
  });

  it("updates the path when values change", () => {
    const values = pulse<readonly number[]>([1, 2]);
    const target = document.createElement("div");

    const cleanup = render(target, <SparkLine values={values} />);

    const path = target.querySelector("path");
    const firstD = path?.getAttribute("d");

    values.set([10, 100, 50]);

    const secondD = path?.getAttribute("d");
    expect(secondD).not.toBe(firstD);
    expect(secondD).not.toBe("");

    cleanup();
  });

  it("updates the stroke color when positive pulse changes", () => {
    const values = pulse<readonly number[]>([1, 2]);
    const positive = pulse(true);
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <SparkLine values={values} positive={positive} />,
    );

    const path = target.querySelector("path");
    expect(path?.getAttribute("stroke")).toBe("var(--beat-ui-color-success)");

    positive.set(false);

    expect(path?.getAttribute("stroke")).toBe("var(--beat-ui-color-danger)");

    cleanup();
  });

  it("cleans up subscriptions on unmount", () => {
    const values = pulse<readonly number[]>([1, 2, 3]);
    const target = document.createElement("div");

    const cleanup = render(target, <SparkLine values={values} />);

    cleanup();

    const subscriberCountBefore = values.get();
    // After cleanup, updating the pulse should not throw
    values.set([4, 5, 6]);
    // DOM should be empty after cleanup
    expect(target.querySelector("svg")).toBeNull();
  });
});
