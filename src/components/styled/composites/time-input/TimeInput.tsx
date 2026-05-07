import { component } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";

import {
  TimeInput as HeadlessTimeInput,
  type TimeInputProps,
} from "../../../headless/composites/TimeInput";
import { TimePicker } from "../time-picker/TimePicker";
import { IconClock } from "../../../../icons";
import css from "./TimeInput.module.css";

export type { TimeInputProps };

export const TimeInput = component<TimeInputProps>((props) => {
  const internalValue = pulse(props.defaultValue ?? "");

  const handleValueChange = (v: string, event: Event | undefined): void => {
    internalValue.set(v);
    props.onValueChange?.(v, event);
  };

  const pickerValue = props.value ?? internalValue;

  return (
    <HeadlessTimeInput
      {...props}
      value={pickerValue}
      onValueChange={handleValueChange}
      containerClass={css["root"]!}
      icon={<IconClock size={16} />}
      timePicker={
        props.timePicker ?? (
          <TimePicker
            value={pickerValue}
            onValueChange={handleValueChange}
            {...(props.maxHour !== undefined ? { maxHour: props.maxHour } : {})}
            {...(props.minuteStep !== undefined
              ? { minuteStep: props.minuteStep }
              : {})}
            {...(props.disabledHours !== undefined
              ? { disabledHours: props.disabledHours }
              : {})}
            {...(props.disabledMinutes !== undefined
              ? { disabledMinutes: props.disabledMinutes }
              : {})}
          />
        )
      }
    />
  );
});
