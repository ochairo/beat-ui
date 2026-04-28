import { component } from "@ochairo/beat";

import {
  Table as HeadlessTable,
  type BeatUiTableSort,
  type BeatUiTableSortDirection,
  type TableColumn,
  type TableProps,
  type TableRow,
} from "../../headless/organisms/Table";

export type {
  BeatUiTableSort,
  BeatUiTableSortDirection,
  TableColumn,
  TableProps,
  TableRow,
};

const tableStyle = [
  "width:100%",
  "border-collapse:separate",
  "border-spacing:0",
  "overflow:hidden",
  "border:1px solid var(--beat-ui-color-border)",
  "border-radius:1rem",
  "background:var(--beat-ui-color-background-elevated)",
  "color:var(--beat-ui-color-text)",
].join(";");

const headerCellStyle = [
  "padding:0.875rem 1rem",
  "border-bottom:1px solid var(--beat-ui-color-border)",
  "background:var(--beat-ui-color-background-subtle)",
].join(";");

const sortButtonStyle = [
  "display:flex",
  "align-items:center",
  "justify-content:space-between",
  "gap:0.5rem",
  "width:100%",
  "padding:0",
  "border:none",
  "background:transparent",
  "color:inherit",
  "font:inherit",
  "cursor:pointer",
].join(";");

const cellStyle = [
  "padding:0.875rem 1rem",
  "border-bottom:1px solid var(--beat-ui-color-border)",
  "vertical-align:top",
].join(";");

export const Table = component<TableProps>((props) => {
  return (
    <HeadlessTable
      {...props}
      styles={{
        root: tableStyle,
        headerCell: headerCellStyle,
        sortButton: sortButtonStyle,
        cell: cellStyle,
        ...(props.onRowClick !== undefined ? { row: "cursor:pointer" } : {}),
      }}
    />
  );
});
