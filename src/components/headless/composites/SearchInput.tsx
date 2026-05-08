import { component } from "@ochairo/beat";

import type { InputProps } from "../primitives/Input";
import { Input } from "../primitives/Input";

export interface SearchInputProps extends Omit<InputProps, "type"> {}

export const SearchInput = component<SearchInputProps>((props) => {
  return <Input {...props} type="search" />;
});
