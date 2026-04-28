import { component } from "@ochairo/beat";

import {
  ExcelTable as HeadlessExcelTable,
  type ExcelTableCell,
  type ExcelTableCellPresentationState,
  type ExcelTableCellType,
  type ExcelTableCellValue,
  type ExcelTableColumn,
  type ExcelTableGrid,
  type ExcelTableProps,
  type ExcelTableRow,
  type ExcelTableSelection,
} from "../../headless/organisms/ExcelTable";

export type {
  ExcelTableCell,
  ExcelTableCellType,
  ExcelTableCellValue,
  ExcelTableColumn,
  ExcelTableGrid,
  ExcelTableProps,
  ExcelTableRow,
  ExcelTableSelection,
};

const containerStyle = [
  "display:block",
  "overflow:auto",
  "border:1px solid var(--beat-ui-color-border)",
  "border-radius:1rem",
  "background:var(--beat-ui-color-background-elevated)",
].join(";");

const tableStyle = [
  "width:100%",
  "border-collapse:separate",
  "border-spacing:0",
  "table-layout:fixed",
  "color:var(--beat-ui-color-text)",
].join(";");

const headerCellStyle = [
  "position:sticky",
  "top:0",
  "z-index:1",
  "padding:0.75rem 0.875rem",
  "border-bottom:1px solid var(--beat-ui-color-border)",
  "background:var(--beat-ui-color-background-subtle)",
  "font-weight:600",
  "text-align:left",
].join(";");

const rowHeaderCellStyle = [
  "position:sticky",
  "top:0",
  "z-index:1",
  "width:3rem",
  "padding:0.75rem 0.5rem",
  "border-right:1px solid var(--beat-ui-color-border)",
  "border-bottom:1px solid var(--beat-ui-color-border)",
  "background:var(--beat-ui-color-background-subtle)",
  "color:var(--beat-ui-color-text-muted)",
  "text-align:center",
].join(";");

const rowHeaderStyle = [
  "width:3rem",
  "padding:0.75rem 0.5rem",
  "border-right:1px solid var(--beat-ui-color-border)",
  "border-bottom:1px solid var(--beat-ui-color-border)",
  "background:var(--beat-ui-color-background-subtle)",
  "color:var(--beat-ui-color-text-muted)",
  "text-align:center",
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

const cellButtonBaseStyle = [
  "display:block",
  "width:100%",
  "min-height:2.5rem",
  "padding:0.625rem 0.75rem",
  "border:none",
  "background:transparent",
  "color:inherit",
  "font:inherit",
  "text-align:left",
  "outline:none",
  "cursor:cell",
].join(";");

const editWidgetStyle = [
  cellButtonBaseStyle,
  "cursor:text",
  "padding:0.55rem 0.7rem",
  `box-shadow:inset 0 0 0 2px var(--beat-ui-color-primary)`,
  "background:var(--beat-ui-color-background)",
].join(";");

const controlsStyle = [
  "display:flex",
  "flex-wrap:wrap",
  "gap:0.5rem",
  "padding:0.75rem",
  "border-bottom:1px solid var(--beat-ui-color-border)",
  "background:var(--beat-ui-color-background-subtle)",
].join(";");

const controlButtonStyle = [
  "padding:0.5rem 0.75rem",
  "border:1px solid var(--beat-ui-color-border)",
  "border-radius:0.75rem",
  "background:var(--beat-ui-color-background)",
  "color:var(--beat-ui-color-text)",
  "font:inherit",
  "cursor:pointer",
].join(";");

const resizeHandleStyle = [
  "position:absolute",
  "right:0",
  "top:0",
  "bottom:0",
  "width:5px",
  "cursor:col-resize",
  "user-select:none",
  "z-index:1",
].join(";");

function getCellTdStyle(isLastColumn: boolean): string {
  return [
    "padding:0",
    "border-bottom:1px solid var(--beat-ui-color-border)",
    ...(isLastColumn
      ? []
      : ["border-right:1px solid var(--beat-ui-color-border)"]),
  ].join(";");
}

function getCellButtonStyle(state: ExcelTableCellPresentationState): string {
  const textAlign = `text-align:${state.align ?? "left"}`;
  const background = `background:${
    state.backgroundColor ??
    (state.isSelected
      ? "var(--beat-ui-color-background-accent-soft)"
      : "transparent")
  }`;
  const color = `color:${state.textColor ?? "var(--beat-ui-color-text)"}`;
  const boxShadow = `box-shadow:${
    state.isAnchor
      ? `inset 0 0 0 2px ${state.outlineColor ?? "var(--beat-ui-color-primary)"}`
      : state.isSelected
        ? `inset 0 0 0 1px ${state.outlineColor ?? "var(--beat-ui-color-primary-hover)"}`
        : state.outlineColor
          ? `inset 0 0 0 1px ${state.outlineColor}`
          : "none"
  }`;

  return [textAlign, background, color, boxShadow].join(";");
}

export const ExcelTable = component<ExcelTableProps>((props) => {
  return (
    <HeadlessExcelTable
      {...props}
      styles={{
        container: containerStyle,
        table: tableStyle,
        headerCell: headerCellStyle,
        rowHeaderCell: rowHeaderCellStyle,
        rowHeader: rowHeaderStyle,
        sortButton: sortButtonStyle,
        cellButtonBase: cellButtonBaseStyle,
        editWidget: editWidgetStyle,
        controls: controlsStyle,
        controlButton: controlButtonStyle,
        resizeHandle: resizeHandleStyle,
        cellTd: getCellTdStyle,
        cellButton: getCellButtonStyle,
      }}
    />
  );
});
