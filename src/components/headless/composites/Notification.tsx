import { Show, component } from "@ochairo/beat";

import {
  createControllableState,
  type BeatUiAccessibilityProps,
  type BeatUiContentProps,
  type BeatUiControlledOpenProps,
} from "../../../foundations";

export type NotificationTone =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export interface NotificationStyles {
  readonly root?: string;
  readonly closeButton?: string;
}

export interface NotificationProps
  extends
    BeatUiAccessibilityProps,
    BeatUiContentProps,
    BeatUiControlledOpenProps {
  readonly closeLabel?: string;
  readonly dismissible?: boolean;
  readonly styles?: NotificationStyles;
  readonly title?: string;
  readonly tone?: NotificationTone;
}

export const Notification = component<NotificationProps>((props) => {
  const state = createControllableState<boolean>({
    defaultValue: props.defaultOpen ?? true,
    ...(props.open !== undefined ? { value: props.open } : {}),
    ...(props.onOpenChange !== undefined
      ? { onChange: props.onOpenChange }
      : {}),
  });

  const role =
    props.tone === "error" || props.tone === "warning" ? "alert" : "status";

  const close = (event?: MouseEvent): void => {
    state.setValue(false, event);
  };

  return (
    <Show when={state.state}>
      <div
        id={props.id}
        class={props.class}
        role={role}
        aria-live={role === "alert" ? "assertive" : "polite"}
        aria-label={props.ariaLabel}
        aria-labelledby={props.ariaLabelledby}
        aria-describedby={props.ariaDescribedby}
        style={props.styles?.root}
      >
        <div>
          {props.title !== undefined ? <strong>{props.title}</strong> : null}
          <div>{props.children}</div>
        </div>
        {props.dismissible !== false ? (
          <button
            type="button"
            data-part="close-button"
            style={props.styles?.closeButton}
            onClick={close}
          >
            {props.closeLabel ?? "✕"}
          </button>
        ) : null}
      </div>
    </Show>
  );
});
