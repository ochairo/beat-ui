import { render } from "@ochairo/beat";
import { describe, expect, it } from "vitest";

import { Loading } from "../../src";

describe("Loading", () => {
  it("renders an accessible status indicator", () => {
    const target = document.createElement("div");

    const cleanup = render(target, <Loading label="Saving" />);

    const status = target.querySelector('[role="status"]');

    expect(status?.textContent).toContain("Saving");
    expect(status?.getAttribute("aria-label")).toBe("Saving");

    cleanup();
  });
});
