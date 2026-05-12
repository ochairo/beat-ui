export type FloatingHorizontalAlign = "start" | "end";

interface FloatingLayerOptions {
  readonly anchor: HTMLElement;
  readonly layer: HTMLElement;
  readonly align?: FloatingHorizontalAlign;
  readonly offset?: number;
  readonly height?: number;
  readonly width?: number;
  readonly matchAnchorWidth?: boolean;
}

const VIEWPORT_PADDING = 4;
const DEFAULT_OFFSET = 4;
const FLOATING_LAYER_HOST_SELECTOR = "[data-beat-ui-root]";
const MODAL_LAYER_SELECTOR = '[aria-modal="true"]';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function resolveFloatingLayerHost(layer: HTMLElement): HTMLElement {
  return (
    layer.closest<HTMLElement>(FLOATING_LAYER_HOST_SELECTOR) ?? document.body
  );
}

export function moveFloatingLayerToHost(layer: HTMLElement): void {
  const host = resolveFloatingLayerHost(layer);
  if (layer.parentElement !== host) {
    host.appendChild(layer);
  }
}

export function resolveFloatingLayerZIndex(anchor: Element | null): string {
  return anchor?.closest(MODAL_LAYER_SELECTOR)
    ? "var(--beat-ui-z-index-toast)"
    : "var(--beat-ui-z-index-popover)";
}

export function scheduleFloatingLayerMount(layer: HTMLElement): () => void {
  let disposed = false;
  queueMicrotask(() => {
    if (disposed) return;
    moveFloatingLayerToHost(layer);
  });
  return () => {
    disposed = true;
    layer.remove();
  };
}

export function isWithinFloatingLayer(
  target: Node | null,
  anchor: Element | null,
  layer: Element | null,
): boolean {
  if (target === null) return false;
  return anchor?.contains(target) === true || layer?.contains(target) === true;
}

export function resolveFloatingHorizontalAlign(
  style: string | undefined,
): FloatingHorizontalAlign {
  if (style === undefined || style === "") return "start";
  const hasRight = /\bright\s*:/i.test(style);
  const hasLeft = /\bleft\s*:/i.test(style);
  return hasRight && !hasLeft ? "end" : "start";
}

export function measureFloatingLayerHeight(
  layer: HTMLElement,
  content?: HTMLElement | null,
): number {
  const layerRect = layer.getBoundingClientRect();
  if (!content) {
    return layerRect.height;
  }
  const contentRect = content.getBoundingClientRect();
  return Math.max(layerRect.height, contentRect.bottom - layerRect.top);
}

export function positionFloatingLayer({
  anchor,
  layer,
  align = "start",
  offset = DEFAULT_OFFSET,
  height,
  width,
  matchAnchorWidth = false,
}: FloatingLayerOptions): void {
  const anchorRect = anchor.getBoundingClientRect();
  const layerRect = layer.getBoundingClientRect();
  const resolvedWidth =
    width ?? (matchAnchorWidth ? anchorRect.width : layerRect.width);
  const resolvedHeight = height ?? layerRect.height;

  const roomBelow =
    window.innerHeight - anchorRect.bottom - offset - VIEWPORT_PADDING;
  const roomAbove = anchorRect.top - offset - VIEWPORT_PADDING;
  const shouldOpenAbove = resolvedHeight > roomBelow && roomAbove > roomBelow;

  const desiredTop = shouldOpenAbove
    ? anchorRect.top - resolvedHeight - offset
    : anchorRect.bottom + offset;
  const desiredLeft =
    align === "end" ? anchorRect.right - resolvedWidth : anchorRect.left;

  const maxTop = Math.max(
    VIEWPORT_PADDING,
    window.innerHeight - resolvedHeight - VIEWPORT_PADDING,
  );
  const maxLeft = Math.max(
    VIEWPORT_PADDING,
    window.innerWidth - resolvedWidth - VIEWPORT_PADDING,
  );

  layer.style.position = "fixed";
  layer.style.margin = "0";
  layer.style.inset = "unset";
  if (width !== undefined || matchAnchorWidth) {
    layer.style.width = `${resolvedWidth}px`;
  }
  layer.style.top = `${clamp(desiredTop, VIEWPORT_PADDING, maxTop)}px`;
  layer.style.left = `${clamp(desiredLeft, VIEWPORT_PADDING, maxLeft)}px`;
  layer.style.right = "auto";
  layer.style.bottom = "auto";
}
