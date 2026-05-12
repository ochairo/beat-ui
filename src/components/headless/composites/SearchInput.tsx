import { component } from "@ochairo/beat";

import type { InputProps } from "../primitives/Input";
import { HlInput } from "../primitives/Input";

export interface SearchInputProps extends Omit<InputProps, "type"> {}

export const HlSearchInput = component<SearchInputProps>((props) => {
  return <HlInput {...props} type="search" />;
});
