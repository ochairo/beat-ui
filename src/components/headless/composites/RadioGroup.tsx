import { component } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiControlledValueProps,
  type BeatUiFocusHandlers,
} from "../../../foundations";

import { HlRadioButton } from "../primitives/RadioButton";

export interface RadioGroupStyles {
  readonly root?: string | undefined;
  readonly item?: string | undefined;
  readonly input?: string | undefined;
}

export interface RadioGroupOption {
  readonly disabled?: boolean | undefined;
  readonly label: string;
  readonly value: string;
}

export interface RadioGroupProps
  extends
    BeatUiAccessibilityProps,
    BeatUiControlledValueProps<string>,
    BeatUiFocusHandlers {
  readonly options: readonly RadioGroupOption[];
  readonly orientation?: "horizontal" | "vertical" | undefined;
  readonly styles?: RadioGroupStyles | undefined;
}

export const HlRadioGroup = component<RadioGroupProps>((props) => {
  const state = createControllableState<string>({
    defaultValue: props.defaultValue ?? "",
    ...(props.value !== undefined ? { value: props.value } : {}),
    ...(props.onValueChange !== undefined
      ? { onChange: props.onValueChange }
      : {}),
  });

  return (
    <div
      role="radiogroup"
      id={props.id}
      class={props.class}
      aria-label={props.ariaLabel}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
      data-orientation={props.orientation ?? "vertical"}
      style={props.styles?.root}
    >
      {props.options.map((option) => {
        const checked = pulse(state.state.get() === option.value);
        state.state.on((e) => checked.set(e.currentValue === option.value));

        const itemStyles =
          props.styles?.item !== undefined || props.styles?.input !== undefined
            ? {
                root: props.styles?.item ?? "",
                input: props.styles?.input ?? "",
              }
            : undefined;

        return (
          <HlRadioButton
            name={props.name}
            value={option.value}
            checked={checked}
            disabled={props.disabled ?? option.disabled}
            onCheckedChange={() => state.setValue(option.value)}
            {...(itemStyles !== undefined ? { styles: itemStyles } : {})}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
          >
            {option.label}
          </HlRadioButton>
        );
      })}
    </div>
  );
});
