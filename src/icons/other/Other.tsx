import { component } from "@ochairo/beat";

import { getIconColor, getIconStyle, type IconProps } from "../types";

/** Atom orbitals — represents fine-grained reactivity. */
export const IconReact = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel ?? "React"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <circle cx="12" cy="12" r="2.5" fill={c} />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
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

/** Pulse wave. */
export const IconPulse = component<IconProps>((props) => {
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

/** JSX brackets — represents Beat's JSX compilation. */
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
      aria-label={props.ariaLabel ?? "JSX"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  );
});

/** Double-V mark — represents Vue. */
export const IconVue = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel ?? "Vue"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <polyline points="1.5 4 12 22 22.5 4" />
      <polyline points="7 4 12 13 17 4" />
    </svg>
  );
});

/** Shield with A — represents Angular. */
export const IconAngular = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel ?? "Angular"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <path d="M12 2L2 6.5l1.5 12.5L12 22l8.5-3L22 6.5z" />
      <polyline points="9 16 12 7 15 16" />
      <line x1="10.2" y1="13" x2="13.8" y2="13" />
    </svg>
  );
});

/** Square with TS letterforms — represents TypeScript. */
export const IconTypeScript = component<IconProps>((props) => {
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
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <line x1="4.5" y1="8" x2="10.5" y2="8" />
      <line x1="7.5" y1="8" x2="7.5" y2="16" />
      <path d="M19.5 10c0-1.1-.9-2-2-2H16c-1.1 0-2 .9-2 2s.9 2 2 2h1.5c1.1 0 2 .9 2 2s-.9 2-2 2H16c-1.1 0-2-.9-2-2" />
    </svg>
  );
});

/** Square with JS letterforms — represents JavaScript. */
export const IconJavaScript = component<IconProps>((props) => {
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
      aria-label={props.ariaLabel ?? "JavaScript"}
      aria-hidden={props.ariaHidden ?? !props.ariaLabel}
    >
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <line x1="5" y1="8" x2="11" y2="8" />
      <path d="M9 8v6a2.5 2.5 0 0 1-5 0" />
      <path d="M19.5 10c0-1.1-.9-2-2-2H16c-1.1 0-2 .9-2 2s.9 2 2 2h1.5c1.1 0 2 .9 2 2s-.9 2-2 2H16c-1.1 0-2-.9-2-2" />
    </svg>
  );
});
