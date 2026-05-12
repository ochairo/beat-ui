import { component } from "@ochairo/beat";

import {
  HlCheckBox as HeadlessCheckBox,
  type CheckBoxProps,
} from "../../../headless/primitives/CheckBox";
import css from "./CheckBox.module.css";

export type { CheckBoxProps };

export const CheckBox = component<CheckBoxProps>((props) => {
  return <HeadlessCheckBox {...props} class={css["root"]!} />;
});

export const Checkbox = CheckBox;
