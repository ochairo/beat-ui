import { component, onCleanup } from "@ochairo/beat";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiContentProps,
  type BeatUiControlledValueProps,
} from "../../../foundations";
import type { BeatUiRenderable } from "../../../runtime";

export type TabOrientation = "horizontal" | "vertical";

export interface TabStyles {
  readonly container?: string;
  readonly tabList?: string;
  readonly panel?: string;
  readonly tabButton?: (
    active: boolean,
    disabled: boolean | undefined,
  ) => string;
}

export interface TabItem {
  readonly content: BeatUiRenderable;
  readonly disabled?: boolean;
  readonly key: string;
  readonly label: string;
}

export interface TabProps
  extends
    BeatUiAccessibilityProps,
    BeatUiContentProps,
    BeatUiControlledValueProps<string> {
  readonly items: readonly TabItem[];
  readonly orientation?: TabOrientation;
  readonly styles?: TabStyles;
}

export const Tab = component<TabProps>((props) => {
  const orientation = props.orientation ?? "horizontal";

  const enabledItems = (): readonly TabItem[] =>
    props.items.filter((i) => !i.disabled);

  const state = createControllableState<string>({
    defaultValue: props.defaultValue ?? enabledItems()[0]?.key ?? "",
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  const buttonRefs = new Map<string, HTMLButtonElement>();

  function syncStyles(activeKey: string): void {
    for (const item of props.items) {
      const button = buttonRefs.get(item.key);
      if (button === undefined) continue;
      const isActive = item.key === activeKey;
      button.setAttribute("aria-selected", String(isActive));
      button.setAttribute("tabindex", isActive ? "0" : "-1");
      if (props.styles?.tabButton) {
        button.style.cssText =
          props.styles.tabButton(isActive, item.disabled) ?? "";
      }
    }
  }

  function focusButton(key: string): void {
    buttonRefs.get(key)?.focus();
  }

  function onKeyDown(e: KeyboardEvent): void {
    const enabled = enabledItems();
    const idx = enabled.findIndex((i) => i.key === state.state.get());
    const isHoriz = orientation === "horizontal";
    const prevKey = isHoriz ? "ArrowLeft" : "ArrowUp";
    const nextKey = isHoriz ? "ArrowRight" : "ArrowDown";

    if (e.key === nextKey) {
      e.preventDefault();
      const next = enabled[(idx + 1) % enabled.length];
      if (next !== undefined) {
        state.setValue(next.key);
        focusButton(next.key);
      }
      return;
    }
    if (e.key === prevKey) {
      e.preventDefault();
      const prev = enabled[(idx - 1 + enabled.length) % enabled.length];
      if (prev !== undefined) {
        state.setValue(prev.key);
        focusButton(prev.key);
      }
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      const first = enabled[0];
      if (first !== undefined) {
        state.setValue(first.key);
        focusButton(first.key);
      }
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      const last = enabled[enabled.length - 1];
      if (last !== undefined) {
        state.setValue(last.key);
        focusButton(last.key);
      }
    }
  }

  return (
    <div id={props.id} class={props.class} style={props.styles?.container}>
      <div
        data-part="tab-list"
        role="tablist"
        aria-orientation={orientation}
        aria-label={props.ariaLabel}
        aria-labelledby={props.ariaLabelledby}
        style={props.styles?.tabList}
        onKeydown={onKeyDown}
      >
        {props.items.map((item) => (
          <button
            type="button"
            data-part="tab-button"
            role="tab"
            aria-selected={item.key === state.state.get() ? "true" : "false"}
            aria-controls={`tabpanel-${item.key}`}
            id={`tab-${item.key}`}
            disabled={item.disabled}
            tabindex={item.key === state.state.get() ? 0 : -1}
            style={
              props.styles?.tabButton?.(
                item.key === state.state.get(),
                item.disabled,
              ) ?? ""
            }
            ref={(el) => {
              buttonRefs.set(item.key, el as HTMLButtonElement);
              onCleanup(
                state.state.on(({ currentValue }) => {
                  syncStyles(currentValue);
                }),
              );
              onCleanup(() => buttonRefs.delete(item.key));
            }}
            onClick={() => {
              if (!item.disabled) state.setValue(item.key);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div data-part="panel" style={props.styles?.panel}>
        {props.items.map((item) => {
          return (
            <div
              role="tabpanel"
              id={`tabpanel-${item.key}`}
              aria-labelledby={`tab-${item.key}`}
              ref={(el) => {
                const panel = el as HTMLElement;
                panel.hidden = state.state.get() !== item.key;
                onCleanup(
                  state.state.on(({ currentValue }) => {
                    panel.hidden = currentValue !== item.key;
                  }),
                );
              }}
            >
              {item.content}
            </div>
          );
        })}
      </div>
    </div>
  );
});
