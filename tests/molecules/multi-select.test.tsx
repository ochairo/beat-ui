import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { MultiSelect, ThemeRoot } from "../../src";

function renderMultiSelect(target: HTMLElement, view: JSX.Element): () => void {
  return render(target, <ThemeRoot>{view}</ThemeRoot>);
}

const OPTIONS = [
  { label: "Alpha", value: "a" },
  { label: "Beta", value: "b" },
  { label: "Charlie", value: "c" },
] as const;

describe("MultiSelect", () => {
  it("toggles a value when an option is clicked", () => {
    const target = document.createElement("div");
    const value = pulse<readonly string[]>([]);

    const cleanup = renderMultiSelect(
      target,
      <MultiSelect value={value} options={OPTIONS} />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    const options = target.querySelectorAll('[role="option"]');
    (options[1] as HTMLButtonElement).click();

    expect(value.get()).toEqual(["b"]);

    (options[0] as HTMLButtonElement).click();
    expect(value.get()).toEqual(["b", "a"]);

    cleanup();
  });

  it("removes a value when clicking a selected option", () => {
    const target = document.createElement("div");
    const value = pulse<readonly string[]>(["a", "b"]);

    const cleanup = renderMultiSelect(
      target,
      <MultiSelect value={value} options={OPTIONS} />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    const options = target.querySelectorAll('[role="option"]');
    (options[0] as HTMLButtonElement).click();

    expect(value.get()).toEqual(["b"]);

    cleanup();
  });

  it("shows comma-separated labels in trigger", () => {
    const target = document.createElement("div");
    const value = pulse<readonly string[]>(["a", "c"]);

    const cleanup = renderMultiSelect(
      target,
      <MultiSelect value={value} options={OPTIONS} />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    expect(trigger.textContent).toContain("Alpha");
    expect(trigger.textContent).toContain("Charlie");

    cleanup();
  });

  it("shows placeholder when nothing is selected", () => {
    const target = document.createElement("div");
    const value = pulse<readonly string[]>([]);

    const cleanup = renderMultiSelect(
      target,
      <MultiSelect value={value} options={OPTIONS} placeholder="Pick items" />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    expect(trigger.textContent).toContain("Pick items");

    cleanup();
  });

  it("fires onValueChange callback", () => {
    const target = document.createElement("div");
    const value = pulse<readonly string[]>([]);
    const changes: readonly string[][] = [];

    const cleanup = renderMultiSelect(
      target,
      <MultiSelect
        value={value}
        options={OPTIONS}
        onValueChange={(v) => changes.push([...v])}
      />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    const options = target.querySelectorAll('[role="option"]');
    (options[2] as HTMLButtonElement).click();

    expect(changes).toEqual([["c"]]);

    cleanup();
  });

  it("does not toggle disabled options", () => {
    const target = document.createElement("div");
    const value = pulse<readonly string[]>([]);
    const options = [
      { label: "A", value: "a" },
      { label: "B", value: "b", disabled: true },
    ];

    const cleanup = renderMultiSelect(
      target,
      <MultiSelect value={value} options={options} />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    const items = target.querySelectorAll('[role="option"]');
    (items[1] as HTMLButtonElement).click();

    expect(value.get()).toEqual([]);

    cleanup();
  });

  it("renders checkboxes for each option", () => {
    const target = document.createElement("div");
    const value = pulse<readonly string[]>(["b"]);

    const cleanup = renderMultiSelect(
      target,
      <MultiSelect value={value} options={OPTIONS} />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    const checkboxes = target.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(3);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[2] as HTMLInputElement).checked).toBe(false);

    cleanup();
  });

  it("filters options when canSearch is true and user types", () => {
    const target = document.createElement("div");
    const value = pulse<readonly string[]>([]);

    const cleanup = renderMultiSelect(
      target,
      <MultiSelect canSearch value={value} options={OPTIONS} />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    const searchInput = target.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement;
    expect(searchInput).not.toBeNull();

    searchInput.value = "al";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));

    const options = target.querySelectorAll('[role="option"]');
    expect(options.length).toBe(1);
    expect(options[0]?.textContent).toContain("Alpha");

    cleanup();
  });

  it("does not show search input when canSearch is not set", () => {
    const target = document.createElement("div");
    const value = pulse<readonly string[]>([]);

    const cleanup = renderMultiSelect(
      target,
      <MultiSelect value={value} options={OPTIONS} />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    const searchInput = target.querySelector('input[type="text"]');
    expect(searchInput).toBeNull();

    cleanup();
  });

  it("clears search query when menu is done", () => {
    const target = document.createElement("div");
    const value = pulse<readonly string[]>([]);

    const cleanup = renderMultiSelect(
      target,
      <MultiSelect canSearch value={value} options={OPTIONS} />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    const searchInput = target.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement;
    searchInput.value = "al";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));

    trigger.click();
    trigger.click();

    const options = target.querySelectorAll('[role="option"]');
    expect(options.length).toBe(3);

    cleanup();
  });

  it("renders tree options with expand/collapse", () => {
    const target = document.createElement("div");
    const value = pulse<readonly string[]>([]);

    const cleanup = renderMultiSelect(
      target,
      <MultiSelect
        value={value}
        options={[
          {
            value: "fruits",
            label: "Fruits",
            children: [
              { value: "apple", label: "Apple" },
              { value: "banana", label: "Banana" },
            ],
          },
          { value: "meat", label: "Meat" },
        ]}
      />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    // Only top-level visible initially
    let options = target.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);

    // Expand "Fruits"
    const expandToggle = options[0]?.querySelector("span");
    expect(expandToggle?.textContent).toBe("▶");
    expandToggle?.click();

    options = target.querySelectorAll('[role="option"]');
    expect(options.length).toBe(4);
    expect(options[1]?.textContent).toContain("Apple");

    cleanup();
  });

  it("toggles parent and child tree options independently", () => {
    const target = document.createElement("div");
    const value = pulse<readonly string[]>([]);

    const cleanup = renderMultiSelect(
      target,
      <MultiSelect
        value={value}
        options={[
          {
            value: "fruits",
            label: "Fruits",
            isSelectable: true,
            children: [{ value: "apple", label: "Apple" }],
          },
        ]}
      />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    // Select parent
    let options = target.querySelectorAll('[role="option"]');
    (options[0] as HTMLButtonElement).click();
    expect(value.get()).toEqual(["fruits"]);

    // Expand
    const expandToggle = target.querySelector('[role="option"] span');
    (expandToggle as HTMLElement).click();

    // Select child
    options = target.querySelectorAll('[role="option"]');
    (options[1] as HTMLButtonElement).click();
    expect(value.get()).toEqual(["fruits", "apple"]);

    cleanup();
  });

  it("renders the dropdown as a floating layer outside the control subtree", async () => {
    const target = document.createElement("div");

    const cleanup = renderMultiSelect(
      target,
      <MultiSelect value={pulse<readonly string[]>([])} options={OPTIONS} />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    const controlRoot = trigger.parentElement as HTMLElement;

    trigger.click();
    await Promise.resolve();

    const dropdown = target.querySelector(
      '[data-part="dropdown"]',
    ) as HTMLElement | null;

    expect(dropdown).not.toBeNull();
    expect(controlRoot.contains(dropdown ?? null)).toBe(false);
    expect(dropdown?.style.position).toBe("fixed");

    cleanup();
  });
});
