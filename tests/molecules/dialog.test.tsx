import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { Dialog } from "../../src";

describe("Dialog", () => {
  it("closes through the dismiss button", () => {
    const target = document.createElement("div");
    const open = pulse(true);

    const cleanup = render(
      target,
      <Dialog open={open} title="Settings">
        Content
      </Dialog>,
    );

    const button = target.querySelector("button");

    expect(target.querySelector('[role="dialog"]')).not.toBeNull();

    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(open.get()).toBe(false);

    cleanup();
  });

  it("does not close when dismissible is false", () => {
    const target = document.createElement("div");
    const open = pulse(true);

    const cleanup = render(
      target,
      <Dialog open={open} title="Confirm" dismissible={false}>
        Non-dismissible content
      </Dialog>,
    );

    expect(target.querySelector('[role="dialog"]')).not.toBeNull();
    expect(target.querySelector("button")).toBeNull();

    open.set(false);

    expect(target.querySelector('[role="dialog"]')).toBeNull();

    cleanup();
  });

  it("renders a footer slot", () => {
    const target = document.createElement("div");
    const open = pulse(true);

    const cleanup = render(
      target,
      <Dialog
        open={open}
        title="With Footer"
        footer={<button type="button">Confirm</button>}
      >
        Body content
      </Dialog>,
    );

    expect(target.textContent).toContain("Body content");
    expect(target.textContent).toContain("Confirm");

    cleanup();
  });

  it("renders the title in a dedicated title part", () => {
    const target = document.createElement("div");
    const open = pulse(true);

    const cleanup = render(
      target,
      <Dialog open={open} title="Task details">
        Body content
      </Dialog>,
    );

    const title = target.querySelector('[data-part="title"]');

    expect(title?.textContent).toBe("Task details");

    cleanup();
  });
});
