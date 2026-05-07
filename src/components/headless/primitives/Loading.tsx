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
  readonly type?: "spinner" | "equalizer" | "pulse" | "beat";
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
      {props.type === "equalizer" ? (
        <span aria-hidden={true} data-part="equalizer">
          <span data-part="bar" />
          <span data-part="bar" />
          <span data-part="bar" />
          <span data-part="bar" />
        </span>
      ) : props.type === "pulse" ? (
        <span aria-hidden={true} data-part="pulse">
          <span data-part="pulse-ring" />
          <span data-part="pulse-dot" />
        </span>
      ) : props.type === "beat" ? (
        <span aria-hidden={true} data-part="beat">
          <svg
            viewBox="0 0 160 16"
            fill="none"
            width="80"
            height="16"
            preserveAspectRatio="none"
          >
            <path
              data-part="beat-line"
              d="M0,8 L66,8 L70,7.2 L72,8.8 L73,8 L75,8 L76,0.8 L78,15.2 L79.6,4.8 L81,9.6 L82.4,8 L88,8 L160,8"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      ) : (
        <span
          aria-hidden={true}
          data-part="spinner"
          style={props.styles?.spinner}
        />
      )}
      <span>{props.children ?? props.label ?? "Loading"}</span>
    </span>
  );
});
