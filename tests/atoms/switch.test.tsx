import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { Switch, ThemeRoot } from "../../src";

describe("Switch", () => {
  it("toggles checked state through a Pulse node", () => {
    const target = document.createElement("div");
    const checked = pulse(false);
    const seen: boolean[] = [];

    const cleanup = render(
      target,
      <ThemeRoot>
        <Switch
          checked={checked}
          checkedContent="On"
          uncheckedContent="Off"
          onCheckedChange={(nextValue) => seen.push(nextValue)}
        >
          Airplane Mode
        </Switch>
      </ThemeRoot>,
    );

    const button = target.querySelector("button");

    expect(button?.getAttribute("role")).toBe("switch");
    expect(button?.getAttribute("aria-checked")).toBe("false");
    expect(button?.textContent).toContain("Airplane Mode");
    expect(button?.textContent).toContain("Off");

    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(checked.get()).toBe(true);
    expect(button?.getAttribute("aria-checked")).toBe("true");
    expect(button?.textContent).toContain("On");
    expect(seen).toEqual([true]);

    cleanup();
  });

  it("ignores clicks when disabled", () => {
    const target = document.createElement("div");
    const checked = pulse(false);
    const seen: boolean[] = [];

    const cleanup = render(
      target,
      <ThemeRoot>
        <Switch
          checked={checked}
          disabled={true}
          onCheckedChange={(nextValue) => seen.push(nextValue)}
        >
          Disabled switch
        </Switch>
      </ThemeRoot>,
    );

    const button = target.querySelector("button");

    expect(button?.getAttribute("disabled")).not.toBeNull();

    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(checked.get()).toBe(false);
    expect(seen).toEqual([]);

    cleanup();
  });

  it("uses defaultChecked for uncontrolled mode", () => {
    const target = document.createElement("div");

    const cleanup = render(
      target,
      <ThemeRoot>
        <Switch defaultChecked={true}>Wi-Fi</Switch>
      </ThemeRoot>,
    );

    const button = target.querySelector("button");

    expect(button?.getAttribute("aria-checked")).toBe("true");

    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(button?.getAttribute("aria-checked")).toBe("false");

    cleanup();
  });
});
