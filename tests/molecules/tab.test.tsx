import { render } from "@ochairo/beat";
import { describe, expect, it } from "vitest";

import { Tab } from "../../src";

describe("Tab", () => {
  it("switches the visible panel when a tab is selected", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <Tab
        ariaLabel="Sections"
        items={[
          { key: "one", label: "One", content: "First panel" },
          { key: "two", label: "Two", content: "Second panel" },
        ]}
      />,
    );

    const buttons = Array.from(target.querySelectorAll('[role="tab"]'));

    expect(target.textContent).toContain("First panel");
    expect(target.textContent).not.toContain("Second panel");

    buttons[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(buttons[0]?.getAttribute("aria-selected")).toBe("false");
    expect(buttons[1]?.getAttribute("aria-selected")).toBe("true");
    expect(target.textContent).not.toContain("First panel");
    expect(target.textContent).toContain("Second panel");

    cleanup();
  });

  it("supports vertical tabs", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <Tab
        ariaLabel="Catalog sections"
        orientation="vertical"
        items={[
          { key: "atoms", label: "Atoms", content: "Atoms panel" },
          { key: "molecules", label: "Molecules", content: "Molecules panel" },
        ]}
      />,
    );

    const tabList = target.querySelector('[role="tablist"]');
    const buttons = Array.from(target.querySelectorAll('[role="tab"]'));

    expect(tabList?.getAttribute("aria-orientation")).toBe("vertical");

    buttons[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(buttons[1]?.getAttribute("aria-selected")).toBe("true");
    expect(target.textContent).toContain("Molecules panel");

    cleanup();
  });

  it("does not select a disabled tab when clicked", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <Tab
        ariaLabel="Sections"
        items={[
          { key: "one", label: "One", content: "First panel" },
          { key: "two", label: "Two", content: "Second panel", disabled: true },
        ]}
      />,
    );

    const buttons = Array.from(target.querySelectorAll('[role="tab"]'));

    expect(buttons[0]?.getAttribute("aria-selected")).toBe("true");

    buttons[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(buttons[0]?.getAttribute("aria-selected")).toBe("true");
    expect(buttons[1]?.getAttribute("aria-selected")).toBe("false");
    expect(target.textContent).toContain("First panel");
    expect(target.textContent).not.toContain("Second panel");

    cleanup();
  });
});
