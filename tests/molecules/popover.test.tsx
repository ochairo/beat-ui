import { component, render } from "@ochairo/beat";
import { pulse, type Pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { Popover, ThemeRoot } from "../../src";

interface PopoverHarnessProps {
  readonly open: Pulse<boolean>;
  readonly dismissOnOutsideClick?: boolean;
  readonly matchAnchorWidth?: boolean;
}

const PopoverHarness = component<PopoverHarnessProps>((props) => {
  let anchorEl: HTMLButtonElement | null = null;

  return (
    <ThemeRoot>
      <div data-part="control-root">
        <button
          type="button"
          ref={(node) => {
            anchorEl = node as HTMLButtonElement;
          }}
        >
          Anchor
        </button>
      </div>

      <Popover
        open={props.open}
        anchorRef={() => anchorEl}
        dismissOnOutsideClick={props.dismissOnOutsideClick}
        matchAnchorWidth={props.matchAnchorWidth}
      >
        <div>Popover content</div>
      </Popover>
    </ThemeRoot>
  );
});

function rect(options: {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}): DOMRect {
  return {
    x: options.left,
    y: options.top,
    width: options.width,
    height: options.height,
    top: options.top,
    right: options.left + options.width,
    bottom: options.top + options.height,
    left: options.left,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("Popover", () => {
  it("renders as a floating layer outside the control subtree", async () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const cleanup = render(
      target,
      <PopoverHarness open={pulse(true)} dismissOnOutsideClick />,
    );

    await Promise.resolve();

    const controlRoot = target.querySelector(
      '[data-part="control-root"]',
    ) as HTMLElement;
    const popover = document.querySelector(
      '[data-part="popover"]',
    ) as HTMLElement | null;

    expect(popover).not.toBeNull();
    expect(controlRoot.contains(popover)).toBe(false);
    expect(popover?.parentElement?.dataset.beatUiRoot).toBe("true");
    expect(popover?.style.position).toBe("fixed");

    cleanup();
    document.body.removeChild(target);
  });

  it("does not dismiss on outside click by default", async () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const open = pulse(true);

    const cleanup = render(target, <PopoverHarness open={open} />);

    await Promise.resolve();

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(open.get()).toBe(true);

    cleanup();
    document.body.removeChild(target);
  });

  it("dismisses on outside click when enabled", async () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const open = pulse(true);

    const cleanup = render(
      target,
      <PopoverHarness open={open} dismissOnOutsideClick />,
    );

    await Promise.resolve();

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(open.get()).toBe(false);

    cleanup();
    document.body.removeChild(target);
  });

  it("matches the anchor width when configured", async () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const open = pulse(false);

    const cleanup = render(
      target,
      <PopoverHarness open={open} matchAnchorWidth />,
    );

    await Promise.resolve();

    const anchor = target.querySelector("button") as HTMLButtonElement;
    const popover = document.querySelector(
      '[data-part="popover"]',
    ) as HTMLElement;

    Object.defineProperty(anchor, "getBoundingClientRect", {
      configurable: true,
      value: () => rect({ top: 40, left: 24, width: 148, height: 36 }),
    });
    Object.defineProperty(popover, "getBoundingClientRect", {
      configurable: true,
      value: () => rect({ top: 0, left: 0, width: 96, height: 52 }),
    });

    open.set(true);

    expect(popover.style.width).toBe("148px");

    cleanup();
    document.body.removeChild(target);
  });

  it("repositions when the viewport changes while open", async () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const open = pulse(false);

    const cleanup = render(target, <PopoverHarness open={open} />);

    await Promise.resolve();

    const anchor = target.querySelector("button") as HTMLButtonElement;
    const popover = document.querySelector(
      '[data-part="popover"]',
    ) as HTMLElement;

    let anchorRect = rect({ top: 60, left: 40, width: 120, height: 30 });

    Object.defineProperty(anchor, "getBoundingClientRect", {
      configurable: true,
      value: () => anchorRect,
    });
    Object.defineProperty(popover, "getBoundingClientRect", {
      configurable: true,
      value: () => rect({ top: 0, left: 0, width: 84, height: 48 }),
    });

    open.set(true);

    expect(popover.style.left).toBe("40px");
    expect(popover.style.top).toBe("94px");

    anchorRect = rect({ top: 92, left: 128, width: 120, height: 30 });
    window.dispatchEvent(new Event("resize"));

    expect(popover.style.left).toBe("128px");
    expect(popover.style.top).toBe("126px");

    cleanup();
    document.body.removeChild(target);
  });
});
