import { Show, component } from "@ochairo/beat";
import { derived } from "@ochairo/pulse";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiContentProps,
  type BeatUiControlledCheckedProps,
  type BeatUiFocusHandlers,
} from "../../../foundations";
import type { BeatUiRenderable } from "../../../runtime";

export interface SwitchStyles {
  readonly root?: string;
  readonly track?: string;
  readonly thumbOn?: string;
  readonly thumbOff?: string;
}

export interface SwitchProps
  extends
    BeatUiAccessibilityProps,
    BeatUiContentProps,
    BeatUiControlledCheckedProps,
    BeatUiFocusHandlers {
  readonly checkedContent?: BeatUiRenderable;
  readonly checkedIcon?: BeatUiRenderable;
  readonly styles?: SwitchStyles;
  readonly uncheckedContent?: BeatUiRenderable;
  readonly uncheckedIcon?: BeatUiRenderable;
}

export const HlSwitch = component<SwitchProps>((props) => {
  const state = createControllableState<boolean>({
    defaultValue: props.defaultChecked ?? false,
    ...(props.checked !== undefined ? { value: props.checked } : {}),
    ...(props.onCheckedChange !== undefined
      ? { onChange: props.onCheckedChange }
      : {}),
  });
  const ariaChecked = derived(state.state, (v) => (v ? "true" : "false"));

  const handleClick = (event: MouseEvent): void => {
    if (props.disabled) {
      event.preventDefault();
      return;
    }
    state.setValue(!state.state.get(), event);
  };

  return (
    <button
      type="button"
      role="switch"
      id={props.id}
      name={props.name}
      class={props.class}
      disabled={props.disabled}
      aria-label={props.ariaLabel}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
      aria-checked={ariaChecked}
      style={props.styles?.root}
      onClick={handleClick}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    >
      <span>{props.children}</span>
      <span data-part="track" style={props.styles?.track}>
        <Show
          when={state.state}
          fallback={
            <span
              aria-hidden={true}
              data-part="thumb"
              data-state="off"
              style={props.styles?.thumbOff}
            >
              {props.uncheckedIcon}
            </span>
          }
        >
          <span
            aria-hidden={true}
            data-part="thumb"
            data-state="on"
            style={props.styles?.thumbOn}
          >
            {props.checkedIcon}
          </span>
        </Show>
      </span>
      <span>
        <Show when={state.state} fallback={props.uncheckedContent}>
          {props.checkedContent}
        </Show>
      </span>
    </button>
  );
});
