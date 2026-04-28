import { For, Show, component, onCleanup } from "@ochairo/beat";
import { pulse, type Pulse } from "@ochairo/pulse";

import type { BeatUiAccessibilityProps } from "../../../foundations";
import type { BeatUiRenderable } from "../../../runtime";

// ─── Utilities ───────────────────────────────────────────────────────────────

export type TableRow = Record<string, unknown>;

export type BeatUiTableSortDirection = "ascending" | "descending";

export interface BeatUiTableSort {
  readonly columnKey: string;
  readonly direction: BeatUiTableSortDirection;
}

export interface TableColumn {
  readonly align?: "left" | "center" | "right";
  readonly cellStyle?: string;
  readonly header: BeatUiRenderable;
  readonly headerAlign?: "left" | "center" | "right";
  readonly headerStyle?: string;
  readonly key: string;
  readonly renderCell?: (row: TableRow, index: number) => BeatUiRenderable;
  readonly sortable?: boolean;
  readonly sortValue?: (row: TableRow) => unknown;
  readonly width?: string;
}

export function formatTableValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
}

export function getTableAriaSort(
  sort: BeatUiTableSort | null,
  columnKey: string,
): "ascending" | "descending" | "none" {
  if (sort === null || sort.columnKey !== columnKey) return "none";
  return sort.direction;
}

export function getTableSortIndicator(
  sort: BeatUiTableSort | null,
  columnKey: string,
): string {
  if (sort === null || sort.columnKey !== columnKey) return "↕";
  return sort.direction === "ascending" ? "↑" : "↓";
}

const NUMERIC_STRING_RE = /^-?\d+(\.\d+)?$/;

function compareValues(av: unknown, bv: unknown): number {
  const as = String(av);
  const bs = String(bv);
  if (NUMERIC_STRING_RE.test(as) && NUMERIC_STRING_RE.test(bs)) {
    const negA = as.startsWith("-");
    const negB = bs.startsWith("-");
    if (negA !== negB) return negA ? -1 : 1;
    const absA = negA ? as.slice(1) : as;
    const absB = negB ? bs.slice(1) : bs;
    const [intA = "", decA = ""] = absA.split(".");
    const [intB = "", decB = ""] = absB.split(".");
    let cmp = 0;
    if (intA.length !== intB.length) {
      cmp = intA.length < intB.length ? -1 : 1;
    } else {
      cmp = intA < intB ? -1 : intA > intB ? 1 : 0;
    }
    if (cmp === 0) cmp = decA < decB ? -1 : decA > decB ? 1 : 0;
    return negA ? -cmp : cmp;
  }
  return as < bs ? -1 : as > bs ? 1 : 0;
}

export function sortTableRows(
  rows: readonly TableRow[],
  columns: readonly TableColumn[],
  sort: BeatUiTableSort | null,
): readonly TableRow[] {
  if (sort === null) return rows;
  const column = columns.find((c) => c.key === sort.columnKey);
  const sorted = [...rows].sort((a, b) => {
    const av = column?.sortValue?.(a) ?? a[sort.columnKey];
    const bv = column?.sortValue?.(b) ?? b[sort.columnKey];
    if (av === bv) return 0;
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    return compareValues(av, bv);
  });
  return sort.direction === "descending" ? sorted.reverse() : sorted;
}

// ─── Styles interface ─────────────────────────────────────────────────────────

export interface TableStyles {
  readonly root?: string | undefined;
  readonly headerCell?: string | undefined;
  readonly sortButton?: string | undefined;
  readonly cell?: string | undefined;
  readonly row?: string | undefined;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TableProps extends BeatUiAccessibilityProps {
  readonly columns: readonly TableColumn[];
  readonly defaultSort?: BeatUiTableSort;
  readonly emptyState?: BeatUiRenderable;
  readonly headerAlign?: "left" | "center" | "right";
  readonly onRowClick?: (row: TableRow) => void;
  readonly rows: Pulse<readonly TableRow[]>;
  readonly styles?: TableStyles;
}

// ─── Internal sub-component ───────────────────────────────────────────────────

interface TableCellTextProps {
  readonly column: TableColumn;
  readonly row: Pulse<TableRow>;
}

const TableCellText = component<TableCellTextProps>((props) => {
  const text = pulse(
    formatTableValue(
      props.column.sortValue?.(props.row.get()) ??
        props.row.get()[props.column.key],
    ),
  );

  onCleanup(
    props.row.on((event) => {
      text.set(
        formatTableValue(
          props.column.sortValue?.(event.currentValue) ??
            event.currentValue[props.column.key],
        ),
      );
    }),
  );

  return text;
});

// ─── Table component ──────────────────────────────────────────────────────────

export const Table = component<TableProps>((props) => {
  const sort = pulse<BeatUiTableSort | null>(props.defaultSort ?? null);
  const renderedRows = pulse<readonly TableRow[]>(
    sortTableRows(props.rows.get(), props.columns, sort.get()),
  );
  const headerRefs = new Map<string, HTMLTableCellElement>();
  const indicatorRefs = new Map<string, Text>();
  const onRowClick = props.onRowClick;
  const rowStyle =
    props.styles?.row ??
    (onRowClick !== undefined ? "cursor:pointer" : undefined);

  const syncHeaders = (nextSort: BeatUiTableSort | null): void => {
    for (const column of props.columns) {
      const headerCell = headerRefs.get(column.key);
      const indicator = indicatorRefs.get(column.key);

      headerCell?.setAttribute(
        "aria-sort",
        getTableAriaSort(nextSort, column.key),
      );

      if (indicator !== undefined) {
        indicator.textContent = getTableSortIndicator(nextSort, column.key);
      }
    }
  };

  onCleanup(
    sort.on((event) => {
      renderedRows.set(
        sortTableRows(props.rows.get(), props.columns, event.currentValue),
      );
      syncHeaders(event.currentValue);
    }),
  );

  onCleanup(
    props.rows.on((event) => {
      renderedRows.set(
        sortTableRows(event.currentValue, props.columns, sort.get()),
      );
    }),
  );

  return (
    <table id={props.id} class={props.class} style={props.styles?.root}>
      <thead>
        <tr>
          {props.columns.map((column) => (
            <th
              scope="col"
              aria-sort={getTableAriaSort(sort.get(), column.key)}
              style={[
                props.styles?.headerCell,
                `text-align:${column.headerAlign ?? props.headerAlign ?? "left"}`,
                column.width !== undefined
                  ? `width:${column.width}`
                  : undefined,
                column.headerStyle,
              ]
                .filter(Boolean)
                .join(";")}
              ref={(node) => {
                if (node instanceof HTMLTableCellElement) {
                  headerRefs.set(column.key, node);
                  syncHeaders(sort.get());
                }
              }}
            >
              {column.sortable === true ? (
                <button
                  type="button"
                  style={props.styles?.sortButton}
                  onClick={() => {
                    const currentSort = sort.get();
                    const nextSort: BeatUiTableSort =
                      currentSort?.columnKey === column.key &&
                      currentSort.direction === "ascending"
                        ? { columnKey: column.key, direction: "descending" }
                        : { columnKey: column.key, direction: "ascending" };

                    sort.set(nextSort);
                  }}
                >
                  <span>{column.header}</span>
                  <span
                    aria-hidden={true}
                    ref={(node) => {
                      if (node instanceof Text) {
                        indicatorRefs.set(column.key, node);
                      }
                    }}
                  >
                    {getTableSortIndicator(sort.get(), column.key)}
                  </span>
                </button>
              ) : (
                <span>{column.header}</span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <For each={renderedRows}>
          {(rowPulse, rowIndex) => (
            <tr
              style={rowStyle}
              onClick={
                onRowClick !== undefined
                  ? () => {
                      onRowClick(rowPulse.get());
                    }
                  : undefined
              }
            >
              {props.columns.map((column) => (
                <td
                  style={[
                    props.styles?.cell,
                    `text-align:${column.align ?? "left"}`,
                    column.cellStyle,
                  ]
                    .filter(Boolean)
                    .join(";")}
                >
                  {column.renderCell !== undefined ? (
                    column.renderCell(rowPulse.get(), rowIndex)
                  ) : (
                    <TableCellText column={column} row={rowPulse} />
                  )}
                </td>
              ))}
            </tr>
          )}
        </For>
        <Show when={renderedRows} mapValue={(rows) => rows.length === 0}>
          <tr>
            <td colSpan={props.columns.length} style={props.styles?.cell}>
              {props.emptyState ?? "No rows"}
            </td>
          </tr>
        </Show>
      </tbody>
    </table>
  );
});
