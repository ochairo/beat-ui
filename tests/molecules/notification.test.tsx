import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { Notification } from "../../src";

describe("Notification", () => {
  it("dismisses when the dismiss button is pressed", () => {
    const target = document.createElement("div");
    const open = pulse(true);

    const cleanup = render(
      target,
      <Notification open={open} tone="warning" title="Heads up">
        Something changed
      </Notification>,
    );

    const button = target.querySelector("button");

    expect(target.querySelector('[role="alert"]')).not.toBeNull();

    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(open.get()).toBe(false);

    cleanup();
  });
});
