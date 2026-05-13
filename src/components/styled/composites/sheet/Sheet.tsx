import { component, onCleanup, type BeatJsxChild } from "@ochairo/beat";
import { pulse, type Pulse } from "@ochairo/pulse";

import type { BeatUiAccessibilityProps } from "../../../../foundations";
import type { BeatUiRenderable, BeatUiState } from "../../../../runtime";
import {
  SheetBody as HeadlessSheetBody,
  SheetCell as HeadlessSheetCell,
  SheetColumnHeader as HeadlessSheetColumnHeader,
  SheetHeader as HeadlessSheetHeader,
  SheetRoot as HeadlessSheetRoot,
  SheetRow as HeadlessSheetRow,
  createSheetController,
  type SheetCellAlign,
  type SheetCellDataType,
  type SheetEditValueBehavior,
  type SheetDataAttributes,
  type SheetCellOption,
  type SheetController,
} from "../../../headless/sheet";
import css from "./Sheet.module.css";

export type SheetRowId = string | number;

export interface SheetResolvedProps {
  readonly class?: string | undefined;
  readonly cssVariables?: Readonly<Record<`--${string}`, string | undefined>>;
  readonly dataAttributes?: SheetDataAttributes | undefined;
  readonly style?: string | undefined;
  readonly title?: string | undefined;
}

export interface SheetClassNames {
  readonly frame?: string | undefined;
  readonly viewport?: string | undefined;
  readonly root?: string | undefined;
  readonly header?: string | undefined;
  readonly body?: string | undefined;
  readonly row?: string | undefined;
  readonly headerRow?: string | undefined;
  readonly bodyRow?: string | undefined;
  readonly headerCell?: string | undefined;
  readonly cell?: string | undefined;
  readonly stickyHeaderCell?: string | undefined;
  readonly stickyColumnCell?: string | undefined;
  readonly stickyCornerCell?: string | undefined;
}

export interface SheetStyles {
  readonly frame?: string | undefined;
  readonly viewport?: string | undefined;
  readonly root?: string | undefined;
  readonly header?: string | undefined;
  readonly body?: string | undefined;
  readonly row?: string | undefined;
  readonly headerRow?: string | undefined;
  readonly bodyRow?: string | undefined;
  readonly headerCell?: string | undefined;
  readonly cell?: string | undefined;
  readonly stickyHeaderCell?: string | undefined;
  readonly stickyColumnCell?: string | undefined;
  readonly stickyCornerCell?: string | undefined;
}

export interface SheetRowContext<Row> {
  readonly row: Row;
  readonly rowId: SheetRowId;
  readonly rowIndex: number;
}

interface SheetStickyContext {
  readonly isCorner: boolean;
  readonly isStickyLeft: boolean;
  readonly isStickyTop: boolean;
}

export interface SheetHeaderCellContext<Row> extends SheetStickyContext {
  readonly column: SheetColumnDefinition<Row>;
  readonly columnId: string;
  readonly columnIndex: number;
  readonly isSelected: boolean;
}

export interface SheetCellContext<Row> extends SheetStickyContext {
  readonly align: SheetCellAlign;
  readonly column: SheetColumnDefinition<Row>;
  readonly columnId: string;
  readonly columnIndex: number;
  readonly dataType?: SheetCellDataType | undefined;
  readonly editable: boolean;
  readonly isActive: boolean;
  readonly isEditing: boolean;
  readonly isSelected: boolean;
  readonly row: Row;
  readonly rowId: SheetRowId;
  readonly rowIndex: number;
  readonly value: unknown;
}

export interface SheetColumnDefinition<Row> {
  readonly align?: SheetCellAlign | undefined;
  readonly dataType?: SheetCellDataType | undefined;
  readonly editValueBehavior?:
    | SheetEditValueBehavior
    | ((row: Row, rowIndex: number) => SheetEditValueBehavior)
    | undefined;
  readonly editable?: boolean | ((row: Row, rowIndex: number) => boolean);
  readonly getValueState: (row: Row, rowIndex: number) => BeatUiState<unknown>;
  readonly id: string;
  readonly minHeight?: string | undefined;
  readonly options?: readonly SheetCellOption[] | undefined;
  readonly renderValue?:
    | ((value: unknown, row: Row, rowIndex: number) => BeatUiRenderable)
    | undefined;
  readonly title: BeatUiRenderable;
  readonly width: string;
}

export interface SheetProps<Row> extends BeatUiAccessibilityProps {
  readonly class?: string | undefined;
  readonly classNames?: SheetClassNames | undefined;
  readonly columns: readonly SheetColumnDefinition<Row>[];
  readonly controller?: SheetController | undefined;
  readonly editValueBehavior?: SheetEditValueBehavior | undefined;
  readonly getCellProps?:
    | ((context: SheetCellContext<Row>) => SheetResolvedProps | undefined)
    | undefined;
  readonly getHeaderCellProps?:
    | ((context: SheetHeaderCellContext<Row>) => SheetResolvedProps | undefined)
    | undefined;
  readonly getRowId?: ((row: Row, rowIndex: number) => SheetRowId) | undefined;
  readonly getRowProps?:
    | ((context: SheetRowContext<Row>) => SheetResolvedProps | undefined)
    | undefined;
  readonly height?: string | undefined;
  readonly minRowHeight?: string | undefined;
  readonly rowVirtualizationOverscan?: number | undefined;
  readonly rowVirtualizationRootMargin?: string | undefined;
  readonly renderCell?:
    | ((context: SheetCellContext<Row>) => BeatUiRenderable)
    | undefined;
  readonly rows: readonly Row[];
  readonly stickyColumnCount?: number | undefined;
  readonly stickyHeader?: boolean | undefined;
  readonly style?: string | undefined;
  readonly styles?: SheetStyles | undefined;
  readonly virtualizeRows?: boolean | undefined;
}

function joinClasses(...values: Array<string | undefined>): string | undefined {
  const next = values.filter((value) => value !== undefined && value !== "");
  return next.length > 0 ? next.join(" ") : undefined;
}

function joinStyles(...values: Array<string | undefined>): string | undefined {
  const next = values.filter((value) => value !== undefined && value !== "");
  return next.length > 0 ? next.join(";") : undefined;
}

function mergeDataAttributes(
  ...values: Array<SheetDataAttributes | undefined>
): SheetDataAttributes | undefined {
  const next: Record<`data-${string}`, string | number | boolean | undefined> =
    {};

  for (const value of values) {
    if (value === undefined) continue;

    for (const [name, entry] of Object.entries(value)) {
      if (!name.startsWith("data-")) {
        continue;
      }

      next[name as `data-${string}`] = entry;
    }
  }

  return Object.keys(next).length > 0 ? next : undefined;
}

function serializeCssVariables(
  cssVariables: Readonly<Record<`--${string}`, string | undefined>> | undefined,
): string | undefined {
  if (cssVariables === undefined) {
    return undefined;
  }

  const next: string[] = [];

  for (const [name, value] of Object.entries(cssVariables)) {
    if (!name.startsWith("--") || value === undefined || value === "") {
      continue;
    }

    next.push(`${name}:${value}`);
  }

  return next.length > 0 ? next.join(";") : undefined;
}

function resolveRowId<Row>(
  row: Row,
  rowIndex: number,
  getRowId: SheetProps<Row>["getRowId"],
): SheetRowId {
  return getRowId?.(row, rowIndex) ?? rowIndex;
}

function resolveCellAlign(
  align: SheetCellAlign | undefined,
  dataType: SheetCellDataType | undefined,
): SheetCellAlign {
  if (align !== undefined) {
    return align;
  }

  if (
    dataType === "integer" ||
    dataType === "decimal" ||
    (dataType !== undefined && /^decimal\((\d+)\s*,\s*(\d+)\)$/i.test(dataType))
  ) {
    return "right";
  }

  return "left";
}

function createStickyContext(
  stickyHeader: boolean,
  stickyLeft: string | null,
): SheetStickyContext {
  return {
    isCorner: stickyHeader && stickyLeft !== null,
    isStickyLeft: stickyLeft !== null,
    isStickyTop: stickyHeader,
  };
}

function resolveResolvedPropsStyle(
  baseStyle: string | undefined,
  resolvedProps: SheetResolvedProps | undefined,
): string | undefined {
  return joinStyles(
    baseStyle,
    serializeCssVariables(resolvedProps?.cssVariables),
    resolvedProps?.style,
  );
}

function resolveResolvedPropsTitle(
  resolvedProps: SheetResolvedProps | undefined,
): string | undefined {
  return resolvedProps?.title;
}

function resolveStickyLeft<Row>(
  columns: readonly SheetColumnDefinition<Row>[],
  stickyColumnCount: number,
  columnIndex: number,
): string | null {
  if (columnIndex >= stickyColumnCount) {
    return null;
  }

  const stickyWidths: string[] = [];
  for (let index = 0; index < columnIndex; index += 1) {
    stickyWidths.push(columns[index]?.width ?? "0px");
  }

  if (stickyWidths.length === 0) {
    return "0px";
  }

  if (stickyWidths.length === 1) {
    return stickyWidths[0] ?? "0px";
  }

  return `calc(${stickyWidths.join(" + ")})`;
}

function createHeaderCellStyle(
  width: string,
  stickyLeft: string | null,
): string {
  return (
    joinStyles(
      [
        `flex:0 0 ${width}`,
        `width:${width}`,
        "padding:var(--beat-ui-sheet-header-padding, 0.75rem 0.875rem)",
        "border-right:1px solid var(--beat-ui-sheet-header-border-color, var(--beat-ui-color-border))",
        "border-bottom:1px solid var(--beat-ui-sheet-header-bottom-border-color, var(--beat-ui-color-border-strong))",
        "box-sizing:border-box",
      ].join(";"),
      stickyLeft !== null
        ? [
            "position:sticky",
            `left:${stickyLeft}`,
            "z-index:var(--beat-ui-z-index-toast, 50)",
            "pointer-events:auto",
            "transform:translateZ(0)",
          ].join(";")
        : undefined,
    ) ?? ""
  );
}

function createBodyCellStyle(
  width: string,
  minHeight: string,
  lastRow: boolean,
  stickyLeft: string | null,
): string {
  return (
    joinStyles(
      [
        `flex:0 0 ${width}`,
        `width:${width}`,
        `min-height:${minHeight}`,
        "border-right:1px solid var(--beat-ui-sheet-cell-border-color, var(--beat-ui-color-border))",
        lastRow
          ? "border-bottom:none"
          : "border-bottom:1px solid var(--beat-ui-sheet-cell-border-color, var(--beat-ui-color-border))",
        "box-sizing:border-box",
        "color:var(--beat-ui-sheet-cell-color, var(--beat-ui-color-text))",
      ].join(";"),
      stickyLeft !== null
        ? [
            "position:sticky",
            `left:${stickyLeft}`,
            "z-index:var(--beat-ui-z-index-popover, 20)",
            "pointer-events:auto",
            "transform:translateZ(0)",
          ].join(";")
        : undefined,
    ) ?? ""
  );
}

function resolveRowVirtualizationRootMargin(
  overscan: number,
  rootMargin?: string,
): string {
  if (rootMargin !== undefined && rootMargin.trim().length > 0) {
    return rootMargin;
  }

  const clampedOverscan = Math.max(0, overscan);
  return `${clampedOverscan}px 0px ${clampedOverscan}px 0px`;
}

interface SheetBodyRowComponentProps<Row> {
  readonly classNames: SheetClassNames | undefined;
  readonly columns: readonly SheetColumnDefinition<Row>[];
  readonly controller: SheetController;
  readonly editValueBehavior: SheetEditValueBehavior | undefined;
  readonly getCellProps: SheetProps<Row>["getCellProps"];
  readonly getViewportElement: () => HTMLElement | null;
  readonly minRowHeight: string;
  readonly renderCell: SheetProps<Row>["renderCell"];
  readonly row: Row;
  readonly rowCount: number;
  readonly rowId: SheetRowId;
  readonly rowIndex: number;
  readonly rowResolvedProps: SheetResolvedProps | undefined;
  readonly rowVirtualizationOverscan: number;
  readonly rowVirtualizationRootMargin: string | undefined;
  readonly stickyColumnCount: number;
  readonly styles: SheetStyles | undefined;
  readonly viewportVersion: Pulse<number>;
  readonly virtualizeRows: boolean;
}

const SheetBodyRowImpl = <Row,>(
  props: SheetBodyRowComponentProps<Row>,
): BeatJsxChild => {
  const contentVisibility = pulse(true);
  let rowElement: Element | null = null;
  let observer: IntersectionObserver | null = null;

  const disconnectObserver = (): void => {
    observer?.disconnect();
    observer = null;
  };

  const syncObserver = (): void => {
    if (!props.virtualizeRows || typeof IntersectionObserver === "undefined") {
      disconnectObserver();
      contentVisibility.set(true);
      return;
    }

    const viewportElement = props.getViewportElement();
    if (rowElement === null || viewportElement === null) {
      contentVisibility.set(true);
      return;
    }

    disconnectObserver();
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        contentVisibility.set(entry?.isIntersecting ?? true);
      },
      {
        root: viewportElement,
        rootMargin: resolveRowVirtualizationRootMargin(
          props.rowVirtualizationOverscan,
          props.rowVirtualizationRootMargin,
        ),
        threshold: 0,
      },
    );
    observer.observe(rowElement);
  };

  onCleanup(() => {
    disconnectObserver();
  });

  onCleanup(
    props.viewportVersion.on(() => {
      queueMicrotask(() => {
        syncObserver();
      });
    }),
  );

  return (
    <HeadlessSheetRow
      class={joinClasses(
        props.classNames?.row,
        props.classNames?.bodyRow,
        props.rowResolvedProps?.class,
      )}
      dataAttributes={mergeDataAttributes(
        {
          "data-row-id": props.rowId,
          "data-row-index": props.rowIndex,
        },
        props.rowResolvedProps?.dataAttributes,
      )}
      ref={(element) => {
        rowElement = element;
        queueMicrotask(() => {
          if (rowElement === element) {
            syncObserver();
          }
        });
      }}
      style={resolveResolvedPropsStyle(
        joinStyles(props.styles?.row, props.styles?.bodyRow),
        props.rowResolvedProps,
      )}
      title={resolveResolvedPropsTitle(props.rowResolvedProps)}
    >
      {props.columns.map((column, columnIndex) => {
        const valueState = column.getValueState(props.row, props.rowIndex);
        const currentValue = valueState.get();
        const resolvedEditable =
          typeof column.editable === "function"
            ? column.editable(props.row, props.rowIndex)
            : (column.editable ?? true);
        const resolvedEditValueBehavior =
          typeof column.editValueBehavior === "function"
            ? column.editValueBehavior(props.row, props.rowIndex)
            : (column.editValueBehavior ?? props.editValueBehavior ?? "freeze");
        const stickyLeft = resolveStickyLeft(
          props.columns,
          props.stickyColumnCount,
          columnIndex,
        );
        const stickyContext = createStickyContext(false, stickyLeft);
        const cellContext = (value: unknown): SheetCellContext<Row> => ({
          align: resolveCellAlign(column.align, column.dataType),
          column,
          columnId: column.id,
          columnIndex,
          dataType: column.dataType,
          editable: resolvedEditable,
          isActive: props.controller.isCellActive({
            rowIndex: props.rowIndex,
            columnIndex,
          }),
          isEditing: props.controller.isCellEditing({
            rowIndex: props.rowIndex,
            columnIndex,
          }),
          isSelected: props.controller.isCellSelected({
            rowIndex: props.rowIndex,
            columnIndex,
          }),
          row: props.row,
          rowId: props.rowId,
          rowIndex: props.rowIndex,
          value,
          ...stickyContext,
        });
        const resolvedProps = props.getCellProps?.(cellContext(currentValue));
        const renderValue =
          props.renderCell !== undefined
            ? (value: unknown) => props.renderCell?.(cellContext(value))
            : column.renderValue === undefined
              ? undefined
              : (value: unknown) =>
                  column.renderValue?.(value, props.row, props.rowIndex);

        return (
          <HeadlessSheetCell
            align={column.align}
            class={joinClasses(
              props.classNames?.cell,
              stickyContext.isStickyLeft
                ? props.classNames?.stickyColumnCell
                : undefined,
              resolvedProps?.class,
            )}
            contentVisibility={contentVisibility}
            controller={props.controller}
            columnIndex={columnIndex}
            dataAttributes={mergeDataAttributes(
              {
                "data-row-id": props.rowId,
                "data-column-id": column.id,
                "data-align": resolveCellAlign(column.align, column.dataType),
                "data-data-type": column.dataType,
                "data-editable": resolvedEditable ? "true" : undefined,
                "data-sticky-left": stickyContext.isStickyLeft
                  ? "true"
                  : undefined,
              },
              resolvedProps?.dataAttributes,
            )}
            dataType={column.dataType}
            editValueBehavior={resolvedEditValueBehavior}
            editable={resolvedEditable}
            options={column.options}
            renderValue={renderValue}
            rowIndex={props.rowIndex}
            style={resolveResolvedPropsStyle(
              joinStyles(
                props.styles?.cell,
                stickyContext.isStickyLeft
                  ? props.styles?.stickyColumnCell
                  : undefined,
                createBodyCellStyle(
                  column.width,
                  column.minHeight ?? props.minRowHeight,
                  props.rowIndex === props.rowCount - 1,
                  stickyLeft,
                ),
              ),
              resolvedProps,
            )}
            title={resolveResolvedPropsTitle(resolvedProps)}
            valueState={valueState}
          />
        );
      })}
    </HeadlessSheetRow>
  );
};

type SheetBodyRowComponent = <Row>(
  props: SheetBodyRowComponentProps<Row>,
) => BeatJsxChild;

const SheetBodyRow = component(
  SheetBodyRowImpl as (
    props: SheetBodyRowComponentProps<unknown>,
  ) => BeatJsxChild,
) as SheetBodyRowComponent;

const SheetImpl = <Row,>(props: SheetProps<Row>): BeatJsxChild => {
  const controller = props.controller ?? createSheetController();
  const stickyColumnCount = Math.max(
    0,
    Math.min(props.stickyColumnCount ?? 0, props.columns.length),
  );
  const minRowHeight = props.minRowHeight ?? "3.25rem";
  const rowVirtualizationOverscan = props.rowVirtualizationOverscan ?? 192;
  const rowVirtualizationRootMargin = props.rowVirtualizationRootMargin;
  const stickyHeader = props.stickyHeader !== false;
  const viewportVersion = pulse(0);
  const virtualizeRows = props.virtualizeRows === true;
  const useSplitHeaderViewport = stickyHeader;
  const rootDataAttributes = mergeDataAttributes({
    "data-sticky-header": stickyHeader ? "true" : undefined,
    "data-sticky-columns": stickyColumnCount,
  });
  let bodyViewportElement: HTMLDivElement | null = null;
  let headerViewportElement: HTMLDivElement | null = null;
  let cleanupViewportBindings: (() => void) | null = null;

  const getViewportElement = (): HTMLElement | null => bodyViewportElement;

  const syncHeaderViewport = (): void => {
    if (!stickyHeader) {
      return;
    }

    const headerViewport = headerViewportElement;
    const bodyViewport = bodyViewportElement;
    if (headerViewport === null || bodyViewport === null) {
      return;
    }

    if (headerViewport.scrollLeft !== bodyViewport.scrollLeft) {
      headerViewport.scrollLeft = bodyViewport.scrollLeft;
    }

    headerViewport.style.setProperty(
      "--beat-ui-sheet-scrollbar-gutter",
      `${Math.max(bodyViewport.offsetWidth - bodyViewport.clientWidth, 0)}px`,
    );
  };

  const bindBodyViewport = (element: HTMLDivElement): void => {
    cleanupViewportBindings?.();
    bodyViewportElement = element;

    const handleScroll = (): void => {
      syncHeaderViewport();
    };

    const resizeObserver =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            syncHeaderViewport();
          })
        : null;

    element.addEventListener("scroll", handleScroll, { passive: true });
    resizeObserver?.observe(element);

    const rootElement = element.firstElementChild;
    if (rootElement instanceof HTMLElement) {
      resizeObserver?.observe(rootElement);
    }

    queueMicrotask(() => {
      if (bodyViewportElement !== element) {
        return;
      }

      viewportVersion.set(viewportVersion.get() + 1);
      syncHeaderViewport();
    });

    cleanupViewportBindings = () => {
      element.removeEventListener("scroll", handleScroll);
      resizeObserver?.disconnect();

      if (bodyViewportElement === element) {
        bodyViewportElement = null;
      }
    };
  };

  onCleanup(() => {
    cleanupViewportBindings?.();
  });

  const headerSection = (
    <HeadlessSheetHeader
      class={joinClasses(
        stickyHeader
          ? useSplitHeaderViewport
            ? css["splitHeader"]!
            : css["header"]!
          : undefined,
        props.classNames?.header,
      )}
      dataAttributes={{
        "data-sticky-top": stickyHeader ? "true" : undefined,
      }}
      style={props.styles?.header}
    >
      <HeadlessSheetRow
        class={joinClasses(props.classNames?.row, props.classNames?.headerRow)}
        style={joinStyles(props.styles?.row, props.styles?.headerRow)}
      >
        {props.columns.map((column, columnIndex) => {
          const stickyLeft = resolveStickyLeft(
            props.columns,
            stickyColumnCount,
            columnIndex,
          );
          const stickyContext = createStickyContext(stickyHeader, stickyLeft);
          const headerContext: SheetHeaderCellContext<Row> = {
            column,
            columnId: column.id,
            columnIndex,
            isSelected: controller.isColumnHeaderSelected(columnIndex),
            ...stickyContext,
          };
          const resolvedProps = props.getHeaderCellProps?.(headerContext);

          return (
            <HeadlessSheetColumnHeader
              class={joinClasses(
                props.classNames?.headerCell,
                stickyContext.isStickyTop
                  ? props.classNames?.stickyHeaderCell
                  : undefined,
                stickyContext.isStickyLeft
                  ? props.classNames?.stickyColumnCell
                  : undefined,
                stickyContext.isCorner
                  ? props.classNames?.stickyCornerCell
                  : undefined,
                resolvedProps?.class,
              )}
              columnIndex={columnIndex}
              dataAttributes={mergeDataAttributes(
                {
                  "data-column-id": column.id,
                  "data-column-index": columnIndex,
                  "data-sticky-top": stickyContext.isStickyTop
                    ? "true"
                    : undefined,
                  "data-sticky-left": stickyContext.isStickyLeft
                    ? "true"
                    : undefined,
                  "data-sticky-corner": stickyContext.isCorner
                    ? "true"
                    : undefined,
                },
                resolvedProps?.dataAttributes,
              )}
              style={resolveResolvedPropsStyle(
                joinStyles(
                  props.styles?.headerCell,
                  stickyContext.isStickyTop
                    ? props.styles?.stickyHeaderCell
                    : undefined,
                  stickyContext.isStickyLeft
                    ? props.styles?.stickyColumnCell
                    : undefined,
                  stickyContext.isCorner
                    ? props.styles?.stickyCornerCell
                    : undefined,
                  createHeaderCellStyle(column.width, stickyLeft),
                ),
                resolvedProps,
              )}
              title={resolveResolvedPropsTitle(resolvedProps)}
            >
              {column.title}
            </HeadlessSheetColumnHeader>
          );
        })}
      </HeadlessSheetRow>
    </HeadlessSheetHeader>
  );

  const bodySection = (
    <HeadlessSheetBody
      class={props.classNames?.body}
      style={props.styles?.body}
    >
      {props.rows.map((row, rowIndex) => {
        const rowId = resolveRowId(row, rowIndex, props.getRowId);
        const rowContext: SheetRowContext<Row> = {
          row,
          rowId,
          rowIndex,
        };
        const rowResolvedProps = props.getRowProps?.(rowContext);

        return (
          <SheetBodyRow
            classNames={props.classNames}
            columns={props.columns}
            controller={controller}
            editValueBehavior={props.editValueBehavior}
            getCellProps={props.getCellProps}
            getViewportElement={getViewportElement}
            minRowHeight={minRowHeight}
            renderCell={props.renderCell}
            row={row}
            rowCount={props.rows.length}
            rowId={rowId}
            rowIndex={rowIndex}
            rowResolvedProps={rowResolvedProps}
            rowVirtualizationOverscan={rowVirtualizationOverscan}
            rowVirtualizationRootMargin={rowVirtualizationRootMargin}
            stickyColumnCount={stickyColumnCount}
            styles={props.styles}
            viewportVersion={viewportVersion}
            virtualizeRows={virtualizeRows}
          />
        );
      })}
    </HeadlessSheetBody>
  );

  return (
    <div
      class={joinClasses(css["frame"]!, props.classNames?.frame, props.class)}
      style={joinStyles(
        props.styles?.frame,
        props.height !== undefined ? `height:${props.height}` : undefined,
        props.style,
      )}
    >
      {useSplitHeaderViewport ? (
        <>
          <div
            class={css["headerViewport"]!}
            data-sheet-header-viewport="true"
            ref={(element) => {
              if (!(element instanceof HTMLDivElement)) {
                return;
              }

              headerViewportElement = element;
              queueMicrotask(() => {
                if (headerViewportElement === element) {
                  syncHeaderViewport();
                }
              });
            }}
          >
            <HeadlessSheetRoot
              controller={controller}
              role="presentation"
              class={joinClasses(css["root"]!, props.classNames?.root)}
              dataAttributes={rootDataAttributes}
              style={props.styles?.root}
            >
              {headerSection}
            </HeadlessSheetRoot>
          </div>
          <div
            class={joinClasses(css["viewport"]!, props.classNames?.viewport)}
            data-sheet-body-viewport="true"
            ref={(element) => {
              if (!(element instanceof HTMLDivElement)) {
                return;
              }

              bindBodyViewport(element);
            }}
            style={props.styles?.viewport}
          >
            <HeadlessSheetRoot
              controller={controller}
              class={joinClasses(css["root"]!, props.classNames?.root)}
              ariaLabel={props.ariaLabel}
              ariaLabelledby={props.ariaLabelledby}
              ariaDescribedby={props.ariaDescribedby}
              dataAttributes={rootDataAttributes}
              style={props.styles?.root}
            >
              {bodySection}
            </HeadlessSheetRoot>
          </div>
        </>
      ) : (
        <div
          class={joinClasses(css["viewport"]!, props.classNames?.viewport)}
          data-sheet-body-viewport="true"
          ref={(element) => {
            if (!(element instanceof HTMLDivElement)) {
              return;
            }

            bindBodyViewport(element);
          }}
          style={props.styles?.viewport}
        >
          <HeadlessSheetRoot
            controller={controller}
            class={joinClasses(css["root"]!, props.classNames?.root)}
            ariaLabel={props.ariaLabel}
            ariaLabelledby={props.ariaLabelledby}
            ariaDescribedby={props.ariaDescribedby}
            dataAttributes={rootDataAttributes}
            style={props.styles?.root}
          >
            {headerSection}
            {bodySection}
          </HeadlessSheetRoot>
        </div>
      )}
    </div>
  );
};

type SheetComponent = <Row>(props: SheetProps<Row>) => BeatJsxChild;

export const Sheet = component(
  SheetImpl as (props: SheetProps<unknown>) => BeatJsxChild,
) as SheetComponent;
