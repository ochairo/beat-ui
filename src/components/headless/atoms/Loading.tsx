import { component } from "@ochairo/beat";

import type {
  BeatUiAccessibilityProps,
  BeatUiContentProps,
} from "../../../foundations";

export interface LoadingStyles {
  readonly root?: string;
  readonly spinner?: string;
}

export interface LoadingProps
  extends BeatUiAccessibilityProps, BeatUiContentProps {
  readonly label?: string;
  readonly styles?: LoadingStyles;
}

export const Loading = component<LoadingProps>((props) => {
  return (
    <span
      id={props.id}
      class={props.class}
      role="status"
      aria-live="polite"
      aria-label={props.ariaLabel ?? props.label ?? "Loading"}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
      style={props.styles?.root}
    >
      <span aria-hidden={true} style={props.styles?.spinner} />
      <span>{props.children ?? props.label ?? "Loading"}</span>
    </span>
  );
});
