import { describe, expect, it } from "vitest";

import {
  BEAT_UI_THEME_VARIABLES,
  BEAT_UI_CONVENTIONS,
  TOKYO_DAY_THEME,
  TOKYO_NIGHT_THEME,
  applyThemeToElement,
  createControllableState,
  createThemeDefinition,
  createThemeController,
  getThemeCssVariables,
} from "../src";

interface MockMediaQueryList extends EventTarget {
  matches: boolean;
  media: string;
}

function createMediaQueryList(matches: boolean): MockMediaQueryList {
  const target = new EventTarget() as MockMediaQueryList;
  target.matches = matches;
  target.media = "(prefers-color-scheme: dark)";
  return target;
}

function dispatchMediaQueryChange(
  mediaQuery: MockMediaQueryList,
  matches: boolean,
): void {
  mediaQuery.matches = matches;
  mediaQuery.dispatchEvent(new Event("change"));
}

describe("foundations", () => {
  it("documents the shared semantic event conventions", () => {
    expect(BEAT_UI_CONVENTIONS.eventProps).toEqual([
      "onPress",
      "onValueChange",
      "onCheckedChange",
      "onFocus",
      "onBlur",
    ]);
  });

  it("creates controllable Pulse-backed state", () => {
    const seen: string[] = [];
    const state = createControllableState({
      defaultValue: "Ada",
      onChange(nextValue) {
        seen.push(nextValue);
      },
    });

    expect(state.state.get()).toBe("Ada");
    expect(state.controlled).toBe(false);

    state.setValue("Grace");

    expect(state.state.get()).toBe("Grace");
    expect(seen).toEqual(["Grace"]);
  });

  it("exposes Tokyo Night and Tokyo Day as the default themes", () => {
    expect(TOKYO_NIGHT_THEME.name).toBe("tokyo-night");
    expect(TOKYO_NIGHT_THEME.mode).toBe("dark");
    expect(TOKYO_NIGHT_THEME.tokens.background).toBe("#1a1b26");

    expect(TOKYO_DAY_THEME.name).toBe("tokyo-day");
    expect(TOKYO_DAY_THEME.mode).toBe("light");
    expect(TOKYO_DAY_THEME.tokens.background).toBe("#e1e2e7");
  });

  it("maps semantic theme tokens to css variables", () => {
    const variables = getThemeCssVariables(TOKYO_NIGHT_THEME);

    expect(variables["--beat-ui-color-background"]).toBe("#1a1b26");
    expect(variables["--beat-ui-color-primary"]).toBe("#7aa2f7");
    expect(BEAT_UI_THEME_VARIABLES.background).toBe(
      "--beat-ui-color-background",
    );
  });

  it("lets applications derive custom themes from semantic tokens", () => {
    const customTheme = createThemeDefinition({
      name: "app-forest-dark",
      mode: "dark",
      tokens: {
        primary: "#4caf50",
        background: "#101510",
        text: "#e8f5e9",
      },
    });

    expect(customTheme.name).toBe("app-forest-dark");
    expect(customTheme.mode).toBe("dark");
    expect(customTheme.tokens.primary).toBe("#4caf50");
    expect(customTheme.tokens.background).toBe("#101510");
    expect(customTheme.tokens.border).toBe(TOKYO_NIGHT_THEME.tokens.border);
  });

  it("applies the default dark theme and toggles to the day theme", () => {
    const target = document.createElement("div");
    const controller = createThemeController();
    const cleanup = controller.applyTo(target);

    expect(target.dataset.beatUiTheme).toBe("tokyo-night");
    expect(target.dataset.beatUiMode).toBe("dark");
    expect(target.style.getPropertyValue("--beat-ui-color-background")).toBe(
      "#1a1b26",
    );

    controller.toggleMode();

    expect(target.dataset.beatUiTheme).toBe("tokyo-day");
    expect(target.dataset.beatUiMode).toBe("light");
    expect(target.style.getPropertyValue("--beat-ui-color-background")).toBe(
      "#e1e2e7",
    );

    cleanup();
    controller.destroy();
  });

  it("can apply a single theme snapshot directly to an element", () => {
    const target = document.createElement("div");

    applyThemeToElement(target, TOKYO_DAY_THEME);

    expect(target.dataset.beatUiTheme).toBe("tokyo-day");
    expect(target.style.getPropertyValue("--beat-ui-color-primary")).toBe(
      "#2e7de9",
    );
  });

  it("supports system preference and follows media-query changes", () => {
    const mediaQuery = createMediaQueryList(true);
    const controller = createThemeController({
      initialPreference: "system",
      windowObject: {
        matchMedia() {
          return mediaQuery as unknown as MediaQueryList;
        },
      },
    });

    expect(controller.preference.get()).toBe("system");
    expect(controller.mode.get()).toBe("dark");
    expect(controller.theme.get().name).toBe("tokyo-night");

    dispatchMediaQueryChange(mediaQuery, false);

    expect(controller.mode.get()).toBe("light");
    expect(controller.theme.get().name).toBe("tokyo-day");

    controller.destroy();
  });

  it("persists preference when a storage key is provided", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem(key: string) {
        return values.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        values.set(key, value);
      },
      removeItem(key: string) {
        values.delete(key);
      },
      clear() {
        values.clear();
      },
      key(index: number) {
        return Array.from(values.keys())[index] ?? null;
      },
      get length() {
        return values.size;
      },
    } satisfies Storage;

    values.set("beat-ui-theme", "light");

    const controller = createThemeController({
      storageKey: "beat-ui-theme",
      windowObject: {
        localStorage: storage,
      },
    });

    expect(controller.preference.get()).toBe("light");
    expect(controller.mode.get()).toBe("light");

    controller.setPreference("dark");

    expect(values.get("beat-ui-theme")).toBe("dark");

    controller.destroy();
  });
});
