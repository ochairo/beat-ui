import { component } from "@ochairo/beat";

import {
  Select as HeadlessSelect,
  type DropboxProps,
  type DropdownOption,
  type DropdownProps,
  type SelectOption,
  type SelectProps,
} from "../../../headless/composites/Select";
import css from "./Select.module.css";

export type {
  DropboxProps,
  DropdownOption,
  DropdownProps,
  SelectOption,
  SelectProps,
};

export const Select = component<SelectProps>((props) => {
  return <HeadlessSelect {...props} class={css["root"]!} />;
});

/** @deprecated Use Select */
export const Dropdown = Select;
/** @deprecated Use Select */
export const Dropbox = Select;
