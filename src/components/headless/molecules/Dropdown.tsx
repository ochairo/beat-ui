import { Show, component, onCleanup } from "@ochairo/beat";
import { type Pulse, pulse } from "@ochairo/pulse";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiControlledValueProps,
  type BeatUiFocusHandlers,
} from "../../../foundations";

export interface DropdownStyles {
  readonly trigger?: string | undefined;
  readonly chevron?: string | undefined;
  readonly menu?: string | undefined;
  readonly item?: ((active: boolean, disabled: boolean) => string) | undefined;
}

export interface DropdownOption {
  readonly disabled?: boolean;
  readonly label: string;
  readonly value: string;
}

export interface DropdownProps
  extends
    BeatUiAccessibilityProps,
    BeatUiControlledValueProps<string>,
    BeatUiFocusHandlers {
  readonly options: readonly DropdownOption[];
  readonly placeholder?: string;
  readonly styles?: DropdownStyles;
}

export type DropboxProps = DropdownProps;

interface DropdownItemProps {
  readonly option: DropdownOption;
  readonly index: number;
  readonly selectedValue: Pulse<string>;
  readonly highlightedIndex: Pulse<number>;
  readonly onSelect: (value: string) => void;
  readonly itemStyle?:
    | ((active: boolean, disabled: boolean) => string)
    | undefined;
}

const DropdownItem = component<DropdownItemProps>((props) => {
  const { option, index } = props;

  function isActive(): boolean {
    return (
      option.value === props.selectedValue.get() ||
      props.highlightedIndex.get() === index
    );
  }

  return (
    <button
      role="option"
      type="button"
      disabled={option.disabled}
      aria-selected={option.value === props.selectedValue.get()}
      style={props.itemStyle?.(isActive(), option.disabled ?? false)}
      ref={(el) => {
        onCleanup(
          props.selectedValue.on(() => {
            (el as HTMLElement).style.cssText =
              props.itemStyle?.(isActive(), option.disabled ?? false) ?? "";
          }),
        );
        onCleanup(
          props.highlightedIndex.on(() => {
            (el as HTMLElement).style.cssText =
              props.itemStyle?.(isActive(), option.disabled ?? false) ?? "";
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
        if (!option.disabled) props.onSelect(option.value);
      }}
    >
      <span aria-hidden="true">
        {option.value === props.selectedValue.get() ? "✓" : ""}
      </span>
      {option.label}
    </button>
  );
});

export const Dropdown = component<DropdownProps>((props) => {
  const state = createControllableState<string>({
    defaultValue: props.defaultValue ?? "",
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  const isOpen = pulse(false);
  const highlightedIndex = pulse(-1);
  let triggerEl: HTMLButtonElement | null = null;
  let menuEl: HTMLDivElement | null = null;

  function currentLabel(): string {
    return (
      props.options.find((o) => o.value === state.state.get())?.label ??
      props.placeholder ??
      ""
    );
  }

  function openMenu(): void {
    const idx = props.options.findIndex((o) => o.value === state.state.get());
    highlightedIndex.set(idx >= 0 ? idx : 0);
    isOpen.set(true);
    requestAnimationFrame(() => menuEl?.focus());
  }

  function closeMenu(): void {
    isOpen.set(false);
    highlightedIndex.set(-1);
    triggerEl?.focus();
  }

  function selectOption(value: string): void {
    state.setValue(value);
    closeMenu();
  }

  function onDocMouseDown(e: MouseEvent): void {
    const t = e.target as Node;
    if (!triggerEl?.contains(t) && !menuEl?.contains(t)) closeMenu();
  }

  onCleanup(
    isOpen.on(({ currentValue }) => {
      if (currentValue) {
        document.addEventListener("mousedown", onDocMouseDown);
      } else {
        document.removeEventListener("mousedown", onDocMouseDown);
      }
    }),
  );
  onCleanup(() => document.removeEventListener("mousedown", onDocMouseDown));

  function onTriggerKeyDown(e: KeyboardEvent): void {
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      openMenu();
    }
  }

  function onMenuKeyDown(e: KeyboardEvent): void {
    const opts = props.options;
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
      const opt = opts[hi];
      if (opt && !opt.disabled) selectOption(opt.value);
      return;
    }
    if (e.key.length === 1) {
      const char = e.key.toLowerCase();
      const idx = opts.findIndex(
        (o) => !o.disabled && o.label.toLowerCase().startsWith(char),
      );
      if (idx >= 0) highlightedIndex.set(idx);
    }
  }

  return (
    <div style="position:relative;width:100%">
      <button
        id={props.id}
        type="button"
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
          if (!menuEl?.contains(rel)) props.onBlur?.(e);
        }}
      >
        <span>{currentLabel()}</span>
        <span
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
            role="listbox"
            tabindex={-1}
            style={props.styles?.menu}
            ref={(el) => {
              menuEl = el as HTMLDivElement;
            }}
            onKeydown={onMenuKeyDown}
          >
            {props.options.map((option, i) =>
              DropdownItem({
                option,
                index: i,
                selectedValue: state.state,
                highlightedIndex,
                onSelect: selectOption,
                itemStyle: props.styles?.item,
              }),
            )}
          </div>
        )}
      </Show>
    </div>
  );
});

export const Dropbox = Dropdown;
