import { component } from "@ochairo/beat";

import type { TextInputProps } from "../../headless/atoms/TextInput";
import { Input } from "./Input";

export type { TextInputProps };

export const TextInput = component<TextInputProps>((props) => {
  // Delegate to styled Input (which applies the design-token styles)
  return <Input {...props} type="text" />;
});
