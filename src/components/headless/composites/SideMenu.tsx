import { component, onCleanup } from "@ochairo/beat";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiControlledValueProps,
} from "../../../foundations";

export interface SideMenuStyles {
  readonly nav?: string;
  readonly item?: (active: boolean, disabled: boolean | undefined) => string;
  readonly description?: string;
}

export interface SideMenuItem {
  readonly description?: string;
  readonly disabled?: boolean;
  readonly key: string;
  readonly label: string;
}

export interface SideMenuProps
  extends BeatUiAccessibilityProps, BeatUiControlledValueProps<string> {
  readonly items: readonly SideMenuItem[];
  readonly orientation?: "vertical" | "horizontal";
  readonly styles?: SideMenuStyles;
}

export const SideMenu = component<SideMenuProps>((props) => {
  const state = createControllableState<string>({
    defaultValue: props.defaultValue ?? props.items[0]?.key ?? "",
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
      if (isActive) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
      if (props.styles?.item) {
        button.style.cssText = props.styles.item(isActive, item.disabled) ?? "";
      }
    }
  }

  return (
    <nav
      id={props.id}
      class={props.class}
      aria-label={props.ariaLabel ?? "Navigation"}
      aria-labelledby={props.ariaLabelledby}
      aria-orientation={props.orientation ?? "vertical"}
      style={props.styles?.nav}
    >
      {props.items.map((item) => (
        <button
          type="button"
          data-part="item"
          disabled={item.disabled}
          aria-current={item.key === state.state.get() ? "page" : undefined}
          style={
            props.styles?.item?.(
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
          <span>{item.label}</span>
          {item.description !== undefined ? (
            <span data-part="description" style={props.styles?.description}>
              {item.description}
            </span>
          ) : null}
        </button>
      ))}
    </nav>
  );
});
