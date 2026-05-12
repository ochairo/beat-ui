import { component } from "@ochairo/beat";

import {
  HlInput as HeadlessInput,
  type InputProps,
} from "../../../headless/primitives/Input";
import css from "./Input.module.css";

export type { InputProps };

export const Input = component<InputProps>((props) => {
  return <HeadlessInput {...props} class={css["root"]!} />;
});
