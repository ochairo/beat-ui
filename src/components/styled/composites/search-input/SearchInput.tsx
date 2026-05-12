import { component } from "@ochairo/beat";

import { IconSearch } from "../../../../icons";
import {
  HlSearchInput as HeadlessSearchInput,
  type SearchInputProps,
} from "../../../headless/composites/SearchInput";
import css from "./SearchInput.module.css";

export type { SearchInputProps };

export const SearchInput = component<SearchInputProps>((props) => {
  return (
    <div class={css["root"]!}>
      <span class={css["icon"]!} aria-hidden="true">
        <IconSearch size={14} />
      </span>
      <HeadlessSearchInput {...props} class={css["input"]!} />
    </div>
  );
});
