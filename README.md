<!-- markdownlint-disable MD033 MD041 -->

<div align="center">

# beat-ui

UI component library for [Beat](https://github.com/ochairo/beat) applications.

[![npm version](https://img.shields.io/npm/v/@ochairo/beat-ui)](https://www.npmjs.com/package/@ochairo/beat-ui)
[![npm downloads](https://img.shields.io/npm/dm/@ochairo/beat-ui)](https://www.npmjs.com/package/@ochairo/beat-ui)
![CI](https://github.com/ochairo/beat-ui/workflows/validate/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)

[Documentation](https://ochairo.github.io/beat-site/)

</div>

## Installation

```sh
pnpm add @ochairo/beat-ui @ochairo/beat @ochairo/pulse
```

## Upgrading to 2.0.0

Use Node 24.22.1 or later within 24.x, or Node 26.12.1 or later. Upgrade Beat and
Pulse to 2.0.0 alongside Beat UI so the application and its components share the
same runtime. Beat UI also uses Numbers and Scales 2.0.0.

## Usage

```tsx
import { pulse } from "@ochairo/pulse";
import { Button, Switch, ThemeRoot, createThemeController } from "@ochairo/beat-ui";

const theme = createThemeController();
const checked = pulse(false);

function App() {
  return (
    <ThemeRoot controller={theme}>
      <Button onPress={() => theme.toggleMode()}>Toggle theme</Button>
      <Switch checked={checked} onCheckedChange={(v) => checked.set(v)} />
    </ThemeRoot>
  );
}
```
