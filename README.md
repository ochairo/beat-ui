<!-- markdownlint-disable MD033 MD041 -->

<div align="center">

# beat-ui

UI component library for [Beat](https://github.com/ochairo/beat) applications.

</div>

## Installation

```sh
pnpm add @ochairo/beat-ui @ochairo/beat @ochairo/pulse
```

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
