import { component } from "@ochairo/beat";

import type { InputProps } from "../primitives/Input";
import { HlInput } from "../primitives/Input";

export interface TextInputProps extends Omit<InputProps, "type"> {}

export const HlTextInput = component<TextInputProps>((props) => {
  return <HlInput {...props} type="text" />;
});
