import { component } from "@ochairo/beat";

import { getIconColor, getIconStyle, type IconProps } from "../types";

export const IconEye = component<IconProps>((props) => {
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
});

export const IconEyeOff = component<IconProps>((props) => {
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
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
});

export const IconSettings = component<IconProps>((props) => {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" />
    </svg>
  );
});

export const IconCopy = component<IconProps>((props) => {
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
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
});

export const IconTrash = component<IconProps>((props) => {
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
});

export const IconEdit = component<IconProps>((props) => {
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
});

export const IconExternalLink = component<IconProps>((props) => {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
});

export const IconLink = component<IconProps>((props) => {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
});
