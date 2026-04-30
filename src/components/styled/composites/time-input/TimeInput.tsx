import { component } from "@ochairo/beat";

import {
  TimeInput as HeadlessTimeInput,
  type TimeInputProps,
} from "../../../headless/composites/TimeInput";
import { TimePicker } from "../time-picker/TimePicker";
import { IconClock } from "../../../../icons";
import css from "./TimeInput.module.css";

export type { TimeInputProps };

export const TimeInput = component<TimeInputProps>((props) => {
  return (
    <HeadlessTimeInput
      {...props}
      containerClass={css["root"]!}
      icon={<IconClock size={16} />}
      timePicker={
        props.timePicker ?? (
          <TimePicker
            value={props.value}
            defaultValue={props.defaultValue}
            onValueChange={props.onValueChange}
          />
        )
      }
    />
  );
});
