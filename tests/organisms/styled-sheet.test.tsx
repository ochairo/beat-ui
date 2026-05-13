import { render } from "@ochairo/beat";
import { Int } from "@ochairo/numbers";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { Sheet, ThemeRoot } from "../../src";

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

describe("styled Sheet", () => {
  it("renders sticky first-column styles and keeps selection copy working", () => {
    const target = document.createElement("div");
    const rows = [
      { id: "alpha", name: pulse("Alpha"), count: pulse(Int("1")) },
      { id: "beta", name: pulse("Beta"), count: pulse(Int("2")) },
    ] as const;

    const cleanup = render(
      target,
      <ThemeRoot>
        <Sheet
          ariaLabel="Styled sheet"
          height="20rem"
          stickyColumnCount={1}
          rows={rows}
          columns={[
            {
              id: "name",
              title: "Name",
              width: "12rem",
              dataType: "text",
              getValueState: (row) => row.name,
            },
            {
              id: "count",
              title: "Count",
              width: "8rem",
              dataType: "integer",
              getValueState: (row) => row.count,
            },
          ]}
        />
      </ThemeRoot>,
    );

    const root = target.querySelector('[data-sheet-root="true"]');
    const firstHeader = getColumnHeader(target, 0);
    const firstCell = getCell(target, 0, 0);
    const lastCell = getCell(target, 1, 1);

    expect(root instanceof HTMLElement).toBe(true);
    expect(firstHeader?.getAttribute("style")).toContain("position:sticky");
    expect(firstCell?.getAttribute("style")).toContain("position:sticky");

    if (!(root instanceof HTMLElement)) {
      throw new Error("Expected sheet root.");
    }

    getCellButton(firstCell).dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, buttons: 1 }),
    );
    getCellButton(lastCell).dispatchEvent(
      new MouseEvent("mouseenter", { bubbles: true, buttons: 1 }),
    );
    getCellButton(lastCell).dispatchEvent(
      new MouseEvent("mouseup", { bubbles: true }),
    );

    expect(firstCell?.getAttribute("data-selected")).toBe("true");
    expect(lastCell?.getAttribute("data-selected")).toBe("true");

    const copyClipboard = createClipboardData();
    const copyEvent = new Event("copy", { bubbles: true });
    Object.defineProperty(copyEvent, "clipboardData", {
      value: copyClipboard,
    });

    root.dispatchEvent(copyEvent);

    expect(copyClipboard.readText()).toBe("Alpha\t1\nBeta\t2");

    cleanup();
  });

  it("creates an internal controller when one is not provided", async () => {
    const target = document.createElement("div");
    const rows = [
      { id: "alpha", name: pulse("Alpha"), count: pulse(Int("1")) },
      { id: "beta", name: pulse("Beta"), count: pulse(Int("2")) },
    ] as const;

    const cleanup = render(
      target,
      <ThemeRoot>
        <Sheet
          ariaLabel="Implicit controller sheet"
          stickyColumnCount={1}
          rows={rows}
          columns={[
            {
              id: "name",
              title: "Name",
              width: "12rem",
              dataType: "text",
              getValueState: (row) => row.name,
            },
            {
              id: "count",
              title: "Count",
              width: "8rem",
              dataType: "integer",
              getValueState: (row) => row.count,
            },
          ]}
        />
      </ThemeRoot>,
    );

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

  it("keeps a sticky header outside the scrolling viewport and syncs horizontal scroll", () => {
    const target = document.createElement("div");
    const rows = [
      { id: "alpha", name: pulse("Alpha"), count: pulse(Int("1")) },
      { id: "beta", name: pulse("Beta"), count: pulse(Int("2")) },
    ] as const;

    const cleanup = render(
      target,
      <ThemeRoot>
        <Sheet
          ariaLabel="Split header sheet"
          height="12rem"
          rows={rows}
          columns={[
            {
              id: "name",
              title: "Name",
              width: "16rem",
              dataType: "text",
              getValueState: (row) => row.name,
            },
            {
              id: "count",
              title: "Count",
              width: "16rem",
              dataType: "integer",
              getValueState: (row) => row.count,
            },
          ]}
        />
      </ThemeRoot>,
    );

    const headerViewport = target.querySelector(
      '[data-sheet-header-viewport="true"]',
    );
    const bodyViewport = target.querySelector(
      '[data-sheet-body-viewport="true"]',
    );

    expect(headerViewport instanceof HTMLDivElement).toBe(true);
    expect(bodyViewport instanceof HTMLDivElement).toBe(true);

    if (
      !(headerViewport instanceof HTMLDivElement) ||
      !(bodyViewport instanceof HTMLDivElement)
    ) {
      throw new Error("Expected split header and body viewports.");
    }

    Object.defineProperty(bodyViewport, "clientWidth", {
      configurable: true,
      value: 180,
    });
    Object.defineProperty(bodyViewport, "offsetWidth", {
      configurable: true,
      value: 196,
    });

    bodyViewport.scrollLeft = 72;
    bodyViewport.dispatchEvent(new Event("scroll"));

    expect(headerViewport.scrollLeft).toBe(72);
    expect(
      headerViewport.style.getPropertyValue("--beat-ui-sheet-scrollbar-gutter"),
    ).toBe("16px");

    cleanup();
  });

  it("can sync an untouched editor until the user types", async () => {
    const target = document.createElement("div");
    const rows = [
      { id: "alpha", name: pulse("Alpha"), count: pulse(Int("1")) },
      { id: "beta", name: pulse("Beta"), count: pulse(Int("2")) },
    ] as const;

    const cleanup = render(
      target,
      <ThemeRoot>
        <Sheet
          ariaLabel="Live edit sheet"
          editValueBehavior="sync-until-dirty"
          rows={rows}
          columns={[
            {
              id: "name",
              title: "Name",
              width: "12rem",
              dataType: "text",
              getValueState: (row) => row.name,
            },
            {
              id: "count",
              title: "Count",
              width: "8rem",
              dataType: "integer",
              getValueState: (row) => row.count,
            },
          ]}
        />
      </ThemeRoot>,
    );

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

    rows[0].count.set(Int("7"));

    await Promise.resolve();

    expect(input.value).toBe("7");

    input.value = "42";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    rows[0].count.set(Int("9"));

    await Promise.resolve();

    expect(input.value).toBe("42");

    cleanup();
  });

  it("supports cell and header resolver hooks with slot overrides", () => {
    const target = document.createElement("div");
    const previousByRowId = new Map([
      ["alpha", { count: 3, name: "Alpha" }],
      ["beta", { count: 2, name: "Beta" }],
    ] as const);
    const rows = [
      { id: "alpha", name: pulse("Alpha"), count: pulse(Int("4")) },
      { id: "beta", name: pulse("Beta"), count: pulse(Int("2")) },
    ] as const;

    const cleanup = render(
      target,
      <ThemeRoot>
        <Sheet
          ariaLabel="Decorated sheet"
          classNames={{
            cell: "sheet-cell-slot",
            stickyColumnCell: "sheet-sticky-column-slot",
          }}
          styles={{
            headerCell:
              "--beat-ui-sheet-sticky-header-background:rgb(10 20 30)",
          }}
          getCellProps={({ columnId, rowId, value }) => {
            const previousRow = previousByRowId.get(String(rowId));
            const previousValue = previousRow?.[columnId as "count" | "name"];
            const changed = String(previousValue) !== String(value);

            return changed
              ? {
                  class: "sheet-cell-changed",
                  cssVariables: {
                    "--beat-ui-sheet-cell-background": "rgb(255 230 230)",
                    "--beat-ui-sheet-cell-border-color": "rgb(255 0 0)",
                  },
                  dataAttributes: {
                    "data-dirty": "true",
                  },
                  title: `Previous: ${String(previousValue ?? "")}`,
                }
              : undefined;
          }}
          getHeaderCellProps={({ columnId, isCorner }) => ({
            dataAttributes: {
              "data-column-key": columnId,
              "data-corner": isCorner ? "true" : undefined,
            },
          })}
          getRowId={(row) => row.id}
          renderCell={({ columnId, rowId, value }) =>
            columnId === "count" && rowId === "alpha"
              ? `delta:${String(value)}`
              : String(value)
          }
          rows={rows}
          stickyColumnCount={1}
          columns={[
            {
              id: "name",
              title: "Name",
              width: "12rem",
              dataType: "text",
              getValueState: (row) => row.name,
            },
            {
              id: "count",
              title: "Count",
              width: "8rem",
              dataType: "integer",
              getValueState: (row) => row.count,
            },
          ]}
        />
      </ThemeRoot>,
    );

    const changedCell = getCell(target, 0, 1);
    const stickyHeader = getColumnHeader(target, 0);

    expect(changedCell?.className).toContain("sheet-cell-slot");
    expect(changedCell?.getAttribute("class")).toContain("sheet-cell-changed");
    expect(changedCell?.getAttribute("style")).toContain(
      "--beat-ui-sheet-cell-background:rgb(255 230 230)",
    );
    expect(changedCell?.getAttribute("style")).toContain(
      "--beat-ui-sheet-cell-border-color:rgb(255 0 0)",
    );
    expect(changedCell?.getAttribute("data-dirty")).toBe("true");
    expect(changedCell?.getAttribute("data-row-id")).toBe("alpha");
    expect(changedCell?.getAttribute("data-column-id")).toBe("count");
    expect(changedCell?.getAttribute("title")).toBe("Previous: 3");
    expect(getCellButton(changedCell).textContent).toBe("delta:4");

    expect(stickyHeader?.getAttribute("data-column-key")).toBe("name");
    expect(stickyHeader?.getAttribute("data-sticky-top")).toBe("true");
    expect(stickyHeader?.getAttribute("data-sticky-left")).toBe("true");
    expect(stickyHeader?.getAttribute("data-sticky-corner")).toBe("true");
    expect(stickyHeader?.getAttribute("data-corner")).toBe("true");
    expect(stickyHeader?.getAttribute("style")).toContain(
      "--beat-ui-sheet-sticky-header-background:rgb(10 20 30)",
    );

    cleanup();
  });

  it("keeps header and body percentage width contracts aligned", () => {
    const target = document.createElement("div");
    const rows = [
      { id: "alpha", name: pulse("Alpha"), count: pulse(Int("1")) },
    ] as const;

    const cleanup = render(
      target,
      <ThemeRoot>
        <Sheet
          ariaLabel="Percentage width sheet"
          getRowId={(row) => row.id}
          rows={rows}
          columns={[
            {
              id: "name",
              title: "Name",
              width: "25%",
              dataType: "text",
              getValueState: (row) => row.name,
            },
            {
              id: "count",
              title: "Count",
              width: "75%",
              dataType: "integer",
              getValueState: (row) => row.count,
            },
          ]}
        />
      </ThemeRoot>,
    );

    const rowGroups = target.querySelectorAll<HTMLElement>('[role="rowgroup"]');
    const headerCell = getColumnHeader(target, 0);
    const bodyCell = getCell(target, 0, 0);

    expect(rowGroups[0]?.getAttribute("style")).toContain("width:100%");
    expect(rowGroups[0]?.getAttribute("style")).toContain("min-width:100%");
    expect(rowGroups[1]?.getAttribute("style")).toContain("width:100%");
    expect(rowGroups[1]?.getAttribute("style")).toContain("min-width:100%");
    expect(headerCell?.getAttribute("style")).toContain("flex:0 0 25%");
    expect(bodyCell?.getAttribute("style")).toContain("flex:0 0 25%");

    cleanup();
  });

  it("suspends offscreen custom cell content when row virtualization is enabled", async () => {
    const target = document.createElement("div");
    const originalIntersectionObserver = globalThis.IntersectionObserver;

    class MockIntersectionObserver {
      static instances: MockIntersectionObserver[] = [];

      readonly root = null;
      readonly rootMargin: string;
      readonly thresholds = [0];
      readonly elements: Element[] = [];

      constructor(
        private readonly callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
      ) {
        this.rootMargin = options?.rootMargin ?? "";
        MockIntersectionObserver.instances.push(this);
      }

      disconnect(): void {}

      observe(element: Element): void {
        this.elements.push(element);
      }

      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }

      trigger(isIntersecting: boolean): void {
        const targetElement = this.elements[0];
        if (targetElement === undefined) {
          return;
        }

        this.callback(
          [
            {
              isIntersecting,
              target: targetElement,
            } as IntersectionObserverEntry,
          ],
          this as unknown as IntersectionObserver,
        );
      }

      unobserve(element: Element): void {
        const index = this.elements.indexOf(element);
        if (index >= 0) {
          this.elements.splice(index, 1);
        }
      }
    }

    Object.defineProperty(globalThis, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: MockIntersectionObserver as unknown as typeof IntersectionObserver,
    });

    try {
      const betaCount = pulse(Int("2"));
      let betaSubscriptions = 0;
      const trackedBetaCount = Object.create(betaCount, {
        on: {
          value: (callback: Parameters<typeof betaCount.on>[0]) => {
            betaSubscriptions += 1;
            const unsubscribe = betaCount.on(callback);

            return () => {
              betaSubscriptions -= 1;
              unsubscribe();
            };
          },
        },
      }) as typeof betaCount;

      const rows = [
        { id: "alpha", count: pulse(Int("1")) },
        { id: "beta", count: trackedBetaCount },
      ] as const;

      const cleanup = render(
        target,
        <ThemeRoot>
          <Sheet
            ariaLabel="Virtualized sheet"
            getRowId={(row) => row.id}
            height="6rem"
            rowVirtualizationOverscan={0}
            rowVirtualizationRootMargin="512px 0px 128px 0px"
            rows={rows}
            virtualizeRows
            renderCell={({ rowId, value }) => (
              <span data-live-cell={String(rowId)}>{String(value)}</span>
            )}
            columns={[
              {
                id: "count",
                title: "Count",
                width: "8rem",
                dataType: "integer",
                getValueState: (row) => row.count,
              },
            ]}
          />
        </ThemeRoot>,
      );

      await Promise.resolve();

      const betaButton = getCellButton(getCell(target, 1, 0));
      expect(betaSubscriptions).toBe(1);
      expect(
        betaButton.querySelector('[data-live-cell="beta"]'),
      ).not.toBeNull();

      const betaObserver = MockIntersectionObserver.instances.find((instance) =>
        instance.elements.some(
          (element) =>
            element instanceof HTMLElement &&
            element.getAttribute("data-row-index") === "1",
        ),
      );

      if (betaObserver === undefined) {
        throw new Error("Expected beta row observer instance.");
      }

      expect(betaObserver.rootMargin).toBe("512px 0px 128px 0px");

      betaObserver.trigger(false);
      await Promise.resolve();

      expect(betaSubscriptions).toBe(0);
      expect(betaButton.querySelector('[data-live-cell="beta"]')).toBeNull();
      expect(betaButton.textContent).toBe("2");

      betaCount.set(Int("3"));
      await Promise.resolve();

      expect(betaSubscriptions).toBe(0);
      expect(betaButton.textContent).toBe("2");

      betaObserver.trigger(true);
      await Promise.resolve();

      expect(betaSubscriptions).toBe(1);
      expect(
        betaButton.querySelector('[data-live-cell="beta"]'),
      ).not.toBeNull();
      expect(betaButton.textContent).toBe("3");

      cleanup();
      expect(betaSubscriptions).toBe(0);
    } finally {
      Object.defineProperty(globalThis, "IntersectionObserver", {
        configurable: true,
        writable: true,
        value: originalIntersectionObserver,
      });
    }
  });
});
