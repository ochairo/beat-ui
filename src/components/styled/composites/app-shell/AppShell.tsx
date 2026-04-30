import { component } from "@ochairo/beat";

import {
  AppShell as HeadlessAppShell,
  type AppShellNavItem,
  type AppShellProps,
  type AppShellSidebarMode,
} from "../../../headless/composites/AppShell";

import css from "./AppShell.module.css";

export type { AppShellNavItem, AppShellProps, AppShellSidebarMode };

export const AppShell = component<AppShellProps>((props) => {
  return <HeadlessAppShell {...props} class={css["root"]!} />;
});
