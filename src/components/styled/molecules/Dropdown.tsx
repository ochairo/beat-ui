import { component } from "@ochairo/beat";

import {
  Dropdown as HeadlessDropdown,
  type DropboxProps,
  type DropdownOption,
  type DropdownProps,
} from "../../headless/molecules/Dropdown";

export type { DropboxProps, DropdownOption, DropdownProps };

const triggerStyle = [
  "position:relative",
  "width:100%",
  "box-sizing:border-box",
  "min-height:2.75rem",
  "padding:0.625rem 2.5rem 0.625rem 0.875rem",
  "border-radius:0.875rem",
  "border:1px solid var(--beat-ui-color-border)",
  "background:var(--beat-ui-color-input)",
  "color:var(--beat-ui-color-text)",
  "font:inherit",
  "font-size:0.875rem",
  "text-align:left",
  "cursor:pointer",
  "display:flex",
  "align-items:center",
  "outline:none",
  "transition:border-color 0.15s",
  "white-space:nowrap",
  "overflow:hidden",
  "user-select:none",
].join(";");

const chevronStyle = [
  "position:absolute",
  "right:0.75rem",
  "top:50%",
  "transform:translateY(-50%)",
  "pointer-events:none",
  "color:var(--beat-ui-color-text-muted)",
  "transition:transform 0.15s",
  "display:flex",
  "align-items:center",
  "flex-shrink:0",
].join(";");

const menuStyle = [
  "position:absolute",
  "top:calc(100% + 0.25rem)",
  "left:0",
  "right:0",
  "z-index:9999",
  "background:var(--beat-ui-color-background-elevated)",
  "border-radius:0.75rem",
  "box-shadow:0 8px 24px rgba(0,0,0,0.35)",
  "overflow:hidden",
  "padding:0.25rem",
  "outline:none",
].join(";");

function getItemStyle(active: boolean, disabled: boolean): string {
  return [
    "display:flex",
    "align-items:center",
    "gap:0.5rem",
    "width:100%",
    "box-sizing:border-box",
    "padding:0.5rem 0.75rem",
    "border:none",
    "border-radius:0.5rem",
    "font:inherit",
    "font-size:0.875rem",
    "text-align:left",
    "white-space:nowrap",
    `cursor:${disabled ? "not-allowed" : "pointer"}`,
    `opacity:${disabled ? "0.45" : "1"}`,
    `background:${active ? "var(--beat-ui-color-primary-soft,rgba(99,102,241,0.15))" : "transparent"}`,
    `color:${active ? "var(--beat-ui-color-primary)" : "var(--beat-ui-color-text)"}`,
    "transition:background 0.1s,color 0.1s",
    "outline:none",
  ].join(";");
}

export const Dropdown = component<DropdownProps>((props) => {
  return (
    <HeadlessDropdown
      {...props}
      styles={{
        trigger: triggerStyle,
        chevron: chevronStyle,
        menu: menuStyle,
        item: getItemStyle,
      }}
    />
  );
});

export const Dropbox = Dropdown;
