import { component, onCleanup, render } from "@ochairo/beat";
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
    const panels = Array.from(target.querySelectorAll('[role="tabpanel"]'));

    expect(panels[0]?.hidden).toBe(false);
    expect(panels[1]?.hidden).toBe(true);

    buttons[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(buttons[0]?.getAttribute("aria-selected")).toBe("false");
    expect(buttons[1]?.getAttribute("aria-selected")).toBe("true");
    expect(panels[0]?.hidden).toBe(true);
    expect(panels[1]?.hidden).toBe(false);

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
    const panels = Array.from(target.querySelectorAll('[role="tabpanel"]'));

    expect(buttons[0]?.getAttribute("aria-selected")).toBe("true");

    buttons[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(buttons[0]?.getAttribute("aria-selected")).toBe("true");
    expect(buttons[1]?.getAttribute("aria-selected")).toBe("false");
    expect(panels[0]?.hidden).toBe(false);
    expect(panels[1]?.hidden).toBe(true);

    cleanup();
  });

  it("preserves caller classes on the root element", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <Tab
        ariaLabel="Sections"
        class="custom-tab-root"
        items={[{ key: "one", label: "One", content: "First panel" }]}
      />,
    );

    expect(
      target.firstElementChild?.classList.contains("custom-tab-root"),
    ).toBe(true);

    cleanup();
  });

  it("unmounts inactive panel content when configured", () => {
    const target = document.createElement("div");
    const events: string[] = [];

    const Panel = component<{ readonly name: string }>((props) => {
      events.push(`mount:${props.name}`);
      onCleanup(() => {
        events.push(`unmount:${props.name}`);
      });

      return <span>{props.name}</span>;
    });

    const cleanup = render(
      target,
      <Tab
        ariaLabel="Sections"
        unmountInactivePanels
        items={[
          {
            key: "one",
            label: "One",
            renderContent: () => <Panel name="one" />,
          },
          {
            key: "two",
            label: "Two",
            renderContent: () => <Panel name="two" />,
          },
        ]}
      />,
    );

    const buttons = Array.from(target.querySelectorAll('[role="tab"]'));

    expect(events).toEqual(["mount:one"]);

    buttons[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(events).toEqual(["mount:one", "unmount:one", "mount:two"]);

    cleanup();
  });

  it("resets panel wrapper scroll when the active tab changes", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <Tab
        ariaLabel="Scrollable sections"
        items={[
          {
            key: "one",
            label: "One",
            content: <div style="height:200px">One</div>,
          },
          {
            key: "two",
            label: "Two",
            content: <div style="height:200px">Two</div>,
          },
        ]}
        styles={{ panel: "max-height:40px;overflow:auto;" }}
      />,
    );

    const panelWrapper = target.querySelector(
      '[data-part="panel"]',
    ) as HTMLDivElement | null;
    const buttons = Array.from(target.querySelectorAll('[role="tab"]'));

    expect(panelWrapper).not.toBeNull();

    if (panelWrapper !== null) {
      panelWrapper.scrollTop = 24;
      panelWrapper.scrollLeft = 12;
    }

    buttons[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(panelWrapper?.scrollTop).toBe(0);
    expect(panelWrapper?.scrollLeft).toBe(0);

    cleanup();
  });
});
