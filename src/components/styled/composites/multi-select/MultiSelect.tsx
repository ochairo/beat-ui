import { component } from "@ochairo/beat";

import {
  MultiSelect as HeadlessMultiSelect,
  type MultiSelectOption,
  type MultiSelectProps,
} from "../../../headless/composites/MultiSelect";
import css from "./MultiSelect.module.css";

export type { MultiSelectOption, MultiSelectProps };

export const MultiSelect = component<MultiSelectProps>((props) => {
  return <HeadlessMultiSelect {...props} class={css["root"]!} />;
});
