import { component } from "@ochairo/beat";

import {
  Switch as HeadlessSwitch,
  type SwitchProps,
} from "../../headless/atoms/Switch";

export type { SwitchProps };

const switchBaseStyle = [
  "display:inline-flex",
  "align-items:center",
  "gap:0.75rem",
  "padding:0.375rem 0.5rem",
  "border:1px solid var(--beat-ui-color-border)",
  "border-radius:999px",
  "background:var(--beat-ui-color-background-subtle)",
  "color:var(--beat-ui-color-text)",
  "font:inherit",
  "cursor:pointer",
].join(";");

const switchTrackStyle = [
  "position:relative",
  "display:inline-flex",
  "align-items:center",
  "width:2.75rem",
  "height:1.5rem",
  "padding:0.125rem",
  "border-radius:999px",
].join(";");

const thumbBaseStyle = [
  "display:block",
  "width:1.125rem",
  "height:1.125rem",
  "border-radius:999px",
  "transition:transform 160ms ease,background-color 160ms ease",
].join(";");

const thumbOnStyle = `${thumbBaseStyle};background:var(--beat-ui-color-primary);transform:translateX(1.25rem)`;
const thumbOffStyle = `${thumbBaseStyle};background:var(--beat-ui-color-border-strong);transform:translateX(0)`;

export const Switch = component<SwitchProps>((props) => {
  return (
    <HeadlessSwitch
      {...props}
      styles={{
        root: switchBaseStyle,
        track: switchTrackStyle,
        thumbOn: thumbOnStyle,
        thumbOff: thumbOffStyle,
      }}
    />
  );
});
