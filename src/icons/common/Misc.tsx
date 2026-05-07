import { component } from "@ochairo/beat";

import { getIconColor, getIconStyle, type IconProps } from "../types";

export const IconSun = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
});

export const IconMoon = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
});

export const IconGithub = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
});

export const IconTerminal = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
});

export const IconCode = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
});

export const IconPackage = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
});

export const IconCalendar = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
});

export const IconClock = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
});

/** Crosshair with solid center. */
export const IconAim = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel ?? "Aim"}
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

/** Direction signpost. */
export const IconRoute = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel ?? "Route"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <line x1="12" y1="3" x2="12" y2="22" />
      <polygon points="5 5 19 5 21 8 5 8" />
      <polygon points="19 12 5 12 3 15 19 15" />
    </svg>
  );
});

/** Cross arrows. */
export const IconCrossArrowsToRight = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel ?? "Cross Arrows"}
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

/** Tree chart — component hierarchy. */
export const IconTreeChart = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel ?? "Tree Chart"}
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

/** Play triangle. */
export const IconPlay = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel ?? "Play"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <polygon points="5 3 19 12 5 21 5 3" fill={c} opacity="0.15" />
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
});
