import { For, component, onCleanup } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { Decimal } from "@ochairo/numbers";

import { createControllableState } from "../../../foundations";
import type { BeatUiState } from "../../../runtime";
import type { BeatUiAccessibilityProps } from "../../../foundations";
import type { BeatUiRenderable } from "../../../runtime";
import type { BeatUiTableSort, BeatUiTableSortDirection } from "./Table";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DataGridCellType =
  | "checkbox"
  | "date"
  | "link"
  | "number"
  | "radio"
  | "select"
  | "text"
  | "textarea"
  | "time";

export type DataGridCellValue = string | ReturnType<typeof Decimal>;

export interface DataGridCell {
  readonly backgroundColor?: string;
  readonly outlineColor?: string;
  readonly readOnly?: boolean;
  readonly textColor?: string;
  readonly value: DataGridCellValue;
}

export type DataGridRow = readonly DataGridCell[];

export type DataGridGrid = readonly DataGridRow[];

export interface DataGridColumn {
  readonly align?: "center" | "left" | "right";
  readonly cellOptions?: readonly string[];
  readonly cellType?: DataGridCellType;
  readonly header: BeatUiRenderable;
  readonly key: string;
  readonly sortable?: boolean;
  readonly width?: string;
}

export interface DataGridSelection {
  readonly anchorColumn: number;
  readonly anchorRow: number;
  readonly focusColumn: number;
  readonly focusRow: number;
}

export interface DataGridCellPresentationState {
  readonly align?: string | undefined;
  readonly backgroundColor?: string | undefined;
  readonly isAnchor: boolean;
  readonly isEditing: boolean;
  readonly isSelected: boolean;
  readonly outlineColor?: string | undefined;
  readonly textColor?: string | undefined;
}

export interface DataGridStyles {
  readonly cellButton?:
    | ((state: DataGridCellPresentationState) => string)
    | undefined;
  readonly cellButtonBase?: string | undefined;
  readonly cellTd?: ((isLastColumn: boolean) => string) | undefined;
  readonly container?: string | undefined;
  readonly controlButton?: string | undefined;
  readonly controls?: string | undefined;
  readonly editWidget?: string | undefined;
  readonly headerCell?: string | undefined;
  readonly resizeHandle?: string | undefined;
  readonly rowHeader?: string | undefined;
  readonly rowHeaderCell?: string | undefined;
  readonly sortButton?: string | undefined;
  readonly table?: string | undefined;
}

export interface DataGridProps extends BeatUiAccessibilityProps {
  readonly columns: readonly DataGridColumn[];
  readonly createColumn?: (columnIndex: number) => DataGridColumn;
  readonly defaultSort?: BeatUiTableSort;
  readonly defaultValue?: DataGridGrid;
  readonly onColumnsChange?: (columns: readonly DataGridColumn[]) => void;
  readonly onValueChange?: (grid: DataGridGrid) => void;
  readonly rowCount?: number;
  readonly showRowHeaders?: boolean;
  readonly showStructureControls?: boolean;
  readonly styles?: DataGridStyles;
  readonly value?: BeatUiState<DataGridGrid>;
}

// ─── Utility functions ────────────────────────────────────────────────────────

function createEmptyCell(): DataGridCell {
  return { value: "" };
}

function createEmptyRow(columnCount: number): DataGridRow {
  return Array.from({ length: columnCount }, () => createEmptyCell());
}

function normalizeCell(cell: DataGridCell | undefined): DataGridCell {
  return cell ?? createEmptyCell();
}

function normalizeGrid(
  grid: DataGridGrid | undefined,
  columnCount: number,
  rowCount: number,
): DataGridGrid {
  const sourceRows = grid ?? [];
  return Array.from(
    { length: Math.max(sourceRows.length, rowCount) },
    (_, rowIndex) => {
      const sourceRow = sourceRows[rowIndex] ?? [];
      return Array.from({ length: columnCount }, (_, columnIndex) =>
        normalizeCell(sourceRow[columnIndex]),
      );
    },
  );
}

function resolveRowCount(
  rowCount: number | undefined,
  grid: DataGridGrid | undefined,
): number {
  if (rowCount !== undefined) return rowCount;
  const existingRows = grid?.length ?? 0;
  return existingRows > 0 ? existingRows : 8;
}

export function formatCellValue(value: DataGridCellValue): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return value.toString();
}

function isDecimalLike(value: string): boolean {
  return /^-?\d+(?:\.\d+)?$/.test(value.trim());
}

function compareCellValues(
  left: DataGridCell,
  right: DataGridCell,
): number {
  const leftText = formatCellValue(left.value).trim();
  const rightText = formatCellValue(right.value).trim();

  if (isDecimalLike(leftText) && isDecimalLike(rightText)) {
    const leftDecimal = Decimal(leftText);
    const rightDecimal = Decimal(rightText);
    if (leftDecimal.lt(rightDecimal)) return -1;
    if (leftDecimal.gt(rightDecimal)) return 1;
    return 0;
  }

  return leftText.localeCompare(rightText, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function getSortIndicator(
  sort: BeatUiTableSort | null,
  columnKey: string,
): string {
  if (sort?.columnKey !== columnKey) return "";
  return sort.direction === "ascending" ? "↑" : "↓";
}

function getAriaSort(
  sort: BeatUiTableSort | null,
  columnKey: string,
): "ascending" | "descending" | "none" {
  if (sort?.columnKey !== columnKey) return "none";
  return sort.direction;
}

function getNextSort(
  currentSort: BeatUiTableSort | null,
  columnKey: string,
): BeatUiTableSort {
  const direction: BeatUiTableSortDirection =
    currentSort?.columnKey === columnKey &&
    currentSort.direction === "ascending"
      ? "descending"
      : "ascending";
  return { columnKey, direction };
}

function sortGrid(
  grid: DataGridGrid,
  columns: readonly DataGridColumn[],
  sort: BeatUiTableSort | null,
): DataGridGrid {
  if (sort === null) return grid;
  const columnIndex = columns.findIndex(
    (column) => column.key === sort.columnKey,
  );
  if (columnIndex === -1) return grid;
  const direction = sort.direction === "ascending" ? 1 : -1;
  return [...grid].sort((leftRow, rightRow) => {
    const leftCell = leftRow[columnIndex] ?? createEmptyCell();
    const rightCell = rightRow[columnIndex] ?? createEmptyCell();
    return compareCellValues(leftCell, rightCell) * direction;
  });
}

function parseClipboardGrid(text: string): readonly (readonly string[])[] {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((row, rowIndex, rows) => row !== "" || rowIndex < rows.length - 1)
    .map((row) => row.split("\t"));
}

function parseClipboardCellValue(value: string): DataGridCellValue {
  const trimmedValue = value.trim();
  if (trimmedValue !== "" && isDecimalLike(trimmedValue))
    return Decimal(trimmedValue);
  return value;
}

function isPrintableKey(event: KeyboardEvent): boolean {
  return (
    event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey
  );
}

function getSelectionBounds(selection: DataGridSelection): {
  readonly endColumn: number;
  readonly endRow: number;
  readonly startColumn: number;
  readonly startRow: number;
} {
  return {
    startRow: Math.min(selection.anchorRow, selection.focusRow),
    endRow: Math.max(selection.anchorRow, selection.focusRow),
    startColumn: Math.min(selection.anchorColumn, selection.focusColumn),
    endColumn: Math.max(selection.anchorColumn, selection.focusColumn),
  };
}

function serializeSelection(
  grid: DataGridGrid,
  selection: DataGridSelection,
): string {
  const bounds = getSelectionBounds(selection);
  const lines: string[] = [];
  for (
    let rowIndex = bounds.startRow;
    rowIndex <= bounds.endRow;
    rowIndex += 1
  ) {
    const row = grid[rowIndex] ?? [];
    const values: string[] = [];
    for (
      let columnIndex = bounds.startColumn;
      columnIndex <= bounds.endColumn;
      columnIndex += 1
    ) {
      values.push(
        formatCellValue((row[columnIndex] ?? createEmptyCell()).value),
      );
    }
    lines.push(values.join("\t"));
  }
  return lines.join("\n");
}

function applyPaste(
  grid: DataGridGrid,
  selection: DataGridSelection,
  pastedRows: readonly (readonly string[])[],
  columnCount: number,
): DataGridGrid {
  const nextGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
  const bounds = getSelectionBounds(selection);
  const pastedRowCount = pastedRows.length;
  const pastedColumnCount = Math.max(0, ...pastedRows.map((row) => row.length));
  const selectionRowCount = bounds.endRow - bounds.startRow + 1;
  const selectionColumnCount = bounds.endColumn - bounds.startColumn + 1;

  if (pastedRowCount === 0 || pastedColumnCount === 0) return nextGrid;

  const fillSelectedRange =
    (selectionRowCount > 1 || selectionColumnCount > 1) &&
    ((pastedRowCount === 1 && pastedColumnCount === 1) ||
      (selectionRowCount === pastedRowCount &&
        selectionColumnCount === pastedColumnCount) ||
      (selectionRowCount % pastedRowCount === 0 &&
        selectionColumnCount % pastedColumnCount === 0));

  const requiredRowCount = fillSelectedRange
    ? bounds.endRow + 1
    : bounds.startRow + pastedRowCount;

  while (nextGrid.length < requiredRowCount) {
    nextGrid.push([...createEmptyRow(columnCount)]);
  }

  if (fillSelectedRange) {
    for (
      let rowIndex = bounds.startRow;
      rowIndex <= bounds.endRow;
      rowIndex += 1
    ) {
      const targetRow = nextGrid[rowIndex];
      if (targetRow === undefined) continue;
      for (
        let columnIndex = bounds.startColumn;
        columnIndex <= bounds.endColumn;
        columnIndex += 1
      ) {
        if (columnIndex >= columnCount) continue;
        const sourceRow =
          pastedRows[(rowIndex - bounds.startRow) % pastedRowCount] ?? [];
        const sourceValue =
          sourceRow[(columnIndex - bounds.startColumn) % pastedColumnCount] ??
          "";
        const currentCell = targetRow[columnIndex] ?? createEmptyCell();
        if (currentCell.readOnly) continue;
        targetRow[columnIndex] = {
          ...currentCell,
          value: parseClipboardCellValue(sourceValue),
        };
      }
    }
    return nextGrid;
  }

  pastedRows.forEach((pastedRow, rowOffset) => {
    const targetRowIndex = bounds.startRow + rowOffset;
    const targetRow = nextGrid[targetRowIndex];
    if (targetRow === undefined) return;
    pastedRow.forEach((value, columnOffset) => {
      const targetColumnIndex = bounds.startColumn + columnOffset;
      if (targetColumnIndex >= columnCount) return;
      const currentCell = targetRow[targetColumnIndex] ?? createEmptyCell();
      if (currentCell.readOnly) return;
      targetRow[targetColumnIndex] = {
        ...currentCell,
        value: parseClipboardCellValue(value),
      };
    });
  });

  return nextGrid;
}

function getSpreadsheetColumnLabel(index: number): string {
  let value = index + 1;
  let label = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label;
}

function getCellCoordinatesFromEventTarget(
  target: EventTarget | null,
): { readonly columnIndex: number; readonly rowIndex: number } | null {
  if (!(target instanceof HTMLElement)) return null;
  const cellElement = target.closest<HTMLElement>("[data-row][data-column]");
  if (cellElement === null) return null;
  const rowValue = cellElement.dataset["row"];
  const columnValue = cellElement.dataset["column"];
  if (rowValue === undefined || columnValue === undefined) return null;
  const rowIndex = Number.parseInt(rowValue, 10);
  const columnIndex = Number.parseInt(columnValue, 10);
  if (Number.isNaN(rowIndex) || Number.isNaN(columnIndex)) return null;
  return { rowIndex, columnIndex };
}

function isCellSelected(
  selection: DataGridSelection | null,
  rowIndex: number,
  columnIndex: number,
): boolean {
  if (selection === null) return false;
  const bounds = getSelectionBounds(selection);
  return (
    rowIndex >= bounds.startRow &&
    rowIndex <= bounds.endRow &&
    columnIndex >= bounds.startColumn &&
    columnIndex <= bounds.endColumn
  );
}

function isActiveCell(
  selection: DataGridSelection | null,
  rowIndex: number,
  columnIndex: number,
): boolean {
  return (
    selection !== null &&
    selection.focusRow === rowIndex &&
    selection.focusColumn === columnIndex
  );
}

function moveSelection(
  selection: DataGridSelection,
  move: { readonly columnOffset: number; readonly rowOffset: number },
  rowCount: number,
  columnCount: number,
  extend: boolean,
): DataGridSelection {
  const nextRow = Math.max(
    0,
    Math.min(rowCount - 1, selection.focusRow + move.rowOffset),
  );
  const nextColumn = Math.max(
    0,
    Math.min(columnCount - 1, selection.focusColumn + move.columnOffset),
  );
  if (extend)
    return { ...selection, focusRow: nextRow, focusColumn: nextColumn };
  return {
    anchorRow: nextRow,
    anchorColumn: nextColumn,
    focusRow: nextRow,
    focusColumn: nextColumn,
  };
}

function getCursorMove(
  key: string,
): { readonly columnOffset: number; readonly rowOffset: number } | null {
  switch (key) {
    case "ArrowUp":
      return { rowOffset: -1, columnOffset: 0 };
    case "ArrowDown":
      return { rowOffset: 1, columnOffset: 0 };
    case "ArrowLeft":
      return { rowOffset: 0, columnOffset: -1 };
    case "ArrowRight":
      return { rowOffset: 0, columnOffset: 1 };
    default:
      return null;
  }
}

function isEditingCell(
  editingCell: {
    readonly columnIndex: number;
    readonly rowIndex: number;
  } | null,
  rowIndex: number,
  columnIndex: number,
): boolean {
  return (
    editingCell !== null &&
    editingCell.rowIndex === rowIndex &&
    editingCell.columnIndex === columnIndex
  );
}

function isSameEditingCell(
  left: { readonly columnIndex: number; readonly rowIndex: number } | null,
  right: { readonly columnIndex: number; readonly rowIndex: number } | null,
): boolean {
  return (
    left?.rowIndex === right?.rowIndex &&
    left?.columnIndex === right?.columnIndex
  );
}

function getCellKey(rowIndex: number, columnIndex: number): string {
  return `${rowIndex}:${columnIndex}`;
}

function applyCellValue(
  grid: DataGridGrid,
  rowIndex: number,
  columnIndex: number,
  nextValue: DataGridCellValue,
): DataGridGrid {
  return grid.map((row, currentRowIndex) => {
    if (currentRowIndex !== rowIndex) return row.map((cell) => ({ ...cell }));
    return row.map((cell, currentColumnIndex) =>
      currentColumnIndex === columnIndex
        ? { ...cell, value: nextValue }
        : { ...cell },
    );
  });
}

function clearSelection(
  grid: DataGridGrid,
  selection: DataGridSelection,
): DataGridGrid {
  const bounds = getSelectionBounds(selection);
  return grid.map((row, rowIndex) =>
    row.map((cell, columnIndex) => {
      const selected =
        rowIndex >= bounds.startRow &&
        rowIndex <= bounds.endRow &&
        columnIndex >= bounds.startColumn &&
        columnIndex <= bounds.endColumn;
      return selected
        ? cell.readOnly
          ? { ...cell }
          : { ...cell, value: "" }
        : { ...cell };
    }),
  );
}

function insertRow(
  grid: DataGridGrid,
  columnCount: number,
  afterRowIndex: number,
): DataGridGrid {
  const nextGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
  nextGrid.splice(afterRowIndex + 1, 0, [...createEmptyRow(columnCount)]);
  return nextGrid;
}

function removeRows(
  grid: DataGridGrid,
  selection: DataGridSelection,
  columnCount: number,
): DataGridGrid {
  const bounds = getSelectionBounds(selection);
  const nextGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
  nextGrid.splice(bounds.startRow, bounds.endRow - bounds.startRow + 1);
  return nextGrid.length > 0 ? nextGrid : [[...createEmptyRow(columnCount)]];
}

function insertColumn(
  grid: DataGridGrid,
  afterColumnIndex: number,
): DataGridGrid {
  return grid.map((row) => {
    const nextRow = row.map((cell) => ({ ...cell }));
    nextRow.splice(afterColumnIndex + 1, 0, createEmptyCell());
    return nextRow;
  });
}

function removeColumns(
  grid: DataGridGrid,
  selection: DataGridSelection,
): DataGridGrid {
  const bounds = getSelectionBounds(selection);
  return grid.map((row) => {
    const nextRow = row.map((cell) => ({ ...cell }));
    nextRow.splice(
      bounds.startColumn,
      bounds.endColumn - bounds.startColumn + 1,
    );
    return nextRow.length > 0 ? nextRow : [createEmptyCell()];
  });
}

function getNextTabSelection(
  grid: DataGridGrid,
  selection: DataGridSelection,
  backwards: boolean,
): DataGridSelection {
  const rowCount = grid.length;
  const columnCount = grid[0]?.length ?? 0;
  if (rowCount === 0 || columnCount === 0) return selection;

  let rowIndex = selection.focusRow;
  let columnIndex = selection.focusColumn;
  const currentPositionKey = `${rowIndex}:${columnIndex}`;

  for (let step = 0; step < rowCount * columnCount; step += 1) {
    if (backwards) {
      if (columnIndex > 0) {
        columnIndex -= 1;
      } else if (rowIndex > 0) {
        rowIndex -= 1;
        columnIndex = columnCount - 1;
      }
    } else if (columnIndex < columnCount - 1) {
      columnIndex += 1;
    } else if (rowIndex < rowCount - 1) {
      rowIndex += 1;
      columnIndex = 0;
    }

    if (`${rowIndex}:${columnIndex}` === currentPositionKey) break;
    if (!(grid[rowIndex]?.[columnIndex]?.readOnly ?? false)) {
      return {
        anchorRow: rowIndex,
        anchorColumn: columnIndex,
        focusRow: rowIndex,
        focusColumn: columnIndex,
      };
    }
  }

  return selection;
}

function applyCellPresentationStyles(
  element: HTMLElement,
  styleStr: string,
): void {
  const parts = styleStr.split(";");
  for (const part of parts) {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) continue;
    const prop = part.slice(0, colonIdx).trim();
    const val = part.slice(colonIdx + 1).trim();
    if (prop !== "" && val !== "") {
      element.style.setProperty(prop, val);
    }
  }
}

// ─── Internal cell view ───────────────────────────────────────────────────────

interface DataGridEditingCell {
  readonly columnIndex: number;
  readonly rowIndex: number;
}

interface DataGridEditingTarget extends DataGridEditingCell {
  readonly value: string;
}

interface DataGridCommitOptions {
  readonly focusContainer?: boolean;
  readonly moveDown?: boolean;
  readonly target?: DataGridEditingTarget;
}

interface DataGridEditActivationOptions {
  readonly deferWhenSwitching?: boolean;
}

interface DataGridCellViewProps {
  readonly align?: "center" | "left" | "right";
  readonly cellButtonBaseStyle?: string | undefined;
  readonly cellButtonStyle?:
    | ((state: DataGridCellPresentationState) => string)
    | undefined;
  readonly cellOptions?: readonly string[];
  readonly cellType?: DataGridCellType;
  readonly columnIndex: number;
  readonly editingCell: BeatUiState<DataGridEditingCell | null>;
  readonly editingValue: BeatUiState<string>;
  readonly editWidgetStyle?: string | undefined;
  readonly onActivateEdit: (
    rowIndex: number,
    columnIndex: number,
    options?: DataGridEditActivationOptions,
  ) => void;
  readonly onCancelEdit: () => void;
  readonly onCommitEdit: (options?: DataGridCommitOptions) => void;
  readonly onDirectCommit: (
    rowIndex: number,
    columnIndex: number,
    value: string,
  ) => void;
  readonly onExtendSelection: (rowIndex: number, columnIndex: number) => void;
  readonly onNavigateEdit: (backwards: boolean) => void;
  readonly onRegisterButton: (
    rowIndex: number,
    columnIndex: number,
    element: HTMLButtonElement,
  ) => void;
  readonly onRegisterInput: (
    rowIndex: number,
    columnIndex: number,
    element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  ) => void;
  readonly onSelect: (
    rowIndex: number,
    columnIndex: number,
    extend: boolean,
  ) => void;
  readonly onStartEdit: (rowIndex: number, columnIndex: number) => void;
  readonly onUnregisterButton: (rowIndex: number, columnIndex: number) => void;
  readonly onUnregisterInput: (rowIndex: number, columnIndex: number) => void;
  readonly row: BeatUiState<DataGridRow>;
  readonly rowIndex: number;
  readonly selection: BeatUiState<DataGridSelection | null>;
}

const DataGridCellView = component<DataGridCellViewProps>((props) => {
  const syncPresentation = (element: HTMLButtonElement): void => {
    const cell = normalizeCell(props.row.get()?.[props.columnIndex]);
    const selection = props.selection.get();
    const selected = isCellSelected(
      selection,
      props.rowIndex,
      props.columnIndex,
    );
    const active = isActiveCell(selection, props.rowIndex, props.columnIndex);
    const editing = isEditingCell(
      props.editingCell.get(),
      props.rowIndex,
      props.columnIndex,
    );

    if (props.cellButtonStyle !== undefined) {
      const state: DataGridCellPresentationState = {
        isSelected: selected,
        isAnchor: active,
        isEditing: editing,
        outlineColor: cell.outlineColor,
        backgroundColor: cell.backgroundColor,
        textColor: cell.textColor,
        align: props.align,
      };
      applyCellPresentationStyles(element, props.cellButtonStyle(state));
    }
  };

  const cellType = props.cellType ?? "text";
  const editWidgetInitialStyle = `display:none;${props.editWidgetStyle ?? ""}`;

  const sharedEditHandlers = {
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();
        props.onNavigateEdit(event.shiftKey);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        props.onCancelEdit();
      }
    },
    onBlur: () => {
      props.onCommitEdit({
        focusContainer: false,
        target: {
          rowIndex: props.rowIndex,
          columnIndex: props.columnIndex,
          value: props.editingValue.get(),
        },
      });
    },
  };

  const renderEditWidget = () => {
    if (cellType === "checkbox") return null;

    if (cellType === "select" || cellType === "radio") {
      return (
        <select
          id={`grid-cell-${props.rowIndex}-${props.columnIndex}`}
          data-row={String(props.rowIndex)}
          data-column={String(props.columnIndex)}
          style={editWidgetInitialStyle}
          aria-label={`Cell ${props.rowIndex + 1},${props.columnIndex + 1}`}
          ref={(node) => {
            if (node instanceof HTMLSelectElement) {
              props.onRegisterInput(props.rowIndex, props.columnIndex, node);
              onCleanup(() =>
                props.onUnregisterInput(props.rowIndex, props.columnIndex),
              );
            }
          }}
          onChange={(event: Event) => {
            const target = event.currentTarget;
            if (!(target instanceof HTMLSelectElement)) return;
            props.editingValue.set(target.value);
            props.onCommitEdit({
              target: {
                rowIndex: props.rowIndex,
                columnIndex: props.columnIndex,
                value: target.value,
              },
            });
          }}
          onKeyDown={sharedEditHandlers.onKeyDown}
          onBlur={sharedEditHandlers.onBlur}
        >
          <option value=""></option>
          {(props.cellOptions ?? []).map((opt) => (
            <option value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (cellType === "textarea") {
      return (
        <textarea
          id={`grid-cell-${props.rowIndex}-${props.columnIndex}`}
          data-row={String(props.rowIndex)}
          data-column={String(props.columnIndex)}
          style={`${editWidgetInitialStyle};resize:none;height:6rem`}
          aria-label={`Cell ${props.rowIndex + 1},${props.columnIndex + 1}`}
          ref={(node) => {
            if (node instanceof HTMLTextAreaElement) {
              props.onRegisterInput(props.rowIndex, props.columnIndex, node);
              onCleanup(() =>
                props.onUnregisterInput(props.rowIndex, props.columnIndex),
              );
            }
          }}
          onInput={(event: Event) => {
            const target = event.currentTarget;
            if (!(target instanceof HTMLTextAreaElement)) return;
            props.editingValue.set(target.value);
          }}
          onKeyDown={(event: KeyboardEvent) => {
            if (event.key === "Tab") {
              event.preventDefault();
              event.stopPropagation();
              props.onNavigateEdit(event.shiftKey);
              return;
            }
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              props.onCancelEdit();
            }
          }}
          onBlur={sharedEditHandlers.onBlur}
        />
      );
    }

    const inputType =
      cellType === "number"
        ? "number"
        : cellType === "date"
          ? "date"
          : cellType === "time"
            ? "time"
            : "text";

    return (
      <input
        type={inputType}
        id={`grid-cell-${props.rowIndex}-${props.columnIndex}`}
        value={props.editingValue}
        data-row={String(props.rowIndex)}
        data-column={String(props.columnIndex)}
        style={editWidgetInitialStyle}
        aria-label={`Cell ${props.rowIndex + 1},${props.columnIndex + 1}`}
        ref={(node) => {
          if (node instanceof HTMLInputElement) {
            props.onRegisterInput(props.rowIndex, props.columnIndex, node);
            onCleanup(() =>
              props.onUnregisterInput(props.rowIndex, props.columnIndex),
            );
          }
        }}
        onInput={(event: Event) => {
          const target = event.currentTarget;
          if (!(target instanceof HTMLInputElement)) return;
          props.editingValue.set(target.value);
        }}
        onKeyDown={(event: KeyboardEvent) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            props.onCommitEdit({
              moveDown: true,
              target: {
                rowIndex: props.rowIndex,
                columnIndex: props.columnIndex,
                value: props.editingValue.get(),
              },
            });
            return;
          }
          if (event.key === "Tab") {
            event.preventDefault();
            event.stopPropagation();
            props.onNavigateEdit(event.shiftKey);
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            props.onCancelEdit();
          }
        }}
        onBlur={sharedEditHandlers.onBlur}
      />
    );
  };

  return (
    <div style="display:block;width:100%;">
      <button
        type="button"
        style={[
          props.cellButtonBaseStyle ?? "",
          props.cellButtonStyle?.({
            isSelected: false,
            isAnchor: false,
            isEditing: false,
            align: props.align,
          }) ?? "",
        ]
          .filter(Boolean)
          .join(";")}
        data-row={String(props.rowIndex)}
        data-column={String(props.columnIndex)}
        ref={(node) => {
          if (!(node instanceof HTMLButtonElement)) return;
          props.onRegisterButton(props.rowIndex, props.columnIndex, node);
          syncPresentation(node);
          onCleanup(() =>
            props.onUnregisterButton(props.rowIndex, props.columnIndex),
          );
          onCleanup(props.row.on(() => syncPresentation(node)));
          onCleanup(props.selection.on(() => syncPresentation(node)));
          onCleanup(props.editingCell.on(() => syncPresentation(node)));
        }}
        onClick={(event: MouseEvent) => {
          if (cellType === "checkbox") {
            const current = formatCellValue(
              normalizeCell(props.row.get()?.[props.columnIndex]).value,
            );
            const checked = current === "true" || current === "1";
            props.onDirectCommit(
              props.rowIndex,
              props.columnIndex,
              checked ? "false" : "true",
            );
          }
          props.onSelect(props.rowIndex, props.columnIndex, event.shiftKey);
        }}
        onDblClick={() => {
          if (cellType === "checkbox") return;
          if (normalizeCell(props.row.get()?.[props.columnIndex]).readOnly)
            return;
          setTimeout(() => {
            props.onActivateEdit(props.rowIndex, props.columnIndex, {
              deferWhenSwitching: true,
            });
          }, 0);
        }}
        onKeyDown={(event: KeyboardEvent) => {
          if (event.key !== "Enter" && event.key !== "F2") return;
          event.preventDefault();
          if (
            cellType === "checkbox" ||
            normalizeCell(props.row.get()?.[props.columnIndex]).readOnly
          )
            return;
          props.onStartEdit(props.rowIndex, props.columnIndex);
        }}
        onMouseDown={(event: MouseEvent) => {
          props.onSelect(props.rowIndex, props.columnIndex, event.shiftKey);
        }}
        onMouseEnter={(event: MouseEvent) => {
          if (event.buttons !== 1) return;
          props.onExtendSelection(props.rowIndex, props.columnIndex);
        }}
      />
      {renderEditWidget()}
    </div>
  );
});

// ─── DataGrid component ─────────────────────────────────────────────────────

export const DataGrid = component<DataGridProps>((props) => {
  const initialColumnCount = props.columns.length;
  const resolvedRowCount = resolveRowCount(
    props.rowCount,
    props.value?.get() ?? props.defaultValue,
  );
  const initialGrid = normalizeGrid(
    props.defaultValue,
    initialColumnCount,
    resolvedRowCount,
  );
  const state = createControllableState<DataGridGrid>({
    defaultValue: initialGrid,
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });
  const columnsState = pulse<readonly DataGridColumn[]>([...props.columns]);
  const selection = pulse<DataGridSelection | null>(
    state.state.get()[0]?.[0] === undefined
      ? null
      : {
          anchorRow: 0,
          anchorColumn: 0,
          focusRow: 0,
          focusColumn: 0,
        },
  );
  let latestSelection = selection.get();
  const editingCell = pulse<DataGridEditingCell | null>(null);
  const editingValue = pulse("");
  const sort = pulse<BeatUiTableSort | null>(props.defaultSort ?? null);
  const headerRefs = new Map<string, HTMLTableCellElement>();
  const indicatorRefs = new Map<string, Text>();

  let resizeColumnKey: string | null = null;
  let resizeStartX = 0;
  let resizeStartWidth = 0;

  const handleResizeMouseDown = (
    columnKey: string,
    clientX: number,
    thElement: HTMLTableCellElement,
  ): void => {
    resizeColumnKey = columnKey;
    resizeStartX = clientX;
    resizeStartWidth = thElement.offsetWidth;

    const onMouseMove = (e: MouseEvent): void => {
      if (resizeColumnKey === null) return;
      const delta = e.clientX - resizeStartX;
      const newWidth = Math.max(40, resizeStartWidth + delta);
      const th = headerRefs.get(resizeColumnKey);
      if (th !== null && th !== undefined) th.style.width = `${newWidth}px`;
    };

    const onMouseUp = (e: MouseEvent): void => {
      if (resizeColumnKey === null) {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        return;
      }
      const delta = e.clientX - resizeStartX;
      const newWidth = Math.max(40, resizeStartWidth + delta);
      const key = resizeColumnKey;
      resizeColumnKey = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      const updatedColumns = columnsState
        .get()
        .map((col) =>
          col.key === key ? { ...col, width: `${newWidth}px` } : col,
        );
      setColumns(updatedColumns);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const cellElements = new Map<
    string,
    {
      button?: HTMLButtonElement;
      editElement?: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    }
  >();
  const focusTimers = new Map<string, ReturnType<typeof setTimeout>>();
  let nextGeneratedColumnId = props.columns.length;
  let container: HTMLDivElement | undefined;

  const getColumnCount = (): number => columnsState.get().length;

  const createGeneratedColumn = (columnIndex: number): DataGridColumn => {
    if (props.createColumn !== undefined)
      return props.createColumn(columnIndex);
    nextGeneratedColumnId += 1;
    return {
      key: `column-${nextGeneratedColumnId}`,
      header: getSpreadsheetColumnLabel(columnIndex),
      sortable: true,
    };
  };

  const setColumns = (nextColumns: readonly DataGridColumn[]): void => {
    columnsState.set(nextColumns);
    props.onColumnsChange?.(nextColumns);
    const currentSort = sort.get();
    if (
      currentSort !== null &&
      !nextColumns.some((column) => column.key === currentSort.columnKey)
    ) {
      sort.set(null);
    }
  };

  const syncHeaders = (nextSort: BeatUiTableSort | null): void => {
    for (const column of columnsState.get()) {
      const headerCell = headerRefs.get(column.key);
      const indicator = indicatorRefs.get(column.key);
      headerCell?.setAttribute("aria-sort", getAriaSort(nextSort, column.key));
      if (indicator !== undefined)
        indicator.textContent = getSortIndicator(nextSort, column.key);
    }
  };

  onCleanup(sort.on((event) => syncHeaders(event.currentValue)));
  onCleanup(
    selection.on((event) => {
      latestSelection = event.currentValue;
    }),
  );

  const setSelectionState = (
    nextSelection: DataGridSelection | null,
  ): void => {
    latestSelection = nextSelection;
    selection.set(nextSelection);
  };

  const clearFocusTimer = (key: string): void => {
    const timer = focusTimers.get(key);
    if (timer === undefined) return;
    clearTimeout(timer);
    focusTimers.delete(key);
  };

  const syncCellEditMode = (rowIndex: number, columnIndex: number): void => {
    const key = getCellKey(rowIndex, columnIndex);
    const elements = cellElements.get(key);
    if (elements === undefined) return;
    const editing = isEditingCell(editingCell.get(), rowIndex, columnIndex);

    if (elements.button !== undefined) {
      elements.button.style.display = editing ? "none" : "block";
    }

    if (elements.editElement === undefined) return;
    elements.editElement.style.display = editing ? "block" : "none";

    if (!editing) {
      clearFocusTimer(key);
      elements.editElement.removeAttribute("data-row");
      elements.editElement.removeAttribute("data-column");
      return;
    }

    elements.editElement.setAttribute("data-row", String(rowIndex));
    elements.editElement.setAttribute("data-column", String(columnIndex));
    clearFocusTimer(key);
    focusTimers.set(
      key,
      setTimeout(() => {
        focusTimers.delete(key);
        if (!isEditingCell(editingCell.get(), rowIndex, columnIndex)) return;
        const currentElements = cellElements.get(key);
        if (currentElements?.editElement === undefined) return;
        currentElements.editElement.focus();
        if (currentElements.editElement instanceof HTMLInputElement) {
          currentElements.editElement.select();
        }
      }, 0),
    );
  };

  const syncCellButtonValue = (rowIndex: number, columnIndex: number): void => {
    const key = getCellKey(rowIndex, columnIndex);
    const button = cellElements.get(key)?.button;
    if (button === undefined) return;

    const cellValue = formatCellValue(
      normalizeCell(state.state.get()[rowIndex]?.[columnIndex]).value,
    );
    const cellType = columnsState.get()[columnIndex]?.cellType ?? "text";

    if (cellType === "checkbox") {
      const checked = cellValue === "true" || cellValue === "1";
      button.textContent = checked ? "✓" : "";
      button.style.textAlign = "center";
      button.style.fontSize = "1.125rem";
      button.style.color = checked
        ? "var(--beat-ui-color-primary)"
        : "var(--beat-ui-color-text-muted)";
    } else if (cellType === "link") {
      button.textContent = "";
      if (cellValue !== "") {
        const mdMatch = /^\[([^\]]*)\]\(([^)]+)\)$/.exec(cellValue);
        const label = mdMatch?.[1] ?? null;
        const href = mdMatch?.[2] ?? cellValue;
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        if (label !== null && label !== "") {
          anchor.textContent = label;
        } else {
          try {
            anchor.textContent = new URL(href).hostname.replace(/^www\./, "");
          } catch {
            anchor.textContent = href;
          }
        }
        anchor.style.cssText =
          "color:var(--beat-ui-color-primary);text-decoration:underline;pointer-events:auto;";
        button.appendChild(anchor);
      }
    } else if (cellType === "textarea") {
      button.textContent = cellValue.split("\n")[0] ?? cellValue;
    } else {
      button.textContent = cellValue;
    }
  };

  const syncAllCellButtonValues = (): void => {
    for (const key of cellElements.keys()) {
      const [rowValue, columnValue] = key.split(":");
      const rowIndex = Number.parseInt(rowValue ?? "", 10);
      const columnIndex = Number.parseInt(columnValue ?? "", 10);
      if (Number.isNaN(rowIndex) || Number.isNaN(columnIndex)) continue;
      syncCellButtonValue(rowIndex, columnIndex);
    }
  };

  onCleanup(state.state.on(() => syncAllCellButtonValues()));

  onCleanup(
    editingCell.on((event) => {
      const previousValue = event.previousValue;
      const currentValue = event.currentValue;
      if (previousValue !== null)
        syncCellEditMode(previousValue.rowIndex, previousValue.columnIndex);
      if (
        currentValue !== null &&
        !isSameEditingCell(previousValue, currentValue)
      ) {
        syncCellEditMode(currentValue.rowIndex, currentValue.columnIndex);
      }
    }),
  );

  onCleanup(() => {
    for (const key of focusTimers.keys()) clearFocusTimer(key);
  });

  const registerButton = (
    rowIndex: number,
    columnIndex: number,
    element: HTMLButtonElement,
  ): void => {
    const key = getCellKey(rowIndex, columnIndex);
    const existing = cellElements.get(key) ?? {};
    existing.button = element;
    cellElements.set(key, existing);
    syncCellButtonValue(rowIndex, columnIndex);
    syncCellEditMode(rowIndex, columnIndex);
  };

  const registerInput = (
    rowIndex: number,
    columnIndex: number,
    element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  ): void => {
    const key = getCellKey(rowIndex, columnIndex);
    const existing = cellElements.get(key) ?? {};
    existing.editElement = element;
    cellElements.set(key, existing);
    syncCellEditMode(rowIndex, columnIndex);
  };

  const unregisterButton = (rowIndex: number, columnIndex: number): void => {
    const key = getCellKey(rowIndex, columnIndex);
    const existing = cellElements.get(key);
    if (existing === undefined) return;
    delete existing.button;
    if (existing.editElement === undefined) {
      cellElements.delete(key);
      clearFocusTimer(key);
    }
  };

  const unregisterInput = (rowIndex: number, columnIndex: number): void => {
    const key = getCellKey(rowIndex, columnIndex);
    const existing = cellElements.get(key);
    if (existing === undefined) return;
    delete existing.editElement;
    clearFocusTimer(key);
    if (existing.button === undefined) cellElements.delete(key);
  };

  const handleDirectCommit = (
    rowIndex: number,
    columnIndex: number,
    value: string,
  ): void => {
    const cell = state.state.get()[rowIndex]?.[columnIndex];
    if (cell?.readOnly) return;
    state.setValue(
      applyCellValue(
        state.state.get(),
        rowIndex,
        columnIndex,
        parseClipboardCellValue(value),
      ),
    );
    syncCellButtonValue(rowIndex, columnIndex);
  };

  const handleSelect = (
    rowIndex: number,
    columnIndex: number,
    extend: boolean,
  ): void => {
    const currentEditingCell = editingCell.get();
    if (
      currentEditingCell !== null &&
      !isEditingCell(currentEditingCell, rowIndex, columnIndex)
    ) {
      handleCommitEdit({
        focusContainer: false,
        target: {
          rowIndex: currentEditingCell.rowIndex,
          columnIndex: currentEditingCell.columnIndex,
          value: editingValue.get(),
        },
      });
    }
    const currentSelection = latestSelection;
    setSelectionState(
      extend && currentSelection !== null
        ? { ...currentSelection, focusRow: rowIndex, focusColumn: columnIndex }
        : {
            anchorRow: rowIndex,
            anchorColumn: columnIndex,
            focusRow: rowIndex,
            focusColumn: columnIndex,
          },
    );
  };

  const handleStartEdit = (rowIndex: number, columnIndex: number): void => {
    const columns = columnsState.get();
    const cell = state.state.get()[rowIndex]?.[columnIndex];
    if (columnIndex >= columns.length || cell === undefined || cell.readOnly)
      return;
    editingCell.set({ rowIndex, columnIndex });
    editingValue.set(formatCellValue(cell.value));
  };

  const handleActivateEdit = (
    rowIndex: number,
    columnIndex: number,
    options?: DataGridEditActivationOptions,
  ): void => {
    const currentEditingCell = editingCell.get();
    const activate = (): void => {
      setSelectionState({
        anchorRow: rowIndex,
        anchorColumn: columnIndex,
        focusRow: rowIndex,
        focusColumn: columnIndex,
      });
      handleStartEdit(rowIndex, columnIndex);
    };
    if (
      currentEditingCell !== null &&
      !isEditingCell(currentEditingCell, rowIndex, columnIndex)
    ) {
      handleCommitEdit({
        focusContainer: false,
        target: {
          rowIndex: currentEditingCell.rowIndex,
          columnIndex: currentEditingCell.columnIndex,
          value: editingValue.get(),
        },
      });
      if (options?.deferWhenSwitching === true) {
        queueMicrotask(activate);
        return;
      }
    }
    activate();
  };

  const handleReplaceEdit = (
    rowIndex: number,
    columnIndex: number,
    initialValue: string,
  ): void => {
    const cell = state.state.get()[rowIndex]?.[columnIndex];
    if (cell === undefined || cell.readOnly) return;
    editingCell.set({ rowIndex, columnIndex });
    editingValue.set(initialValue);
  };

  const handleCancelEdit = (): void => {
    editingCell.set(null);
    container?.focus();
  };

  const handleCommitEdit = (options?: DataGridCommitOptions): void => {
    const currentEditingCell = editingCell.get();
    const targetCell =
      options?.target === undefined
        ? currentEditingCell === null
          ? null
          : { ...currentEditingCell, value: editingValue.get() }
        : options.target;

    if (currentEditingCell === null || targetCell === null) return;
    if (!isSameEditingCell(currentEditingCell, targetCell)) return;

    const currentCellValue =
      state.state.get()[targetCell.rowIndex]?.[targetCell.columnIndex];
    if (currentCellValue?.readOnly) {
      editingCell.set(null);
      container?.focus();
      return;
    }

    state.setValue(
      applyCellValue(
        state.state.get(),
        targetCell.rowIndex,
        targetCell.columnIndex,
        parseClipboardCellValue(targetCell.value),
      ),
    );
    syncCellButtonValue(targetCell.rowIndex, targetCell.columnIndex);
    editingCell.set(null);

    if (options?.moveDown === true) {
      const rowCount = state.state.get().length;
      const nextRow = Math.min(targetCell.rowIndex + 1, rowCount - 1);
      const nextSelection = {
        anchorRow: nextRow,
        anchorColumn: targetCell.columnIndex,
        focusRow: nextRow,
        focusColumn: targetCell.columnIndex,
      };
      setSelectionState(nextSelection);
      cellElements
        .get(getCellKey(nextRow, targetCell.columnIndex))
        ?.button?.focus({ preventScroll: true });
      return;
    }
    if (options?.focusContainer !== false) container?.focus();
  };

  const handleNavigateEdit = (backwards: boolean): void => {
    const currentEditingCell = editingCell.get();
    if (currentEditingCell === null) return;
    const currentSelection = latestSelection ?? {
      anchorRow: currentEditingCell.rowIndex,
      anchorColumn: currentEditingCell.columnIndex,
      focusRow: currentEditingCell.rowIndex,
      focusColumn: currentEditingCell.columnIndex,
    };
    const nextSelection = getNextTabSelection(
      state.state.get(),
      currentSelection,
      backwards,
    );
    handleCommitEdit({
      focusContainer: false,
      target: {
        rowIndex: currentEditingCell.rowIndex,
        columnIndex: currentEditingCell.columnIndex,
        value: editingValue.get(),
      },
    });
    setSelectionState(nextSelection);
    if (
      nextSelection.focusRow !== currentEditingCell.rowIndex ||
      nextSelection.focusColumn !== currentEditingCell.columnIndex
    ) {
      handleActivateEdit(nextSelection.focusRow, nextSelection.focusColumn);
    }
  };

  const handleExtendSelection = (
    rowIndex: number,
    columnIndex: number,
  ): void => {
    const currentSelection = latestSelection;
    if (currentSelection === null) {
      handleSelect(rowIndex, columnIndex, false);
      return;
    }
    setSelectionState({
      ...currentSelection,
      focusRow: rowIndex,
      focusColumn: columnIndex,
    });
  };

  const handleCopy = (event: ClipboardEvent): void => {
    const currentSelection = latestSelection;
    if (currentSelection === null) return;
    event.preventDefault();
    event.clipboardData?.setData(
      "text/plain",
      serializeSelection(state.state.get(), currentSelection),
    );
  };

  const handlePaste = (event: ClipboardEvent): void => {
    const currentSelection = latestSelection;
    const text = event.clipboardData?.getData("text/plain");
    if (currentSelection === null || text === undefined || text === "") return;
    event.preventDefault();
    const nextGrid = applyPaste(
      normalizeGrid(state.state.get(), getColumnCount(), resolvedRowCount),
      currentSelection,
      parseClipboardGrid(text),
      getColumnCount(),
    );
    state.setValue(nextGrid, event);
  };

  const handleAddRow = (): void => {
    const currentSelection = latestSelection;
    if (currentSelection === null) return;
    const bounds = getSelectionBounds(currentSelection);
    const nextGrid = insertRow(
      state.state.get(),
      getColumnCount(),
      bounds.endRow,
    );
    const nextRowIndex = bounds.endRow + 1;
    state.setValue(nextGrid);
    setSelectionState({
      anchorRow: nextRowIndex,
      anchorColumn: currentSelection.focusColumn,
      focusRow: nextRowIndex,
      focusColumn: currentSelection.focusColumn,
    });
    container?.focus();
  };

  const handleRemoveRows = (): void => {
    const currentSelection = latestSelection;
    if (currentSelection === null) return;
    const nextGrid = removeRows(
      state.state.get(),
      currentSelection,
      getColumnCount(),
    );
    const bounds = getSelectionBounds(currentSelection);
    const nextRowIndex = Math.min(bounds.startRow, nextGrid.length - 1);
    const nextColumnIndex = Math.min(
      currentSelection.focusColumn,
      getColumnCount() - 1,
    );
    state.setValue(nextGrid);
    setSelectionState({
      anchorRow: nextRowIndex,
      anchorColumn: nextColumnIndex,
      focusRow: nextRowIndex,
      focusColumn: nextColumnIndex,
    });
    container?.focus();
  };

  const handleAddColumn = (): void => {
    const currentSelection = latestSelection;
    if (currentSelection === null) return;
    const currentColumns = columnsState.get();
    const bounds = getSelectionBounds(currentSelection);
    const nextColumnIndex = bounds.endColumn + 1;
    const nextColumns = [...currentColumns];
    nextColumns.splice(
      nextColumnIndex,
      0,
      createGeneratedColumn(nextColumnIndex),
    );
    setColumns(nextColumns);
    state.setValue(insertColumn(state.state.get(), bounds.endColumn));
    setSelectionState({
      anchorRow: currentSelection.focusRow,
      anchorColumn: nextColumnIndex,
      focusRow: currentSelection.focusRow,
      focusColumn: nextColumnIndex,
    });
    container?.focus();
  };

  const handleRemoveColumns = (): void => {
    const currentSelection = latestSelection;
    if (currentSelection === null) return;
    const currentColumns = columnsState.get();
    const bounds = getSelectionBounds(currentSelection);
    const nextColumns = [...currentColumns];
    nextColumns.splice(
      bounds.startColumn,
      bounds.endColumn - bounds.startColumn + 1,
    );
    const resolvedColumns =
      nextColumns.length > 0 ? nextColumns : [createGeneratedColumn(0)];
    const nextGrid = removeColumns(state.state.get(), currentSelection);
    const nextColumnIndex = Math.min(
      bounds.startColumn,
      resolvedColumns.length - 1,
    );
    const nextRowIndex = Math.min(
      currentSelection.focusRow,
      nextGrid.length - 1,
    );
    setColumns(resolvedColumns);
    state.setValue(nextGrid);
    setSelectionState({
      anchorRow: nextRowIndex,
      anchorColumn: nextColumnIndex,
      focusRow: nextRowIndex,
      focusColumn: nextColumnIndex,
    });
    container?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (editingCell.get() !== null) return;
    const currentSelection = latestSelection;
    if (currentSelection === null) return;

    const focusedCellType =
      columnsState.get()[currentSelection.focusColumn]?.cellType ?? "text";

    if (event.key === "Enter") {
      event.preventDefault();
      if (focusedCellType !== "checkbox") {
        handleStartEdit(
          currentSelection.focusRow,
          currentSelection.focusColumn,
        );
      } else {
        const rowCount = state.state.get().length;
        const nextRow = Math.min(currentSelection.focusRow + 1, rowCount - 1);
        const nextSel = {
          anchorRow: nextRow,
          anchorColumn: currentSelection.focusColumn,
          focusRow: nextRow,
          focusColumn: currentSelection.focusColumn,
        };
        setSelectionState(nextSel);
        cellElements
          .get(getCellKey(nextRow, currentSelection.focusColumn))
          ?.button?.focus({ preventScroll: true });
      }
      return;
    }

    if (event.key === "F2") {
      event.preventDefault();
      if (focusedCellType !== "checkbox")
        handleStartEdit(
          currentSelection.focusRow,
          currentSelection.focusColumn,
        );
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const nextSelection = getNextTabSelection(
        state.state.get(),
        currentSelection,
        event.shiftKey,
      );
      setSelectionState(nextSelection);
      cellElements
        .get(getCellKey(nextSelection.focusRow, nextSelection.focusColumn))
        ?.button?.focus({ preventScroll: true });
      return;
    }

    if (event.key === " " && focusedCellType === "checkbox") {
      event.preventDefault();
      const current = formatCellValue(
        normalizeCell(
          state.state.get()[currentSelection.focusRow]?.[
            currentSelection.focusColumn
          ],
        ).value,
      );
      const checked = current === "true" || current === "1";
      handleDirectCommit(
        currentSelection.focusRow,
        currentSelection.focusColumn,
        checked ? "false" : "true",
      );
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      state.setValue(
        clearSelection(state.state.get(), currentSelection),
        event,
      );
      return;
    }

    const nonTextTypes: readonly DataGridCellType[] = [
      "checkbox",
      "select",
      "radio",
      "date",
      "time",
    ];
    if (isPrintableKey(event) && !nonTextTypes.includes(focusedCellType)) {
      event.preventDefault();
      handleReplaceEdit(
        currentSelection.focusRow,
        currentSelection.focusColumn,
        event.key,
      );
      return;
    }

    const move = getCursorMove(event.key);
    if (move === null) return;

    event.preventDefault();
    const nextSelection = moveSelection(
      currentSelection,
      move,
      state.state.get().length,
      getColumnCount(),
      event.shiftKey,
    );
    setSelectionState(nextSelection);
    cellElements
      .get(getCellKey(nextSelection.focusRow, nextSelection.focusColumn))
      ?.button?.focus({ preventScroll: true });
  };

  const columnCount = columnsState.get().length;

  return (
    <div
      id={props.id}
      class={props.class}
      aria-label={props.ariaLabel}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
      style={props.styles?.container}
      tabIndex={0}
      ref={(node) => {
        if (node instanceof HTMLDivElement) container = node;
      }}
      onCopy={handleCopy}
      onKeyDown={handleKeyDown}
      onMouseDown={(event: MouseEvent) => {
        const coordinates = getCellCoordinatesFromEventTarget(event.target);
        if (coordinates === null) return;
        handleSelect(
          coordinates.rowIndex,
          coordinates.columnIndex,
          event.shiftKey,
        );
      }}
      onPaste={handlePaste}
    >
      {props.showStructureControls !== false ? (
        <div style={props.styles?.controls}>
          <button
            type="button"
            aria-label="Add row"
            style={props.styles?.controlButton}
            onClick={handleAddRow}
          >
            Row +
          </button>
          <button
            type="button"
            aria-label="Remove row"
            style={props.styles?.controlButton}
            onClick={handleRemoveRows}
          >
            Row -
          </button>
          <button
            type="button"
            aria-label="Add column"
            style={props.styles?.controlButton}
            onClick={handleAddColumn}
          >
            Column +
          </button>
          <button
            type="button"
            aria-label="Remove column"
            style={props.styles?.controlButton}
            onClick={handleRemoveColumns}
          >
            Column -
          </button>
        </div>
      ) : null}
      <table style={props.styles?.table}>
        <thead>
          <tr>
            {props.showRowHeaders !== false ? (
              <th style={props.styles?.rowHeaderCell}>#</th>
            ) : null}
            <For each={columnsState}>
              {(columnPulse) => {
                const column = columnPulse.get();
                return (
                  <th
                    scope="col"
                    aria-sort={getAriaSort(sort.get(), column.key)}
                    style={[
                      "position:relative",
                      props.styles?.headerCell,
                      column.width !== undefined
                        ? `width:${column.width}`
                        : undefined,
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
                          const nextSort = getNextSort(sort.get(), column.key);
                          sort.set(nextSort);
                          state.setValue(
                            sortGrid(
                              normalizeGrid(
                                state.state.get(),
                                getColumnCount(),
                                resolvedRowCount,
                              ),
                              columnsState.get(),
                              nextSort,
                            ),
                          );
                        }}
                      >
                        <span>{column.header}</span>
                        <span
                          aria-hidden={true}
                          ref={(node) => {
                            if (node instanceof Text)
                              indicatorRefs.set(column.key, node);
                          }}
                        >
                          {getSortIndicator(sort.get(), column.key)}
                        </span>
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                    <div
                      aria-hidden={true}
                      style={
                        props.styles?.resizeHandle ??
                        "position:absolute;right:0;top:0;bottom:0;width:5px;cursor:col-resize;user-select:none;z-index:1"
                      }
                      onMouseDown={(e: MouseEvent) => {
                        e.preventDefault();
                        const th = headerRefs.get(column.key);
                        if (th instanceof HTMLTableCellElement)
                          handleResizeMouseDown(column.key, e.clientX, th);
                      }}
                    />
                  </th>
                );
              }}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={state.state}>
            {(rowPulse, rowIndex) => (
              <tr>
                {props.showRowHeaders !== false ? (
                  <th scope="row" style={props.styles?.rowHeader}>
                    {rowIndex + 1}
                  </th>
                ) : null}
                <For each={columnsState}>
                  {(columnPulse, columnIndex) => (
                    <td
                      style={
                        props.styles?.cellTd?.(
                          columnIndex === columnCount - 1,
                        ) ?? ""
                      }
                    >
                      <DataGridCellView
                        row={rowPulse}
                        rowIndex={rowIndex}
                        columnIndex={columnIndex}
                        editingCell={editingCell}
                        editingValue={editingValue}
                        onActivateEdit={handleActivateEdit}
                        onCancelEdit={handleCancelEdit}
                        onCommitEdit={handleCommitEdit}
                        onDirectCommit={handleDirectCommit}
                        onNavigateEdit={handleNavigateEdit}
                        onRegisterButton={registerButton}
                        onRegisterInput={registerInput}
                        selection={selection}
                        onExtendSelection={handleExtendSelection}
                        onSelect={handleSelect}
                        onStartEdit={handleStartEdit}
                        onUnregisterButton={unregisterButton}
                        onUnregisterInput={unregisterInput}
                        cellButtonBaseStyle={props.styles?.cellButtonBase}
                        cellButtonStyle={props.styles?.cellButton}
                        editWidgetStyle={props.styles?.editWidget}
                        {...(() => {
                          const col = columnPulse.get();
                          return {
                            ...(col.align !== undefined
                              ? { align: col.align }
                              : {}),
                            ...(col.cellType !== undefined
                              ? { cellType: col.cellType }
                              : {}),
                            ...(col.cellOptions !== undefined
                              ? { cellOptions: col.cellOptions }
                              : {}),
                          };
                        })()}
                      />
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
});
