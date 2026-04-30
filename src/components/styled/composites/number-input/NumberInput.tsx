import { component } from "@ochairo/beat";

import {
  NumberInput as HeadlessNumberInput,
  type NumberInputProps,
} from "../../../headless/composites/NumberInput";
import { IconChevronUp, IconChevronDown } from "../../../../icons";
import css from "./NumberInput.module.css";

export type { NumberInputProps };

export const NumberInput = component<NumberInputProps>((props) => {
  return (
    <HeadlessNumberInput
      {...props}
      class={css["root"]!}
      incrementIcon={<IconChevronUp size={12} />}
      decrementIcon={<IconChevronDown size={12} />}
    />
  );
});
