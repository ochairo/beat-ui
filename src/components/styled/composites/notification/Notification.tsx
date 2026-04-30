import { component } from "@ochairo/beat";

import {
  Notification as HeadlessNotification,
  type NotificationProps,
  type NotificationTone,
} from "../../../headless/composites/Notification";
import css from "./Notification.module.css";

export type { NotificationProps, NotificationTone };

const TONE_MAP: Record<NotificationTone, [string, string]> = {
  info: ["var(--beat-ui-color-info)", "var(--beat-ui-color-info-text)"],
  success: [
    "var(--beat-ui-color-success)",
    "var(--beat-ui-color-success-text)",
  ],
  warning: [
    "var(--beat-ui-color-warning)",
    "var(--beat-ui-color-warning-text)",
  ],
  error: ["var(--beat-ui-color-danger)", "var(--beat-ui-color-danger-text)"],
  neutral: [
    "var(--beat-ui-color-background-subtle)",
    "var(--beat-ui-color-text-muted)",
  ],
};

export const Notification = component<NotificationProps>((props) => {
  const tone = props.tone ?? "info";
  const [bg, color] = TONE_MAP[tone];
  const toneVars = `--notification-bg:${bg};--notification-color:${color}`;

  return (
    <HeadlessNotification
      {...props}
      class={css["root"]!}
      styles={{ root: toneVars }}
    />
  );
});
