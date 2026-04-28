import { component } from "@ochairo/beat";

import {
  SideMenu as HeadlessSideMenu,
  type SideMenuItem,
  type SideMenuProps,
} from "../../headless/molecules/SideMenu";

export type { SideMenuItem, SideMenuProps };

const navStyle = [
  "display:flex",
  "flex-direction:column",
  "gap:0.5rem",
  "min-width:16rem",
].join(";");

function getSideMenuItemStyle(
  active: boolean,
  disabled: boolean | undefined,
): string {
  return [
    "display:flex",
    "flex-direction:column",
    "align-items:flex-start",
    "gap:0.2rem",
    "width:100%",
    "padding:0.875rem 1rem",
    "border-radius:1rem",
    `border:1px solid ${active ? "var(--beat-ui-color-primary)" : "var(--beat-ui-color-border)"}`,
    `background:${active ? "var(--beat-ui-color-background-accent-soft)" : "var(--beat-ui-color-background-elevated)"}`,
    `color:${active ? "var(--beat-ui-color-text)" : "var(--beat-ui-color-text-muted)"}`,
    `opacity:${disabled === true ? "0.55" : "1"}`,
    `cursor:${disabled === true ? "not-allowed" : "pointer"}`,
    "font:inherit",
    "text-align:left",
  ].join(";");
}

const descriptionStyle = ["font-size:0.875rem", "line-height:1.35"].join(";");

export const SideMenu = component<SideMenuProps>((props) => {
  return (
    <HeadlessSideMenu
      {...props}
      styles={{
        nav: navStyle,
        item: getSideMenuItemStyle,
        description: descriptionStyle,
      }}
    />
  );
});
