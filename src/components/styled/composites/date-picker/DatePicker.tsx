import { component } from "@ochairo/beat";

import {
  HlDatePicker as HeadlessDatePicker,
  type DatePickerProps,
} from "../../../headless/composites/DatePicker";
import css from "./DatePicker.module.css";

export type { DatePickerProps };

export const DatePicker = component<DatePickerProps>((props) => {
  return <HeadlessDatePicker {...props} class={css["root"]!} />;
});
