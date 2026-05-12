import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { Sparkline } from "../../src";

describe("Sparkline", () => {
  it("renders an SVG element in the SVG namespace", () => {
    const values = pulse<readonly number[]>([1, 2, 3]);
    const target = document.createElement("div");

    const cleanup = render(target, <Sparkline values={values} />);

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
      <Sparkline values={values} width={80} height={28} />,
    );

    const path = target.querySelector("path");
    expect(path?.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(path?.getAttribute("d")).not.toBe("");

    cleanup();
  });

  it("renders an empty path for fewer than 2 values", () => {
    const values = pulse<readonly number[]>([42]);
    const target = document.createElement("div");

    const cleanup = render(target, <Sparkline values={values} />);

    const path = target.querySelector("path");
    expect(path?.getAttribute("d")).toBe("");

    cleanup();
  });

  it("uses currentColor stroke by default", () => {
    const values = pulse<readonly number[]>([1, 2]);
    const target = document.createElement("div");

    const cleanup = render(target, <Sparkline values={values} />);

    const path = target.querySelector("path");
    expect(path?.getAttribute("stroke")).toBe("currentColor");

    cleanup();
  });

  it("supports plain values and stroke without subscriptions", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <Sparkline values={[1, 4, 2]} stroke="orange" width={80} height={28} />,
    );

    const path = target.querySelector("path");
    expect(path?.getAttribute("stroke")).toBe("orange");
    expect(path?.getAttribute("d")).not.toBe("");

    cleanup();
  });

  it("uses custom stroke color when provided", () => {
    const values = pulse<readonly number[]>([1, 2]);
    const stroke = pulse("red");
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <Sparkline values={values} stroke={stroke} />,
    );

    const path = target.querySelector("path");
    expect(path?.getAttribute("stroke")).toBe("red");

    cleanup();
  });

  it("updates the stroke color when stroke pulse changes", () => {
    const values = pulse<readonly number[]>([1, 2]);
    const stroke = pulse("green");
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <Sparkline values={values} stroke={stroke} />,
    );

    const path = target.querySelector("path");
    expect(path?.getAttribute("stroke")).toBe("green");

    stroke.set("red");

    expect(path?.getAttribute("stroke")).toBe("red");

    cleanup();
  });

  it("updates the path when values change", () => {
    const values = pulse<readonly number[]>([1, 2]);
    const target = document.createElement("div");

    const cleanup = render(target, <Sparkline values={values} />);

    const path = target.querySelector("path");
    const firstD = path?.getAttribute("d");

    values.set([10, 100, 50]);

    const secondD = path?.getAttribute("d");
    expect(secondD).not.toBe(firstD);
    expect(secondD).not.toBe("");

    cleanup();
  });

  it("cleans up subscriptions on unmount", () => {
    const values = pulse<readonly number[]>([1, 2, 3]);
    const target = document.createElement("div");

    const cleanup = render(target, <Sparkline values={values} />);

    cleanup();

    const subscriberCountBefore = values.get();
    // After cleanup, updating the pulse should not throw
    values.set([4, 5, 6]);
    // DOM should be empty after cleanup
    expect(target.querySelector("svg")).toBeNull();
  });
});
