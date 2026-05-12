import { component } from "@ochairo/beat";

import {
  HlTimePicker as HeadlessTimePicker,
  type TimePickerProps,
} from "../../../headless/composites/TimePicker";
import css from "./TimePicker.module.css";

export type { TimePickerProps };

export const TimePicker = component<TimePickerProps>((props) => {
  return <HeadlessTimePicker {...props} class={css["root"]!} />;
});
