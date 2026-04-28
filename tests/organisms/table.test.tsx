import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { Table, type TableRow } from "../../src";

describe("Table", () => {
  it("sorts numeric-like values with decimal precision awareness", () => {
    const target = document.createElement("div");
    const rows = pulse<readonly TableRow[]>([
      { label: "B", amount: "100000000000000000000.10" },
      { label: "A", amount: "2.5" },
      { label: "C", amount: "12.25" },
    ]);

    const cleanup = render(
      target,
      <Table
        columns={[
          { key: "label", header: "Label" },
          { key: "amount", header: "Amount", sortable: true, align: "right" },
        ]}
        rows={rows}
      />,
    );

    const headers = Array.from(target.querySelectorAll("th button"));

    headers[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const visibleRows = Array.from(
      target.querySelectorAll("tbody tr:not([hidden])"),
    ).map((row) => row.textContent ?? "");

    expect(visibleRows[0]).toContain("A");
    expect(visibleRows[1]).toContain("C");
    expect(visibleRows[2]).toContain("B");

    cleanup();
  });

  it("renders empty state when rows is empty", () => {
    const target = document.createElement("div");
    const rows = pulse<readonly TableRow[]>([]);

    const cleanup = render(
      target,
      <Table
        columns={[{ key: "label", header: "Label" }]}
        rows={rows}
        emptyState="No data available"
      />,
    );

    expect(target.textContent).toContain("No data available");

    rows.set([{ label: "Row A" }]);

    expect(target.textContent).not.toContain("No data available");
    expect(target.textContent).toContain("Row A");

    cleanup();
  });

  it("re-renders when rows pulse updates", () => {
    const target = document.createElement("div");
    const rows = pulse<readonly TableRow[]>([{ label: "Original" }]);

    const cleanup = render(
      target,
      <Table columns={[{ key: "label", header: "Label" }]} rows={rows} />,
    );

    expect(target.textContent).toContain("Original");

    rows.set([{ label: "Updated" }]);

    expect(target.textContent).not.toContain("Original");
    expect(target.textContent).toContain("Updated");

    cleanup();
  });

  it("uses a custom renderCell when provided", () => {
    const target = document.createElement("div");
    const rows = pulse<readonly TableRow[]>([{ id: "1", name: "Alice" }]);

    const cleanup = render(
      target,
      <Table
        columns={[
          {
            key: "name",
            header: "Name",
            renderCell: (row) => <strong>{String(row["name"])}</strong>,
          },
        ]}
        rows={rows}
      />,
    );

    const strong = target.querySelector("strong");

    expect(strong).not.toBeNull();
    expect(strong?.textContent).toBe("Alice");

    cleanup();
  });
});
