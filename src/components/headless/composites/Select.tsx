import { Show, component, onCleanup } from "@ochairo/beat";
import { type Pulse, pulse } from "@ochairo/pulse";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiControlledValueProps,
  type BeatUiFocusHandlers,
} from "../../../foundations";
import {
  isWithinFloatingLayer,
  measureFloatingLayerHeight,
  moveFloatingLayerToHost,
  positionFloatingLayer,
  resolveFloatingLayerZIndex,
  scheduleFloatingLayerMount,
} from "./floating-layer";

export interface SelectStyles {
  readonly trigger?: string | undefined;
  readonly triggerLabel?: string | undefined;
  readonly chevron?: string | undefined;
  readonly menu?: string | undefined;
  readonly item?: ((active: boolean, disabled: boolean) => string) | undefined;
  readonly searchInput?: string | undefined;
  readonly groupToggle?: string | undefined;
  readonly indent?: string | undefined;
}

export interface SelectOption {
  readonly children?: readonly SelectOption[] | undefined;
  readonly disabled?: boolean;
  readonly label: string;
  readonly isSelectable?: boolean;
  readonly triggerLabel?: string;
  readonly value: string;
}

interface FlatSelectOption {
  readonly option: SelectOption;
  readonly depth: number;
  readonly hasChildren: boolean;
}

export interface SelectProps
  extends
    BeatUiAccessibilityProps,
    BeatUiControlledValueProps<string>,
    BeatUiFocusHandlers {
  readonly canSearch?: boolean | undefined;
  readonly class?: string | undefined;
  readonly options: readonly SelectOption[];
  readonly placeholder?: string;
  readonly styles?: SelectStyles;
}

/** @deprecated Use SelectProps */
export type DropdownProps = SelectProps;
/** @deprecated Use SelectProps */
export type DropboxProps = SelectProps;
/** @deprecated Use SelectOption */
export type DropdownOption = SelectOption;
/** @deprecated Use SelectStyles */
export type DropdownStyles = SelectStyles;

interface SelectItemProps {
  readonly option: SelectOption;
  readonly index: number;
  readonly depth: number;
  readonly hasChildren: boolean;
  readonly expanded: boolean;
  readonly selectedValue: Pulse<string>;
  readonly highlightedIndex: Pulse<number>;
  readonly onSelect: (value: string) => void;
  readonly onToggleExpand: (value: string) => void;
  readonly itemStyle?:
    | ((active: boolean, disabled: boolean) => string)
    | undefined;
  readonly groupToggleStyle?: string | undefined;
  readonly indentStyle?: string | undefined;
}

const SelectItem = component<SelectItemProps>((props) => {
  const { option, index, depth } = props;

  function isActive(): boolean {
    return (
      option.value === props.selectedValue.get() ||
      props.highlightedIndex.get() === index
    );
  }

  function getInlineStyle(): string {
    if (props.itemStyle) {
      const indent = depth > 0 ? `margin-left:${depth * 2}rem;` : "";
      return `${props.itemStyle(isActive(), option.disabled ?? false)}${indent}`;
    }
    return depth > 0 ? `--depth:${depth}` : "";
  }

  return (
    <button
      role="option"
      type="button"
      data-part="item"
      data-highlighted={isActive()}
      disabled={option.disabled}
      aria-selected={option.value === props.selectedValue.get()}
      style={getInlineStyle()}
      ref={(el) => {
        onCleanup(
          props.selectedValue.on(() => {
            const btn = el as HTMLElement;
            btn.dataset["highlighted"] = String(isActive());
            if (props.itemStyle) {
              const indent = depth > 0 ? `margin-left:${depth * 2}rem;` : "";
              btn.style.cssText = `${props.itemStyle(isActive(), option.disabled ?? false)}${indent}`;
            }
          }),
        );
        onCleanup(
          props.highlightedIndex.on(() => {
            const btn = el as HTMLElement;
            btn.dataset["highlighted"] = String(isActive());
            if (props.itemStyle) {
              const indent = depth > 0 ? `margin-left:${depth * 2}rem;` : "";
              btn.style.cssText = `${props.itemStyle(isActive(), option.disabled ?? false)}${indent}`;
            }
          }),
        );
      }}
      onMouseenter={() => {
        if (!option.disabled) props.highlightedIndex.set(index);
      }}
      onMouseleave={() => {
        if (props.highlightedIndex.get() === index)
          props.highlightedIndex.set(-1);
      }}
      onClick={() => {
        const isSelectable = option.isSelectable ?? true;
        if (!option.disabled && isSelectable) props.onSelect(option.value);
      }}
    >
      {props.hasChildren ? (
        <span
          data-part="group-toggle"
          style={
            props.groupToggleStyle ??
            "cursor:pointer;margin-right:0.25rem;display:inline-block;font-size:0.625rem"
          }
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            props.onToggleExpand(option.value);
          }}
        >
          {props.expanded ? "▼" : "▶"}
        </span>
      ) : null}
      <span aria-hidden="true">
        {option.value === props.selectedValue.get() ? "✓" : ""}
      </span>
      {option.label}
    </button>
  );
});

export const HlSelect = component<SelectProps>((props) => {
  const state = createControllableState<string>({
    defaultValue: props.defaultValue ?? "",
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  const isOpen = pulse(false);
  const highlightedIndex = pulse(-1);
  const expandedKeys = pulse<readonly string[]>([]);
  let triggerEl: HTMLButtonElement | null = null;
  let dropdownEl: HTMLDivElement | null = null;
  let menuEl: HTMLDivElement | null = null;
  let inputEl: HTMLInputElement | null = null;
  let cleanupDropdownMount: (() => void) | null = null;
  let cleanupDropdownTracking: (() => void) | null = null;

  function updateDropdownPosition(): void {
    if (!triggerEl || !dropdownEl) return;
    positionFloatingLayer({
      anchor: triggerEl,
      layer: dropdownEl,
      matchAnchorWidth: true,
      height: measureFloatingLayerHeight(dropdownEl, menuEl),
    });
  }

  function stopDropdownTracking(): void {
    cleanupDropdownTracking?.();
    cleanupDropdownTracking = null;
  }

  function startDropdownTracking(): void {
    if (cleanupDropdownTracking !== null) return;
    const handleViewportChange = (): void => {
      if (!isOpen.get()) return;
      updateDropdownPosition();
    };
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    cleanupDropdownTracking = () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }

  function flattenOptions(
    options: readonly SelectOption[],
    depth: number,
  ): readonly FlatSelectOption[] {
    const result: FlatSelectOption[] = [];
    for (const option of options) {
      const hasChildren = (option.children?.length ?? 0) > 0;
      result.push({ option, depth, hasChildren });
      if (hasChildren && expandedKeys.get().includes(option.value)) {
        result.push(...flattenOptions(option.children!, depth + 1));
      }
    }
    return result;
  }

  function allOptionsFlat(
    options: readonly SelectOption[],
  ): readonly SelectOption[] {
    const result: SelectOption[] = [];
    for (const option of options) {
      result.push(option);
      if (option.children) {
        result.push(...allOptionsFlat(option.children));
      }
    }
    return result;
  }

  function currentLabel(): string {
    const selectedOption = currentOption();

    return (
      selectedOption?.triggerLabel ??
      selectedOption?.label ??
      props.placeholder ??
      ""
    );
  }

  function currentOption(): SelectOption | undefined {
    return allOptionsFlat(props.options).find(
      (option) => option.value === state.state.get(),
    );
  }

  const triggerLabel = pulse(currentLabel());
  onCleanup(state.state.on(() => triggerLabel.set(currentLabel())));

  const searchQuery = pulse("");

  function filteredOptions(): readonly FlatSelectOption[] {
    if (!props.canSearch) return flattenOptions(props.options, 0);
    const q = searchQuery.get().toLowerCase();
    if (q === "") return flattenOptions(props.options, 0);
    return flattenFiltered(props.options, q, 0);
  }

  function hasMatchInTree(
    options: readonly SelectOption[],
    q: string,
  ): boolean {
    for (const o of options) {
      if (o.label.toLowerCase().includes(q)) return true;
      if (o.children && hasMatchInTree(o.children, q)) return true;
    }
    return false;
  }

  function flattenFiltered(
    options: readonly SelectOption[],
    q: string,
    depth: number,
  ): FlatSelectOption[] {
    const result: FlatSelectOption[] = [];
    for (const option of options) {
      const selfMatch = option.label.toLowerCase().includes(q);
      const childMatch = option.children
        ? hasMatchInTree(option.children, q)
        : false;
      if (selfMatch || childMatch) {
        const hasChildren = (option.children?.length ?? 0) > 0;
        result.push({ option, depth, hasChildren });
        if (hasChildren) {
          result.push(...flattenFiltered(option.children!, q, depth + 1));
        }
      }
    }
    return result;
  }

  let itemCleanups: Array<(() => void) | undefined> = [];

  function renderItems(): void {
    if (!menuEl) return;
    for (const fn of itemCleanups) fn?.();
    itemCleanups = [];
    menuEl.innerHTML = "";
    const opts = filteredOptions();
    for (const [i, flat] of opts.entries()) {
      const rendered = SelectItem({
        option: flat.option,
        index: i,
        depth: flat.depth,
        hasChildren: flat.hasChildren,
        expanded: expandedKeys.get().includes(flat.option.value),
        selectedValue: state.state,
        highlightedIndex,
        onSelect: selectOption,
        onToggleExpand: toggleExpand,
        itemStyle: props.styles?.item,
        groupToggleStyle: props.styles?.groupToggle,
        indentStyle: props.styles?.indent,
      });
      if (
        rendered !== null &&
        rendered !== undefined &&
        typeof rendered === "object" &&
        "node" in rendered
      ) {
        const r = rendered as { node: Node; cleanup?: () => void };
        menuEl.appendChild(r.node);
        itemCleanups.push(r.cleanup);
      }
    }
    if (isOpen.get()) {
      queueMicrotask(() => {
        if (isOpen.get()) updateDropdownPosition();
      });
    }
  }

  onCleanup(expandedKeys.on(() => renderItems()));
  onCleanup(searchQuery.on(() => renderItems()));
  onCleanup(() => {
    for (const fn of itemCleanups) fn?.();
  });

  function toggleExpand(value: string): void {
    const current = expandedKeys.get();
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    expandedKeys.set(next);
  }

  function openMenu(): void {
    const opts = filteredOptions();
    const idx = opts.findIndex((o) => o.option.value === state.state.get());
    highlightedIndex.set(idx >= 0 ? idx : 0);
    isOpen.set(true);
    requestAnimationFrame(() => {
      if (props.canSearch) {
        inputEl?.focus();
      } else {
        menuEl?.focus();
      }
    });
  }

  function closeMenu(): void {
    isOpen.set(false);
    highlightedIndex.set(-1);
    searchQuery.set("");
    triggerEl?.focus();
  }

  function selectOption(value: string): void {
    state.setValue(value);
    closeMenu();
  }

  function onDocMouseDown(e: MouseEvent): void {
    const t = e.target as Node;
    if (!isWithinFloatingLayer(t, triggerEl, dropdownEl)) closeMenu();
  }

  onCleanup(
    isOpen.on(({ currentValue }) => {
      if (currentValue) {
        document.addEventListener("mousedown", onDocMouseDown);
      } else {
        document.removeEventListener("mousedown", onDocMouseDown);
        cleanupDropdownMount?.();
        cleanupDropdownMount = null;
        dropdownEl = null;
        menuEl = null;
        inputEl = null;
        stopDropdownTracking();
      }
    }),
  );
  onCleanup(() => document.removeEventListener("mousedown", onDocMouseDown));
  onCleanup(() => {
    cleanupDropdownMount?.();
    cleanupDropdownMount = null;
    stopDropdownTracking();
  });

  function onTriggerKeyDown(e: KeyboardEvent): void {
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      openMenu();
    }
  }

  function onMenuKeyDown(e: KeyboardEvent): void {
    const opts = filteredOptions();
    const hi = highlightedIndex.get();
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      highlightedIndex.set(Math.min(hi + 1, opts.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      highlightedIndex.set(Math.max(hi - 1, 0));
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const flat = opts[hi];
      if (flat && !flat.option.disabled) {
        const isSelectable = flat.option.isSelectable ?? true;
        if (isSelectable) selectOption(flat.option.value);
      }
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const flat = opts[hi];
      if (
        flat?.hasChildren &&
        !expandedKeys.get().includes(flat.option.value)
      ) {
        toggleExpand(flat.option.value);
      }
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const flat = opts[hi];
      if (flat?.hasChildren && expandedKeys.get().includes(flat.option.value)) {
        toggleExpand(flat.option.value);
      }
      return;
    }
    if (e.key.length === 1) {
      const char = e.key.toLowerCase();
      const idx = opts.findIndex(
        (o) =>
          !o.option.disabled && o.option.label.toLowerCase().startsWith(char),
      );
      if (idx >= 0) highlightedIndex.set(idx);
    }
  }

  return (
    <div
      class={props.class}
      style="position:relative;display:block;width:100%;height:100%"
    >
      <button
        id={props.id}
        type="button"
        data-part="trigger"
        disabled={props.disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={props.ariaLabel}
        aria-labelledby={props.ariaLabelledby}
        style={props.styles?.trigger}
        ref={(el) => {
          triggerEl = el as HTMLButtonElement;
        }}
        onClick={() => (isOpen.get() ? closeMenu() : openMenu())}
        onKeydown={onTriggerKeyDown}
        onFocus={props.onFocus}
        onBlur={(e: FocusEvent) => {
          const rel = (e as FocusEvent & { relatedTarget: Node | null })
            .relatedTarget;
          if (!isWithinFloatingLayer(rel, triggerEl, dropdownEl)) {
            props.onBlur?.(e);
          }
        }}
      >
        <span data-part="trigger-label" style={props.styles?.triggerLabel}>
          {triggerLabel}
        </span>
        <span
          data-part="chevron"
          style={props.styles?.chevron}
          ref={(el) => {
            onCleanup(
              isOpen.on(({ currentValue }) => {
                const chevron = el as HTMLElement;
                const baseStyle = props.styles?.chevron ?? "";
                chevron.style.cssText = currentValue
                  ? `${baseStyle};transform:rotate(180deg)`
                  : baseStyle;
              }),
            );
          }}
        >
          ▾
        </span>
      </button>
      <Show when={isOpen}>
        {() => (
          <div
            data-part="dropdown"
            data-beat-ui-select-popup="true"
            ref={(el) => {
              const htmlEl = el as HTMLDivElement;
              dropdownEl = htmlEl;
              if (htmlEl.style.zIndex === "") {
                htmlEl.style.zIndex = resolveFloatingLayerZIndex(triggerEl);
              }
              cleanupDropdownMount?.();
              cleanupDropdownMount = scheduleFloatingLayerMount(htmlEl);
              startDropdownTracking();
              queueMicrotask(() => {
                if (dropdownEl !== htmlEl || !isOpen.get()) return;
                moveFloatingLayerToHost(htmlEl);
                updateDropdownPosition();
              });
            }}
          >
            {props.canSearch ? (
              <input
                type="text"
                data-part="search-input"
                placeholder={props.placeholder ?? "Search..."}
                style={props.styles?.searchInput}
                ref={(el) => {
                  inputEl = el as HTMLInputElement;
                }}
                onInput={(e: Event) => {
                  const val = (e.currentTarget as HTMLInputElement).value;
                  searchQuery.set(val);
                  highlightedIndex.set(0);
                }}
                onKeydown={onMenuKeyDown}
              />
            ) : null}
            <div
              data-part="menu"
              role="listbox"
              tabindex={-1}
              style={props.styles?.menu}
              ref={(el) => {
                menuEl = el as HTMLDivElement;
                renderItems();
              }}
              onKeydown={onMenuKeyDown}
            />
          </div>
        )}
      </Show>
    </div>
  );
});

/** @deprecated Use Select */
export const HlDropdown = HlSelect;
/** @deprecated Use Select */
export const HlDropbox = HlSelect;
