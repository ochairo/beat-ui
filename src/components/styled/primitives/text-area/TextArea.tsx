import { component } from "@ochairo/beat";

import {
  TextArea as HeadlessTextArea,
  type TextAreaProps,
} from "../../../headless/primitives/TextArea";
import css from "./TextArea.module.css";

export type { TextAreaProps };

export const TextArea = component<TextAreaProps>((props) => {
  return <HeadlessTextArea {...props} class={css["root"]!} />;
});
