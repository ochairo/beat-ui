import { component } from "@ochairo/beat";

import {
  Notification as HeadlessNotification,
  type NotificationProps,
  type NotificationTone,
} from "../../headless/molecules/Notification";

export type { NotificationProps, NotificationTone };

const TONE_MAP = {
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
} as const;

function getNotificationStyle(tone: NotificationTone): string {
  const [background, color] = TONE_MAP[tone];
  return [
    "display:flex",
    "align-items:flex-start",
    "justify-content:space-between",
    "gap:1rem",
    "padding:0.875rem 1rem",
    "border-radius:1rem",
    `background:${background}`,
    `color:${color}`,
  ].join(";");
}

const closeButtonStyle = [
  "display:inline-flex",
  "align-items:center",
  "justify-content:center",
  "padding:0.25rem 0.5rem",
  "border:none",
  "border-radius:0.5rem",
  "background:transparent",
  "color:inherit",
  "cursor:pointer",
  "font:inherit",
  "opacity:0.75",
].join(";");

export const Notification = component<NotificationProps>((props) => {
  return (
    <HeadlessNotification
      {...props}
      styles={{
        root: getNotificationStyle(props.tone ?? "info"),
        closeButton: closeButtonStyle,
      }}
    />
  );
});
