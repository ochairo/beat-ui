import { Show, component } from "@ochairo/beat";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiContentProps,
  type BeatUiControlledOpenProps,
} from "../../../foundations";
import type { BeatUiRenderable } from "../../../runtime";

export interface DialogStyles {
  readonly overlay?: string;
  readonly panel?: string;
  readonly header?: string;
  readonly footer?: string;
  readonly closeButton?: string;
}

export interface DialogProps
  extends
    BeatUiAccessibilityProps,
    BeatUiContentProps,
    BeatUiControlledOpenProps {
  readonly closeLabel?: string;
  readonly dismissible?: boolean;
  readonly footer?: BeatUiRenderable;
  readonly styles?: DialogStyles;
  readonly title?: BeatUiRenderable;
}

export const Dialog = component<DialogProps>((props) => {
  const state = createControllableState<boolean>({
    defaultValue: props.defaultOpen ?? false,
    ...(props.open !== undefined ? { value: props.open } : {}),
    ...(props.onOpenChange !== undefined
      ? { onChange: props.onOpenChange }
      : {}),
  });

  const close = (event?: MouseEvent): void => {
    if (props.dismissible === false) return;
    state.setValue(false, event);
  };

  return (
    <Show when={state.state}>
      <div class={props.class} style={props.styles?.overlay}>
        <div
          id={props.id}
          data-part="panel"
          role="dialog"
          aria-modal={"true"}
          aria-label={props.ariaLabel}
          aria-labelledby={props.ariaLabelledby}
          aria-describedby={props.ariaDescribedby}
          style={props.styles?.panel}
        >
          {props.title !== undefined || props.dismissible !== false ? (
            <div data-part="header" style={props.styles?.header}>
              <div>{props.title}</div>
              {props.dismissible !== false ? (
                <button
                  type="button"
                  data-part="close-button"
                  style={props.styles?.closeButton}
                  onClick={close}
                >
                  {props.closeLabel ?? "Close"}
                </button>
              ) : null}
            </div>
          ) : null}
          <div>{props.children}</div>
          {props.footer !== undefined ? (
            <div data-part="footer" style={props.styles?.footer}>
              {props.footer}
            </div>
          ) : null}
        </div>
      </div>
    </Show>
  );
});

export const Modal = Dialog;

export type ModalProps = DialogProps;
