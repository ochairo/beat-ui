import { component } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";

import {
  HlDateRangeInput as HeadlessDateRangeInput,
  type DateRangeInputProps,
} from "../../../headless/composites/RangeDateInput";
import {
  DateRangePicker,
  type DateRangeValue,
} from "../range-date-picker/RangeDatePicker";
import { IconCalendar } from "../../../../icons";
import css from "./RangeDateInput.module.css";

export type { DateRangeValue, DateRangeInputProps };

export const DateRangeInput = component<DateRangeInputProps>((props) => {
  const internalValue = pulse<DateRangeValue>(
    props.defaultValue ?? { start: "", end: "" },
  );

  const handleValueChange = (
    value: DateRangeValue,
    event: Event | undefined,
  ): void => {
    internalValue.set(value);
    props.onValueChange?.(value, event);
  };

  const sharedValue = props.value ?? internalValue;
  const rootClass =
    props.class === undefined ? css["root"]! : `${css["root"]!} ${props.class}`;

  return (
    <HeadlessDateRangeInput
      {...props}
      class={rootClass}
      value={sharedValue}
      onValueChange={handleValueChange}
      icon={props.icon !== undefined ? props.icon : <IconCalendar size={16} />}
      calendar={
        props.calendar !== undefined ? (
          props.calendar
        ) : (
          <DateRangePicker
            value={sharedValue}
            onValueChange={handleValueChange}
          />
        )
      }
    />
  );
});
