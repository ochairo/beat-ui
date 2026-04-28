import { render } from "@ochairo/beat";
import { describe, expect, it } from "vitest";

import { SideMenu } from "../../src";

describe("SideMenu", () => {
  it("switches the selected item", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <SideMenu
        ariaLabel="Component navigation"
        items={[
          { key: "button", label: "Button" },
          { key: "table", label: "Table" },
        ]}
      />,
    );

    const buttons = Array.from(target.querySelectorAll("button"));

    expect(buttons[0]?.getAttribute("aria-current")).toBe("page");

    buttons[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(buttons[0]?.hasAttribute("aria-current")).toBe(false);
    expect(buttons[1]?.getAttribute("aria-current")).toBe("page");

    cleanup();
  });

  it("does not select a disabled item when clicked", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <SideMenu
        ariaLabel="Navigation"
        items={[
          { key: "alpha", label: "Alpha" },
          { key: "beta", label: "Beta", disabled: true },
        ]}
      />,
    );

    const buttons = Array.from(target.querySelectorAll("button"));

    expect(buttons[0]?.getAttribute("aria-current")).toBe("page");

    buttons[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(buttons[0]?.getAttribute("aria-current")).toBe("page");
    expect(buttons[1]?.hasAttribute("aria-current")).toBe(false);

    cleanup();
  });

  it("renders item descriptions", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <SideMenu
        ariaLabel="Navigation"
        items={[
          {
            key: "components",
            label: "Components",
            description: "Atoms and molecules",
          },
        ]}
      />,
    );

    expect(target.textContent).toContain("Components");
    expect(target.textContent).toContain("Atoms and molecules");

    cleanup();
  });
});
