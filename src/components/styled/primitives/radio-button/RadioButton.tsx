import { component } from "@ochairo/beat";

import {
  RadioButton as HeadlessRadioButton,
  type RadioButtonProps,
} from "../../../headless/primitives/RadioButton";
import css from "./RadioButton.module.css";

export type { RadioButtonProps };

export const RadioButton = component<RadioButtonProps>((props) => {
  return <HeadlessRadioButton {...props} class={css["root"]!} />;
});
