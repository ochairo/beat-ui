import { render } from "@ochairo/beat";
import { Decimal, Int } from "@ochairo/numbers";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import {
  SheetBody,
  SheetCell,
  SheetColumnHeader,
  type SheetEditValueBehavior,
  SheetHeader,
  SheetRoot,
  SheetRow,
  ThemeRoot,
  createSheetController,
} from "../../src";

function getCell(
  target: Element,
  rowIndex: number,
  columnIndex: number,
): HTMLElement | null {
  return target.querySelector(
    `[data-sheet-cell="true"][data-row="${rowIndex}"][data-column="${columnIndex}"]`,
  ) as HTMLElement | null;
}

function getCellButton(cell: HTMLElement | null): HTMLButtonElement {
  const button = cell?.querySelector("button");
  expect(button instanceof HTMLButtonElement).toBe(true);

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Expected cell surface button.");
  }

  return button;
}

function getColumnHeader(
  target: Element,
  columnIndex: number,
): HTMLElement | null {
  return (
    target.querySelectorAll<HTMLElement>('[data-sheet-header-scope="col"]')[
      columnIndex
    ] ?? null
  );
}

function createClipboardData(text = "") {
  let payload = text;

  return {
    getData: (type: string): string => (type === "text/plain" ? payload : ""),
    setData: (type: string, value: string): void => {
      if (type === "text/plain") {
        payload = value;
      }
    },
    readText: (): string => payload,
  };
}

function renderSheet(
  target: HTMLElement,
  options?: {
    readonly editValueBehavior?: SheetEditValueBehavior;
  },
) {
  const controller = createSheetController();
  const cells = [
    [pulse("Alpha"), pulse(Int("1"))],
    [pulse("Beta"), pulse(Int("2"))],
  ] as const;

  const cleanup = render(
    target,
    <ThemeRoot>
      <SheetRoot controller={controller} ariaLabel="Project sheet">
        <SheetHeader>
          <SheetRow>
            <SheetColumnHeader style="width:12rem;border:1px solid var(--beat-ui-color-border);padding:0.5rem 0.625rem;">
              Name
            </SheetColumnHeader>
            <SheetColumnHeader style="width:8rem;border:1px solid var(--beat-ui-color-border);padding:0.5rem 0.625rem;">
              Count
            </SheetColumnHeader>
          </SheetRow>
        </SheetHeader>
        <SheetBody>
          {cells.map((row, rowIndex) => (
            <SheetRow>
              {row.map((valueState, columnIndex) => (
                <SheetCell
                  controller={controller}
                  rowIndex={rowIndex}
                  columnIndex={columnIndex}
                  valueState={valueState}
                  editValueBehavior={options?.editValueBehavior}
                  editable={true}
                  dataType={columnIndex === 1 ? "integer" : "text"}
                  style="width:12rem;min-height:2.75rem;border:1px solid var(--beat-ui-color-border);"
                />
              ))}
            </SheetRow>
          ))}
        </SheetBody>
      </SheetRoot>
    </ThemeRoot>,
  );

  return {
    cleanup,
    controller,
    cells,
  };
}

describe("Sheet", () => {
  it("supports drag selection and editing", async () => {
    const target = document.createElement("div");
    const { cleanup, cells, controller } = renderSheet(target);

    controller.beginSelectionDrag({ rowIndex: 0, columnIndex: 0 });
    controller.updateSelectionDrag({ rowIndex: 0, columnIndex: 1 });
    controller.endSelectionDrag();

    await Promise.resolve();

    const firstCell = getCell(target, 0, 0);
    const secondCell = getCell(target, 0, 1);

    expect(firstCell?.getAttribute("data-selected")).toBe("true");
    expect(secondCell?.getAttribute("data-selected")).toBe("true");
    expect(secondCell?.getAttribute("data-active")).toBe("true");

    const secondButton = getCellButton(secondCell);
    secondButton.focus();
    secondButton.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
    );

    await Promise.resolve();

    const editedCell = getCell(target, 0, 1);
    expect(controller.editingCell.get()).toEqual({
      rowIndex: 0,
      columnIndex: 1,
    });
    expect(editedCell?.getAttribute("data-editing")).toBe("true");
    const input = editedCell?.querySelector("input");

    if (!(input instanceof HTMLInputElement)) {
      throw new Error(
        `Expected input while editing. HTML: ${editedCell?.innerHTML ?? "<null>"}`,
      );
    }

    input.value = "9";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new FocusEvent("blur"));

    await Promise.resolve();

    expect(cells[0][1].get().toString()).toBe("9");
    expect(typeof cells[0][1].get().toBigInt()).toBe("bigint");

    cleanup();
  });

  it("commits the current draft when another cell becomes active", async () => {
    const target = document.createElement("div");
    const { cleanup, cells } = renderSheet(target);

    const editableButton = getCellButton(getCell(target, 0, 1));
    editableButton.focus();
    editableButton.dispatchEvent(new FocusEvent("focus"));
    editableButton.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
    );

    await Promise.resolve();

    const input = getCell(target, 0, 1)?.querySelector("input");
    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Expected input while editing.");
    }

    input.value = "42";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    const nextButton = getCellButton(getCell(target, 1, 0));
    nextButton.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, buttons: 1 }),
    );
    nextButton.focus();
    nextButton.dispatchEvent(new FocusEvent("focus"));
    nextButton.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    await Promise.resolve();

    expect(cells[0][1].get().toString()).toBe("42");
    expect(getCell(target, 1, 0)?.getAttribute("data-active")).toBe("true");
    expect(getCell(target, 0, 1)?.getAttribute("data-editing")).toBe(null);

    cleanup();
  });

  it("freezes the draft by default while editing", async () => {
    const target = document.createElement("div");
    const { cleanup, cells } = renderSheet(target);

    const editableButton = getCellButton(getCell(target, 0, 1));
    editableButton.focus();
    editableButton.dispatchEvent(new FocusEvent("focus"));
    editableButton.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
    );

    await Promise.resolve();

    const input = getCell(target, 0, 1)?.querySelector("input");
    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Expected input while editing.");
    }

    expect(input.value).toBe("1");

    cells[0][1].set(Int("7"));

    await Promise.resolve();

    expect(input.value).toBe("1");

    cleanup();
  });

  it("can sync an untouched editor until the user types", async () => {
    const target = document.createElement("div");
    const { cleanup, cells } = renderSheet(target, {
      editValueBehavior: "sync-until-dirty",
    });

    const editableButton = getCellButton(getCell(target, 0, 1));
    editableButton.focus();
    editableButton.dispatchEvent(new FocusEvent("focus"));
    editableButton.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
    );

    await Promise.resolve();

    const input = getCell(target, 0, 1)?.querySelector("input");
    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Expected input while editing.");
    }

    expect(input.value).toBe("1");

    cells[0][1].set(Int("7"));

    await Promise.resolve();

    expect(input.value).toBe("7");

    input.value = "42";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    cells[0][1].set(Int("9"));

    await Promise.resolve();

    expect(input.value).toBe("42");

    cleanup();
  });

  it("copies only the selected body range and strips matching headers on paste", () => {
    const target = document.createElement("div");
    const { cleanup, cells, controller } = renderSheet(target);

    const root = target.querySelector('[data-sheet-root="true"]');
    const firstButton = getCellButton(getCell(target, 0, 0));
    const lastButton = getCellButton(getCell(target, 1, 1));

    expect(root instanceof HTMLElement).toBe(true);

    if (!(root instanceof HTMLElement)) {
      throw new Error("Expected sheet root.");
    }

    firstButton.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, buttons: 1 }),
    );
    lastButton.dispatchEvent(
      new MouseEvent("mouseenter", { bubbles: true, buttons: 1 }),
    );
    lastButton.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    expect(getCell(target, 0, 0)?.getAttribute("data-selected")).toBe("true");
    expect(getCell(target, 1, 1)?.getAttribute("data-selected")).toBe("true");
    expect(getColumnHeader(target, 0)?.getAttribute("data-selected")).toBe(
      null,
    );
    expect(getColumnHeader(target, 1)?.getAttribute("data-selected")).toBe(
      null,
    );

    const copyClipboard = createClipboardData();
    const copyEvent = new Event("copy", { bubbles: true });
    Object.defineProperty(copyEvent, "clipboardData", {
      value: copyClipboard,
    });

    root.dispatchEvent(copyEvent);

    expect(copyClipboard.readText()).toBe("Alpha\t1\nBeta\t2");

    const pasteClipboard = createClipboardData(
      "Name\tCount\nGamma\t7\nDelta\t8",
    );
    const pasteEvent = new Event("paste", { bubbles: true });
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: pasteClipboard,
    });

    controller.activateCell({ rowIndex: 0, columnIndex: 0 });
    root.dispatchEvent(pasteEvent);

    expect(cells[0][0].get()).toBe("Gamma");
    expect(cells[0][1].get().toString()).toBe("7");
    expect(cells[1][0].get()).toBe("Delta");
    expect(cells[1][1].get().toString()).toBe("8");

    cleanup();
  });

  it("keeps sticky-styled first-column cells selectable and copyable", () => {
    const target = document.createElement("div");
    const controller = createSheetController();
    const cells = [
      [pulse("Alpha"), pulse(Int("1"))],
      [pulse("Beta"), pulse(Int("2"))],
    ] as const;

    const stickyStyle =
      "width:12rem;min-height:2.75rem;border:1px solid var(--beat-ui-color-border);position:sticky;left:0;z-index:900;background:var(--beat-ui-color-background);border-right:1px solid var(--beat-ui-color-border-strong);";
    const regularStyle =
      "width:8rem;min-height:2.75rem;border:1px solid var(--beat-ui-color-border);";

    const cleanup = render(
      target,
      <ThemeRoot>
        <SheetRoot controller={controller} ariaLabel="Sticky sheet">
          <SheetHeader>
            <SheetRow>
              <SheetColumnHeader style="width:12rem;border:1px solid var(--beat-ui-color-border);padding:0.5rem 0.625rem;position:sticky;left:0;z-index:999;background:var(--beat-ui-color-background-subtle);border-right:1px solid var(--beat-ui-color-border-strong);">
                Name
              </SheetColumnHeader>
              <SheetColumnHeader style="width:8rem;border:1px solid var(--beat-ui-color-border);padding:0.5rem 0.625rem;">
                Count
              </SheetColumnHeader>
            </SheetRow>
          </SheetHeader>
          <SheetBody>
            {cells.map((row, rowIndex) => (
              <SheetRow>
                <SheetCell
                  controller={controller}
                  rowIndex={rowIndex}
                  columnIndex={0}
                  valueState={row[0]}
                  editable={true}
                  dataType="text"
                  style={stickyStyle}
                />
                <SheetCell
                  controller={controller}
                  rowIndex={rowIndex}
                  columnIndex={1}
                  valueState={row[1]}
                  editable={true}
                  dataType="integer"
                  style={regularStyle}
                />
              </SheetRow>
            ))}
          </SheetBody>
        </SheetRoot>
      </ThemeRoot>,
    );

    const root = target.querySelector('[data-sheet-root="true"]');
    const firstButton = getCellButton(getCell(target, 0, 0));
    const lastButton = getCellButton(getCell(target, 1, 1));

    expect(root instanceof HTMLElement).toBe(true);

    if (!(root instanceof HTMLElement)) {
      throw new Error("Expected sheet root.");
    }

    firstButton.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, buttons: 1 }),
    );
    lastButton.dispatchEvent(
      new MouseEvent("mouseenter", { bubbles: true, buttons: 1 }),
    );
    lastButton.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    expect(getCell(target, 0, 0)?.getAttribute("data-selected")).toBe("true");
    expect(getCell(target, 1, 1)?.getAttribute("data-selected")).toBe("true");

    const copyClipboard = createClipboardData();
    const copyEvent = new Event("copy", { bubbles: true });
    Object.defineProperty(copyEvent, "clipboardData", {
      value: copyClipboard,
    });

    root.dispatchEvent(copyEvent);

    expect(copyClipboard.readText()).toBe("Alpha\t1\nBeta\t2");

    cleanup();
  });

  it("selects the full sheet including headers with ctrl+a", async () => {
    const target = document.createElement("div");
    const { cleanup } = renderSheet(target);

    const root = target.querySelector('[data-sheet-root="true"]');
    const firstButton = getCellButton(getCell(target, 0, 0));

    expect(root instanceof HTMLElement).toBe(true);

    if (!(root instanceof HTMLElement)) {
      throw new Error("Expected sheet root.");
    }

    await Promise.resolve();

    firstButton.focus();
    firstButton.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        key: "a",
        ctrlKey: true,
      }),
    );

    expect(getColumnHeader(target, 0)?.getAttribute("data-selected")).toBe(
      "true",
    );
    expect(getColumnHeader(target, 1)?.getAttribute("data-selected")).toBe(
      "true",
    );
    expect(getCell(target, 0, 0)?.getAttribute("data-selected")).toBe("true");
    expect(getCell(target, 0, 1)?.getAttribute("data-selected")).toBe("true");
    expect(getCell(target, 1, 0)?.getAttribute("data-selected")).toBe("true");
    expect(getCell(target, 1, 1)?.getAttribute("data-selected")).toBe("true");

    const copyClipboard = createClipboardData();
    const copyEvent = new Event("copy", { bubbles: true });
    Object.defineProperty(copyEvent, "clipboardData", {
      value: copyClipboard,
    });

    root.dispatchEvent(copyEvent);

    expect(copyClipboard.readText()).toBe("Name\tCount\nAlpha\t1\nBeta\t2");

    cleanup();
  });

  it("selects a column from the header and strips matching headers on paste", async () => {
    const target = document.createElement("div");
    const { cleanup, cells } = renderSheet(target);

    const root = target.querySelector('[data-sheet-root="true"]');
    const countHeader = getColumnHeader(target, 1);

    expect(root instanceof HTMLElement).toBe(true);
    expect(countHeader instanceof HTMLElement).toBe(true);

    if (
      !(root instanceof HTMLElement) ||
      !(countHeader instanceof HTMLElement)
    ) {
      throw new Error("Expected sheet root and count header.");
    }

    await Promise.resolve();

    countHeader.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, buttons: 1 }),
    );
    countHeader.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    expect(countHeader.getAttribute("data-selected")).toBe("true");
    expect(getColumnHeader(target, 0)?.getAttribute("data-selected")).toBe(
      null,
    );
    expect(getCell(target, 0, 1)?.getAttribute("data-selected")).toBe(null);
    expect(getCell(target, 1, 1)?.getAttribute("data-selected")).toBe(null);
    expect(getCell(target, 0, 0)?.getAttribute("data-selected")).toBe(null);

    const copyClipboard = createClipboardData();
    const copyEvent = new Event("copy", { bubbles: true });
    Object.defineProperty(copyEvent, "clipboardData", {
      value: copyClipboard,
    });

    root.dispatchEvent(copyEvent);

    expect(copyClipboard.readText()).toBe("Count");

    const pasteClipboard = createClipboardData("Count\n7\n8");
    const pasteEvent = new Event("paste", { bubbles: true });
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: pasteClipboard,
    });

    getCellButton(getCell(target, 0, 1)).dispatchEvent(
      new FocusEvent("focus", { bubbles: true }),
    );
    root.dispatchEvent(pasteEvent);

    expect(getColumnHeader(target, 1)?.textContent?.trim()).toBe("Count");
    expect(cells[0][0].get()).toBe("Alpha");
    expect(cells[1][0].get()).toBe("Beta");
    expect(cells[0][1].get().toString()).toBe("7");
    expect(cells[1][1].get().toString()).toBe("8");

    cleanup();
  });

  it("extends a header drag into a combined header and body selection", async () => {
    const target = document.createElement("div");
    const { cleanup } = renderSheet(target);

    const root = target.querySelector('[data-sheet-root="true"]');
    const countHeader = getColumnHeader(target, 1);
    const lastCountCellButton = getCellButton(getCell(target, 1, 1));

    expect(root instanceof HTMLElement).toBe(true);
    expect(countHeader instanceof HTMLElement).toBe(true);

    if (
      !(root instanceof HTMLElement) ||
      !(countHeader instanceof HTMLElement)
    ) {
      throw new Error("Expected sheet root and count header.");
    }

    await Promise.resolve();

    countHeader.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, buttons: 1 }),
    );
    lastCountCellButton.dispatchEvent(
      new MouseEvent("mouseenter", { bubbles: true, buttons: 1 }),
    );
    lastCountCellButton.dispatchEvent(
      new MouseEvent("mouseup", { bubbles: true }),
    );

    expect(countHeader.getAttribute("data-selected")).toBe("true");
    expect(getCell(target, 0, 1)?.getAttribute("data-selected")).toBe("true");
    expect(getCell(target, 1, 1)?.getAttribute("data-selected")).toBe("true");
    expect(getCell(target, 0, 0)?.getAttribute("data-selected")).toBe(null);
    expect(getCell(target, 1, 0)?.getAttribute("data-selected")).toBe(null);

    const copyClipboard = createClipboardData();
    const copyEvent = new Event("copy", { bubbles: true });
    Object.defineProperty(copyEvent, "clipboardData", {
      value: copyClipboard,
    });

    root.dispatchEvent(copyEvent);

    expect(copyClipboard.readText()).toBe("Count\n1\n2");

    cleanup();
  });

  it("skips readonly cells during paste", () => {
    const target = document.createElement("div");
    const controller = createSheetController();
    const locked = pulse("Locked");
    const editable = pulse("Open");

    const cleanup = render(
      target,
      <ThemeRoot>
        <SheetRoot controller={controller} ariaLabel="Readonly sheet">
          <SheetHeader>
            <SheetRow>
              <SheetColumnHeader style="width:12rem;">A</SheetColumnHeader>
              <SheetColumnHeader style="width:12rem;">B</SheetColumnHeader>
            </SheetRow>
          </SheetHeader>
          <SheetBody>
            <SheetRow>
              <SheetCell
                controller={controller}
                rowIndex={0}
                columnIndex={0}
                valueState={locked}
                editable={false}
                style="width:12rem;min-height:2.75rem;"
              />
              <SheetCell
                controller={controller}
                rowIndex={0}
                columnIndex={1}
                valueState={editable}
                editable={true}
                style="width:12rem;min-height:2.75rem;"
              />
            </SheetRow>
          </SheetBody>
        </SheetRoot>
      </ThemeRoot>,
    );

    const root = target.querySelector('[data-sheet-root="true"]');
    const firstButton = getCellButton(getCell(target, 0, 0));
    firstButton.focus();
    firstButton.dispatchEvent(new FocusEvent("focus"));

    expect(root instanceof HTMLElement).toBe(true);

    if (!(root instanceof HTMLElement)) {
      throw new Error("Expected sheet root.");
    }

    const pasteClipboard = createClipboardData("Replaced\tUpdated");
    const pasteEvent = new Event("paste", { bubbles: true });
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: pasteClipboard,
    });

    root.dispatchEvent(pasteEvent);

    expect(locked.get()).toBe("Locked");
    expect(editable.get()).toBe("Updated");

    cleanup();
  });

  it("renders custom cell content without stringifying it", () => {
    const target = document.createElement("div");
    const controller = createSheetController();
    const value = pulse({ label: "Ready" });

    const cleanup = render(
      target,
      <ThemeRoot>
        <SheetRoot controller={controller} ariaLabel="Status sheet">
          <SheetHeader>
            <SheetRow>
              <SheetColumnHeader>Status</SheetColumnHeader>
            </SheetRow>
          </SheetHeader>
          <SheetBody>
            <SheetRow>
              <SheetCell
                controller={controller}
                rowIndex={0}
                columnIndex={0}
                valueState={value}
                editable={false}
                renderValue={(nextValue) => (
                  <strong>{(nextValue as { label: string }).label}</strong>
                )}
                style="width:12rem;min-height:2.75rem;"
              />
            </SheetRow>
          </SheetBody>
        </SheetRoot>
      </ThemeRoot>,
    );

    const strong = target.querySelector("strong");

    expect(strong?.textContent).toBe("Ready");
    expect(target.textContent?.includes("[object Object]")).toBe(false);

    cleanup();
  });

  it("supports explicit cell alignment and right-aligns numeric types by default", async () => {
    const target = document.createElement("div");
    const controller = createSheetController();
    const textValue = pulse("Alpha");
    const rightTextValue = pulse("Beta");
    const integerValue = pulse(Int("12"));
    const leftIntegerValue = pulse(Int("24"));

    const cleanup = render(
      target,
      <ThemeRoot>
        <SheetRoot controller={controller} ariaLabel="Alignment sheet">
          <SheetHeader>
            <SheetRow>
              <SheetColumnHeader>Text</SheetColumnHeader>
              <SheetColumnHeader>Right Text</SheetColumnHeader>
              <SheetColumnHeader>Integer</SheetColumnHeader>
              <SheetColumnHeader>Left Integer</SheetColumnHeader>
            </SheetRow>
          </SheetHeader>
          <SheetBody>
            <SheetRow>
              <SheetCell
                controller={controller}
                rowIndex={0}
                columnIndex={0}
                valueState={textValue}
                editable={true}
                dataType="text"
                style="width:10rem;min-height:2.75rem;"
              />
              <SheetCell
                controller={controller}
                rowIndex={0}
                columnIndex={1}
                valueState={rightTextValue}
                editable={true}
                dataType="text"
                align="right"
                style="width:10rem;min-height:2.75rem;"
              />
              <SheetCell
                controller={controller}
                rowIndex={0}
                columnIndex={2}
                valueState={integerValue}
                editable={true}
                dataType="integer"
                style="width:10rem;min-height:2.75rem;"
              />
              <SheetCell
                controller={controller}
                rowIndex={0}
                columnIndex={3}
                valueState={leftIntegerValue}
                editable={true}
                dataType="integer"
                align="left"
                style="width:10rem;min-height:2.75rem;"
              />
            </SheetRow>
          </SheetBody>
        </SheetRoot>
      </ThemeRoot>,
    );

    const textButton = getCellButton(getCell(target, 0, 0));
    const rightTextButton = getCellButton(getCell(target, 0, 1));
    const integerButton = getCellButton(getCell(target, 0, 2));
    const leftIntegerButton = getCellButton(getCell(target, 0, 3));

    expect(textButton.style.textAlign).toBe("left");
    expect(textButton.style.justifyContent).toBe("flex-start");
    expect(rightTextButton.style.textAlign).toBe("right");
    expect(rightTextButton.style.justifyContent).toBe("flex-end");
    expect(integerButton.style.textAlign).toBe("right");
    expect(integerButton.style.justifyContent).toBe("flex-end");
    expect(leftIntegerButton.style.textAlign).toBe("left");
    expect(leftIntegerButton.style.justifyContent).toBe("flex-start");

    controller.beginEdit({ rowIndex: 0, columnIndex: 2 });
    await Promise.resolve();

    const integerInput = getCell(target, 0, 2)?.querySelector("input");
    if (!(integerInput instanceof HTMLInputElement)) {
      throw new Error("Expected integer input while editing.");
    }

    expect(integerInput.style.textAlign).toBe("right");

    controller.beginEdit({ rowIndex: 0, columnIndex: 1 });
    await Promise.resolve();

    const rightTextInput = getCell(target, 0, 1)?.querySelector("input");
    if (!(rightTextInput instanceof HTMLInputElement)) {
      throw new Error("Expected text input while editing.");
    }

    expect(rightTextInput.style.textAlign).toBe("right");

    cleanup();
  });

  it("uses @ochairo/numbers for integer and decimal data types by default", async () => {
    const target = document.createElement("div");
    const controller = createSheetController();
    const integerValue = pulse(Int("900719925474099312345678901234567890"));
    const decimalValue = pulse(Decimal("12345678901234567890.123456789"));

    const cleanup = render(
      target,
      <ThemeRoot>
        <SheetRoot controller={controller} ariaLabel="Numeric sheet">
          <SheetHeader>
            <SheetRow>
              <SheetColumnHeader>Integer</SheetColumnHeader>
              <SheetColumnHeader>Decimal</SheetColumnHeader>
            </SheetRow>
          </SheetHeader>
          <SheetBody>
            <SheetRow>
              <SheetCell
                controller={controller}
                rowIndex={0}
                columnIndex={0}
                valueState={integerValue}
                editable={true}
                dataType="integer"
                style="width:16rem;min-height:2.75rem;"
              />
              <SheetCell
                controller={controller}
                rowIndex={0}
                columnIndex={1}
                valueState={decimalValue}
                editable={true}
                dataType="decimal(38,9)"
                style="width:18rem;min-height:2.75rem;"
              />
            </SheetRow>
          </SheetBody>
        </SheetRoot>
      </ThemeRoot>,
    );

    controller.beginEdit({ rowIndex: 0, columnIndex: 0 });
    await Promise.resolve();

    const integerInput = getCell(target, 0, 0)?.querySelector("input");
    if (!(integerInput instanceof HTMLInputElement)) {
      throw new Error("Expected integer input while editing.");
    }

    integerInput.value = "999999999999999999999999999999999999";
    integerInput.dispatchEvent(new Event("input", { bubbles: true }));
    integerInput.dispatchEvent(new FocusEvent("blur"));

    await Promise.resolve();

    expect(integerValue.get().toString()).toBe(
      "999999999999999999999999999999999999",
    );
    expect(typeof integerValue.get().toBigInt()).toBe("bigint");

    controller.beginEdit({ rowIndex: 0, columnIndex: 1 });
    await Promise.resolve();

    const decimalInput = getCell(target, 0, 1)?.querySelector("input");
    if (!(decimalInput instanceof HTMLInputElement)) {
      throw new Error("Expected decimal input while editing.");
    }

    decimalInput.value = "99999999999999999999999999.123456789";
    decimalInput.dispatchEvent(new Event("input", { bubbles: true }));
    decimalInput.dispatchEvent(new FocusEvent("blur"));

    await Promise.resolve();

    expect(decimalValue.get().toString()).toBe(
      "99999999999999999999999999.123456789",
    );
    expect(decimalValue.get().toPostgres()).toBe(
      "99999999999999999999999999.123456789",
    );

    cleanup();
  });

  it("renders and uses default right-side controls for integer, date, and time editors", async () => {
    const target = document.createElement("div");
    const controller = createSheetController();
    const integerValue = pulse(Int("1"));
    const dateValue = pulse("2024-01-01");
    const timeValue = pulse("09:30");

    const cleanup = render(
      target,
      <ThemeRoot>
        <SheetRoot controller={controller} ariaLabel="Editor sheet">
          <SheetHeader>
            <SheetRow>
              <SheetColumnHeader>Integer</SheetColumnHeader>
              <SheetColumnHeader>Date</SheetColumnHeader>
              <SheetColumnHeader>Time</SheetColumnHeader>
            </SheetRow>
          </SheetHeader>
          <SheetBody>
            <SheetRow>
              <SheetCell
                controller={controller}
                rowIndex={0}
                columnIndex={0}
                valueState={integerValue}
                editable={true}
                dataType="integer"
                style="width:12rem;min-height:2.75rem;"
              />
              <SheetCell
                controller={controller}
                rowIndex={0}
                columnIndex={1}
                valueState={dateValue}
                editable={true}
                dataType="date"
                style="width:12rem;min-height:2.75rem;"
              />
              <SheetCell
                controller={controller}
                rowIndex={0}
                columnIndex={2}
                valueState={timeValue}
                editable={true}
                dataType="time"
                style="width:12rem;min-height:2.75rem;"
              />
            </SheetRow>
          </SheetBody>
        </SheetRoot>
      </ThemeRoot>,
    );

    controller.beginEdit({ rowIndex: 0, columnIndex: 0 });
    await Promise.resolve();

    expect(
      getCell(target, 0, 0)?.querySelector(
        'button[aria-label="Increment"] svg',
      ),
    ).not.toBeNull();
    expect(
      getCell(target, 0, 0)?.querySelector(
        'button[aria-label="Decrement"] svg',
      ),
    ).not.toBeNull();

    controller.beginEdit({ rowIndex: 0, columnIndex: 1 });
    await Promise.resolve();

    const dateCell = getCell(target, 0, 1);
    const dateToggle = dateCell?.querySelector(
      'button[aria-label="Toggle calendar"]',
    );
    const initialDateInput = dateCell?.querySelector("input");

    expect(dateToggle?.querySelector("svg")).not.toBeNull();

    if (!(initialDateInput instanceof HTMLInputElement)) {
      throw new Error("Expected date input while editing.");
    }

    const initialDateValue = initialDateInput.value;

    if (!(dateToggle instanceof HTMLButtonElement)) {
      throw new Error("Expected date toggle button.");
    }

    dateToggle.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
    );
    dateToggle.click();

    await Promise.resolve();

    const calendar = target.querySelector(
      '[role="group"][aria-label="Calendar"]',
    );
    expect(calendar).not.toBeNull();

    const dayButton = Array.from(
      calendar?.querySelectorAll<HTMLButtonElement>(
        'button[role="gridcell"]',
      ) ?? [],
    ).find(
      (button) =>
        button.textContent === "20" &&
        button.getAttribute("data-outside") !== "true",
    );

    expect(dayButton).not.toBeUndefined();
    dayButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    await Promise.resolve();

    const dateInput = dateCell?.querySelector("input");
    if (!(dateInput instanceof HTMLInputElement)) {
      throw new Error("Expected date input while editing.");
    }

    expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dateInput.value).not.toBe(initialDateValue);
    const selectedDateValue = dateInput.value;

    controller.beginEdit({ rowIndex: 0, columnIndex: 2 });
    await Promise.resolve();

    expect(dateValue.get()).toBe(selectedDateValue);

    const timeCell = getCell(target, 0, 2);
    const timeToggle = timeCell?.querySelector(
      'button[aria-label="Toggle time picker"]',
    );

    expect(timeToggle?.querySelector("svg")).not.toBeNull();

    if (!(timeToggle instanceof HTMLButtonElement)) {
      throw new Error("Expected time toggle button.");
    }

    timeToggle.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
    );
    timeToggle.click();

    await Promise.resolve();

    const timeDialog = target.querySelector(
      '[data-part="picker-wrapper"]',
    ) as HTMLElement | null;

    expect(timeDialog).not.toBeNull();
    expect(timeCell?.contains(timeDialog ?? null)).toBe(false);

    const timePicker = target.querySelector(
      '[role="group"][aria-label="Time picker"]',
    );
    expect(timePicker).not.toBeNull();

    const pickerColumns = timePicker?.querySelectorAll('[data-part="column"]');
    const hourColumn = pickerColumns?.[0];
    const minuteColumn = pickerColumns?.[1];
    const hourButton = Array.from(
      hourColumn?.querySelectorAll<HTMLButtonElement>(
        'button[role="option"]',
      ) ?? [],
    ).find((button) => button.textContent === "10");
    const minuteButton = Array.from(
      minuteColumn?.querySelectorAll<HTMLButtonElement>(
        'button[role="option"]',
      ) ?? [],
    ).find((button) => button.textContent === "15");

    expect(hourButton).not.toBeUndefined();
    expect(minuteButton).not.toBeUndefined();

    hourButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    minuteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    await Promise.resolve();

    const timeInput = timeCell?.querySelector("input");
    if (!(timeInput instanceof HTMLInputElement)) {
      throw new Error("Expected time input while editing.");
    }

    expect(timeInput.value).toBe("10:15");

    controller.activateCell({ rowIndex: 0, columnIndex: 0 });
    await Promise.resolve();

    expect(timeValue.get()).toBe("10:15");

    cleanup();
  });
});
