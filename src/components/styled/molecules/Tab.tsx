import { component } from "@ochairo/beat";

import {
  Tab as HeadlessTab,
  type TabItem,
  type TabOrientation,
  type TabProps,
} from "../../headless/molecules/Tab";

export type { TabItem, TabOrientation, TabProps };

function getContainerStyle(orientation: TabOrientation): string {
  return orientation === "vertical"
    ? [
        "display:grid",
        "grid-template-columns:minmax(14rem, 18rem) minmax(0, 1fr)",
        "gap:1rem",
        "align-items:start",
      ].join(";")
    : "display:block";
}

function getTabListStyle(orientation: TabOrientation): string {
  return [
    "display:flex",
    `flex-direction:${orientation === "vertical" ? "column" : "row"}`,
    "gap:0.5rem",
    "padding:0.375rem",
    "border-radius:1rem",
    "background:var(--beat-ui-color-background-subtle)",
  ].join(";");
}

function getPanelStyle(orientation: TabOrientation): string {
  return [
    orientation === "horizontal" ? "margin-top:0.75rem" : "margin-top:0",
    "padding:1rem",
    "border:1px solid var(--beat-ui-color-border)",
    "border-radius:1rem",
    "background:var(--beat-ui-color-background-elevated)",
    "color:var(--beat-ui-color-text)",
    "min-height:18rem",
  ].join(";");
}

function getTabButtonStyle(
  active: boolean,
  disabled: boolean | undefined,
  orientation: TabOrientation,
): string {
  return [
    "display:inline-flex",
    "align-items:center",
    `justify-content:${orientation === "vertical" ? "flex-start" : "center"}`,
    "min-height:2.25rem",
    `width:${orientation === "vertical" ? "100%" : "auto"}`,
    `padding:${orientation === "vertical" ? "0.75rem 0.875rem" : "0 0.875rem"}`,
    "border-radius:0.875rem",
    `border:1px solid ${active ? "var(--beat-ui-color-primary)" : "transparent"}`,
    `background:${active ? "var(--beat-ui-color-primary)" : "transparent"}`,
    `color:${active ? "var(--beat-ui-color-primary-text)" : "var(--beat-ui-color-text)"}`,
    `opacity:${disabled === true ? "0.6" : "1"}`,
    `cursor:${disabled === true ? "not-allowed" : "pointer"}`,
    "font:inherit",
  ].join(";");
}

export const Tab = component<TabProps>((props) => {
  const orientation = props.orientation ?? "horizontal";
  return (
    <HeadlessTab
      {...props}
      styles={{
        container: getContainerStyle(orientation),
        tabList: getTabListStyle(orientation),
        panel: getPanelStyle(orientation),
        tabButton: (active, disabled) =>
          getTabButtonStyle(active, disabled, orientation),
      }}
    />
  );
});
