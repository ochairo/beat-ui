import { component } from "@ochairo/beat";

import type { TextInputProps } from "../../../headless/composites/TextInput";
import { Input } from "../../primitives/input/Input";

export type { TextInputProps };

export const TextInput = component<TextInputProps>((props) => {
  // Delegate to styled Input (which applies the design-token styles)
  return <Input {...props} type="text" />;
});
