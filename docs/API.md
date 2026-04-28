# API Reference

## Atoms

### `Button`

```ts
interface ButtonProps {
  tone?: "primary" | "secondary" | "danger";
  appearance?: "solid" | "soft" | "ghost";
  type?: "button" | "submit" | "reset";
  pressed?: boolean;
  disabled?: boolean;
  onPress?: (event: MouseEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  children?: BeatUiRenderable;
  // + BeatUiAccessibilityProps
}
```

### `Input`

```ts
interface InputProps {
  value?: BeatUiState<string>;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  type?: "text" | "email" | "number" | "password" | "search" | "tel" | "url";
  placeholder?: string;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  // + BeatUiAccessibilityProps, BeatUiFocusHandlers
}
```

### `Switch`

```ts
interface SwitchProps {
  checked?: BeatUiState<boolean>;
  defaultChecked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  checkedContent?: BeatUiRenderable;
  uncheckedContent?: BeatUiRenderable;
  disabled?: boolean;
  // + BeatUiAccessibilityProps, BeatUiFocusHandlers
}
```

### `CheckBox`

```ts
interface CheckBoxProps {
  checked?: BeatUiState<boolean>;
  defaultChecked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  // + BeatUiAccessibilityProps, BeatUiFocusHandlers
}
```

### `RadioButton`

```ts
interface RadioButtonProps {
  checked?: BeatUiState<boolean>;
  defaultChecked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  // + BeatUiAccessibilityProps, BeatUiFocusHandlers
}
```

### `TextInput`

Like `Input` but renders as a styled text field with a label slot.

### `Badge`

```ts
interface BadgeProps {
  tone?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  children?: BeatUiRenderable;
}
```

### `Loading`

```ts
interface LoadingProps {
  size?: "sm" | "md" | "lg";
}
```

### `CardWrapper`

Container with surface background and border styling. Accepts `children`.

### `SparkLine`

```ts
interface SparkLineProps {
  values: readonly number[];
  tone?: "primary" | "success" | "danger";
}
```

---

## Molecules

### `Tab`

```ts
interface TabItem {
  key: string;
  label: string;
  content: BeatUiRenderable;
  disabled?: boolean;
}

interface TabProps {
  items: readonly TabItem[];
  value?: BeatUiState<string>;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  // + BeatUiAccessibilityProps
}
```

### `Dropdown`

```ts
interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: readonly DropdownOption[];
  value?: BeatUiState<string>;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  // + BeatUiAccessibilityProps, BeatUiFocusHandlers
}
```

### `SideMenu`

```ts
interface SideMenuItem {
  key: string;
  label: string;
  icon?: BeatUiRenderable;
  disabled?: boolean;
}

interface SideMenuProps {
  items: readonly SideMenuItem[];
  value?: BeatUiState<string>;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}
```

### `Notification`

```ts
interface NotificationProps {
  tone?: "success" | "warning" | "danger" | "info";
  title?: string;
  children?: BeatUiRenderable;
  onDismiss?: () => void;
}
```

### `Dialog` / `Modal`

```ts
interface DialogProps {
  open?: BeatUiState<boolean>;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children?: BeatUiRenderable;
}
```

---

## Organisms

### `Table`

```ts
interface TableColumn {
  key: string;
  header: BeatUiRenderable;
  sortable?: boolean;
  sortValue?: (row: TableRow) => unknown;
  renderCell?: (row: TableRow, index: number) => BeatUiRenderable;
  align?: "left" | "center" | "right";
  width?: string;
}

interface TableProps {
  columns: readonly TableColumn[];
  rows: Pulse<readonly TableRow[]>;
  defaultSort?: BeatUiTableSort;
  emptyState?: BeatUiRenderable;
  onRowClick?: (row: TableRow) => void;
  // + BeatUiAccessibilityProps
}
```

### `ExcelTable`

Spreadsheet-like grid with cell editing, selection, and custom cell types.

```ts
interface ExcelTableProps {
  columns: readonly ExcelTableColumn[];
  grid: BeatUiState<ExcelTableGrid>;
  onGridChange?: (grid: ExcelTableGrid) => void;
  selection?: BeatUiState<ExcelTableSelection | null>;
  onSelectionChange?: (selection: ExcelTableSelection | null) => void;
}
```

---

## Theming

### `createThemeController(options?)`

```ts
function createThemeController(options?: {
  initialPreference?: "light" | "dark" | "system";
  lightTheme?: BeatUiThemeDefinition;
  darkTheme?: BeatUiThemeDefinition;
  storageKey?: string;
}): BeatUiThemeController;
```

Returns a controller with `preference`, `mode`, and `theme` state, plus `setMode()`, `setPreference()`, `toggleMode()`, and `applyTo(element)`.

### `ThemeRoot`

```ts
interface ThemeRootProps {
  controller?: BeatUiThemeController;
  children?: BeatUiRenderable;
}
```

Applies CSS variables for the active theme to its subtree. Creates an internal controller if none is provided.

### `createThemeDefinition(options)`

```ts
function createThemeDefinition(options: {
  name: string;
  mode: "light" | "dark";
  tokens?: Partial<BeatUiThemeTokens>;
  baseTheme?: BeatUiThemeDefinition;
}): BeatUiThemeDefinition;
```

### Built-in themes

- `TOKYO_NIGHT_THEME` — dark
- `TOKYO_DAY_THEME` — light

### `getThemeCssVariables(theme)`

Returns a `Record<string, string>` of CSS variable name → value for the given theme.

---

## Shared Prop Types

```ts
interface BeatUiAccessibilityProps {
  id?: string;
  name?: string;
  class?: string;
  disabled?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}

interface BeatUiFocusHandlers {
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}
```
