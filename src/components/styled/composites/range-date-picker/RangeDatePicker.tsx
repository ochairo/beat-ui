import { component } from "@ochairo/beat";

import {
  HlDateRangePicker as HeadlessDateRangePicker,
  type DateRangeValue,
  type DateRangePickerProps,
} from "../../../headless/composites/RangeDatePicker";
import css from "./RangeDatePicker.module.css";

export type { DateRangeValue, DateRangePickerProps };

export const DateRangePicker = component<DateRangePickerProps>((props) => {
  const rootClass =
    props.class === undefined ? css["root"]! : `${css["root"]!} ${props.class}`;

  return <HeadlessDateRangePicker {...props} class={rootClass} />;
});
