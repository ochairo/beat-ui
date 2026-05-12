import { component } from "@ochairo/beat";

import {
  HlRadioGroup as HeadlessRadioGroup,
  type RadioGroupOption,
  type RadioGroupProps,
} from "../../../headless/composites/RadioGroup";
import css from "./RadioGroup.module.css";

export type { RadioGroupOption, RadioGroupProps };

export const RadioGroup = component<RadioGroupProps>((props) => {
  return <HeadlessRadioGroup {...props} class={css["root"]!} />;
});
