import { component } from "@ochairo/beat";

import { getIconColor, getIconStyle, type IconProps } from "../types";

export const IconCheck = component<IconProps>((props) => {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
});

export const IconClose = component<IconProps>((props) => {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
});

export const IconPlus = component<IconProps>((props) => {
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
});

export const IconMinus = component<IconProps>((props) => {
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
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
});

export const IconSearch = component<IconProps>((props) => {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
});

export const IconMenu = component<IconProps>((props) => {
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
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
});

export const IconMoreVertical = component<IconProps>((props) => {
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
      <circle cx="12" cy="5" r="1" fill={c} />
      <circle cx="12" cy="12" r="1" fill={c} />
      <circle cx="12" cy="19" r="1" fill={c} />
    </svg>
  );
});

export const IconMoreHorizontal = component<IconProps>((props) => {
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
      <circle cx="5" cy="12" r="1" fill={c} />
      <circle cx="12" cy="12" r="1" fill={c} />
      <circle cx="19" cy="12" r="1" fill={c} />
    </svg>
  );
});
