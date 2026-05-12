import { render } from "@ochairo/beat";
import { describe, expect, it } from "vitest";

import { Card, ThemeRoot } from "../../src";

describe("Card", () => {
  it("preserves caller classes on the root element", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <Card class="custom-card-root">Content</Card>
      </ThemeRoot>,
    );

    expect(target.querySelector(".custom-card-root")).not.toBeNull();

    cleanup();
  });
});
