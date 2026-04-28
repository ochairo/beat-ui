import { component } from "@ochairo/beat";

import {
  Loading as HeadlessLoading,
  type LoadingProps,
} from "../../headless/atoms/Loading";

export type { LoadingProps };

const rootStyle = [
  "display:inline-flex",
  "align-items:center",
  "gap:0.625rem",
  "color:var(--beat-ui-color-text-muted)",
  "font:inherit",
].join(";");

const spinnerStyle = [
  "display:inline-block",
  "width:0.875rem",
  "height:0.875rem",
  "border-radius:999px",
  "background:var(--beat-ui-color-primary)",
  "box-shadow:1rem 0 0 -0.1rem var(--beat-ui-color-background-accent-soft),-1rem 0 0 -0.1rem var(--beat-ui-color-background-accent-soft)",
].join(";");

export const Loading = component<LoadingProps>((props) => {
  return (
    <HeadlessLoading
      {...props}
      styles={{ root: rootStyle, spinner: spinnerStyle }}
    />
  );
});
