import { component } from "@ochairo/beat";

import { getIconColor, getIconStyle, type IconProps } from "../types";

/** Atom orbitals — represents Pulse's fine-grained reactivity. */
export const IconBeatReactivity = component<IconProps>((props) => {
  const s = getIconStyle(props);
  const c = getIconColor(props);
  return (
    <svg
      class={props.class}
      style={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label={props.ariaLabel ?? "Reactivity"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <circle cx="12" cy="12" r="2.5" fill={c} />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </svg>
  );
});

/** Crosshair with solid center — represents direct DOM targeting. */
export const IconBeatDirectDom = component<IconProps>((props) => {
  const s = getIconStyle(props);
  const c = getIconColor(props);
  return (
    <svg
      class={props.class}
      style={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label={props.ariaLabel ?? "Direct DOM"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" fill={c} />
      <line x1="12" y1="2" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="22" />
      <line x1="2" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="22" y2="12" />
    </svg>
  );
});

/** Direction signpost — represents the explicit router. */
export const IconBeatRouter = component<IconProps>((props) => {
  const s = getIconStyle(props);
  const c = getIconColor(props);
  return (
    <svg
      class={props.class}
      style={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label={props.ariaLabel ?? "Router"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <line x1="12" y1="3" x2="12" y2="22" />
      <polygon points="5 5 19 5 21 8 5 8" />
      <polygon points="19 12 5 12 3 15 19 15" />
    </svg>
  );
});

/** Async arrows — represents async resource management. */
export const IconBeatResource = component<IconProps>((props) => {
  const s = getIconStyle(props);
  const c = getIconColor(props);
  return (
    <svg
      class={props.class}
      style={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label={props.ariaLabel ?? "Resource"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
});

/** Shield with TS — represents strict TypeScript. */
export const IconBeatTypeScript = component<IconProps>((props) => {
  const s = getIconStyle(props);
  const c = getIconColor(props);
  return (
    <svg
      class={props.class}
      style={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label={props.ariaLabel ?? "TypeScript"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="8" y1="10" x2="11" y2="10" />
      <line x1="9.5" y1="10" x2="9.5" y2="15" />
      <path d="M13 11a1 1 0 0 1 1-1h0.5a1 1 0 0 1 1 1v0a1 1 0 0 1-1 1H14a1 1 0 0 0-1 1v1h2.5" />
    </svg>
  );
});

/** Single play triangle — represents run-once components. */
export const IconBeatRunOnce = component<IconProps>((props) => {
  const s = getIconStyle(props);
  const c = getIconColor(props);
  return (
    <svg
      class={props.class}
      style={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label={props.ariaLabel ?? "Run Once"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <polygon points="5 3 19 12 5 21 5 3" fill={c} opacity="0.15" />
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
});

/** Pulse wave — the Beat/Pulse brand icon. */
export const IconBeatPulse = component<IconProps>((props) => {
  const s = getIconStyle(props);
  const c = getIconColor(props);
  return (
    <svg
      class={props.class}
      style={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label={props.ariaLabel ?? "Pulse"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
});

/** Component tree — represents Beat's component model. */
export const IconBeatComponent = component<IconProps>((props) => {
  const s = getIconStyle(props);
  const c = getIconColor(props);
  return (
    <svg
      class={props.class}
      style={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label={props.ariaLabel ?? "Component"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <rect x="8" y="2" width="8" height="6" rx="1" />
      <rect x="2" y="16" width="8" height="6" rx="1" />
      <rect x="14" y="16" width="8" height="6" rx="1" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="6" y1="16" x2="6" y2="12" />
      <line x1="18" y1="16" x2="18" y2="12" />
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  );
});

/** JSX brackets — represents Beat's JSX compilation. */
export const IconBeatJsx = component<IconProps>((props) => {
  const s = getIconStyle(props);
  const c = getIconColor(props);
  return (
    <svg
      class={props.class}
      style={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label={props.ariaLabel ?? "JSX"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  );
});
