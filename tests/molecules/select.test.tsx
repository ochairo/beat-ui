import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { Select, ThemeRoot } from "../../src";

function renderSelect(target: HTMLElement, view: JSX.Element): () => void {
  return render(target, <ThemeRoot>{view}</ThemeRoot>);
}

describe("Select", () => {
  it("updates controlled value when an option is clicked", () => {
    const target = document.createElement("div");
    const value = pulse("a");

    const cleanup = renderSelect(
      target,
      <Select
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

    const cleanup = renderSelect(
      target,
      <Select
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

    const cleanup = renderSelect(
      target,
      <Select
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

  it("filters options when canSearch is true and user types", () => {
    const target = document.createElement("div");
    const value = pulse("");

    const cleanup = renderSelect(
      target,
      <Select
        canSearch
        value={value}
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
          { value: "g", label: "Gamma" },
        ]}
      />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    const searchInput = target.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement;
    expect(searchInput).not.toBeNull();

    // Type "al" to filter
    searchInput.value = "al";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));

    const options = target.querySelectorAll('[role="option"]');
    expect(options.length).toBe(1);
    expect(options[0]?.textContent).toContain("Alpha");

    cleanup();
  });

  it("does not show search input when canSearch is not set", () => {
    const target = document.createElement("div");
    const value = pulse("");

    const cleanup = renderSelect(
      target,
      <Select
        value={value}
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
      />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    const searchInput = target.querySelector('input[type="text"]');
    expect(searchInput).toBeNull();

    cleanup();
  });

  it("clears search query when menu is done", () => {
    const target = document.createElement("div");
    const value = pulse("");

    const cleanup = renderSelect(
      target,
      <Select
        canSearch
        value={value}
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
      />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    const searchInput = target.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement;
    searchInput.value = "al";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));

    // Close by clicking trigger again
    trigger.click();

    // Re-open: all options should be visible
    trigger.click();

    const options = target.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);

    cleanup();
  });

  it("renders tree options with expand/collapse", () => {
    const target = document.createElement("div");
    const value = pulse("");

    const cleanup = renderSelect(
      target,
      <Select
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

    // Only top-level options visible initially
    let options = target.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);

    // Click the expand toggle on "Fruits"
    const expandToggle = options[0]?.querySelector("span");
    expect(expandToggle?.textContent).toBe("▶");
    expandToggle?.click();

    // Now children should be visible
    options = target.querySelectorAll('[role="option"]');
    expect(options.length).toBe(4);
    expect(options[1]?.textContent).toContain("Apple");
    expect(options[2]?.textContent).toContain("Banana");

    cleanup();
  });

  it("selects a parent tree option", () => {
    const target = document.createElement("div");
    const value = pulse("");

    const cleanup = renderSelect(
      target,
      <Select
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

    const options = target.querySelectorAll('[role="option"]');
    (options[0] as HTMLButtonElement).click();

    expect(value.get()).toBe("fruits");

    cleanup();
  });

  it("selects a child tree option after expanding", () => {
    const target = document.createElement("div");
    const value = pulse("");

    const cleanup = renderSelect(
      target,
      <Select
        value={value}
        options={[
          {
            value: "fruits",
            label: "Fruits",
            children: [{ value: "apple", label: "Apple" }],
          },
        ]}
      />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    // Expand
    const expandToggle = target.querySelector('[role="option"] span');
    (expandToggle as HTMLElement).click();

    // Select child
    const options = target.querySelectorAll('[role="option"]');
    (options[1] as HTMLButtonElement).click();

    expect(value.get()).toBe("apple");

    cleanup();
  });

  it("supports deeply nested tree options (3+ levels)", () => {
    const target = document.createElement("div");
    const value = pulse("");

    const cleanup = renderSelect(
      target,
      <Select
        value={value}
        options={[
          {
            value: "food",
            label: "Food",
            children: [
              {
                value: "fruits",
                label: "Fruits",
                children: [
                  {
                    value: "citrus",
                    label: "Citrus",
                    children: [
                      { value: "orange", label: "Orange" },
                      { value: "lemon", label: "Lemon" },
                    ],
                  },
                ],
              },
            ],
          },
        ]}
      />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    // Level 0: Food
    let options = target.querySelectorAll('[role="option"]');
    expect(options.length).toBe(1);

    // Expand Food
    (options[0]!.querySelector("span") as HTMLElement).click();
    options = target.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2); // Food, Fruits

    // Expand Fruits
    (options[1]!.querySelector("span") as HTMLElement).click();
    options = target.querySelectorAll('[role="option"]');
    expect(options.length).toBe(3); // Food, Fruits, Citrus

    // Expand Citrus
    (options[2]!.querySelector("span") as HTMLElement).click();
    options = target.querySelectorAll('[role="option"]');
    expect(options.length).toBe(5); // Food, Fruits, Citrus, Orange, Lemon

    // Select deepest leaf
    (options[3] as HTMLButtonElement).click();
    expect(value.get()).toBe("orange");

    cleanup();
  });

  it("hierarchical search shows parents expanded for deep matches", () => {
    const target = document.createElement("div");
    const value = pulse("");

    const cleanup = renderSelect(
      target,
      <Select
        canSearch
        value={value}
        options={[
          {
            value: "food",
            label: "Food",
            children: [
              {
                value: "fruits",
                label: "Fruits",
                children: [
                  { value: "orange", label: "Orange" },
                  { value: "banana", label: "Banana" },
                ],
              },
              { value: "meat", label: "Meat" },
            ],
          },
          { value: "drink", label: "Drink" },
        ]}
      />,
    );

    const trigger = target.querySelector("button") as HTMLButtonElement;
    trigger.click();

    const searchInput = target.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement;
    searchInput.value = "orange";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));

    // Should show: Food > Fruits > Orange (3 items, hierarchy preserved)
    const options = target.querySelectorAll('[role="option"]');
    expect(options.length).toBe(3);
    expect(options[0]?.textContent).toContain("Food");
    expect(options[1]?.textContent).toContain("Fruits");
    expect(options[2]?.textContent).toContain("Orange");

    cleanup();
  });

  it("renders the dropdown as a floating layer outside the control subtree", async () => {
    const target = document.createElement("div");

    const cleanup = renderSelect(
      target,
      <Select
        value={pulse("a")}
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
      />,
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
