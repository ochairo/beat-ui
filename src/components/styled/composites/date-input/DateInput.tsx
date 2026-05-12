import { component } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";

import {
  HlDateInput as HeadlessDateInput,
  type DateInputProps,
} from "../../../headless/composites/DateInput";
import { DatePicker } from "../date-picker/DatePicker";
import { IconCalendar } from "../../../../icons";
import css from "./DateInput.module.css";

export type { DateInputProps };

export const DateInput = component<DateInputProps>((props) => {
  const internalValue = pulse(props.defaultValue ?? "");

  const handleValueChange = (v: string, event: Event | undefined): void => {
    internalValue.set(v);
    props.onValueChange?.(v, event);
  };

  const sharedValue = props.value ?? internalValue;

  return (
    <HeadlessDateInput
      {...props}
      value={sharedValue}
      onValueChange={handleValueChange}
      containerClass={css["root"]!}
      icon={<IconCalendar size={16} />}
      calendar={
        props.calendar ?? (
          <DatePicker value={sharedValue} onValueChange={handleValueChange} />
        )
      }
    />
  );
});
