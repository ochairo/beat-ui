import { component } from "@ochairo/beat";

import type { InputProps } from "./Input";
import { Input } from "./Input";

export interface TextInputProps extends Omit<InputProps, "type"> {}

export const TextInput = component<TextInputProps>((props) => {
  return <Input {...props} type="text" />;
});
