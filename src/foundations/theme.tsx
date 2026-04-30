import { component, onCleanup } from "@ochairo/beat";
import { derived, pulse } from "@ochairo/pulse";

import type { BeatUiContentProps } from "./conventions";
import type { BeatUiReadonlyState, BeatUiState } from "../runtime";

export type BeatUiThemeMode = "light" | "dark";
export type BeatUiThemePreference = BeatUiThemeMode | "system";

export interface BeatUiThemeTokens {
  readonly background: string;
  readonly backgroundSubtle: string;
  readonly backgroundElevated: string;
  readonly backgroundOverlay: string;
  readonly backgroundAccentSoft: string;
  readonly border: string;
  readonly borderStrong: string;
  readonly text: string;
  readonly textMuted: string;
  readonly textInverse: string;
  readonly primary: string;
  readonly primaryHover: string;
  readonly primaryActive: string;
  readonly primaryText: string;
  readonly secondary: string;
  readonly secondaryHover: string;
  readonly secondaryActive: string;
  readonly secondaryText: string;
  readonly success: string;
  readonly successText: string;
  readonly warning: string;
  readonly warningText: string;
  readonly danger: string;
  readonly dangerText: string;
  readonly info: string;
  readonly infoText: string;
  readonly input: string;
  readonly inputHover: string;
  readonly inputActive: string;
  readonly focusRing: string;
  readonly selection: string;
  readonly scrollbarThumb: string;
  readonly scrollbarThumbHover: string;
}

export interface BeatUiThemeDefinition {
  readonly name: string;
  readonly mode: BeatUiThemeMode;
  readonly tokens: BeatUiThemeTokens;
}

export interface CreateThemeDefinitionOptions {
  readonly name: string;
  readonly mode: BeatUiThemeMode;
  readonly tokens?: Partial<BeatUiThemeTokens>;
  readonly baseTheme?: BeatUiThemeDefinition;
}

export interface BeatUiThemeController {
  readonly preference: BeatUiState<BeatUiThemePreference>;
  readonly mode: BeatUiState<BeatUiThemeMode>;
  readonly theme: BeatUiReadonlyState<BeatUiThemeDefinition>;
  setMode(nextMode: BeatUiThemeMode): void;
  setPreference(nextPreference: BeatUiThemePreference): void;
  toggleMode(): void;
  applyTo(element: HTMLElement): () => void;
  destroy(): void;
}

interface BeatUiThemeWindowLike {
  readonly localStorage?: Storage;
  matchMedia?(query: string): MediaQueryList;
}

export interface CreateThemeControllerOptions {
  readonly initialMode?: BeatUiThemeMode;
  readonly initialPreference?: BeatUiThemePreference;
  readonly lightTheme?: BeatUiThemeDefinition;
  readonly darkTheme?: BeatUiThemeDefinition;
  readonly storageKey?: string;
  readonly windowObject?: BeatUiThemeWindowLike;
}

export interface ThemeRootProps extends BeatUiContentProps {
  readonly id?: string;
  readonly class?: string;
  readonly controller?: BeatUiThemeController;
}

export const BEAT_UI_THEME_VARIABLES: Readonly<
  Record<keyof BeatUiThemeTokens, string>
> = {
  background: "--beat-ui-color-background",
  backgroundSubtle: "--beat-ui-color-background-subtle",
  backgroundElevated: "--beat-ui-color-background-elevated",
  backgroundOverlay: "--beat-ui-color-background-overlay",
  backgroundAccentSoft: "--beat-ui-color-background-accent-soft",
  border: "--beat-ui-color-border",
  borderStrong: "--beat-ui-color-border-strong",
  text: "--beat-ui-color-text",
  textMuted: "--beat-ui-color-text-muted",
  textInverse: "--beat-ui-color-text-inverse",
  primary: "--beat-ui-color-primary",
  primaryHover: "--beat-ui-color-primary-hover",
  primaryActive: "--beat-ui-color-primary-active",
  primaryText: "--beat-ui-color-primary-text",
  secondary: "--beat-ui-color-secondary",
  secondaryHover: "--beat-ui-color-secondary-hover",
  secondaryActive: "--beat-ui-color-secondary-active",
  secondaryText: "--beat-ui-color-secondary-text",
  success: "--beat-ui-color-success",
  successText: "--beat-ui-color-success-text",
  warning: "--beat-ui-color-warning",
  warningText: "--beat-ui-color-warning-text",
  danger: "--beat-ui-color-danger",
  dangerText: "--beat-ui-color-danger-text",
  info: "--beat-ui-color-info",
  infoText: "--beat-ui-color-info-text",
  input: "--beat-ui-color-input",
  inputHover: "--beat-ui-color-input-hover",
  inputActive: "--beat-ui-color-input-active",
  focusRing: "--beat-ui-color-focus-ring",
  selection: "--beat-ui-color-selection",
  scrollbarThumb: "--beat-ui-scrollbar-thumb",
  scrollbarThumbHover: "--beat-ui-scrollbar-thumb-hover",
};

export const TOKYO_NIGHT_THEME: BeatUiThemeDefinition = {
  name: "tokyo-night",
  mode: "dark",
  tokens: {
    background: "#1a1b26",
    backgroundSubtle: "#16161e",
    backgroundElevated: "#292e42",
    backgroundOverlay: "rgba(22, 22, 30, 0.82)",
    backgroundAccentSoft: "#283457",
    border: "#3b4261",
    borderStrong: "#414868",
    text: "#c0caf5",
    textMuted: "#a9b1d6",
    textInverse: "#15161e",
    primary: "#7aa2f7",
    primaryHover: "#8db0ff",
    primaryActive: "#3d59a1",
    primaryText: "#15161e",
    secondary: "#bb9af7",
    secondaryHover: "#c7a9ff",
    secondaryActive: "#9d7cd8",
    secondaryText: "#15161e",
    success: "#9ece6a",
    successText: "#15161e",
    warning: "#e0af68",
    warningText: "#15161e",
    danger: "#f7768e",
    dangerText: "#15161e",
    info: "#0db9d7",
    infoText: "#15161e",
    input: "#16161e",
    inputHover: "#292e42",
    inputActive: "#283457",
    focusRing: "#7dcfff",
    selection: "#283457",
    scrollbarThumb: "rgba(255,255,255,0.15)",
    scrollbarThumbHover: "rgba(255,255,255,0.28)",
  },
};

export const TOKYO_DAY_THEME: BeatUiThemeDefinition = {
  name: "tokyo-day",
  mode: "light",
  tokens: {
    background: "#e1e2e7",
    backgroundSubtle: "#d0d5e3",
    backgroundElevated: "#c4c8da",
    backgroundOverlay: "rgba(208, 213, 227, 0.82)",
    backgroundAccentSoft: "#b7c1e3",
    border: "#a8aecb",
    borderStrong: "#b4b5b9",
    text: "#3760bf",
    textMuted: "#6172b0",
    textInverse: "#e1e2e7",
    primary: "#2e7de9",
    primaryHover: "#358aff",
    primaryActive: "#7890dd",
    primaryText: "#e1e2e7",
    secondary: "#9854f1",
    secondaryHover: "#a463ff",
    secondaryActive: "#7847bd",
    secondaryText: "#e1e2e7",
    success: "#587539",
    successText: "#e1e2e7",
    warning: "#8c6c3e",
    warningText: "#e1e2e7",
    danger: "#f52a65",
    dangerText: "#e1e2e7",
    info: "#07879d",
    infoText: "#e1e2e7",
    input: "#d0d5e3",
    inputHover: "#c4c8da",
    inputActive: "#b7c1e3",
    focusRing: "#007197",
    selection: "#b7c1e3",
    scrollbarThumb: "rgba(0,0,0,0.18)",
    scrollbarThumbHover: "rgba(0,0,0,0.32)",
  },
};

export function createThemeDefinition(
  options: CreateThemeDefinitionOptions,
): BeatUiThemeDefinition {
  const baseTheme =
    options.baseTheme ??
    (options.mode === "dark" ? TOKYO_NIGHT_THEME : TOKYO_DAY_THEME);

  return {
    name: options.name,
    mode: options.mode,
    tokens: {
      ...baseTheme.tokens,
      ...options.tokens,
    },
  };
}

export function getThemeCssVariables(
  theme: BeatUiThemeDefinition,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(theme.tokens).map(([tokenName, tokenValue]) => [
      BEAT_UI_THEME_VARIABLES[tokenName as keyof BeatUiThemeTokens],
      tokenValue,
    ]),
  );
}

function applyThemeSnapshot(
  element: HTMLElement,
  theme: BeatUiThemeDefinition,
): void {
  element.dataset["beatUiTheme"] = theme.name;
  element.dataset["beatUiMode"] = theme.mode;
  element.style.colorScheme = theme.mode;

  for (const [variableName, variableValue] of Object.entries(
    getThemeCssVariables(theme),
  )) {
    element.style.setProperty(variableName, variableValue);
  }
}

export function applyThemeToElement(
  element: HTMLElement,
  theme: BeatUiThemeDefinition,
): void {
  applyThemeSnapshot(element, theme);
}

export function createThemeController(
  options: CreateThemeControllerOptions = {},
): BeatUiThemeController {
  const darkTheme = options.darkTheme ?? TOKYO_NIGHT_THEME;
  const lightTheme = options.lightTheme ?? TOKYO_DAY_THEME;
  const windowObject =
    options.windowObject ??
    (typeof window === "undefined" ? undefined : window);
  const mediaQuery = windowObject?.matchMedia?.("(prefers-color-scheme: dark)");
  const fallbackPreference =
    options.initialPreference ?? options.initialMode ?? "dark";
  const storedPreference =
    options.storageKey === undefined
      ? undefined
      : readStoredPreference(windowObject?.localStorage, options.storageKey);
  const preference = pulse<BeatUiThemePreference>(
    storedPreference ?? fallbackPreference,
  );
  const mode = pulse<BeatUiThemeMode>(
    resolveThemeMode(preference.get(), mediaQuery),
  );

  const cleanups: Array<() => void> = [];

  cleanups.push(
    preference.on((event) => {
      persistPreference(
        windowObject?.localStorage,
        options.storageKey,
        event.currentValue,
      );
      mode.set(resolveThemeMode(event.currentValue, mediaQuery));
    }),
  );

  const theme = derived(mode, (m) => (m === "dark" ? darkTheme : lightTheme));

  if (mediaQuery) {
    const handleMediaChange = (): void => {
      if (preference.get() !== "system") {
        return;
      }

      mode.set(resolveThemeMode("system", mediaQuery));
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    cleanups.push(() => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    });
  }

  return {
    preference,
    mode,
    theme,
    setMode(nextMode) {
      if (preference.get() === nextMode) {
        return;
      }

      preference.set(nextMode);
    },
    setPreference(nextPreference) {
      if (preference.get() === nextPreference) {
        return;
      }

      preference.set(nextPreference);
    },
    toggleMode() {
      preference.set(mode.get() === "dark" ? "light" : "dark");
    },
    applyTo(element) {
      applyThemeSnapshot(element, theme.get());

      const cleanup = theme.on((event) => {
        applyThemeSnapshot(element, event.currentValue);
      });

      return () => {
        cleanup();

        delete element.dataset["beatUiTheme"];
        delete element.dataset["beatUiMode"];
        element.style.colorScheme = "";

        for (const variableName of Object.values(BEAT_UI_THEME_VARIABLES)) {
          element.style.removeProperty(variableName);
        }
      };
    },
    destroy() {
      for (const cleanup of cleanups) {
        cleanup();
      }
    },
  };
}

function readStoredPreference(
  storage: Storage | undefined,
  storageKey: string,
): BeatUiThemePreference | undefined {
  const value = storage?.getItem(storageKey);

  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return undefined;
}

function persistPreference(
  storage: Storage | undefined,
  storageKey: string | undefined,
  preference: BeatUiThemePreference,
): void {
  if (storageKey === undefined) {
    return;
  }

  storage?.setItem(storageKey, preference);
}

function resolveThemeMode(
  preference: BeatUiThemePreference,
  mediaQuery: MediaQueryList | undefined,
): BeatUiThemeMode {
  if (preference === "system") {
    return mediaQuery?.matches ? "dark" : "light";
  }

  return preference;
}

export const ThemeRoot = component<ThemeRootProps>((props) => {
  const controller = props.controller ?? createThemeController();

  const ref = (element: Node): void => {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    const cleanup = controller.applyTo(element);

    const style = document.createElement("style");
    style.dataset["beatUi"] = "scrollbar";
    style.textContent = [
      "* { scrollbar-width: thin; scrollbar-color: var(--beat-ui-scrollbar-thumb) transparent; }",
      "*::-webkit-scrollbar { width: 6px; height: 6px; }",
      "*::-webkit-scrollbar-track { background: transparent; }",
      "*::-webkit-scrollbar-thumb { background: var(--beat-ui-scrollbar-thumb); border-radius: 999px; }",
      "*::-webkit-scrollbar-thumb:hover { background: var(--beat-ui-scrollbar-thumb-hover); }",
    ].join("\n");
    document.head.appendChild(style);

    onCleanup(() => {
      cleanup();
      style.remove();
    });
  };

  return (
    <div id={props.id} class={props.class} ref={ref}>
      {props.children}
    </div>
  );
});
