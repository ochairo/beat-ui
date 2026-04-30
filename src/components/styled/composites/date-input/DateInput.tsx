import { component } from "@ochairo/beat";

import {
  DateInput as HeadlessDateInput,
  type DateInputProps,
} from "../../../headless/composites/DateInput";
import { DatePicker } from "../date-picker/DatePicker";
import { IconCalendar } from "../../../../icons";
import css from "./DateInput.module.css";

export type { DateInputProps };

export const DateInput = component<DateInputProps>((props) => {
  return (
    <HeadlessDateInput
      {...props}
      containerClass={css["root"]!}
      icon={<IconCalendar size={16} />}
      calendar={
        props.calendar ?? (
          <DatePicker
            value={props.value}
            defaultValue={props.defaultValue}
            onValueChange={props.onValueChange}
          />
        )
      }
    />
  );
});
