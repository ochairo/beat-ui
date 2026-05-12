import { Show, component, onCleanup } from "@ochairo/beat";
import { Decimal, Int } from "@ochairo/numbers";
import { pulse, type Pulse, type ReadonlyPulse } from "@ochairo/pulse";

import type {
  BeatUiAccessibilityProps,
  BeatUiContentProps,
} from "../../../foundations";
import {
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconClock,
} from "../../../icons";
import type { BeatUiRenderable, BeatUiState } from "../../../runtime";
import { HlDateInput } from "../composites/DateInput";
import { HlDatePicker } from "../composites/DatePicker";
import { HlMultiSelect } from "../composites/MultiSelect";
import { HlNumberInput } from "../composites/NumberInput";
import { HlSelect } from "../composites/Select";
import { HlTextInput } from "../composites/TextInput";
import { HlTimeInput } from "../composites/TimeInput";
import { HlTimePicker } from "../composites/TimePicker";
import { HlCheckBox } from "../primitives/CheckBox";
import { HlInput } from "../primitives/Input";
import { HlTextArea } from "../primitives/TextArea";

export interface SheetCellCoord {
  readonly rowIndex: number;
  readonly columnIndex: number;
}

export interface SheetCellSelection {
  readonly anchorRowIndex: number;
  readonly anchorColumnIndex: number;
  readonly focusRowIndex: number;
  readonly focusColumnIndex: number;
}

export interface SheetColumnHeaderSelection {
  readonly anchorColumnIndex: number;
  readonly focusColumnIndex: number;
}

export type SheetCellEditorKind =
  | "checkbox"
  | "date"
  | "number"
  | "text"
  | "textarea"
  | "time";

export type SheetCellDataType =
  | "text"
  | "textarea"
  | "integer"
  | "decimal"
  | `decimal(${number},${number})`
  | "date"
  | "time"
  | "dateTime"
  | "checkbox"
  | "select"
  | "multiselect";

export interface SheetCellOption {
  readonly children?: readonly SheetCellOption[];
  readonly disabled?: boolean;
  readonly label: string;
  readonly isSelectable?: boolean;
  readonly value: string;
}

export type SheetDataAttributes = Readonly<
  Record<`data-${string}`, string | number | boolean | undefined>
>;

export type SheetCellAlign = "left" | "right";

export type SheetEditValueBehavior = "freeze" | "sync-until-dirty";

export interface SheetEditorRenderProps {
  readonly align: SheetCellAlign;
  readonly value: BeatUiState<string>;
  readonly commit: (nextValue?: string) => void;
  readonly cancel: () => void;
}

export interface SheetCellRegistration {
  readonly commitEdit?: (() => void) | undefined;
  readonly editable: boolean;
  readonly getValue: () => unknown;
  readonly parseValue: (text: string) => unknown;
  readonly serializeValue: (value: unknown) => string;
  readonly setValue?: (value: unknown) => void;
}

export interface SheetController {
  readonly activeCell: Pulse<SheetCellCoord | null>;
  readonly editingCell: Pulse<SheetCellCoord | null>;
  readonly headerSelection: Pulse<SheetColumnHeaderSelection | null>;
  readonly selection: Pulse<SheetCellSelection | null>;
  readonly activateCell: (
    coord: SheetCellCoord,
    options?: {
      readonly extend?: boolean;
      readonly focus?: boolean;
    },
  ) => void;
  readonly beginEdit: (coord?: SheetCellCoord) => void;
  readonly beginColumnHeaderSelectionDrag: (
    columnIndex: number,
    options?: {
      readonly extend?: boolean;
      readonly focus?: boolean;
    },
  ) => void;
  readonly beginSelectionDrag: (
    coord: SheetCellCoord,
    options?: {
      readonly extend?: boolean;
      readonly focus?: boolean;
    },
  ) => void;
  readonly cancelEdit: (options?: { readonly focus?: boolean }) => void;
  readonly clearActiveCell: () => void;
  readonly endEdit: (options?: { readonly focus?: boolean }) => void;
  readonly endSelectionDrag: () => void;
  readonly handleCellKeyDown: (
    coord: SheetCellCoord,
    event: KeyboardEvent,
  ) => void;
  readonly handleCopy: (event: ClipboardEvent) => void;
  readonly handlePaste: (event: ClipboardEvent) => void;
  readonly isCellActive: (coord: SheetCellCoord) => boolean;
  readonly isCellEditing: (coord: SheetCellCoord) => boolean;
  readonly isCellSelected: (coord: SheetCellCoord) => boolean;
  readonly isColumnHeaderSelected: (columnIndex: number) => boolean;
  readonly getVisibleColumnIndices: () => readonly number[];
  readonly moveActiveCell: (
    rowDelta: number,
    columnDelta: number,
    options?: { readonly extend?: boolean },
  ) => void;
  readonly registerCell: (
    coord: SheetCellCoord,
    registration: SheetCellRegistration,
  ) => () => void;
  readonly registerCellElement: (
    coord: SheetCellCoord,
    element: HTMLElement,
  ) => () => void;
  readonly registerRootElement: (element: HTMLElement) => () => void;
  readonly selectAll: (options?: { readonly focus?: boolean }) => void;
  readonly updateColumnHeaderSelectionDrag: (columnIndex: number) => void;
  readonly updateSelectionDrag: (coord: SheetCellCoord) => void;
}

export interface SheetRootProps
  extends BeatUiAccessibilityProps, BeatUiContentProps {
  readonly controller?: SheetController | undefined;
  readonly class?: string | undefined;
  readonly dataAttributes?: SheetDataAttributes | undefined;
  readonly role?: "grid" | "table" | undefined;
  readonly style?: string | undefined;
  readonly title?: string | undefined;
}

export interface SheetSectionProps extends BeatUiContentProps {
  readonly class?: string | undefined;
  readonly dataAttributes?: SheetDataAttributes | undefined;
  readonly style?: string | undefined;
  readonly title?: string | undefined;
}

export interface SheetRowProps extends BeatUiContentProps {
  readonly class?: string | undefined;
  readonly dataAttributes?: SheetDataAttributes | undefined;
  readonly ref?: ((node: Element) => void) | undefined;
  readonly style?: string | undefined;
  readonly title?: string | undefined;
}

export interface SheetHeaderCellProps
  extends BeatUiAccessibilityProps, BeatUiContentProps {
  readonly ariaSort?: string | undefined;
  readonly class?: string | undefined;
  readonly controller?: SheetController | undefined;
  readonly columnIndex?: number | undefined;
  readonly dataAttributes?: SheetDataAttributes | undefined;
  readonly ref?: ((node: HTMLElement) => void) | undefined;
  readonly style?: string | undefined;
  readonly title?: string | undefined;
}

export interface SheetCellProps
  extends BeatUiAccessibilityProps, BeatUiContentProps {
  readonly align?: SheetCellAlign | undefined;
  readonly class?: string | undefined;
  readonly contentVisibility?: ReadonlyPulse<boolean> | undefined;
  readonly controller?: SheetController | undefined;
  readonly dataAttributes?: SheetDataAttributes | undefined;
  readonly dataType?: SheetCellDataType | undefined;
  readonly editValueBehavior?: SheetEditValueBehavior | undefined;
  readonly editable?: boolean | undefined;
  readonly editor?: SheetCellEditorKind | undefined;
  readonly onValueChange?: ((value: unknown) => void) | undefined;
  readonly options?: readonly SheetCellOption[] | undefined;
  readonly parseValue?: ((text: string) => unknown) | undefined;
  readonly placeholder?: string | undefined;
  readonly readOnly?: boolean | undefined;
  readonly renderEditor?:
    | ((props: SheetEditorRenderProps) => BeatUiRenderable)
    | undefined;
  readonly renderValue?: ((value: unknown) => BeatUiRenderable) | undefined;
  readonly rowIndex: number;
  readonly columnIndex: number;
  readonly serializeValue?: ((value: unknown) => string) | undefined;
  readonly style?: string | undefined;
  readonly title?: string | undefined;
  readonly value?: unknown;
  readonly valueState?: BeatUiState<unknown> | undefined;
}

interface SheetElementWithController extends HTMLElement {
  __beatUiSheetController?: SheetController | undefined;
}

const SHEET_ROOT_STYLE =
  "display:flex;flex-direction:column;min-width:max-content;outline:none";
const SHEET_SECTION_STYLE =
  "display:flex;flex-direction:column;width:100%;min-width:100%";
const SHEET_ROW_STYLE =
  "display:flex;align-items:stretch;min-width:max-content";
const SHEET_HEADER_STYLE =
  "position:relative;display:flex;align-items:stretch;min-width:0;box-sizing:border-box";
const SHEET_CELL_STYLE =
  "position:relative;display:flex;align-items:stretch;min-width:0;box-sizing:border-box";
const SHEET_SURFACE_STYLE =
  "display:flex;align-items:center;justify-content:flex-start;width:100%;height:100%;min-width:0;padding:0.5rem 0.625rem;border:none;background:transparent;color:inherit;font:inherit;text-align:left;box-sizing:border-box;outline:none";
const SHEET_EDITOR_WRAPPER_STYLE =
  "display:flex;align-items:stretch;width:100%;height:100%;min-width:0;box-sizing:border-box";
const DEFAULT_INPUT_STYLE =
  "display:block;width:100%;height:100%;min-width:0;box-sizing:border-box;padding:0.5rem 0.625rem;border:none;background:transparent;color:inherit;font:inherit;outline:none";
const DEFAULT_TEXT_AREA_STYLE =
  "display:block;width:100%;height:100%;min-width:0;box-sizing:border-box;padding:0.5rem 0.625rem;border:none;background:transparent;color:inherit;font:inherit;outline:none;resize:none";
const DEFAULT_CHECKBOX_STYLE =
  "display:flex;align-items:center;gap:0.5rem;width:100%;height:100%;padding:0.5rem 0.625rem;box-sizing:border-box";
const DEFAULT_CHECKBOX_INPUT_STYLE =
  "width:1rem;height:1rem;margin:0;accent-color:var(--beat-ui-color-primary)";
const DEFAULT_NUMBER_ROOT_STYLE =
  "display:grid;grid-template-columns:minmax(0,1fr) auto;width:100%;height:100%;min-width:0";
const DEFAULT_NUMBER_STEPPER_STYLE =
  "display:flex;flex-direction:column;border-left:1px solid var(--beat-ui-color-border);background:var(--beat-ui-color-background-subtle)";
const DEFAULT_NUMBER_STEP_BUTTON_STYLE =
  "display:flex;align-items:center;justify-content:center;width:1.5rem;flex:1;border:none;background:transparent;color:var(--beat-ui-color-text-muted);cursor:pointer";
const DEFAULT_PICKER_ROOT_STYLE =
  "position:relative;width:100%;height:100%;min-width:0";
const DEFAULT_PICKER_INPUT_WRAPPER_STYLE =
  "display:flex;align-items:stretch;width:100%;height:100%;min-width:0;border:none;background:transparent";
const DEFAULT_PICKER_INPUT_STYLE =
  "position:relative;z-index:var(--beat-ui-z-index-inline);width:100%;height:100%;min-width:0;padding:0.5rem 0.625rem;border:none;background:transparent;color:transparent;caret-color:inherit;font:inherit;outline:none;box-sizing:border-box";
const DEFAULT_PICKER_OVERLAY_STYLE =
  "position:absolute;inset:0;display:flex;align-items:center;padding:0.5rem 0.625rem;color:inherit;pointer-events:none;font:inherit";
const DEFAULT_PICKER_PLACEHOLDER_STYLE =
  "color:var(--beat-ui-color-text-muted)";
const DEFAULT_PICKER_DIGIT_STYLE = "color:inherit";
const DEFAULT_PICKER_ICON_BUTTON_STYLE =
  "display:flex;align-items:center;justify-content:center;width:2rem;border:none;background:transparent;color:var(--beat-ui-color-text-muted);cursor:pointer";
const DEFAULT_PICKER_DIALOG_STYLE =
  "position:absolute;top:calc(100% + 0.25rem);right:0;z-index:var(--beat-ui-z-index-popover);padding:0.5rem;border:1px solid var(--beat-ui-color-border);border-radius:0.75rem;background:var(--beat-ui-color-background-elevated);box-shadow:0 1px 0 var(--beat-ui-color-border-strong)";
const DEFAULT_DATE_PICKER_ROOT_STYLE =
  "display:flex;flex-direction:column;gap:0.5rem;min-width:14rem;color:inherit;font:inherit;user-select:none";
const DEFAULT_DATE_PICKER_HEADER_STYLE =
  "display:flex;align-items:center;justify-content:space-between;gap:0.5rem";
const DEFAULT_DATE_PICKER_TITLE_STYLE =
  "flex:1;font-size:0.9rem;font-weight:600;text-align:center";
const DEFAULT_DATE_PICKER_NAV_BUTTON_STYLE =
  "display:flex;align-items:center;justify-content:center;width:1.75rem;height:1.75rem;border:none;border-radius:0.375rem;background:transparent;color:var(--beat-ui-color-text-muted);font-size:1.1rem;cursor:pointer";
const DEFAULT_DATE_PICKER_GRID_STYLE =
  "display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:0.125rem;text-align:center";
const DEFAULT_DATE_PICKER_WEEKDAY_STYLE =
  "padding:0.25rem 0;font-size:0.75rem;font-weight:600;color:var(--beat-ui-color-text-muted)";
const DEFAULT_TIME_PICKER_ROOT_STYLE =
  "display:flex;flex-direction:column;color:inherit;font:inherit;user-select:none";
const DEFAULT_TIME_PICKER_COLUMNS_STYLE = "display:flex;gap:0.25rem";
const DEFAULT_TIME_PICKER_COLUMN_STYLE =
  "display:flex;flex-direction:column;align-items:stretch;min-width:3rem;max-height:12rem;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--beat-ui-color-border) transparent";
const DEFAULT_TIME_PICKER_COLUMN_LABEL_STYLE =
  "position:sticky;top:0;padding:0.25rem 0;font-size:0.7rem;font-weight:600;color:var(--beat-ui-color-text-muted);text-align:center;background:var(--beat-ui-color-background-elevated)";
const DEFAULT_SELECT_TRIGGER_STYLE =
  "display:flex;align-items:center;justify-content:space-between;width:100%;height:100%;min-width:0;padding:0.5rem 0.625rem;border:none;background:transparent;color:inherit;font:inherit;text-align:left;outline:none;box-sizing:border-box";
const DEFAULT_SELECT_CHEVRON_STYLE =
  "margin-left:0.5rem;color:var(--beat-ui-color-text-muted);transition:transform 120ms ease";
const DEFAULT_SELECT_MENU_STYLE =
  "position:absolute;top:calc(100% + 0.25rem);left:0;right:0;max-height:14rem;overflow:auto;padding:0.375rem;border:1px solid var(--beat-ui-color-border);border-radius:0.75rem;background:var(--beat-ui-color-background-elevated);color:inherit;box-shadow:0 1px 0 var(--beat-ui-color-border-strong);z-index:var(--beat-ui-z-index-popover)";
const DEFAULT_SELECT_SEARCH_STYLE =
  "display:block;width:100%;margin:0 0 0.375rem;padding:0.5rem 0.625rem;border:1px solid var(--beat-ui-color-border);border-radius:0.5rem;background:var(--beat-ui-color-background);color:inherit;font:inherit;box-sizing:border-box;outline:none";
const DEFAULT_MULTI_SELECT_CHECKBOX_STYLE =
  "pointer-events:none;margin-right:0.5rem;accent-color:var(--beat-ui-color-primary)";

const DECIMAL_DATA_TYPE_PATTERN = /^decimal\((\d+)\s*,\s*(\d+)\)$/i;

type SheetResolvedDataTypeKind =
  | "text"
  | "textarea"
  | "integer"
  | "decimal"
  | "date"
  | "time"
  | "dateTime"
  | "checkbox"
  | "select"
  | "multiselect"
  | "number";

interface SheetResolvedDataType {
  readonly kind: SheetResolvedDataTypeKind;
  readonly precision?: number | undefined;
  readonly scale?: number | undefined;
}

function joinStyles(...values: Array<string | undefined>): string | undefined {
  const next = values.filter((value) => value !== undefined && value !== "");
  return next.length > 0 ? next.join(";") : undefined;
}

function resolveDataAttributes(
  dataAttributes: SheetDataAttributes | undefined,
): Record<string, string> {
  const resolved: Record<string, string> = {};

  if (dataAttributes === undefined) {
    return resolved;
  }

  for (const [name, value] of Object.entries(dataAttributes)) {
    if (!name.startsWith("data-") || value === undefined) {
      continue;
    }

    resolved[name] = String(value);
  }

  return resolved;
}

function requireStyle(style: string | undefined, fallback: string): string {
  return style ?? fallback;
}

function getCoordKey(coord: SheetCellCoord): string {
  return `${coord.rowIndex}:${coord.columnIndex}`;
}

function sameCoord(
  left: SheetCellCoord | null | undefined,
  right: SheetCellCoord | null | undefined,
): boolean {
  return (
    left?.rowIndex === right?.rowIndex &&
    left?.columnIndex === right?.columnIndex
  );
}

function normalizeSelection(selection: SheetCellSelection): {
  readonly startRowIndex: number;
  readonly endRowIndex: number;
  readonly startColumnIndex: number;
  readonly endColumnIndex: number;
} {
  return {
    startRowIndex: Math.min(selection.anchorRowIndex, selection.focusRowIndex),
    endRowIndex: Math.max(selection.anchorRowIndex, selection.focusRowIndex),
    startColumnIndex: Math.min(
      selection.anchorColumnIndex,
      selection.focusColumnIndex,
    ),
    endColumnIndex: Math.max(
      selection.anchorColumnIndex,
      selection.focusColumnIndex,
    ),
  };
}

function normalizeColumnHeaderSelection(
  selection: SheetColumnHeaderSelection,
): {
  readonly startColumnIndex: number;
  readonly endColumnIndex: number;
} {
  return {
    startColumnIndex: Math.min(
      selection.anchorColumnIndex,
      selection.focusColumnIndex,
    ),
    endColumnIndex: Math.max(
      selection.anchorColumnIndex,
      selection.focusColumnIndex,
    ),
  };
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function parseClipboardGrid(text: string): readonly (readonly string[])[] {
  return text
    .split("\n")
    .filter((line, index, lines) => line !== "" || index < lines.length - 1)
    .map((line) => line.split("\t").map((cell) => cell.replace(/\r$/, "")));
}

function normalizeClipboardRow(row: readonly string[]): string {
  return row.map((value) => value.trim().toLowerCase()).join("\t");
}

function resolveSheetDataType(
  dataType: SheetCellDataType | undefined,
  editor: SheetCellEditorKind | undefined,
): SheetResolvedDataType {
  if (dataType !== undefined) {
    if (dataType === "decimal") {
      return { kind: "decimal" };
    }

    const decimalMatch = DECIMAL_DATA_TYPE_PATTERN.exec(dataType);
    if (decimalMatch !== null) {
      return {
        kind: "decimal",
        precision: Number(decimalMatch[1]),
        scale: Number(decimalMatch[2]),
      };
    }

    switch (dataType) {
      case "text":
      case "textarea":
      case "integer":
      case "date":
      case "time":
      case "dateTime":
      case "checkbox":
      case "select":
      case "multiselect":
        return { kind: dataType };
      default:
        return { kind: "text" };
    }
  }

  switch (editor) {
    case "textarea":
      return { kind: "textarea" };
    case "checkbox":
      return { kind: "checkbox" };
    case "date":
      return { kind: "date" };
    case "time":
      return { kind: "time" };
    case "number":
      return { kind: "number" };
    default:
      return { kind: "text" };
  }
}

function splitMultiSelectText(text: string): readonly string[] {
  return text
    .split(/\s*,\s*/)
    .map((value) => value.trim())
    .filter((value) => value !== "");
}

function defaultSerializeValue(
  value: unknown,
  dataType: SheetResolvedDataType,
): string {
  if (value === null || value === undefined) return "";

  if (dataType.kind === "multiselect" && Array.isArray(value)) {
    return value.map((entry) => String(entry)).join(", ");
  }

  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function defaultParseValue(
  text: string,
  dataType: SheetResolvedDataType,
): unknown {
  if (dataType.kind === "checkbox") {
    const normalized = text.trim().toLowerCase();
    return (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "yes" ||
      normalized === "on"
    );
  }

  if (dataType.kind === "integer") {
    if (text.trim() === "") return "";

    try {
      return Int(text.trim());
    } catch {
      return text;
    }
  }

  if (dataType.kind === "decimal") {
    if (text.trim() === "") return "";

    try {
      return Decimal(text.trim());
    } catch {
      return text;
    }
  }

  if (dataType.kind === "number") {
    if (text.trim() === "") return "";
    const numeric = Number(text);
    return Number.isNaN(numeric) ? text : numeric;
  }

  if (dataType.kind === "multiselect") {
    return splitMultiSelectText(text);
  }

  return text;
}

function isPrintableKey(event: KeyboardEvent): boolean {
  return (
    event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey
  );
}

function isTruthyText(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

function findFocusableDescendant(root: HTMLElement | null): HTMLElement | null {
  if (root === null) return null;
  return root.querySelector<HTMLElement>(
    "input, textarea, button, select, [tabindex]:not([tabindex='-1'])",
  );
}

function resolveControllerFromNode(
  node: HTMLElement | null,
  explicitController: SheetController | undefined,
): SheetController | null {
  if (explicitController !== undefined) return explicitController;
  const root = node?.closest(
    '[data-sheet-root="true"]',
  ) as SheetElementWithController | null;
  return root?.__beatUiSheetController ?? null;
}

function getDecimalStepValue(dataType: SheetResolvedDataType): string {
  if (dataType.kind !== "decimal") {
    return "1";
  }

  if (dataType.scale === undefined || dataType.scale <= 0) {
    return "1";
  }

  return `0.${"0".repeat(Math.max(dataType.scale - 1, 0))}1`;
}

function stepNumericDraftValue(
  currentValue: string,
  dataType: SheetResolvedDataType,
  direction: 1 | -1,
): string | null {
  const fallback = currentValue.trim() === "" ? "0" : currentValue.trim();

  try {
    if (dataType.kind === "integer") {
      const integer = Int(fallback);
      return (
        direction === 1 ? integer.add(1) : integer.subtract(1)
      ).toString();
    }

    if (dataType.kind === "decimal") {
      const decimal = Decimal(fallback);
      const stepValue = getDecimalStepValue(dataType);
      return (
        direction === 1 ? decimal.add(stepValue) : decimal.subtract(stepValue)
      ).toString();
    }

    if (dataType.kind === "number") {
      const numeric = Number(fallback);
      if (Number.isNaN(numeric)) return null;
      return String(numeric + direction);
    }
  } catch {
    return null;
  }

  return null;
}

function isNumericSheetDataType(dataType: SheetResolvedDataType): boolean {
  return (
    dataType.kind === "integer" ||
    dataType.kind === "decimal" ||
    dataType.kind === "number"
  );
}

function resolveSheetCellAlign(
  align: SheetCellAlign | undefined,
  dataType: SheetResolvedDataType,
): SheetCellAlign {
  if (align !== undefined) {
    return align;
  }

  return isNumericSheetDataType(dataType) ? "right" : "left";
}

function getSurfaceAlignmentStyle(align: SheetCellAlign): string {
  return align === "right"
    ? "justify-content:flex-end;text-align:right"
    : "justify-content:flex-start;text-align:left";
}

function getInputAlignmentStyle(align: SheetCellAlign): string {
  return `text-align:${align}`;
}

function getCheckboxAlignmentStyle(align: SheetCellAlign): string {
  return align === "right"
    ? "justify-content:flex-end"
    : "justify-content:flex-start";
}

function getSelectTriggerAlignmentStyle(align: SheetCellAlign): string {
  return `display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:0.5rem;align-items:center;text-align:${align}`;
}

function getDefaultDatePickerDayStyle(
  selected: boolean,
  today: boolean,
  outside: boolean,
): string {
  if (selected) {
    return "display:flex;align-items:center;justify-content:center;width:2rem;height:2rem;border:none;border-radius:0.375rem;background:var(--beat-ui-color-primary);color:var(--beat-ui-color-primary-text);font:inherit;font-weight:700;cursor:pointer";
  }

  if (today) {
    return "display:flex;align-items:center;justify-content:center;width:2rem;height:2rem;border:none;border-radius:0.375rem;background:var(--beat-ui-color-background-accent-soft);color:var(--beat-ui-color-text);font:inherit;font-weight:600;cursor:pointer";
  }

  return `display:flex;align-items:center;justify-content:center;width:2rem;height:2rem;border:none;border-radius:0.375rem;background:transparent;color:${outside ? "var(--beat-ui-color-text-muted)" : "var(--beat-ui-color-text)"};opacity:${outside ? "0.45" : "1"};font:inherit;cursor:pointer`;
}

function getDefaultTimePickerOptionStyle(selected: boolean): string {
  return `display:flex;align-items:center;justify-content:center;padding:0.25rem 0.5rem;border:none;border-radius:0.375rem;background:${selected ? "var(--beat-ui-color-primary)" : "transparent"};color:${selected ? "var(--beat-ui-color-primary-text)" : "var(--beat-ui-color-text)"};font:inherit;font-weight:${selected ? "700" : "500"};cursor:pointer`;
}

function renderDefaultEditor(props: {
  readonly align: SheetCellAlign;
  readonly dataType: SheetResolvedDataType;
  readonly options: readonly SheetCellOption[] | undefined;
  readonly placeholder: string | undefined;
  readonly value: BeatUiState<string>;
  readonly commit: () => void;
}): BeatUiRenderable {
  const handleStepMouseDown = (
    stepValue: (direction: 1 | -1) => void,
    direction: 1 | -1,
    event: MouseEvent,
  ): void => {
    event.preventDefault();
    stepValue(direction);
  };

  const handleStepClick = (
    stepValue: (direction: 1 | -1) => void,
    direction: 1 | -1,
    event: MouseEvent,
  ): void => {
    if (event.detail !== 0) {
      return;
    }

    stepValue(direction);
  };

  if (props.dataType.kind === "textarea") {
    return (
      <HlTextArea
        value={props.value}
        rows={3}
        styles={{
          root: requireStyle(
            joinStyles(
              DEFAULT_TEXT_AREA_STYLE,
              getInputAlignmentStyle(props.align),
            ),
            DEFAULT_TEXT_AREA_STYLE,
          ),
        }}
        onValueChange={(next) => props.value.set(next)}
        onBlur={() => props.commit()}
      />
    );
  }

  if (props.dataType.kind === "checkbox") {
    const checkedState = pulse(isTruthyText(props.value.get()));

    return (
      <HlCheckBox
        checked={checkedState}
        styles={{
          root: requireStyle(
            joinStyles(
              DEFAULT_CHECKBOX_STYLE,
              getCheckboxAlignmentStyle(props.align),
            ),
            DEFAULT_CHECKBOX_STYLE,
          ),
          input: DEFAULT_CHECKBOX_INPUT_STYLE,
        }}
        onCheckedChange={(nextChecked) => {
          checkedState.set(nextChecked);
          props.value.set(nextChecked ? "true" : "false");
        }}
        onBlur={() => props.commit()}
      />
    );
  }

  if (props.dataType.kind === "select") {
    return (
      <HlSelect
        value={props.value}
        options={props.options ?? []}
        {...(props.placeholder !== undefined
          ? { placeholder: props.placeholder }
          : {})}
        styles={{
          trigger: requireStyle(
            joinStyles(
              DEFAULT_SELECT_TRIGGER_STYLE,
              getSelectTriggerAlignmentStyle(props.align),
            ),
            DEFAULT_SELECT_TRIGGER_STYLE,
          ),
          chevron: DEFAULT_SELECT_CHEVRON_STYLE,
          menu: DEFAULT_SELECT_MENU_STYLE,
          searchInput: DEFAULT_SELECT_SEARCH_STYLE,
          item: (active, disabled) =>
            `display:flex;align-items:center;width:100%;padding:0.5rem 0.625rem;border:none;border-radius:0.5rem;background:${active ? "var(--beat-ui-color-background-accent-soft)" : "transparent"};color:${disabled ? "var(--beat-ui-color-text-muted)" : "inherit"};font:inherit;text-align:left;cursor:${disabled ? "not-allowed" : "pointer"};`,
        }}
        onValueChange={(next) => props.value.set(next)}
        onBlur={() => props.commit()}
      />
    );
  }

  if (props.dataType.kind === "multiselect") {
    const selectedValues = pulse(splitMultiSelectText(props.value.get()));

    return (
      <HlMultiSelect
        value={selectedValues}
        options={props.options ?? []}
        {...(props.placeholder !== undefined
          ? { placeholder: props.placeholder }
          : {})}
        styles={{
          trigger: requireStyle(
            joinStyles(
              DEFAULT_SELECT_TRIGGER_STYLE,
              getSelectTriggerAlignmentStyle(props.align),
            ),
            DEFAULT_SELECT_TRIGGER_STYLE,
          ),
          chevron: DEFAULT_SELECT_CHEVRON_STYLE,
          menu: DEFAULT_SELECT_MENU_STYLE,
          searchInput: DEFAULT_SELECT_SEARCH_STYLE,
          checkbox: DEFAULT_MULTI_SELECT_CHECKBOX_STYLE,
          item: (active, disabled) =>
            `display:flex;align-items:center;width:100%;padding:0.5rem 0.625rem;border:none;border-radius:0.5rem;background:${active ? "var(--beat-ui-color-background-accent-soft)" : "transparent"};color:${disabled ? "var(--beat-ui-color-text-muted)" : "inherit"};font:inherit;text-align:left;cursor:${disabled ? "not-allowed" : "pointer"};`,
        }}
        onValueChange={(next) => {
          selectedValues.set(next);
          props.value.set(next.join(", "));
        }}
        onBlur={() => props.commit()}
      />
    );
  }

  if (props.dataType.kind === "date") {
    return (
      <HlDateInput
        value={props.value}
        icon={<IconCalendar size={14} />}
        calendar={
          <HlDatePicker
            value={props.value}
            onValueChange={(next) => props.value.set(next)}
            styles={{
              root: DEFAULT_DATE_PICKER_ROOT_STYLE,
              header: DEFAULT_DATE_PICKER_HEADER_STYLE,
              title: DEFAULT_DATE_PICKER_TITLE_STYLE,
              navButton: DEFAULT_DATE_PICKER_NAV_BUTTON_STYLE,
              grid: DEFAULT_DATE_PICKER_GRID_STYLE,
              weekday: DEFAULT_DATE_PICKER_WEEKDAY_STYLE,
              day: getDefaultDatePickerDayStyle,
            }}
          />
        }
        styles={{
          root: DEFAULT_PICKER_ROOT_STYLE,
          inputWrapper: DEFAULT_PICKER_INPUT_WRAPPER_STYLE,
          input: requireStyle(
            joinStyles(
              DEFAULT_PICKER_INPUT_STYLE,
              getInputAlignmentStyle(props.align),
            ),
            DEFAULT_PICKER_INPUT_STYLE,
          ),
          inputOverlay: requireStyle(
            joinStyles(
              DEFAULT_PICKER_OVERLAY_STYLE,
              getSurfaceAlignmentStyle(props.align),
            ),
            DEFAULT_PICKER_OVERLAY_STYLE,
          ),
          placeholderChar: DEFAULT_PICKER_PLACEHOLDER_STYLE,
          digitChar: DEFAULT_PICKER_DIGIT_STYLE,
          iconButton: DEFAULT_PICKER_ICON_BUTTON_STYLE,
          calendarWrapper: DEFAULT_PICKER_DIALOG_STYLE,
        }}
        onValueChange={(next) => props.value.set(next)}
        onBlur={() => props.commit()}
      />
    );
  }

  if (props.dataType.kind === "time") {
    return (
      <HlTimeInput
        value={props.value}
        icon={<IconClock size={14} />}
        timePicker={
          <HlTimePicker
            value={props.value}
            onValueChange={(next) => props.value.set(next)}
            styles={{
              root: DEFAULT_TIME_PICKER_ROOT_STYLE,
              columns: DEFAULT_TIME_PICKER_COLUMNS_STYLE,
              column: DEFAULT_TIME_PICKER_COLUMN_STYLE,
              columnLabel: DEFAULT_TIME_PICKER_COLUMN_LABEL_STYLE,
              option: getDefaultTimePickerOptionStyle,
            }}
          />
        }
        styles={{
          root: DEFAULT_PICKER_ROOT_STYLE,
          inputWrapper: DEFAULT_PICKER_INPUT_WRAPPER_STYLE,
          input: requireStyle(
            joinStyles(
              DEFAULT_PICKER_INPUT_STYLE,
              getInputAlignmentStyle(props.align),
            ),
            DEFAULT_PICKER_INPUT_STYLE,
          ),
          inputOverlay: requireStyle(
            joinStyles(
              DEFAULT_PICKER_OVERLAY_STYLE,
              getSurfaceAlignmentStyle(props.align),
            ),
            DEFAULT_PICKER_OVERLAY_STYLE,
          ),
          placeholderChar: DEFAULT_PICKER_PLACEHOLDER_STYLE,
          digitChar: DEFAULT_PICKER_DIGIT_STYLE,
          iconButton: DEFAULT_PICKER_ICON_BUTTON_STYLE,
          pickerWrapper: DEFAULT_PICKER_DIALOG_STYLE,
        }}
        onValueChange={(next) => props.value.set(next)}
        onBlur={() => props.commit()}
      />
    );
  }

  if (props.dataType.kind === "dateTime") {
    return (
      <input
        type="datetime-local"
        value={props.value}
        style={joinStyles(
          DEFAULT_INPUT_STYLE,
          getInputAlignmentStyle(props.align),
        )}
        onInput={(event: Event) => {
          const target = event.currentTarget;
          if (!(target instanceof HTMLInputElement)) return;
          props.value.set(target.value);
        }}
        onBlur={() => props.commit()}
      />
    );
  }

  if (props.dataType.kind === "integer") {
    const stepValue = (direction: 1 | -1): void => {
      const next = stepNumericDraftValue(
        props.value.get(),
        props.dataType,
        direction,
      );
      if (next !== null) {
        props.value.set(next);
      }
    };

    return (
      <div style={DEFAULT_NUMBER_ROOT_STYLE}>
        <HlTextInput
          value={props.value}
          inputMode="numeric"
          {...(props.placeholder !== undefined
            ? { placeholder: props.placeholder }
            : {})}
          styles={{
            root: requireStyle(
              joinStyles(
                DEFAULT_INPUT_STYLE,
                getInputAlignmentStyle(props.align),
              ),
              DEFAULT_INPUT_STYLE,
            ),
          }}
          onValueChange={(next) => props.value.set(next)}
          onBlur={() => props.commit()}
        />
        <div style={DEFAULT_NUMBER_STEPPER_STYLE}>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Increment"
            style={DEFAULT_NUMBER_STEP_BUTTON_STYLE}
            onMouseDown={(event: MouseEvent) =>
              handleStepMouseDown(stepValue, 1, event)
            }
            onClick={(event: MouseEvent) =>
              handleStepClick(stepValue, 1, event)
            }
          >
            <IconChevronUp size={12} />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Decrement"
            style={DEFAULT_NUMBER_STEP_BUTTON_STYLE}
            onMouseDown={(event: MouseEvent) =>
              handleStepMouseDown(stepValue, -1, event)
            }
            onClick={(event: MouseEvent) =>
              handleStepClick(stepValue, -1, event)
            }
          >
            <IconChevronDown size={12} />
          </button>
        </div>
      </div>
    );
  }

  if (props.dataType.kind === "decimal") {
    const stepValue = (direction: 1 | -1): void => {
      const next = stepNumericDraftValue(
        props.value.get(),
        props.dataType,
        direction,
      );
      if (next !== null) {
        props.value.set(next);
      }
    };

    return (
      <div style={DEFAULT_NUMBER_ROOT_STYLE}>
        <HlTextInput
          value={props.value}
          inputMode="decimal"
          {...(props.placeholder !== undefined
            ? { placeholder: props.placeholder }
            : {})}
          styles={{
            root: requireStyle(
              joinStyles(
                DEFAULT_INPUT_STYLE,
                getInputAlignmentStyle(props.align),
              ),
              DEFAULT_INPUT_STYLE,
            ),
          }}
          onValueChange={(next) => props.value.set(next)}
          onBlur={() => props.commit()}
        />
        <div style={DEFAULT_NUMBER_STEPPER_STYLE}>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Increment"
            style={DEFAULT_NUMBER_STEP_BUTTON_STYLE}
            onMouseDown={(event: MouseEvent) =>
              handleStepMouseDown(stepValue, 1, event)
            }
            onClick={(event: MouseEvent) =>
              handleStepClick(stepValue, 1, event)
            }
          >
            <IconChevronUp size={12} />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Decrement"
            style={DEFAULT_NUMBER_STEP_BUTTON_STYLE}
            onMouseDown={(event: MouseEvent) =>
              handleStepMouseDown(stepValue, -1, event)
            }
            onClick={(event: MouseEvent) =>
              handleStepClick(stepValue, -1, event)
            }
          >
            <IconChevronDown size={12} />
          </button>
        </div>
      </div>
    );
  }

  if (props.dataType.kind === "number") {
    return (
      <HlNumberInput
        value={props.value}
        incrementIcon={<IconChevronUp size={12} />}
        decrementIcon={<IconChevronDown size={12} />}
        {...(props.placeholder !== undefined
          ? { placeholder: props.placeholder }
          : {})}
        styles={{
          root: DEFAULT_NUMBER_ROOT_STYLE,
          input: requireStyle(
            joinStyles(
              DEFAULT_INPUT_STYLE,
              getInputAlignmentStyle(props.align),
            ),
            DEFAULT_INPUT_STYLE,
          ),
          stepperWrapper: DEFAULT_NUMBER_STEPPER_STYLE,
          stepButton: DEFAULT_NUMBER_STEP_BUTTON_STYLE,
        }}
        onValueChange={(next) => props.value.set(next)}
        onBlur={() => props.commit()}
      />
    );
  }

  if (props.dataType.kind === "text") {
    return (
      <HlTextInput
        value={props.value}
        {...(props.placeholder !== undefined
          ? { placeholder: props.placeholder }
          : {})}
        styles={{
          root: requireStyle(
            joinStyles(
              DEFAULT_INPUT_STYLE,
              getInputAlignmentStyle(props.align),
            ),
            DEFAULT_INPUT_STYLE,
          ),
        }}
        onValueChange={(next) => props.value.set(next)}
        onBlur={() => props.commit()}
      />
    );
  }

  return (
    <HlInput
      type="text"
      value={props.value}
      styles={{
        root: requireStyle(
          joinStyles(DEFAULT_INPUT_STYLE, getInputAlignmentStyle(props.align)),
          DEFAULT_INPUT_STYLE,
        ),
      }}
      onValueChange={(next) => props.value.set(next)}
      onBlur={() => props.commit()}
    />
  );
}

export function createSheetController(): SheetController {
  const activeCell = pulse<SheetCellCoord | null>(null);
  const editingCell = pulse<SheetCellCoord | null>(null);
  const headerSelection = pulse<SheetColumnHeaderSelection | null>(null);
  const selection = pulse<SheetCellSelection | null>(null);
  const registeredCells = new Map<string, SheetCellRegistration>();
  const registeredElements = new Map<string, HTMLElement>();
  const registeredRoots = new Set<SheetElementWithController>();
  let dragAnchor:
    | { readonly kind: "cell"; readonly coord: SheetCellCoord }
    | { readonly kind: "column-header"; readonly columnIndex: number }
    | null = null;
  let stopSelectionDrag: (() => void) | null = null;

  const commitCurrentEdit = (nextCoord?: SheetCellCoord): void => {
    const currentEditing = editingCell.get();
    if (currentEditing === null || sameCoord(currentEditing, nextCoord)) {
      return;
    }

    registeredCells.get(getCoordKey(currentEditing))?.commitEdit?.();
  };

  const getOrderedRowIndices = (): readonly number[] =>
    [
      ...new Set(
        [...registeredCells.keys()].map((key) => Number(key.split(":")[0])),
      ),
    ]
      .filter((value) => !Number.isNaN(value))
      .sort((left, right) => left - right);

  const getOrderedColumnIndices = (): readonly number[] =>
    [
      ...new Set(
        [...registeredCells.keys()].map((key) => Number(key.split(":")[1])),
      ),
    ]
      .filter((value) => !Number.isNaN(value))
      .sort((left, right) => left - right);

  const getVisibleColumnIndices = (): readonly number[] =>
    getOrderedColumnIndices();

  const getRowBounds = (): {
    readonly startRowIndex: number;
    readonly endRowIndex: number;
  } | null => {
    const rows = getOrderedRowIndices();
    if (rows.length === 0) return null;

    return {
      startRowIndex: rows[0] ?? 0,
      endRowIndex: rows[rows.length - 1] ?? 0,
    };
  };

  const focusCellElement = (coord: SheetCellCoord): void => {
    registeredElements.get(getCoordKey(coord))?.focus();
  };

  const getRootElement = (): SheetElementWithController | null => {
    const root = registeredRoots.values().next().value;
    return root ?? null;
  };

  const getColumnHeaderValues = (): readonly string[] => {
    const root = getRootElement();
    if (root === null) return [];

    return [
      ...root.querySelectorAll<HTMLElement>('[data-sheet-header-scope="col"]'),
    ].map((node) => node.textContent?.trim() ?? "");
  };

  const getColumnHeaderValuesForRange = (
    startColumnIndex: number,
    endColumnIndex: number,
  ): readonly string[] => {
    const columns = getOrderedColumnIndices();
    const headerValues = getColumnHeaderValues();
    const headerMap = new Map<number, string>();

    columns.forEach((columnIndex, position) => {
      headerMap.set(columnIndex, headerValues[position] ?? "");
    });

    const values: string[] = [];
    for (
      let columnIndex = startColumnIndex;
      columnIndex <= endColumnIndex;
      columnIndex += 1
    ) {
      values.push(headerMap.get(columnIndex) ?? "");
    }

    return values;
  };

  const clearDragStopListeners = (): void => {
    stopSelectionDrag?.();
    stopSelectionDrag = null;
  };

  const stopDrag = (): void => {
    dragAnchor = null;
    clearDragStopListeners();
  };

  const installDragStopListeners = (): void => {
    clearDragStopListeners();

    const handleStop = (): void => {
      stopDrag();
    };

    window.addEventListener("mouseup", handleStop, true);
    window.addEventListener("blur", handleStop, true);

    stopSelectionDrag = () => {
      window.removeEventListener("mouseup", handleStop, true);
      window.removeEventListener("blur", handleStop, true);
    };
  };

  const isCellActive = (coord: SheetCellCoord): boolean =>
    sameCoord(activeCell.get(), coord);

  const isCellEditing = (coord: SheetCellCoord): boolean =>
    sameCoord(editingCell.get(), coord);

  const isCellSelected = (coord: SheetCellCoord): boolean => {
    const currentSelection = selection.get();
    if (currentSelection === null) return false;
    const bounds = normalizeSelection(currentSelection);
    return (
      coord.rowIndex >= bounds.startRowIndex &&
      coord.rowIndex <= bounds.endRowIndex &&
      coord.columnIndex >= bounds.startColumnIndex &&
      coord.columnIndex <= bounds.endColumnIndex
    );
  };

  const isColumnHeaderSelected = (columnIndex: number): boolean => {
    const currentHeaderSelection = headerSelection.get();
    if (currentHeaderSelection === null) return false;

    const bounds = normalizeColumnHeaderSelection(currentHeaderSelection);
    return (
      columnIndex >= bounds.startColumnIndex &&
      columnIndex <= bounds.endColumnIndex
    );
  };

  const selectColumnHeaders = (
    anchorColumnIndex: number,
    focusColumnIndex: number,
  ): void => {
    activeCell.set(null);
    editingCell.set(null);
    headerSelection.set({
      anchorColumnIndex,
      focusColumnIndex,
    });
    selection.set(null);
  };

  const selectHeaderDrivenBodyRange = (
    anchorColumnIndex: number,
    focusColumnIndex: number,
    focusRowIndex: number,
  ): void => {
    const rowBounds = getRowBounds();
    if (rowBounds === null) {
      selectColumnHeaders(anchorColumnIndex, focusColumnIndex);
      return;
    }

    activeCell.set({
      rowIndex: focusRowIndex,
      columnIndex: focusColumnIndex,
    });
    editingCell.set(null);
    headerSelection.set({
      anchorColumnIndex,
      focusColumnIndex,
    });
    selection.set({
      anchorRowIndex: rowBounds.startRowIndex,
      anchorColumnIndex,
      focusRowIndex,
      focusColumnIndex,
    });
  };

  const activateCell = (
    coord: SheetCellCoord,
    options?: {
      readonly extend?: boolean;
      readonly focus?: boolean;
    },
  ): void => {
    commitCurrentEdit(coord);

    const extend = options?.extend === true;
    const previousSelection = selection.get();

    activeCell.set(coord);
    editingCell.set(null);
    headerSelection.set(null);
    selection.set(
      extend && previousSelection !== null
        ? {
            anchorRowIndex: previousSelection.anchorRowIndex,
            anchorColumnIndex: previousSelection.anchorColumnIndex,
            focusRowIndex: coord.rowIndex,
            focusColumnIndex: coord.columnIndex,
          }
        : {
            anchorRowIndex: coord.rowIndex,
            anchorColumnIndex: coord.columnIndex,
            focusRowIndex: coord.rowIndex,
            focusColumnIndex: coord.columnIndex,
          },
    );

    if (options?.focus !== false) {
      focusCellElement(coord);
    }
  };

  const beginSelectionDrag = (
    coord: SheetCellCoord,
    options?: {
      readonly extend?: boolean;
      readonly focus?: boolean;
    },
  ): void => {
    const extend = options?.extend === true;
    const previousSelection = selection.get();
    dragAnchor =
      extend && previousSelection !== null
        ? {
            kind: "cell",
            coord: {
              rowIndex: previousSelection.anchorRowIndex,
              columnIndex: previousSelection.anchorColumnIndex,
            },
          }
        : { kind: "cell", coord };

    activateCell(coord, options);
    installDragStopListeners();
  };

  const beginColumnHeaderSelectionDrag = (
    columnIndex: number,
    options?: {
      readonly extend?: boolean;
      readonly focus?: boolean;
    },
  ): void => {
    const extend = options?.extend === true;
    const previousHeaderSelection = headerSelection.get();
    const anchorColumnIndex = extend
      ? (previousHeaderSelection?.anchorColumnIndex ?? columnIndex)
      : columnIndex;

    dragAnchor = {
      kind: "column-header",
      columnIndex: anchorColumnIndex,
    };

    commitCurrentEdit();
    selectColumnHeaders(anchorColumnIndex, columnIndex);
    installDragStopListeners();
  };

  const updateSelectionDrag = (coord: SheetCellCoord): void => {
    if (dragAnchor?.kind === "column-header") {
      selectHeaderDrivenBodyRange(
        dragAnchor.columnIndex,
        coord.columnIndex,
        coord.rowIndex,
      );
      return;
    }

    if (dragAnchor?.kind !== "cell") return;

    activeCell.set(coord);
    editingCell.set(null);
    headerSelection.set(null);
    selection.set({
      anchorRowIndex: dragAnchor.coord.rowIndex,
      anchorColumnIndex: dragAnchor.coord.columnIndex,
      focusRowIndex: coord.rowIndex,
      focusColumnIndex: coord.columnIndex,
    });
  };

  const updateColumnHeaderSelectionDrag = (columnIndex: number): void => {
    if (dragAnchor?.kind === "cell") {
      const currentSelection = selection.get();
      selectHeaderDrivenBodyRange(
        dragAnchor.coord.columnIndex,
        columnIndex,
        currentSelection?.focusRowIndex ?? dragAnchor.coord.rowIndex,
      );
      return;
    }

    if (dragAnchor?.kind !== "column-header") return;

    const currentSelection = selection.get();
    if (currentSelection !== null) {
      selectHeaderDrivenBodyRange(
        dragAnchor.columnIndex,
        columnIndex,
        currentSelection.focusRowIndex,
      );
      return;
    }

    selectColumnHeaders(dragAnchor.columnIndex, columnIndex);
  };

  const endSelectionDrag = (): void => {
    stopDrag();
  };

  const selectAll = (options?: { readonly focus?: boolean }): void => {
    const rowBounds = getRowBounds();
    const columns = getOrderedColumnIndices();
    if (rowBounds === null || columns.length === 0) return;

    const focusCoord = {
      rowIndex: rowBounds.startRowIndex,
      columnIndex: columns[0] ?? 0,
    } satisfies SheetCellCoord;

    commitCurrentEdit(focusCoord);

    activeCell.set(focusCoord);
    editingCell.set(null);
    headerSelection.set({
      anchorColumnIndex: columns[0] ?? 0,
      focusColumnIndex: columns[columns.length - 1] ?? 0,
    });
    selection.set({
      anchorRowIndex: rowBounds.startRowIndex,
      anchorColumnIndex: columns[0] ?? 0,
      focusRowIndex: rowBounds.endRowIndex,
      focusColumnIndex: columns[columns.length - 1] ?? 0,
    });

    if (options?.focus !== false) {
      focusCellElement(focusCoord);
    }
  };

  const moveActiveCell = (
    rowDelta: number,
    columnDelta: number,
    options?: { readonly extend?: boolean },
  ): void => {
    const rows = getOrderedRowIndices();
    const columns = getOrderedColumnIndices();
    if (rows.length === 0 || columns.length === 0) return;

    const current = activeCell.get() ?? {
      rowIndex: rows[0] ?? 0,
      columnIndex: columns[0] ?? 0,
    };
    const rowPosition = rows.indexOf(current.rowIndex);
    const columnPosition = columns.indexOf(current.columnIndex);
    const nextRow =
      rows[clamp(rowPosition + rowDelta, 0, Math.max(rows.length - 1, 0))];
    const nextColumn =
      columns[
        clamp(columnPosition + columnDelta, 0, Math.max(columns.length - 1, 0))
      ];

    if (nextRow === undefined || nextColumn === undefined) return;

    activateCell(
      { rowIndex: nextRow, columnIndex: nextColumn },
      options?.extend === true ? { extend: true } : undefined,
    );
  };

  const beginEdit = (coord?: SheetCellCoord): void => {
    const target = coord ?? activeCell.get();
    if (target === null) return;

    commitCurrentEdit(target);

    const registration = registeredCells.get(getCoordKey(target));
    if (registration === undefined || !registration.editable) return;

    activeCell.set(target);
    editingCell.set(target);
    headerSelection.set(null);
    selection.set({
      anchorRowIndex: target.rowIndex,
      anchorColumnIndex: target.columnIndex,
      focusRowIndex: target.rowIndex,
      focusColumnIndex: target.columnIndex,
    });
  };

  const cancelEdit = (options?: { readonly focus?: boolean }): void => {
    editingCell.set(null);
    const current = activeCell.get();
    if (options?.focus !== false && current !== null) focusCellElement(current);
  };

  const endEdit = (options?: { readonly focus?: boolean }): void => {
    editingCell.set(null);
    const current = activeCell.get();
    if (options?.focus !== false && current !== null) focusCellElement(current);
  };

  const clearActiveCell = (): void => {
    activeCell.set(null);
    editingCell.set(null);
    headerSelection.set(null);
    selection.set(null);
  };

  const handleCellKeyDown = (
    _coord: SheetCellCoord,
    event: KeyboardEvent,
  ): void => {
    if (editingCell.get() !== null) return;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
      event.preventDefault();
      selectAll();
      return;
    }

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        moveActiveCell(-1, 0, { extend: event.shiftKey });
        return;
      case "ArrowDown":
        event.preventDefault();
        moveActiveCell(1, 0, { extend: event.shiftKey });
        return;
      case "ArrowLeft":
        event.preventDefault();
        moveActiveCell(0, -1, { extend: event.shiftKey });
        return;
      case "ArrowRight":
        event.preventDefault();
        moveActiveCell(0, 1, { extend: event.shiftKey });
        return;
      case "Tab":
        event.preventDefault();
        moveActiveCell(0, event.shiftKey ? -1 : 1);
        return;
      default:
        return;
    }
  };

  const handleCopy = (event: ClipboardEvent): void => {
    const currentSelection = selection.get();
    const currentHeaderSelection = headerSelection.get();
    if (currentSelection === null && currentHeaderSelection === null) return;

    const clipboard = event.clipboardData;
    if (clipboard === null) return;

    if (currentHeaderSelection !== null && currentSelection === null) {
      const bounds = normalizeColumnHeaderSelection(currentHeaderSelection);
      const headerValues = getColumnHeaderValuesForRange(
        bounds.startColumnIndex,
        bounds.endColumnIndex,
      );

      if (headerValues.length === 0) return;

      clipboard.setData("text/plain", headerValues.join("\t"));
      event.preventDefault();
      return;
    }

    if (currentSelection === null) return;

    const bounds = normalizeSelection(currentSelection);
    const includeHeaders = currentHeaderSelection !== null;

    const lines: string[] = [];
    if (includeHeaders) {
      const headerValues = getColumnHeaderValuesForRange(
        bounds.startColumnIndex,
        bounds.endColumnIndex,
      );
      if (headerValues.length > 0) {
        lines.push(headerValues.join("\t"));
      }
    }

    for (
      let rowIndex = bounds.startRowIndex;
      rowIndex <= bounds.endRowIndex;
      rowIndex += 1
    ) {
      const row: string[] = [];
      for (
        let columnIndex = bounds.startColumnIndex;
        columnIndex <= bounds.endColumnIndex;
        columnIndex += 1
      ) {
        const registration = registeredCells.get(
          getCoordKey({ rowIndex, columnIndex }),
        );
        row.push(registration?.serializeValue(registration.getValue()) ?? "");
      }
      lines.push(row.join("\t"));
    }

    clipboard.setData("text/plain", lines.join("\n"));
    event.preventDefault();
  };

  const handlePaste = (event: ClipboardEvent): void => {
    const clipboard = event.clipboardData;
    if (clipboard === null) return;

    const current = activeCell.get();
    if (current === null) return;

    const text = clipboard.getData("text/plain");
    if (text.trim() === "") return;

    const parsed = parseClipboardGrid(text);
    const headerValues = getColumnHeaderValuesForRange(
      current.columnIndex,
      current.columnIndex + Math.max((parsed[0]?.length ?? 1) - 1, 0),
    );
    const rows =
      parsed.length > 0 &&
      headerValues.length > 0 &&
      normalizeClipboardRow(parsed[0] ?? []) ===
        normalizeClipboardRow(headerValues)
        ? parsed.slice(1)
        : parsed;

    rows.forEach((row, rowOffset) => {
      row.forEach((cellText, columnOffset) => {
        const coord = {
          rowIndex: current.rowIndex + rowOffset,
          columnIndex: current.columnIndex + columnOffset,
        };
        const registration = registeredCells.get(getCoordKey(coord));
        if (
          registration === undefined ||
          !registration.editable ||
          registration.setValue === undefined
        ) {
          return;
        }

        registration.setValue(registration.parseValue(cellText));
      });
    });

    event.preventDefault();
  };

  const registerCell = (
    coord: SheetCellCoord,
    registration: SheetCellRegistration,
  ): (() => void) => {
    const key = getCoordKey(coord);
    registeredCells.set(key, registration);
    return () => {
      registeredCells.delete(key);
    };
  };

  const registerCellElement = (
    coord: SheetCellCoord,
    element: HTMLElement,
  ): (() => void) => {
    const key = getCoordKey(coord);
    registeredElements.set(key, element);
    return () => {
      registeredElements.delete(key);
    };
  };

  const registerRootElement = (element: HTMLElement): (() => void) => {
    const root = element as SheetElementWithController;
    root.__beatUiSheetController = controller;
    registeredRoots.add(root);
    return () => {
      if (root.__beatUiSheetController === controller) {
        root.__beatUiSheetController = undefined;
      }
      registeredRoots.delete(root);
    };
  };

  const controller: SheetController = {
    activeCell,
    editingCell,
    headerSelection,
    selection,
    activateCell,
    beginEdit,
    beginColumnHeaderSelectionDrag,
    beginSelectionDrag,
    cancelEdit,
    clearActiveCell,
    endEdit,
    endSelectionDrag,
    handleCellKeyDown,
    handleCopy,
    handlePaste,
    isCellActive,
    isCellEditing,
    isCellSelected,
    isColumnHeaderSelected,
    getVisibleColumnIndices,
    moveActiveCell,
    registerCell,
    registerCellElement,
    registerRootElement,
    selectAll,
    updateColumnHeaderSelectionDrag,
    updateSelectionDrag,
  };

  return controller;
}

const HeaderCellBase = component<
  SheetHeaderCellProps & { readonly scope: "col" | "row" }
>((props) => {
  const selectedState = pulse(false);
  const selectedAttrState = pulse<"true" | undefined>(undefined);
  let elementRef: HTMLElement | null = null;
  let unsubscribeSelection: (() => void) | null = null;
  let unsubscribeHeaderSelection: (() => void) | null = null;

  const resolveColumnIndex = (controller: SheetController): number | null => {
    if (props.scope !== "col") return null;
    if (props.columnIndex !== undefined) return props.columnIndex;
    if (elementRef === null) return null;

    const root = elementRef.closest('[data-sheet-root="true"]');
    if (root === null) return null;

    const headers = [
      ...root.querySelectorAll<HTMLElement>('[data-sheet-header-scope="col"]'),
    ];
    const domIndex = headers.indexOf(elementRef);
    if (domIndex < 0) return null;

    return controller.getVisibleColumnIndices()[domIndex] ?? domIndex;
  };

  const syncSelectedState = (): void => {
    if (props.scope !== "col") {
      selectedState.set(false);
      selectedAttrState.set(undefined);
      return;
    }

    const controller = resolveControllerFromNode(elementRef, props.controller);
    if (controller === null) {
      selectedState.set(false);
      selectedAttrState.set(undefined);
      return;
    }

    const columnIndex = resolveColumnIndex(controller);
    const isSelected =
      columnIndex !== null && controller.isColumnHeaderSelected(columnIndex);

    selectedState.set(isSelected);
    selectedAttrState.set(isSelected ? "true" : undefined);
  };

  const bindController = (): void => {
    unsubscribeSelection?.();
    unsubscribeHeaderSelection?.();
    unsubscribeSelection = null;
    unsubscribeHeaderSelection = null;

    const controller = resolveControllerFromNode(elementRef, props.controller);
    if (controller === null || props.scope !== "col") {
      syncSelectedState();
      return;
    }

    unsubscribeSelection = controller.selection.on(() => {
      syncSelectedState();
    });
    unsubscribeHeaderSelection = controller.headerSelection.on(() => {
      syncSelectedState();
    });
    syncSelectedState();
  };

  onCleanup(() => {
    unsubscribeSelection?.();
    unsubscribeHeaderSelection?.();
  });

  return (
    <div
      role={props.scope === "col" ? "columnheader" : "rowheader"}
      class={props.class}
      aria-label={props.ariaLabel}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
      aria-sort={props.ariaSort}
      title={props.title}
      data-sheet-header-scope={props.scope}
      data-selected={selectedAttrState}
      {...resolveDataAttributes(props.dataAttributes)}
      style={joinStyles(SHEET_HEADER_STYLE, props.style)}
      ref={(element: Element) => {
        if (!(element instanceof HTMLElement)) return;
        elementRef = element;
        bindController();
        queueMicrotask(() => {
          if (elementRef === element) {
            bindController();
          }
        });
        props.ref?.(element);
      }}
      onMouseDown={(event: MouseEvent) => {
        if (props.scope !== "col") return;
        const controller = resolveControllerFromNode(
          elementRef,
          props.controller,
        );
        if (controller === null) return;
        const columnIndex = resolveColumnIndex(controller);
        if (columnIndex === null) return;
        event.preventDefault();
        controller.beginColumnHeaderSelectionDrag(columnIndex, {
          extend: event.shiftKey,
        });
      }}
      onMouseEnter={(event: MouseEvent) => {
        if (props.scope !== "col" || (event.buttons & 1) !== 1) return;
        const controller = resolveControllerFromNode(
          elementRef,
          props.controller,
        );
        if (controller === null) return;
        const columnIndex = resolveColumnIndex(controller);
        if (columnIndex === null) return;
        controller.updateColumnHeaderSelectionDrag(columnIndex);
      }}
      onMouseUp={() => {
        const controller = resolveControllerFromNode(
          elementRef,
          props.controller,
        );
        controller?.endSelectionDrag();
      }}
    >
      {props.children}
    </div>
  );
});

export const SheetRoot = component<SheetRootProps>((props) => {
  const controller = props.controller ?? createSheetController();
  let unregister: (() => void) | null = null;

  onCleanup(() => {
    unregister?.();
  });

  return (
    <div
      role={props.role ?? "grid"}
      class={props.class}
      aria-label={props.ariaLabel}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
      title={props.title}
      data-sheet-root="true"
      {...resolveDataAttributes(props.dataAttributes)}
      style={joinStyles(SHEET_ROOT_STYLE, props.style)}
      ref={(element: Element) => {
        if (!(element instanceof HTMLElement)) return;
        unregister?.();
        unregister = controller.registerRootElement(element);
      }}
      onCopy={(event: ClipboardEvent) => controller.handleCopy(event)}
      onPaste={(event: ClipboardEvent) => controller.handlePaste(event)}
    >
      {props.children}
    </div>
  );
});

export const SheetHeader = component<SheetSectionProps>((props) => (
  <div
    role="rowgroup"
    class={props.class}
    title={props.title}
    {...resolveDataAttributes(props.dataAttributes)}
    style={joinStyles(SHEET_SECTION_STYLE, props.style)}
  >
    {props.children}
  </div>
));

export const SheetBody = component<SheetSectionProps>((props) => (
  <div
    role="rowgroup"
    class={props.class}
    title={props.title}
    {...resolveDataAttributes(props.dataAttributes)}
    style={joinStyles(SHEET_SECTION_STYLE, props.style)}
  >
    {props.children}
  </div>
));

export const SheetRow = component<SheetRowProps>((props) => (
  <div
    role="row"
    class={props.class}
    ref={props.ref}
    title={props.title}
    {...resolveDataAttributes(props.dataAttributes)}
    style={joinStyles(SHEET_ROW_STYLE, props.style)}
  >
    {props.children}
  </div>
));

export const SheetColumnHeader = component<SheetHeaderCellProps>((props) => (
  <HeaderCellBase {...props} scope="col" />
));

export const SheetRowHeader = component<SheetHeaderCellProps>((props) => (
  <HeaderCellBase {...props} scope="row" />
));

export const SheetCell = component<SheetCellProps>((props) => {
  const resolvedController = resolveControllerFromNode(null, props.controller);
  if (resolvedController === null) {
    throw new Error("SheetCell requires a SheetRoot controller context.");
  }

  const coord = {
    rowIndex: props.rowIndex,
    columnIndex: props.columnIndex,
  } satisfies SheetCellCoord;
  const resolvedDataType = resolveSheetDataType(props.dataType, props.editor);
  const resolvedAlign = resolveSheetCellAlign(props.align, resolvedDataType);
  const draftValue = pulse<string>("");
  const activeState = pulse(resolvedController.isCellActive(coord));
  const editingState = pulse(resolvedController.isCellEditing(coord));
  const selectedState = pulse(resolvedController.isCellSelected(coord));
  const activeAttrState = pulse<"true" | undefined>(
    activeState.get() ? "true" : undefined,
  );
  const editingAttrState = pulse<"true" | undefined>(
    editingState.get() ? "true" : undefined,
  );
  const selectedAttrState = pulse<"true" | undefined>(
    selectedState.get() ? "true" : undefined,
  );
  const ariaSelectedState = pulse<"true" | "false">(
    selectedState.get() ? "true" : "false",
  );
  const tabIndexState = pulse<number>(
    activeState.get() ||
      (resolvedController.activeCell.get() === null &&
        coord.rowIndex === 0 &&
        coord.columnIndex === 0)
      ? 0
      : -1,
  );
  const renderVersion = pulse(0);
  let unregisterCell: (() => void) | null = null;
  let unregisterElement: (() => void) | null = null;
  let unsubscribeValue: (() => void) | undefined;
  let editorHost: HTMLElement | null = null;
  let draftDirty = false;
  let syncingDraftFromValue = false;
  let lastSerializedValue = "";

  const getCurrentValue = (): unknown => props.valueState?.get() ?? props.value;
  const serialize = (value: unknown): string =>
    props.serializeValue?.(value) ??
    defaultSerializeValue(value, resolvedDataType);
  const parse = (text: string): unknown =>
    props.parseValue?.(text) ?? defaultParseValue(text, resolvedDataType);
  const contentVisibleState = pulse(props.contentVisibility?.get() ?? true);
  const hiddenValueState = pulse(serialize(getCurrentValue()));
  const setValue = (value: unknown): void => {
    if (props.valueState !== undefined) {
      props.valueState.set(value);
      return;
    }

    props.onValueChange?.(value);
  };
  const isEditable =
    props.readOnly !== true &&
    props.editable !== false &&
    (props.valueState !== undefined || props.onValueChange !== undefined);
  const shouldSyncDraftWhileEditing =
    (props.editValueBehavior ?? "freeze") === "sync-until-dirty";

  const syncValueSubscription = (): void => {
    if (props.valueState === undefined) {
      return;
    }

    const shouldListen =
      props.contentVisibility === undefined ||
      contentVisibleState.get() ||
      editingState.get();

    if (!shouldListen) {
      unsubscribeValue?.();
      unsubscribeValue = undefined;
      return;
    }

    if (unsubscribeValue !== undefined) {
      return;
    }

    unsubscribeValue = props.valueState.on(() => {
      syncRenderedValue();
      syncDraftFromCurrentValue();
    });
  };

  const syncActiveState = (): void => {
    const isActive = resolvedController.isCellActive(coord);
    activeState.set(isActive);
    activeAttrState.set(isActive ? "true" : undefined);
    tabIndexState.set(
      isActive ||
        (resolvedController.activeCell.get() === null &&
          coord.rowIndex === 0 &&
          coord.columnIndex === 0)
        ? 0
        : -1,
    );
  };

  const syncEditingState = (): void => {
    const isEditing = resolvedController.isCellEditing(coord);
    editingState.set(isEditing);
    editingAttrState.set(isEditing ? "true" : undefined);
    syncValueSubscription();
  };

  const syncSelectedState = (): void => {
    const isSelected = resolvedController.isCellSelected(coord);
    selectedState.set(isSelected);
    selectedAttrState.set(isSelected ? "true" : undefined);
    ariaSelectedState.set(isSelected ? "true" : "false");
  };

  const syncRenderedValue = (): void => {
    if (!contentVisibleState.get() && !editingState.get()) {
      return;
    }

    renderVersion.set(renderVersion.get() + 1);
  };

  const syncDraftFromCurrentValue = (): void => {
    lastSerializedValue = serialize(getCurrentValue());

    if (!shouldSyncDraftWhileEditing || !editingState.get() || draftDirty) {
      return;
    }

    syncingDraftFromValue = true;
    draftValue.set(lastSerializedValue);
    syncingDraftFromValue = false;
  };

  const unsubscribeActive = resolvedController.activeCell.on(() => {
    syncActiveState();
  });
  const unsubscribeEditing = resolvedController.editingCell.on(() => {
    syncEditingState();
  });
  const unsubscribeSelection = resolvedController.selection.on(() => {
    syncSelectedState();
  });
  const unsubscribeContentVisibility = props.contentVisibility?.on(
    ({ currentValue }) => {
      if (currentValue === contentVisibleState.get()) {
        return;
      }

      if (!currentValue) {
        hiddenValueState.set(serialize(getCurrentValue()));
        contentVisibleState.set(false);
        syncValueSubscription();
        return;
      }

      contentVisibleState.set(true);
      syncValueSubscription();
      syncRenderedValue();
      syncDraftFromCurrentValue();
    },
  );
  const unsubscribeDraft = draftValue.on(({ currentValue }) => {
    if (!editingState.get() || syncingDraftFromValue) {
      return;
    }

    draftDirty = !Object.is(currentValue, lastSerializedValue);
  });

  onCleanup(() => {
    unsubscribeActive();
    unsubscribeEditing();
    unsubscribeSelection();
    unsubscribeValue?.();
    unsubscribeContentVisibility?.();
    unsubscribeDraft();
    unregisterCell?.();
    unregisterElement?.();
  });

  const focusEditor = (): void => {
    queueMicrotask(() => {
      const focusTarget = findFocusableDescendant(editorHost);
      focusTarget?.focus();
      if (
        focusTarget instanceof HTMLInputElement ||
        focusTarget instanceof HTMLTextAreaElement
      ) {
        focusTarget.select();
      }
    });
  };

  const prepareDraft = (seed?: string): void => {
    lastSerializedValue = serialize(getCurrentValue());
    draftDirty = seed !== undefined && seed !== lastSerializedValue;
    syncingDraftFromValue = true;
    draftValue.set(seed ?? lastSerializedValue);
    syncingDraftFromValue = false;
  };

  const beginEditing = (seed?: string): void => {
    if (!isEditable) return;
    prepareDraft(seed);
    resolvedController.beginEdit(coord);
    focusEditor();
  };

  const commitDraft = (
    nextValue?: string,
    options?: { readonly focus?: boolean },
  ): void => {
    if (isEditable) {
      setValue(parse(nextValue ?? draftValue.get()));
    }
    resolvedController.endEdit(options);
  };

  const cancelDraft = (options?: { readonly focus?: boolean }): void => {
    prepareDraft();
    resolvedController.cancelEdit(options);
  };

  unregisterCell = resolvedController.registerCell(coord, {
    commitEdit: () => commitDraft(undefined, { focus: false }),
    editable: isEditable,
    getValue: getCurrentValue,
    parseValue: parse,
    serializeValue: serialize,
    ...(isEditable ? { setValue } : {}),
  });

  const handleSurfaceKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter" || event.key === "F2") {
      event.preventDefault();
      beginEditing();
      return;
    }

    if (isPrintableKey(event) && isEditable) {
      event.preventDefault();
      if (
        resolvedDataType.kind === "checkbox" ||
        resolvedDataType.kind === "select" ||
        resolvedDataType.kind === "multiselect"
      ) {
        beginEditing();
        return;
      }

      beginEditing(event.key);
      return;
    }

    resolvedController.handleCellKeyDown(coord, event);
  };

  const handleEditorKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        cancelDraft();
        return;
      case "Enter":
        if (
          resolvedDataType.kind === "textarea" ||
          resolvedDataType.kind === "select" ||
          resolvedDataType.kind === "multiselect" ||
          resolvedDataType.kind === "checkbox"
        ) {
          return;
        }
        event.preventDefault();
        commitDraft();
        resolvedController.moveActiveCell(1, 0);
        return;
      case "Tab":
        event.preventDefault();
        commitDraft();
        resolvedController.moveActiveCell(0, event.shiftKey ? -1 : 1);
        return;
      default:
        return;
    }
  };

  syncValueSubscription();

  const renderValue = (): BeatUiRenderable => {
    const currentValue = getCurrentValue();
    if (props.renderValue !== undefined) {
      return props.renderValue(currentValue);
    }

    if (props.children !== undefined) {
      return props.children;
    }

    return serialize(currentValue);
  };

  return (
    <div
      role="gridcell"
      class={props.class}
      aria-label={props.ariaLabel}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
      title={props.title}
      data-sheet-cell="true"
      data-row={String(coord.rowIndex)}
      data-column={String(coord.columnIndex)}
      data-active={activeAttrState}
      data-editing={editingAttrState}
      data-selected={selectedAttrState}
      aria-selected={ariaSelectedState}
      {...resolveDataAttributes(props.dataAttributes)}
      style={joinStyles(SHEET_CELL_STYLE, props.style)}
    >
      <Show
        when={editingState}
        fallback={() => (
          <button
            type="button"
            tabIndex={tabIndexState}
            style={joinStyles(
              SHEET_SURFACE_STYLE,
              getSurfaceAlignmentStyle(resolvedAlign),
            )}
            ref={(element: Element) => {
              if (!(element instanceof HTMLElement)) return;
              unregisterElement?.();
              unregisterElement = resolvedController.registerCellElement(
                coord,
                element,
              );
            }}
            onFocus={() =>
              resolvedController.activateCell(coord, { focus: false })
            }
            onMouseDown={(event: MouseEvent) => {
              resolvedController.beginSelectionDrag(coord, {
                extend: event.shiftKey,
              });
            }}
            onMouseEnter={(event: MouseEvent) => {
              if ((event.buttons & 1) !== 1) return;
              resolvedController.updateSelectionDrag(coord);
            }}
            onMouseUp={() => resolvedController.endSelectionDrag()}
            onDblClick={() => beginEditing()}
            onKeydown={handleSurfaceKeyDown}
          >
            <Show when={contentVisibleState} fallback={hiddenValueState}>
              {() => (
                <Show when={renderVersion} mapValue={() => true}>
                  {() => renderValue()}
                </Show>
              )}
            </Show>
          </button>
        )}
      >
        {() => (
          <div
            style={SHEET_EDITOR_WRAPPER_STYLE}
            ref={(element: Element) => {
              if (!(element instanceof HTMLElement)) return;
              editorHost = element;
            }}
            onKeydown={handleEditorKeyDown}
          >
            {props.renderEditor?.({
              align: resolvedAlign,
              value: draftValue,
              commit: commitDraft,
              cancel: cancelDraft,
            }) ??
              renderDefaultEditor({
                align: resolvedAlign,
                dataType: resolvedDataType,
                options: props.options,
                placeholder: props.placeholder,
                value: draftValue,
                commit: () => commitDraft(),
              })}
          </div>
        )}
      </Show>
    </div>
  );
});
