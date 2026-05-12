import { component, onCleanup } from "@ochairo/beat";
import { type Pulse } from "@ochairo/pulse";

import type {
  BeatUiAccessibilityProps,
  BeatUiContentProps,
} from "../../../foundations";
import {
  isWithinFloatingLayer,
  moveFloatingLayerToHost,
  resolveFloatingLayerZIndex,
  scheduleFloatingLayerMount,
} from "./floating-layer";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PopoverPlacement =
  | "bottom-start"
  | "bottom"
  | "bottom-end"
  | "top-start"
  | "top"
  | "top-end";

export interface PopoverProps
  extends BeatUiAccessibilityProps, BeatUiContentProps {
  /** Controlled open state. */
  readonly open: Pulse<boolean>;
  readonly onOpenChange?: (open: boolean) => void;
  /**
   * Returns the element to position the popover against.
   * Called each time the popover opens.
   */
  readonly anchorRef: () => Element | null;
  readonly placement?: PopoverPlacement;
  /** Gap in px between anchor edge and popover. Default 4. */
  readonly offset?: number;
  /** Match the popover width to the anchor width. */
  readonly matchAnchorWidth?: boolean;
  /** Close the popover when clicking outside the anchor and content. */
  readonly dismissOnOutsideClick?: boolean;
  readonly class?: string | undefined;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const HlPopover = component<PopoverProps>((props) => {
  let popoverEl: HTMLElement | null = null;
  const placement = props.placement ?? "bottom-start";
  const offset = props.offset ?? 4;
  const matchAnchorWidth = props.matchAnchorWidth ?? false;
  const dismissOnOutsideClick = props.dismissOnOutsideClick ?? false;
  let cleanupPopoverMount: (() => void) | null = null;
  let cleanupPopoverTracking: (() => void) | null = null;

  const setOpen = (open: boolean): void => {
    props.onOpenChange?.(open);
    if (props.open.get() !== open) {
      props.open.set(open);
    }
  };

  const applyPosition = (): void => {
    const anchor = props.anchorRef();
    if (!anchor || !popoverEl) return;

    popoverEl.style.zIndex = resolveFloatingLayerZIndex(anchor as HTMLElement);

    const anchorRect = anchor.getBoundingClientRect();

    if (matchAnchorWidth) {
      popoverEl.style.width = `${anchorRect.width}px`;
    } else {
      popoverEl.style.removeProperty("width");
    }

    const popRect = popoverEl.getBoundingClientRect();

    let top: number;
    let left: number;

    if (placement.startsWith("top")) {
      top = anchorRect.top - popRect.height - offset;
    } else {
      top = anchorRect.bottom + offset;
    }

    if (placement.endsWith("end")) {
      left = anchorRect.right - popRect.width;
    } else if (placement.endsWith("start")) {
      left = anchorRect.left;
    } else {
      left = anchorRect.left + anchorRect.width / 2 - popRect.width / 2;
    }

    // Clamp to viewport
    left = Math.max(4, Math.min(left, window.innerWidth - popRect.width - 4));
    top = Math.max(4, Math.min(top, window.innerHeight - popRect.height - 4));

    popoverEl.style.top = `${top}px`;
    popoverEl.style.left = `${left}px`;
  };

  const stopPopoverTracking = (): void => {
    cleanupPopoverTracking?.();
    cleanupPopoverTracking = null;
  };

  const startPopoverTracking = (): void => {
    if (cleanupPopoverTracking !== null) return;

    const handleViewportChange = (): void => {
      if (!props.open.get()) return;
      applyPosition();
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            if (!props.open.get()) return;
            applyPosition();
          });

    const anchor = props.anchorRef();
    if (anchor !== null) {
      resizeObserver?.observe(anchor);
    }
    if (popoverEl !== null) {
      resizeObserver?.observe(popoverEl);
    }

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    cleanupPopoverTracking = () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      resizeObserver?.disconnect();
    };
  };

  const openPopover = (): void => {
    if (!popoverEl) return;
    // Clear inline display:none so CSS classes can render the popover, then show.
    popoverEl.style.removeProperty("display");
    try {
      (popoverEl as unknown as { showPopover(): void }).showPopover();
    } catch {
      // Popover API not supported — display is already cleared above.
    }
    moveFloatingLayerToHost(popoverEl);
    applyPosition();
    startPopoverTracking();
  };

  const closePopover = (): void => {
    if (!popoverEl) return;
    // Use inline style so it wins over any CSS class that sets display.
    popoverEl.style.display = "none";
    try {
      (popoverEl as unknown as { hidePopover(): void }).hidePopover();
    } catch {
      // Popover API not supported — display:none above is sufficient.
    }
    stopPopoverTracking();
  };

  const onDocumentMouseDown = (event: MouseEvent): void => {
    if (!dismissOnOutsideClick) return;

    const target = event.target as Node | null;
    if (isWithinFloatingLayer(target, props.anchorRef(), popoverEl)) {
      return;
    }

    setOpen(false);
  };

  onCleanup(
    props.open.on((event) => {
      if (event.currentValue) {
        openPopover();
        if (dismissOnOutsideClick) {
          document.addEventListener("mousedown", onDocumentMouseDown);
        }
      } else {
        closePopover();
        document.removeEventListener("mousedown", onDocumentMouseDown);
      }
    }),
  );
  onCleanup(() =>
    document.removeEventListener("mousedown", onDocumentMouseDown),
  );
  onCleanup(() => {
    cleanupPopoverMount?.();
    cleanupPopoverMount = null;
    stopPopoverTracking();
  });

  return (
    <div
      id={props.id}
      data-part="popover"
      class={props.class}
      // `popover` is a valid HTML attribute (Popover API); cast needed for JSX
      {...({ popover: "manual" } as Record<string, unknown>)}
      style="position:fixed;margin:0;inset:unset;display:none"
      ref={(node) => {
        if (node instanceof HTMLElement) {
          popoverEl = node;
          popoverEl.style.zIndex = resolveFloatingLayerZIndex(
            props.anchorRef(),
          );
          cleanupPopoverMount?.();
          cleanupPopoverMount = scheduleFloatingLayerMount(popoverEl);
          if (props.open.get()) {
            openPopover();
            if (dismissOnOutsideClick) {
              document.addEventListener("mousedown", onDocumentMouseDown);
            }
          }
          // Sync close triggered by native popover toggles back to the open pulse.
          node.addEventListener("toggle", (e: Event) => {
            const newState = (e as ToggleEvent).newState;
            setOpen(newState === "open");
          });
        }
      }}
    >
      {props.children}
    </div>
  );
});
