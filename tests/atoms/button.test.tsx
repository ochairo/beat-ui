import { render } from "@ochairo/beat";
import { describe, expect, it } from "vitest";

import { Button, ThemeRoot } from "../../src";

describe("Button", () => {
  it("renders children and forwards semantic press events", () => {
    const target = document.createElement("div");
    const presses: string[] = [];

    const cleanup = render(
      target,
      <ThemeRoot>
        <Button onPress={() => presses.push("pressed")}>Save</Button>
      </ThemeRoot>,
    );

    const button = target.querySelector("button");

    expect(button?.textContent).toBe("Save");

    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(presses).toEqual(["pressed"]);

    cleanup();
  });

  it("blocks presses when disabled", () => {
    const target = document.createElement("div");
    let pressed = false;

    const cleanup = render(
      target,
      <ThemeRoot>
        <Button
          disabled={true}
          onPress={() => {
            pressed = true;
          }}
        >
          Disabled
        </Button>
      </ThemeRoot>,
    );

    const button = target.querySelector("button");

    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(pressed).toBe(false);

    cleanup();
  });
});
