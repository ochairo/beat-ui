import { component, Show } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";

import type { BeatUiAccessibilityProps } from "../../../foundations";
import type { BeatUiRenderable } from "../../../runtime";

export type AppShellSidebarMode = "none" | "fixed" | "toggle";

export interface AppShellStyles {
  readonly root?: string;
  readonly header?: string;
  readonly headerLeft?: string;
  readonly headerRight?: string;
  readonly menuButton?: string;
  readonly brand?: string;
  readonly body?: string;
  readonly sidebar?: string;
  readonly content?: string;
}

export interface AppShellNavItem {
  readonly key: string;
  readonly label: string;
}

export interface AppShellProps extends BeatUiAccessibilityProps {
  readonly brand?: BeatUiRenderable;
  readonly brandHref?: string;
  readonly children?: BeatUiRenderable;
  readonly defaultSidebarOpen?: boolean;
  readonly headerRight?: BeatUiRenderable;
  readonly menuIcon?: BeatUiRenderable;
  readonly menuCloseIcon?: BeatUiRenderable;
  readonly sidebar?: BeatUiRenderable;
  readonly sidebarMode?: AppShellSidebarMode;
  readonly styles?: AppShellStyles;
}

export const AppShell = component<AppShellProps>((props) => {
  const mode = props.sidebarMode ?? "none";
  const sidebarOpen = pulse(
    mode === "fixed" ? true : (props.defaultSidebarOpen ?? false),
  );

  function toggleSidebar(): void {
    sidebarOpen.set(!sidebarOpen.get());
  }

  function closeSidebar(): void {
    if (mode === "toggle" && sidebarOpen.get()) sidebarOpen.set(false);
  }

  const showMenuButton = mode === "toggle";

  return (
    <div
      class={props.class}
      data-part="root"
      data-sidebar-mode={mode}
      style={props.styles?.root}
    >
      <header data-part="header" style={props.styles?.header}>
        <div data-part="header-left" style={props.styles?.headerLeft}>
          {showMenuButton ? (
            <button
              type="button"
              data-part="menu-button"
              style={props.styles?.menuButton}
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
            >
              <Show when={sidebarOpen} fallback={props.menuIcon}>
                {props.menuCloseIcon ?? props.menuIcon}
              </Show>
            </button>
          ) : null}
          {props.brandHref !== undefined ? (
            <a
              data-part="brand"
              href={props.brandHref}
              style={props.styles?.brand}
            >
              {props.brand}
            </a>
          ) : (
            <span data-part="brand" style={props.styles?.brand}>
              {props.brand}
            </span>
          )}
        </div>
        <div data-part="header-right" style={props.styles?.headerRight}>
          {props.headerRight}
        </div>
      </header>
      <div data-part="body" style={props.styles?.body}>
        {mode === "none" ? null : mode === "fixed" ? (
          <nav
            data-part="sidebar"
            style={props.styles?.sidebar}
            aria-label={props.ariaLabel ?? "Navigation"}
          >
            {props.sidebar}
          </nav>
        ) : (
          <Show when={sidebarOpen}>
            <nav
              data-part="sidebar"
              style={props.styles?.sidebar}
              aria-label={props.ariaLabel ?? "Navigation"}
            >
              {props.sidebar}
            </nav>
          </Show>
        )}
        <main
          data-part="content"
          style={props.styles?.content}
          onClick={closeSidebar}
        >
          {props.children}
        </main>
      </div>
    </div>
  );
});
