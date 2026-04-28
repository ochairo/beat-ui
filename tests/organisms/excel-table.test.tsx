import { render } from "@ochairo/beat";
import { Decimal } from "@ochairo/numbers";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { ExcelTable } from "../../src";

function createClipboardEvent(type: "copy" | "paste", text = "") {
  const store = new Map<string, string>();
  const event = new Event(type, {
    bubbles: true,
    cancelable: true,
  }) as ClipboardEvent;

  Object.defineProperty(event, "clipboardData", {
    value: {
      getData(format: string) {
        return format === "text/plain" ? text || store.get(format) || "" : "";
      },
      setData(format: string, value: string) {
        store.set(format, value);
      },
    },
  });

  return {
    event,
    store,
  };
}

describe("ExcelTable", () => {
  it("pastes tabular clipboard data into the selected cell range", () => {
    const target = document.createElement("div");
    const value = pulse([
      [{ value: "" }, { value: "" }],
      [{ value: "" }, { value: "" }],
    ]);

    const cleanup = render(
      target,
      <ExcelTable
        value={value}
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
      />,
    );

    const firstCell = target.querySelector('[data-row="0"][data-column="0"]');
    firstCell?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const root = target.querySelector("div[tabindex='0']");
    const { event } = createClipboardEvent("paste", "1\t2\n3\t4");
    root?.dispatchEvent(event);

    expect(value.get()[0]?.[0]?.value.toString()).toBe("1");
    expect(value.get()[0]?.[1]?.value.toString()).toBe("2");
    expect(value.get()[1]?.[0]?.value.toString()).toBe("3");
    expect(value.get()[1]?.[1]?.value.toString()).toBe("4");

    cleanup();
  });

  it("fills a larger selected range when a single copied cell is pasted", () => {
    const target = document.createElement("div");
    const value = pulse([
      [{ value: "" }, { value: "" }],
      [{ value: "" }, { value: "" }],
    ]);

    const cleanup = render(
      target,
      <ExcelTable
        value={value}
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
      />,
    );

    const firstCell = target.querySelector('[data-row="0"][data-column="0"]');
    const lastCell = target.querySelector('[data-row="1"][data-column="1"]');

    firstCell?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    lastCell?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, shiftKey: true }),
    );

    const root = target.querySelector("div[tabindex='0']");
    const { event } = createClipboardEvent("paste", "7");
    root?.dispatchEvent(event);

    expect(value.get()[0]?.[0]?.value.toString()).toBe("7");
    expect(value.get()[0]?.[1]?.value.toString()).toBe("7");
    expect(value.get()[1]?.[0]?.value.toString()).toBe("7");
    expect(value.get()[1]?.[1]?.value.toString()).toBe("7");

    cleanup();
  });

  it("copies the selected range as tab separated text", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ExcelTable
        defaultValue={[
          [{ value: "A1" }, { value: "B1" }],
          [{ value: "A2" }, { value: "B2" }],
        ]}
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
      />,
    );

    const firstCell = target.querySelector('[data-row="0"][data-column="0"]');
    const lastCell = target.querySelector('[data-row="1"][data-column="1"]');

    firstCell?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    lastCell?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, shiftKey: true }),
    );

    const root = target.querySelector("div[tabindex='0']");
    const { event, store } = createClipboardEvent("copy");
    root?.dispatchEvent(event);

    expect(store.get("text/plain")).toBe("A1\tB1\nA2\tB2");

    cleanup();
  });

  it("extends a copied selection with pointer drag before copying", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ExcelTable
        defaultValue={[
          [{ value: "A1" }, { value: "B1" }],
          [{ value: "A2" }, { value: "B2" }],
        ]}
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
      />,
    );

    const firstCell = target.querySelector('[data-row="0"][data-column="0"]');
    const lastCell = target.querySelector('[data-row="1"][data-column="1"]');

    firstCell?.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, buttons: 1 }),
    );
    lastCell?.dispatchEvent(
      new MouseEvent("mouseenter", { bubbles: true, buttons: 1 }),
    );

    const root = target.querySelector("div[tabindex='0']");
    const { event, store } = createClipboardEvent("copy");
    root?.dispatchEvent(event);

    expect(store.get("text/plain")).toBe("A1\tB1\nA2\tB2");

    cleanup();
  });

  it("extends the selected range with shift and arrow keys", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ExcelTable
        defaultValue={[
          [{ value: "A1" }, { value: "B1" }],
          [{ value: "A2" }, { value: "B2" }],
        ]}
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
      />,
    );

    const firstCell = target.querySelector('[data-row="0"][data-column="0"]');
    firstCell?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const root = target.querySelector("div[tabindex='0']");
    root?.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        shiftKey: true,
      }),
    );
    root?.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        shiftKey: true,
      }),
    );

    const { event, store } = createClipboardEvent("copy");
    root?.dispatchEvent(event);

    expect(store.get("text/plain")).toBe("A1\tB1\nA2\tB2");

    cleanup();
  });

  it("edits the active cell and commits decimal-safe values", () => {
    const target = document.createElement("div");
    const value = pulse([[{ value: "1" }]]);

    const cleanup = render(
      target,
      <ExcelTable value={value} columns={[{ key: "a", header: "A" }]} />,
    );

    const cell = target.querySelector('[data-row="0"][data-column="0"]');
    cell?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const root = target.querySelector("div[tabindex='0']");
    root?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    const input = target.querySelector('input[data-row="0"][data-column="0"]');

    expect(input).not.toBeNull();

    if (input instanceof HTMLInputElement) {
      input.value = "999999999999999999999.125";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    }

    expect(value.get()[0]?.[0]?.value.toString()).toBe(
      "999999999999999999999.125",
    );
    expect(
      target.querySelector('input[data-row="0"][data-column="0"]'),
    ).toBeNull();
    expect(
      target.querySelector('button[data-row="0"][data-column="0"]')
        ?.textContent,
    ).toBe("999999999999999999999.125");

    cleanup();
  });

  it("starts editing on double click", async () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ExcelTable
        defaultValue={[[{ value: "A1" }]]}
        columns={[{ key: "a", header: "A" }]}
      />,
    );

    const cell = target.querySelector('[data-row="0"][data-column="0"]');
    cell?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, button: 0, detail: 1 }),
    );
    cell?.dispatchEvent(
      new MouseEvent("dblclick", { bubbles: true, button: 0, detail: 2 }),
    );

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    const input = target.querySelector('input[data-row="0"][data-column="0"]');
    const button = target.querySelector(
      'button[data-row="0"][data-column="0"]',
    );

    expect(input).not.toBeNull();
    expect((input as HTMLInputElement | null)?.style.display).toBe("block");
    expect((button as HTMLButtonElement | null)?.style.display).toBe("none");

    cleanup();
  });

  it("starts editing from a printable key and replaces the current value", () => {
    const target = document.createElement("div");
    const value = pulse([[{ value: "123" }]]);

    const cleanup = render(
      target,
      <ExcelTable value={value} columns={[{ key: "a", header: "A" }]} />,
    );

    const cell = target.querySelector('[data-row="0"][data-column="0"]');
    cell?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const root = target.querySelector("div[tabindex='0']");
    root?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "9", bubbles: true }),
    );

    const input = target.querySelector('input[data-row="0"][data-column="0"]');

    expect(input).not.toBeNull();
    expect((input as HTMLInputElement | null)?.value).toBe("9");

    (input as HTMLInputElement | null)?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    expect(value.get()[0]?.[0]?.value.toString()).toBe("9");

    cleanup();
  });

  it("moves editing to the next cell on tab and back on shift-tab", () => {
    const target = document.createElement("div");
    const value = pulse([[{ value: "A1" }, { value: "B1" }]]);

    const cleanup = render(
      target,
      <ExcelTable
        value={value}
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
      />,
    );

    const firstCell = target.querySelector('[data-row="0"][data-column="0"]');
    firstCell?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const root = target.querySelector("div[tabindex='0']");
    root?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    const firstInput = target.querySelector(
      'input[data-row="0"][data-column="0"]',
    );

    if (firstInput instanceof HTMLInputElement) {
      firstInput.value = "AX";
      firstInput.dispatchEvent(new Event("input", { bubbles: true }));
      firstInput.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
      );
    }

    expect(value.get()[0]?.[0]?.value).toBe("AX");
    expect(
      target.querySelector('input[data-row="0"][data-column="1"]'),
    ).not.toBeNull();

    const secondInput = target.querySelector(
      'input[data-row="0"][data-column="1"]',
    );

    if (secondInput instanceof HTMLInputElement) {
      secondInput.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          bubbles: true,
          shiftKey: true,
        }),
      );
    }

    expect(
      target.querySelector('input[data-row="0"][data-column="0"]'),
    ).not.toBeNull();

    cleanup();
  });

  it("saves one edited cell and then saves a different edited cell", async () => {
    const target = document.createElement("div");
    const value = pulse([[{ value: "A1" }, { value: "B1" }]]);

    const cleanup = render(
      target,
      <ExcelTable
        value={value}
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
      />,
    );

    const firstCell = target.querySelector('[data-row="0"][data-column="0"]');
    firstCell?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const root = target.querySelector("div[tabindex='0']");
    root?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    const firstInput = target.querySelector(
      'input[data-row="0"][data-column="0"]',
    );

    if (firstInput instanceof HTMLInputElement) {
      firstInput.value = "AX";
      firstInput.dispatchEvent(new Event("input", { bubbles: true }));
      firstInput.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    }

    const secondCell = target.querySelector('[data-row="0"][data-column="1"]');
    secondCell?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    secondCell?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    root?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    const secondInput = target.querySelector(
      'input[data-row="0"][data-column="1"]',
    );

    expect(secondInput).not.toBeNull();

    if (secondInput instanceof HTMLInputElement) {
      secondInput.value = "BY";
      secondInput.dispatchEvent(new Event("input", { bubbles: true }));
      secondInput.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    }

    expect(value.get()[0]?.[0]?.value).toBe("AX");
    expect(value.get()[0]?.[1]?.value).toBe("BY");

    cleanup();
  });

  it("switches editing to another cell and allows editing it", async () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ExcelTable
        defaultValue={[[{ value: "A1" }, { value: "B1" }]]}
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
      />,
    );

    const dispatchDoubleClick = (element: Element | null): void => {
      element?.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          button: 0,
          detail: 1,
        }),
      );
      element?.dispatchEvent(
        new MouseEvent("dblclick", {
          bubbles: true,
          button: 0,
          detail: 2,
        }),
      );
    };

    const firstCell = target.querySelector('[data-row="0"][data-column="0"]');
    dispatchDoubleClick(firstCell);

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(
      target.querySelector('input[data-row="0"][data-column="0"]'),
    ).not.toBeNull();

    const secondCell = target.querySelector('[data-row="0"][data-column="1"]');
    dispatchDoubleClick(secondCell);

    await Promise.resolve();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(
      target.querySelector('input[data-row="0"][data-column="0"]'),
    ).toBeNull();

    expect(
      target.querySelector('input[data-row="0"][data-column="1"]'),
    ).not.toBeNull();

    cleanup();
  });

  it("clears the selected range with delete", () => {
    const target = document.createElement("div");
    const value = pulse([
      [{ value: "A1" }, { value: "B1" }],
      [{ value: "A2" }, { value: "B2" }],
    ]);

    const cleanup = render(
      target,
      <ExcelTable
        value={value}
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
      />,
    );

    const firstCell = target.querySelector('[data-row="0"][data-column="0"]');
    const lastCell = target.querySelector('[data-row="1"][data-column="1"]');

    firstCell?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    lastCell?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, shiftKey: true }),
    );

    const root = target.querySelector("div[tabindex='0']");
    root?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Delete", bubbles: true }),
    );

    expect(value.get()[0]?.[0]?.value).toBe("");
    expect(value.get()[0]?.[1]?.value).toBe("");
    expect(value.get()[1]?.[0]?.value).toBe("");
    expect(value.get()[1]?.[1]?.value).toBe("");

    cleanup();
  });

  it("adds a row from the initial selection when clicking add row", () => {
    const target = document.createElement("div");
    const value = pulse([
      [{ value: "A1" }, { value: "B1" }],
      [{ value: "A2" }, { value: "B2" }],
    ]);

    const cleanup = render(
      target,
      <ExcelTable
        value={value}
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
      />,
    );

    target
      .querySelector('button[aria-label="Add row"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(value.get().length).toBe(3);
    expect(target.querySelectorAll("tbody tr")).toHaveLength(3);
    expect(value.get()[0]?.[0]?.value).toBe("A1");
    expect(value.get()[1]?.[0]?.value).toBe("");
    expect(value.get()[1]?.[1]?.value).toBe("");
    expect(value.get()[2]?.[0]?.value).toBe("A2");

    cleanup();
  });

  it("adds a row then edits across two cells with double click", async () => {
    const target = document.createElement("div");
    const value = pulse([
      [{ value: "A1" }, { value: "B1" }],
      [{ value: "A2" }, { value: "B2" }],
    ]);

    const cleanup = render(
      target,
      <ExcelTable
        value={value}
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
      />,
    );

    const dispatchDoubleClick = (element: Element | null): void => {
      element?.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          button: 0,
          detail: 1,
        }),
      );
      element?.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          button: 0,
          detail: 1,
        }),
      );
      element?.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          button: 0,
          detail: 2,
        }),
      );
      element?.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          button: 0,
          detail: 2,
        }),
      );
      element?.dispatchEvent(
        new MouseEvent("dblclick", {
          bubbles: true,
          button: 0,
          detail: 2,
        }),
      );
    };

    target
      .querySelector('button[aria-label="Add row"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const firstNewCell = target.querySelector(
      'button[data-row="1"][data-column="0"]',
    );
    dispatchDoubleClick(firstNewCell);

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    const firstInput = target.querySelector(
      'input[data-row="1"][data-column="0"]',
    );

    expect(firstInput).not.toBeNull();

    if (firstInput instanceof HTMLInputElement) {
      firstInput.value = "NEW-A";
      firstInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    const secondNewCell = target.querySelector(
      'button[data-row="1"][data-column="1"]',
    );
    dispatchDoubleClick(secondNewCell);

    await Promise.resolve();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(
      target.querySelector('input[data-row="1"][data-column="0"]'),
    ).toBeNull();

    const secondInput = target.querySelector(
      'input[data-row="1"][data-column="1"]',
    );

    expect(secondInput).not.toBeNull();

    if (secondInput instanceof HTMLInputElement) {
      secondInput.value = "NEW-B";
      secondInput.dispatchEvent(new Event("input", { bubbles: true }));
      secondInput.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(value.get()[1]?.[0]?.value).toBe("NEW-A");
    expect(value.get()[1]?.[1]?.value).toBe("NEW-B");

    cleanup();
  });

  it("repaints inserted row values after double click edits commit", async () => {
    const target = document.createElement("div");
    const value = pulse([
      [{ value: "A1" }, { value: "B1" }],
      [{ value: "A2" }, { value: "B2" }],
    ]);

    const cleanup = render(
      target,
      <ExcelTable
        value={value}
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
      />,
    );

    const dispatchDoubleClick = (element: Element | null): void => {
      element?.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          button: 0,
          detail: 1,
        }),
      );
      element?.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          button: 0,
          detail: 1,
        }),
      );
      element?.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          button: 0,
          detail: 2,
        }),
      );
      element?.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          button: 0,
          detail: 2,
        }),
      );
      element?.dispatchEvent(
        new MouseEvent("dblclick", {
          bubbles: true,
          button: 0,
          detail: 2,
        }),
      );
    };

    target
      .querySelector('button[aria-label="Add row"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    dispatchDoubleClick(
      target.querySelector('button[data-row="1"][data-column="0"]'),
    );

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    const firstInput = target.querySelector(
      'input[data-row="1"][data-column="0"]',
    );

    if (firstInput instanceof HTMLInputElement) {
      firstInput.value = "NEW-A";
      firstInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    dispatchDoubleClick(
      target.querySelector('button[data-row="1"][data-column="1"]'),
    );

    await Promise.resolve();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    const secondInput = target.querySelector(
      'input[data-row="1"][data-column="1"]',
    );

    if (secondInput instanceof HTMLInputElement) {
      secondInput.value = "NEW-B";
      secondInput.dispatchEvent(new Event("input", { bubbles: true }));
      secondInput.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(
      target.querySelector('button[data-row="1"][data-column="0"]')
        ?.textContent,
    ).toBe("NEW-A");
    expect(
      target.querySelector('button[data-row="1"][data-column="1"]')
        ?.textContent,
    ).toBe("NEW-B");

    cleanup();
  });

  it("adds and removes rows and columns from the current selection", () => {
    const target = document.createElement("div");
    const value = pulse([
      [{ value: "A1" }, { value: "B1" }],
      [{ value: "A2" }, { value: "B2" }],
    ]);

    const cleanup = render(
      target,
      <ExcelTable
        value={value}
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
      />,
    );

    const firstCell = target.querySelector('[data-row="0"][data-column="0"]');
    firstCell?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    target
      .querySelector('button[aria-label="Add row"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(value.get().length).toBe(3);
    expect(target.querySelectorAll("tbody tr")).toHaveLength(3);

    target
      .querySelector('button[aria-label="Add column"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(value.get()[0]?.length).toBe(3);
    expect(target.querySelectorAll("thead th")).toHaveLength(4);
    expect(
      target.querySelectorAll('tbody tr:first-child [data-row="0"]'),
    ).toHaveLength(3);

    target
      .querySelector('button[aria-label="Remove column"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(value.get()[0]?.length).toBe(2);
    expect(target.querySelectorAll("thead th")).toHaveLength(3);

    target
      .querySelector('button[aria-label="Remove row"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(value.get().length).toBe(2);
    expect(target.querySelectorAll("tbody tr")).toHaveLength(2);

    cleanup();
  });

  it("sorts spreadsheet columns using decimal-safe comparisons", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ExcelTable
        defaultValue={[
          [{ value: "B" }, { value: Decimal("999999999999999999999.50") }],
          [{ value: "A" }, { value: Decimal("2.75") }],
          [{ value: "C" }, { value: Decimal("10.125") }],
        ]}
        columns={[
          { key: "label", header: "Label" },
          { key: "amount", header: "Amount", sortable: true, align: "right" },
        ]}
      />,
    );

    const sortButton = Array.from(target.querySelectorAll("th button"))[0];
    sortButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const firstColumnCells = Array.from(
      target.querySelectorAll('[data-column="0"]'),
    ).map((cell) => cell.textContent ?? "");

    expect(firstColumnCells.slice(0, 3)).toEqual(["A", "C", "B"]);

    cleanup();
  });

  it("applies per-cell outline and background colors", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ExcelTable
        defaultValue={[
          [
            {
              value: "Styled",
              backgroundColor: "rgb(255, 238, 204)",
              outlineColor: "rgb(255, 102, 0)",
            },
          ],
        ]}
        columns={[{ key: "a", header: "A" }]}
      />,
    );

    const cell = target.querySelector('[data-row="0"][data-column="0"]');

    expect(cell?.getAttribute("style")).toContain(
      "background: rgb(255, 238, 204)",
    );
    expect(cell?.getAttribute("style")).toContain("rgb(255, 102, 0)");

    cleanup();
  });
});
