export interface IconProps {
  readonly size?: number;
  readonly color?: string;
  readonly style?: string;
  readonly class?: string;
  readonly ariaLabel?: string;
  readonly ariaHidden?: boolean;
}

export const DEFAULT_ICON_SIZE = 20;
export const DEFAULT_ICON_COLOR = "currentColor";

export function getIconStyle(props: IconProps): string {
  const size = props.size ?? DEFAULT_ICON_SIZE;
  const parts = [
    `width:${size}px`,
    `height:${size}px`,
    "flex-shrink:0",
    "display:inline-block",
    "vertical-align:middle",
  ];
  if (props.style) parts.push(props.style);
  return parts.join(";");
}

export function getIconColor(props: IconProps): string {
  return props.color ?? DEFAULT_ICON_COLOR;
}
