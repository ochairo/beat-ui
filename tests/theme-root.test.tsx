import { render } from "@ochairo/beat";
import { describe, expect, it } from "vitest";

import { ThemeRoot } from "../src";

describe("ThemeRoot", () => {
  it("marks its subtree as the beat-ui styling scope", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <button type="button">Open</button>
      </ThemeRoot>,
    );

    const root = target.firstElementChild;

    expect(root).toBeInstanceOf(HTMLDivElement);
    expect((root as HTMLDivElement).dataset.beatUiRoot).toBe("true");

    cleanup();
  });
});
